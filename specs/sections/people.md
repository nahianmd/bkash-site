# Section 3: People — three of the 85 million

> Status: BUILT (2026-09-20, Fable — Nahian: "bring that section after bird; it will adapt our DLS")
> Model: **Fable 5.1** to specify; built by Fable in the same pass. The still is the
> design; the motion is two planes and a recede.
> Source: Nahian's structure (hero's three types → three named people), the
> prototype's three photographs and names, `specs/design-language.md`.
> New spec, 2026-09-18. The prototype's people row was never specified.

## Job

The hero showed three *types* — a customer, an agent, a merchant — in a
rendered street. This section shows three *named individuals* in real
photographs: Anisul Haque, CNG driver; Munni Barua, agent, known as "bKash
Didi"; Shajib Ahmed, bookshop owner. It is where the site turns from story to
proof (Rule 1), and where "scroll to meet them" finally pays off.

The first documentary frame on the page. It sets the tone for the whole second
half, so its stillness matters more than its motion.

## The still

### 1920

A warm dark ground (`--night-2` family — the *turn* from the bird's white).
Eyebrow and headline top-left at the gutter, on the ground, not on a
photograph. Beneath, **three portrait cards of equal size in a row**, each at
a **4:5 crop**, faces in the upper third. On each card, bottom-left on the
scrim (Rule 3): tag (`Customer` / `Agent` / `Merchant`), name, role, and a
quiet outlined CTA (`Know her story →`).

What makes three different photographs read as a set is not a grade — it is
**one crop, one scrim, one caption block, one type step.** The prototype's
three were shot in three light situations (bright daylight, low-key interior,
busy shop) and that stays; the documentary register is left real.

Ground, not full-bleed: the cards sit inside the page width with the gutter
either side, so the row reads as three objects on a field rather than a strip
of wallpaper.

### 390

The eyebrow and headline, then the three cards **stacked full-width**, each at
the same 4:5 crop, each with the same caption block. Three composed stills, one
per screen-ish. Tap replaces hover. No horizontal swipe — it hides two of the
three people behind a gesture, and this section exists to show them.

## Depth (Rule 2)

Three planes: **ground** with the headline (back), **the three cards**
(middle), **caption blocks** (front). On scroll through the section the cards
drift a few percent faster than the ground, the captions a few percent faster
than the cards. Felt, not noticed.

## Interaction (Rule 4)

Hover or tap one card: it is full; the other two recede — dim, soft,
desaturated, the shared recede tokens. **The cards do not change size.** The
prototype grew the hovered tile to three shares and shrank the neighbours to
half; that reads as a layout convulsing, and it cannot exist on a phone. Recede
does the same job by taking attention away rather than adding size.

Keyboard: the cards are focusable; focus behaves as hover.

## Motion into and out of the section

**In — the turn.** No set-piece. The bird holds its poster on white; the
people section's dark ground rises beneath it under ordinary scroll; the
headline is on that ground before the cards arrive. The register changes
because the ground and the photographs change. A bridging line makes it
deliberate: the bird says *millions of stories*; this eyebrow says *meet three
of them* (placeholder).

**Out.** Ordinary scroll into the bento, which shares the dark ground, so the
two proof sections read as one half.

### Reduced motion

The still, at both widths, no drift. Recede on hover/tap still applies — it is
a state, not an animation.

## The crops

Set by eye, per photograph, and recorded as `object-position` — not left to
`cover`'s default. The constraint is Munni's photograph at 1500×845: a 4:5
crop of a 16:9 frame keeps a third of its width, so where that third sits is
the whole composition. Anisul and Shajib at 1500×1000 are easier.

## Content slots

| Slot | Content | Status |
|---|---|---|
| Three photographs | `people/anisul.jpg`, `munni.jpg`, `shajib.jpg` | **DOCUMENTARY**, real, from the reference project |
| Names and roles | Anisul Haque, CNG Driver · Munni Barua, "bKash Didi" · Shajib Ahmed, Book Shop Owner | **REFERENCE PROJECT** — real names; confirm with the client that they are cleared for use |
| Eyebrow / headline | `Meet three of them` / — | **PLACEHOLDER** |
| CTA | `Know his story →` / `Know her story →` | **PLACEHOLDER**, and the link target does not exist |

## Audit rows closed

S1 no unified treatment — answered by one crop, one scrim, one caption block,
not a grade. S2 (redundant with the bird) — no: the bird's facets are inert
this pass and rendered; these are real and named. Both stay.

## Acceptance

- [ ] With motion disabled, the row at 1920 and the stack at 390 each read as
      a composed still. **Nahian's eye.**
- [ ] The three cards are pixel-identical in size, crop ratio, scrim, and
      caption geometry. Only the photograph differs.
- [ ] Every face sits in the upper third of its card at 390, 768, 1280, 1920.
- [ ] Caption text measures at least 4.5:1 against the pixels behind it on
      all three cards at both widths.
- [ ] Hover/tap/focus: one card full, two receded, no card changes size.
- [ ] Ground, cards and captions move at three distinct rates on scroll; none
      differ by more than a few percent.
- [ ] The dark ground is present before the first card enters the viewport,
      so the turn from white reads as the ground changing, not a card popping.
- [ ] No horizontal overflow at 390. No swipe.
- [ ] Reduced motion: the still, recede still works as a state.

## Explicitly NOT this

- **NOT the hover-expand row.** No tile grows; no neighbour shrinks.
- **NOT a carousel or swipe** on mobile. Three people, all visible by scrolling.
- **NOT a grade or duotone** to make the three match. The crop and the caption
  block make them a set; the light stays real.
- **NOT full-bleed.** Three objects on a field, inside the gutter.
- **NOT a transition set-piece from the bird.** The turn is the ground.
- **NOT rendered imagery.** Nothing from the hero or the bird's facets appears
  here (Rule 1).

## As built (2026-09-20)

`People.astro` + `lib/people.ts`. Ground `--night-2`; eyebrow "Meet
three of them", headline "Real streets. Real stories." (PLACEHOLDER);
three cards 4:5 inside the gutter, one caption block on `.on-photo`
(tag, name `.t-h3`, role, outlined CTA); hover is CSS (`:has`), tap /
keyboard set `.is-on` / `.is-picked`; the other two recede by the token
set; no card changes size. Depth: the cards plane leads the ground by
(mid − back) × vh and the captions by (front − mid) × vh as the section
crosses the viewport, on a scrubbed ScrollTrigger with no pin; reduced
motion: no drift. Crops per photograph as `object-position` from data.
390: stacked full-width.

## Open questions

1. **The dark ground** — built as `--night-2`. — the warm near-black the prototype used for the
   people row, or something with more colour? It is the ground for both proof
   sections, so it is a language decision as much as a section one.
2. **Are the three names cleared with the client?** They are real people from
   the reference project. If not, the section needs three others.
3. **CTA target.** `Know her story` goes nowhere. Cut the CTA, or is there a
   story page coming?

## Revised 2026-09-20 — the original row behaviour, on desktop

Nahian: the title on one line (the measure lifted on `.people__title`);
the images and stories "adapt the original behaviour". So on desktop the
row is the prototype's again: the pointed-at card takes three shares,
its neighbours 0.55 (measured 855 / 157 / 157 at 1920, the row's sum
unchanged), the neighbours shed tag, role and CTA and keep a small dim
name, the open card's image scales 1.04 and its CTA appears — with the
site's tokens and scrim, and the recede on the neighbours kept (Rule 4).
"Explicitly NOT the hover-expand row" is withdrawn for desktop by that
decision. On a phone the three stay stacked with every caption whole.
