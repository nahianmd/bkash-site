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
