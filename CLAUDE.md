# RedPill Audio website — project context

Read this first, every session.

## What this is
A static marketing website for RedPill Audio (PT Red Pill Audio), a premium
audio systems and installation company based in Bali. Four pages:
`index.html` (landing), `shop.html`, `gallery.html` and `faq.html`. It
auto-deploys to Vercel from the `main` branch and is live at
www.redpillaudio.com (SSL enforced).

## Tech — keep it exactly this way
- Plain HTML, CSS and vanilla JavaScript. No build step, no framework, no npm,
  no bundler. It runs as plain static files (Vercel serves the repo as-is).
- All styling lives in `assets/css/style.css`, driven by CSS variables defined
  in `:root` at the top of the file. Reuse those variables. Do not add a CSS
  framework (no Tailwind, Bootstrap, etc.) or a second design system.
- All behaviour lives in `assets/js/main.js`: nav, enquiry drawer (product
  and project modes), request quotation, shop filters, scroll reveals.
- All four pages share the same nav, footer, enquiry drawer + overlay,
  WhatsApp float and toast markup. If you change that shared markup in one,
  change it in all four (except the nav's active-page state). Exception: the
  collaborators marquee and its "View more" modal live only on `index.html`,
  since that is the only page with a collaborators section; this divergence is
  intentional, do not propagate it to the other three.
- Keep all file paths relative (e.g. `assets/css/style.css`); it is simpler and
  keeps the site portable.
- Project skills live in `.claude/skills/` (site-conventions, brand-and-voice,
  enquiry-system, seo-local, performance-media). They are authoritative on how
  the site is built; read them before editing.

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
- The brochure PDF is generally authoritative, but it is known to be out of date
  on the Q-S10 (the brochure lists it as passive; it is in fact an active
  subwoofer) and it carries an old tagline. Do not treat the brochure as
  authoritative for the Q-S10; `shop.html` is correct there. Real active-sub
  spec figures are still pending from engineering, so leave the Q-S10 spec table
  and its amplification wording alone until Jack supplies them.

## Commerce model
- No online payment, ever. Visitors build an enquiry list and request a
  quotation. Even if prices are displayed, checkout stays "Request quotation"
  (email, or a webhook set in `main.js`). Do not add a payment gateway.

## Deployment
- The site auto-deploys to Vercel on every push to `main`, and is live at
  www.redpillaudio.com with SSL enforced. There is no GitHub Pages branch, no
  CNAME file and no manual DNS step; DNS is already in place.
- Because `main` deploys automatically, do not push to `main` or merge into it
  without Jack's explicit go-ahead. Do renovation work on a branch.

## Assets
- `assets/hero.mp4` is the drone footage, played in the showroom section
  (poster: `assets/img/hero-video-poster.jpg`). The landing hero uses
  `assets/img/hero.jpg`.
- `assets/RedPill-Audio-Brochure.pdf` is both the file the "Download brochure"
  buttons link to, and the source of most product data/prices (see the Money
  section for the Q-S10 caveat).
- Product images live in `assets/img/products/<id>/` (q3, q4, q6, q-s10,
  f1-portal): `main.jpg` plus optional `gallery-1..4.jpg`. Each folder has a
  README.txt with the expected sizes. Missing gallery files are skipped
  automatically; replace images by filename, no HTML changes needed.
- The `f1-portal` folder is staged but the F1 Portal is NOT on the site: its
  shop card was removed pending certification (commit 87f8fb2). Leave the folder
  in place; do not re-add the card until Jack confirms certification.
- Internal tooling (pitch deck, the content-picker app, working notes) does not
  live in this repo; it sits in the sibling `../redpill-internal/` folder and
  must never be committed here. The relevant paths are in `.gitignore`.

## Working style
- This is an existing, working site. Finish and refine it; do not rebuild from
  scratch.
- Read the whole project before editing. Propose a short plan and wait for
  Jack's go-ahead before making large changes.
