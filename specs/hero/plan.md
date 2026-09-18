# Plan: Hero — one camera through one street

> Spec: `specs/sections/hero.md` (all five open questions resolved 2026-09-18).
> Model: **Fable 5.1** — the camera, the cover-box anchoring, the focus scrub.
> Written 2026-09-18 against foundation as BUILT (`1b77796`).

## What exists today

**In `web/` (foundation, built):**

- `styles/tokens.css` — `--vh`, `--nav-h`, plane rates (`--plane-back/mid/front`
  0.94 / 1 / 1.06), the scrim (`--scrim*`, derived to pass 4.5:1 on white), the
  recede set (`--recede-opacity 0.45`, `-saturate 0.72`, `-brightness 0.82`),
  type steps `.t-hero` (41→68px, measure 18ch), `.t-h2`, `.t-lead`, `.t-eyebrow`.
- `styles/base.css` — `.on-photo` (the only way text sits on an image; apply to
  the **text block**), `.is-receded` (class form; scrubbed use writes the values
  per frame instead), `[data-reveal]`.
- `lib/scroll.ts` — ScrollTrigger registered, `--vh` kept truthful,
  `reducedMotion()`, `isPhone()`, `__bkash.driveSection(id, p)` in dev.
- `lib/nav.ts` + `Nav.astro` — the nav goes transparent over a section that
  places a zero-height `[data-nav-dark-end]` marker at the end of its dark
  region, and carries its own 50% top scrim while transparent.
- `styles/README.md` — images through `astro:assets` (never `public/`), one
  `loading="eager" fetchpriority="high"` per page (the hero plate), per-section
  constants as one exported config object.
- `astro.config.mjs` — image breakpoints `390…2560`, `responsiveStyles: true`.

**In `reference/` (read-only):**

- `prototype/js/hero.js` — the camera formula
  `translate3d((50 − x·s)%, (50 − y·s)%) scale(s)` with `transform-origin: 0 0`
  (ports, generalised — see Approach), the **log-space scale** interpolation,
  the cubic ease, the per-frame **cover clamp** (`50/s ≤ cx ≤ 100 − 50/s`),
  and the `nudge()` dev helper. Everything about wheel interception,
  `touch-action`, the stepper and `anchorPortrait()` does **not** port.
- `assets/img/hero.jpeg` 1600×893, `amena.png` 1008×1236, `Rahim.png`
  1600×1277, `Faysal.png` 1546×1600 — the four illustrated assets.

**What looks reusable and is not:** the prototype's `SCENE` camera targets.
They were framed by eye to a different photograph. The new starting values are
in the spec and are re-set by eye in task 2.

## Approach

**The scene is the plate's cover box, not the viewport.** This is the fix the
spec asks for ("anchor the cutouts to the plate's rendered box, not the
viewport"). Once per resize, compute how a 1600×893 image cover-fits the
viewport — scale `k = max(vw/1600, vh/893)`, box `1600k × 893k`, offset
`(vw − 1600k) × fx` horizontally (`fx = 0.5` desktop, `0.46` phone — the
spec's chosen slice) and centred vertically. The scene element **is that box**;
the plate fills it; each cutout is positioned as **fractions of that box**. The
camera targets are authored as fractions of the plate, and now the box and the
plate are the same coordinate system at every aspect. One image, every screen.

**The camera is solved in pixels.** The prototype's percent formula assumed
scene = viewport. Generalised: to put plate point `(cx, cy)` at viewport centre
at scale `s`, the scene's translate is
`tx = vw/2 − ox − s·cx·W`, `ty = vh/2 − oy − s·cy·H` (box `W×H`, offset
`ox, oy`), applied as `translate3d(tx, ty, 0) scale(s)` with origin `0 0`. The
cover clamp becomes a clamp on the translate itself —
`tx ∈ [vw − ox − s·W, −ox]`, same vertically — which is cleaner than the
prototype's and holds for any box. **One transform write per frame on one
element.**

**Cutouts are beat-local detail layers, not permanent overlays.** The plate
already contains all three figures, drawn small. A hi-res cutout laid
permanently over its drawn figure risks a visible double wherever the match is
imperfect. Instead each cutout's opacity **is its beat's focus** — invisible at
beat 0 (the still is just the plate), fading up as the camera approaches, full
at the beat, fading out as the camera leaves. The crossfade between two
subjects happens at the midpoint, which is exactly the spec's "recede crosses
mid-travel" criterion.

**Focus is a tent per beat.** With four beats over progress `p ∈ [0,1]`,
`focus_i = clamp(1 − |3p − i|, 0, 1)` for `i = 1..3`. The subject cutout's
opacity is `focus_i`; the plate's recede amount is `r = Σ focus_i` (never more
than 1). Recede is written per frame from the token values read once at init:
`opacity = 1 − r(1 − 0.45)`, `filter = saturate(1 − r(1 − 0.72))
brightness(1 − r(1 − 0.82))`. No blur, ever — base.css's own rule. The plate
dimming _is_ the other two receding: they are drawn in it.

**Captions ride the same focus.** Each beat's caption block is `.on-photo`
(bottom-left), with `opacity = focus_i` and a 12px rise `(1 − focus_i)`. The
beat-0 headline (bottom-right desktop, bottom third phone) is
`opacity = 1 − focus_1`.

**Depth (Rule 2), zero at every beat.** The cutout plane leads the plate by
`(--plane-front − 1) × Δt_segment × 4f(1−f)` where `f` is the fractional
progress within the current segment — a small lead that peaks mid-travel and is
**exactly zero at each beat**, so the cutout always lands on its drawn figure.
One config flag turns it off.

**Snap keeps composed frames without stealing the gesture.** ScrollTrigger
`snap` to `[0, ⅓, ⅔, 1]` on scroll-end, `scrub: 0.6` for a little damping. The
scrollbar moves the whole way.

**The nav goes transparent over the hero** by placing `[data-nav-dark-end]`
at the section's end. The plate's top is bright sky; the nav's own 50% scrim is
the ground. Contrast is measured in verify (risk below); the fallback is to omit
the marker and keep the nav solid.

**Reduced motion and no-JS render the beat-0 still**, section height `--vh`,
no trigger, no cutouts, headline visible.

**The handover contract with the bird.** The scene is its own component,
`HeroScene.astro`, rendering the plate and cutouts through `astro:assets`, and
`lib/hero.ts` exports `poseFor(cam, box, viewport)`. The bird section renders
the same `HeroScene` **statically at beat 3's pose** as the content under its
mask — same assets, same maths, same pixels. That is what makes the handover
exact by construction.

## Motion

- **Trigger / pin:** `section.hero` (height `calc(var(--vh) × 4)`) pins
  `.hero__pin` (height `var(--vh)`), `start: 'top top'`, `end: 'bottom bottom'`,
  `pinSpacing: false`, `id: 'hero'`.
- **Scrub:** `0.6`.
- **Snap:** `snapTo: [0, 1/3, 2/3, 1]`, `duration: { min: 0.2, max: 0.6 }`,
  `ease: 'power2.inOut'`.
- **Progress → pose:** segment `i = floor(3p)`, `f = 3p − i`, eased
  `e = cubicInOut(f)`; `x, y` linear in `e`; `s` in **log space**:
  `exp(lerp(ln s_i, ln s_{i+1}, e^0.86))` (the prototype's exponent, kept).
  Then solve translate, clamp for cover, write.
- **What does NOT move:** the cutouts relative to the plate (at every beat,
  exactly; in between, by the zero-at-beats lead only). The captions' position.

## Layout

**1920.** Beat 0: plate full-bleed (cover, `fx = 0.5`), all three figures
drawn in it, no cutouts. `.hero__open` bottom-right: `.t-eyebrow`? no —
headline `.t-hero` + line `.t-lead`, on `.on-photo`, then the scroll cue
(`.t-sm`). Beats 1–3: `.hero__cap` bottom-left on `.on-photo`: eyebrow
(`.t-eyebrow`, **in `--scrim-ink`, not pink** — pink on the 62% scrim measures
~1.7:1, which is H4 again), headline `.t-h2`, line `.t-lead`. Camera per the
spec's table, re-set by eye.

**390.** Same plate, `fx = 0.46`. Headline bottom third; the camera's `cy`
per beat is lifted by `phoneCyLift` (0.08, by eye) so the subject sits in the
middle third above the caption. Captions at `.t-h2`'s 390 size (28px) inside
the gutter; measure holds by the token. Nav marker unchanged; `--nav-h` is
irrelevant to a full-bleed plate.

## Files to add / change

- `web/src/assets/img/hero/plate.jpg`, `amena.png`, `rahim.png`, `faysal.png`
  — copied from `reference/assets/img/` (the reference stays untouched).
- `web/src/components/HeroScene.astro` — **new.** The plate + three cutouts via
  `astro:assets` (`<Picture formats={['avif','webp']} layout="none">` — the
  camera sizes them, not Astro), positioned as fractions of the box. Used by
  the hero (animated) and later by the bird (static).
- `web/src/components/Hero.astro` — **new.** Section, pin, `HeroScene`, chrome
  (headline, three captions, scroll cue), the nav marker; scoped CSS; a module
  script that calls `initHero()`.
- `web/src/lib/hero.ts` — **new.** `HERO` config object; cover-box maths;
  `poseFor()`; focus/recede/caption scrub; ScrollTrigger; reduced-motion path;
  dev handle `__bkash.hero = { goTo, nudge, values, config }`.
- `web/src/pages/index.astro` — compose `<Hero />` above a short placeholder for
  the sections still to come.
- `PROGRESS.md`, `specs/sections/hero.md` status.

## Assets

Through `astro:assets` from `src/assets/img/hero/`. The plate is the page's one
`loading="eager" fetchpriority="high"` image; `widths` up to its intrinsic
1600 (nothing to gain above it — spec: build at current resolution, upscale as
a later pass). Cutouts keep alpha: AVIF and WebP both carry it; if an AVIF
alpha edge artefacts on the painted outline, drop to WebP only for the
cutouts. Nothing here is the 6000×4000 merchant frame — that stays in the
services section.

## Verification

Driven with `__bkash.driveSection('hero', p)` at `p ∈ {0, ⅙, ⅓, ½, ⅔, ⅚, 1}`,
1920 and 390.

| Criterion                                                  | How                                                                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Each beat reads as a composed still                        | screenshots at `p = 0, ⅓, ⅔, 1`, motion disabled — **Nahian's eye**                                           |
| Captions ≥ 4.5:1                                           | sample the pixels behind each `.on-photo` block at its beat, both widths                                      |
| Non-subjects receded, subject not                          | at `p = ⅓`: plate `opacity/filter` equal the token-derived values with `r = 1`; the Amena cutout at opacity 1 |
| Recede crosses mid-travel                                  | at `p = ½`: Amena and Rahim cutouts both at opacity 0.5, plate `r = 1`                                        |
| 390: copy and person in different thirds                   | bounding boxes of `.hero__cap` and the focused cutout at each beat                                            |
| Scrollbar continuous; forward/back land on the same frames | `driveSection` to each beat from both directions; compare the scene transform strings                         |
| Scene covers the viewport at every `p`                     | scene bbox ⊇ viewport at all seven samples, both widths                                                       |
| Feet on the ground line                                    | screenshot each beat at 390, 768, 1280, 1920 — **Nahian's eye** with `nudge()`                                |
| No layout reads in input handlers                          | `grep -n getBoundingClientRect web/src/lib/hero.ts` — only inside the resize measure                          |
| Reduced motion                                             | emulate; section height `== --vh`, no trigger registered, headline visible                                    |
| Nav over the sky                                           | contrast of nav links against the pixels behind them at `p = 0`, both widths                                  |
| No horizontal overflow at 390                              | `scrollWidth <= innerWidth`                                                                                   |

## Task checklist

- [x] **1. Assets + static scene.** Copy the four files into
      `src/assets/img/hero/`; `HeroScene.astro` renders them through
      `astro:assets` with `layout="none"`; cutouts positioned by the spec's
      starting fractions; `Hero.astro` shell; `index.astro` composes it. Build.
- [x] **2. Cover box + pose.** `lib/hero.ts`: `HERO` config, cover-box measure on
      load/resize (`fx` by breakpoint), `poseFor()`, beat-0 pose applied
      statically. _One look, 1920 and 390:_ cutouts sit on their drawn figures
      at beat 0 — this is the placement-by-eye task the spec allows.
- [x] **3. Camera.** ScrollTrigger pin/scrub/snap; segment interpolation with
      log-space scale and cubic ease; translate solve; cover clamp; one
      transform per frame. `driveSection('hero', p)` moves the camera.
- [x] **4. Focus.** Cutout opacity = focus; plate recede from tokens; captions
      scrubbed; beat-0 headline out. Eyebrow in `--scrim-ink`.
- [x] **5. Composition.** `.on-photo` blocks placed; 390: `fx = 0.46`,
      `phoneCyLift`, bottom-third headline; nav marker.
- [x] **6. Depth, dev, fallbacks.** Zero-at-beats parallax lead; `__bkash.hero`
      with `nudge()`; reduced-motion and `.no-js` static path.
- [x] **7. Close out.** `PROGRESS.md`; spec → BUILT; hand to `/verify` with the
      list of criteria I expect to pass and the two I am unsure of (nav
      contrast, feet on the ground line).

## Risks

- **A visible double where a cutout meets its drawn figure** during the
  fade-up. _First check:_ `p = ⅙` at 1920 — if the outline ghosts, allow a
  per-cutout scale/offset in `nudge()` to match, and shorten the fade.
- **Nav links over bright sky.** _First check:_ the contrast row above at
  `p = 0`. Fallback: omit the marker; the nav stays solid over the hero.
- **`filter` on a plate scaled 4× on a low-end phone.** _First check:_ scroll
  on a real handset. Fallback: on `≤767px` recede by opacity only.
- **Snap fighting a slow drag.** _First check:_ drag and hold between beats on
  a trackpad. Fallback: longer `snap.delay`, or snap on `scrollEnd` only.
- **AVIF alpha on painted edges.** _First check:_ the built cutout files at 2×.
  Fallback: WebP only for cutouts.
- **`--vh` jump mid-pin on a phone** (URL bar). `scroll.ts` already refreshes
  on an 80px jump; the cover box recomputes on the same resize. _First check:_
  scroll past the hero on iOS Safari.
