---
name: redpill-site-conventions
description: Architecture and editing conventions for the RedPill Audio static site. Use before editing ANY file in this repo — covers the no-build constraint, the file map, the shared-markup sync discipline across the four pages, JS patterns, and what must never be deployed publicly.
---

# RedPill Audio — Site Conventions

## The one constraint that rules everything

Plain HTML + CSS + vanilla JS. **No build step, no npm, no framework, no bundler, no CSS library.** The repo IS the deployed site (Vercel serves it as static files, auto-deploying from `main`). Every "wouldn't it be easier with X" answer is no. This is a deliberate, locked decision that keeps maintenance near zero.

Consequences: all paths relative (`assets/css/style.css`), which keeps the site portable; anything committed to `main` deploys straight to production at the domain root and is publicly downloadable.

## File map (reality as of July 2026)

- **Public pages (4):** `index.html` (landing), `shop.html`, `gallery.html`, `faq.html`.
- `assets/css/style.css` — ALL styling, ~1600 lines, token-driven from `:root`. One file, on purpose.
- `assets/js/main.js` — ALL behaviour, ~1000 lines, one IIFE: nav, enquiry drawer (product + project modes), quotation submit, filters, scroll reveals, lazy video, toast.
- `assets/img/products/<id>/` — `main.jpg` + optional `gallery-1..4.jpg`; ids: `q3`, `q4`, `q6`, `q-s10`, `f1-portal`. Missing gallery files are skipped automatically; replace images by filename, no HTML edits.
- `assets/hero.mp4` — 1080p30 ~23MB re-encode, lazy-loaded via `data-lazy-video` (only downloads near the showroom section). `assets/RedPill-Audio-Brochure.pdf` — the download target AND the only authoritative source of product data/prices.
- **Internal tooling that lives in the folder but must NOT ship publicly:** `content_picker_app.py`, `__pycache__/`, `.venv/`, `.content-picker-cache/`, `picks-board.html`, `review-sheet.html`, `redpill-content-picks*/`, `deck/` (pitch-deck build incl. node_modules), `FAQ_MASTER_BUILD.md`, the stray 56MB `assets/a6c1b84d….MP4`, stray photos in `assets/` root (`Q-S10.jpeg`, `Q6.jpeg`, `Q6 Side.jpeg`, `assets/img/9.jpg`), `.DS_Store`. When doing housekeeping, move internal tooling out of the deploy path (sibling folder or non-deployed location) with Jack's approval — never silently delete.

## Shared-markup sync discipline (the #1 bug source)

These blocks are hand-duplicated across **all four pages** and MUST stay identical (except the nav's active-page state): nav, footer, enquiry drawer + overlay, WhatsApp float (`.wa-float`), collaborators modal, toast, and the anti-FOUC critical `<style>` block in each `<head>` (which must also stay consistent with `style.css`).

Rule: any edit to a shared block is a **four-file edit**. Workflow: edit one page → apply to the other three → verify with `grep -c` (e.g. count `id="drawer"`, `wa-float`) and by diffing the extracted blocks. If a shared block diverges intentionally (e.g. gallery hides the drawer), record why in CLAUDE.md. Before finishing any session that touched shared markup, run the four-file diff check.

## CSS conventions

- Tokens only: colours, easing, timing, radius all come from `:root` variables (see `redpill-brand-and-voice` for the palette). Never hardcode a hex that exists as a token; never add a second easing curve — the site uses ONE curve (`--ease`) at three speeds (`--t-fast/med/slow`).
- Naming is BEM-ish (`.card__media`, `.drawer__foot`, `.env__toggle`); modifiers with `--` (`.btn--red`, `.sec--tight`). Follow it.
- New styles go in the relevant section of `style.css` (it's organised by component with banner comments). No inline `<style>` blocks beyond the existing critical-CSS heads; inline `style=""` attributes exist in places — acceptable for one-offs, but prefer classes when touching those lines anyway.

## JS conventions

- One IIFE, `"use strict"`, ES5-compatible style (`var`, `function`) — match it; don't introduce modules, classes, or a second script file.
- Behaviour is wired by **data attributes**, not ids where avoidable: `data-open-cart`, `data-close-cart`, `data-open-project`, `data-open-collab`, `data-lazy-video`, `data-mode`, and product buttons `.add-btn[data-id][data-name][data-cat][data-price][data-unit]`. New behaviour follows this pattern so markup stays declarative.
- Storage: localStorage key `rpa_enquiry_v1` (guarded try/catch for private mode). Don't add other keys without the same guards.
- Everything must degrade: webhook falls back to mailto, missing elements are null-checked, JS-off still shows content.

## Git & safety

- Branch before any multi-file change (`renovation/<topic>`); small commits, one concern each.
- The site auto-deploys to Vercel from `main`, so never push to or merge into `main` without Jack's explicit go-ahead. Do renovation work on a branch; Vercel branch previews are the safe way to review before production.
- Test locally with `python3 -m http.server` (or equivalent) from the repo root. The site is served at the domain root (no sub-path on Vercel), so local root-relative behaviour matches production.

## Docs stay true

`CLAUDE.md` and `README.md` describe the site to every future session. When reality changes (pages added, assets moved, features wired), updating those two files is part of the change, not an afterthought. Known drift to fix during renovation: CLAUDE.md says "two pages" (there are four); KICKOFF-PROMPT.md references `catalogue.html` (now `shop.html`).
