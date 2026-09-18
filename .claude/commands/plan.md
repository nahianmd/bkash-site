---
description: PLAN phase - investigate the code and write an implementation plan (no code)
argument-hint: [section or feature slug]
---
You are running the PLAN phase of this project's spec-driven development
process (see SDD-WORKFLOW.md).

Slug: $ARGUMENTS
Spec: `specs/sections/$ARGUMENTS.md`, or `specs/$ARGUMENTS/spec.md` for
infrastructure work. Read whichever exists.

**Before you start — check the model.**

Every spec carries a `> Model:` line naming which model that work is meant to
run on, and why. You know which model you are. Compare them, and if they differ,
say so in one line and let Nahian switch or wave you on — do not just proceed,
and do not switch anything yourself.

The tag may name different models for specifying and for building. You are
planning, so the spec's model applies unless it says otherwise.

Do this:

1. Read `CLAUDE.md` and the spec. If the spec still has Open questions, resolve
   them with Nahian **before** planning. A plan built on an unresolved question
   is a plan that gets thrown away.
2. Investigate what exists today. Two places matter and they are different:
   - `web/` — the real build. What is already there to reuse.
   - `reference/prototype/` — the **frozen prototype**. Read-only. This is where the
     hard-won camera and anchoring maths live. Name the exact functions and
     line numbers you intend to port, and say what changes on the way across.
   Use the read-only Explore subagent if the search is genuinely broad;
   otherwise just read the files. Summarise what you found.
3. Write `specs/<slug>/plan.md` from `specs/_templates/plan.md`, covering:
   - approach and rationale, including which parts of the prototype are ported
     verbatim, which are rewritten, and why;
   - the real file paths under `web/src/` that you will add or change;
   - how the motion is driven — every pinned or scrubbed section on this
     project uses **GSAP ScrollTrigger**, so state the trigger, the pin target,
     the scrub value, the snap behaviour, and how progress maps to the section's
     own maths;
   - how it behaves at 390px, stated separately from desktop. Mobile is a
     composition in its own right here, not a set of overrides — if the plan
     only has desktop in it, it is not finished;
   - an ordered task checklist small enough to commit one task at a time;
   - risks and what you would check first if it looks wrong.

Hard rules:

- Do NOT write implementation code in this phase.
- Every animated section is scroll-**driven**, never gesture-stepped. If a
  design seems to need wheel interception, stop and raise it — do not
  reintroduce scroll-jacking.
- Prefer reusing the prototype's maths over reinventing it. Flag anything where
  you must deviate from `CLAUDE.md`.
- End by showing the plan and any open questions, and wait for explicit
  approval before implementing.
