# BERP-JS

**Bun · Elysia · React · Prisma · TimescaleDB**

Zero-config, pure JavaScript full-stack boilerplate. No TypeScript. No Vite. No Next.js. One Bun process in dev.

---

## Quick Start

```bash
git clone https://github.com/YOURUSERNAME/berp-js-stack my-app
cd my-app
cp .env.example .env        # edit DATABASE_URL to point at your PostgreSQL instance
bun install                 # postinstall: prisma generate + lefthook git hooks
bunx prisma migrate dev --name init
bun run dev
# → http://localhost:3000
```

---

## TimescaleDB Setup

TimescaleDB optimizations are applied **after** the Prisma migration, not as part of it.

**Why not in Prisma migrations?** Prisma manages standard PostgreSQL DDL. TimescaleDB functions like `create_hypertable()` and `add_compression_policy()` are runtime function calls that modify internal catalog entries — Prisma has no mechanism to express or track them. Run them separately after `prisma migrate dev`.

**The app works on standard PostgreSQL without these steps.** TimescaleDB is an enhancement for time-series workloads, not a hard dependency for basic CRUD.

```sql
-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- TimescaleDB requires the partitioning column (timestamp) to be part of every
-- unique constraint. Prisma generates a single-column PK on id, so replace it.
ALTER TABLE "SensorData" DROP CONSTRAINT "SensorData_pkey";
ALTER TABLE "SensorData" ADD PRIMARY KEY (id, timestamp);

-- Convert the SensorData table into a hypertable, partitioned by timestamp
SELECT create_hypertable(
  '"SensorData"',
  'timestamp',
  if_not_exists => TRUE
);

-- Enable compression, segmented by sensorId for efficient per-sensor queries
ALTER TABLE "SensorData" SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'sensorId',
  timescaledb.compress_orderby = 'timestamp DESC'
);

-- Automatically compress chunks older than 7 days
SELECT add_compression_policy(
  '"SensorData"',
  INTERVAL '7 days',
  if_not_exists => TRUE
);
```

Connect to your database with `psql` (or any PostgreSQL client) and run the block above after `prisma migrate dev` completes.

---

## Adding shadcn/ui

```bash
bunx shadcn@latest init
# Choose JavaScript when prompted
bunx shadcn@latest add button card table chart
```

Components are generated into `public/components/ui/`. They do not affect the backend or deployment configuration.

---

## Deploying to Vercel

```bash
vercel --prod
```

**Required:** Set `DATABASE_URL` as an environment variable in your Vercel project settings.

**Beta caveat:** The Bun runtime on Vercel (`bunVersion: "1.x"` in `vercel.json`) is currently documented as Beta. Test your specific workload in a staging environment before treating it as production-stable. Validate cold-start behavior and connection pooling under realistic load before relying on it for critical systems.

---

## Architecture

```
berp-js-stack/
├── api/[...path].js    Vercel function entrypoint — wraps src/app.js, no .listen()
├── prisma/schema.prisma
├── public/
│   ├── index.html      HTML shell — loads React bundle
│   ├── index.jsx       React entrypoint — mounts to #root
│   ├── globals.css     Tailwind base styles
│   ├── components/ui/  shadcn/ui output (populated on demand)
│   └── lib/api.js      Frontend fetch helpers
├── src/
│   ├── index.js        Local dev server — adds static plugin, calls .listen()
│   ├── app.js          Shared Elysia app — all API routes live here
│   └── lib/prisma.js   PrismaClient singleton
├── build.js            Production bundler (bun-plugin-tailwind)
├── vercel.json
└── .env.example
```

**The `src/app.js` / `src/index.js` / `api/[...path].js` split is intentional:**

- `src/app.js` — pure route logic, no runtime-specific bindings. Importable anywhere.
- `src/index.js` — Bun-specific: static file serving + `.listen()`.
- `api/[...path].js` — Vercel-specific: exports a `fetch` handler, does not call `.listen()`.

This isolates deployment concerns without duplicating route logic.

**Tailwind in dev vs production:**

- Dev (`bun run dev`): `index.html` loads the Tailwind CDN script (marked with a comment). Zero config, works immediately.
- Production (`bun run build`): `build.js` uses `bun-plugin-tailwind` to bundle and purge CSS into `.vercel/output/static/`. The CDN script is harmless in the static output — the bundled CSS takes precedence.

---

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Runtime and DB status (`status: "ok"` or `"degraded"`, `db: "up"` or `"down"`) |
| `GET` | `/api/sensor` | Latest 100 sensor records, newest first |
| `POST` | `/api/sensor` | Insert a sensor record |
| `GET` | `/*` | SPA fallback — serves `public/index.html` |

### POST /api/sensor

```json
{ "sensorId": "sensor-1", "value": 42.5, "metadata": {} }
```

Returns `400` with `{ "error": "..." }` if `sensorId` is missing/not a string, or `value` is missing/not a number.

---

## Security

- `.env` is gitignored. Never commit it.
- `.env.example` contains placeholder values only.
- All database credentials are in environment variables.
- **Authentication is out of scope for v1.** Any public deployment exposing write endpoints must add authentication before going live.
- **CORS is open (`*`) by default.** Restrict it in `src/app.js` before public production: `.use(cors({ origin: "https://yourdomain.com" }))`.

---

## Manual Test Checklist

```bash
# Health
curl http://localhost:3000/api/health

# Read (empty is fine)
curl http://localhost:3000/api/sensor

# Write
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{"sensorId":"sensor-1","value":42.5}'

# Bad input → 400
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{"value":42.5}'

# SPA fallback → returns index.html, not 404
curl http://localhost:3000/some/unknown/route
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun 1.x |
| Backend | Elysia |
| Frontend | React 19 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + TimescaleDB |
| ORM | Prisma (JS mode) |
| Deployment | Vercel (Bun runtime, Beta) |
| Language | JavaScript / JSX only |
| Linter | Biome |
