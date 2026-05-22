import tailwind from "bun-plugin-tailwind";

// Frontend
const result = await Bun.build({
  entrypoints: ["./apps/web/src/index.jsx", "./apps/web/src/globals.css"],
  outdir: ".vercel/output/static",
  naming: "bundle.[ext]",
  target: "browser",
  minify: true,
  plugins: [tailwind],
});

if (!result.success) {
  console.error("Frontend build failed:");
  for (const l of result.logs) console.error(l);
  process.exit(1);
}

const devHtml = await Bun.file("./apps/web/public/index.html").text();
await Bun.write(".vercel/output/static/index.html", devHtml);

// API function — bundled into Build Output API format so Vercel skips Elysia auto-detection
const funcDir = ".vercel/output/functions/api/[...path].func";
const funcResult = await Bun.build({
  entrypoints: ["./apps/api/api/[...path].js"],
  outdir: funcDir,
  target: "node",
  naming: "index.js",
});

if (!funcResult.success) {
  console.error("Function build failed:");
  for (const l of funcResult.logs) console.error(l);
  process.exit(1);
}

await Bun.write(
  `${funcDir}/.vc-config.json`,
  JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.js",
    launcherType: "Nodejs",
  }),
);

await Bun.write(
  `${funcDir}/package.json`,
  JSON.stringify({
    type: "module",
  }),
);

// Routing: API and Swagger docs use the function, then try static files,
// then SPA fallback.
await Bun.write(
  ".vercel/output/config.json",
  JSON.stringify({
    version: 3,
    routes: [
      { src: "^/api/(.*)", dest: "/api/[...path]" },
      { src: "^/swagger(?:/.*)?$", dest: "/api/[...path]" },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html", status: 200 },
    ],
  }),
);
