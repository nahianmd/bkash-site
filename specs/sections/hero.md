# Section: Hero — one camera through one street

> Status: DRAFT
> Model: **Fable 5.1 to specify and to build the camera.** The framing, the
> 1px handover contract and the mobile re-anchoring fail quietly — almost-right
> is the expensive outcome here. **Opus 5** for the rest of the build.
> Source: Claude, 2026-09-18, from the prototype's `SCENE` data, the client
> deck copy already in it, and `specs/prototype-audit.md` H1–H11.
> **New spec.** The prototype's four story beats were built but never written
> down — `hero-collapse.md` only ever covered the bird that followed them.

## Intent

One photograph of one neighbourhood, and three lives inside it. The camera
does not cut — it pushes in, finds someone, holds long enough for you to read
who they are, then travels on. By the end you understand that a customer, an
agent and a merchant are all standing in the same street, and that bKash is
what connects them.

The opening frame is the claim: **300 transactions every second**. The three
beats that follow are the evidence.

## What changes from the prototype

The composition and the camera maths stay. Two things change:

1. **It is scrolled, not gestured.** The prototype intercepted the wheel and
   advanced one beat per gesture (`hero.js:404-470`), so the scrollbar never
   moved and the page read as frozen — audit **H1**. It becomes a pinned
   ScrollTrigger with real travel.
2. **It ends on the merchant.** The bird was beat 5; it is now its own section.
   This spec owns beats 0–3 and the frame it hands over on.

## Layout

### Desktop, per beat

A full-bleed plate under a camera transform, with the subject cutouts placed
as fractions of the plate so they travel with it. Caption block bottom-left,
progress dots right.

| Beat | Camera (x, y, scale) | Subject | Caption |
|---|---|---|---|
| 0 | 50, 50, 1.0 | — establishing | `300 Transactions Every Second` / `The Digital Rhythm of Bangladesh` |
| 1 | 29.5, 57.0, 3.1 | Customer | `7 in 10 Adults in Bangladesh` / `Control Their Money with bKash` |
| 2 | 59.1, 28.2, 3.0 | Agent | `One Agent Every 2 KM` / `Your Neighborhood is the Branch` |
| 3 | 79.4, 27.0, 5.5 | Merchant | `From Floating Stalls to Digital Storefronts` / `Moving Millions of Cashless Commerce` |

Camera targets ported verbatim from `reference/prototype/js/hero.js`. They are
hand-framed against that specific photograph and are not derivable — if the
plate changes, every one of them is re-framed by eye.

**The caption must be legible on every beat.** In the prototype it was not:
the pink eyebrow vanishes against sand on beats 1 and 3, and beat 2 is white
text on pale wood — audit **H4**. The captions need their own ground, not a
vignette tuned for a different frame.

### Mobile (390px), in its own right

The wide plate is 16:9. Cover-cropped on a portrait phone it shows about a
quarter of its width, and the cutouts are positioned against the viewport — so
people stand in the wrong places relative to the background. The prototype
solved this with a second, portrait photograph plus `anchorPortrait()`, which
re-places every cutout against it **and re-derives the camera targets** from
where each one actually lands. That function is the single most valuable thing
in the hero and it ports as-is.

Two things it did not solve, and this spec must:

- The headline sits **on top of the subject** (audit **H8**). The mobile
  composition needs the copy and the person to occupy different thirds.
- Captions run edge-to-edge at `t-h2` with no measure control (**H9**).

## Motion

One pinned ScrollTrigger, scrubbed, **snapping to the four beats**.

Snap is the point: it keeps the promise that every frame a viewer rests on is
one somebody composed, while the scrollbar still moves the whole way and any
position remains reachable. Free scrub alone would let the page park
half-zoomed between two subjects, which is the state the prototype's stepper
existed to prevent.

| Phase | Progress | What happens |
|---|---|---|
| Travel | 0 → 1 | Camera moves continuously between the four targets. Scale interpolates in **log space**, position in the cubic ease — ported from the prototype, and the reason the zoom rate reads as constant. |
| Snap | on scroll-end | Settles to the nearest beat. |
| Caption | per beat | The caption for the beat being approached resolves; the previous one clears. Opacity and a short rise, nothing else. |
| Release | 1 | Hands over to the bird section on beat 3's frame. |

**What does not move:** the cutouts relative to the plate. They are children of
the transformed scene, so this is true by construction.

**Travel budget:** roughly one screen per beat, so four. To be confirmed against
feel — the number that matters is how much scroll separates two adjacent
subjects, not the total.

### The handover — the contract with `bird-collage`

Beat 3 must end framed so the bird's largest facet can take over the viewport
with no visible cut. In the prototype this was exact: the live facet measured
**0px error on x, y, width and height** against the viewport at the start pose.
That is the standard to hold.

This section therefore owns beat 3's final camera, and the bird section is
built against it — **not the other way round.**

### Reduced motion

Renders beat 0 — the establishing frame, headline, and a visible way to reach
the sections below. Not pinned. A composed still, not a blank box.

## Content slots

| Slot | Content | Status |
|---|---|---|
| Plate, wide | `scene-plate-wide.webp` | **AI-GENERATED** — see Open question 1 |
| Plate, portrait | `scene-plate-portrait.webp` | **AI-GENERATED**, and a different scene — Open question 2 |
| Cutouts | `cut-customer.webp`, `cut-agent.webp`, `cut-merchant.webp` | **AI-GENERATED** |
| Beat 0 copy | `300 Transactions Every Second` / `The Digital Rhythm of Bangladesh` | **CLIENT DECK** |
| Beat 1–3 copy | as tabled above | **CLIENT DECK** |
| Scroll cue | `Scroll to meet them` | **PLACEHOLDER** |
| Character names | Amena, Faisal, Rahim appear in the prototype's tuning code but never on screen | **UNVERIFIED** — origin unknown, see Open question 5 |

## Audit rows this section closes

`H1` scroll-jacking · `H2` rect in the wheel handler · `H3` `touch-action:none`
set at init · `H4` caption legibility · `H7` `hero-light` never cleared ·
`H8` mobile headline over subject · `H9` mobile caption measure ·
`H11` per-frame rect in `initNav`.

`H5`, `H6` and `H10` belong to the bird section, not this one.

## Acceptance

- [ ] The page scrollbar moves continuously from the first beat to the last.
      Nothing is ever swallowed.
- [ ] Scrolling forward and back lands on the same four frames, with no drift
      and no half-zoomed resting state.
- [ ] A trackpad flick does not skip a beat; a slow drag can sit between two
      and settle to the nearer one.
- [ ] The caption is legible on **all four** beats at both widths — measured,
      at least 4.5:1 against the pixels actually behind it, not against an
      assumed ground.
- [ ] On mobile, copy and subject never overlap on any beat.
- [ ] On mobile, every subject stands in the right place against the portrait
      plate at every beat — the re-anchoring holds under resize and rotation.
- [ ] The scene covers the viewport at every point in the travel. No ground
      shows at any edge, at any scale, at either width.
- [ ] Beat 3's final frame matches the bird section's opening frame to within
      1px on all four edges.
- [ ] No `getBoundingClientRect` in any input handler.
- [ ] With `prefers-reduced-motion`, beat 0 renders composed and readable and
      the page scrolls normally.
- [ ] No horizontal overflow at 390px.

## Explicitly NOT this

- **NOT one gesture per beat.** That is precisely what is being removed. Scroll
  position drives the camera; snap only decides where it settles.
- **NOT a cut, dissolve or crossfade between beats.** One camera, moving.
- **NOT the subjects moving independently of the plate.** They are pinned into
  the photograph and travel with it.
- **NOT a blur that animates.** The prototype kept a depth-of-field dial at
  `DOF = 0` because it flattened the scene and killed the depth the zoom was
  creating. Leave it at zero.
- **NOT a re-framing of the camera targets.** They are hand-set against this
  photograph. Touch them only if the photograph changes.
- **NOT desktop's composition narrowed for mobile.** The portrait plate is a
  different crop of a different scene and needs its own copy placement.
- **NOT owning the bird.** This section ends on beat 3. What happens to that
  frame afterwards belongs to `bird-collage`.

## Open questions

1. **The hero is AI-generated and everything below it is real photography.**
   This is flagged in `CLAUDE.md` as the biggest remaining exposure, and it has
   to be settled *here* rather than later, because every camera target above is
   framed by eye against this specific image. Replacing the plate is not a swap,
   it is a re-framing of the whole section. Is it staying?

2. **Does mobile keep a separate portrait plate?** Right now desktop and mobile
   show different photographs of different scenes — arguably fine, since nobody
   sees both, but it means two art directions to keep in step. Alternative is
   one plate with a safe portrait crop, which costs composition on desktop.

3. **Snap, or free scrub?** Recommending snap, for the reason in Motion. Worth
   confirming, because it is the one place the old stepped feel survives, and
   you may want it gone entirely.

4. **How much travel per beat?** One screen each is the starting proposal. This
   is a feel judgement and better made against something running than in a spec.

5. **Amena, Faisal, Rahim** — these names exist only in the prototype's console
   tuning helper and never reach the screen. Are they real people from the
   client's material, or were they invented during the build? It matters if a
   caption ever names them.

6. **`Scroll to meet them`** — my line or the client's? It is not in the deck
   copy that the other lines came from.
