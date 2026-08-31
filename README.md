# redpillaudio.com — 7.8 rebrand landing page

RedPill Audio has rebranded to **7.8**. This repo no longer holds the RedPill
product site. It now serves one job: a single static landing page at
www.redpillaudio.com that points visitors at https://www.sevenpoint8.com/, plus
the 301s that move every other old URL to the new domain.

The previous four-page product site is preserved in git at the tag
`archive/redpill-final`.

## What is here

```
index.html      the entire landing page: one file, inline CSS, no JavaScript
static/         the only deployed asset folder
  78-logo.png     the 7.8 mark, light on transparent
  bg-blur.jpg     blurred capture of the old homepage, used as the backdrop
  og-image.jpg    1200x630 social card
  favicon-*.png   512 and 180
vercel.json     301s every path except /, /static/*, robots.txt, sitemap.xml
robots.txt      allows everything, so Google can crawl and see the 301s
sitemap.xml     one entry, the root
brand/          the 7.8 source files as supplied (kept in git, never deployed)
scripts/        dev-only tooling that generated static/ (not part of a build)
```

## Tech

Plain HTML and CSS. No build step, no framework, no npm at runtime, no
bundler. Vercel serves the repo as-is.

`index.html` is fully self-contained: its CSS is inline and it uses no
JavaScript, so it renders completely with JS disabled. It pulls exactly two
files, `static/78-logo.png` and `static/bg-blur.jpg`.

## Regenerating the assets

Only needed if the logo or the backdrop has to change. The site does not build.

```
npm install
npm run capture:bg              # rebuild static/bg-blur.jpg
node scripts/build-logo.mjs     # rebuild static/78-logo.png
node scripts/build-favicons.mjs # rebuild static/favicon-*.png
node scripts/build-og-image.mjs # rebuild static/og-image.jpg (run after capture:bg)
```

Note that `capture:bg` screenshots the live redpillaudio.com homepage. Once the
rebrand is live, that page is the landing page itself, so re-running it would
capture the wrong thing. The checked-in `static/bg-blur.jpg` is the artefact
that matters; the script is kept for provenance.

## Deployment

Auto-deploys to Vercel on every push to `main`, live at www.redpillaudio.com
with SSL enforced. Because `main` deploys automatically, do not push to or merge
into `main` without Jack's explicit go-ahead.

## Analytics

None, and there never was any. This is a deliberate standing decision. Do not
add a measurement or session-recording script without a fresh decision.
