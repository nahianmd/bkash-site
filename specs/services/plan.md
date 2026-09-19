# Plan: A thousand more stories → the phone → sixteen services

> Spec: `specs/sections/services.md` (2026-09-19). Model: **Fable 5.1** for
> the wall arithmetic, the emergence, the zoom handover and the card; Opus
> for the rest. Written against hero + bird as BUILT (`18684cf`).

## What exists today

- `lib/scroll.ts`, `lib/scene-rig.ts` (cubicInOut, camBetween), tokens
  (`--plane-*`, recede set, `--nav-h`, `--vh`), `.is-receded`, `.on-photo`.
- `reference/prototype/js/phone.js` — the derived hotspot geometry (COLS
  12.5/37.5/62.5/87.5%, ROWS 26.3/40.3/54.2/68.1% of the screen box), the
  tile→device idea, and the rigid-plane fall (`rotateX` about the bottom
  edge, `translateZ` back). The six layout writes per frame do **not** port.
- Assets: `reference/assets/img/bento/*.jpg` (6), `people/*.jpg` (3),
  `about/banner.jpg`, `phone-screen.jpg` (720×4730), sixteen SVG icons.

## Approach

**The wall is columns translated by scroll.** Each column is a flex column of
tiles taller than the viewport; per frame, `translateY(−p × rate × travel)`
on the column — three rates, one transform each. The phone tile is the last
tile of the fastest column with a known offset, so `p_arrive` is arithmetic.
A plateau after arrival: the columns' progress input is `min(p, p_arrive)`
mapped so the wall freezes from 0.40.

**The emergence is one transform.** The phone tile is phone-aspect in the
wall (its height set from its width × 760/360). The device element is a
sibling of the wall at its Rest-B size, positioned by `transform` to coincide
with the tile's rect at arrival (measured once per resize: the tile's rect at
`p_arrive` is derivable — column offset − rate × travel × p_arrive). From
0.50 → 0.65 the transform interpolates to identity (centre, Rest B); bezel and
notch opacity rise; the wall gets `rotateX` + `translateZ` + opacity as one
plane. The tile itself is hidden the instant the device takes over.

**The zoom lands on the real grid by construction.** The real grid (4 columns,
content width `min(vw − 2g, 56rem)`) has column pitch `P = W/4`; its row pitch
is `P × 1.173` (the screenshot's 13.9%×760 / 25%×360). The device's screen
box at Rest B has width `S`; icon columns at 12.5%…87.5% of `S`, so the
screenshot pitch is `0.25S`. Zoom end scale `s = P / (0.25 S)` relative to
Rest B, and a translate that puts the block's centre on the grid's centre.
Then the real tiles fade up 0.85 → 0.90 over their screenshot twins and the
screenshot fades out. Measured: tile centres within 3px.

**States C and D are CSS states on the real grid.** `.is-detail` on the
section: desktop — the grid container gets `transform: translate(...) scale(0.38)`
to the right (one transform, tiles keep layout) and the card stage shows
left; mobile — the grid re-lays as a horizontal snap strip and the card sits
above. The card: `perspective` on the stage, `preserve-3d` on the card, two
faces; select = put the new icon on the hidden face, toggle the rotation
(`rotateY(0|180)`), swap copy at the midpoint; idle = a slow ±4° keyframe on a
wrapper so it never fights the flip.

**Auto-select** on the first frame where `p ≥ 0.9`, once, after 500ms, if
nothing is selected.

## Files

- `web/src/assets/img/services/` — the ten photographs (copied), the home
  screen, `icons/*.svg`.
- `web/src/components/Services.astro` — section, pin, wall (columns + tiles +
  title tile + phone tile), device, real grid, stage (card + copy), strip;
  scoped CSS; module script.
- `web/src/lib/services.ts` — `SERVICES` data (16), `WALL` config (rates,
  tiles per column, crops), the scrub render, arrival/zoom arithmetic, the
  selection state machine, dev handle `__bkash.services`.
- `web/src/pages/index.astro` — `<Services />` after `<Bird />`.

## Motion config

`travelScreens: 5.5`, phases as in the spec, `rates: [0.85, 1.0, 1.15]`,
`scrub: 0.6`, no snap.

## Verification

Driven with `__bkash.driveSection('services', p)` + `__bkash.services.settle()`.
Rows map 1:1 to the spec's acceptance list; the arrival and zoom rows are
measured against the computed values.

## Tasks

- [ ] **1. Assets + the wall still.** Photos, icons, screen; `Services.astro`
      with the columns, varied crops, the title tile, the phone tile
      (phone-aspect); full-bleed; `index.astro`. Build. _One look, both widths._
- [ ] **2. Parallax + arrival.** `services.ts`: rates, travel, `p_arrive`
      computed, plateau. Measured: tile centre at viewport centre at `p_arrive`.
- [ ] **3. Emergence.** Device element, one transform from the tile rect to
      Rest B, bezel/notch, wall recedes as one plane. Measured.
- [ ] **4. Zoom to grid.** Real grid built; zoom end computed from it; the
      overlay tiles fade up; the screenshot out; white ground. Measured: 3px.
- [ ] **5. Card and states.** Stage, flip, copy, compact grid / strip,
      auto-select, recede. Reduced-motion flow layout.
- [ ] **6. Close out.** PROGRESS, spec BUILT, hand to `/verify`.

## Risks

- **Six photographs in four columns is sparse.** Repeats at different crops
  are the stopgap; the client request is the fix. _First check:_ Still A at
  1920 — if a repeat is adjacent to itself, reorder.
- **The device's transform origin and the tile's rounded corners** during the
  emergence — a scale from a small rect to a large one keeps radius in px, so
  the tile's radius must be set on the device at rest and scaled with it.
- **The zoom-to-grid coincidence** depends on the screenshot's pitch ratio
  1.173; if the real grid's label height changes the row pitch, the constant
  is derived from the grid, not typed. _First check:_ the 3px row.
- **Mobile strip vs `overflow-x: hidden` on body** — the strip scrolls inside
  its own box; verify `scrollWidth` on the document stays ≤ width.
