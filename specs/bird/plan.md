# Plan: Bird — the street, seen through the mark

> Spec: `specs/sections/bird.md` (three open questions resolved 2026-09-18:
> rest pose B, the official mark, keep the split).
> Model: **Fable 5.1** — the mask, the start-scale solver, the handover.
> Written 2026-09-18 against the hero as BUILT (`a46767d`).

## What exists today

**In `web/` (hero, built):**

- `lib/hero.ts` — `coverBox()`, `poseFor()`, `camBetween()`, and inside
  `initHero()` the measure / cutout placement / focus-and-recede logic. The
  bird needs exactly that logic to pose a second scene statically at beat 3.
  It is closure-local today; task 1 extracts it.
- `components/HeroScene.astro` — the plate and three cutouts via `astro:assets`.
  Rendering it twice on one page is fine: Astro emits one set of variants.
- `lib/nav.ts` — `[data-nav-dark-end]` markers; the nav is transparent while any
  marker is below its band. The contract explicitly allows a section's
  ScrollTrigger to toggle its marker, and that is what the bird does.
- `lib/scroll.ts` — `--vh`, `reducedMotion()`, `isPhone()`, `driveSection()`.

**In `specs/refs/bkash-logo.svg`:** the official mark. Extracted 2026-09-18 —
eight triangles, three pinks, bird box 221.78 × 209.58 (aspect **1.0582**),
vertices normalised to that box:

```
f0 [.3628,.4774] [.4214,.7560] [.8047,.5507]   area 2762   #d12053
f1 [.4718,.0610] [.3629,.4774] [.8048,.5507]   area 4463   #e2136e
f2 [.0036,.0000] [.4607,.0578] [.3526,.4718]   area 4543   #d12053
f3 [.0000,.0814] [.0509,.0814] [.1937,.2746]   area  229   #9e1638
f4 [.8169,.5480] [.6841,.3535] [.8990,.3128]   area 1097   #d12053
f5 [.7947,.6050] [.8084,.5617] [.4730,.7418]   area  280   #e2136e
f6 [.3535,.4884] [.4234,.8213] [.2158,1.000]   area 1897   #9e1638
f7 [.8780,.4116] [1.000,.4094] [.9118,.3145]   area  274   #e2136e
```

`f1` and `f2` are near-equal by area and different in shape. Which one the
camera starts inside is **not** a judgement: it is whichever covers the
viewport rectangle at the smaller scale, and that depends on the screen's
aspect. The solver below picks it per viewport.

**In `reference/` (read-only):** `prototype/js/hero.js` `poses()` — the derived
start scale about a fixed point, log-space scale, position derived from scale.
Ported in spirit; the bbox-based cover there is replaced by an exact
triangle-contains-rectangle solve, because a triangle's bounding box is not the
triangle and the corners would cut into the frame.

## Approach

**Two sections, two pins, one seam that cannot show.** The bird is its own
section with its own pin and its **own copy of the scene**, posed statically at
the hero's beat 3 through the shared rig — same assets, same maths, same recede
state (plate receded, Faysal at 1). Its pinned element comes later in the DOM,
so once it pins it paints **over** the hero's; the hero's frame scrolling away
beneath is covered by identical pixels. On the way back up the bird's frame
slides over the hero's identical frame. Both directions are invisible **iff**
the two frames are pixel-identical and the mask's hole covers the viewport at
`p = 0`. Both are verified, not assumed.

**The mask is an SVG overlay, not CSS `mask-image`.** A full-viewport `<svg>`
with a white `<rect>` (`--paper`) masked by a `<mask>` containing a white rect
and the **black bird** — so the sheet is white outside the mark and transparent
inside. The bird is a `<g>` of eight `<path>`s in bird-box units (the table
above ×1000), and the per-frame write is **one `transform` attribute on that
group**: `translate(fp) scale(k) translate(−c)`. A second `<g>` with the same
eight paths as **strokes** in `--paper`, `vector-effect="non-scaling-stroke"`,
draws the facet lines at a constant 2px whatever the scale; at `p = 0` they are
off-screen because the viewport is inside one facet. CSS `mask-size`/`position`
animation would re-raster a viewport-sized layer per frame; an SVG mask of a
simple shape is what the Apple mask reveals do.

**The start facet and start scale, solved.** For a candidate facet with
vertices `v_j` and centroid `c` (bird px), and its fixed point `fp` (where `c`
lands at rest), the mark at scale `k` places the facet at `fp + k(v − c)`. The
viewport rectangle lies inside the triangle iff every corner `P` satisfies each
edge's inward half-plane: `(P − fp)·n ≤ k·((a − c)·n)` for edge `(a, b)` with
inward normal `n`. So `k_start = max over 3 edges × 4 corners of
((P − fp)·n) / ((a − c)·n)`, ×1.02 margin. Computed for `f1` and `f2` (the only
plausible ones); **the facet with the smaller `k_start` wins**, per viewport.
That is the whole "which facet" decision, and it is a formula.

**The pull-back is a pure scale about `fp`.** `k(p) = exp(lerp(ln k_start,
ln k_rest, cubicInOut(min(p / 0.8, 1))))`; the group origin is `fp − k·c`,
derived from `k`, never interpolated separately (the prototype's lesson). Hold
from 0.8 to 1. Copy resolves over 0.7 → 0.8.

**Rest pose B, by formula.** Desktop: bird height `0.58·vh`, centre `(vw/2,
0.42·vh)`. Phone: bird width `0.86·vw`, centre `(vw/2, 0.34·vh)`, never under
300px across. `k_rest` follows from the box aspect. `fp = centre_rest +
k_rest·(c − boxCentre)`. The copy block's top is written as `--bird-bottom` on
resize so it sits under the mark at any width.

**The nav turns solid when the white wins.** The bird's `[data-nav-dark-end]`
marker sits at the section's end; `bird.ts` sets `marker.hidden` when `p >
0.5` and clears it below, driven from the trigger, so it is right in both
directions (nav.ts's own escape hatch).

**Reduced motion:** the rest pose, static — scene at beat 3 under the mask at
`k_rest`, copy visible, no pin, height `--vh`.

## Motion

- **Trigger / pin:** `section.bird` (height `calc(var(--vh) × 3.5)` — 2.5
  screens of travel) pins `.bird__pin`, `start: 'top top'`, `end: 'bottom
bottom'`, `pinSpacing: false`, `id: 'bird'`. **No snap** — a single rest at
  the end of the scrub is the composed frame; snapping to it would whip two
  screens of reveal into 0.6s.
- **Scrub:** `0.6`, through a proxy timeline as in the hero.
- **Progress → pose:** phases A–E per the spec: inside (0), edges (→0.3), mark
  resolves (→0.7), settle (→0.8), hold (→1). One `transform` write on two
  `<g>`s per frame; copy opacity and rise on the front plane.
- **What does NOT move:** the scene under the mask (option a — the street
  stays); the facets relative to each other; the copy's position.

## Layout

**1920:** at `p = 0` the hero's beat-3 frame, unchanged. At rest the mark
centred, 58% of `--vh` tall, its vertical centre at 42%; beneath it the eyebrow
(`.t-eyebrow`, `--ink-3`) and headline (`.t-h1`, ink on paper — no photograph
under it, so no scrim), centred, measure by the token.

**390:** the mark at 86% of the width, centre at 34%; copy beneath, headline
one step down (`.t-h2`). The scene under it is the hero's phone slice at beat 3. Facet strokes stay 2px.

## Files to add / change

- `web/src/lib/scene-rig.ts` — **new, extracted from `hero.ts`:** `coverBox`,
  `poseFor`, `camBetween`, and `createSceneRig(scene, pin)` returning
  `{ measure(), applyCam(cam), applyFocus(p), beatCams() }`. `hero.ts` uses it;
  behaviour unchanged, re-measured to prove it.
- `web/src/lib/bird.ts` — **new:** `BIRD` config (facets, aspect, rest
  fractions, travel, phase fractions), the start solver, the trigger, per-frame
  transforms, copy, nav toggle, reduced-motion path, dev handle
  `__bkash.bird = { config, settle, goTo, start }`.
- `web/src/components/Bird.astro` — **new:** section, pin, a second
  `<HeroScene />`, the SVG overlay, the copy block, the nav marker.
- `web/src/pages/index.astro` — `<Hero /><Bird />`.
- `PROGRESS.md`, `specs/sections/bird.md` status.

## Assets

None new. The scene reuses the hero's four through `astro:assets`. The mark is
eight triangles as numbers in `bird.ts` — no image, no SVG file at runtime.

## Verification

Driven with `__bkash.driveSection('bird', p)` + `__bkash.bird.settle()` at
`p ∈ {0, 0.15, 0.3, 0.5, 0.7, 0.8, 1}`, 1920 and 390.

| Criterion                                     | How                                                                                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The still reads as a poster                   | screenshots at `p = 1`, both widths — **Nahian's eye**                                                                                                                                           |
| Opening frame == hero's last frame            | at bird `p = 0` vs hero `p = 1`: the two scene elements' `transform`, plate `opacity`/`filter`, Faysal opacity — string-equal; and no mask edge on screen (solver's `k_start` ≥ the exact bound) |
| One continuous move; grows without travelling | the group's `fp` constant across all samples; `k` monotone                                                                                                                                       |
| Facet lines arrive, never pop                 | stroke group present from `p = 0`; strokes off-screen at 0 by geometry                                                                                                                           |
| Scrub back lands on the opening frame         | `p = 0.5 → 0`: transform string equals the `p = 0` string                                                                                                                                        |
| Mark recognisable and ≥300px at 390           | rendered bird width at `p = 1`                                                                                                                                                                   |
| Copy and mark never touch                     | copy top ≥ `--bird-bottom` + gap, both widths                                                                                                                                                    |
| Hold ≈ half a screen                          | `k` unchanged from `p = 0.8` to `1`                                                                                                                                                              |
| Nav solid at rest, transparent at start       | `.is-over-dark` present at `p = 0`, absent at `p = 1`, and back again at `p = 0` after                                                                                                           |
| Reduced motion                                | emulate: no trigger, rest pose, height `== --vh`                                                                                                                                                 |
| No horizontal overflow at 390                 | `scrollWidth <= innerWidth`                                                                                                                                                                      |

## Task checklist

- [ ] **1. Extract the rig.** `scene-rig.ts`; `hero.ts` consumes it. Re-run the
      hero's six-position measurement — identical values.
- [ ] **2. Static bird.** `Bird.astro` with the second scene posed at beat 3 by
      the rig; the SVG overlay at `k_rest` (rest pose B); copy beneath;
      `index.astro` composes it. _One look, both widths:_ the poster.
- [ ] **3. The solver and the pull-back.** `k_start` per facet, pick the
      smaller; trigger, scrub, `k(p)`, the two `transform` writes; hold.
      `driveSection('bird', 0)` equals the hero's last frame — measured.
- [ ] **4. Copy, nav, fallbacks, dev.** Copy resolve over 0.7→0.8; marker
      toggle at 0.5; reduced-motion still; `__bkash.bird`.
- [ ] **5. Close out.** `PROGRESS.md`; spec → BUILT; hand to `/verify`.

## Risks

- **A visible seam at the handover** from any pixel difference — scrollbar
  width in the cover box, `--vh` written after one section measured and not
  the other, a 1px rounding in `poseFor`. _First check:_ string-compare the two
  scenes' styles at the seam; if they differ, the rig is the single place to
  fix.
- **SVG mask raster cost** at `k_start` (the mark thousands of px across).
  _First check:_ frame time while scrubbing the first 30%. Fallback: swap the
  `<mask>` for `clip-path: path(evenodd, …)` on the white sheet — same
  geometry, different raster path.
- **The solver's facet flips between `f1` and `f2` on resize** (a landscape →
  portrait rotation), which changes `fp` and the whole pose mid-section. It is
  correct behaviour; it must not animate. _First check:_ rotate a phone at
  `p = 0.5`; the pose should jump, not tween.
- **Strokes at `p ≈ 0.1`** — the first edge to enter is a single hairline
  crossing a photograph; if it reads as an artefact rather than an edge, widen
  to 3px or delay the stroke group's opacity to 0.15.
- **The copy under the mark on a short desktop window** (1280×720): 58% + copy
  may not fit. _First check:_ 1280×720; fallback: height `min(0.58·vh, …)`
  from the copy's measured height.
