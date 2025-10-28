# Agents Guidelines

## Build, Lint, Test Commands

- **Dev (frontend + backend)**: `npm run dev`
- **Lint**: `npm run lint` (ESLint only; no separate test runner configured)
- **Build**: `npm build`
- **Note**: No test runner found. Only ESLint/Prettier for code quality.

## Code Style & Conventions

### Imports & Organization

- Use path aliases: `@/components`, `@/lib`, `@/types`, `@/hooks` (defined in `tsconfig.json`)
- Group imports: external → aliases → relative paths
- No comments unless explicitly requested

### TypeScript & Types

- Strict mode enabled (`tsconfig.json`)
- Use `Id<'tableName'>` for Convex document IDs
- Define interfaces for component props (`XxxProps`)
- Use discriminated unions with `as const` for literals

### React Components

- Client components: Add `"use client"` directive
- Hooks called at top level before early returns
- Functional components with TypeScript interfaces
- Props interfaces: `interface XxxProps { ... }`

### Formatting

- Prettier configured (`.prettierrc` is empty, uses defaults)
- Tailwind CSS for styling (integrated with Next.js)
- Use CVA (class-variance-authority) for variant-based components

### Convex Backend

- **File-based routing**: public functions in `convex/`, internal prefixed functions separate
- **Function syntax**: Always use new syntax with `query`, `mutation`, `action` wrappers
- **Validators**: Always include `args` and `returns` validators (use `v.null()` if no return)
- **Error handling**: Throw errors for validation failures; Convex handles serialization
- **Types**: Use `Id<'table'>`, `Doc<'table'>`, `Record<Key, Value>` from `_generated/dataModel`

### Cursor Rules

See `.cursor/rules/convex_rules.mdc` for comprehensive Convex backend guidelines.

## Key Libraries

- **Frontend**: Next.js 15, React 19, TailwindCSS 4, Radix UI, HeroUI
- **Backend**: Convex (database + server logic), Clerk (auth)
- **Forms**: React Hook Form, Zod validation
- **Email**: React Email, Resend
- **Internationalization**: next-intl (English & Romanian)
