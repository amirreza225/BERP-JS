import { staticPlugin } from "@elysiajs/static";
import index from "../public/index.html";
import { app } from "./app.js";

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL — copy .env.example to .env and set it.");
  process.exit(1);
}

const server = app
  .use(await staticPlugin({ prefix: "/" }))
  .get("/", index)
  .listen(process.env.PORT || 3000);

console.log(`BERP-JS running at http://localhost:${server.server.port}`);
