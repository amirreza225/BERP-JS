export const repoUrl = "https://github.com/amirreza225/BERP-JS";
export const swaggerUrl = "/swagger";

export const stack = ["Bun", "Elysia", "React 19", "Prisma", "TimescaleDB"];

export const features = [
  "Pure JavaScript and JSX",
  "Single-command full-stack dev server",
  "Better Auth ready",
  "TimescaleDB hypertable migrations",
  "Docker, Vercel, Vitest, Playwright, Biome",
  "No TypeScript, Vite, Next.js, Remix, or SSR framework",
];

export const setupCommands = [
  "git clone https://github.com/amirreza225/BERP-JS.git my-app",
  "cd my-app",
  "cp .env.example .env",
  "docker compose up -d",
  "bun install",
  "bun run db:migrate && bun run db:seed",
  "bun run dev",
];
