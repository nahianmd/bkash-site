# Section 2: Bird — the street, seen through the mark

> Status: BUILT — 2026-09-19 (Fable). One deviation from the spec's option (a),
> made on the picture and flagged: the street pulls back with the window
> (`content: 'wide'`); `'hold'` is one flag away. Not yet verified;
> SIGNED-OFF is Nahian's alone.
> Model: **Fable 5.1**, spec and build.
> Source: Nahian, 2026-09-18 (evening): "drop the scenes inside the bird — it
> will be closing on the whole display, zooming out." Confirmed as a **mask
> window**, option (a): the window shrinks, the street stays. Earlier decisions
> below where they still apply. `specs/design-language.md`.
> Replaces `bird-collage.md` (same evening) — the nine-photograph collage is
> retired as a mechanism.

## Provenance

**Nahian, 2026-09-17:** bird right, text left · white ground, no glow · one
gesture (superseded: scroll-driven, 09-18).

**Nahian, 2026-09-18, afternoon:** its own scroll-driven section; stories
render in the bird; might be selectable.

**Nahian, 2026-09-18, evening — supersedes the afternoon:** no scenes inside.
The bird is a *window* that closes in on the whole display while zooming out.
What is inside it is the hero's last frame. After it pins, what is inside
**might be replaced** — later, not now.

The earlier Claude-session claims (seven facets, centred pose) are moot for
the mechanism. The rest-pose question survives, below.

## Job

Beat 5: `Writing Millions of Stories in Motion Across Bangladesh`. The story
half ends here. You are looking at Faysal riding into the city — the hero's
last frame. You scroll, and white closes in from the edges *in the shape of
the bKash bird*. The street was inside the mark the whole time. It pins, and
holds: a bird-shaped window onto the neighbourhood, on white, with the line.

Then the page turns to real people (Rule 1).

## Why this and not the collage

The collage needed nine painted scenes, a remake every time the hero changed,
and a 517px facet upscaled to fill a screen. The window needs a vector shape
and the hero frame that already exists. The handover is exact **by
construction** — the window shows the same pixels the hero ended on, because
it is the same element. Nothing to match, nothing to remake, nothing to
upscale.

What it gives up: "every triangle is a different person," and clickable
facets. The people section is next and supplies the faces. Selectable facets
are closed by this design; if wanted someday they are a different section.

## The mechanism — a mask that shrinks

The hero's final frame is retained as the content. Over it sits the mark as a
**mask**: the viewer sees the content only through the bird's shape; outside
it is the white ground.

| Phase | Progress | What happens |
|---|---|---|
| A — inside | 0 | The mask is scaled so the **largest facet's interior covers the whole viewport**. No edge is on screen. What you see is the hero's last frame, unchanged. |
| B — the edges | 0 → ~30% | The mask shrinks about a fixed point. White enters from the corners in straight cuts — the facet's edges. The thin lines between facets appear over the street. **The moment the idea lands.** |
| C — the mark resolves | ~30 → ~70% | More of the silhouette enters. The street is now seen through a faceted window. |
| D — settle | ~70 → ~80% | The complete mark at resting size. Copy resolves — opacity and a short rise on the front plane. |
| E — hold | ~80 → 100% | Still. About half a screen before release. |

**Option (a): the content stays, the window shrinks.** The street keeps its
size — Faysal readable, the plate receded behind him as the hero left it. A
slight scale on the content (a few percent over the whole travel) is allowed
so the two are not perfectly decoupled; it is the Apple reading. **Not (b)**:
the whole frame miniaturising into a small bird leaves the people
unrecognisable.

Scale in **log space** about one fixed point — the centre of the largest
facet where it lands at rest — with position derived from the scale, never
interpolated separately. Ported from the prototype's `poses()`: the same maths
that once positioned the collage now positions the mask. The **start scale is
derived**, not guessed: large enough that the largest facet covers the viewport
about that fixed point at the current aspect. That derivation is what makes
phase A seamless at every screen shape.

**Facet lines.** The thin gaps between the mark's triangles are drawn as
strokes over the window, in the ground colour. Inside the largest facet at
phase A none is on screen; they arrive with the edges. One scene, seen through
a faceted window — the logo's look, no nine scenes.

### The shape

Two sources, one choice:

- **The official mark** — `reference/../specs/refs/bkash-logo.svg`, eight
  triangles, vector, brand-correct. Recommended.
- **The collage's nine-facet layout** — the geometry measured from the
  artwork's alpha. What the client saw in the demo. Not the real mark.

**Decided 2026-09-18: the official mark.** A vector, so the mask is crisp at
any size. The nine-facet geometry in `reference/` stays only as a record.

### After the pin — future, not now

*Nahian, 2026-09-18:* once the mark is still, what is inside it might be
replaced. The mask makes that cheap — the content is one layer under a shape.
Recorded so it is not reinvented; not designed here.

## The still

A bird-shaped window onto the street, on white, with the line. Poster at 1920
and at 390.

**Rest pose — B, decided 2026-09-18 (Nahian).** For the record: A: bird right, copy left (your 09-17 decision).
B: mark centred, copy beneath. Recommended B on the still-first principle — a
centred mark with a line beneath is a poster — and because the fixed point
then sits near the middle of the screen, which keeps the reveal a pure scale.
Yours. Open question 1.

**At 390:** the mark at ~86% of viewport width, centred, vertical centre at
~34% of `--vh`; copy beneath, headline one step down; never under ~300px
across. The content inside is the hero's mobile slice. Composition B at both
widths.

## Depth (Rule 2)

**Ground** (white), **the window and its content** (one object), **copy**.
Copy leads by a few percent during the hold and on the way out.

## The turn into the people section

No set-piece. The bird holds; the section releases; the people section's dark
ground rises beneath the white under ordinary scroll, and the register turns
with it (Rule 1). Bridging copy: *millions of stories* → *meet three of them*
(placeholder).

## Reduced motion

The still, not pinned.

## Content slots

| Slot | Content | Status |
|---|---|---|
| The shape | official SVG or the nine-facet geometry | **VECTOR** — decision pending |
| The content | the hero's final frame | **HERO** — nothing new |
| Eyebrow / headline | `Across Bangladesh` / `Writing Millions of Stories in Motion` | **CLIENT DECK**, split reorders the sentence — kept, flag at copy review |
| Alt text | "The bKash mark, framing a neighbourhood street" | **PLACEHOLDER** |

## Audit rows closed

H5 the `<br>` headline · H6 hairline seams (now deliberate strokes, not
artifacts) · H10 mobile dead air and clipped copy.

## Acceptance

- [ ] The still reads as a poster at 1920 and 390 with motion disabled.
      **Nahian's eye.**
- [ ] At progress 0 the frame is pixel-identical to the hero's last frame —
      no edge of the mask on screen at any width from 390 to 1920. Measured.
- [ ] One continuous move — no cut, fade or dissolve.
- [ ] The mark shrinks without travelling: the fixed point stays under a
      finger for the whole scrub, both widths.
- [ ] The content does not visibly move or rescale beyond the allowed few
      percent; Faysal stays readable to the end.
- [ ] Facet lines arrive with the edges, never pop.
- [ ] Scrubbing backwards reverses cleanly to the exact opening frame.
- [ ] At rest the mark is recognisably the bKash bird at 390 and never under
      300px across.
- [ ] Copy and mark never touch, 390 to 1920; no horizontal overflow.
- [ ] The hold lasts about half a screen before release.
- [ ] Reduced motion: the still, composed, no pin.

## Explicitly NOT this

- **NOT nine photographs.** No collage, no remake, no per-facet content.
- **NOT the frame shrinking into a thumbnail** (option b).
- **NOT a morph into the flat pink logo.** The mark is a window, and what is
  in the window is the street.
- **NOT facets flying in, fading up, or assembling.** The window shrinks;
  nothing else moves.
- **NOT parallax inside the window.** One object.
- **NOT a growth that also travels.** One fixed point.
- **NOT a stepped tween.** Scrubbed.
- **NOT clickable.** Closed by this design.
- **NOT a transition set-piece into the people section.**

## Open questions

1. ~~Rest pose — A or B?~~ — **resolved 2026-09-18 (Nahian): B**, centred,
   copy beneath, at both widths.
2. ~~The shape~~ — **resolved 2026-09-18: the official mark**,
   `specs/refs/bkash-logo.svg`. The collage layout is retired with the collage.
3. ~~The deck line~~ — **resolved 2026-09-18: keep the split**, and flag the
   reordering to the client in one line at copy review.
