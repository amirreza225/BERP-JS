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
  for (const l of result.logs) console.error(l);
  process.exit(1);
}

// Prod html: swap CDN script → bundle.css link, swap JSX src → bundle.js
const devHtml = await Bun.file("./public/index.html").text();
const prodHtml = devHtml
  .replace('src="./index.jsx"', 'src="/bundle.js"')
  .replace(
    '<script src="https://cdn.tailwindcss.com"></script>',
    '<link rel="stylesheet" href="/bundle.css" />',
  );
await Bun.write(".vercel/output/static/index.html", prodHtml);
