import { prisma } from "@berp/db";
import { logger } from "../lib/logger.js";

export function startAggregator() {
  const id = setInterval(async () => {
    try {
      const [count, latest] = await Promise.all([
        prisma.sensorData.count(),
        prisma.sensorData.findFirst({ orderBy: { timestamp: "desc" } }),
      ]);
      logger.info(
        { count, latestSensor: latest?.sensorId ?? null },
        "aggregation tick",
      );
    } catch (err) {
      logger.error({ err }, "aggregation error");
    }
  }, 60_000);
  return () => clearInterval(id);
}
