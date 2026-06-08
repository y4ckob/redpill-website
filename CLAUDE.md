# RedPill Audio website — project context

Read this first, every session.

## What this is
A static marketing website for RedPill Audio (PT Red Pill Audio), a premium
audio systems and installation company based in Bali. Two pages:
`index.html` (landing) and `shop.html`. It is hosted on GitHub Pages and
will be pointed at redpillaudio.com.

## Tech — keep it exactly this way
- Plain HTML, CSS and vanilla JavaScript. No build step, no framework, no npm,
  no bundler. It must run as static files on GitHub Pages.
- All styling lives in `assets/css/style.css`, driven by CSS variables defined
  in `:root` at the top of the file. Reuse those variables. Do not add a CSS
  framework (no Tailwind, Bootstrap, etc.) or a second design system.
- All behaviour lives in `assets/js/main.js`: nav, enquiry drawer (product
  and project modes), request quotation, shop filters, scroll reveals.
- `index.html` and `shop.html` share the same nav, footer, enquiry drawer
  and toast markup. If you change that shared markup in one, change it in both.
- Keep all file paths relative (e.g. `assets/css/style.css`), so the site works
  both at a GitHub Pages sub-path and at the domain root.

## Brand voice — strict
- British English spelling throughout.
- No em dashes. Use commas, semicolons or parentheses instead.
- Matter-of-fact tone. No flattery, no marketing embellishment, no exclamation
  marks.
- Keep the existing endorsement quotes (Steve Lillywhite, Sam Fender, Mark
  Baker) and the "true sound" positioning as written.

## Money
- Currency is IDR. Format with dot thousand separators, e.g. 1.220.000.000.
- Only use prices and specifications that actually appear in the brochure or the
  asset files. Do not invent, estimate or round prices or technical specs. If
  anything is unclear or missing, ask before guessing.

## Commerce model
- No online payment, ever. Visitors build an enquiry list and request a
  quotation. Even if prices are displayed, checkout stays "Request quotation"
  (email, or a webhook set in `main.js`). Do not add a payment gateway.

## Deployment
- Target: GitHub Pages on github.com/y4ckob, then custom domain
  redpillaudio.com with DNS via Cloudflare. Full steps are in `README.md`.
- Do not deploy or change DNS without being asked; walk Jack through it
  step by step when the time comes.

## Assets
- `assets/hero.mp4` is the drone footage, played in the showroom section
  (poster: `assets/img/hero-video-poster.jpg`). The landing hero uses
  `assets/img/hero.jpg`.
- `assets/RedPill-Audio-Brochure.pdf` is both the file the "Download brochure"
  buttons link to, and the source of product data/prices.
- Product images live in `assets/img/products/<id>/` (q3, q4, q6, q-s10,
  f1-portal): `main.jpg` plus optional `gallery-1..4.jpg`. Each folder has a
  README.txt with the expected sizes. Missing gallery files are skipped
  automatically; replace images by filename, no HTML changes needed.

## Working style
- This is an existing, working site. Finish and refine it; do not rebuild from
  scratch.
- Read the whole project before editing. Propose a short plan and wait for
  Jack's go-ahead before making large changes.
