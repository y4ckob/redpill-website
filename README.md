# RedPill Audio — website

Static marketing site (plain HTML, CSS and vanilla JavaScript, no build step).
Auto-deploys to Vercel from `main`; live at www.redpillaudio.com.

## Structure

```
index.html            Landing page (hero, range, showroom, contact)
shop.html             Product shop + enquiry basket (product and project modes)
gallery.html          Installation portfolio grid
faq.html              Frequently asked questions (with FAQPage structured data)
sitemap.xml           Public pages, for search engines
robots.txt            Crawl rules + sitemap pointer
404.html              Branded not-found page
docs/ENQUIRY_FORM_SETUP.md   Google Apps Script webhook setup (one-off)
.claude/skills/       Project skills (authoritative build/brand/SEO conventions)
assets/
  css/style.css       All styling
  js/main.js          Nav, enquiry drawer, request-quote, filters, reveals
  hero.mp4            Drone footage (showroom section video)
  RedPill-Audio-Brochure.pdf   Brochure (download buttons + product data source)
  img/
    hero.jpg          Landing hero background
    hero-video-poster.jpg   Still shown before the showroom video loads
    shop-hero.jpg     Shop header background
    logo-mark.png, logo-wordmark.png
    partners/         Collaborator logos
    gallery/web/      Web-optimised portfolio images (grid + -lg full size)
    products/<id>/    main.jpg + optional gallery-1..4.jpg per product
                      (q3, q4, q6, q-s10, f1-portal; see the README.txt
                      in each folder for sizes)
```

Note: `sitemap.xml`, `robots.txt` and `404.html` are added in this
renovation; the lines above describe the intended final structure.

### Updating images

Drop replacements into the matching folder using the same filenames; no HTML
changes needed. Product cards use `products/<id>/main.jpg` (4:3 landscape) and
show any `gallery-1.jpg` to `gallery-4.jpg` (square) that exist; missing
gallery files are skipped automatically.

## Deployment

The site is hosted on Vercel and deploys automatically on every push to the
`main` branch. It is live at www.redpillaudio.com with SSL enforced. DNS is
already in place; there is no GitHub Pages branch, no `CNAME` file and no manual
DNS step.

Because `main` deploys straight to production, do renovation work on a branch
and do not push to or merge into `main` without Jack's explicit go-ahead. Branch
previews on Vercel are a safe way to review changes before they reach the live
domain.

Local preview while working:

```
python3 -m http.server
```

from the repo root, then open `http://localhost:8000/`. All paths are relative,
so what you see locally matches production.

## Enquiry basket / quotations

No payment is taken. Visitors add items to an enquiry list (stored in the
browser) and tap **Request quotation**. The drawer POSTs JSON to a live Google
Apps Script webhook (`ENQUIRY_WEBHOOK` in `assets/js/main.js`), which logs the
enquiry to a Google Sheet and emails a copy; if the request fails it falls back
to a pre-filled email to `contact@redpillaudio.com`. The webhook itself is set
up per `docs/ENQUIRY_FORM_SETUP.md`.

Two payload types share the webhook: `type: "product"` (basket line items +
contact details) and `type: "project"` (full-install enquiry with an "About the
space" message). Change `ENQUIRY_EMAIL` in the same file to redirect the email
fallback. The webhook is LIVE, so do not submit test enquiries to it; see the
redpill-enquiry-system skill for the safe-testing procedure.

## Notes

- `assets/hero.mp4` is a quality re-encode (1080p30, ~23 MB) of the original
  drone footage and is lazy-loaded; it only downloads when the visitor
  scrolls near the showroom section.
