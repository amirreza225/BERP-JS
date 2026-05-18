import dotenv from "dotenv";
dotenv.config({ override: true });

import { defineConfig, env } from "prisma/config";

// DIRECT_DATABASE_URL must be a plain connection (no pgbouncer=true)
// Prisma migrate needs CREATE DATABASE permission to create a shadow database
const directUrl = env("DIRECT_DATABASE_URL") || env("DATABASE_URL");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: directUrl,
  },
});
