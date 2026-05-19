import tailwind from "bun-plugin-tailwind";

// Frontend
const result = await Bun.build({
  entrypoints: ["./public/index.jsx", "./public/globals.css"],
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

const devHtml = await Bun.file("./public/index.html").text();
const prodHtml = devHtml
  .replace(
    /<!-- BUILD:CSS -->.*?<!-- \/BUILD:CSS -->/s,
    '<link rel="stylesheet" href="/bundle.css" />',
  )
  .replace(
    /<!-- BUILD:JS -->.*?<!-- \/BUILD:JS -->/s,
    '<script src="/bundle.js"></script>',
  );
await Bun.write(".vercel/output/static/index.html", prodHtml);

// API function — bundled into Build Output API format so Vercel skips Elysia auto-detection
const funcDir = ".vercel/output/functions/api/[...path].func";
const funcResult = await Bun.build({
  entrypoints: ["./api/[...path].js"],
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
    handler: "index.js",
    launcherType: "Nodejs",
  }),
);

// Routing: /api/* → function, then try static files, then SPA fallback
await Bun.write(
  ".vercel/output/config.json",
  JSON.stringify({
    version: 3,
    routes: [
      { src: "^/api/(.*)", dest: "/api/[...path]" },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html", status: 200 },
    ],
  }),
);
