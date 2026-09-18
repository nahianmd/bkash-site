# bKash — animated site (production rebuild)

> Project constitution. Read at the start of every session.
> New to this repo? Read `START-HERE.md` first — it has the orientation.
> Written 2026-09-18, after the CEO demo shipped on 2026-09-17.

## Mission

A 2D-diorama, scroll-animated website for bKash: one camera pushing through a
neighbourhood photograph into the lives it contains, and a set of pinned
sections that each earn their scroll.

The demo build is now the **frozen reference prototype** in `reference/`. This
phase is the proper construction: a hosted site, built section by section,
mobile treated as a first-class composition rather than a set of overrides.

Judged on: scroll smoothness, typography, alignment, and how it holds up on a
phone.

## Layout

```
START-HERE.md          orientation, decisions, order of work
CLAUDE.md              this file
SDD-WORKFLOW.md        the /specify → /plan → /implement → /verify loop
PROGRESS.md            durable memory; update as sections land
specs/
  prototype-audit.md   every bug found in the demo, by section
  sections/<slug>.md   one spec per section
  _templates/
reference/             the frozen prototype. READ-ONLY. See reference/README.md
web/                   the Astro app — this is what ships
tools/                 one-off analysis scripts
```

Raw client deliverables (~90MB, not copied) stay at
`/Users/nahian/Projects/bkash/Website animation/`. The original repo with full
git history is at `/Users/nahian/Projects/bkash`, branch
`rebuild/astro-scrolltrigger`.

## Tech stack

- **Astro 7** — static output, zero JS by default, islands where needed.
  Chosen for `astro:assets`: the prototype shipped an 11MB homepage with no
  `srcset` and no AVIF/WebP, which is fatal on a hosted site serving Bangladesh.
- **GSAP ScrollTrigger** — owns pinning, scrubbing, snapping and
  re-measurement. Free as of the Webflow release, including every plugin.
- **TypeScript** for new code. Ported prototype maths may land as-is and be
  tightened after.
- **No React.** Nothing on this site re-renders; every update is an imperative
  style write. It was removed from the prototype for that reason and the reason
  still holds.

## Commands

All run from `web/`.

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview built output: `npm run preview`
- Typecheck / template check: `npm run check`
- Format: `npm run format`

There is no test suite and there will not be one — see `/verify`.

## Hard constraints

- **Scroll-driven, never scroll-jacked.** Every pinned section is a
  ScrollTrigger with real travel. The page scrollbar moves the whole time and
  every gesture maps to distance. The prototype's hero intercepted the wheel
  for five beats; do not reintroduce that.
- **Mobile is a composition, not a media query.** Every section spec and plan
  states its 390px layout in its own right. A plan with only desktop in it is
  not finished.
- **Never `100vh` for a pinned section.** The mobile URL bar collapses and the
  viewport grows mid-animation. Size against `--vh`, which
  `web/src/lib/scroll.ts` keeps truthful from `visualViewport`.
- **Motion must survive `prefers-reduced-motion`.** Sections fall back to their
  resting state, coherent and readable — never a blank box.

## What we keep from the prototype

Salvage, don't reinvent. `reference/` is read-only; port from it. Its README
says what is worth taking and what is not.

- The concept: one camera pushing through a neighbourhood photograph into three
  lives (customer → agent → merchant).
- The camera maths in `reference/prototype/js/hero.js`: the cubic ease on
  position with **logarithmic** interpolation on scale, and the derived
  fixed-point zoom in `poses()`. Hard-won and correct.
- `anchorPortrait()` — recomputes cutout positions _and_ camera targets against
  a different mobile plate under a cover-crop.
- The derived hotspot geometry in `reference/prototype/js/phone.js` — fractions
  of the screen box, so they scale with the device.
- The design tokens in `reference/prototype/css/tokens.css` — a closed type
  scale with size, line-height and tracking bundled per step.
- The nine bird facet polygons in `reference/prototype/js/bird.js`. Verified
  2026-09-18 against the artwork's own alpha; they match to ~1%.

## What we drop, and why

- **The hand-rolled scroll engine.** `engine.js` was correct about rAF and
  read/write phasing, but it also hand-rolled pinning, progress measurement and
  resize re-measurement, and that is where its bugs lived. ScrollTrigger owns
  that now.
- **Wheel interception in the hero.**
- **`build.py` and the single-file bundle.** Artefacts of a USB-stick demo.
- **The `.pageswitch` demo pill** and **the debug HUD**.

## Performance rules (the scroll is the product)

1. **One transform write per animated element per frame.** Prefer `transform`
   and `opacity`; never animate layout properties.
2. **Never animate `filter: blur()` per frame.** Pre-render one blurred copy
   and crossfade opacity.
3. **No layout reads inside an input handler.** The prototype called
   `getBoundingClientRect()` inside its wheel handler — a forced recalc per
   event, 100+/sec on a trackpad.
4. **Everything through `astro:assets`.** Display-resolution AVIF/WebP with
   `srcset`. No raw 11MB JPEG goes near a scroll loop.
5. **`will-change` only on properties that composite.** It does nothing useful
   on `width`/`height` and keeps a layer alive for no reason.

## Design system

No inline `style=""`. No magic numbers. Everything through tokens.

- Type scale: fixed ratio, `clamp()` for fluid sizing, every step defined once
  with its line-height and tracking bundled.
- Spacing: single scale.
- Brand: `#e2136e` (bKash pink). Accent hover `#b70f58`.
- Font: Inter, subset to latin + latin-ext.
- Dark sections get named tokens, not hand-written `rgba(255,255,255,.72)`.

## How we work

Spec-driven. See `SDD-WORKFLOW.md`.

`/specify <slug>` → `/plan <slug>` → `/implement <slug>` → `/verify <slug>`,
with Nahian approving at every boundary. `/clear` between phases.

- One spec per section in `specs/sections/<slug>.md`.
- Claude fills the spec from Nahian's instruction and raises whatever is
  ambiguous — batched, or talked through, whichever suits the section.
- **Every spec carries an "Explicitly NOT this" section.** The failure mode on
  this project is Claude inferring a plausible mechanism that is not the one
  Nahian pictured, then building it well. The hero collapse was built twice for
  exactly this reason. Write down the near-miss before coding.
- Each section's spec pulls its own rows from `specs/prototype-audit.md`. A
  section is not BUILT until those are fixed or explicitly deferred.
- Status: `DRAFT → APPROVED → BUILT → SIGNED-OFF`. Only Nahian signs off.
- Commit a checkpoint after each task. Small commits; cheap rollback beats tidy
  history.
- Update `PROGRESS.md` as sections land.

## Model selection

Each spec carries a `> Model:` line. The four commands check it before starting
and say so if the session is on the wrong one — they never switch it themselves.

**And at the end of every unit of work, say which model the next unit is
tagged for** — one line, unprompted. The check at phase start catches a wrong
model; this is what stops the wrong model being started at all.

The test, when tagging new work:

- **Fable 5.1** when the answer is **not determinable from what is written
  down** — deciding *what* to build rather than *how*, or where being subtly
  wrong would not be caught by looking at it. The camera maths and the bird's
  scale derivation fail quietly; almost-right is the expensive outcome.
- **Opus 5** when the work is **execution against a written answer** — the spec
  says what, the plan says how, and the job is building and checking.
- **Sonnet 5** for `/verify` throughout: driving the browser, measuring values,
  grepping. Mechanical, and the judgement calls are Nahian's anyway.

This maps onto the phases loosely and deliberately not rigidly — `foundation`
does not need Fable to specify, and `hero` does need it to build its camera.

Two practical notes:

- Fable costs **2x Opus and 5x Sonnet**, and output is 5x input with thinking
  billed as output. It has to earn it.
- Fable cache reads are **$0.25/MTok against $10 fresh**, so one long session on
  one hard problem is much cheaper than three short ones that re-read the
  prototype each time. Clear between *sections*, not mid-problem.

## Order of work

`design-language` → `foundation` (implements it) → section specs rewritten
**still-first** (`hero`, `bird-collage`, `people`, `services`) → transitions →
`about`.

The page is four sections, one arc: story → proof → product. The bento stays,
made beautiful with parallax on approach; the phone emerges from it. Every section must look good standing still before its transition is
designed, and its 390px composition is part of "designed", not a follow-up.
See `specs/design-language.md`.

## Open, and Nahian's call

- **Content sign-off before this is publicly reachable.** The site carries live
  bKash branding, real board names and a real executive quote. That was fine
  for an internal pitch. A hosted URL needs bKash's sign-off, or it stays
  behind `noindex` + auth.
- **The hero is AI-generated imagery** and everything below it is real
  photography. The seam is visible. Biggest remaining exposure, and it has to be
  settled at hero-spec time because every camera target is tuned to that plate.
- Copy across the phone services and bento is placeholder, written by Claude,
  not bKash-approved.
- Bangla localization: Astro i18n routing makes it tractable. Out of scope
  until asked; the toggle stays visibly disabled, not silently dead.
