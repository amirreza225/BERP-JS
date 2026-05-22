import { prisma } from "@berp/db";
import { Elysia, t } from "elysia";
import { broadcast } from "../lib/broadcast.js";

export const sensorRoutes = new Elysia({ prefix: "/api/sensor" })
  .get(
    "",
    async ({ query, set }) => {
      const where = {};
      if (query.sensorId) where.sensorId = query.sensorId;
      if (query.from || query.to) {
        const from = query.from ? new Date(query.from) : null;
        const to = query.to ? new Date(query.to) : null;
        if (
          (from && Number.isNaN(from.getTime())) ||
          (to && Number.isNaN(to.getTime()))
        ) {
          set.status = 400;
          return {
            error: {
              message: "Invalid date in 'from' or 'to'",
              code: "VALIDATION",
            },
          };
        }
        where.timestamp = {};
        if (from) where.timestamp.gte = from;
        if (to) where.timestamp.lte = to;
      }
      const limitNum = Number(query.limit ?? 100);
      if (
        query.limit !== undefined &&
        (!Number.isInteger(limitNum) || Number.isNaN(limitNum))
      ) {
        set.status = 400;
        return {
          error: { message: "limit must be an integer", code: "VALIDATION" },
        };
      }
      return prisma.sensorData.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: Math.min(Math.max(Math.trunc(limitNum), 1), 1000),
      });
    },
    {
      query: t.Object({
        sensorId: t.Optional(t.String()),
        from: t.Optional(t.String()),
        to: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "",
    async ({ body }) => {
      const record = await prisma.sensorData.create({
        data: {
          sensorId: body.sensorId,
          value: body.value,
          metadata: body.metadata ?? undefined,
        },
      });
      broadcast(record);
      return record;
    },
    {
      body: t.Object({
        sensorId: t.String({ minLength: 1 }),
        value: t.Number(),
        metadata: t.Optional(t.Any()),
      }),
    },
  );
