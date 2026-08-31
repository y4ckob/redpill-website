/**
 * Build the social card: static/og-image.jpg, 1200x630.
 *
 * The same blurred backdrop the landing page uses, cropped to the card aspect,
 * with the same 0.45 scrim over it (both so it matches the page, and so the
 * light mark keeps its contrast), and the 7.8 mark centred.
 */
import sharp from 'sharp';

const W = 1200, H = 630;
const LOGO_W = 520;          // ~43% of the card width
const SCRIM = { r: 0, g: 0, b: 0, alpha: 0.45 };
const OUT = 'static/og-image.jpg';

const bg = await sharp('static/bg-blur.jpg')
  .resize(W, H, { fit: 'cover', position: 'center' })
  .toBuffer();

const scrim = await sharp({
  create: { width: W, height: H, channels: 4, background: SCRIM },
}).png().toBuffer();

const logo = await sharp('static/78-logo.png')
  .resize({ width: LOGO_W })
  .toBuffer();

await sharp(bg)
  .composite([{ input: scrim }, { input: logo, gravity: 'center' }])
  .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: '4:2:0' })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
const bytes = (await sharp(OUT).toBuffer()).length;
console.log(`${OUT}  ${meta.width}x${meta.height}  ${(bytes / 1024).toFixed(1)} KB`);
