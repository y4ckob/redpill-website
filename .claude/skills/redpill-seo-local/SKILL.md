---
name: redpill-seo-local
description: SEO plan and rules for the RedPill Audio site: local SEO for Bali, JSON-LD structured data (Organization, Product; FAQPage exists; LocalBusiness parked), per-page metadata patterns, canonicals, and sitemap/robots/404. Use for any metadata, structured-data, or discoverability work.
---

# RedPill Audio — SEO & Local Discoverability

The search opportunity is local + niche: "audio installation Bali", "speakers Bali", "sound system villa Bali", "restaurant sound system Bali", plus brand searches after showroom visits. Buyers are villa owners, F&B operators, hotel developers, architects. Content already speaks to them; the technical layer is half-finished — that's the renovation work.

## Current state (verified July 2026)

Titles and meta descriptions: present and well-written on all four pages (keep the pattern: `<Primary phrase>, Bali | <Page> | RedPill Audio`). OG/Twitter cards: present, absolute URLs to `www.redpillaudio.com`. JSON-LD: **faq.html has FAQPage markup already** — extend, don't duplicate. Missing (and in scope for the renovation): Organization markup, Product markup, `sitemap.xml`, `robots.txt`, `404.html`, canonicals. LocalBusiness markup is parked (see below); analytics is a deliberate none (see below).

## Structured data to add (JSON-LD `<script>` blocks, hand-written, validated)

1. **Every page** — `Organization`: name RedPill Audio (legalName PT Red Pill Audio), url, logo (absolute path to `logo-wordmark.png`), foundingDate 2018, contactPoint (contact@redpillaudio.com). Omit `sameAs` entirely: RedPill deliberately runs no public social profiles (decision, Jack, July 2026). Do not add an empty `sameAs` or guess URLs.
2. **index.html** — `LocalBusiness`: PARKED (decision, Jack, July 2026). Do not add it yet. LocalBusiness markup has to mirror the Google Business Profile exactly (NAP, hours, geo), and the GBP is not yet under Jack's control. Do not derive geo coordinates from a Maps link. This returns once the GBP transfer is done. When it does: subtype to pick after checking current Google guidance; Kerobokan Showroom, address Jl. Pengubengang Kauh No.88, Kerobokan, Bali; `openingHoursSpecification` Monday/Wednesday/Friday 10:00-16:00; areaServed Indonesia; geo from the GBP.
3. **shop.html** — one `Product` per speaker (Q3, Q4, Q6, Q-S10, and F1 Portal when its card lands): name, image (absolute), description (from the card copy), brand RedPill Audio, `offers` with `priceCurrency: "IDR"`, price from the card's `data-price` (single source: if prices change in HTML, JSON-LD changes in the same edit), availability InStock, `eligibleRegion`/`areaServed` Indonesia. Prices already public on the page, so marking them up is consistent; if Jack ever switches to price-on-application, drop the `offers` price rather than faking one.
4. **faq.html** — keep the existing FAQPage block; verify it still matches visible questions after any FAQ edit (Google requires parity).
5. `BreadcrumbList` only if genuinely useful (flat 4-page site — probably skip; don't add markup for markup's sake).

Validate everything with Google's Rich Results Test before committing. British English in all copy fields; no invented facts.

## Files the site needs (sitemap, robots, 404)

- `sitemap.xml` — the four public pages only (absolute `https://www.redpillaudio.com/` URLs), lastmod real. Internal pages/tools must never appear (and after housekeeping, won't be deployed at all).
- `robots.txt` — allow all, `Sitemap:` line. If internal files are still deployed when this ships, disallow them explicitly as a stopgap.
- `404.html` — Vercel serves a root `404.html` automatically for unmatched routes; brand it (dark, logo, "This page doesn't exist. The sound does." style line within voice rules, no exclamation marks) with links home/shop/contact.
- Canonical `<link rel="canonical">` on each page pointing at the live `https://www.redpillaudio.com` URL (`www` is the canonical host, matching the existing OG URLs). The domain is live on Vercel, so these are self-referential canonicals, not forward-declarations.

## Analytics

Decision (Jack, July 2026): **none**. The site runs no analytics tag of any kind, and no enquiry-event tracking. Do not add GA4, Cloudflare Web Analytics, Plausible, or any third-party measurement or session-recording script without a fresh decision from Jack. The metric that matters (enquiries) is captured server-side by the Apps Script webhook, not by page analytics.

## Local SEO beyond the site

Note to Jack in any SEO summary: a Google Business Profile for the Kerobokan showroom (matching NAP: name/address/phone exactly as on the site, same hours) plus a handful of photos does more for "audio Bali" searches than any on-page tweak. The site's job is to be consistent with it.

## Anti-patterns

Keyword stuffing (the voice rules forbid it anyway); markup for content that isn't visible; inventing review/rating markup (no AggregateRating without real collected reviews); absolute internal links for navigation (use relative paths; reserve absolute URLs for JSON-LD, canonicals, og tags and the sitemap); blocking the brochure PDF from indexing (it's a legitimate landing asset).
