/**
 * Rebuild the 7.8 logo as a clean, transparent, light-on-dark PNG.
 *
 * Why this exists: all three supplied brand files in brand/ are derived from the
 * same flattened render, in which transparency had already been baked down onto
 * a grey/white checkerboard.
 *   - "7.8 logo.png"  is 4 channels but fully opaque; the checker is real pixels.
 *   - "7.8 Logo.jpg"  is the same, in a format that cannot carry alpha at all.
 *   - "7.8 Logo.svg"  is a 1546-path auto-trace OF that checkerboard, so it
 *                     carries the checker squares as ~#CACACA / ~#FDFDFD fills.
 * None can be dropped onto a dark card as-is.
 *
 * The mark itself is recoverable: its luminance histogram is strongly bimodal.
 * The mark sits at L 0-4, the checkerboard at L 199-214 and L 250-255, and only
 * 0.57% of pixels fall between 40 and 190 (the mark's antialiased edges). So we
 * derive alpha from luminance with a ramp: opaque at/below LO, clear at/above
 * HI, linear between. That erases the checkerboard completely while keeping
 * edge antialiasing intact. The recovered mark is tinted to --text (#f2f1ee).
 *
 * MARK_ONLY drops the "HIGH-FIDELITY NEURO-ACOUSTIC HARDWARE" tagline line. It
 * is on by default for two reasons: the tagline's final "E" is clipped by the
 * canvas edge in every supplied source file, and at the 200px display width the
 * landing page uses, its cap height lands at roughly 7px, which is illegible.
 * Set MARK_ONLY = false to ship the full lockup instead.
 */
import sharp from 'sharp';

const SRC = 'brand/7.8 logo.png';
const OUT = 'static/78-logo.png';
const WIDTH = 720;
const MARK_ONLY = true;

const LO = 30;   // at or below this luminance: fully opaque mark
const HI = 190;  // at or above this luminance: fully transparent (checkerboard)

// The trace leaves a scatter of near-zero alpha pixels well outside the mark
// (alpha <= 3). They are invisible but they defeat trim(), which left 82px of
// dead space on the right and pushed the mark off-centre. Floor them to zero.
const NOISE_FLOOR = 6;

const TINT = { r: 242, g: 241, b: 238 }; // --text

const { data, info } = await sharp(SRC).greyscale().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;

const rgba = Buffer.alloc(w * h * 4);
for (let i = 0; i < w * h; i++) {
  const L = data[i];
  let a = L <= LO ? 255 : L >= HI ? 0 : Math.round(255 * (1 - (L - LO) / (HI - LO)));
  if (a < NOISE_FLOOR) a = 0;
  const o = i * 4;
  rgba[o] = TINT.r; rgba[o + 1] = TINT.g; rgba[o + 2] = TINT.b; rgba[o + 3] = a;
}

// Row-wise alpha profile, used to locate the mark band above the tagline.
const rowInk = [];
for (let y = 0; y < h; y++) {
  let s = 0;
  for (let x = 0; x < w; x++) s += rgba[(y * w + x) * 4 + 3];
  rowInk.push(s / w);
}
const isInk = (v) => v >= 1;
const firstRow = rowInk.findIndex(isInk);
const lastRow = rowInk.length - 1 - [...rowInk].reverse().findIndex(isInk);

// Largest run of blank rows strictly inside the content = the lockup's line gap.
let band = { top: firstRow, bottom: lastRow };
if (MARK_ONLY) {
  let best = null, start = null;
  for (let y = firstRow; y <= lastRow; y++) {
    if (!isInk(rowInk[y])) { if (start === null) start = y; }
    else if (start !== null) {
      if (!best || y - start > best.len) best = { at: start, len: y - start };
      start = null;
    }
  }
  if (best) band.bottom = best.at - 1;
}

let img = sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
  .extract({ left: 0, top: band.top, width: w, height: band.bottom - band.top + 1 });

// Re-encode so trim() sees the cropped band, then tighten the horizontal bounds.
img = sharp(await img.png().toBuffer())
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 0 });

await img
  .resize({ width: WIDTH, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
const bytes = (await sharp(OUT).toBuffer()).length;
console.log(`${OUT}  ${meta.width}x${meta.height}  ${(bytes / 1024).toFixed(1)} KB  alpha=${meta.hasAlpha}  markOnly=${MARK_ONLY}`);
