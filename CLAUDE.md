# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Workflow
```bash
# Install dependencies
npm install

# Start Convex backend (keep running in terminal 1)
npm run convex

# Run development server (terminal 2)
npm run dev

# Run tests (requires Convex running)
npm test

# Quality checks
npm run quality    # Runs format, lint, and type checks
npm run format     # Auto-format code with Prettier
npm run lint       # Check code style with ESLint and Prettier
npm run check      # Type check with svelte-check
```

### Testing
```bash
# Run E2E tests with Playwright (Convex must be running)
npm test

# Tests will automatically set IS_DEV_OR_TEST=true for database clearing
```

## Architecture Overview

### Stack
- **Frontend**: SvelteKit (client-only, no SSR) + Svelte 5 with runes
- **UI Components**: shadcn-svelte 1.x (Tailwind v4 + Bits UI) - fully installed in `src/lib/components/ui/`
- **Backend**: Convex (real-time database with TypeScript functions)
- **Auth**: Custom implementation using Convex sessions (demo-ready, not production-ready)
- **Testing**: Playwright E2E tests

### Key Directories
- `convex/` - Backend functions and database schema
  - `schema.ts` - Database tables: users, sessions, messages
  - `auth.ts` - Authentication mutations/queries (signUp, signIn, signInAnonymously, signOut, currentUser)
  - `messages.ts` - Real-time messaging functions
  - `dev.ts` - Development helpers (clearAllData - only works with IS_DEV_OR_TEST=true)
- `src/lib/auth.svelte.ts` - Client-side auth state management using Svelte 5 runes
- `src/lib/components/ui/` - Complete shadcn-svelte component library
- `src/routes/` - SvelteKit pages

### Important Patterns

#### Authentication Flow
1. Auth state is managed in `src/lib/auth.svelte.ts` using Svelte 5 runes (`$state`, `$derived`, `$effect`)
2. Auth context is set up in `src/routes/+layout.svelte` 
3. Pages use `AuthGuard` component for protection
4. Sessions stored in localStorage with token-based authentication
5. Passwords are hashed client-side with PBKDF2, then server-side with bcrypt

#### Convex Integration
- Client initialized in `src/routes/+layout.svelte` using `setupConvex()`
- Queries use `useQuery()` with reactive updates
- Mutations called via `client.mutation()`
- Path alias `$convex` maps to `./convex` directory

#### Development vs Production
- Test/dev environments share the same Convex database
- Use `IS_DEV_OR_TEST=true` environment variable to enable dev helpers
- Anonymous auth available for quick testing

## Key Implementation Details

### Svelte 5 Runes Usage
- Use `$state()` for reactive state
- Use `$derived()` for computed values
- Use `$effect()` for side effects
- Use `$props()` for component props

### Component Conventions
- All UI components from shadcn-svelte are already installed
- Components use `.svelte` extension
- State management uses `.svelte.ts` extension
- Follow existing component patterns in `src/lib/components/ui/`

### Testing Approach
- E2E tests in `e2e/` directory using Playwright
- Tests clear database before each test using `clearAllData` mutation
- Tests run against built application (`npm run build && npm run preview`)