# Design language

> Status: APPROVED — Nahian, 2026-09-18, in conversation (each rule as it was
> proposed; the bento reinstated the same evening). Not SIGNED-OFF: that waits
> on the sections being built against it.
> Model: **Fable 5.1** to write and approve; **Opus 5** implements it (that
> implementation is what `foundation` becomes).
> Source: Nahian, 2026-09-18, in conversation. Decisions are his and are marked.
> Observations are from the primary sources — the client deck
> (`Website_N_1.pptx`) and the photography in `reference/assets/` — read fresh
> the same day, not from the prototype's specs.

## Why this exists

The prototype worked as a demo and was approved on concept. It was not
designed as a site: each section borrowed its look from a different reference,
there was no rule for how photographs are treated or how text sits on them,
and the transitions were carrying sections that did not hold up on their own.

**Nahian's principle (2026-09-18):** every section must look good standing
still, with no animation at all. The transitions come after, and they can only
be as good as the two states they connect. The basic sections should also carry
their own depth — a 2.5D or parallax quality — so the site's identity as a
diorama is present everywhere, not only in the two set-pieces.

**Mobile is non-negotiable.** Every rule below applies at 390px as a composition
in its own right. A rule that only works on desktop is not a rule.

## What the client actually asked for

The homepage brief is one slide: five lines of copy and no visual reference.

1. `300 Transactions Every Second` / `The Digital Rhythm of Bangladesh`
2. `7 in 10 Adults in Bangladesh` / `Control Their Money with bKash`
3. `One Agent Every 2 KM` / `Your Neighborhood is the Branch`
4. `From Floating Stalls to Digital Storefronts` / `Moving Millions of Cashless Commerce`
5. `Writing Millions of Stories in Motion Across Bangladesh`

The diorama concept, the camera, the cutouts and the bird were Nahian's; the
client approved the style and flagged four things in it: **copy typography,
the cutouts' resolution and placement, and the mechanism that focuses each
story.** Everything on the page after beat 5 has no brief — which is why it
felt questionable. It needed a job, not a fix.

## The page

Four sections and a footer. One arc: **story → proof → product.**

| # | Section | Job | Photographic register |
|---|---|---|---|
| 1 | **Hero** | The claim, then three lives in one street. Beats 1–4. | Rendered |
| 2 | **Bird** | Beat 5. The brand mark, revealed to be made of those lives. The end of the story. | Rendered |
| 3 | **People** | The hero's three *types* become three *named individuals*. "Scroll to meet them" pays off here. | Documentary |
| 4 | **Bento → phone → services** | The product. A bento of six real photographs — bKash everywhere — from which a 3D phone emerges, grows, and lands as the sixteen services: each selectable, each described. | Documentary |

**The bento stays — with a job, and made beautiful.** (Nahian, 2026-09-18.)
It was retired for an hour on the grounds that it was scaffolding for the
phone; the alternative — a 3D phone lifting out of a photographed hand — is
heavy 3D work with a composite that has to match lens perspective, and the
bento was the pragmatic choice for a reason. It also has a strength the hand
does not: six real photographs on screen at once is the strongest "bKash is
everywhere" still on the site. Its job is exactly that, and to be the ground
the phone emerges from. What "beautiful" means for it is in Rule 2 and in
`services.md`.

## Rule 1 — the seam is the structure

*Decision: Nahian, 2026-09-18.*

There are two kinds of photograph on this site and they do not match:

- **Rendered** — the hero plates, the cutouts, the bird's nine facets. Warm,
  idealized, clean-edged, no grain. A diorama.
- **Documentary** — the people, the six ex-bento photographs, the About banner,
  the CEO. Real light, real clutter, real faces.

They are not made to match. The rendered register is the **story** — sections 1
and 2, the fable of Bangladesh's digital rhythm. The documentary register is the
**proof** — sections 3 and 4, and here they actually are. The turn from bird to
people is a designed beat, not an accident: the storybook ends by revealing it
was the logo all along, and the page turns to real people.

What this forbids: no filter on the documentary photographs to make them look
rendered. No rendered imagery below the bird. The two registers never share a
frame.

What it demands: the bird→people transition has to *mean* the turn. It is the
one transition on the page that is about the photography itself.

## Rule 2 — every section is two or three planes

This is what "2D diorama" means as a language. Each section is composed of
flat layers at different depths, and on scroll each layer moves at its own
rate. That gives every section its own depth without a set-piece, and it is
cheap — a ScrollTrigger per plane.

| Section | Back plane | Middle | Front |
|---|---|---|---|
| Hero | the plate | the cutouts | captions |
| Bird | the white ground | the mark | copy |
| People | a context field (see below) | the portrait card | name and role |
| Bento / services | ground | the bento tiles (one rigid grid) | captions; later the device and the panel |

Rates: back slowest, front fastest, never more than a few percent apart. Depth
should be felt, not noticed.

What this forbids: parallax *inside* a photograph. Parallax *between* the
bird's facets — the mark is one rigid object, always. More than three planes.

**The bento's parallax, so it stays consistent with the approved fall.** On
approach — the section scrolling into view, not yet pinned — the tiles sit in
two or three depth groups and drift at slightly different rates, so the grid
has depth as you arrive. The drift is a function of the section's distance
from centre and reaches **zero exactly as it pins**: every tile is at its rest
position at the moment the fall begins, and the fall is one rigid plane, as
Nahian approved on 2026-09-17. Depth on the way in, one object on the way
out — no discontinuity, and no per-tile animation during the fall.

What makes the bento a composition rather than photos in boxes: it fits the
viewport on both axes (the prototype's `84vh` formula rendered it at 43% of a
16:9 screen); the asymmetric column rhythm is kept on purpose; every caption
sits on the same scrim (Rule 3); the one non-photo card — the stat, pink,
typographic — is the grid's focal point; the phone tile is indistinguishable
from its neighbours at rest; and on hover a tile is full while the others
recede (Rule 4). At 390px it is **four photographs, the stat and the phone**,
chosen for the story they tell together — not the desktop seven with three
hidden.

**On mobile the planes hold.** Touch scroll drives ScrollTrigger the same way.
The rates may be smaller; the structure is the same.

## Rule 3 — text on a photograph always has a ground

*This is what the client's "copy typography" flag is.* The hero captions sat
directly on sand and wood and vanished. It was not the typeface.

One rule, applied everywhere text sits on an image: the text is on a ground —
a consistent scrim, or a consistent clear zone that the composition reserves
for it. Which of the two is chosen once, here, and then never per-section.

Plus two typographic rules that are language, not tokens:

- **Headlines have a measure.** Never a hardcoded `<br>` in copy. The bird's
  headline broke into four lines with an orphan because it had a `<br>` and no
  measure. Measure is set per type step, and it holds at 390px.
- **On a phone, a headline never sits on a person.** The hero's mobile headline
  landed on the subject's body. Copy and subject occupy different thirds.

## Rule 4 — focus means the rest recedes

*Decision: Nahian, 2026-09-18 — the client's "mechanism that focuses each
story" means this, not the stepped gesture.*

When one thing is the subject, everything else in the frame quietly steps
back: slightly dimmer, slightly softer, slightly less saturated. Your eye goes
to the subject because the frame made room for it — not because it got bigger.

This is one behaviour and it is used three times:

- **Hero:** on each beat, the non-subject cutouts recede. In the prototype they
  stayed sharp and just got pushed off-frame — there was zoom but no focus.
- **People:** the hovered or tapped portrait is full; its neighbours recede.
- **Services:** the selected service is full; the other fifteen recede.

Because it is the same rule, it is the same tokens: one dim amount, one
softness, one duration. The prototype's depth-of-field blur is *not* this — it
blurred the whole plate and flattened the scene. This touches only the
non-subjects.

## Photographic treatment, per register

**Rendered.** As supplied. No grade. The client approved this look.

But the cutouts are under-resolved for the camera. At beat 1's zoom on a 1920
screen the customer cutout (941px source) displays at ~1060px — soft at 1×,
**2.25× upscaled at 2×**. The merchant at 5.5× is similar. This is the client's
"resolution" flag, and it is measurable. Two ways out: regenerate the cutouts at
2× (they are AI, so this is possible), or lower the camera's maximum zoom. The
hero spec decides; this document only says that it must be decided, not
polished around.

**Documentary.** Real, and left real — no unifying grade. What *is* unified:

- one crop language (the people three were shot in three different light
  situations; the crop and the caption treatment are what make them a set);
- the ground rule for any text on them;
- the recede rule for focus.

**Illustrated** (the Journey Wall, the road-ahead) — About page only. Never on
the homepage.

**Not usable:** the four "voices" images are 520×435 with text baked in. Nahian,
2026-09-18: a concern for later, least important. Build that section text-only
until originals arrive; never ship the blurry ones.

## What `foundation` becomes

`specs/foundation/spec.md` was written as a port of the prototype's tokens plus
two additions. That is still the right substrate. It now implements *this*
document: the tokens carry the ground rule, the recede tokens, the plane rates,
and the two missing type steps. Its acceptance criteria stand; these are added:

- [ ] A text-on-photograph ground exists as one token set and is the only way
      text sits on an image anywhere in `web/`.
- [ ] The recede state exists as one token set (dim, soften, desaturate,
      duration) and nothing in `web/` hand-writes an alternative.
- [ ] Plane rates exist as tokens, and no section invents its own.

## What the section specs become

The five section specs written on 2026-09-18 are **port-forward** — they
assume the prototype's compositions and specify fixes. Under this document each
is rewritten **still-first**: the composition at rest at 1920 and at 390 comes
first, the transition into and out of it second. `phone-bento.md` stands as
the approved baseline for the fall and the emergence; `services.md` covers the
bento's still, its parallax, and the sixteen services with their panel.

## Acceptance — for the language, not for any section

- [ ] Every section screenshot at 1920 and at 390, with all motion disabled,
      reads as a composed still that could be a poster. Nahian's eye.
- [ ] No rendered imagery appears below the bird; no documentary imagery
      appears above the people section.
- [ ] Every piece of text on a photograph, at both widths, measures at least
      4.5:1 against the pixels behind it.
- [ ] No `<br>` inside any headline in `web/`.
- [ ] Each section has at least two planes moving at different rates, and none
      has more than three.
- [ ] The recede state is visually identical in hero, people and services.
- [ ] At 390px, on every section, copy and any human subject occupy different
      thirds of the frame.

## Explicitly NOT this

- **NOT one unified look across the whole site.** The seam is the structure.
  Filtering the real photographs to match the rendered ones was considered and
  rejected.
- **NOT parallax inside a photograph**, and not between the bird's facets.
- **NOT the prototype's depth-of-field blur.** Focus is the non-subjects
  receding, not the plate blurring.
- **NOT a desktop language with mobile overrides.** Every rule is stated so
  that it holds at 390px, and a section is not composed until its 390px still
  exists.
- **NOT a component library or a redesign of the type scale.** The tokens
  survive; this is the layer above them that the prototype never had.

## Open questions

1. **Ground: scrim or clear zone?** One choice, applied everywhere. A scrim is
   safer on unpredictable photographs; a clear zone is cleaner but needs every
   composition to reserve it, including at 390px.
2. **Resolved (Nahian, 2026-09-18): the phone emerges from the bento.** The
   hand-composite alternative is recorded above and not pursued.
3. **The people section's back plane.** A "context field" is named above but
   not designed — a soft version of each person's environment, a colour field,
   or nothing. This is where the documentary register first appears, so it sets
   the tone for the whole second half.
4. **Cutouts: regenerate at 2×, or cap the zoom?** Hero spec decides; flagged
   here because it changes what the hero can do.
