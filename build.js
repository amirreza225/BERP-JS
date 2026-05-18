import tailwind from "bun-plugin-tailwind";

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
  result.logs.forEach((l) => console.error(l));
  process.exit(1);
}

// Copy HTML shell — bundle.js and bundle.css are emitted by Bun.build above
await Bun.write(".vercel/output/static/index.html", Bun.file("./public/index.html"));
