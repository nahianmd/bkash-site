---
description: IMPLEMENT phase - work the approved plan in small, verifiable steps
argument-hint: [section or feature slug]
allowed-tools: Edit, Write, Bash, Skill, Read, Grep, Glob
---
You are running the IMPLEMENT phase of this project's spec-driven development
process (see SDD-WORKFLOW.md).

Slug: $ARGUMENTS
Spec: `specs/sections/$ARGUMENTS.md` or `specs/$ARGUMENTS/spec.md`
Plan: `specs/$ARGUMENTS/plan.md`

**Before you start — check the model.**

Every spec carries a `> Model:` line naming which model that work is meant to
run on, and why. You know which model you are. Compare them, and if they differ,
say so in one line and let Nahian switch or wave you on — do not just proceed,
and do not switch anything yourself.

Watch for a split tag — several specs name one model for the section and
another for a specific task inside it (the hero's camera, the Journey Wall's
mobile form). Raise it when you reach that task, not only at the start.

Do this:

1. Read `CLAUDE.md`, the spec and the plan. Read any nested `CLAUDE.md` in a
   folder you will be working in.
2. Set the spec's `Status:` to `APPROVED` if it is not already.
3. Work the plan's checklist top-to-bottom, ONE task at a time. After each task:
   - run `npm run check` and `npm run build` in `web/`;
   - make one small, focused commit (`type(scope): summary`);
   - tick the task off in `plan.md`.
4. Set `Status: BUILT` when the checklist is done, and hand off to `/verify`.
   Do not walk the acceptance criteria yourself — that is the verify phase, on
   Sonnet. Say which criteria you *expect* to pass and which you are unsure of,
   so verify knows where to look first.

Hard rules:

- **No browser during implement.** Screenshots and DOM checks belong to
  `/verify`. `npm run check` and `npm run build` are the gates here. The one
  exception: a task whose done-state genuinely cannot be judged from build
  output (a composite alignment, a crop set by eye) gets *one* look to finish
  the task — never a check-fix-check loop, and never walking acceptance
  criteria.
- Stay strictly scoped to the approved plan.
- If the plan turns out to be wrong or incomplete, **STOP and say so.** Do not
  silently redesign — that is the failure this process exists to prevent.
- `reference/` is the frozen prototype. Read it, port from it, do not edit
  it.
- No inline `style=""` attributes and no magic numbers. Everything goes through
  the tokens in the design system. This is the rule the prototype broke and the
  reason its typography could not be fixed incrementally.
- Never mark a section `SIGNED-OFF`. Only Nahian does that.
