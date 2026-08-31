/**
 * Capture the live RedPill homepage and bake it down into the blurred backdrop
 * the rebrand landing page sits on (static/bg-blur.jpg).
 *
 * The blur is baked into the file rather than applied in CSS: it keeps the page
 * dependency-free, costs nothing at runtime, and means no unblurred frame can
 * ever flash before the filter applies.
 *
 * Falls back to serving this repo over python3 -m http.server if the live site
 * is unreachable. Run this BEFORE deleting the old site.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { spawn } from 'node:child_process';
import { mkdir, stat, writeFile } from 'node:fs/promises';

const LIVE = 'https://www.redpillaudio.com/';
const PORT = 8000;
const LOCAL = `http://localhost:${PORT}/`;

const OUT = 'static/bg-blur.jpg';
const VIEWPORT = { width: 1600, height: 1000 };
const SCALE = 2;
const SETTLE_MS = 2500;   // let the hero video paint a frame and webfonts land

// Sigma 24 was the starting recipe, but it failed its own acceptance test: the
// old homepage's two brand-red CTAs survived as vivid red pills even under the
// 0.45 scrim, and the hero headline still read as text-shaped bands.
//
// Sigma 40 / saturation 0.55 fixed that but overshot: it flattened the capture
// into a plain dark gradient, losing any sense that the backdrop IS the old
// homepage. Sigma 28 / 0.7 keeps the composition legible as a blurred room
// while still dissolving the red CTAs and every glyph.
const BLUR_SIGMA = 28;
const SATURATION = 0.7;
const JPEG_QUALITY = 62;
const TARGET_WIDTH = 1600;

async function grab(url) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: VIEWPORT,
      deviceScaleFactor: SCALE,
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(SETTLE_MS);
    return await page.screenshot({ type: 'png' });
  } finally {
    await browser.close();
  }
}

async function withLocalServer(fn) {
  const server = spawn('python3', ['-m', 'http.server', String(PORT)], {
    stdio: 'ignore',
  });
  try {
    // Poll until the static server answers rather than sleeping a fixed time.
    for (let i = 0; i < 40; i++) {
      try {
        const r = await fetch(LOCAL, { method: 'HEAD' });
        if (r.ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 250));
    }
    return await fn();
  } finally {
    server.kill();
  }
}

let png;
let source;
try {
  png = await grab(LIVE);
  source = LIVE;
} catch (err) {
  console.warn(`Live site unreachable (${err.message.split('\n')[0]}); falling back to local server.`);
  png = await withLocalServer(() => grab(LOCAL));
  source = LOCAL;
}

await mkdir('static', { recursive: true });

// Optional: keep the unprocessed screenshot, so the blur/saturation recipe can
// be re-tuned without hitting the live site again.
if (process.env.RAW_OUT) {
  await writeFile(process.env.RAW_OUT, png);
  console.log(`raw screenshot -> ${process.env.RAW_OUT}`);
}

await sharp(png)
  .resize({ width: TARGET_WIDTH })
  .modulate({ saturation: SATURATION })
  .blur(BLUR_SIGMA)
  .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: '4:2:0' })
  .toFile(OUT);

const { size } = await stat(OUT);
const meta = await sharp(OUT).metadata();
console.log(
  `captured ${source}\n${OUT}  ${meta.width}x${meta.height}  ${(size / 1024).toFixed(1)} KB  (blur sigma ${BLUR_SIGMA}, saturation ${SATURATION}, q${JPEG_QUALITY})`
);
