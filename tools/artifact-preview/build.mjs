/**
 * Builds SPICY as ONE self-contained HTML file (JS + CSS inlined) so it can be
 * opened without a server — e.g. published as a Claude artifact.
 *
 *   npm run preview:single            -> spicy-preview.html
 *   node tools/artifact-preview/build.mjs out.html
 *
 * It reuses the real app source; only next/link, next/navigation and next/image
 * are swapped for small shims (see ./shims). Not used by the Next.js app itself.
 */
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.resolve(process.argv[2] ?? path.join(root, "spicy-preview.html"));

// 1) CSS: compile Tailwind from the app's own globals.css (scans the project's classes).
const cssInput = path.join(root, "src/app/globals.css");
const { css: rawCss } = await postcss([tailwind({ base: root, optimize: { minify: true } })]).process(readFileSync(cssInput, "utf8"), {
  from: cssInput,
});

// 2) JS: bundle the app with the shims.
const result = await build({
  entryPoints: [path.join(here, "entry.tsx")],
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  jsx: "automatic",
  write: false,
  tsconfig: path.join(root, "tsconfig.json"),
  alias: {
    "next/link": path.join(here, "shims/next-link.tsx"),
    "next/navigation": path.join(here, "shims/next-navigation.ts"),
    "next/image": path.join(here, "shims/next-image.tsx"),
  },
  define: { "process.env.NODE_ENV": '"production"' },
  logOverride: { "unsupported-directive": "silent" },
  legalComments: "none",
});

// 3) Images: embed the project's photos (public/images) as small data URIs, because the
//    artifact viewer can't load images from other sites.
async function embedImages() {
  const dir = path.join(root, "public/images");
  if (!existsSync(dir)) return {};
  let sharp = null;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("sharp not available — embedding full-size images");
  }
  const map = {};
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : [path.join(d, f)]));
  for (const file of walk(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))) {
    const url = "/" + path.relative(path.join(root, "public"), file).split(path.sep).join("/");
    const width = url.startsWith("/images/site/") ? 900 : 560;
    const buf = sharp ? await sharp(file).resize({ width, withoutEnlargement: true }).jpeg({ quality: 72, mozjpeg: true }).toBuffer() : readFileSync(file);
    map[url] = `data:image/jpeg;base64,${buf.toString("base64")}`;
  }
  return map;
}
const images = await embedImages();
const imagesJs = `window.__SPICY_IMAGES=${JSON.stringify(images)};`;

const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const css = rawCss.replace(/<\/style/gi, "<\\/style");

const html = `<title>SPICY</title>
<meta name="description" content="Interactive SPICY food-ordering prototype with fictional demo data.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
:root {
  --font-fraunces: "Fraunces";
  --font-inter-tight: "Inter Tight";
  --font-jetbrains: "JetBrains Mono";
  color-scheme: light;
}
html, body { min-height: 100%; background: #fff7ed; color: #141414; }
/* In the preview, show scroll-reveal content at rest (thumbnails and first frame). */
[data-reveal] { opacity: 1 !important; transform: none !important; }
</style>
<style>${css}</style>
<div id="spicy-root"></div>
<script>${imagesJs}</script>
<script>${js}</script>
`;

writeFileSync(out, html);
console.log(`Wrote ${out} (${(html.length / 1024).toFixed(0)} KB, ${Object.keys(images).length} images embedded)`);
