---
name: redpill-enquiry-system
description: How the RedPill Audio enquiry/quotation system works — the drawer's product and project modes, webhook + email fallback, spam protection, payload contracts, and the safe-testing checklist. Use before touching the enquiry drawer, forms, basket logic, main.js submit paths, or anything commerce-related.
---

# RedPill Audio — Enquiry System

This is the site's commercial core: no online payment, ever. Visitors build an enquiry list (or describe a project) and request a quotation. The reply comes from a human. Do not add a payment gateway, checkout, or pricing calculator beyond the indicative totals that already exist.

## Architecture (all in `assets/js/main.js`)

- Config at the top of the IIFE: `ENQUIRY_EMAIL = "contact@redpillaudio.com"` and `ENQUIRY_WEBHOOK` (a Google Apps Script `/exec` URL, currently live). Submit POSTs JSON to the webhook; on failure it falls back to a pre-filled `mailto:`. Never remove the fallback.
- Basket state: localStorage `rpa_enquiry_v1`, try/catch-guarded (private-mode safe), in-memory `mem` array as source of truth: `{id, name, cat, price|null, unit, qty}`.
- Two drawer modes sharing one form: **product** (basket line items + contact) and **project** (full-install enquiry with "About the space" message). Mode switching via `data-mode` tabs updates title, submit label, and notes. Product enquiry survives while browsing project mode; `renderProjectNote()` cross-references it.
- Products are added via `.add-btn[data-id][data-name][data-cat][data-price][data-unit]` buttons — the HTML is the catalogue database. Prices in `data-price` are integer IDR; `fmtIDR()` renders dot separators. Buttons exist on both index.html (featured) and shop.html (full range) — keep the data attributes identical for the same product on both pages.

## Payload contract (Apps Script webhook — do not break)

Two payload types share the webhook, distinguished by `type`: `"product"` (line items + contact details) and `"project"` (project enquiry + message). The Apps Script on the other side (set up per `docs/ENQUIRY_FORM_SETUP.md`) routes on this field. Changing field names or types means updating the Apps Script too — flag it to Jack rather than changing the contract unilaterally.

## Trust & spam protection (present on both forms — preserve on any form work)

1. Honeypot: visually-hidden `input[name="website"]` with `tabindex="-1"`; real users never fill it.
2. Render-time check: hidden `form_render_time` set at page render; submissions arriving implausibly fast are bot-flagged server-side.
3. Required consent-ish gate: the "I am in Indonesia, purchasing for Indonesia" checkbox gates the submit button (`disabled` until checked). Supply-territory line stays visible.
4. Indicative totals only: the drawer shows line/total amounts with the standing note that amplification, DSP and installation are quoted separately; wording is settled, keep it.

## UX contracts

- Add-to-enquiry → toast confirmation ("<name> added to enquiry") with the animated EQ bars; count badge updates on every `.cart-count` instance; drawer opens on demand, not on add.
- Quantity edit and remove live in the drawer; qty 0 removes the line.
- Submit button shows a loading state during webhook POST (`setLoading`); success clears appropriately and confirms; failure falls back to mailto silently. Both paths must leave the user with a confirmation they can trust.
- Everything null-checks: pages without the drawer must not throw.

## Safe-testing checklist (the webhook is LIVE — do not spam it)

When testing enquiry flows locally:

1. Temporarily set `ENQUIRY_WEBHOOK = ""` in the local working copy (forces the mailto path) OR stub `fetch` in DevTools — never submit test payloads to the live Apps Script without Jack's OK; real enquiries land in his inbox/queue.
2. Test matrix: add/increment/remove items; qty edits; drawer mode switch with and without basket items; submit with empty basket (product mode); honeypot filled (must not send); checkbox unchecked (submit stays disabled); localStorage disabled (private mode — must degrade to in-memory); mailto fallback renders a complete, readable summary (`buildSummary()`).
3. Cross-page: basket persists index ↔ shop ↔ gallery ↔ faq; count badge correct on all four after reload.
4. Restore the real webhook URL before committing; `git diff` must show no accidental config change.

## If asked to extend

Enquiry-adjacent features that fit the model: enquiry-received auto-acknowledgement (Apps Script side), a WhatsApp-prefilled enquiry alternative, per-product "Ask about this" shortcuts. Features that do NOT fit and need Jack's explicit re-decision of the commerce model: payments, stock levels, discounts, accounts, currency switching.
