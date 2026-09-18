# reference/ — the frozen prototype

**Read-only.** Nothing in here is built, served, or imported. It exists so the
rebuild can port from it instead of guessing.

The prototype shipped as a CEO demo on 2026-09-17 and did its job. The original
repo is still on disk at `/Users/nahian/Projects/bkash` (branch
`rebuild/astro-scrolltrigger`) with full git history if anything here is
missing.

## prototype/

The demo's source, unchanged.

| Path | What's worth taking |
|------|---------------------|
| `js/hero.js` | **The camera maths.** `poses()` (~line 245) derives a start scale so one facet covers the viewport; scale interpolated in log space, position derived from it about a fixed point. `anchorPortrait()` (~line 145) re-anchors cutouts *and* re-derives camera targets against a portrait plate under a cover-crop. Both hard-won. |
| `js/phone.js` | Hotspot geometry as fractions of the screen box (`COLS`/`ROWS`, ~line 159) so spots scale with the device. Also `measureSlot()` — measure once with the transform cleared, then cache. |
| `js/bird.js` | `LIVE_POLY` and the nine `HIT_REGIONS` polygons. Verified 2026-09-18 against the artwork's own alpha: they match to ~1%. |
| `js/engine.js` | Superseded by ScrollTrigger. Read it for the read-phase/write-phase discipline, not to port. |
| `css/tokens.css` | The closed type scale — size, line-height and tracking bundled per step. Port this. |
| `css/*.css` | Section styling. Useful as a record of intent; most of it is desktop-first and gets rewritten. |

**Do not port** the wheel interception in `hero.js`, the `100vh` sizing
anywhere, or the `84vh` bento width formula in `phone.css` (it renders the grid
at ~43% of viewport width on a 16:9 screen).

## assets/

`img/` is the prototype's asset folder with five known-dead items removed
(`HOMEPAGE.svg` 16MB, `phone-screen.svg` 3.6MB, `stories/`,
`feature-hero.webp`, `bird-flap.webp` — 21MB total, nothing referenced them).
`fonts/` is Inter subset to latin + latin-ext.

These are **prototype-resolution** files. Anything reused goes through
`astro:assets` in `web/`, not straight across.

### salvage-photos/

25 images pulled out of the prototype's salvage bundle, still under their
original UUID names. These include the **source photographs behind the bird
collage's nine facets** at 1400x1050 and similar — considerably better than the
517px you get by cutting them out of `collage-bird.webp`.

**The facet-to-photo mapping is NOT established.** A colour-histogram match was
attempted on 2026-09-18 and was not decisive: two facets claimed the same
source and the top-two gaps were as low as 0.011. A visual read suggested
1400x1050 sources for roughly six of the nine, but that has not been verified
and is deliberately not recorded as fact here. Establish it properly before
relying on it — the cheapest route is probably opening the collage and the
candidates side by side by eye.

The largest facet (the pink tea stall) is the merchant scene, whose full
source is `Merchant.jpg` at 6000x4000 in the client deliverables — **not copied
here**, still at `/Users/nahian/Projects/bkash/Website animation/`, ~90MB
gitignored.

## Why this matters for the bird section

The bird sequence opens with one facet filling the screen. That facet is 517px
wide inside the 1195px artwork, so filling a 1440px viewport means rendering
the artwork ~2.8x upscaled at the moment the section opens. The raster alone
will not carry it. Either the real source photographs are composited in, or the
opening frame is covered by the hero's own full-resolution frame the way the
prototype did it. See `specs/sections/bird-collage.md`.
