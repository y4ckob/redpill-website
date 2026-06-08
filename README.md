# RedPill Audio — website

Static site (landing + shop) for GitHub Pages, ready to point at redpillaudio.com.

## Structure

```
index.html            Landing page (hero, range, showroom, contact)
shop.html             Product shop + enquiry basket (product and project modes)
CNAME                 Custom domain (edit before going live)
.nojekyll             Tells GitHub Pages to serve files as-is
docs/ENQUIRY_FORM_SETUP.md   Google Apps Script webhook setup (one-off)
assets/
  css/style.css       All styling
  js/main.js          Nav, enquiry drawer, request-quote, filters
  hero.mp4            Drone footage (showroom section video)
  RedPill-Audio-Brochure.pdf   Brochure (download buttons + product data source)
  img/
    hero.jpg          Landing hero background
    hero-video-poster.jpg   Still shown before the showroom video loads
    showroom.jpg      Showroom section image
    logo-mark.png, logo-wordmark.png
    partners/         Collaborator logos
    products/<id>/    main.jpg + optional gallery-1..4.jpg per product
                      (q3, q4, q6, q-s10, f1-portal; see the README.txt
                      in each folder for sizes)
```

### Updating images

Drop replacements into the matching folder using the same filenames; no HTML
changes needed. Product cards use `products/<id>/main.jpg` (4:3 landscape) and
show any `gallery-1.jpg` to `gallery-4.jpg` (square) that exist; missing
gallery files are skipped automatically.

## Step 1 — Host temporarily on GitHub Pages

1. Create a new repo (e.g. `redpill-website`) on github.com/y4ckob.
2. Upload everything in this folder (or `git push`) to the `main` branch.
3. Repo **Settings -> Pages**: set **Source = Deploy from a branch**, branch
   `main`, folder `/ (root)`. Save.
4. After a minute the site is live at:
   `https://y4ckob.github.io/redpill-website/`

All paths are relative, so it works at this sub-path and at the root domain
without changes.

## Step 2 — Switch to redpillaudio.com

The current site appears to be hosted elsewhere (Next.js). Moving the domain to
GitHub Pages means repointing DNS, so do this when you are ready to cut over.

1. Edit the `CNAME` file so it contains only your chosen domain, e.g.
   `www.redpillaudio.com` (or `redpillaudio.com` for the apex). Commit it.
2. Repo **Settings -> Pages -> Custom domain**: enter the same domain, save.
3. At your DNS provider (Cloudflare, per your other setup):
   - For **www**: add a `CNAME` record `www -> y4ckob.github.io`.
   - For the **apex** `redpillaudio.com`: add four `A` records pointing to
     GitHub Pages IPs `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153` (or use Cloudflare's CNAME
     flattening to `y4ckob.github.io`).
   - If using Cloudflare proxy, set SSL/TLS mode to **Full**.
4. Back in **Settings -> Pages**, tick **Enforce HTTPS** once the certificate
   has issued (can take up to an hour).

Until DNS is changed, the live site stays where it is; nothing breaks.

## Enquiry basket / quotations

No payment is taken. Visitors add items to an enquiry list (stored in the
browser) and tap **Request quotation**, which opens a pre-filled email to
`contact@redpillaudio.com` listing the items.

To capture enquiries server-side instead (like the F'n'B RSVP queue), open
`assets/js/main.js` and set:

```js
var ENQUIRY_WEBHOOK = "https://script.google.com/macros/s/XXXX/exec";
```

The drawer will then POST JSON to that URL, falling back to email if the
request fails. Two payload types share the webhook: `type: "product"`
(basket line items + contact details) and `type: "project"` (full-install
enquiry with an "About the space" message). Change `ENQUIRY_EMAIL` in the
same file to redirect the email fallback.

## Before going live

- Deploy the enquiry webhook (`docs/ENQUIRY_FORM_SETUP.md`) and paste the URL
  into `ENQUIRY_WEBHOOK` in `assets/js/main.js`. Until then the form falls
  back to email.
- `assets/hero.mp4` is a quality re-encode (1080p30, ~23 MB) of the original
  drone footage and is lazy-loaded; it only downloads when the visitor
  scrolls near the showroom section.
