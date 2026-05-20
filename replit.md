# SDA Community

A community platform for the Seventh-day Adventist (SDA) church — social feed, direct messages, church events, hymns, Sabbath school resources, bible verses, and more.

## Run & Operate

- API server runs on port 3000 via the "API Server" workflow
- SDA Community (Expo web) runs on port 5000 via the "SDA Community" workflow
- `pnpm install` — install all workspace dependencies
- `pnpm --filter @workspace/api-server run dev` — build + start the API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)
- Required env: `PORT` — set to 5000 (shared env var)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Expo (SDK 54) + React Native + Expo Router (web via Metro)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (Replit managed)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle for API), Metro (Expo web bundler)

## Where things live

- `artifacts/api-server/` — Express 5 backend, entry at `src/index.ts`
- `artifacts/sda-community/` — Expo mobile/web app, entry at `app/_layout.tsx`
- `artifacts/mockup-sandbox/` — Vite-based UI component sandbox
- `lib/db/` — Drizzle ORM schema + migrations (source of truth: `src/schema/index.ts`)
- `lib/api-spec/` — OpenAPI spec + Orval codegen config
- `lib/api-zod/` — Generated Zod schemas
- `lib/api-client-react/` — Generated React Query hooks + custom fetch with base URL/auth token support

## Architecture decisions

- Monorepo with pnpm workspaces — shared libs under `lib/`, apps under `artifacts/`
- API client uses `setBaseUrl()` + `setAuthTokenGetter()` for Expo → Express communication
- Expo Router used for file-system routing in the mobile/web app
- esbuild bundles the API server to CJS for production
- Drizzle schema is the source of truth — use `pnpm --filter @workspace/db run push` to apply dev changes

## Product

- Social community feed with posts, comments, reactions, and flairs
- Stories, user profiles, follows, and direct messages
- Church events, hymns, and Sabbath school resources
- Daily bible verses
- AI-powered chat assistance
- Group chats and virtual meetings

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- SDA Community workflow runs Expo directly from its own `node_modules/.bin/expo` (not via `pnpm exec` from workspace root)
- API server requires `PORT` env var to be set (currently 3000 in workflow, 5000 via shared env)
- Run `pnpm --filter @workspace/db run push` after schema changes before starting the server

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
