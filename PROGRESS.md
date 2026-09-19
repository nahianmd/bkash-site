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

**Revised again 2026-09-19 (late) — the phone as an object (three.js).**
The client asked for 3D, not a flat plane turned in 3D. Nahian downloaded
`iphone_16_-_free.glb` (Sketchfab Standard); it ships as
`web/src/assets/models/phone.glb`, meshopt-compressed 2.46MB → 305KB.
- `lib/device.ts` — the handset's numbers read from the model's vertices
  (display 6.5266×14.085 at z 0.3901, body 7.1832×14.7387, corner radii
  solved from the outermost diagonal vertex, the island) plus the pose
  solver moved out of services.ts. One set of numbers now builds the CSS
  device (body, display inset, radii, island — written as custom
  properties per resize), the WebGL device, and the lattice: the display
  aspect replaced 360/760 and the rows are kept in screenshot pixels.
- `lib/phone3d.ts` — one transparent canvas over the pin, the GLB under
  a RoomEnvironment, the display's material replaced by the screenshot
  (unlit, planar UVs from the plane's own extent, no tone mapping, so the
  pixels are the screenshot's). **The WebGL camera is the CSS camera**:
  world units are px, the eye at the pin's perspective origin at the
  perspective distance, an off-centre frustum via `makePerspective`, y
  negated; the display plane is the object's origin so the same pose
  drives both. Loaded by IntersectionObserver a screen ahead, dynamic
  import; it is its own 642KB (minified) chunk — the page's own scripts
  stay at 18KB — and never loads under reduced motion.
- The object carries the emergence and the hold; the CSS device takes
  over at `restEnd` for the zoom; without WebGL the CSS device does the
  whole emergence (unchanged from the morning).
- **Measured.** WebGL display corners vs the CSS device's screen at Rest
  B: ≤0.1px at 1920 and 390. Vs the photographed corners at the pose:
  ≤3.3px at 1920 (rms 1.86), ≤1px at 390 (rms 0.46). Lattice at the
  zoom's end 0.11px. Model load 717ms on localhost. Dist gates clean.
- **Gotchas.** Vite re-optimised deps after `npm install three` and the
  automation tab's module map went stale — every page script failed with
  "Failed to fetch dynamically imported module" until the files were
  refetched with `cache: 'reload'`. The IntersectionObserver never fires
  in the hidden tab (`__bkash.services.load3d()` forces it). The tool's
  window resizes between calls and only `--vh` followed; a 28px lattice
  error vanished on a dispatched `resize` — an artefact, not a fault.
- **For `/verify`:** the object in a real browser at both widths — the
  frame's light as it turns, the island, the edge; the handoff at Rest B
  (the frame is teal in the model, `--device-body` in CSS — the body
  colour may want matching); frame time through the emergence on a
  phone; the 642KB chunk on Slow 4G arriving before the wall ends (it is
  requested a screen early; if late, the CSS device runs the emergence —
  check that this is invisible rather than a jump).

**Revised 2026-09-19 (late) — the phone stays a phone; the sixteen get
their own section; the tilt is the photograph's.** Nahian's four notes
after the object shipped (spec: "Revised … the phone stays a phone").
- **The tilt.** The object leaned the wrong way. Diagnosed, not nudged:
  at tile scale the quad's perspective signal is ~1px, so the solver
  could not tell a tilt from its mirror — and the CSS camera (1500px
  eye, object 2500px back) is far more orthographic than the lens that
  took the photograph, so the two minima are not even mirrors. The tilt
  is now solved ONCE in the photograph's own pixels (`tools/
  photo-pose.mjs`, weak perspective, 4.3px rms on a 1600px phone): the
  quad's shear fixes both angles and the sign of their product; which
  side of the handset the photograph shows fixes the rest. Top back
  11.4°, right side 16.4° nearer, roll 0.6° — `PHONE_QUAD.tilt`. Per
  viewport only the placement (tx, ty, tz) is solved
  (`device.solvePlacement`); the residual is the lens mismatch: 4.5px rms
  at 1920 (max 9.6px at one corner), 0.6px at 390.
- **No morph.** `renderZoom`, the lattice and the in-pin grid are gone.
  From Rest B the phone slides — desktop to the right column's centre
  (dx by formula from the split and the gutter; s = 1 there), copy rising
  in the left column; phone to the space above the copy, measured
  (`copy.offsetHeight`): at 390×780 the copy is 222px tall at the foot,
  the phone scales to 0.624 and its display bottom sits 33px above it.
- **Alive.** `liveAt(p, now)`: an idle sway (4°/2°, 6px bob, periods
  3.1/4.3/2.7s) plus a pointer tilt (12°/8°, followed at 0.08 per tick),
  both × the slide's progress so the emergence is exact. One
  `gsap.ticker` render while the trigger is active and the tab visible
  (`onToggle`, `visibilitychange`); nothing otherwise.
- **White ground** through the emergence; the nav marker hides at 50%.
- **`ServicesDetail.astro` / `services-detail.ts`** — the former Stills
  C/D in flow on white at `#services-detail`: stage left (card flips,
  copy crosses), 4×4 grid right; on a phone the card on top and the grid
  beneath, full width (cells 84×99 at 390, labels shown). First service
  selected on load; the fifteen recede. The strip is gone.
- **Measured.** 1920: rest centre 1405.9 vs 1404.8 expected; copy in the
  left column 64–937. 390: as above; no overflow at either width; dist
  gates clean; the page's own scripts 7KB, three.js still its own lazy
  chunk.
- **For `/verify`:** the tilt's direction against the photograph by eye
  at both widths (the numbers say top-back, right-near); the fade-in at
  1920 where the placement is up to 10px off the photographed corners; the
  pointer tilt on desktop and the touch tilt on a phone (does it fight
  scrolling?); the idle sway's speed; the copy's measure at 390 under a
  moving `--vh`; the button's scroll to `#services-detail`; the detail
  grid's labels at 390.


## Hero — revised 2026-09-19 (night): the empty street (Fable)

Nahian supplied `plate.jpeg` (2748×1536) with the three figures removed.
- Cutouts always on; focus = the street and the other two recede (token
  set), the subject full. `scene-rig.applyFocus(p, weight)` — the bird
  lifts the recede on street and cutouts alike as it pulls wide.
- Depth of field by the zoom: sharp + pre-softened twin per cutout,
  crossfaded by `(s − 1)/(s_beat − 1)` in `applyCam`. Twins from
  `tools/soft-twins.mjs` (amena σ 15.8px, rahim 10, faysal 13.4 at source;
  rendered at 1/4). Measured: beat 0 soft 1/sharp 0 on all three; beat 1
  Amena full + sharp, the others 0.45 with the recede filter; bird end all
  full and soft.
- `lib/hero-beats.ts` holds the beats as pure data; HeroScene emits the
  boxes as CSS (JS placement vs CSS placement: 0px on all three); the
  bird's poster places the twins inside the mark.
- The old cutout fractions land on the removed figures' positions (offline
  composite checked): Amena on the balcony, the tea stall, the scooter.
- **For `/verify`:** the plate never paints in the hidden tab, so Nahian
  and Sonnet judge by eye: the soft twins against the painted street at
  beat 0 (too soft / not soft enough — `ON_SCREEN_BLUR` in the tool); the
  inpainted stall behind the tea-stall cutout at beat 2; the cash-out
  banner's absence; feet on the ground at 768/1280; the 2.8× stretch at
  beat 1.

**Same night, after Nahian's look: still ghosting, wrongly placed, wrongly
blurred.** The soft twins were the ghost — a blurred silhouette is larger
than the sharp one, so the crossfade haloes every edge. Removed; one image
per cutout again. Placement goes to Nahian's eye: the dev-only placement
tool (`?place`, or `__bkash.hero.place()`) — drag to move, shift-drag to
resize, arrows to nudge, prints the `hero-beats.ts` lines. Verified by
synthetic pointer events: a 100px drag at the wide shot moves a box by
100 / (box.W × s) of the plate; the HUD and the console print the lines.

**Then:** the cutouts "moved around with the zoom" — that was the parallax
lead (cutouts translated relative to the street mid-segment); off. The
placement HUD became a panel: x / y / w / soft per cutout, typed or
dragged, with a copy button. `soft` = screen px at the wide shot, kept
constant on screen by dividing the layer blur by the scale, zero on the
subject; only the three cutout layers, never the plate. Measured: soft 2
→ `blur(2px)` at the wide shot, `blur(0.5px)` at 4× on a receded cutout,
none on the subject; no cutout transform mid-segment.
**Size control (same night):** `w` resizes about the FEET — the box grows
about its bottom-centre, height from the box's own CSS aspect — from the
panel's `w`, shift-drag, or `[` / `]` (shift ×10). Measured: feet drift
0 / −0.1px across a 0.10 → 0.13 → 0.12 resize.

## Nitty-gritty pass — 2026-09-20 (Fable)

Nahian's list after a full scroll: the wall on white; the detail grid
smaller and further from the copy; the sliding row back on mobile; the
placeholder block gone; a softer ground under the transparent nav; the
hero copies' ground softer.
- `.on-photo` is now a soft-edged rectangle: full strength (0.62, the
  derived contract) over the text block + `--scrim-bleed` (2rem), then a
  static blurred shadow in the scrim's own colour feathers the edge over
  `--scrim-feather` (5rem). One rule, every section.
- The nav's `::before` reaches 8rem below the band with an eased stop
  list (55 → 40 → 18 → 0%).
- The wall: `--paper` ground, `--paper-2` tiles, the title tile night on
  paper; the `[data-nav-dark-end]` marker removed (the nav is solid
  through the section).
- `ServicesDetail`: columns 1fr/1fr, gap `--s-10` (544px columns and
  128px at 1920); on a phone the sixteen are the 56px sliding row again,
  snap to item, a settle selects the nearest (measured: scrolling to
  item 5 selected 5; no page overflow at 390).
- `index.astro`: the "Next: the people" block is gone.
- **Open — Nahian's call:** where the hero copies sit (headline top-right
  in the sky, captions bottom-left). Two alternatives offered in
  conversation.

**Then (2026-09-20):** the claim moves to the foot of the frame on desktop
(the captions' column; it leaves as Amena's caption arrives in the same
place); the phone keeps it in the top third (Rule 3). The nav stays
transparent through the whole hero pin, the bird's white included — the
bird no longer toggles the marker; `navSolidAt` is gone. What Nahian saw
as "white behind the header in the hero" was the bird's solid switch,
exposed when the wall's marker was removed the night before.

**Nav over the hero, third pass (2026-09-20):** Nahian still saw white in
the pin. The observer path was the weak link (a zero-height marker at a
pinned section's end, toggled from a scrub), so the hero now drives the
nav itself: `render()` writes `<html data-nav-ground="dark|light">` from
the scrub — dark until the bird's motion ends (P < share + (1 − share) ×
motionEnd = 0.909), light after — and Nav.astro's CSS reads it beside the
observer's class. The hero removes its marker when the scrub runs;
reduced motion keeps it. Measured with the nav's transition disabled (it
freezes in the hidden tab): transparent + white links at beats 0–3 and
bird 0.5 / 0.79; solid from 0.81; solid over the wall.

**Spacing (2026-09-20):** the phone belongs to the right — back at its
column's centre — and copy and phone are gathered toward each other by
one token, `--svc-gather` (`--s-8`, 4rem): the copy's `left` adds it,
the phone's centre subtracts it. Nahian: "move them both, slightly." The
mobile layout is untouched. The sixteen get `--s-11` above them (12rem;
10 on a phone).

**The wall's photographs (2026-09-19, late):** the client's twenty-two
arrived (WhatsApp exports, 1600×1066 / 1066×1600), renamed to slugs and
laid into the wall with the ten from before — 32 photographs, each once
on desktop plus two repeats at other crops so the outer column covers
the travel (every column's height ≥ its rate × D + vh, checked: 2763–
3388 needed, 3702–4120 present); the phone's two columns carry eighteen.
Crops by subject: tall for a standing figure, square for a face or a
pair, wide for a scene; `object-position` where the subject is off
centre. Arrival re-measured after the reorder: 496.5 vs 496.

## Header menus — BUILT 2026-09-20 (Fable)

`specs/sections/nav.md` · `lib/nav-data.ts` (the sheet as data) ·
`Nav.astro` (panels + accordion) · `lib/nav.ts` (`initMenus`). Three
menus that open panels under the bar and collapse; the drawer becomes
a nested `<details>` accordion. Measured: click opens (aria-expanded,
`.is-open`, bar solid), switching closes the other, Escape closes and
refocuses, outside click closes; panel absolute under the bar, full
width, five columns for Consumers. Two things caught: the bar's `.nav > *`
rule made the panel a flex item (now `.nav .nav__panel`), and the open
class waited on a rAF the hidden tab never gives (now one forced layout
per open). Hrefs are placeholder slugs — the sheet's "goes to" column is
shifted against its rows. The About page is next: "as it is."
**Desktop panels invisible (2026-09-20):** raising the panel rule to
`.nav .nav__panel` (to beat the bar's `.nav > *`) also made its collapsed
`opacity: 0` outrank `.nav__panel.is-in`'s `opacity: 1` under Astro's
scoping — the panel opened in the DOM and stayed invisible; my own
measurement had read the 0 as a frozen transition. `.nav .nav__panel.is-in`
now. Measured: hover-open then click → opacity 1, top 72, block.

## About — BUILT 2026-09-20 (Fable)

The prototype's page, content and layout as they were, in the site's
design language. `pages/about.astro` · `lib/about-data.ts` (stats,
triad, board, investors, voices — the prototype's lists verbatim) ·
`lib/about.ts` (reveals, counters, the investors' shared logo size, the
Journey Wall on a ScrollTrigger pin with `--vh`). Assets copied to
`assets/img/about/` (27 files, 2.7MB), all through astro:assets.
- The hero copy sits on `.on-photo` (Rule 3); the banner is dark, so the
  page places `[data-nav-dark-end]` at its end — the observer path,
  which is what it is for on an unpinned page.
- Dark sections use `--night` / `--on-night*`; a `--pink-lift` token was
  added for eyebrows on dark grounds (the prototype's value).
- The board keeps the prototype's monochrome treatment — a recorded
  exception to "documentary left real": the portraits run 175px to
  2400px and the treatment hides it. Reversible, one line. Better
  portraits remain a client ask.
- The wall: height `--vh × 3.2` (2.6 on a phone), pin `--vh`, travel =
  the artwork's overhang (1895px at 1920), one transform per frame, a
  progress bar on the same number; reduced motion / no JS: no pin, the
  artwork scrolls sideways.
- Reveal stagger via `data-reveal-group` (a custom property set once),
  not the prototype's inline styles; the road headline's `<br>` is gone.
- Gates: 0 inline styles, 0 `<br>`, `noindex`, one `100vh` (the fallback;
  a second one in the nav panel was removed).
- **For `/verify`:** the nav transparent over the banner and solid below
  it under real scrolling (the observer path, unpinned — the hidden tab
  never fires it); the counters; the wall's pan on a phone; the scrim on
  the hero copy against the banner; the board treatment by eye.


## People — BUILT 2026-09-20 (Fable)

`specs/sections/people.md` as written, after the bird. Three named people
(the reference project's) as equal 4:5 cards on `--night-2`, one caption
block on `.on-photo`, hover/tap/keyboard = the rest recede (tokens), no
size change; three planes drifting at the token rates on a scrub, no pin.
Copy placeholder; the CTA goes nowhere; names need the client's clearance.
**Then:** Nahian asked for the prototype's row behaviour back on desktop
(three shares / 0.55, captions collapsing to a small name, CTA on the open
card, image scale 1.04) and the title on one line. Done with the tokens;
recede kept on the neighbours; the phone stays stacked. Measured at 1920:
389/389/389 at rest → 157/855/157 open; title one line.
**Phone copy in the phone section (2026-09-20):** on a phone the copy is
the title and a text link, centred; eyebrow, line and button hidden.
Measured at 390: copy 83px at the foot, the phone rests at 0.82 (up from
0.62 — the shorter copy gives it the room), 23px clear above the copy.
**Phone size on a phone (2026-09-20):** the resting band is now solved
with clear air reserved between the handset and the copy —
`WALL.rest.phoneCopyGap` (`--s-8`), one dial. At 390×780 the phone rests
at 0.759 (was 0.821) with 57px from the display's bottom to the title.

## Copy — the client's deck, 2026-09-20 (Opus)

`web/src/assets/Website_N_1.pdf` (12pp) is the real copy. Extracted with
PyPDF2 and applied:

| Where | Now |
|---|---|
| Hero beat 0 | Powering Financial Access / Across Millions of Lives |
| Beat: Amena | 7 in 10 Adults in Bangladesh / Control Their Money with bKash (unchanged) |
| Beat: Rahim | From Floating Stalls to Digital Storefronts / Empowering Millions of Cashless Commerce — **role now Merchant** |
| Beat: Faysal | At Least One Human ATM Every 2 KM / The Largest Agent Network in Bangladesh — **role now Agent** |
| Bird | A Financial Ecosystem / Reaching Every Corner (eyebrow dropped) |
| People | Stories Behind the Numbers |
| The wall's title tile | Writing Millions of Stories in Motion (eyebrow and subline dropped — the deck gives one line) |
| The phone | Everything You Need to Manage Your Money / Send, receive, pay, save, borrow. All in one app, always within your reach. |
| About: stats | full stops removed (the deck says so); `.stats__note` capped at 28ch for the deck's "two lines" — three of four reach two, "Democratizing digital payments" is too short to |
| About: journey wall | 15 Years of Moving Bangladesh Forward |
| About: careers | Build What Matters / the 15-years paragraph / "Five values shape how we work:" / Customer-Centric… / "We challenge convention…" / CTA "Come Build What's Next" |
| About: road ahead | The Road Ahead + the deck's two paragraphs (the eyebrow dropped — it duplicated the title) |

The deck's beat order is Amena → **Faisal** → **Rahim**; the build's camera
order is Nahian's (Amena → Rahim → Faysal) and was left alone, so copy is
mapped by NAME and the roles now read customer → merchant → agent.
**Open for Nahian.**

Still ours, not the deck's: the hero cue "Scroll to meet them"; the
eyebrows (Meet three of them, Sixteen services, Our journey, About bKash,
The Revolution, Backed by, Leadership, Careers at bKash); the three
people's names, roles and CTAs; the sixteen service names and lines; and
About's voices, board, investors and CEO quote.
