# Convex Migrations

This directory contains database migration and seeding scripts for the RentNGo application.

## Overview

Migrations are internal mutations that run server-side to modify data or schema. They are useful for:

- Seeding initial data
- Migrating data between schema changes
- Bulk updates or transformations
- One-time data fixes

## Available Migrations

### 1. `seedVehicleClasses.ts`

Seeds the initial vehicle classes into the database.

**Purpose**: Creates the standard vehicle class categories used throughout the application.

**When to run**:

- After initial deployment
- When setting up a new environment
- If vehicle classes table is empty

**Features**:

- Idempotent (safe to run multiple times)
- Skips classes that already exist
- Creates 15 standard vehicle classes with descriptions

**Usage via Convex Dashboard**:

1. Go to your Convex dashboard
2. Navigate to "Functions" tab
3. Find `migrations/seedVehicleClasses`
4. Click "Run" (no arguments needed)
5. Check console output for results

**Usage via Convex CLI**:

```bash
npx convex run migrations/seedVehicleClasses
```

**Expected Output**:

```
Created: Vehicle class "Economy"
Created: Vehicle class "Compact"
...
Seeding complete! Created: 15, Skipped: 0, Total: 15
```

---

### 2. `migrateVehicleClasses.ts`

Migrates existing vehicles from the old hardcoded `class` enum to the new `classId` reference system.

**Purpose**: Updates all vehicles to use the new vehicle classes table instead of the deprecated enum field.

**When to run**:

- After running `seedVehicleClasses`
- After upgrading from the old class system
- When you have existing vehicles without `classId`

**Features**:

- Idempotent (safe to run multiple times)
- Skips vehicles that already have `classId`
- Maps old enum values to new class names
- Provides detailed error reporting
- Sets default `classSortIndex` to 0

**Prerequisites**:

- Vehicle classes must exist (run `seedVehicleClasses` first)

**Usage via Convex Dashboard**:

1. Go to your Convex dashboard
2. Navigate to "Functions" tab
3. Find `migrations/migrateVehicleClasses`
4. Click "Run" (no arguments needed)
5. Review the migration summary

**Usage via Convex CLI**:

```bash
npx convex run migrations/migrateVehicleClasses
```

**Expected Output**:

```
Found 50 vehicles to process
Migrated: BMW X5 from "luxury" to "Luxury"
Migrated: Toyota Corolla from "economy" to "Economy"
...
=== Migration Summary ===
Total vehicles: 50
Migrated: 50
Skipped (already migrated): 0
Errors: 0
```

**Old to New Class Mapping**:

```
economy       → Economy
compact       → Compact
intermediate  → Intermediate
standard      → Standard
full-size     → Full-Size
premium       → Premium
luxury        → Luxury
sport         → Sport
executive     → Executive
commercial    → Commercial
convertible   → Convertible
super-sport   → Super Sport
supercars     → Supercars
business      → Business
van           → Van
```

---

### 3. `referralWalletWiden.ts`

Backfill step of the referral wallet rollout (RNGO-51, phase 1 of RNGO-50).

**Purpose**: move v1 referral data onto the v2 shape so the wallet lifecycle
can be wired up in later phases.

- `referralConversions.status: "confirmed"` → `"approved"`, stamping
  `approvedAt` from the existing `confirmedAt` (falling back to `createdAt`).
  **No wallet credit is minted**: v1 conversions were confirmed at booking time
  under the old own-discount reward model and were never promised credit.
- `affiliates.approvedConversions` = `confirmedConversions` wherever it is
  still unset.

**Features**:

- Idempotent (rows already in the v2 shape are skipped, so a re-run reports
  zero updates)
- Batched behind a cursor; each call processes at most 1000 documents and
  returns `continueCursor` when more remain
- `dryRun: true` counts what would change without writing
- Ships with a read-only `inspect` pre-flight query

**Prerequisites**:

- The widened schema and the dual-writing code must already be deployed
  (`approvedConversions` optional, the v2 status literals, `walletTransactions`)
- `affiliateSettings.enabled` must still be `false`. If the program was ever
  live on the target deployment, stop and decide with the owner whether
  historical conversions should earn credit before running anything.

**Usage**:

```bash
# 1. Pre-flight — read-only, confirms the program is off and shows the counts
npx convex run migrations/referralWalletWiden:inspect

# 2. Dry run — writes nothing, reports what would change
npx convex run migrations/referralWalletWiden:backfillConversions '{"dryRun": true}'
npx convex run migrations/referralWalletWiden:backfillAffiliateCounters '{"dryRun": true}'

# 3. Apply
npx convex run migrations/referralWalletWiden:backfillConversions
npx convex run migrations/referralWalletWiden:backfillAffiliateCounters

# 4. If a response came back with "isDone": false, resume from its cursor
npx convex run migrations/referralWalletWiden:backfillConversions '{"cursor": "<continueCursor>"}'

# 5. Verify — legacyConfirmedConversions and affiliatesNeedingBackfill are both 0
npx convex run migrations/referralWalletWiden:inspect
```

Add `--prod` to every command to target production.

**Expected output**:

```json
{
  "dryRun": false,
  "scanned": 12,
  "updated": 12,
  "skipped": 0,
  "isDone": true,
  "continueCursor": null
}
```

**Narrow step (a later deploy, NOT part of this migration)**: once no code
reads them, drop `v.literal("confirmed")` from `referralConversions.status`,
make `affiliates.approvedConversions` required and remove
`affiliates.confirmedConversions` along with the dual-write in
`convex/affiliates.ts`. The order is non-negotiable: widen → backfill → verify
→ narrow. Narrowing before the backfill has run on a deployment will make the
schema reject documents still carrying the v1 shape.

---

### 4. `bookingCustomerEmail.ts`

Backfill step of the booking customer-email rollout (RNGO-54, phase 4 of
RNGO-50).

**Purpose**: fill `reservations.customerEmailNormalized` and
`transfers.customerEmailNormalized` (lowercased, trimmed `customerInfo.email`)
so the referral "first rental only" rule can ask "has this customer booked
before?" through the `by_customer_email_and_status` index instead of scanning.

Until the backfill has run, a returning customer whose bookings all predate the
widen looks like a first-time customer and would still get the referred
discount. The discount is capped and the program ships disabled, so this is a
correctness gap, not a money leak — but run the backfill before enabling the
program.

**Features**:

- Idempotent (a row whose stored value already matches is skipped, so a re-run
  reports zero updates)
- Batched behind a cursor; each call processes at most 1000 documents per table
  and returns `continueCursor` when more remain
- `dryRun: true` counts what would change without writing
- Ships with a read-only `inspect` pre-flight query

**Prerequisites**:

- The widened schema and the writing code must already be deployed
  (`customerEmailNormalized` optional on both tables, the two new indexes, and
  the create/update paths writing the field)

**Usage**:

```bash
# 1. Pre-flight — read-only, shows how many rows still need the field
npx convex run migrations/bookingCustomerEmail:inspect

# 2. Dry run — writes nothing, reports what would change
npx convex run migrations/bookingCustomerEmail:backfillReservations '{"dryRun": true}'
npx convex run migrations/bookingCustomerEmail:backfillTransfers '{"dryRun": true}'

# 3. Apply
npx convex run migrations/bookingCustomerEmail:backfillReservations
npx convex run migrations/bookingCustomerEmail:backfillTransfers

# 4. If a response came back with "isDone": false, resume from its cursor
npx convex run migrations/bookingCustomerEmail:backfillReservations '{"cursor": "<continueCursor>"}'

# 5. Verify — both *NeedingBackfill counts are 0
npx convex run migrations/bookingCustomerEmail:inspect
```

Add `--prod` to every command to target production.

**Narrow step (a later deploy, NOT part of this migration)**: once `inspect`
reports zero rows needing the backfill on every deployment, make
`customerEmailNormalized` required on both tables. The order is non-negotiable:
widen → backfill → verify → narrow.

---

## Migration Order

When setting up a new environment or migrating to the vehicle classes system:

1. **First**: Run `seedVehicleClasses`
   - Creates the vehicle class definitions

2. **Second**: Run `migrateVehicleClasses`
   - Updates existing vehicles to reference the new classes

3. **Verify**: Check that all vehicles have `classId` set

## Best Practices

### Writing Migrations

1. **Make them idempotent**: Migrations should be safe to run multiple times
2. **Add checks**: Verify prerequisites before modifying data
3. **Log everything**: Use console.log to track progress
4. **Handle errors gracefully**: Don't stop the entire migration on one error
5. **Return a summary**: Provide counts and status information

### Running Migrations

1. **Test in development first**: Always test migrations on dev data
2. **Back up production**: If possible, snapshot before running migrations
3. **Run during low traffic**: Schedule migrations during off-peak hours
4. **Monitor results**: Check the console output and verify data after
5. **Keep migration scripts**: Don't delete them - they're documentation

## Internal Mutations

Migrations use `internalMutation` which means:

- They can only be called from the Convex dashboard or CLI
- They cannot be called from client code
- They have full database access
- They bypass authentication

## Troubleshooting

### "Class not found in database"

**Problem**: Vehicle classes don't exist yet
**Solution**: Run `seedVehicleClasses` first

### "Already has classId"

**Message**: This is normal - the vehicle was already migrated
**Action**: No action needed, the script skips these automatically

### "Unknown class"

**Problem**: A vehicle has a class value that isn't in the mapping
**Solution**:

1. Check the vehicle's current class value
2. Add the mapping to `migrateVehicleClasses.ts`
3. Or manually update the vehicle in the database

### Migration script not showing in dashboard

**Problem**: Convex hasn't detected the new file
**Solution**:

1. Save the file
2. Wait for Convex to sync (check the CLI output)
3. Refresh the dashboard

## Future Migrations

As the schema evolves, add new migration scripts here. Follow the naming convention:

- Use descriptive names: `migrateXtoY.ts`, `seedZ.ts`, `fixABug.ts`
- Include the date in comments
- Document what changed and why
- Reference any related schema changes

## Related Documentation

- [VEHICLE_CLASSES_IMPLEMENTATION.md](../../VEHICLE_CLASSES_IMPLEMENTATION.md) - Full feature documentation
- [convex/schema.ts](../schema.ts) - Database schema
- [convex/vehicleClasses.ts](../vehicleClasses.ts) - Vehicle classes CRUD operations

---

**Last Updated**: 2024
**Status**: Production Ready
