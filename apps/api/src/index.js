import { prisma } from "@berp/db";
import { staticPlugin } from "@elysiajs/static";
import { startAggregator } from "./jobs/aggregator.js";
import { subscribe, unsubscribe } from "./lib/broadcast.js";
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
  .derive(() => ({ start: Date.now() }))
  .onRequest(({ request }) => {
    logger.info(
      { method: request.method, path: new URL(request.url).pathname },
      "→",
    );
  })
  .onAfterHandle(({ request, start }) => {
    logger.info(
      {
        method: request.method,
        path: new URL(request.url).pathname,
        durationMs: Date.now() - start,
      },
      "←",
    );
  })
  .onError(({ code, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 200;
      return Bun.file(`${assetsDir}/index.html`);
    }
  })
  .ws("/api/ws/sensor", {
    open(ws) {
      subscribe(ws);
    },
    close(ws) {
      unsubscribe(ws);
    },
  })
  .use(await staticPlugin({ assets: assetsDir, prefix: "/" }))
  .get("/", () => Bun.file(`${assetsDir}/index.html`))
  .get("/*", () => Bun.file(`${assetsDir}/index.html`))
  .listen(process.env.PORT || 3000);

logger.info(`BERP-JS running at http://localhost:${server.server.port}`);

const stopAggregator = startAggregator();

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down");
  stopAggregator();
  server.stop();
  prisma.$disconnect().finally(() => process.exit(0));
});
