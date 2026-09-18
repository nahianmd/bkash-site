---
description: Capture a section's spec from the user's instruction, then build to it
argument-hint: [section slug, e.g. hero-collapse]
---
Section: $ARGUMENTS

You are running the section-spec loop for this project (see CLAUDE.md).

1. Read `specs/sections/$ARGUMENTS.md` if it exists; otherwise create it from
   `specs/_templates/section.md`.
2. Write the spec from what the user has told you. Do NOT interview
   question-by-question — the user is working to a deadline. Instead: fill in
   everything you can, then list every ambiguity under Open questions in one
   batch.
3. Pay particular attention to **Explicitly NOT this**. The failure mode on
   this project is Claude inferring a plausible mechanism that is not the one
   the user pictured. Write down the near-miss you would otherwise have built.
4. Show the spec and get explicit approval before writing code.
5. Once approved, set Status: APPROVED, implement, then set Status: BUILT and
   report which acceptance items you verified and which need the user's eye.

Hard rules:
- Acceptance criteria are visual here. Make them specific enough that the user
  can disagree with one.
- Never mark SIGNED-OFF yourself. Only the user does that.
