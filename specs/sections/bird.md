# Section 2: Bird — the street, seen through the mark

> Status: BUILT — 2026-09-19 (Fable), **revised the same day to one pin**: the
> bird's window lives inside the hero's pinned frame and the hero's single
> trigger drives both. Nahian saw the two-pin seam; one frame cannot seam
> with itself. `content: 'wide'` (the street pulls back with the window) is
> a deviation from option (a), flagged; `'hold'` is one flag away. Not yet
> verified; SIGNED-OFF is Nahian's alone.
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
The bird is a _window_ that closes in on the whole display while zooming out.
What is inside it is the hero's last frame. After it pins, what is inside
**might be replaced** — later, not now.

The earlier Claude-session claims (seven facets, centred pose) are moot for
the mechanism. The rest-pose question survives, below.

## Job

Beat 5: `Writing Millions of Stories in Motion Across Bangladesh`. The story
half ends here. You are looking at Faysal riding into the city — the hero's
last frame. You scroll, and white closes in from the edges _in the shape of
the bKash bird_. The street was inside the mark the whole time. It pins, and
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

| Phase                 | Progress   | What happens                                                                                                                                                                                   |
| --------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A — inside            | 0          | The mask is scaled so the **largest facet's interior covers the whole viewport**. No edge is on screen. What you see is the hero's last frame, unchanged.                                      |
| B — the edges         | 0 → ~30%   | The mask shrinks about a fixed point. White enters from the corners in straight cuts — the facet's edges. The thin lines between facets appear over the street. **The moment the idea lands.** |
| C — the mark resolves | ~30 → ~70% | More of the silhouette enters. The street is now seen through a faceted window.                                                                                                                |
| D — settle            | ~70 → ~80% | The complete mark at resting size. Copy resolves — opacity and a short rise on the front plane.                                                                                                |
| E — hold              | ~80 → 100% | Still. About half a screen before release.                                                                                                                                                     |

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

_Nahian, 2026-09-18:_ once the mark is still, what is inside it might be
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
with it (Rule 1). Bridging copy: _millions of stories_ → _meet three of them_
(placeholder).

## Reduced motion

The still, not pinned.

## Content slots

| Slot               | Content                                                       | Status                                                                   |
| ------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| The shape          | official SVG or the nine-facet geometry                       | **VECTOR** — decision pending                                            |
| The content        | the hero's final frame                                        | **HERO** — nothing new                                                   |
| Eyebrow / headline | `Across Bangladesh` / `Writing Millions of Stories in Motion` | **CLIENT DECK**, split reorders the sentence — kept, flag at copy review |
| Alt text           | "The bKash mark, framing a neighbourhood street"              | **PLACEHOLDER**                                                          |

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

- **NOT nine photographs.** No collage, no remake, no per-facet content
  _during the shrink_ — nothing flies in or assembles. Per-facet content at
  **rest** was reserved in Provenance ("after it pins, what is inside might be
  replaced — later, not now") and Nahian called it in on 2026-09-22; see the
  revision below. The prohibition is on the mechanism, not the rest state.
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

## Revised 2026-09-20 — the nav through the bird

The nav stays transparent through the whole pin, the white included: its
own dark underlay carries the links over anything. `navSolidAt` is gone;
the hero section's end marker alone makes the switch, so the wall (on
white) starts solid.

## Revised 2026-09-22 — three facets hold the three characters

> Status of this revision: **BUILT** — 2026-09-22, on Opus 5. The spec's header
> tags the bird **Fable 5.1**; that was raised before starting and Nahian waved
> it on. Decisions are his; the geometry and timing are measured, not proposed.
> Not verified — `/verify` has not run. SIGNED-OFF is Nahian's alone.
>
> Built without a `/plan` pass, deliberately: Nahian, 2026-09-22 — "this is a
> new spec on an existing implementation, it's rather a modification or
> extension spec." `/implement` first stopped on its own rule about an
> incomplete plan, which was the letter of the process past its purpose for a
> modification to a BUILT section. What the build then settled is recorded in
> `specs/bird/plan.md` under its own 2026-09-22 revision.

_Nahian, 2026-09-22:_ "when the bird is pinned I want its inner image to
change. 3 large triangle of the bird will hold 3 hero characters." Then, asked
which facets, what content and when: **"2,1,6, scene crop, swap lands when the
bird fully rests and when the copy is about to appear."**

This is the option Provenance reserved on 2026-09-18. It does not contradict
the shrink mechanism: the window still shrinks as one object, nothing
assembles, and the swap happens only once the shrink is over.

### The facets, and which character goes where

**Settled by Nahian's annotated render, 2026-09-22** (`C` customer, `M`
merchant, `A` agent, drawn over the live bird). Claude's earlier guess — the
mark's reading order, landing customer -> agent -> merchant — was **wrong on
two of the three**: the centre facet is the MERCHANT, not the agent, and the
agent is the lower triangle. Recording the guess as a guess is what caught it.

| facet  | who                        | bbox (bird units) | aspect | centroid                  |
| ------ | -------------------------- | ----------------- | ------ | ------------------------- |
| 2      | **Amena** (customer, `C`)  | 457 x 446         | 1.025  | (0.272, 0.177) upper left |
| 1      | **Faysal** (merchant, `M`) | 442 x 463         | 0.955  | (0.546, 0.363) centre     |
| 0 or 6 | **Rahim** (agent, `A`)     | below             | below  | lower                     |

**Superseded 2026-09-24 — rotated one place.** Nahian: "customer will be in
current agent's position, agent will be in current merchant's position and a
little bit zoomed in, and the merchant will be in customer's position." A clean
3-cycle, so every facet still holds exactly one person:

| facet    | position   | was    | now        |
| -------- | ---------- | ------ | ---------- |
| top wing | upper left | Amena  | **Faysal** |
| middle   | centre     | Faysal | **Rahim**  |
| flat     | lower      | Rahim  | **Amena**  |

All three fit their new triangle at `fill 0.7`. The agent's "little bit zoomed
in" is `fill 0.82` with `bg 0.188` — both dials together, because `fill` alone
enlarges the figure against an unchanged street and reads as him stepping
forward rather than as a tighter shot. ~17% in; the background's upscale goes
1.59x to 1.86x.

### Resolved — the agent's triangle is facet 0

Nahian's two answers disagreed: the text said "2,1,6", the render put the `A`
at bird-fraction (0.484, 0.634) — inside facet 0 by a point-in-triangle test,
and nearest facet 0's centroid at d=0.060 against facet 6's at d=0.205.
**Nahian, 2026-09-22: trust the render.** The set is `2, 1, 0`.

Claude's earlier objection to facet 0 — "landscape, a standing figure does not
fit it" — **does not apply to a scene crop, and is withdrawn**. It was an
argument about pasting a cutout edge-to-edge. A landscape crop of the stall
with Rahim inside it is a framing choice, not a fit failure.

`2, 1, 0` also carries a second virtue: they are the three _largest_ facets,
75.7% of the mark, so the rule reads as **the big triangles hold the people,
every small one stays street** — cleaner than a mixed set.

`START_CANDIDATES = [1, 2]`, so two of the three are the facets the reveal
opens inside. See the collision note below; the timing is what defuses it.

### When the swap lands

Nahian's two clauses — "when the bird fully rests" and "when the copy is about
to appear" — look like different moments, because `motionEnd` is 0.8 and
`copyFrom` is 0.7. They are not. `cubicInOut` front-loads the ease, so at
**q = 0.70** the eased motion fraction is **0.9922** and the mark is **1.017x**
its rest size — 1.7% off, invisible — while the copy is still at exactly zero
opacity.

| q        | eased motion | mark vs rest | copy opacity |
| -------- | ------------ | ------------ | ------------ |
| 0.60     | 0.9375       | 1.148x       | 0.00         |
| 0.65     | 0.9736       | 1.060x       | 0.00         |
| **0.70** | **0.9922**   | **1.017x**   | **0.00**     |
| 0.75     | 0.9990       | 1.002x       | 0.50         |
| 0.80     | 1.0000       | 1.000x       | 1.00         |

So **q = 0.70 satisfies both clauses at once** and no change to `motionEnd` or
`copyFrom` is needed. The swap completes there, and the sequence reads: window
shrinks -> settles -> characters arrive -> copy rises. A crossfade ending at
0.70 rather than a hard cut, to match the section's scrubbed idiom; where it
begins is open (a `swapFrom` beside the existing `copyFrom`).

### The collision this avoids

`START_CANDIDATES = [1, 2]` — the reveal begins _inside_ facet 1 or 2, scaled
until it covers the viewport. Two of the three chosen facets are therefore the
ones the section opens inside. Had the characters been present from q = 0, the
bird would open on a screen-filling portrait instead of the street continuing
out of the hero, which is exactly the seam the one-pin redesign exists to
prevent. Landing the swap at rest removes the problem entirely — but it is the
reason the timing is load-bearing and not a preference.

### The plate does not have the pixels — flag

Measured at rest, desktop 1920x1080, DPR 2:

| facet | who    | triangle  | needs     | = % of plate height | the beat frames | upscale   |
| ----- | ------ | --------- | --------- | ------------------- | --------------- | --------- |
| 2     | Amena  | 303 x 296 | 606 x 592 | 63.2%               | 25.0%           | **2.53x** |
| 1     | Rahim  | 293 x 307 | 586 x 614 | 65.5%               | 33.3%           | **1.97x** |
| 6     | Faysal | 138 x 320 | 276 x 640 | 68.3%               | 28.6%           | **2.39x** |

A crop framed as tightly as its own beat is upscaled 2.0-2.5x to fill its
triangle at retina. For pixel-exact crops at that framing the plate would need
to be roughly 1850-2400px tall; it is **937**. This is
`specs/diorama-integration.md` reappearing somewhere new, and it sharpens the
open question there about whether the client's artwork exists larger.

Three ways out, none of them free:

1. **Accept the upscale.** The triangles are small and the mark reads as a
   graphic device, so it may simply not matter. Cheapest, and needs an eye on
   it rather than an argument.
2. **Loosen the crops.** More context, less portrait — a crop 2.5x looser than
   the beat is pixel-exact but is no longer a close-up of anyone.
3. **Composite each crop live** from the plate plus the high-resolution cutout,
   rather than pre-rendering a flat image with `getImage()`. The figure then
   stays sharp and only the street behind it is soft — the same trade the hero
   already makes at these zooms, so it at least stays consistent with itself.
   Costs three posed scene layers instead of three images.

### 390 — the same as desktop

**Nahian, 2026-09-22: "same as desktop."** All three characters on a phone,
at whatever size they land. Decided with the measurement in hand, not around
it — so this is an accepted cost, not an oversight.

At rest on a phone the mark is `0.86 x 390 = 335px` wide, so `k = 0.335`:

| facet | who    | desktop   | phone        |
| ----- | ------ | --------- | ------------ |
| 2     | Amena  | 303 x 296 | 153 x 150    |
| 1     | Faysal | 293 x 307 | 148 x 155    |
| 0     | Rahim  | 293 x 175 | **148 x 88** |

One composition at both widths, no branch, no second rule to keep in step —
which is worth something in itself. What it buys at 390 is that the agent's
window is 88px on its short axis: at that size a scene crop reads as texture
and colour rather than as a person, and Amena and Faysal at ~150px square are
legible but not portraits.

The thing to actually look at when it is built: whether three small windows of
street-with-a-figure still read as _people_ on a phone, or whether the mark
just looks busier. If it is the latter, the fallbacks are already costed — two
windows on a phone with facet 0 keeping the street, or desktop-only — and
neither needs the mechanism rebuilt, only a media query. Nahian's eye, not a
measurement.

### Status of this revision

Every question this revision opened is now closed:

- facets — `2, 1, 0` (Nahian, from the render)
- pairing — 2 Amena / 1 Faysal / 0 Rahim (Nahian, from the render)
- content — scene crop (Nahian)
- timing — swap completes at `q = 0.70` (measured; satisfies both of Nahian's
  clauses at once)
- 390 — same as desktop (Nahian)

What is left is the build, plus the one thing no decision closes: the plate
does not have the pixels for these crops (2.0-2.5x upscale at retina, see
above). That is `specs/diorama-integration.md`'s open question about whether
the client's artwork exists larger, and it is worth asking the client before
the crops are baked rather than after.

**Model: Fable 5.1** for the build, per this spec's own header.
