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

Do this:

1. Read `CLAUDE.md`, the spec and the plan. Read any nested `CLAUDE.md` in a
   folder you will be working in.
2. Set the spec's `Status:` to `APPROVED` if it is not already.
3. Work the plan's checklist top-to-bottom, ONE task at a time. After each task:
   - run `npm run check` and `npm run build` in `web/`;
   - make one small, focused commit (`type(scope): summary`);
   - tick the task off in `plan.md`.
4. Set `Status: BUILT` when the checklist is done, and say which acceptance
   items you verified yourself and which need Nahian's eye.

Hard rules:

- Stay strictly scoped to the approved plan.
- If the plan turns out to be wrong or incomplete, **STOP and say so.** Do not
  silently redesign — that is the failure this process exists to prevent.
- `reference/` is the frozen prototype. Read it, port from it, do not edit
  it.
- No inline `style=""` attributes and no magic numbers. Everything goes through
  the tokens in the design system. This is the rule the prototype broke and the
  reason its typography could not be fixed incrementally.
- Never mark a section `SIGNED-OFF`. Only Nahian does that.
