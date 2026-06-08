# Kickoff prompt

Paste the block below as your first message to Claude Code, after you have put
your assets into the folder (brochure, drone footage, product images).

---

Read this whole project before changing anything: CLAUDE.md, README.md,
index.html, catalogue.html, assets/css/style.css, assets/js/main.js, and every
file in assets/, including the brochure PDF and all the images.

This is an existing, working static site. Your job is to finish it with my real
assets, not to rebuild it. Keep the existing design system, page structure and
brand voice (all set out in CLAUDE.md).

Before you edit anything, give me a short plan covering:

1. The products you found in the brochure: for each one, the name, a short
   matter-of-fact description, any spec highlights, the price in IDR, and which
   image file in assets/img/ matches it. Flag anything missing or ambiguous.
2. Which image maps to the hero, the showroom section, and each product card.
3. A recommendation on how to show pricing: exact prices, "from" prices, or
   price on application, with one line of reasoning. Wait for my decision on
   this before wiring any prices into the catalogue.

Once I confirm the plan:

- Replace the placeholder product cards in catalogue.html with the real range
  from the brochure, and update the three featured cards on index.html to match.
- Put each product image into its card. Put the drone footage into the hero, and
  either reuse it for the showroom section or use a separate clip if I give you
  one. Confirm the brochure download button points at the PDF.
- Ask me for the Kerobokan street address and confirm the Ubud line, then fill
  them in (search for [Street address] in index.html).
- If we decide to show prices, show indicative line and total amounts in the
  enquiry drawer, formatted in IDR with dot separators, and keep checkout as
  "Request quotation". Do not add any payment system.

Do not deploy yet. When the site looks right locally, tell me and we will set up
GitHub Pages and the domain together, step by step.

Start now by reading everything, then give me the plan. Do not edit yet.
