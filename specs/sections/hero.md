# Section 1: Hero — one camera through one street

> Status: DRAFT
> Model: **Fable 5.1** to specify and to build the camera and the focus
> mechanism. **Opus 5** for the rest of the build.
> Source: Nahian's concept (approved by the client on style), the client's
> five-beat copy and four flags, `specs/design-language.md`, and — new on
> 2026-09-18 — **four illustrated assets** in `reference/assets/img/`
> (`hero.jpeg`, `amena.png`, `Rahim.png`, `Faysal.png`) that replace the AI
> street and are the **previs for a real photo shoot on a real set.**
> Re-specified around them the same day.

## Job

The claim, then three lives in one street. Beat 0 says *300 transactions every
second*. Beats 1–3 make it human: a customer, an agent, a merchant, all in the
same picture. The hero is the **story** half of the site (Rule 1).

It ends on the merchant, framed so the bird's largest facet can take the
viewport with no visible cut. That frame is this section's contract with
section 2 — and it has a consequence for the bird, below.

## The scene — what the new plate gives us

`hero.jpeg`: a neighbourhood street at golden hour. A great tree and a
three-storey building on the left; a bKash **ক্যাশ আউট ৳১৩.৯৫** banner across
its face; a tea stall at ground level under the banner with three men at a
table; a woman on the balcony above, lit by her phone; a man on a red scooter
carrying an improbable load of sacks, riding away up the street; walkers,
laundry, power lines, rooftops receding to a city skyline.

This is a better picture than the one it replaces, for reasons that matter to
the build:

- **It is already a diorama.** Tree and building (front), street and scooter
  (middle), rooftops and skyline (back). Rule 2's planes are in the picture.
  If the illustrator can deliver it **layered** — tree / building / street /
  rooftops / sky — the parallax is real depth, not two layers faking it.
- **The brand is native to the scene.** The banner is a real thing a real
  agent hangs. It is the agent beat's subject without anyone having to say so.
- **Three subjects at three depths and three heights.** Balcony, ground,
  road. The camera travels up, down, then out — a path, not three cuts.
- **It is illustrated, and that makes Rule 1 stronger, not weaker.** A
  storybook street, then real people. The seam is more deliberate than the
  AI-photoreal plate ever managed. After the shoot the hero becomes *staged*
  real photography against *candid* real photography — a softer seam, still
  a designed one.

## The three, in the new order

*Nahian, 2026-09-18: Amena, then Rahim, then Faysal.* Same copy order as the
client's beats 2–4; the subjects are re-cast against the new scene.

| Beat | Subject | Where in the plate | Copy |
|---|---|---|---|
| 1 | **Amena — customer** | On the balcony, phone in hand, the pink glow of the screen on her face | `7 in 10 Adults in Bangladesh` / `Control Their Money with bKash` |
| 2 | **Rahim — agent** | The tea stall under the banner. The banner *is* the branch. | `One Agent Every 2 KM` / `Your Neighborhood is the Branch` |
| 3 | **Faysal — merchant** | On the scooter, goods stacked to the sky, riding into the city | `From Floating Stalls to Digital Storefronts` / `Moving Millions of Cashless Commerce` |

Beat 3 pushes *out along the road* toward the skyline. That is the right
direction to hand over on — the story leaves the street and opens into
*millions of stories* — and it is also why the bird has to change (below).

**One of the three is weaker than the other two.** `Rahim.png` is three men at
a table — a group, seen from the side, and none of them is the agent. Amena and
Faysal each have a face for the camera to find; the agent beat has a banner
and a crowd. For the shoot, and ideally for the illustration too: **put the
stall owner in frame, behind his counter, under his own banner.** Then "one
agent every two kilometres" has a person.

## The stills

### Beat 0 — the street (1920)

The plate full-bleed. All three in place, small, part of the street. Headline
`300 Transactions Every Second` and `The Digital Rhythm of Bangladesh`
**bottom-right on the scrim** (Rule 3) — the lower right of this plate is open
road and rooftops, and the left is where all three subjects live. Scroll cue
beneath. The prototype's mid-frame headline with a text-shadow is gone.

### Beats 1–3 — a life (1920)

The camera on one subject. Caption bottom-left on the scrim: eyebrow,
headline, line. **The other two and the plate recede** (Rule 4) — the client's
"mechanism that focuses each story," which the prototype did not have.

Starting camera estimates, read off the plate — **set by eye against the
build, with the `nudge()` helper kept in dev.** These are not the old targets;
those were framed to a different photograph and are dead.

| Beat | ~x, y (% of plate) | ~scale | Note |
|---|---|---|---|
| 1 | 41, 50 | 4× | Amena is small; the cutout carries the detail |
| 2 | 37, 74 | 3× | Frame the table *and* the banner above it |
| 3 | 55, 78 | 3.5× | Faysal right of centre, road and skyline open to the right |

### 390 — one wide plate, a small window, and the camera slides

*Nahian, 2026-09-18: the phone loads the whole picture, shows the slice that
fits, and when a beat focuses something outside the slice the picture slides
to bring it in.* That is the camera as already specified — translate is the
slide, scale is the zoom — so **there is no portrait plate.** One wide picture
serves every screen shape.

Why the prototype needed a second photograph: a bug, not a limit. It placed
the cutouts as percentages of the *viewport* while the plate underneath was
cover-cropped, so on a phone the plate shifted and the people did not. The fix
is to **anchor the cutouts to the plate's rendered box**, not the viewport.
`anchorPortrait()` and the portrait plate are retired; the re-derivation of
camera targets from where cutouts land is kept, because it is the same idea
applied to one plate at any aspect.

**Beat 0 at 390 is a chosen slice.** Cover-fit to 780 tall shows ~28% of the
plate's width at full height. Amena is at ~41% across, the table at ~37%,
Faysal at ~55%: a window centred at **~46%** contains all three. That is the
still — the building, the banner, the three people. The tree and the skyline
are the trade. `object-position` sets it once.

Composition at 390: headline in the bottom third on the scrim; subjects in the
middle third (Rule 3). Captions at a measure that fits.

**Resolution on a phone.** Cover-fit on a 3× handset shows the plate at ~2.6×
its pixels before the camera moves, ~10× when zoomed on Amena — survivable
only because (a) the cutouts carry the zoomed beats, and (b) the plate recedes
when a subject is focused (Rule 4), so its softness is masked by the softness
applied on purpose. The plate has to survive beat 0 unzoomed, nothing more.
Big file, one requirement.

## Depth (Rule 2)

**Plate** (back), **cutouts** (middle), **captions** (front). If the plate
comes layered, the back plane becomes three — sky and skyline slowest,
rooftops, then the near building and tree fastest — and the push-in has real
parallax. If not, cutouts-versus-plate is still depth.

## Motion

One pinned ScrollTrigger, scrubbed, **snapping to the four beats.** Scale in
**log space**, position with the cubic ease (ported). Recede is scrubbed with
the camera, crossing at the midpoint between two subjects. The caption for the
beat being approached resolves as the camera arrives. About one screen per
beat; tune against the build.

### The handover — and what it does to the bird

At progress 1 the frame is beat 3: Faysal on the scooter, riding into the
city. The bird's first frame must be the same pixels. **The current collage's
largest facet is the old AI pink stall. It no longer matches.** The bird has
to be remade in the same hand as these four assets — nine facets, painterly,
`f0` being Faysal's frame — or the handover is a cut. This is a content
dependency, not a build one; it goes to the illustrator with the portrait
plate and the layered plate. `bird-collage.md` carries the note.

### Reduced motion

Beat 0 as a composed still, not pinned.

## Resolution — measured against these files

| Asset | Pixels | At beat 0, 1920 wide | At its beat, 2× DPR |
|---|---|---|---|
| `hero.jpeg` | 1600×893 | **1.2× upscaled before the camera moves** | 4–5× |
| `amena.png` | 1008×1236 | — | ~0.7× native at 4× zoom: soft |
| `Rahim.png` | 1600×1277 | — | comfortable at 3× |
| `Faysal.png` | 1546×1600 | — | comfortable at 3.5× |

The plate is the problem, not the cutouts. As previs for the shoot it does not
matter. **If the illustrated hero ships**, the plate needs to be delivered at
≥3200px wide, and Amena at ≥2000px. Illustrations can be regenerated at size;
ask for it in the same request as the layers and the portrait.

## The brief for the shoot

These four images are the storyboard for photographers who will shoot a real
set. What the technique needs from them, so the result composites the way the
illustration does:

1. **The wide plate first**, from a fixed camera position, at golden hour, at
   the highest resolution available — stitched or medium format, **8000px
   wide or more.** This is the frame the camera pushes into; every beat is a
   crop of it, and a 5× crop of 8000px is 1600px.
2. **Then three close-ups, without moving the camera position** — a longer
   lens from the same spot, or a move straight in along the axis. Amena on the
   balcony; the stall owner behind his counter under the banner; Faysal on the
   scooter. **Same light, same ten minutes.** These are the "cutouts": the
   camera lands on the close-up as it arrives, and the light has to match or
   the swap shows.
3. **A portrait frame from the same spot** is optional — one wide plate serves
   both, see the 390 section — but costs nothing on the day and is insurance.
4. **Foreground elements as separate plates** if at all practical — the tree,
   the near building — so the parallax has real layers. If not, the depth is
   subjects-versus-plate only, which still works.
5. **Every subject has a visible ground line** — feet, wheels, the table's
   legs. The cutouts are placed by their feet.
6. **The banner in frame and legible**, with a real fee on it.
7. **Deliverables:** wide plate, portrait plate, three close-ups, and either
   masks for the three subjects or the close-ups shot against something
   maskable.

## Content slots

| Slot | Content | Status |
|---|---|---|
| Plate, cutouts | the four illustrated files | **ILLUSTRATED — previs.** Real photography to follow. Old AI assets stay in `reference/` for the record only. |
| Layered plate | — | **REQUESTED** |
| Copy, beats 0–3 | the client's lines | **CLIENT DECK** |
| Scroll cue | `Scroll to meet them` | **PLACEHOLDER** |
| Names | Amena, Rahim, Faysal | **NAHIAN'S** — on screen this time? Open question 3 |

## Audit rows closed

H1 · H2 · H3 · H4 (Rule 3) · H7 · H8 · H9 · H11. H5, H6, H10 belong to the bird.

## Acceptance

- [ ] Each of the four beats, motion disabled, reads as a composed still at
      1920 and 390. **Nahian's eye.**
- [ ] Every caption ≥ 4.5:1 against the pixels behind it, every beat, both
      widths.
- [ ] On beats 1–3 the non-subjects are receded and the subject is not;
      recede crosses mid-travel, not on arrival.
- [ ] At 390, copy and any person occupy different thirds on every beat.
- [ ] The scrollbar moves continuously; forward and back land on the same
      four frames; a slow drag settles to the nearer beat.
- [ ] Beat 3's frame matches the bird's opening frame within 1px.
- [ ] Every cutout's feet sit on the ground line at 390, 768, 1280, 1920.
- [ ] The scene covers the viewport at every point in the travel.
- [ ] If the illustrated hero ships: no asset displays above 1.2× native at 2×.
- [ ] Reduced motion: beat 0 composed; page scrolls normally.
- [ ] No layout reads in any input handler. No horizontal overflow at 390.

## Explicitly NOT this

- **NOT one gesture per beat.** Scroll drives; snap settles.
- **NOT a cut or crossfade between beats.** One camera.
- **NOT a blur on the plate.** Focus is the non-subjects receding.
- **NOT text-shadow as legibility.** The scrim is the ground.
- **NOT the old camera targets.** Framed to a different photograph.
- **NOT the same composition narrowed for a phone.**
- **NOT the current bird collage as the handover target.** It has to be
  remade to match; until then the handover is known-broken, not "close enough."
- **NOT owning the bird.**

## Open questions

1. **Layered plate and a big plate (3200px+; 4000px+ is safer for 3×
   phones)** — one request to the illustrator. The portrait extension is
   dropped: one wide plate serves both.
2. **The agent beat needs a face.** Ask for the stall owner behind his counter
   — in the illustration now, and in the shoot brief?
3. **Do the names go on screen** — `Amena`, `Rahim`, `Faysal` as the caption
   eyebrow, or the roles (`Customer` / `Agent` / `Merchant`)? The prototype
   never showed them.
4. **Beat 0 headline bottom-right** (open road) rather than the prototype's
   bottom-left — confirm against the plate.
5. **The bird remake** — same illustrator, nine facets, `f0` = Faysal's frame.
   Commission now, since the handover cannot be tested without it?
