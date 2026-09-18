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

2. **`hero`** — four beats now, not five: wide → customer → agent → merchant.
   Scroll-driven on a pinned ScrollTrigger with snap, replacing the wheel
   interception. Establishes the ScrollTrigger patterns every later section
   inherits. **Must state precisely where it ends** — the merchant framed so
   the bird's wing facet can take over without a cut. That framing is the
   contract between hero and bird.

3. **`bird-collage`** — no spec yet, deliberately. An earlier attempt was
   written and binned for weak context; do not reconstruct it. Spec this fresh
   from Nahian's own description of the move, once the hero exists to hand over
   from. The verified facts it will need — nine facets, their geometry, and the
   opening-frame resolution problem — are in `reference/README.md`, measured
   from the artwork rather than inferred.

4. **`phone-bento`** — independent. Carries its own bug list.

5. **`about`** — its own set of sections.

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
