# Section: Bird collage — the mark is made of people

> Status: DRAFT
> Source: Nahian, 2026-09-18, in conversation — the MacBook Pro performance
> section as the pacing reference. Facet geometry measured from the artwork the
> same day. Written by Claude; open questions at the foot.

## Provenance of what is already decided

Recorded explicitly, because this section has accumulated decisions from three
places and they do not all agree.

**Nahian, 2026-09-17** (`hero-collapse.md`, "Resolved"):
1. Bird **right**, text **left**.
2. No glow. Background **white**.
3. Facets static for now; clickable is a future want — keep the per-facet
   structure and hit targets in place but inert.
4. One gesture: the whole collapse is a single beat.

**Nahian, 2026-09-18** (this conversation) — supersedes 4, and reopens 3:
- Not a hero beat any more. Its own **scroll-driven** section: keep scrolling
  and the bird resolves.
- Once it pins, **stories render in the bird** — the facets carry photographs.
- **"The stories might be selectable."**

**A Claude session, 2026-09-17** (`hero-collapse.md`, "Revision: real geometry
+ pure scale") — *not* Nahian, and it contradicts his point 1:
- Bird rests **centred**, copy beneath, "because a pure scale wants its fixed
  point near the middle of the screen".
- Also claims the mark has **seven** facets traced from the logo. **That is
  wrong** — see Geometry. `PROGRESS.md` records the logo trace as a failed
  attempt, and the artwork has nine.

The centred-vs-right conflict is Open question 2. It is flagged rather than
silently resolved because one side of it is Nahian's and the other is not.

## Intent

The bKash mark is not a logo here. It is nine photographs, and every one is
someone who uses bKash. You do not get told that — you start inside one of
those photographs without knowing it is inside a shape, and the camera pulls
back until the shape resolves into the mark on every shopfront in the country.

The reveal is a **camera move**. Nothing morphs, assembles, dissolves or flies.

## Motion

One pinned ScrollTrigger, scrubbed directly from scroll position, two to three
screens of travel. The bird is a fixed object; only the camera moves, and it
moves only in scale.

Scale interpolates in **log space**; position is **derived** from the scale
about one fixed point, never interpolated separately. Interpolating both is
what made the first build read as the mark sliding across the screen while it
grew — two motions reading as one muddle. Ported from
`reference/prototype/js/hero.js`.

| Phase | Progress | What happens |
|---|---|---|
| A — inside | 0 | The frame is filled by facet `f0`, the pink tea stall. Its edges are off-frame. It reads as a photograph, not a shape. |
| B — the shape appears | 0 → ~30% | Camera pulls back. `f0`'s straight edges enter frame and the photograph is visibly cut by them. **This is the moment the idea lands.** |
| C — the mark resolves | ~30 → ~70% | Neighbouring facets enter frame **already filled**. No fade, no stagger, no entrance of any kind. |
| D — settle | ~70 → ~80% | The complete mark reaches resting size. Copy resolves — opacity and a short rise, the only thing moving that is not the camera. |
| E — hold | ~80 → 100% | Nothing moves. The mark and its line sit still before the section releases. |

The hold in E is not padding. A pin that finishes its animation exactly as its
container runs out starts scrolling away at the moment of payoff — the bento
shipped that bug and viewers read it as the scroll jamming.

**What does not move:** the bird's internal geometry. The nine facets never
change size or position relative to one another, at any point, at either width.

**Structural note from the reference:** Apple's equivalent is
`.sticky-container > .sticky-content` with the shape masking media behind it,
plus a `mask-extension-container` — panels that extend the shape's interior so
it reads edge-to-edge when scaled up. Worth knowing, because the prototype
already solved the same problem twice (the derived start scale in `poses()`,
and the `50/s <= cam.x <= 100 - 50/s` cover clamp).

### Reduced motion

Renders the rest pose — the complete mark, copy, readable. Not pinned, no
scrub. A composed still.

## Geometry — measured, not inferred

Decomposed from the artwork's own alpha by connected component, 2026-09-18
(`tools/bird-facets.mjs`). **Nine** components. The prototype's nine
`HIT_REGIONS` polygons match these to within ~1%, so they are the artwork's real
facet geometry and can be used as clip paths directly.

| id | bbox x | bbox y | native px | subject |
|----|--------|--------|-----------|---------|
| f0 | 35.6–78.9% | 6.0–55.1% | 517x546 | Pink tea stall — **the camera starts here** |
| f1 | 35.8–77.7% | 49.0–75.1% | 501x290 | Group outside a village shop |
| f2 | 1.4–45.2% | 0–26.2% | 524x291 | Young man, maroon tee, teal wall |
| f3 | 19.2–41.4% | 50.3–99.9% | 265x551 | Man carrying radishes — the tail |
| f4 | 20.3–45.2% | 7.0–46.3% | 297x437 | Man in orange, app open |
| f5 | 68.4–90.6% | 30.1–54.6% | 265x272 | Older man with lychees — right wing |
| f6 | 44.6–73.8% | 61.7–79.2% | 349x194 | Woman and two schoolchildren |
| f7 | 87.8–99.9% | 30.4–41.0% | 145x117 | Man in a pink turban — right tip |
| f8 | 0.1–15.3% | 7.5–23.6% | 182x179 | Shop signage, dark — left tip |

**The artwork is the shape.** `collage-bird.webp` is already cut to the mark
with its own alpha. Do not rebuild it from polygons or from the official SVG —
that SVG is 8 triangles in a different layout, and three attempts in the
prototype went wrong on exactly this.

## The resolution problem

Facet `f0` is **517px wide**. Filling a 1440px viewport with it means rendering
the artwork ~3330px wide — a **2.8x upscale**, held on screen at the moment the
section opens, which is the moment the whole idea depends on.

The prototype never hit this because the hero's own full-resolution frame sat
over that facet and faded out early. Three ways forward:

- **(a)** Port that live-facet overlay. The hero now comes first, so this works.
- **(b)** Composite the collage from the **real source photographs** instead of
  the baked raster. 25 candidates sit in `reference/assets/salvage-photos/` at
  up to 1400x1050, and `f0`'s source is `Merchant.jpg` at 6000x4000. **The
  facet-to-photo mapping is not established** — a colour match was attempted and
  was not decisive.
- **(c)** Cap the start scale below full-bleed so the section opens with `f0`
  nearly filling the frame and slivers of neighbours already visible. Softer
  framing, sharper pixels.

(b) is the only one that survives a 4K screen, and it is also what makes
per-facet selection tractable. (a) is the cheap near-term answer.

## Content slots

| Slot | Content | Status |
|---|---|---|
| Artwork | `collage-bird.webp`, 1195x1111, nine facets, alpha | **REAL** — resolution caveat above |
| Eyebrow | `Across Bangladesh` | **CLIENT DECK**, word order altered |
| Headline | `Writing Millions of Stories in Motion` | **CLIENT DECK**, same |
| Nine facet stories | none written | **ABSENT** — `needs.md` A4, open with the client |
| Alt text | "The bKash mark, made of photographs of the people who use it" | **PLACEHOLDER** |

The deck's line is one sentence: *"Writing Millions of Stories in Motion Across
Bangladesh."* The prototype split it into eyebrow + headline, reordering the
client's words. Open question 4.

## Acceptance

- [ ] Reads as **one continuous zoom-out** — no cut, fade or dissolve anywhere.
- [ ] The mark **grows without travelling**: cover the fixed point with a finger
      and it stays under the finger for the whole scrub, at both widths.
- [ ] Every facet is **fully populated the instant it enters frame**. Scrubbing
      slowly, none is ever seen empty or fading up.
- [ ] Facets hold position relative to each other throughout — pause anywhere
      and the shape is a correctly-proportioned piece of the bird.
- [ ] **Scrubbing backwards** reverses cleanly and lands exactly on the opening
      frame. No drift, no snap at either end.
- [ ] The opening frame matches the hero's beat-3 frame to within 1px on all
      four edges.
- [ ] The opening frame is **not visibly soft** on a 1440px screen — faces in
      `f0` hold detail.
- [ ] At rest the mark is **recognisably the bKash bird at 390px**.
- [ ] Copy and mark never touch or overlap, 390px to 1920px. No horizontal
      overflow.
- [ ] The composition **holds still** for roughly half a screen before the
      section releases.
- [ ] Reduced motion shows the complete mark and its line, composed, no pin.

## Explicitly NOT this

- **NOT facets flying in and assembling.** Not staggered, not from off-screen,
  not rotating into place. "Collage" names the artwork, not an animation. Every
  facet is in position before it is visible.
- **NOT a fade-up of nine triangles.**
- **NOT a morph into the flat pink logo.** The photographs are the point. No
  pink silhouette at either end.
- **NOT the bird flapping or flying.** `bird-flap.webp` exists in the prototype
  assets and is not this section.
- **NOT parallax between facets.** No depth, no differential rates.
- **NOT rebuilt from polygons or the official SVG.**
- **NOT a growth that also travels.** One fixed point, pure scale.
- **NOT a stepped tween on a gesture.** Scroll position drives it; the
  scrollbar moves the whole time.

## Open questions

1. **Direction — confirm.** Written above as a **pull-back**: the bird gets
   smaller and more of it enters frame, so the shape resolves. Your words were
   *"zoom out"* and *"keep swallowing the screen"*, which point opposite ways —
   zoom-out is a pull-back, swallowing sounds like it grows over the scene. The
   whole spec assumes pull-back. If it is the other, the motion table inverts.

2. **Rest pose — centred, or bird right and copy left?** You said bird-right on
   2026-09-17; a Claude revision later changed it to centred and argued the
   fixed point wants to be near the middle. Your call, and the argument for
   centred is real but it is not yours.

3. **Selectable — this pass or later, and what does it do?** You said "the
   stories might be selectable". A panel beside the bird, the facet expanding in
   place, or navigating away? And **does this replace the three-tile people
   row** — nine selectable stories plus three more directly below is redundant.
   Also: at 390px the facets are 40–90px across, below a reliable tap target, so
   mobile needs a different affordance (a list beneath, or tap-to-cycle).

4. **The deck line** — keep the eyebrow/headline split that reorders the
   client's words, or set it as written?
