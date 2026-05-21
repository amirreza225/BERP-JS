-- CreateTable
CREATE TABLE "SensorData" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "SensorData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SensorData_sensorId_timestamp_idx" ON "SensorData"("sensorId", "timestamp");

-- CreateIndex
CREATE INDEX "SensorData_timestamp_idx" ON "SensorData"("timestamp");
