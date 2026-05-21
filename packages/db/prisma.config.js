import dotenv from "dotenv";

dotenv.config({ path: "../../.env", override: true });

import { defineConfig } from "prisma/config";

// DIRECT_DATABASE_URL must be a plain connection (no pgbouncer=true)
// Prisma migrate needs CREATE DATABASE permission to create a shadow database
// process.env used instead of prisma's env() so `prisma generate` doesn't throw
// when no .env is present (generate doesn't need a DB connection)
const directUrl =
  process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || "";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: directUrl,
  },
});
