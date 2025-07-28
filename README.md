# Svelte Vibe Code

A modern Svelte project with Convex backend integration.

## Setup

Install dependencies:

```sh
npm install
```

## Convex Database Setup

This project uses Convex as the backend database. To get started:

1. **Login to Convex:**

   ```sh
   npx convex login
   ```

2. **Initialize development:**

   ```sh
   npx convex dev
   ```

   This creates a deployment and starts the dev server.

3. **Set environment variables:**
   Copy `.env.example` to `.env.local` and update `PUBLIC_CONVEX_URL` with your deployment URL.

## Development

Start the development server:

```sh
npm run dev

# or open in browser
npm run dev -- --open
```

## Convex Commands

- `npx convex dev` - Start Convex development server
- `npx convex deploy` - Deploy functions to production
- `npx convex dashboard` - Open the Convex dashboard

## Building

Create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Database Schema

- **users**: User authentication and profiles
- **messages**: Real-time messaging system

See `CONVEX_SETUP.md` for detailed setup instructions.
