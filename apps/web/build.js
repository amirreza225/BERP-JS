import tailwind from "bun-plugin-tailwind";

const result = await Bun.build({
  entrypoints: ["./src/index.jsx", "./src/globals.css"],
  outdir: "./public",
  naming: "bundle.[ext]",
  target: "browser",
  minify: true,
  plugins: [tailwind],
});

if (!result.success) {
  console.error("Frontend build failed:");
  for (const log of result.logs) console.error(log);
  process.exit(1);
}
