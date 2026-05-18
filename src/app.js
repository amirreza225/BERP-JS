import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { prisma } from "./lib/prisma.js";

// cors() defaults to allow all origins — restrict before public production
export const app = new Elysia()
  .use(cors())
  .onError(({ error, set }) => {
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
