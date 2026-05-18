import { Elysia } from "elysia";
import { prisma } from "./lib/prisma.js";

export const app = new Elysia()

  .get("/api/health", () => ({
    status: "ok",
    name: "BERP-JS",
    runtime: "bun",
    timestamp: new Date().toISOString(),
  }))

  .get("/api/sensor", async () =>
    prisma.sensorData.findMany({
      orderBy: { timestamp: "desc" },
      take: 100,
    })
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
