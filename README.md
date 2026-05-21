# BERP-JS Stack

**Bun · Elysia · React · Prisma · TimescaleDB**

An enterprise-ready, zero-config, pure JavaScript full-stack boilerplate. No TypeScript. No Vite. No Next.js. Leveraging Bun workspaces for seamless monorepo scaling.

---

## What's Included

- **Monorepo Architecture**: Clean separation with `apps/api`, `apps/web`, and `packages/db`.
- **Backend (API)**: Elysia.js with strict TypeBox environment validation and structured logging via Pino.
- **Frontend (Web)**: React 19, React Router (DOM) for client-side routing, and TanStack React Query for declarative data fetching. 
- **Database**: Prisma ORM with PostgreSQL & TimescaleDB optimizations.
- **Authentication**: Fully integrated with Better Auth for secure session management.
- **Testing**: Pre-configured with Vitest for unit tests and Playwright for E2E testing.
- **Deployment**: Dockerized with a multi-stage `Dockerfile` and configured for Vercel.

---

## Quick Start

```bash
git clone https://github.com/YOURUSERNAME/berp-js-stack my-app
cd my-app
cp .env.example .env        # edit DATABASE_URL to point at your PostgreSQL instance
bun install                 # installs dependencies and generates Prisma client
bun run --cwd packages/db migrate --name init
bun run dev
# → http://localhost:3000
# → http://localhost:3000/swagger  (API explorer)
```

---

## Local Database (Docker)

No PostgreSQL installed? Spin one up with a single command:

```bash
docker compose up -d          # start Postgres + TimescaleDB on :5432
cp .env.example .env          # default credentials match the compose file
bun install
bun run --cwd packages/db migrate --name init
bun run --cwd packages/db seed # optional: insert sample data
bun run dev
```

---

## Architecture

The application is structured as a Bun Workspaces monorepo:

```text
berp-js-stack/
├── apps/
│   ├── api/                 # Elysia Backend API
│   │   ├── src/server.js    # Shared Elysia app and Better Auth setup
│   │   ├── src/index.js     # Dev server entrypoint
│   │   └── src/lib/         # Auth, Env Validation, and Logger
│   └── web/                 # React Frontend
│       ├── public/          # Static assets & bundled output
│       ├── dev.js           # Native Bun dev watcher
│       └── ...              # React components
├── packages/
│   └── db/                  # Database Package
│       ├── prisma/          # Schema and migrations
│       └── src/             # Generated client exports
├── e2e/                     # Playwright tests
├── build.js                 # Vercel production bundler
├── Dockerfile               # Multi-stage production image
└── vercel.json
```

---

## Development

The single `bun run dev` command starts everything:
1. It spins up the `apps/api` Elysia server on port 3000.
2. It starts a lightweight file watcher (`apps/web/dev.js`) that uses Bun's native bundler to compile JSX and Tailwind CSS into the `apps/web/public/` directory on the fly.

No Vite or Webpack required.

---

## Authentication (Better Auth)

Authentication is handled via `better-auth`. The database schema already includes the necessary tables (`User`, `Session`, `Account`, `Verification`).

- Configuration: `apps/api/src/lib/auth.js`
- Routes: Automatically mounted at `/api/auth/*`
- Note: You must provide a valid `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in your `.env` file.

---

## Testing & Observability

- **Unit/Integration**: Run `bun test` or `bunx vitest` at the root.
- **E2E Tests**: Run `bunx playwright test`. Tests live in the `e2e/` folder.
- **Logging**: The API uses `pino` for high-performance structured JSON logging.
- **Env Validation**: On server start, `apps/api/src/lib/env.js` ensures all required variables are present and correct, crashing early if your `.env` is misconfigured.

---

## Deploying

### Docker (AWS / GCP / Azure)

```bash
docker build -t berp-app .
docker run -p 3000:3000 --env-file .env berp-app
```

### Vercel

```bash
vercel --prod
```

**Required env vars** in Vercel project settings:
- `DATABASE_URL` 
- `DIRECT_DATABASE_URL` (For `prisma migrate deploy` at build time)
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

**Note:** `build.js` generates the full Build Output API v3 layout. The Vercel configuration bypasses Elysia auto-detection to use this custom layout directly, enabling seamless monorepo deployment.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun 1.x |
| Backend | Elysia |
| Frontend | React 19, React Router, React Query |
| Auth | Better Auth |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + TimescaleDB |
| ORM | Prisma (JS mode) |
| Testing | Vitest, Playwright |
| Deployment | Docker, Vercel |
| Linter | Biome |
