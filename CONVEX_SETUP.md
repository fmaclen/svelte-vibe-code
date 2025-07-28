# Convex Setup

This project now uses Convex as the backend database. Here's how to get started:

## Prerequisites

1. Create a Convex account at [convex.dev](https://convex.dev)
2. Install the Convex CLI: `npm install -g convex`

## Setup Instructions

1. **Login to Convex:**

   ```bash
   npx convex login
   ```

2. **Initialize your deployment:**

   ```bash
   npx convex dev
   ```

   This will:
   - Create a new Convex deployment
   - Generate the API types
   - Start the development server

3. **Set environment variables:**
   Copy `.env.example` to `.env.local` and update the `PUBLIC_CONVEX_URL` with your deployment URL from the previous step.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run convex:dev` - Start Convex development server
- `npm run convex:deploy` - Deploy to production

## Database Schema

The current schema includes:

- **users**: User authentication and profile data
- **messages**: Simple messaging system for demo

## Functions

- **users.ts**: User management (create, get, update)
- **messages.ts**: Message handling (send, list with filtering)

## Usage in Components

```typescript
import { useQuery, useConvexClient } from '$lib/client.svelte';
import { api } from '../../convex/_generated/api';

// Query data
const messages = useQuery(api.messages.list, () => ({ muteWords: [] }));

// Perform mutations
const client = useConvexClient();
await client.mutation(api.messages.send, { author: 'User', body: 'Hello!' });
```

## Deployment

For production deployment:

1. Deploy Convex functions: `npm run convex:deploy`
2. Set the production `PUBLIC_CONVEX_URL` in your hosting environment
3. Build and deploy your SvelteKit app as usual
