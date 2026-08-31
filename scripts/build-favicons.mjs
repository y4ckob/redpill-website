/**
 * Build the favicons from the same recovered mark as static/78-logo.png.
 *
 * The full mark is a wide lockup ("7.8" + registered sign + waveform). Centred
 * whole in a square it renders as a smear at browser-tab sizes, so the favicon
 * uses just the "7·8" glyph group, padded on the brand ground (--bg #0b0b0d).
 */
import sharp from 'sharp';

const SRC = 'static/78-logo.png';
const BG = { r: 11, g: 11, b: 13, alpha: 1 }; // --bg #0b0b0d
const PAD = 0.14; // share of the square left as margin on each side

// Column runs of fully transparent pixels split the lockup into glyph groups.
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h, channels: c } = info;

const colInk = [];
for (let x = 0; x < w; x++) {
  let s = 0;
  for (let y = 0; y < h; y++) s += data[(y * w + x) * c + 3];
  colInk.push(s);
}
const gaps = [];
let start = null;
colInk.forEach((v, x) => {
  if (v === 0) { if (start === null) start = x; }
  else if (start !== null) { if (x - start > 3) gaps.push({ at: start, len: x - start }); start = null; }
});

// "7·8" is everything left of the gap that precedes the registered sign, i.e.
// the second inter-glyph gap. Fall back to the whole mark if the shape changes.
const cut = gaps.length >= 2 ? gaps[1].at : w;

const glyph = await sharp(SRC)
  .extract({ left: 0, top: 0, width: cut, height: h })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 0 })
  .png()
  .toBuffer();

const gm = await sharp(glyph).metadata();

for (const size of [512, 180]) {
  const inner = Math.round(size * (1 - PAD * 2));
  const scale = Math.min(inner / gm.width, inner / gm.height);
  const rw = Math.max(1, Math.round(gm.width * scale));
  const rh = Math.max(1, Math.round(gm.height * scale));

  const resized = await sharp(glyph).resize({ width: rw, height: rh }).png().toBuffer();
  const out = `static/favicon-${size}.png`;

  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: resized, gravity: 'center' }])
    .png({ compressionLevel: 9, palette: true, effort: 10 })
    .toFile(out);

  const bytes = (await sharp(out).toBuffer()).length;
  console.log(`${out}  ${size}x${size}  ${(bytes / 1024).toFixed(1)} KB`);
}
