# Svelte Vibe Code

A _somewhat opinionated_ starter template with SvelteKit (client-only), Convex backend, shadcn-svelte UI components, and auth.
The ideal starting point for vibe coding prototypes, with enough patterns that an LLM can pick up on to build _somewhat_ maintainable code.

## Quick Start

Get up and running in 3 commands:

```sh
# 1. Install dependencies
npm install

# 2. Start Convex database (in terminal 1)
npm run convex

# 3. Run tests to verify setup (in terminal 2)
npm test
```

Once the tests pass, you can run the dev server:

```sh
# Run development server
npm run dev
```

## Stack

### Frontend

- **SvelteKit** - Client-side only application (no SSR, backend handled entirely by Convex)
- **shadcn-svelte 1.x** - Complete component suite already installed (Tailwind v4 + Bits UI)

### Backend

- **Convex** - Real-time reactive database with TypeScript functions (handles all backend logic)
- **Custom Auth Implementation** - Demo-ready authentication system (not quite production-ready)

### Development & testing

- **Playwright** - E2E testing framework
- **TypeScript** - End-to-end type safety
- **Quality check** - Prettier, ESLint, and svelte-check (`npm run quality`)
- **Github Actions** - CI/CD pipeline for linting and testing

### LLM support

- **Claude Code** - [`CLAUDE.md`](CLAUDE.md)
- **Cursor** - [`.cursor/rules`](.cursor/rules)

## Project Structure

```
├── convex/          # Backend functions and schema
│   ├── auth.ts      # Server-side auth logic
│   ├── messages.ts  # Real-time messaging functions
│   └── schema.ts    # Database schema
├── src/
│   ├── lib/
│   │   ├── components/ui/  # shadcn-svelte components
│   │   └── auth.svelte.ts   # Client-side auth state management
│   └── routes/      # SvelteKit pages
├── e2e/             # Playwright E2E tests
└── package.json     # Dependencies and scripts
```

## Recommended usage

Keep `npm run convex` running in one terminal while using the other for tests or dev.

The test and dev environments share the same Convex backend database. This means you can run tests and the dev server simultaneously, and they'll interact with the same data - extremely useful for debugging.

