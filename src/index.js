import { staticPlugin } from "@elysiajs/static";
import index from "../public/index.html";
import { app } from "./app.js";

const server = app
  .use(await staticPlugin({ prefix: "/" }))
  .get("/", index)
  .listen(process.env.PORT || 3000);

console.log(`BERP-JS running at http://localhost:${server.server.port}`);
