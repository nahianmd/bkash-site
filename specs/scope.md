# Scope contract — CEO demo, morning of 2026-09-17

Agreed deliverable. Anything not on this list is **deferred**, not refused.

## In scope

### Page 1 — Homepage
| # | Section | Status |
|---|---------|--------|
| 1 | Nav (3 mega-panels, mobile drawer, disabled বাংলা toggle) | rebuild |
| 2 | Hero: scroll-driven camera through the neighbourhood plate | rebuild, keep math |
| 3 | Three story holds: Customer → Agent → Merchant | rebuild + real copy |
| 4 | Collage handoff (clip-path into shard, dissolve to logo) | keep, retune |
| 5 | Phone section: 16 services, hover tooltips | rebuild, SVG icons, vendored three.js + fallback |
| 6 | Footer | rebuild |

### Page 2 — About
| # | Section | Status |
|---|---------|--------|
| 1 | Hero banner + headline | rebuild |
| 2 | Count-up stats (84M customers, 3.5L agents, merchants, products) | rebuild |
| 3 | Platform triad (Store Value / Pay & Be Paid / Empower) | rebuild |
| 4 | Investors ("Backed by the best") — 6 logos | rebuild |
| 5 | Board of Directors — 12 portraits + bio modal | rebuild |
| 6 | CEO quote — Kamal Quadir | rebuild |
| 7 | Journey Wall — horizontal scroll pan | rebuild from supplied artwork |
| 8 | Voices / testimonials — 4 | rebuild |
| 9 | Careers + Road Ahead + footer | rebuild |

## Acceptance criteria

1. Scroll holds 60fps on the demo machine through the full hero sequence.
2. No placeholder text visible anywhere.
3. Opens by double-click with networking disabled, no missing assets.
4. Phone section renders, or degrades to the static fallback with hotspots off.
5. Typography resolves to a single defined scale — no ad-hoc font sizes.
6. No horizontal overflow at the demo resolution or at 400px.

## Deferred (say yes, schedule later)

- Bangla localization
- Any additional page
- Real CMS / content wiring
- Full device matrix QA
- Public deployment

## Open

- [ ] Demo machine, screen size, GPU — determines three.js vs CSS 3D phone
- [ ] Who drives the scroll (trackpad vs wheel — changes damping)
- [ ] Content mapping: which supplied copy goes to which story hold
