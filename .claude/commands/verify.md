---
description: VERIFY phase - check the built section against its acceptance criteria, by eye and by measurement
argument-hint: [section or feature slug]
---
You are running the VERIFY phase of this project's spec-driven development
process (see SDD-WORKFLOW.md).

Slug: $ARGUMENTS
Spec: `specs/sections/$ARGUMENTS.md` or `specs/$ARGUMENTS/spec.md`

This project has no unit test suite and will not grow one — the acceptance
criteria are visual ("reads as one continuous move", "the caption is legible
over the plate at every beat"). So verification means **driving the real page
and looking at it**, backed by measured DOM values wherever a number can settle
an argument. A measured number beats an impression; a screenshot beats a
measured number when the criterion is about how it *reads*.

**Before you start — check the model.**

Every spec carries a `> Model:` line naming which model that work is meant to
run on, and why. You know which model you are. Compare them, and if they differ,
say so in one line and let Nahian switch or wave you on — do not just proceed,
and do not switch anything yourself.

Verification is mechanical and is tagged **Sonnet 5** across the board,
whatever the section's own build model was. Say so if you are on something
more expensive.

Do this:

1. Re-read the spec's acceptance criteria and its "Explicitly NOT this" list.
2. Machine checks first, because they are cheap:
   - `cd web && npm run check` (astro check: types and template errors)
   - `cd web && npm run build` (a build that fails verifies nothing)
   Report both.
3. Serve the built site and drive it in Chrome:
   - `cd web && npm run preview` (or `npm run dev` when checking source).
   - **Desktop:** navigate directly, capture at the scroll positions the spec
     names.
   - **Phone:** window resizing does not work through the extension on this
     machine. Replace the page body with a 390x780 `<iframe>` pointed at the
     same URL — media queries respond to the iframe's own width. Watch for the
     iframe's scrollbar making `innerWidth` ~15px wider than the content, which
     reads as a centring offset that is not real.
4. Beware the two traps that have cost hours here before:
   - **The automation tab runs hidden, so `requestAnimationFrame` never fires**
     and ScrollTrigger will not advance on its own. Set the scroll position,
     then drive it deterministically (`ScrollTrigger.update()`, or the section's
     own dev handle on `window.__bkash`) before capturing. A screenshot taken
     without this shows a stale frame.
   - **CSS transitions do not advance in a hidden tab either**, so a
     transitioned property measured there reads its start value forever. Set
     `transition: none` on the element before measuring it.
5. Walk each acceptance criterion individually and mark it **PASS**, **FAIL** or
   **NEEDS NAHIAN'S EYE**, with evidence: the screenshot, or the measured value
   and what you compared it against. The third verdict is legitimate and should
   be used — whether a move "reads as cinematic" is not yours to sign off.
6. Check the "Explicitly NOT this" list explicitly. Confirm you did not build
   any of the near-misses.
7. Always check these, whether or not the spec lists them:
   - no horizontal overflow at 390px (`documentElement.scrollWidth <=
     innerWidth`);
   - nothing important sitting under the fixed nav, at either width;
   - the section still reads correctly when scrolled *backwards* through;
   - `prefers-reduced-motion: reduce` leaves a coherent page, not a broken one.

Outcome:

- Anything FAILs -> summarise the gaps and recommend going back to PLAN. Do not
  mark the section done, and do not patch blindly.
- All PASS -> set `Status: BUILT`, summarise the diff, and list what still needs
  Nahian's eye before he can mark it `SIGNED-OFF`. **Never set SIGNED-OFF
  yourself.**
