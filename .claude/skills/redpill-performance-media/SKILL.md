---
name: redpill-performance-media
description: Performance budgets and the media pipeline for the RedPill Audio site — image sizing/encoding recipes, responsive images without a build step, video encoding, deploy hygiene (what must not ship), and Lighthouse verification. Use for any work involving images, video, page weight, loading behaviour, or performance review.
---

# RedPill Audio — Performance & Media

The site ships as plain static files on Vercel (auto-deploy from `main`): no image CDN, no build-time image pipeline, no edge transforms in use. Every byte shipped is a byte some villa owner on Bali 4G downloads. The pipeline is therefore manual and disciplined: optimise at *commit time*, not serve time.

## Budgets (fail = fix before commit)

- Landing page total weight < 2.5MB before the lazy video (which loads only near the showroom section); LCP (hero image) < 2.5s on mid-tier mobile; CLS ≈ 0 (all `<img>` get `width`/`height` or aspect-ratio CSS — gallery already does this; product cards must too).
- Single image files: hero ≤ 500KB, product `main.jpg` ≤ 250KB, gallery ≤ 350KB, partner logos ≤ 40KB each, favicons/og as-is.
- Video: showroom loop ≤ 25MB (current 1080p30 ~23MB re-encode is the ceiling, `preload="none"` + poster + `data-lazy-video` pattern stays).

## Known offenders (housekeeping targets, confirmed July 2026)

`assets/a6c1b84d886b421ea1d08749159a7e10.MP4` — 56MB raw drone original sitting in the deploy; move out of the repo (it's source material, not a site asset). `assets/img/9.jpg` — 6.7MB stray. Stray product photos in `assets/` root (`Q-S10.jpeg`, `Q6.jpeg`, `Q6 Side.jpeg`) — belong in `assets/img/products/<id>/` folders or out of the repo. `.DS_Store` files — gitignore and remove from tracking. `deck/node_modules` — internal tooling, never deploy.

## Image recipes (run in a scratch folder, commit only outputs)

JPEG product/gallery/hero (ImageMagick):
```bash
magick input.jpg -resize 1600x\> -strip -interlace Plane -quality 82 output.jpg   # hero/full-bleed
magick input.jpg -resize 1080x\> -strip -interlace Plane -quality 80 output.jpg   # product/gallery
```
- Product images keep the established contract: `products/<id>/main.jpg` 4:3 landscape + optional square `gallery-1..4.jpg`, replaced by filename with no HTML changes. Match existing dimensions when replacing; each product folder's README.txt states expected sizes.
- WebP is allowed without a build step via `<picture>` (`<source type="image/webp">` + jpg fallback) — worth it for the hero and heaviest sections; not worth the markup noise for every partner logo. If added, generate with `magick input.jpg -quality 82 output.webp` and keep BOTH files in sync forever (document in the product-folder READMEs).
- PNG only for logos/marks with transparency; run `pngquant` or `magick -strip` on them. The og-image stays PNG.

## Video recipe (matches the current hero.mp4 approach)

```bash
ffmpeg -i raw.mp4 -vf "scale=1920:-2,fps=30" -c:v libx264 -crf 23 -preset slow -profile:v high -movflags +faststart -an out.mp4
```
`-an` strips audio (it's a mute loop), `+faststart` moves the moov atom for instant scrub. Poster frame: `ffmpeg -i out.mp4 -ss 00:00:02 -frames:v 1 -q:v 3 poster.jpg`, then optimise like a hero image. Keep the existing lazy pattern: `preload="none"`, `poster`, `data-src` swapped in by `data-lazy-video` when scrolled near.

## Loading conventions (already good — preserve and extend)

- Below-the-fold images: `loading="lazy"` (gallery does this; audit product cards and partner logos). Hero image: never lazy; consider `fetchpriority="high"`.
- The anti-FOUC critical CSS in each `<head>` stays tiny (~10 rules) and in sync with `style.css` — it is not a place for new styles.
- One CSS file, one JS file, loaded once each; no new HTTP requests for libraries (no icon fonts, no CDN scripts — SVGs are inline, keep it that way). Analytics, if added, is the single permitted third-party script.
- The grain overlay is a data-URI SVG (free); marquee and reveals are CSS/rAF — no animation libraries.

## Verification (every renovation session that touches media or layout)

1. `python3 -m http.server` from repo root; test index, shop, gallery, faq at the domain root (Vercel serves at root, there is no sub-path to test).
2. Lighthouse (Chrome DevTools, mobile preset) on index + shop: Performance ≥ 90, and specifically check LCP element, CLS sources, total transferred.
3. Network panel with cache disabled: confirm the 56MB file is gone (post-housekeeping), video doesn't load until showroom scroll, no image over its budget.
4. `du -sh` the deploy tree and record the total in the commit message when it changes meaningfully (target: whole site excluding brochure + video well under 10MB).
5. Cross-check the four-page shared-markup rule if anything in nav/footer/drawer moved (see `redpill-site-conventions`).
