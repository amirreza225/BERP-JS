-- Replace the single-column primary key on SensorData with a composite (id, timestamp).
-- Required for TimescaleDB hypertable compatibility; harmless on plain PostgreSQL.
-- @@unique([id]) is preserved so Prisma can still look up records by id alone.
ALTER TABLE "SensorData" DROP CONSTRAINT "SensorData_pkey";
ALTER TABLE "SensorData" ADD PRIMARY KEY (id, timestamp);
CREATE INDEX "SensorData_id_idx" ON "SensorData"(id);
