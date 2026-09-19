# Progress

Durable memory across context resets. Update as sections land.

## Done
- Repo initialized, original prototype checkpointed (`cd128bc`)
- Prototype reverse-engineered: 3-level self-extracting bundle, DC canvas docs
- CLAUDE.md + scope contract written
- Content received and inventoried; icons unpacked to `build/tmp/icons/`

## Decisions locked
- **No WebP encoding needed.** No brew/ImageMagick/cwebp on this machine and
  `sips` cannot write WebP. Irrelevant: everything is inlined in a local file,
  so transfer size doesn't exist. Pipeline is sips-resized JPEG for photos,
  reuse the original bundle's alpha WebP cutouts, SVG for icons. Zero installs.
- **`swiftc` is available** — that's the route for rasterizing the Journey Wall
  vector (CoreGraphics/CGPDFDocument) at arbitrary resolution.
- `sips -Z` **upscales** smaller sources. Always read dimensions first and only
  shrink, or we inflate small files into big blurry ones.

## Content gaps — raised with client 2026-09-16
- `Agent.jpg` is **685x386**; Customer and Merchant are **6000x4000**. Same
  visual weight in the story row, ~100x less pixel data.
- Board portraits range **175x175 to 1792x2400**, mixed aspect ratios. Cannot
  build a clean uniform grid from these as-is.
- Supplied icon set has **Microfinance** where the prototype said **NGO**.

## Built — homepage (`dist/index.html`, 9.8 MB)

**Foundation**
- `src/` source tree + `build.py` -> one self-contained `dist/bkash-demo.html`
  (8.5 MB, 34 assets inlined, zero network refs, zero `import` statements).
  Build self-checks for leaks, surviving template literals and stray imports.
- Design tokens: closed 8-step type scale (size + line-height + tracking bundled
  per step), spacing scale, warm shadow ramp, two easing curves.
- Scroll engine on rAF with read-phase/write-phase separation; parks when idle.
- Debug HUD (`d` to toggle, or `#debug`) — hero beat, phone zoom %, growth %,
  phase, live dimensions. **Strip before the demo ships.**

**Section 1 — hero (stepped)**
- Four beats: wide establishing, Amena, Faisal, Rahim. One gesture = one beat,
  1100ms tween between composed frames. Wheel, touch, keyboard and clicker all
  drive the same stepper; gesture debouncing stops a trackpad flick skipping.
- Beat 5 is the bird: a pure scale about one fixed point, bird resting right,
  copy centred in the column it leaves. Rahim's frame is a clipped overlay on
  the wing panel so the handover is invisible, fading out early.

**Section 2 — people stories**
- Row of three tiles, real photography with real names from the reference
  project (Anisul Haque, Munni Barua, Shajib Ahmed). Hovered tile takes three
  shares, neighbours drop to 0.55 — the row always sums to the same width.
  Pure CSS; JS adds click/keyboard equivalents only.
- 168px of clear air after the hero.

**Footer** — shared `footer.css`, on both pages. On the homepage it does a job
beyond navigation: the phone section pins, so without something after it there
is no signal whether the page has ended or the scroll has jammed. Viewers were
reporting exactly that confusion.

**Section 3 — phone bento**
- Bento grid, one screen, centred, 6 photo cards + 1 copy card.
- Middle column sized in JS to a true 360/760 so the phone tile is authentic
  and the app screen needs no cropping.
- On pin: the grid falls as ONE rigid plane while the tile becomes a phone and
  zooms about a point 120px below viewport centre, ending 520px wide. Both
  finish on the same beat, then the phone slides left.
- 16 service hotspots derived from the screen geometry; click to lock, first
  auto-selected, description panel 200px to the right. Last section on the page.

## Built — About page (`dist/about.html`, 4.0 MB)

Nine sections: hero, count-up stats, platform triad, investors, board of
directors, CEO quote, Journey Wall, voices, careers + road ahead + footer.

- **Journey Wall** needed a rasteriser. `tools/pdfraster.swift` renders the
  51MB PDF through CoreGraphics — this machine has no Ghostscript, Inkscape or
  pdftoppm. Cropped to the artwork by ROW DENSITY (the artboard caption is
  sparse text; the artwork's ground fills its rows), which landed at exactly
  6.00 aspect, matching the filename's "60x10 ft". Panned while pinned, about
  240px per milestone.
- **Board portraits** carry a duotone FILTER, not baked-in processing. Sources
  run 175px to 2400px in mixed aspects; one treatment makes them read as a
  set and hides the four low-res ones. Reversible — one CSS line.
- **Investor logos**: backgrounds keyed out by sampling each file's own corner
  (Gates sat on 235 grey, not white), trimmed to content, normalised by AREA so
  a 9.8:1 wordmark and a 3:1 mark carry equal weight. All six on one flex row,
  within 0.3%. `LOGO_DIVISOR` in about.js is the single size dial.
  Equal-width grid columns break this — they clip the long wordmarks.

## Next
- Content mapping: real names into the hero (needs A7), real story copy (A3/A4)
- **Strip the debug HUD** before the demo ships (`initDebug()` in main.js)
- Responsive pass on the actual demo machine once B1/B3 are answered
- Copy on both pages is placeholder and not bKash-approved

## Mobile (audited at 415x900, 2026-09-17)

Both pages: no horizontal overflow, burger nav, switcher pill present.
About collapses to 1 column throughout except the board at 2.

Three real breaks were found and fixed:
- **Hero showed only 26% of the plate.** The wide plate is 16:9; on a
  portrait phone cover-crop shows a quarter of its width, while the cutouts
  are positioned against the VIEWPORT — so people stood in the wrong places
  against the background. Ported the original's portrait plate and its
  `anchorPortrait()` re-anchoring, which also derives fresh camera targets
  from where each cutout actually lands. Now 82% of the plate is visible.
- **Phone rendered at 125% of screen width.** PHONE_END_W was a fixed 520px.
  Now capped against the viewport.
- **Phone's top sat off-screen**, cutting off the service grid. FOCUS_Y was a
  fixed pixel offset tuned to a 992px desktop. The fixed point is now DERIVED
  from where the phone should finish: it crops only when the phone ends taller
  than the viewport, and centres when it fits.
- Bird went from 37% to 74% of screen width, centred, copy beneath.
- **Phone now grows edge to edge on a phone** — the device frame meets the
  screen edges, so the viewer's own handset becomes the bKash phone, and the
  slide finishes dead centre rather than moving aside for a copy column that
  no longer exists. The copy becomes a gradient panel over the foot of the
  device. The "does it fit" test carries an 8% tolerance, because at full
  width the phone is a few pixels TALLER than the viewport and a strict test
  threw it into the cropping branch.

**Testing note:** window resizing does not work through the extension on this
machine. Use an iframe at phone width — media queries respond to the iframe's
own width. Watch for the iframe's scrollbar making `innerWidth` 15px wider
than the content, which reads as a small centring offset that is not real.

## Gotchas logged
- **A sticky pin unsticks the instant its container runs out**, so if the
  animation is scrubbed across the pin's full travel it finishes at exactly
  the moment the section starts scrolling away. The phone's services became
  readable and were immediately swept off by the footer rising behind them.
  Scrub the animation across a FRACTION of the travel (`ANIM_SPAN`) and let
  the rest hold, and lengthen the section so the hold is added rather than
  taken out of the animation.
- **A scaled full-bleed scene only covers the screen while
  `50/s <= cam.x <= 100 - 50/s`.** Outside that band the ground behind it
  shows through at an edge. Hand-tuned camera targets tend to satisfy it by
  eye; DERIVED ones do not, and the portrait plate's targets put Amena at
  x = 20 against a minimum scale of 1.6, which needs 31.25. Clamp per frame,
  not per target — the bound moves with the scale as the camera travels.
- **CSS transitions do not advance in a hidden tab**, so a transitioned
  property measured there reads its START value forever — even minutes later,
  even with an inline override. Spent a while chasing a flex rule that was
  working perfectly. To measure a transitioned property in automation, set
  `transition: none` on the element first. Same family as rAF not firing.
- **The bird's shape comes from `collage-bird.webp`, not from polygons.** That
  artwork is already cut to the bKash mark with its own transparency. The old
  prototype's nine clip-paths were HIT REGIONS laid over it for the shard
  interaction, never the shape. Three attempts were built on that wrong
  assumption — including tracing the logo raster and parsing the official SVG,
  both of which produced accurate geometry for the wrong job. When an asset
  looks like a source of truth, check what the original actually rendered
  before reconstructing it.
- `getBoundingClientRect()` on an element with a translateZ inside a
  perspective container returns its PROJECTED size, not its layout size.
  Measurements looked wrong for an hour because of this; the layout was
  correct all along. Compare against `style.height`, not the rect.
- A translateZ under perspective also drags an element's visual top upward,
  so it cannot coexist with a top anchor. Removed.
- Anything measured from inside a transformed container (the bento slot lives
  in the falling grid) must be measured ONCE with the transform cleared and
  cached — otherwise every frame reads a moving target.
- `offsetTop` on a `position: sticky` element tracks where it is CURRENTLY
  rendered, so it grows as the element sticks. Never use it to measure a
  stable offset — it made the pin-progress denominator move while scrolling
  and silently killed the phone zoom. Measure the sibling's height instead.
- Automation tab runs `document.hidden = true`, so rAF never fires there.
  Added `Engine.step()` / `Engine.settle()` + `window.__bkash` to drive frames
  deterministically for screenshots and live tuning.
- The bundler must give each module its OWN scope. Concatenating broke the
  moment two modules both wrote `const { damp, clamp } = Engine`.
- Asset paths in JS must be STRING LITERALS. A template literal cannot be
  inlined and ships a reference that only breaks offline. build.py now warns.
- The automation tab runs hidden, so it does not composite reliably —
  screenshots can return stale frames out of sync with the live DOM. Verify
  visual state programmatically; use Nahian's own browser for eyeballing.
- `ch` units resolve against the ELEMENT's own font-size. `max-width: 17ch` on a
  16px container wrapped a 76px heading to four lines. Put ch limits on the
  heading itself, or use rem.

## Blocked / needs Nahian
- Demo machine + screen (needs.md B1/B3) — still unanswered
- **needs.md A0**: the hero is AI-generated imagery. Everything built since —
  the people row, the bento, the About page — is real photography, so the page
  now contrasts the two. This is the biggest remaining exposure.
- Real story copy for the hero beats and the bird facets (A3/A4)

---

# Production rebuild (`bkash-site`)

## foundation — BUILT 2026-09-18

`specs/foundation/spec.md` APPROVED, `specs/foundation/plan.md` worked
top-to-bottom, ten tasks, one commit each. Not SIGNED-OFF — that is Nahian's.

**What ships**

- `web/src/styles/tokens.css` — the closed system. Ten type steps (the two the
  spec asked for are `--fs-hero` and `--fs-quote`), each clamp derived from its
  two endpoints with the derivation in a comment. Dark-ground tokens (X5), the
  three design-language token sets that had no prior form — scrim (Rule 3),
  recede (Rule 4), plane rates (Rule 2) — headline measure per step, `--nav-h`
  as the single source (X2, 3.5rem below 767px), and the motion durations as
  the reduced-motion hook.
- `web/src/styles/base.css` — reset and primitives, deliberately without the
  prototype's blanket `!important` reduced-motion override.
- `web/src/styles/README.md` — the image convention, the X9 answer, and the
  greps, pointed at `dist/` rather than `src/`.
- `Logo.astro`, `Nav.astro`, `Footer.astro`, `lib/nav.ts`, `Base.astro`,
  `index.astro`, `about.astro`, `specimen.astro`.
- Inter via Astro's fonts API: two woff2 files, 132KB, no build-time network.

**Audit findings closed:** X2, X5, X6, X8, X9, A7, H4 (at the token level),
H7, H11, and A5 caught reproducing itself in the footer. X3 has no-JS, print
and reduced-motion fallbacks. X1 has `--vh` plus a written rule.

**The five things measurement caught that reading would not have**

1. The prototype's Inter files could not satisfy the spec. Decompressed,
   weight 600 held 222KB of glyph data against weight 500's 26KB, and only
   weight 400 had latin-ext at all — while `.t-h1` is 700 and `.t-h2`/`.t-h3`
   are 600. A single `ā` in a headline fell back mid-word.
2. `fontProviders.npm()` cannot filter subsets (`unifont` never passes
   `options.subsets` to `resolveFromLocal`). It emitted all seven subsets and
   preloaded every one. `fontProviders.local()` with the two subsets named
   explicitly is the fix. `fontsource()` was tested and is worse: 4 files,
   422KB, CDN fetch.
3. Solid-by-default in the nav was inverted: `.nav:not(.is-solid)` matches the
   default state, so a page with no marker rendered white-on-white.
4. The footer's `auto-fit` grid made SIX tracks for four columns at 1920 and
   collapsed to ONE at 390 (a 15px scrollbar takes it under the 344px two
   columns need). Now explicit, 4 and 2.
5. The `<dialog>` `close` event does not fire in the target browser, for
   either `close()` or Escape, though `drawer.open` goes false correctly — so
   `aria-expanded` was stuck at `"true"` forever. State is set at the call
   sites now.

**Corrections made to the plan while implementing** (both recorded in
`plan.md`, under "Task 1 correction" and "Task 2 correction"): the font
provider, and the 390px type ladder — the plan's own table failed the 4px
display-band guard the same plan proposed, so the 390 display steps widened to
46/41/36/28/24 and the band boundary moved to `display`…`quote`.

**Open for Nahian**

- `latin-ext` is preloaded (83KB) but rendered by no current page, and cannot
  be filtered declaratively. Three options in `plan.md`.
- The type floors are a judgement dressed as arithmetic. `--fs-display` at
  390px is now 46px; the hero's 390 composition is where that gets settled.
- Whether `--scrim-strength: 0.62` reads as a designed ground rather than a
  grey bar. It is provably legible (5.56:1 against pure white, measured); that
  is not the same as good.
- Recede without blur — the resolution of a three-way conflict between
  `design-language.md`, `hero.md` and CLAUDE.md performance rule 2.
- Inter itself, and the invented half of the palette: `specs/needs.md` C5/C6.

**Left for `/verify`:** the nav's transparent state (neither shell page places
a `[data-nav-dark-end]` marker), FOIT on throttled Slow 4G, the reduced-motion
pass, and screen-reader announcement of the inert Bangla toggle.


## Built — hero (`web/`, 2026-09-18, Fable)

`specs/sections/hero.md` · `specs/hero/plan.md` · `web/src/components/Hero.astro`,
`HeroScene.astro`, `web/src/lib/hero.ts`.

**What ships.** Four beats over four screens of travel on a pinned
ScrollTrigger: the street, Amena, Rahim, Faysal. Scrub 0.6 through a proxy
timeline, snap to the four beats on scroll-end, log-space scale between them,
one transform write per frame. The scene is the plate's cover box, so cutouts
anchored as fractions of it land at every aspect — one wide image serves a
phone and a desktop; the prototype's portrait plate and `anchorPortrait()`
are gone. Cutouts are beat-local: opacity is the beat's focus, so subjects
cross at the midpoint; the plate recedes from the token set (no blur). The
beat-0 headline sits in the sky, top-right on desktop and top third on a
phone. Parallax lead is exactly zero at every beat. Reduced motion renders
beat 0 with no trigger.

**Audit rows closed.** H1 H2 H3 H4 H7 H8 H9 H11.

**What measurement caught that reading would not have.**
- The headline "on open road, bottom-right" was on Faysal's road. Seen in the
  first look; the sky is the one region the plate leaves open at every width.
- The phone lift had its sign backwards: aiming the camera higher pushes the
  subject DOWN. Every subject's centre measured in the bottom third until it
  was flipped; +0.05 and 0.7x zoom lands all three in the middle third.
- The beat-0 headline came back at beats 2 and 3 — it was a tent around
  Amena, not a fade that stays gone.
- The hidden automation tab does not paint decoded images on the first
  screenshot. Placement was done against an offline sharp composite instead
  (`/tmp/claude-501/compose.mjs` pattern: plate + cutouts at the config
  fractions, boxes outlined) — reliable, and faster than the browser.
- `scroll.ts`'s dev handle assigned a fresh `__bkash` and clobbered the
  hero's, because Hero's script runs before the layout's. Now merges.

**For `/verify` (Sonnet).** Expect to pass: continuous scrollbar, forward/back
land on the same frames, cover at every position, token-exact recede at the
beats and 0.5/0.5 at the midpoints, 390 thirds, no overflow, no layout reads
in handlers, dist gates. **Unsure — look first:** nav contrast over the bright
sky at p=0 (the nav's own scrim is the ground; fallback is to drop the marker
and keep the nav solid); feet on the ground line at 768 and 1280; whether the
plate at token recede reads too dark under a focused subject (`recedeStrength`
is the dial); Rahim's caption clearance at 390 under a moving `--vh`; AVIF
alpha edges on the painted cutouts; a real handset for the filter cost.
**Nahian's eye:** the four stills at both widths, and the plate recede.

**Flagged after Nahian's first look (2026-09-18, late) — not fixed, by
decision: "build the system or the formula which works right", no
micro-adjustments.** Formula-level fixes, for the hero's next pass:

- **Cutouts: cover, not match.** The cutout is a different drawing from the
  figure in the plate; it can never align pixel-for-pixel. The rule is that
  its box is slightly larger than the drawn figure and centred on it, so
  nothing peeks out. Plus a dev-only drag-and-resize tool on the page that
  prints the fractions, and the camera aiming itself at the cutout's centre —
  place once, both lock. (`anchorPortrait()`'s good idea, with a mouse.)
- **The parallax lead contradicts the fade.** The lead peaks mid-segment,
  exactly when the cutout is at 50% opacity over its drawn figure — a
  guaranteed double. Move the lead to the caption plane; cutouts stay glued.
- **Dim should lead the fade.** Recede and cutout opacity currently share one
  tent, so at the midpoint the street is half-dim and the cutout half-there.
  Recede first; the cutout fades up over an already-dim figure and reads as
  focus arriving.
- **Plateaus at every beat.** Continuous scrolling runs straight through the
  beats. Map the first and last ~25% of each segment's scroll distance to a
  hold; move only in the middle half. Move–hold–move–hold at any speed; a
  single tick still snaps forward. Plus ~1.5 screens per beat.


## Built — bird (`web/`, 2026-09-19, Fable)

`specs/sections/bird.md` · `specs/bird/plan.md` · `web/src/components/Bird.astro`,
`web/src/lib/bird.ts`, `bird-shape.ts`, and the shared `scene-rig.ts`.

**What ships.** The mark as a window. A second copy of the hero's scene,
parked on beat 3 by the shared rig, under an SVG sheet whose hole is the
official bKash mark — eight triangles as numbers, no image. The start facet
and start scale are **solved per viewport** (the smallest scale at which the
viewport rectangle fits inside a candidate facet, about that facet's rest
centroid); 1920x992 and 390x780 both pick the central facet, at 9.11x and
4.39x. The mask scales in log space about the fixed point, origin derived
from scale; hold from 0.8; copy resolves 0.7–0.8; the nav marker flips at
0.5 so the nav goes solid over the white and comes back on the way up.

**The one deviation, made on the picture.** Option (a) strictly — the street
holds at beat 3, receded — rests the mark on a dark bird full of Faysal's
sacks with a small face; not a poster. `content: 'wide'` pulls the camera back
from beat 3 to the establishing shot as the window shrinks and lifts the
recede, so the mark rests on the bright, whole street. Nahian's own words
("closing on the whole display, zooming out") support it; `'hold'` is one flag.

**Seam.** At bird p=0 the scene's transform, plate state and Faysal's opacity
equal the hero's at p=1, string for string, at both widths. The bird's pinned
frame paints over the hero's, so the handover cannot show if those are equal;
they are.

**What measurement caught.** The headline orphaned "Motion" at 24ch — fixed
at the system level with `text-wrap: balance` on the display steps, not a
per-element measure. `--bird-bottom` positions the copy under the mark at any
width. The nav's IntersectionObserver did not update under instant scrolls in
the hidden tab (`is-over-dark` stayed false) — expected, not a code fault;
verify with real scrolling.

**For `/verify` (Sonnet).** Expect to pass: seam equality both widths,
monotone k with hold, copy timing, no overflow, mark ≥300px at 390, dist
gates. **Look first:** the nav transparent→solid→transparent across the
section under real scrolling; frame time while scrubbing the first 30% (the
mask is thousands of px across); AVIF alpha on the painted cutouts; the first
edge at p≈0.1 reading as an edge and not an artefact. **Nahian's eye:** the
rest poster at both widths; at 390 the lower third is empty below the copy
(mark centred at 34% — the spec's number); the `'wide'` vs `'hold'` choice.

**Revised 2026-09-19 — one pin.** Nahian saw the seam the measurement
could not: at the instant the hero unpins, its camera is still catching up
on the scrub lag, so the two "identical" frames differ for a beat and one
slides over the other. The bird's overlay now lives inside the hero's pin;
one trigger, one render (`share` = 3/5.5 for the beats, the rest for the
bird); the snap is directional within the share and off past beat 3;
`Bird.astro` is the static poster for no-JS / reduced motion only. Measured:
the beats land at their scaled positions with exact scene scales; the mask
is fully open through the beats; a forward tick from beat 0 snaps to beat 1,
back from beat 1 to 0, and past beat 3 there is no snap.


## Built — services (`web/`, 2026-09-19, Fable)

`specs/sections/services.md` · `specs/services/plan.md` ·
`web/src/components/Services.astro`, `web/src/lib/services.ts`,
`web/src/assets/img/services/`, `web/src/assets/icons/`.

**What ships.** One pin, 5.5 screens of travel, one scrub. A full-viewport
masonry wall — four columns at 1920, two at 390, each column one transform
per frame at 0.85 / 1.0 / 1.15 of the scroll (outer two share a rate) — with
the title tile _A thousand more stories_ and, last in the fastest column, a
phone-aspect tile that rises from beneath the fold. Its arrival is computed
(`D = col.offsetTop + tile.offsetTop + tileH/2 − vh/2`, and the column travel
is set so it lands at centre exactly at `wallEnd`), then the wall holds. The
emergence is one transform on the device — `translate(dx(1−e)) scale(k0 +
(1−k0)e)` from the tile's rect to Rest B (90% of `--vh` tall on desktop, 92%
of the width on a phone) — while the bezel and notch fade in and the wall tips
back as one plane. The zoom's end is solved from the real grid: the grid's
pitch is `P = min(capW/4, capH/(4·pitchRatio))`, the zoom scale is
`P / (0.25·restW)`, the translate comes from the measured grid centre; the
real tiles fade up over the screenshot's icons in the last quarter and the
ground turns white. Rest C, then auto-select after 500ms: the grid compacts
via one transform (desktop, `translate(25vw) scale(0.38)`) or becomes a 56px
snap strip (phone), and a two-faced 3D card flips — the hidden face takes the
new icon, `rotateY` toggles, the copy crosses at 260ms. Selection is a state;
the recede is the token set. Reduced motion / no-JS: the wall static with the
phone tile in place, the grid and the first card in flow.

**Measured.** 1920×992: arrival 496.3 vs 496 target; tile→device handoff
0.3px; lattice error at zoom end 0.18px (spec allows 3). 390×780: arrival
`cx 280.7 cy 389.7`, device rest 345×728 (92%), `zoomS 0.971`, grid 335px,
card and copy and strip do not overlap, `scrollWidth 375` — no horizontal
overflow. Dist gates: 0 inline styles, 0 `<br>`, `noindex` on both pages.

**What measurement caught that reading would not have.**
- The phone column ran out beneath the phone tile — the wall showed its floor
  before arrival. Tiles now follow the phone tile in its column.
- `offsetLeft` on the tiles was column-relative: `will-change: transform` makes
  each column an offsetParent. Column offsets are added explicitly.
- `parseFloat('var(--nav-h)')` is `NaN`; custom properties resolve to px only
  through a probe element (`resolvePx`).
- Centring the grid below the nav moved its centre 36px from the viewport's,
  and the zoom landed 36px off. `dy` now comes from the measured grid centre.

**For `/verify` (Sonnet).** Expect to pass: full width at every width, three
rates measured, arrival within 2% both widths, wall motionless from arrival
through the emergence, one transform per frame on the device, lattice within
3px, sixteen in the app's order, one flip per selection, strip snap, no
overflow, reduced motion. **Look first:** frame time through the zoom (the
screenshot is 720×4730 and the wall is still in the layer tree); the compact
grid at 0.38 on desktop — is the right half mostly whitespace; the empty
lower area on the phone between the copy and the strip; whether the strip is
discoverable as a picker; adjacent repeats in the wall at 1920 (the
photographs are ten, the tiles more). **Nahian's eye:** Stills A–D at both
widths, the title tile's paper-on-dark, and the card's idle breath.

**Revised 2026-09-19 (evening) — the phone in the hand; the grid's size.**
Nahian's two notes after the first look, plus a photograph he shot for it
(`phone.jpg`: a hand, the home screen up, held at a slight turn).
- The device is now **posed in 3D over the photographed screen** and
  stands up out of the hand. The screen's four corners were fitted from
  the photograph's pixels (edges as lines, intersected — `PHONE_QUAD`),
  and a six-number pose is solved per viewport by Levenberg–Marquardt
  against the pin's own `perspective`/`perspective-origin` (read, not
  assumed). The pose × (1 − e) is the emergence; identity at e = 1, so
  the zoom is untouched. The device fades in over the photographed screen
  in the first 20% of the emergence; the wall (hand included) fades from
  5% to 55%. No three.js. Measured against the browser's own projection
  (four point-sized children, `__bkash.services.corners()`): 1920 — pose
  rms 2.1px, corners within 3.8px (the photograph's lens vs the CSS
  camera), rotation ≈ (−6.7°, 10.3°, 1.5°), tz −2555; 390 — rms 0.5px,
  corners within 1px, tz −8092. Arrival aims the screen's centre: 495.9
  vs 496 and 389.7 vs 390. Identity at Rest B exact at both widths.
- Still D's grid: `scale(0.38)` replaced by a fit to its column — frame
  split at the middle, grid to the right column as one transform,
  `s = min(1, colW/gridW, colH/gridH)`. At 1920 and 1280 that is 1.0 (it
  slides, it does not shrink; cells 168px at 1920).
- The turning cards (sixteen real 3D cards, idle turn, pointer tilt) are
  proposed in the spec's open questions and wait on the client.
- **For `/verify`:** the emergence in a real browser at both widths — the
  hidden tab does not paint the photograph, so the turn was checked by
  numbers and silhouette only; the moment the device fades in over the
  photographed screen (the two home screens differ slightly); whether the
  wall's earlier fade leaves the hand for long enough; the grid at 1.0
  beside the 24rem card — the proportion is now Nahian's eye.
