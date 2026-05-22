# Contributing

Thanks for helping improve BERP-JS.

## Good Contributions

- Bug fixes with a small reproduction
- README and setup improvements
- Deployment guides
- Test coverage
- Time-series examples
- UI improvements that keep the starter simple
- Small framework integration guides that do not add default dependencies

## Local Setup

```bash
cp .env.example .env
docker compose up -d
bun install
bun run db:migrate
bun run db:seed
bun run dev
```

## Checks

Run these before opening a pull request:

```bash
bun run lint
bun run test
bun run build
```

## Pull Request Guidelines

- Keep changes focused.
- Explain why the change belongs in a starter.
- Avoid adding heavy dependencies unless the value is clear.
- Keep the project JavaScript and JSX only.
- Do not introduce TypeScript, Vite, Next.js, Remix, Nuxt, or SSR framework wiring.
- Update docs when setup, routes, env vars, or deployment behavior changes.

## Project Principles

BERP-JS should stay small, readable, and runnable. Prefer boring code over clever abstractions. The goal is a practical starting point that developers can understand quickly and customize safely.
