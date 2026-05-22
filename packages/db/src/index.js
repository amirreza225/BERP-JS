import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Sanitize database connection string environment variables in case they were copy-pasted with variable prefix or enclosing quotes
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  if (url.startsWith("DATABASE_URL=")) {
    url = url.substring("DATABASE_URL=".length);
  }
  url = url.replace(/^["']|["']$/g, "").trim();
  process.env.DATABASE_URL = url;
}

if (process.env.DIRECT_DATABASE_URL) {
  let url = process.env.DIRECT_DATABASE_URL;
  if (url.startsWith("DIRECT_DATABASE_URL=")) {
    url = url.substring("DIRECT_DATABASE_URL=".length);
  }
  url = url.replace(/^["']|["']$/g, "").trim();
  process.env.DIRECT_DATABASE_URL = url;
}

const globalForPrisma = globalThis;

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is missing. Please configure it in your Vercel Project Settings or local .env file.",
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { Prisma } from "@prisma/client";
