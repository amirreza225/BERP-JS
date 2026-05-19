import { prisma } from "../src/lib/prisma.js";

const cleared =
  await prisma.$executeRaw`DELETE FROM "SensorData" WHERE metadata->>'source' = 'seed'`;
if (cleared) console.log(`Cleared ${cleared} existing seed records.`);

const sensors = ["sensor-1", "sensor-2", "sensor-3"];
const records = Array.from({ length: 30 }, (_, i) => ({
  sensorId: sensors[i % sensors.length],
  value: Math.round(Math.random() * 1000) / 10,
  metadata: { unit: "celsius", source: "seed" },
}));

await prisma.sensorData.createMany({ data: records });
console.log(`Seeded ${records.length} sensor records.`);
await prisma.$disconnect();
