# Plan: [Section or feature name]

> The HOW. Produced from the approved spec during the Plan phase. Approved by
> Nahian before implementation. Lives in `specs/<slug>/plan.md`.

## Spec
Link: `specs/sections/<slug>.md` (or `specs/<slug>/spec.md`)

## What exists today
> Two different places, and the distinction matters.

**In `web/` (the real build):**
- [What is already there to reuse — tokens, layout primitives, existing sections]

**In `reference/prototype/` (the frozen prototype — read-only):**
- [Exact functions and line numbers being ported, e.g. `hero.js:245 poses()`]
- [What changes on the way across, and why]
- [Anything in there that looks reusable but is not — say so, with the reason]

## Approach
[The chosen design in a few sentences. Why this over the alternatives you
considered. Name the alternative you rejected.]

## Motion
> Every pinned or scrubbed section on this project is driven by GSAP
> ScrollTrigger. No wheel interception, ever.

- **Trigger / pin target:** [element, and the travel it gets]
- **Scrub:** [true, or a number for smoothing]
- **Snap:** [beats to snap to, or none]
- **Progress mapping:** [how 0..1 drives this section's own maths — the phases
  and the fractions they occupy. State what holds still during each phase.]
- **What does NOT move:** [usually where misreadings happen]

## Layout

**Desktop:**
- [Composition at rest, and what the pin does to it]

**390px:**
- [Stated as its own composition, not as a list of overrides. If this section
  is only a narrowed desktop layout, say so explicitly and justify it.]

## Files to add / change
- `web/src/...` — [what changes and why]

## Assets
- [Which sources, at what display size, through `astro:assets` or not, and why]
- [Mark anything still PLACEHOLDER]

## Verification
> How each acceptance criterion gets checked. `/verify` runs this.
- [Criterion -> the scroll position and viewport to capture, or the DOM value to
  measure and what to compare it against]
- [Which criteria can only be signed off by Nahian's eye]

## Task checklist
> Implement works these top-to-bottom, committing after each.
- [ ] [Task 1 — smallest slice that renders something]
- [ ] [Task 2]
- [ ] Mobile composition
- [ ] Reduced-motion fallback
- [ ] Update `PROGRESS.md`

## Risks
- [Risk + what you would check first if it looks wrong]
