import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { prisma } from "./lib/prisma.js";

// cors() defaults to allow all origins — restrict before public production
export const app = new Elysia()
  .use(cors())

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

  .post("/api/sensor", async ({ body, set }) => {
    if (!body || typeof body !== "object") {
      set.status = 400;
      return { error: "Request body must be a JSON object." };
    }
    if (!body.sensorId || typeof body.sensorId !== "string") {
      set.status = 400;
      return { error: "sensorId is required and must be a string." };
    }
    if (typeof body.value !== "number") {
      set.status = 400;
      return { error: "value is required and must be a number." };
    }
    return prisma.sensorData.create({
      data: {
        sensorId: body.sensorId,
        value: body.value,
        metadata: body.metadata ?? undefined,
      },
    });
  });
