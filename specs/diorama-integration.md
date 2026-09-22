# Diorama integration — why the cutouts read as pasted, and what to do

> Status: **DRAFT** — analysis and a recommendation, not an approved plan.
> Deferred by Nahian, 2026-09-22: "ok we will do it in future. keep this
> documented."
> Model: **Fable 5.1** to specify (what the scene is made of is not
> determinable from what is written down); **Opus 5** to implement once it is.
> Source: Nahian, 2026-09-22, in conversation — "separate cutouts make the
> whole scene non-charming… they look like they don't fit here. They look
> fake." Measurements below are from the assets and `hero-beats.ts` as of
> that date.

## The complaint, and the correction to it

Nahian's reading: the cutouts have a different rendering resolution from the
plate, so they look fake. The instinct is right and the **sign is inverted** —
the cutouts are not lower resolution than the plate, they are dramatically
_higher_, and that is what makes them read as stickers.

Each cutout is placed as a fraction of the plate, so its source pixels can be
compared against the plate pixels it covers. Against the **2748×1536** plate
that was in place when this was diagnosed:

|        | plate px it occupies  | source PNG | detail ratio |
| ------ | --------------------- | ---------- | ------------ |
| Amena  | 0.027 × 2748 = 74 px  | 948 px     | **12.8×**    |
| Rahim  | 0.100 × 2748 = 275 px | 1600 px    | **5.8×**     |
| Faysal | 0.102 × 2748 = 280 px | 1546 px    | **5.5×**     |

On screen it is worse, because the camera pushes in. At 1920×1080 the plate
cover-fits to ~1930 CSS px wide; Amena's beat is `s: 4`, so the plate is
stretched to ~7730 px — a **2.8× upscale**. Amena at that moment is 209 px
wide drawn from a 948 px source: **4.5× downsampled, perfectly resolved.**

So at the exact moment the camera asks you to look hardest at her, she is a
razor-sharp element standing on ground that is interpolated mush. Roughly
twelve times the local acuity. The eye reads that instantly as two objects in
two different spaces, and no colour grade fixes it, because the tell is not
colour — it is **resolving power**.

**The 2026-09-22 replate makes this worse, not better.** The client's new
plate is 1678×937, so the same 4× beat is now a **4.6× upscale** of the plate
while the cutouts are unchanged. The mismatch widened from ~12.8× to ~21×.

## The other tells, loudest first

Sharpness is the loudest here, but a matte dropped on a plate always carries
the whole set:

1. **No light wrap.** The single biggest "pasted" cue in compositing. In a
   real photograph the background's light bleeds _over_ the subject's
   silhouette — golden-hour rim on the shoulders, haze eating the edge. A
   cutout has a mathematically clean boundary. Nothing in the scene does this.
2. **Hard matte edge.** A real edge is 2–3 px of optical softness plus colour
   bleed from the surround; an alpha channel is a 1 px step. At `s: 4` that
   step is magnified 4× while the plate's own edges get _softer_ — the
   mismatch widens as the camera pushes.
3. **No contact shadow.** A figure that does not darken the ground it stands
   on floats. Usually the second thing a compositor adds.
4. **Black point.** Golden-hour atmosphere lifts blacks; a cutout with true
   0,0,0 shadows punches a hole in a hazy plate.
5. **Grain / noise floor.** The plate is AI-generated (near-zero sensor noise,
   but a characteristic diffusion texture). Different signatures read as
   different media.
6. **Defocus.** The `soft` field exists for this and every beat currently
   ships `soft: 0`, so nobody is ever defocused.

## What the discipline calls this

**Plate integration.** The standard checklist is the list above: match black
point, colour temperature, light direction, atmospheric perspective, defocus,
grain and edge character — and _deliberately degrade the element's sharpness
down to the plate's resolving power_. That last one is counterintuitive and is
exactly this case: you blur the good element until it is as bad as the plate.

The wrinkle specific to this site: a film comp is matched **once**, at one
focal length. This scene has a **1× → 4.6× camera push**. Grain that matches
at beat 0 is 4× too coarse at beat 3; an edge that matches at beat 0 is 4× too
hard at beat 3. Hand-matching across that range never fully stabilises.

Which is why the professional move, when the element does not need to move
independently, is: **do not composite at runtime. Composite once, upstream,
and ship one plate.**

## Three strategies

### A — Bake them in, keep only the mattes _(recommended)_

Composite the three figures into the plate once, at plate resolution, with
light wrap, contact shadows, grain and a downsample to the plate's acuity.
Export one plate plus three **alpha masks**.

The highlight technique survives intact, because it never needed the person as
an _image_ — it needed the person as a _region_. Today `applyFocus` dims,
desaturates and softens the plate and the non-subject cutouts while the
subject stays full. On a baked plate that becomes: the receded plate at the
bottom, plus a full-strength copy of the same plate on top clipped by the
subject's mask, opacity driven by `focusOf`. One opacity write per element per
frame — inside the perf rules. Same URL, same decode, no extra network.

The mismatch then becomes **structurally impossible rather than tuned away**:
the person _is_ the plate's pixels, so they share its grain, its upscale, its
colour and its noise floor by construction. Nothing can drift.

What usually kills this idea is losing independent motion, and here it costs
**nothing**: `parallaxLead: 0` (turned off 2026-09-19 — "people sliding on the
ground"). The cutouts already have no independent transform. Their only
independent treatment is the recede, which a mask reproduces exactly.

Side benefits: removes ~4.7 MB of cutout PNG and the `fallbackFormat` workaround,
and deletes the whole class of bug where a cutout drifts off its own shadow.

A mask upscales far more gracefully than texture — it is a smooth step, not
detail — and masks stored at plate-local resolution are _correct_ here, since
matching the plate's softness is the goal.

### B — Keep the layers, integrate each element properly

Bake light wrap, contact shadow, edge softening, grain and a **hard
downsample** into each PNG (Amena should ship ~150–200 px wide, not 948).
Keeps future flexibility; costs a real look-dev pass; will never be as stable
across the zoom as A.

### C — Multiplane

Each cutout as a depth plane with its own defocus and atmospheric haze,
Disney-style. The honest answer if real parallax is ever wanted. Most work,
and it does not solve the sharpness problem on its own.

## Sequencing — this matters

Baking gives up the `?place` panel: you cannot drag a figure painted into the
plate. So **reposition first, lock the numbers, then bake.**

Better still, make the bake a `tools/` script that reads the `cut` fractions
straight out of `hero-beats.ts` and emits `plate-composite` plus three masks.
Then repositioning stays alive forever — change the numbers, re-run the
script — and the structural guarantee comes anyway. That is the version to
build.

## Explicitly NOT this

- **Not a colour grade on the cutouts.** The tell is resolving power and edge
  character, not hue. Grading them alone will not close it.
- **Not sharpening the plate.** There is no detail to recover in a 4.6×
  upscale; sharpening an interpolated plate produces halos and makes the seam
  louder.
- **Not upscaling the plate with an AI enhancer** to close the ratio. That
  invents detail the client's artwork does not have and changes the approved
  image.
- **Not raising `soft` on the cutouts to fake integration.** `soft` is a
  _distance_ cue that lifts as a figure becomes the subject — so it is zero
  exactly when the mismatch is most visible. Wrong dial.
- **Not per-frame `filter: blur()`** on anything to achieve this (perf rule 2).
- **Not dropping the highlight technique.** Nahian, 2026-09-22: "I love the
  current highlighting technique of the character." Strategy A keeps it; only
  what it operates on changes.

## Open — Nahian's call

- **Are the cutouts photographic or AI-generated?** If they are photographs
  and the plate is AI, that is a media mismatch no grade fully hides, and A is
  the only strategy that truly closes it, because it makes them literally the
  same medium.
- **Does the client's artwork exist at higher resolution?** 1678×937 pushed to
  4.6× is thin for the largest surface on the site, whatever happens to the
  cutouts. Worth asking before the bake, since the bake wants maximum
  resolution and would be redone if a bigger plate arrives after.
