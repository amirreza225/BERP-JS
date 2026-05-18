import { staticPlugin } from "@elysiajs/static";
import { app } from "./app.js";

const result = await Bun.build({
  entrypoints: ["./public/index.jsx"],
  outdir: "./public",
  naming: "bundle.[ext]",
  target: "browser",
});

if (!result.success) {
  console.error("Frontend build failed:");
  result.logs.forEach((l) => console.error(l));
  process.exit(1);
}

const server = app
  // Explicit routes for generated assets — static plugin doesn't reliably serve
  // files created after its initialization scan
  .get("/bundle.js", () =>
    new Response(Bun.file("./public/bundle.js"), {
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    })
  )
  .get("/globals.css", () =>
    new Response(Bun.file("./public/globals.css"), {
      headers: { "Content-Type": "text/css; charset=utf-8" },
    })
  )
  .use(staticPlugin({ assets: "./public", prefix: "/" }))
  .get("/*", () => Bun.file("./public/index.html"))
  .listen(process.env.PORT || 3000);

console.log(`BERP-JS running at http://localhost:${server.server.port}`);
