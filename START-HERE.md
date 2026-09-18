# Start here

Orientation for a fresh session. Written 2026-09-18, at the point where the
demo prototype was reviewed, the stack was chosen, and nothing has been ported
yet.

## Where you are

The CEO demo shipped on 2026-09-17 from a different repo
(`/Users/nahian/Projects/bkash`, branch `rebuild/astro-scrolltrigger` — still
on disk, untouched, with full history). It was a single self-contained HTML
file built for a USB stick.

**This directory is the production rebuild.** Hosted site, Astro, built section
by section under a spec-driven loop.

Open sessions **here**, at `/Users/nahian/Projects/bkash-site`. Not in `web/` —
the slash commands and hooks only load from this root.

```
bkash-site/
├── START-HERE.md       ← you are here
├── CLAUDE.md           ← the constitution; read every session
├── SDD-WORKFLOW.md     ← how the /specify → /plan → /implement → /verify loop runs
├── PROGRESS.md         ← durable memory; update as sections land
├── specs/              ← the source of truth for what gets built
│   ├── prototype-audit.md   ← every bug found in the demo, by section
│   ├── foundation/spec.md   ← DRAFT, awaiting approval
│   ├── sections/            ← one spec per section
│   └── _templates/
├── reference/          ← the frozen prototype. READ-ONLY. See its README.
├── web/                ← the Astro app. This is what ships.
├── tools/              ← one-off analysis scripts
└── .claude/            ← slash commands + hooks
```

## What is decided

| Decision | Why |
|---|---|
| **Hosted site**, not an offline file | Nahian, 2026-09-18. Every "single file / zero network / zero imports" constraint from the demo is dead. |
| **Astro 7** | Chiefly `astro:assets`. The prototype shipped an 11MB homepage with no `srcset` and no AVIF/WebP. Templating for the About page and i18n routing for Bangla come free. |
| **GSAP ScrollTrigger** | Owns pinning, scrubbing, snapping, re-measurement. Most of the prototype's bugs were scroll-infrastructure bugs, not design bugs. Free including all plugins. |
| **No React** | Nothing re-renders; every update is an imperative style write. Removed from the prototype for that reason; the reason holds. |
| **TypeScript** for new code | Ported maths may land as-is and be tightened after. |
| **Scroll-driven, never scroll-jacked** | The prototype's hero intercepted the wheel for five beats. The scrollbar must move the whole time. |
| **Mobile is a composition** | Not a media query on a desktop layout. Every spec states its 390px layout in its own right. |

## What is built

Only the scaffold. `web/` contains:

- `src/lib/scroll.ts` — ScrollTrigger registration, `--vh` kept truthful from
  `visualViewport` (so a pin doesn't resize when the mobile URL bar collapses),
  and a dev handle that drives a trigger to an exact progress and forces the
  update. That last one matters: the automation tab runs hidden, so rAF never
  fires and a screenshot without it shows a stale frame. `/verify` depends on it.
- `src/layouts/Base.astro` — the shell.
- `src/pages/index.astro` — a smoke test proving pin + scrub end to end.
  **Delete it when the first real section lands.**

Verified working: `npm run check` clean, `npm run build` clean, 132KB total
including GSAP. At progress 0.5 the test box measured exactly scale 2 / 90°.

Nothing else. No tokens, no fonts, no nav, no assets, no sections.

## Order of work

Sections depend on each other, so this order is not arbitrary.

1. **`foundation`** — **spec written**, `specs/foundation/spec.md`, awaiting
   Nahian's approval. Five open questions, two of them for bKash.
   Type scale and spacing from `reference/prototype/css/tokens.css`, fonts,
   the `astro:assets` convention, nav + footer shell. Also where two review
   findings get fixed once instead of nine times: **named dark-section tokens**
   (sections currently hand-write `rgba(255,255,255,.72)`) and the **missing
   scale step** between `--fs-h1` and `--fs-display`.

2. **`hero`** — **spec written**, `specs/sections/hero.md`. New file: the four
   story beats were built but never specified; `hero-collapse.md` only ever
   covered the bird. Six open questions, the first being the AI imagery.

3. **`bird-collage`** — **spec written**, `specs/sections/bird-collage.md`.
   Four open questions; the first (pull-back vs grow-over) inverts the motion
   table if it is wrong. Its facet geometry and the opening-frame resolution
   problem are measured, not inferred — see also `reference/README.md`.

4. **`phone-bento`** / **`phone-services`** — Nahian approved these on
   2026-09-17 and they are largely right. Each now carries a **Revision:
   rebuild** section covering ScrollTrigger, the mobile composition, and its
   audit rows. Two questions from 2026-09-17 are still unanswered.

5. **`about`** — carries a **Revision: rebuild** section. The Journey Wall on
   mobile is the biggest single piece of design work on the page.

`people-stories` is deliberately not in that list. If the bird carries nine
selectable stories, a three-tile row of stories directly beneath it is
redundant and one of them should go. Decide while specifying the bird.

## Open questions, carried forward

**For the hero spec:**
- The hero is **AI-generated imagery**; everything below it is real
  photography. The seam is visible. This is the biggest remaining exposure —
  and it has to be settled at hero-spec time specifically, because every camera
  target in `SCENE` is hand-tuned to that photograph.
- Does mobile keep a **separate portrait plate**? Right now desktop and mobile
  show different photographs of different scenes.

**For the bird spec** (not yet written):
- How many facets are selectable, and does that kill `people-stories`?
- The opening frame's resolution — see `reference/README.md`.

**Project-wide:**
- **Content sign-off.** Live bKash branding, real board names, a real executive
  quote. Fine for an internal pitch; a public URL needs bKash's approval, or it
  stays behind `noindex` + auth.
- Copy across the phone services and bento is placeholder, written by Claude.
- Bangla: out of scope until asked. The toggle stays visibly disabled, never
  silently dead.

## Model assignment

$100 of Fable 5.1 promotional credit is available. **Check first that Claude
Code is billing against it** — on a subscription plan, API credit does not apply
and this table is academic.

Each spec carries its own `> Model:` line; this is the overview. The rule behind
it is in `CLAUDE.md` -> Model selection.

| Work | Model | Why | Est. Fable |
|---|---|---|---|
| `foundation` | Opus 5 | A port of tokens that already exist plus two additions. Fully determinable. | — |
| `bird-collage` spec | **Fable 5.1** | Mechanism genuinely open, got wrong twice, signature moment. Conversational — the answer is not on disk. | ~$12 |
| `hero` spec | **Fable 5.1** | Camera framing, the 1px handover contract, the AI-imagery decision. | ~$5 |
| `hero` + `bird` camera build | **Fable 5.1** | Log-space interpolation and fixed-point derivation fail quietly. | ~$30 |
| Journey Wall, mobile form | **Fable 5.1** | A 6:1 artwork that cannot pan on a phone. Open creative problem. | ~$8 |
| `phone-bento` mobile composition | **Fable 5.1** (that call only) | A real design decision; the rest of the revision is written. | ~$5 |
| Everything else — bento build, phone-services, About's static sections | Opus 5 | Execution against written answers. | — |
| All `/verify` | Sonnet 5 | Mechanical. | — |

**~$60 of $100**, leaving headroom for the bird running long — which it may,
and should.

**Do not spend Fable credit on `foundation`.** It is the clearest waste
available: every answer in it is already written down in `reference/`.

**Give Fable the disk, not a chat handoff.** Start it in a fresh session pointed
at this file and the specs. Inheriting a long conversation means paying premium
rates for it to re-derive another model's framing — and to inherit that model's
mistakes. The one exception is the bird mechanism, which is not on disk and
needs Nahian in the room.

## Starting a session

```
cd /Users/nahian/Projects/bkash-site
claude
```

**`foundation`'s spec is already written** — read `specs/foundation/spec.md`,
answer its five open questions, and correct anything you disagree with. Then:

```
/plan foundation
```

`CLAUDE.md` loads automatically. `/clear` between phases — the specs are the
durable memory, the chat is not.
