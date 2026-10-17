---
linear: RNGO-32
last-verified: 2026-07-22
verification-source: repository-only
---

# Clerk → Convex user sync rework (webhooks + safety net)

## Problem

Users can exist in Clerk with no matching row in the Convex `users` table (hit by the client on dev). Current sync is client-side only: `UserEnsurer` (mounted in `app/providers.tsx`) → `useEnsureUser` hook → `api.users.ensureUser` mutation on first authenticated page load.

Failure modes of the current design:

1. **Race + broken retry** — `hooks/use-ensure-user.ts` gates on Clerk's `isLoaded`, not on Convex auth (`useConvexAuth().isAuthenticated`). The mutation can fire before the Convex JWT handshake completes → `ctx.auth.getUserIdentity()` is null → throws. The catch resets `hasCalledRef` but nothing re-triggers the effect (deps unchanged), so the retry never happens. Error is only `console.error`.
2. **Requires a page visit** — users created in the Clerk dashboard, or who sign up and bounce, never get a Convex row.
3. **No propagation** — name/email changes and deletions in Clerk never reach Convex (`ensureUser` patches only on next visit).
4. **Dev env config drift** — `convex/auth.config.ts` depends on `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` + a Clerk JWT template named `convex` (with email claim) per environment; dev auto-deploy has been broken since Jun 30 so the dev deployment may also run stale code. (Update 2026-08-04: auto-deploy fixed — GitHub app re-linked, `vercel.json` now deploys Convex before the Next build; note this means develop → main merges auto-deploy prod, so register the prod webhook + secret *before* that merge.)

## Fix — target architecture

Primary sync via **Clerk webhooks → Convex HTTP action** (canonical Convex+Clerk pattern), plus an **idempotent get-or-create safety net** in renter-facing mutations. Client-side `UserEnsurer` gets deleted.

### Phase 1 — webhook sync (primary)

- [ ] Read `convex/_generated/ai/guidelines.md` before touching Convex code (per CLAUDE.md)
- [ ] `bun add svix`
- [ ] `convex/schema.ts`: add `deletedAt: v.optional(v.number())` to the `users` table (optional field → no migration needed)
- [ ] `convex/users.ts`: add internal mutations
  - `upsertFromClerk(data: UserJSON-shaped args)` — maps `id` → `clerkId`, primary email from `email_addresses`, `first_name`/`last_name`, derived `name`; upserts by `by_clerk_id` index; default role `renter`. Reuse/extract the mapping logic from `ensureUser`.
  - `deleteFromClerk(clerkId)` — **soft delete + anonymize**: patch `deletedAt: Date.now()` and scrub PII (`name` → "Deleted user", `email` → `deleted+<clerkId>@removed`, clear `phone`, `firstName`, `lastName`). Keeps `userId` references in reservations/transfers/affiliates intact while satisfying GDPR erasure.
- [ ] `convex/http.ts` (new): `httpRouter` with `POST /clerk-webhook` httpAction
  - verify Svix signature using `CLERK_WEBHOOK_SECRET`
  - `user.created` / `user.updated` → `upsertFromClerk`; `user.deleted` → `deleteFromClerk`
  - return 400 on bad signature, 200 otherwise (unhandled event types are no-ops)
- [ ] Env: set `CLERK_WEBHOOK_SECRET` on **both** Convex deployments (dev named deployment + prod)
- [ ] Clerk dashboard (both instances): add webhook endpoint `https://<deployment>.convex.site/clerk-webhook`, subscribe to `user.created`, `user.updated`, `user.deleted`

### Phase 2 — safety net in mutations

- [ ] `convex/users.ts`: add `getOrCreateCurrentUser(ctx: MutationCtx)` helper (extracted from `ensureUser` body)
- [ ] Use it instead of `getCurrentUserOrThrow` in **renter-facing write paths** so a delayed/missed webhook can never block a booking:
  - `convex/reservations.ts` (create/update call sites)
  - `convex/transfers.ts:468`
  - `convex/affiliates.ts` (renter-side writes)
  - admin-only mutations (`featuredCars.ts`, admin paths) keep `getCurrentUserOrThrow`/`requireAdmin` — an admin missing from the DB should stay a hard error
- [ ] Queries keep returning null / throwing as today (queries can't create rows)
- [ ] Soft-delete awareness: exclude `deletedAt`-set rows from admin user listings and affiliate lookups; add the check to `getCurrentUser` as cheap defense (a deleted Clerk user can't mint a valid JWT anyway)
- [ ] Switch `users.remove` (self-serve delete) to the same soft-delete + anonymize path instead of `ctx.db.delete`

### Phase 3 — remove client-side sync

- [ ] Delete `components/shared/auth/user-ensurer.tsx`, `hooks/use-ensure-user.ts`, and the `<UserEnsurer>` wrapper in `app/providers.tsx`
- [ ] Remove `api.users.ensureUser` once nothing references it (grep first)

### Phase 4 — backfill + unblock the client

- [ ] One-off backfill: internal Convex action that pages through the Clerk Backend API (`CLERK_SECRET_KEY`, already in env) and calls `upsertFromClerk` for each user; run on dev, then prod
- [ ] Manually deploy the dev Convex deployment (auto-deploy broken since Jun 30) and verify `NEXT_PUBLIC_CLERK_FRONTEND_API_URL` on it matches the dev Clerk instance, and the `convex` JWT template exists there with the email claim
- [ ] Confirm the client's user now exists in dev Convex

### Phase 5 — verify (on dev)

- [ ] Sign up a fresh test user in Clerk → Convex row appears **without** visiting the app
- [ ] Change name/email in Clerk → row updates
- [ ] Delete test user → row gets `deletedAt` + PII anonymized; their reservations still render in admin
- [ ] Re-signup with the same email after deletion → fresh row (new `clerkId`), no conflict
- [ ] Full reservation flow works for a brand-new user (safety net path: temporarily disable webhook to prove it)
- [ ] Webhook endpoint rejects an unsigned/bad-signature request

## Decision (resolved)

**`user.deleted` handling → soft delete via `deletedAt` + PII anonymization.** Keeps `userId` references valid (no orphaned reservations/transfers), satisfies GDPR erasure by scrubbing name/email/phone, and re-signups are safe because Clerk issues a new `clerkId`. Reservations retain their own contact-detail snapshots where legally needed (invoicing has its own retention basis).

## Housekeeping

- PR: `fix: sync clerk users to convex via webhooks` → `develop`; `bun run typecheck` clean before opening
- Update `prd.md` (move task to Completed) + `CHANGELOG.md` `[Unreleased]` note
