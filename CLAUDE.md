# redpillaudio.com — 7.8 rebrand landing page — project context

Read this first, every session.

## What this is
RedPill Audio has rebranded to 7.8. This repo used to be the four-page RedPill
Audio product site. It is now a single static landing page at
www.redpillaudio.com that sends visitors to https://www.sevenpoint8.com/, plus
`vercel.json` 301s that move every other old URL to the new domain. It
auto-deploys to Vercel from `main` and is live with SSL enforced.

The old product site is preserved at the git tag `archive/redpill-final`. The
untracked heavy photography that used to sit in `assets/` was moved out of the
repo to the sibling folder `../redpill-assets-archive/`; it was never in git, so
the tag does not contain it.

## Tech — keep it exactly this way
- Plain HTML and CSS. No build step, no framework, no bundler, no npm at
  runtime. Vercel serves the repo as-is.
- `index.html` is the whole page and is self-contained: CSS is inline in a
  single `<style>` block, and there is **no JavaScript at all**. It must keep
  rendering fully with JS disabled. Do not add a script tag.
- It references exactly two files, `static/78-logo.png` and
  `static/bg-blur.jpg`. `static/` is the only deployed asset folder.
- Keep all file paths relative.
- There is no shared markup to sync any more, and no stylesheet to share. The
  old `assets/css/style.css` is gone; the handful of tokens the page still uses
  (`--bg`, `--text`, `--radius`, `--ease`, the Helvetica Neue stacks) are
  redeclared inline at the top of `index.html`.

## The page — hard limits
The landing page is a deliberate hard stop. It contains a logo, one `<h1>`, and
one Continue button. Do **not** add navigation, a contact block, email capture,
a close button, social links, product content, or any red accent. If asked to
extend the page, check that is really wanted before building.

## Brand voice — strict
- British English spelling throughout.
- No em dashes. Use commas, semicolons or parentheses instead.
- Matter-of-fact tone. No flattery, no marketing embellishment, no exclamation
  marks.

## Redirects
`vercel.json` 301s every path to https://www.sevenpoint8.com/ **except** `/`,
`/static/*`, `/robots.txt` and `/sitemap.xml`.

The last two exclusions matter. Vercel evaluates `redirects` before the
filesystem, so without them `robots.txt` would 301 cross-domain to a site that
is still password protected. A 401 on robots.txt makes Google treat the whole
origin as disallowed, which would block the crawl that the 301s depend on.
Never add a rule that catches the root, and never let robots.txt redirect.

`robots.txt` allows everything on purpose. Do not disallow anything: Google has
to crawl the site to see the 301s.

## SEO
- The `rel=canonical` points cross-domain at https://www.sevenpoint8.com/. That
  is deliberate, to consolidate signals on the new domain. Do not "fix" it.
- `og:url` points at `https://www.redpillaudio.com/`, this page's own URL. Only
  the canonical is cross-domain; a share of this page should still identify as
  this page. `og:image` is `https://www.redpillaudio.com/static/og-image.jpg`,
  a 1200x630 card built by `scripts/build-og-image.mjs`.
- All structured data (the Organization and FAQPage JSON-LD) has been removed.
  Do not add any back.
- `sitemap.xml` has one entry, the root.

## Analytics
None, and there never was any. This is a standing decision. Do not add GA4,
Plausible, Vercel Analytics, a Meta pixel, or any measurement or
session-recording script without a fresh decision from Jack.

## Assets
- `static/78-logo.png` is the 7.8 mark, light on transparent, 720px wide.
- `static/og-image.jpg` is the 1200x630 social card: the backdrop, the scrim and
  the mark, centred. Rebuild it with `node scripts/build-og-image.mjs`.
- `static/bg-blur.jpg` is a blurred screenshot of the old homepage, used as the
  page backdrop, with the blur baked into the file.
- `brand/` holds the 7.8 files as supplied. Kept in git for provenance,
  excluded from the deployment via `.vercelignore`.
- `scripts/` is dev-only tooling that generated `static/`. It is not a build
  step and is excluded from the deployment, along with `package.json`; that
  exclusion also stops Vercel detecting a Node project and trying to build.
- Read `scripts/build-logo.mjs` before touching the logo. Every supplied brand
  file has transparency baked down onto a checkerboard, so none can be used
  directly; the script recovers the mark from luminance.
- Internal tooling (pitch deck, content-picker app, working notes) lives in the
  sibling `../redpill-internal/` folder and must never be committed here.

Note that `docs/ENQUIRY_FORM_SETUP.md` and `RENOVATION-PROMPT.md` still describe
the old product site (the shop, the enquiry drawer, four pages). They are kept
as history only and are excluded from the deployment. Nothing in them applies.
The five `.claude/skills/` that described that site have been deleted; they are
recoverable from the `archive/redpill-final` tag.

## Deployment
Auto-deploys to Vercel on every push to `main`. Do not push to `main` or merge
into it without Jack's explicit go-ahead. Do work on a branch.

## Working style
This is a finished, deliberately minimal page. Refine it; do not rebuild it or
grow it. Propose a short plan and wait for Jack's go-ahead before large changes.
