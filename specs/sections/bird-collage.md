# Section 2: Bird — the mark is made of people

> Status: DRAFT
> Model: **Fable 5.1**, spec and build.
> Source: Nahian, 2026-09-17 (resolved list in `hero-collapse.md`) and
> 2026-09-18 (in conversation); facet geometry measured from the artwork;
> `specs/design-language.md`. Rewritten still-first on 2026-09-18.

## Provenance — decisions from three places, not all agreeing

**Nahian, 2026-09-17:** bird right, text left · white ground, no glow · facets
inert for now, structure kept for a future clickable version.

**Nahian, 2026-09-18:** its own scroll-driven section, not a hero beat ·
stories render in the bird once it pins · the stories *might* be selectable ·
every section must hold as a still (the principle that reopens the first
decision below).

**A Claude session, 2026-09-17:** changed the rest pose to *centred, copy
beneath* and claimed seven facets traced from the logo. The seven-facet claim
is wrong (nine, measured). The centred pose is not Nahian's — it is reopened
below as a still-first question, not adopted.

## Job

Beat 5 of the client's brief: `Writing Millions of Stories in Motion Across
Bangladesh`. The story half ends here. The camera that has just been inside the
merchant's stall pulls back, and the stall turns out to be one facet of the
bKash mark — a mark made of nine photographs of people. It is the last
rendered frame on the page; the next section turns to real people (Rule 1).

## The still

The mark at rest on white, with the line. This is a poster, and it must read
as one at 1920 and at 390 with nothing moving.

Two candidate compositions, because the decision is reopened:

**A — bird right, copy left** (Nahian, 09-17). Mark at ~40% of viewport width
on the right; eyebrow and headline in the left column, measure `--measure-tight`.
Reads as a web layout: image and text side by side.

**B — mark centred, copy beneath.** Mark at ~58% of `--vh` tall, centred, its
vertical centre at ~42%; eyebrow and headline centred beneath. Reads as a
poster: one object, one line.

**Recommendation: B**, on the still-first principle alone — a centred mark
with a line beneath is a poster; side-by-side is a layout. It also lets the
pull-back's fixed point sit near the middle of the screen, which is what keeps
the reveal a pure scale. But A was your decision and B was not; **this is
yours**, Open question 1.

**At 390:** the mark at ~86% of viewport width, centred, vertical centre at
~34% of `--vh`; copy beneath, headline one step down. The mark is never smaller
than ~300px across — at the prototype's 36% it was 140px and stopped reading as
the bird. Composition B at both widths; A would have to become B on a phone
anyway, which is one more reason for B.

## Depth (Rule 2)

Three planes: **ground** (white), **the mark** (one rigid object — never
parallax between facets), **copy**. During the hold and on the way out, the
copy leads the mark by a few percent. That is all.

## Motion

One pinned ScrollTrigger, scrubbed, two to three screens of travel — 2.5 on
desktop, 2 on a phone. The mark is a fixed object; only the camera moves, and
only in scale.

Scale in **log space**; position **derived** from the scale about one fixed
point (the centre of facet `f0` where it lands at rest), never interpolated
separately. Interpolating both is what made the first build read as the mark
sliding while it grew. Ported from `reference/prototype/js/hero.js`.

| Phase | Progress | What happens |
|---|---|---|
| A — inside | 0 | Facet `f0`, the pink stall, fills the frame — the hero's beat-3 pixels. It reads as a photograph. |
| B — the shape appears | 0 → ~30% | `f0`'s straight edges enter frame. The photograph is visibly cut by them. **The moment the idea lands.** |
| C — the mark resolves | ~30 → ~70% | Neighbouring facets enter frame already filled. No fade, no stagger, no entrance. |
| D — settle | ~70 → ~80% | The complete mark reaches its resting size. Copy resolves — opacity and a short rise on the front plane. |
| E — hold | ~80 → 100% | Still. The poster, held, for about half a screen before release. |

Direction is a **pull-back** — the mark gets smaller, more of it enters frame.
Nahian's words were "zoom out" and "keep swallowing the screen"; the first is a
pull-back and the spec follows it. Open question 2 confirms.

### The turn — the transition into the people section

This is the one transition on the page that is about the photography itself
(Rule 1). It is not a set-piece. The bird holds its poster; the section
releases; the people section arrives by ordinary scroll with its own ground
— a warm dark field — rising beneath the white. The register changes because
the ground and the photographs change, not because anything morphs. A line of
copy can bridge it: the bird says *millions of stories*; the people section's
eyebrow answers *meet three of them* (placeholder).

### Reduced motion

The still, composition B, not pinned.

## Geometry — measured

Nine facets, decomposed from the artwork's own alpha by connected component
(`tools/bird-facets.mjs`). The prototype's nine `HIT_REGIONS` match to within
~1% and serve as clip paths directly.

| id | bbox x | bbox y | native px | subject |
|----|--------|--------|-----------|---------|
| f0 | 35.6–78.9% | 6.0–55.1% | 517×546 | Pink tea stall — **the camera starts here** |
| f1 | 35.8–77.7% | 49.0–75.1% | 501×290 | Group outside a village shop |
| f2 | 1.4–45.2% | 0–26.2% | 524×291 | Young man, maroon tee, teal wall |
| f3 | 19.2–41.4% | 50.3–99.9% | 265×551 | Man carrying radishes — the tail |
| f4 | 20.3–45.2% | 7.0–46.3% | 297×437 | Man in orange, app open |
| f5 | 68.4–90.6% | 30.1–54.6% | 265×272 | Older man with lychees — right wing |
| f6 | 44.6–73.8% | 61.7–79.2% | 349×194 | Woman and two schoolchildren |
| f7 | 87.8–99.9% | 30.4–41.0% | 145×117 | Man in a pink turban — right tip |
| f8 | 0.1–15.3% | 7.5–23.6% | 182×179 | Shop signage, dark — left tip |

**The artwork is the shape.** Not rebuilt from polygons or the official SVG
(eight triangles, different layout). Three prototype attempts went wrong on
exactly this.

## Resolution

`f0` is 517px wide. Filling a 1440px viewport with it is a **2.8× upscale** at
the moment the section opens. The hero comes first now, so the prototype's
answer is available: the hero's full-resolution beat-3 frame sits over `f0`
during phase A–B and fades out early, before the upscale would show. Sharp
where it matters, gone before you could catch it. The real fix — compositing
from source photographs — waits on the facet-to-photo mapping, which is not
established (`reference/README.md`).

## Content slots

| Slot | Content | Status |
|---|---|---|
| Artwork | `collage-bird.webp`, nine facets, alpha | **RENDERED** |
| Eyebrow | `Across Bangladesh` | **CLIENT DECK**, word order altered |
| Headline | `Writing Millions of Stories in Motion` | **CLIENT DECK**, same |
| Nine facet stories | none | **ABSENT** — `needs.md` A4 |
| Alt text | "The bKash mark, made of photographs of the people who use it" | **PLACEHOLDER** |

The deck's line is one sentence. The eyebrow/headline split reorders it. Open
question 4.

## Audit rows closed

H5 the `<br>` headline (Rule 3: measure, no `<br>`) · H6 hairline seams
between facets · H10 mobile dead air and clipped copy.

## Acceptance

- [ ] The still, composition B (or A if chosen), reads as a poster at 1920 and
      390 with motion disabled. **Nahian's eye.**
- [ ] One continuous zoom-out — no cut, fade or dissolve anywhere in it.
- [ ] The mark grows without travelling: cover the fixed point with a finger
      and it stays under the finger for the whole scrub, both widths.
- [ ] Every facet is fully populated the instant it enters frame.
- [ ] The nine facets hold position relative to each other throughout.
- [ ] Scrubbing backwards reverses cleanly to the exact opening frame.
- [ ] The opening frame matches the hero's beat-3 frame within 1px, all edges.
- [ ] The opening frame is not visibly soft on a 1440px screen — the hero's
      frame covers `f0` until the mark is small enough to resolve.
- [ ] No white hairlines between facets at any scale.
- [ ] At 390 the mark is recognisably the bird and never under 300px across.
- [ ] Copy and mark never touch, 390 to 1920; no horizontal overflow.
- [ ] The hold lasts about half a screen before release.
- [ ] Reduced motion: the still, composed, no pin.

## Explicitly NOT this

- **NOT facets flying in and assembling.** Every facet is in position before
  it is visible. "Collage" names the artwork, not an animation.
- **NOT a fade-up of nine triangles.**
- **NOT a morph into the flat pink logo.**
- **NOT the bird flapping or flying.** `bird-flap.webp` is not this section.
- **NOT parallax between facets.** One rigid object.
- **NOT rebuilt from polygons or the SVG.**
- **NOT a growth that also travels.** One fixed point, pure scale.
- **NOT a stepped tween on a gesture.**
- **NOT clickable in this pass** — structure and hit targets kept, inert.
- **NOT a transition set-piece into the people section.** The turn is the
  ground and the photographs changing under ordinary scroll.

## Open questions

1. **Rest pose: A (your 09-17 decision) or B (recommended on the still-first
   principle, which is also yours)?**
2. **Pull-back — confirm.** The spec is written as one.
3. **Selectable facets — this pass or later?** Written as later.
4. **The deck line** — keep the split, or set it as written?
