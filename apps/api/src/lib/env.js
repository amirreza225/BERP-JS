import { TypeCompiler } from "@sinclair/typebox/compiler";
import { t } from "elysia";

const EnvSchema = t.Object({
  DATABASE_URL: t.String({ minLength: 1 }),
  BETTER_AUTH_SECRET: t.String({ minLength: 1 }),
  BETTER_AUTH_URL: t.String({ minLength: 1 }),
  PORT: t.Optional(t.String()),
  NODE_ENV: t.Optional(t.String()),
  CORS_ORIGIN: t.Optional(t.String()),
  LOG_LEVEL: t.Optional(t.String()),
});

const compiler = TypeCompiler.Compile(EnvSchema);

export function validateEnv() {
  const isValid = compiler.Check(process.env);
  if (!isValid) {
    const errors = [...compiler.Errors(process.env)];
    console.error("❌ Environment validation failed:");
    for (const err of errors) {
      console.error(`- ${err.path}: ${err.message}`);
    }
    process.exit(1);
  }
}
