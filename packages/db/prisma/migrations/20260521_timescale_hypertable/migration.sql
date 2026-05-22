-- Convert SensorData to a TimescaleDB hypertable partitioned by timestamp.
-- Safe no-op on plain PostgreSQL (extension absent → DO block skips).
-- The composite (id, timestamp) primary key is already applied by the
-- preceding migration (20260521_sensor_data_composite_pk).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
    PERFORM create_hypertable(
      '"SensorData"',
      'timestamp',
      chunk_time_interval => INTERVAL '1 day',
      if_not_exists        => TRUE,
      migrate_data         => TRUE
    );
  END IF;
END $$;
