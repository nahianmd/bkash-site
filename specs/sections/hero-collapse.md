# Section: Hero — collapse from Rahim into the bird

> Status: BUILT — revision proposed, see 'Revision: scroll-linked reveal'
> Source: Nahian, 2026-09-17, correcting the first implementation

## Intent

The bird was always there. We were inside one of its facets the whole time
without knowing it. Pulling back reveals that Rahim's frame was one triangle
of the bKash mark, and the rest of the mark is already populated with other
people's lives.

The reveal is a **camera move**, not a transition effect. Nothing morphs,
nothing dissolves, nothing assembles.

## Layout

At rest: the bird sits on the **right**, text column on the **left**.
Background is **white** — this is where the page leaves the dark hero and
enters the light half of the site. No pink glow behind the mark.

The white is invisible at the start of the move (Rahim covers the frame
entirely) and is revealed by the zoom-out, so the ground can simply be set
rather than cross-faded.

## Motion beats

One continuous zoom-out. The bird is a fixed object in space; the camera
starts deep inside facet a5 and pulls back until the whole mark is in frame.

| # | Trigger | What happens | Duration |
|---|---------|--------------|----------|
| 1 | Arrive at beat 3 | Rahim fills the screen. The bird exists, scaled so that facet a5 alone covers the viewport — its edges are off-screen, so nothing looks cropped yet. | — |
| 2 | Scroll gesture | Camera begins pulling back. Facet a5's triangular edges enter frame and Rahim is visibly cropped by them. | ~0–35% |
| 3 | (continuous) | Neighbouring facets enter frame, **already filled** with their photographs. Nothing fades in, nothing flies in. | ~35–80% |
| 4 | (continuous) | The complete bird settles at its resting size and position. Headline and body text resolve alongside it. | ~80–100% |

What does **not** move: the bird's internal geometry. The facets never change
size or position relative to one another. Only the camera moves.

## Content slots

- Facet a5 — Rahim Mia's frame. Must be visually continuous with beat 3.
- Facets a2, a3, a4, a6, a7, a8, a9, a10 — eight photographs, pre-filled.
  Currently the prototype's story images. **PLACEHOLDER** (see needs.md A4).
- Headline + body beside the bird. **PLACEHOLDER** copy.

## Acceptance

- [x] The move reads as one continuous zoom-out, with no cut, fade or dissolve.
      VERIFIED structurally: one transform on one element; no opacity or clip
      animation anywhere in the path. **Needs Nahian's eye for feel.**
- [x] Rahim's frame never changes shape. VERIFIED: at the start pose the live
      facet measures exactly 0px error on x, y, width and height against the
      viewport, so the handover from beat 3 is pixel-identical. The facet's
      clip polygon is static; only the bird's scale changes.
- [x] Every other facet is fully populated the instant it enters frame — they
      share one montage image and have no entrance animation at all.
- [x] Facets hold position relative to each other: all nine are children of one
      transformed box, so this is true by construction.
- [x] At rest the bird occupies 40% of viewport width on the right with a 115px
      gap; the text column runs to 1037px. No overlap.
- [ ] Reversing the gesture runs the move backwards cleanly. **Needs checking.**

## Explicitly NOT this

The first implementation, which was wrong in a specific way worth recording:

- **NOT** Rahim's viewport shrinking and travelling toward the collage.
  The frame stayed full-bleed and moved; it should stay put and be cropped.
- **NOT** the viewport's clip morphing from a rectangle into a triangle.
  The triangle is pre-existing and static; it is revealed, not formed.
- **NOT** facets flying in from off-screen and assembling, staggered.
  They are already in place before they are visible.
- **NOT** a cross-dissolve between the live scene and a separate collage.
  There is only one object and one camera.

## Resolved (Nahian, 2026-09-17)

1. Bird right, text left.
2. No glow. Background white.
3. Facets are static now; clickable is a future want, so keep the per-facet
   structure and hit targets in place but inert.
4. One gesture: Rahim -> bird is a single beat.


---

## Revision: scroll-linked reveal (proposed 2026-09-17)

> Reference: the MacBook Pro page, where a video is clipped inside giant
> "MacBook Pro" lettering and the type scales down until the words resolve
> with the video playing inside them.

**The mechanic is already what we built.** Nine polygons masking one montage,
starting so large that a single facet fills the screen, scaling down until the
mark resolves. That part needs no change.

**What differs is how it is driven.** Ours is a 1100ms tween fired by one
gesture — you press once and watch it happen. Apple's is scrubbed: the zoom is
a direct function of scroll position, it runs over several screens, and you
control the pace. That is why theirs reads as a reveal and ours reads as a
transition.

### Proposed change

Lift the bird out of the stepped hero and make it its own scroll-pinned
section, scrubbed like the phone bento:

- The hero keeps four stepped beats: wide, Amena, Faisal, Rahim. One gesture
  each, unchanged.
- The bird becomes the next section: pinned, two or three screens of scroll,
  with the zoom-out linked directly to scroll position.
- It still begins pixel-aligned with Rahim's frame, so the handover stays
  invisible.

This also resolves a tension in the current build: one-gesture-one-beat is
right for story beats, where each frame is a composed picture. It is wrong for
a continuous reveal, which wants to be scrubbed.

### Open questions

1. **Confirm the diagnosis** — is it the scroll-linked pacing you are after,
   or something else about that Apple section?
2. **How long?** Apple gives its chip family ~2.2 screens per item. Two to
   three screens for the whole bird reveal feels right; more and it drags.
3. **Does the bird stay stepped at the end**, or does the section simply
   release to the page once the mark has resolved?


---

## Revision: real geometry + pure scale (2026-09-17)

**The shape was wrong.** The nine polygons inherited from the old prototype do
not form the bKash bird. Replaced with geometry traced from the mark itself in
`logo-bkash.png`: the bird occupies a 447x422 box there, each pink region was
isolated by colour (the wordmark beside it is black), split into connected
components, and reduced to a convex hull.

Result: **seven** facets, which is what the mark actually has. Verified at
**97.4% coverage of the real mark with zero spill outside it**.

**The motion was wrong too, and for a specific reason.** The old version
centred the LIVE FACET at the start but the WHOLE BIRD at the end, and
interpolated position between those two poses. So the mark travelled across
the screen as well as growing — two motions read as one muddle.

Now there is a single fixed point: where the live facet's centre sits once the
bird is at rest. Scale is interpolated in log space and **position is derived
from it**, never interpolated separately. That makes the reveal a pure zoom.

The bird rests **centred**, with the copy beneath it, because a pure scale
wants its fixed point near the middle of the screen — off to one side it reads
as travel again.
