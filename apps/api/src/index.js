import { prisma } from "@berp/db";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { validateEnv } from "./lib/env.js";
import { app } from "./server.js";

validateEnv();

try {
  await prisma.$connect();
} catch (err) {
  console.error("Cannot connect to database:", err.message);
  process.exit(1);
}

import { logger } from "./lib/logger.js";

const isProd = process.env.NODE_ENV === "production";
const assetsDir = isProd ? "../../.vercel/output/static" : "../web/public";

const server = app
  .onRequest(({ request }) => {
    logger.info(`${request.method} ${new URL(request.url).pathname}`);
  })
  .use(swagger())
  .use(await staticPlugin({ assets: assetsDir, prefix: "/" }))
  .get("/", () => Bun.file(`${assetsDir}/index.html`))
  .get("/*", () => Bun.file(`${assetsDir}/index.html`))
  .listen(process.env.PORT || 3000);

logger.info(`BERP-JS running at http://localhost:${server.server.port}`);
