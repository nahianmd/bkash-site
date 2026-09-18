# Spec-Driven Development — bKash

Adapted from `/Users/nahian/Projects/sdd-kit` for a project whose acceptance
criteria are visual rather than unit-testable.

The spec is the source of truth. Nothing gets built until it is written down,
and nothing is signed off until it has been looked at on a real screen at two
real widths.

## Why this, here

The documented failure mode on this project is not bugs. It is **Claude
inferring a plausible mechanism that is not the one Nahian pictured, then
building it well.** The hero collapse was built twice for exactly that reason.
Phase gates with a human approval at each boundary are the fix, and
"Explicitly NOT this" in every section spec is the specific instrument.

## Where things live

```
bkash/
├── CLAUDE.md                  # project constitution, read every session
├── SDD-WORKFLOW.md            # this file
├── PROGRESS.md                # durable memory across context resets
├── web/                       # THE BUILD — Astro + GSAP ScrollTrigger
├── src/                       # frozen reference prototype. read-only.
├── specs/
│   ├── _templates/
│   │   ├── section.md         # visual sections — the usual case
│   │   ├── spec.md            # infrastructure work
│   │   └── plan.md            # implementation plan
│   ├── sections/<slug>.md     # one spec per section
│   └── <slug>/plan.md         # one plan per piece of work
└── .claude/
    ├── settings.json          # hooks: secret scan, bash veto, formatter
    └── commands/              # /specify /plan /implement /verify
```

## The loop

| Phase | Command | What happens | Nahian's job |
|-------|---------|--------------|--------------|
| 1. Specify | `/specify <slug>` | Claude writes the spec from your instruction and batches **every** ambiguity in one list. No code. | Answer the batch, edit, approve. |
| 2. Plan | `/plan <slug>` | Investigates `web/` and the `reference/` prototype, writes `plan.md` — motion, layout at both widths, file paths, task list. No code. | Review the approach and task list, approve. |
| 3. Implement | `/implement <slug>` | Works the checklist one task at a time, `astro check` + build after each, one small commit per task. | Review diffs. If Claude says the plan is wrong, decide the fix. |
| 4. Verify | `/verify <slug>` | Drives the real page in Chrome at desktop and 390px, marks each criterion PASS / FAIL / NEEDS NAHIAN'S EYE with evidence. | Look at what it flags, then mark the spec `SIGNED-OFF`. |

A failed verify goes back to **Plan**, not to a patch.

## How this differs from the stock kit

- **No test suite, and there will not be one.** `/verify` drives the page and
  looks at it instead. That is not a weaker gate — it caught a bento grid
  rendering at 43% of viewport width, which no unit test would have.
- **One batch of questions, never a drip.** The kit's `/specify` interviews one
  question at a time. That wastes long working sessions; everything ambiguous
  goes in one list.
- **`section.md` beats the kit's `spec.md`** for anything with motion in it. It
  has Motion beats, Content slots with PLACEHOLDER marking, and Explicitly NOT
  this. The kit's edge-case and constraint sections are backend-shaped and come
  out empty every time.
- **Mobile is a phase-2 deliverable, not a phase-3 afterthought.** A plan with
  only a desktop composition in it is not finished.

## Habits that keep it working

- **`/clear` between phases.** The spec and plan are the durable memory; the
  chat is not. This project burns context faster than most.
- **Small commits during Implement**, so a wrong turn costs one revert.
- **Hooks, not vigilance.** The formatter and the bash veto run whether or not
  anyone remembers them.
- **Status is a real state machine.** `DRAFT -> APPROVED -> BUILT ->
  SIGNED-OFF`. Only Nahian sets the last one.
