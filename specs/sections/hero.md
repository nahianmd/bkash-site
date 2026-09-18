# Section 1: Hero — one camera through one street

> Status: DRAFT
> Model: **Fable 5.1** to specify and to build the camera and the focus
> mechanism. **Opus 5** for the rest of the build.
> Source: Nahian's concept (approved by the client on style), the client's
> five-beat copy, the client's four flags, and `specs/design-language.md`.
> Rewritten still-first on 2026-09-18, replacing the port-forward version.
> Camera targets and the mobile re-anchoring are ported from
> `reference/prototype/js/hero.js` — the parts of the prototype that are sound.

## Job

The claim, then three lives in one street. Beat 0 says *300 transactions every
second*. Beats 1–3 make it human: a customer, an agent, a merchant, all
standing in the same photograph. The hero is the **story** half of the site
(Rule 1) — rendered, idealized, a diorama.

It ends on the merchant, framed so the bird's largest facet can take the
viewport with no visible cut. That frame is this section's contract with
section 2.

## The stills

Four composed frames. Each must hold as a poster with no motion.

### Beat 0 — the street (1920)

The wide plate full-bleed. All three cutouts in place, small, part of the
street. Headline `300 Transactions Every Second` with the line
`The Digital Rhythm of Bangladesh` beneath, **bottom-left third, on the scrim**
(Rule 3). It sits on open road in the plate, not on a person or a building.
Scroll cue beneath it. Nothing else.

The prototype placed this headline mid-right, under the agent's shop, with a
text-shadow for legibility. Bottom-left on a scrim is the language's answer;
the shadow was the per-section improvisation the language exists to end.

### Beats 1–3 — a life (1920)

The camera on one subject. Caption block bottom-left on the scrim: eyebrow
(`Customer` / `Agent` / `Merchant`), headline, line. **The other two cutouts
and the plate recede** — dimmer, softer, less saturated (Rule 4). The subject
is full. This is the client's "mechanism that focuses each story," and it is
what the prototype did not have: it zoomed, but nothing focused.

| Beat | Camera x, y, scale | Subject | Copy |
|---|---|---|---|
| 1 | 29.5, 57.0, 3.1 | Customer | `7 in 10 Adults in Bangladesh` / `Control Their Money with bKash` |
| 2 | 59.1, 28.2, 3.0 | Agent | `One Agent Every 2 KM` / `Your Neighborhood is the Branch` |
| 3 | 79.4, 27.0, 5.5 | Merchant | `From Floating Stalls to Digital Storefronts` / `Moving Millions of Cashless Commerce` |

Targets ported verbatim; they are hand-framed to this plate and not derivable.
Beat 3's framing is fixed by the handover to the bird, so the merchant sits
right of centre with the caption clear on the left — the prototype got this
right and it stays.

### 390 — the same four beats, a different photograph

The wide plate is 16:9; a portrait crop shows a quarter of it with the people
in the wrong places. The prototype's answer stands: a **portrait plate**, and
`anchorPortrait()` re-placing each cutout against it and re-deriving the camera
targets from where they land. That function ports as-is.

What changes is the composition:

- **Headline and subject occupy different thirds** (Rule 3). Beat 0: copy in
  the bottom third on the scrim, people in the middle third. The prototype put
  the headline on Amena's body.
- Captions on beats 1–3 sit in the bottom third on the scrim, at a measure
  that fits 390px — not edge-to-edge `t-h2`.
- The recede rule applies the same way. On a phone the frame is tighter, so
  the non-subjects are often out of frame anyway; the plate still recedes.

## Depth (Rule 2)

Three planes, already present in the concept: **plate** (back), **cutouts**
(middle), **captions** (front). Between beats the camera moves all three; on
top of that, the front plane leads and the back plane lags by a few percent so
the push-in has parallax, not just zoom. Never inside the plate.

## Motion

One pinned ScrollTrigger, scrubbed, **snapping to the four beats**. Snap keeps
the promise that every frame a viewer rests on was composed; free scrub alone
would let the page park half-zoomed between two people. The scrollbar moves the
whole way; any position is reachable.

- Scale interpolates in **log space**, position with the cubic ease — ported;
  it is why the zoom rate reads as constant.
- The caption for the beat being approached resolves as the camera arrives;
  the previous one clears. Opacity and a short rise, on the front plane.
- **Recede is scrubbed with the camera**: as the camera leaves one subject for
  the next, the old subject recedes and the new one comes full, crossing at
  the midpoint. It is not a state that flips on arrival.
- Travel: about one screen per beat. A feel judgement; tune against the build.

### The handover to the bird

At progress 1 the frame is beat 3, and the bird section's first frame is the
same pixels. The prototype measured this at **0px error on all four edges**.
That is the standard.

### Reduced motion

Beat 0 as a composed still — plate, cutouts, headline, and a visible way on.
Not pinned.

## The cutouts — resolution and placement (the client's flag)

Measured, not polished around: at beat 1's 3.1× zoom on a 1920 screen the
customer cutout (941px source) displays at ~1060px — soft at 1×, **2.25×
upscaled at 2×**. The merchant at 5.5× is similar. Two ways out:

- **(a) Regenerate the cutouts at 2×.** They are AI; this is possible. Same
  composition, four times the pixels. The camera stays as tuned.
- **(b) Cap the camera's maximum zoom** so no cutout exceeds ~1.2× native at
  2×. Beats 1–3 get wider; the subjects read smaller.

(a) keeps the approved framing. It is Nahian's call because it is Nahian's
tooling and time. The spec assumes (a) and states (b) as the fallback.

Placement: the cutouts' feet must sit on the plate's ground line at every
viewport. The prototype exposed a `nudge()` helper for this because it cannot
be measured, only judged — keep that helper in dev.

## Content slots

| Slot | Content | Status |
|---|---|---|
| Wide plate, portrait plate, three cutouts | as in `reference/assets/img` | **RENDERED** (AI). Approved on style. Resolution: see above. |
| Beat copy, all four beats | the client's five lines, beats 1–4 | **CLIENT DECK** |
| Scroll cue | `Scroll to meet them` | **PLACEHOLDER** — not in the deck |
| Names | Amena, Faisal, Rahim exist only in the prototype's tuning helper; never on screen | **UNVERIFIED** origin |

## Audit rows closed

H1 scroll-jacking · H2 rect in the wheel handler · H3 `touch-action` at init ·
H4 caption legibility (Rule 3) · H7 `hero-light` sticking · H8 mobile headline
on the subject · H9 mobile caption measure · H11 per-frame rect in the nav.
H5, H6, H10 belong to the bird.

## Acceptance

- [ ] Each of the four beats, with motion disabled, reads as a composed still
      at 1920 and at 390. **Nahian's eye.**
- [ ] Every caption measures at least 4.5:1 against the pixels behind it, on
      every beat, at both widths.
- [ ] On beats 1–3 the non-subjects are visibly receded and the subject is not.
      Measured: the recede tokens are applied to exactly the non-subjects.
- [ ] At 390, copy and any person occupy different thirds on every beat.
- [ ] The scrollbar moves continuously; nothing is swallowed. Forward and back
      land on the same four frames; a slow drag settles to the nearer beat.
- [ ] Recede crosses over mid-travel, not on arrival — scrub to 50% between
      two beats and both subjects are half-receded.
- [ ] Beat 3's frame matches the bird's opening frame within 1px on all edges.
- [ ] No cutout displays above 1.2× its native pixels at 2× DPR (path a), or
      the camera never exceeds the capped zoom (path b).
- [ ] Every cutout's feet sit on the ground line at 390, 768, 1280 and 1920.
- [ ] The scene covers the viewport at every point in the travel; no ground
      shows at any edge.
- [ ] Reduced motion: beat 0 composed and readable, page scrolls normally.
- [ ] No `getBoundingClientRect` in any input handler. No horizontal overflow
      at 390.

## Explicitly NOT this

- **NOT one gesture per beat.** Scroll drives the camera; snap only decides
  where it settles.
- **NOT a cut, dissolve or crossfade between beats.** One camera, moving.
- **NOT a blur on the plate.** The prototype's depth-of-field flattened the
  scene. Focus is the non-subjects receding — dim, soft, desaturated — never
  the plate blurring.
- **NOT text-shadow as a legibility strategy.** The scrim is the ground.
- **NOT the subjects moving independently of the plate.** They are in it.
- **NOT the same composition narrowed for a phone.** The portrait plate is a
  different photograph with its own copy placement.
- **NOT re-framing the camera targets.** Touch them only if the plate changes.
- **NOT owning the bird.** This ends on beat 3.

## Open questions

1. **Cutouts: regenerate at 2× (assumed), or cap the zoom?** Yours — it is
   your tooling.
2. **Is the AI plate staying?** The client did not flag it; they flagged its
   execution. Assumed staying. If it changes, every camera target is re-framed.
3. **Snap: confirm.** Recommended for the reason above; it is the one place
   the old stepped feel survives, on purpose.
4. **`Scroll to meet them`** — keep, or the client's words? It sets up the
   people section, which is why it earns its place.
