---
description: SPECIFY phase - write a section or feature spec from Nahian's instruction (no code)
argument-hint: [section slug or short description]
---
You are running the SPECIFY phase of this project's spec-driven development
process (see SDD-WORKFLOW.md).

Feature: $ARGUMENTS

Do this:

1. Read `CLAUDE.md` to load the mission, stack and conventions.
2. Choose a short kebab-case slug. Pick the template by what you are specifying:
   - **A section of the site** (anything with motion, layout or art direction)
     -> `specs/sections/<slug>.md` from `specs/_templates/section.md`.
   - **Infrastructure** (build, deploy, tooling, i18n plumbing)
     -> `specs/<slug>/spec.md` from `specs/_templates/spec.md`.
   Most work on this project is the first kind.
3. Fill in everything you can from what Nahian has already told you, plus what
   you can establish by reading the reference prototype in `reference/prototype/` and the
   existing specs. Then raise **every** ambiguity — batched under Open
   questions, or talked through with Nahian, whichever suits the section. Where
   the uncertainty is the mechanism itself, talk it through.
4. Write the spec. Set `Status: DRAFT`.

Hard rules:

- Do NOT write any implementation code in this phase.
- **"Explicitly NOT this" is mandatory on every section spec.** The documented
  failure mode on this project is inferring a plausible mechanism that is not
  the one Nahian pictured, then building it well — the hero collapse was built
  twice for exactly this reason. Before you write it, ask yourself what you
  would build if you stopped reading now, and write *that* down as the
  near-miss to rule out.
- Acceptance criteria here are **visual**, not unit-testable. "Reads as one
  continuous move with no visible cut" is a valid criterion. Make each one
  specific enough that Nahian can disagree with it.
- Name every piece of copy and every image in Content slots, and mark
  PLACEHOLDER explicitly, so nothing unapproved ships unnoticed.
- End by showing the spec and asking for explicit approval before we plan.
