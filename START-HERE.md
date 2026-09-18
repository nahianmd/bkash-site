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
│   ├── design-language.md   ← the layer above the tokens; approve first
│   ├── foundation/spec.md   ← implements the design language
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

Reset on 2026-09-18 (evening), after Nahian's principle: **every section must
look good standing still, with no animation; transitions come second and can
only be as good as the two states they connect. Mobile is non-negotiable.**

The page is four sections — **hero → bird → people → bento/phone/services** —
one arc, story → proof → product. The bento stays, made beautiful with parallax
on approach; the phone emerges from it into the sixteen services. See
`specs/design-language.md`.

1. **`design-language`** — **written**, `specs/design-language.md`, DRAFT.
   Four rules: the seam is the structure; every section is 2–3 planes; text on
   a photograph always has a ground; focus means the rest recedes. Four open
   questions. Approve or argue with it first — everything below implements it.

2. **`foundation`** — spec exists; it now *implements* the design language.
   Its acceptance criteria stand, with three added (ground, recede and plane
   tokens). Opus.

3. **Section specs, rewritten still-first — written**, all four DRAFT:
   `hero.md`, `bird.md`, `people.md`, `services.md`. Composition at
   rest at 1920 and 390 first, the transition second. `phone-bento.md` and
   `phone-services.md` are superseded by `services.md` and kept as the record.
   Each carries its open questions at the foot; none blocks `foundation`.
   **`hero.md` was re-specified the same evening around four illustrated
   assets** (`reference/assets/img/hero.jpeg`, `amena.png`, `Rahim.png`,
   `Faysal.png`) — previs for a real shoot. It carries the photographer's brief
   The bird is now a **mask window** over the hero's last frame (`bird.md`,
   same evening) — no collage remake, handover exact by construction.

4. **Transitions** — designed against composed states, once those exist.

5. **`about`** — after the homepage. Voices are text-only until originals
   arrive.

**Decisions taken 2026-09-18 evening (Nahian):** seam-as-structure, yes. Bento
stays — made beautiful, with parallax; the hand-composite alternative was too
much 3D work. "Mechanism that focuses each story"
= non-subjects recede, not the stepped gesture. Voices, later. Mobile,
non-negotiable.

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
| `bird` spec | **Fable 5.1** | Mechanism genuinely open, got wrong twice, signature moment. Conversational — the answer is not on disk. | ~$12 |
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
