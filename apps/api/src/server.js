import { prisma } from "@berp/db";
import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { helmet } from "elysia-helmet";
import { auth } from "./lib/auth.js";

export const app = new Elysia()
  .all("/api/auth/*", ({ request }) => auth.handler(request))
  .use(
    cors({
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",")
        : true,
    }),
  )
  .use(helmet())
  .onError(({ error, set }) => {
    console.error("API error details:", error);
    set.status = error.status ?? 500;
    try {
      // Elysia validation errors serialize schema context as JSON in message;
      // extract the human-readable summary so the client always gets a string
      const parsed = JSON.parse(error.message);
      return { error: parsed.summary ?? parsed.message ?? error.message };
    } catch {
      return { error: error.message ?? "Internal server error" };
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

  .get("/api/debug-db", () => {
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

  .get("/api/sensor", async () =>
    prisma.sensorData.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    }),
  )

  .post(
    "/api/sensor",
    async ({ body }) =>
      prisma.sensorData.create({
        data: {
          sensorId: body.sensorId,
          value: body.value,
          metadata: body.metadata ?? undefined,
        },
      }),
    {
      body: t.Object({
        sensorId: t.String({ minLength: 1 }),
        value: t.Number(),
        metadata: t.Optional(t.Any()),
      }),
    },
  );

export default app;
