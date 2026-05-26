import { prisma } from "@berp/db";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { helmet } from "elysia-helmet";
import { rateLimit } from "elysia-rate-limit";
import { auth } from "./lib/auth.js";
import { logger } from "./lib/logger.js";
import { sensorRoutes } from "./routes/sensor.js";

export const app = new Elysia()
  .use(
    rateLimit({
      duration: 60000,
      max: 200,
      // Prefer server.requestIP() (direct connections, dev); fall back to proxy
      // headers only when the server cannot determine the IP (Vercel serverless).
      generator: (req, server) =>
        server?.requestIP(req)?.address ??
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
        req.headers.get("x-real-ip") ??
        "unknown",
    }),
  )
  .all("/api/auth/*", ({ request }) => auth.handler(request))
  .use(
    cors({
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : true,
    }),
  )
  .use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "https://cdn.jsdelivr.net",
          ],
        },
      },
    }),
  )
  .use(swagger())
  .onError(({ error, set, code, request }) => {
    // Non-API 404s are SPA routes — let the server entrypoint serve index.html
    if (code === "NOT_FOUND") {
      const { pathname } = new URL(request.url);
      if (!pathname.startsWith("/api/") && !pathname.startsWith("/swagger"))
        return;
    }
    logger.error({ code, err: error }, "Request error");
    set.status = code === "VALIDATION" ? 400 : (error.status ?? 500);
    try {
      // Elysia validation errors serialize schema context as JSON in message;
      // extract the human-readable summary so the client always gets a string
      const parsed = JSON.parse(error.message);
      return {
        error: {
          message: parsed.summary ?? parsed.message ?? error.message,
          code,
        },
      };
    } catch {
      return {
        error: { message: error.message ?? "Internal server error", code },
      };
    }
  })

  .get("/api/health", async () => {
    let db = "up";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      db = "down";
    }
    return {
      status: db === "up" ? "ok" : "degraded",
      name: "BERP-JS",
      runtime: "bun",
      db,
      timestamp: new Date().toISOString(),
    };
  })

  .get("/api/debug-db", ({ set }) => {
    if (process.env.NODE_ENV === "production") {
      set.status = 404;
      return { error: { message: "Not found" } };
    }
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return { status: "missing" };
    }
    let parsedHost = "failed to parse";
    try {
      // Node/Bun URL parser needs a protocol to parse hostname correctly,
      // fallback to regex if it's not a fully qualified URL
      const hostMatch = dbUrl.match(/@([^/?:#]+)/);
      parsedHost = hostMatch
        ? hostMatch[1]
        : new URL(dbUrl).hostname || "unknown";
    } catch (e) {
      parsedHost = `error: ${e.message}`;
    }
    return {
      status: "present",
      length: dbUrl.length,
      host: parsedHost,
      startsWith: `${dbUrl.substring(0, 15)}...`,
    };
  })

  .use(sensorRoutes);

if (!process.env.VERCEL) {
  const { compression } = await import("elysia-compress");
  app.use(
    compression({
      threshold: 2048,
      TTL: 300,
      as: "scoped",
    }),
  );
}

export default app;
