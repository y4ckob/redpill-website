---
name: redpill-brand-and-voice
description: RedPill Audio's brand identity — copy voice rules, visual tokens, motion language, and design-polish guardrails. Use whenever writing or editing ANY customer-facing text, or making ANY visual/design change to the site.
---

# RedPill Audio — Brand & Voice

RedPill Audio (PT Red Pill Audio), est. 2018, Bali. Premium audio systems designed and built in Bali; installation for hospitality, villas and private residences, and wellness. Positioning: "true sound" — accuracy that reveals detail that has always existed but never been delivered. The specialist wellness arm is **7.8** (sevenpoint8.com).

## Voice — strict, from Jack (violations are bugs)

1. **British English** spelling throughout.
2. **No em dashes.** Use commas, semicolons or parentheses instead. (This applies to all copy on the site.)
3. Matter-of-fact tone. No flattery, no marketing embellishment, **no exclamation marks**.
4. The endorsement quotes are canon, verbatim, with these attributions: Steve Lillywhite CBE (six-time Grammy Award winning producer), Sam Fender (Mercury Prize and Brit Award winning musician), Mark Baker (Bali entrepreneur). Keep the "true sound" positioning as written.
5. Prices and specifications come from the brochure (`assets/RedPill-Audio-Brochure.pdf`) or existing asset files ONLY. Never invent, estimate or round a price or a spec. If it's unclear or missing, ask Jack before guessing.
6. Currency is IDR, dot thousand separators: `IDR 11.100.000`. "From" pricing uses "From IDR X per speaker" where a unit applies.
7. Commerce language is enquiry-based: "Add to enquiry", "Request quotation". Never "Buy", "Checkout", "Order now". No payment is taken online, ever; supply is within Indonesia only — those two sentences already exist in the drawer and stay.
8. Tone reference points from the live copy: "Sound is the differentiator." / "Every speaker has a job. The range isn't good, better, best." / "Some of our clients know exactly what they want. Others just know they want it done right. Either way, we handle it." Match this register: confident, concrete, a little dry.

## Visual identity — the tokens (from `style.css` `:root`)

Dark, refined audio-luxury with one signature red. The palette is settled; polish means using it better, not changing it:

- Surfaces: `--bg #0b0b0d`, `--bg-2 #101013`, `--surface #16161b`, `--surface-2 #1d1d23`; hairlines `--line rgba(255,255,255,.09)` / `--line-2 .16`.
- Text: `--text #f2f1ee`, `--muted #9a9aa2`, `--muted-2 #6e6e76`.
- The red: `--red #e22b25`, hover `--red-hi #ff4138`, tints `--red-soft` / `--red-glow`. Red is the ONLY accent — eyebrows, primary buttons, selection, EQ bars. Never introduce a second accent colour.
- Type: Helvetica Neue system stack for display and body (fast, appropriate); headings 600 weight, tight leading (1.04), `-0.02em` tracking; eyebrows 12px uppercase `0.32em` tracking in red. Body 17px/1.6. If a distinctive display face is ever proposed, it's a Jack decision, not a session decision.
- Texture: the fixed grain overlay (`body::before`, 3.5% opacity SVG noise) is a signature — keep it.
- `--radius: 10px`, `--hover-zoom: 1.02`, max width 1240px with fluid gutters.

## Motion language

One easing curve for the entire site: `--ease: cubic-bezier(0.16, 1, 0.3, 1)` at three speeds — `--t-fast 0.2s` (hover/press), `--t-med 0.4s` (drawer, nav, lifts), `--t-slow 0.8s` (scroll reveals, image fades). Polish adds *consistency and finish* within this system: staggered reveals, refined hover states, smoother drawer physics. It does not add: parallax, bounce/spring overshoot, auto-playing carousels, cursor effects, or a second easing curve. Scroll reveals use the existing `.reveal` mechanism; respect `prefers-reduced-motion` for anything new (and retrofit it where missing).

## Design-polish guardrails (scope: polish, not refresh — Jack's decision, July 2026)

- Same identity, sharper execution: spacing rhythm, alignment, imagery treatment, state polish (hover/focus/active), small details (scrollcue, toast EQ animation, marquee speed).
- Every visual change must survive the question: "would a returning visitor notice the site got *nicer*, or notice it *changed*?" Aim for nicer.
- Contrast floor 4.5:1 for text (muted-2 `#6e6e76` on `#0b0b0d` is borderline decorative-only; don't use it for essential copy). Focus states visible and styled. Touch targets ≥ 44px.
- Photography is dark, moody, real spaces (Bali villas, venues, the showroom). No stock-photo look, no AI-generated interiors — real installs only, from Jack.

## Facts (do not contradict; verify against pages before reusing)

Kerobokan Showroom: Jl. Pengubengang Kauh No.88, Kerobokan, Bali; open Monday, Wednesday and Friday, 10am to 4pm; visits by appointment. Ubud HQ: by appointment only. Contact: contact@redpillaudio.com; WhatsApp +31 6 19453347 (the wa.me float). Domain: www.redpillaudio.com. Products: Q3, Q4, Q6, Q-S10, F1 Portal. Environments served: villas & private residences; restaurant & F&B; hotel & resort; wellness & spa (via 7.8); performance & cultural; commercial & corporate.
