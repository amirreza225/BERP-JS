import tailwind from "bun-plugin-tailwind";

async function watch() {
  console.log("Starting frontend bundler in watch mode...");
  await Bun.build({
    entrypoints: ["./public/index.jsx", "./public/globals.css"],
    outdir: "./public",
    naming: "bundle.[ext]",
    target: "browser",
    watch: true,
    plugins: [tailwind],
  });
}

watch().catch(console.error);
