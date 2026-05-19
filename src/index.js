import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import index from "../public/index.html";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL — copy .env.example to .env and set it.");
  process.exit(1);
}

try {
  await prisma.$connect();
} catch (err) {
  console.error("Cannot connect to database:", err.message);
  process.exit(1);
}

const server = app
  .onRequest(({ request }) => {
    console.log(`${request.method} ${new URL(request.url).pathname}`);
  })
  .use(swagger())
  .use(await staticPlugin({ prefix: "/" }))
  .get("/", index)
  .listen(process.env.PORT || 3000);

console.log(`BERP-JS running at http://localhost:${server.server.port}`);
