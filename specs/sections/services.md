# Section 4: A thousand more stories → the phone → sixteen services

> Status: DRAFT
> Model: **Fable 5.1** to specify and to build the wall's parallax arithmetic,
> the emergence, the zoom-to-grid handover and the card; **Opus 5** for the
> grid, the copy and the picker.
> Source: Nahian, 2026-09-19, in conversation — replaces the bento entirely.
> `specs/design-language.md`. Rewritten still-first the same day.
> Supersedes `phone-bento.md` and `phone-services.md` (kept as the record of
> what was approved on 2026-09-17: the tile-becomes-device emergence and the
> click-to-lock selection survive; everything else here is new).

## Job

After three named people, **a thousand more**. A full-width wall of real
photographs — bKash in a thousand lives — scrolling in depth while the frame
holds. Out of that wall a tile rises, becomes the phone, and the camera pushes
through its screen into the sixteen services: a grid you can touch, and a 3D
card that flips to whichever one you pick. Proof of scale, then the product.

Documentary register throughout (Rule 1). The last section before the footer.

## Decisions (Nahian, 2026-09-19)

Pinterest-style masonry, **full viewport width, not the container**. Title as
a tile in the wall: _A thousand more stories_. No captions on photographs.
Photographs **repeated at different crops for now** — a request for more goes
to the client. Column rates 0.85 / 1.0 / 1.15 — a recorded exception to the
plane tokens, because here the motion is the content, not a depth cue. Then:
the phone tile slides up from beneath as part of the parallax, becomes the
phone, the camera zooms _past_ the phone into the grid, selection is a state
(not a section), the grid rests on white, copy is placeholder, the label is
**NGO** (the app's word; the icon file is `Microfinance.svg`).

## The stills

### Still A — the wall (1920)

Full-bleed, dark ground. **Four columns**, one gap token, edge to edge. Tiles
at **varied crops** — tall (4:5), square, wide (3:2) — chosen per photograph
so the subject sits right; that variety is the masonry's rhythm. One
**typographic tile**, paper on the dark, carries the title and the line:

> A thousand more stories
> 85 million of them, actually.

The phone tile is below the fold at pin start — it is not in Still A. At
390: **two columns**, same rules.

### Still B — the phone (1920)

Face-on, centred, ~90% of `--vh` tall, bezel and notch present, the home
screen with sixteen services legible. The wall tipped back and receded behind
it, nearly gone. At 390: 92% of the width, bezel visible — the handset frames
the bKash phone.

### Still C — the grid (1920)

White ground. **Sixteen tiles, 4×4, in the app's order**, real SVG icons,
real labels beneath, spanning the content width (capped at 56rem so it is a
grid, not a wall). Nothing selected — for about half a second. At 390: four
across, ~85px tiles, full width minus gutters.

### Still D — one service (1920) — the resting still

**Stage left, grid right.** A 3D square card, ~24rem, the service's icon on
its face, breathing a few degrees; beneath it the title (`.t-h1`) and one
line (`.t-lead`). On the right the grid, compacted (~4.5rem tiles), the chosen
one full and the other fifteen receded (Rule 4). At 390: the card on top
(~60% width), title and line beneath, and the sixteen as a **horizontal
picker strip** — 56px icons, snap to item, the chosen one centred.

## Motion — one pin, one scrub

| Phase           | Progress    | What happens                                                                                                                                                                                                                                                      |
| --------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wall            | 0 → 0.40    | Columns rise at 0.85 / 1.0 / 1.15 of the scroll (outer two share a rate). The phone tile, last in a fast column, rises into view from below.                                                                                                                      |
| Arrival         | 0.40 → 0.50 | The phone tile reaches centre; the wall **holds**. The arrival is a landing, not a pass-through.                                                                                                                                                                  |
| Emergence       | 0.50 → 0.65 | The tile becomes the device — already phone-aspect, so it is one transform: scale and translate from the tile's rect to Rest B; bezel and notch fade in — while the wall tips back as one plane and recedes.                                                      |
| Rest B          | 0.65 → 0.70 | Hold.                                                                                                                                                                                                                                                             |
| Zoom to grid    | 0.70 → 0.90 | The camera pushes into the screen until the 4×4 icon block lands **exactly under the real grid's tiles** (computed — the real grid defines the zoom's end); the real tiles fade up over the screenshot's icons, the screenshot fades out, the ground turns white. |
| Grid, then card | 0.90 → 1    | Rest C, then after ~0.5s the first service auto-selects: the grid compacts, the card flips in. Hold.                                                                                                                                                              |

Selection thereafter is interaction, not scroll: click a tile (desktop) or
tap/swipe the strip (mobile) and the card **flips** — 180° on its vertical
axis, the new icon on the far face — and the copy crosses over. The flip is
the swap: one animation for any pair.

**What does not move:** the frame, once pinned; the tiles relative to their
column; the sixteen relative to each other in either layout.

**The phone's arrival is computed.** Its column's rate and its offset in the
column are known, so the progress at which its centre reaches the viewport
centre is `p_arrive = (tileOffset − target) / (rate × travel)`. No tuning.

**The zoom's end is computed.** The screenshot's icon block has a 25% column
pitch and a 13.9%-of-screen-height row pitch; the real grid is built with the
same pitch ratio, so one scale and one translate land every icon under its
tile.

### Reduced motion

The wall static with the phone tile in place; beneath it, in flow, the grid
with the first card selected. No pin. Everything readable.

## Depth (Rule 2)

The wall's three column rates _are_ the planes — the recorded exception.
After the wall recedes: ground / device / the grid; then ground / grid / card.
The card is real 3D (perspective, `preserve-3d`, two faces).

## Content slots

| Slot             | Content                                                                                                | Status                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Wall photographs | the six ex-bento, the three people portraits, the About banner — at varied crops, **repeated** to fill | **DOCUMENTARY, REPEATED** — placeholder density; ~20 more requested |
| Title tile       | `A thousand more stories` / `85 million of them, actually.`                                            | **PLACEHOLDER** (the figure is the deck's)                          |
| Home screen      | `phone-screen.jpg`, 720×4730                                                                           | **REAL** app UI                                                     |
| Sixteen icons    | `reference/assets/img/*.svg`                                                                           | **REAL** — client SVGs                                              |
| Sixteen names    | the app's order and words; `NGO`                                                                       | **APP**                                                             |
| Sixteen lines    | one each                                                                                               | **PLACEHOLDER**                                                     |

## Audit rows closed

P1 (width by formula, full-bleed) · P2 (one transform for the emergence — the
tile is phone-aspect already) · P3 · P4 · P5 · P6 (mobile has its own wall) ·
P7 (bezel at 92%) · P8 (no panel over icons — no panel) · P9 (no dead column).

## Acceptance

- [ ] Stills A, B, C and D each read as composed at 1920 and 390 with motion
      off. **Nahian's eye.**
- [ ] The wall spans the full viewport width at every width; no side margins.
- [ ] Three column rates, measured; the outer columns share one.
- [ ] The phone tile is below the fold at `p = 0` and its centre is within
      2% of the viewport centre at `p_arrive`, both widths — computed, then
      measured.
- [ ] The wall is motionless from arrival to the end of the emergence.
- [ ] The emergence is one transform per frame on the device; bezel and
      notch fade in; the wall recedes as one plane.
- [ ] At the zoom's end every real tile's centre is within 3px of its
      screenshot icon's centre before the crossfade.
- [ ] Rest C shows sixteen tiles, real icons, in the app's order; then the
      first service auto-selects within a second.
- [ ] Selecting flips the card exactly once; the far face carries the new
      icon; the copy crosses over; the grid's chosen tile is full, fifteen
      receded.
- [ ] At 390 the strip snaps to items and a swipe flips the card.
- [ ] No horizontal overflow at 390 (the strip scrolls inside itself).
- [ ] Reduced motion: wall static, grid and card in flow, all usable.

## Explicitly NOT this

- **NOT a bento** — no module grid, no container width, no captions on tiles.
- **NOT cards falling individually.** The wall tips back as one plane.
- **NOT the phone changing aspect as it emerges.** The tile is phone-aspect.
- **NOT icons flying out of the phone to a grid beside it.** The camera goes
  _through_ the screen; the grid is what is left.
- **NOT hotspots on a screenshot, and NOT a side panel.**
- **NOT a decorative rotation.** The flip is the swap; the idle breath is a
  few degrees.
- **NOT a detail section below.** Selection is a state inside the pin.
- **NOT rendered imagery** anywhere here (Rule 1).

## Open questions

1. **Twenty more photographs** — the wall's density is gated on the client.
2. **The sixteen lines** — placeholder until the client's.
