# Section: Phone — selectable services, description on the right

> Status: BUILT — Nahian's eye needed on copy and spacing
> Source: Nahian, 2026-09-17
> Follows: `phone-bento.md`. Begins where that ends — phone at 520x1098,
> slid left, bento gone.

## Intent

The payoff for the whole bento sequence. The phone is now large enough to
read, so the sixteen services stop being decoration and become the subject:
pick one and find out what it does.

## Layout

Phone on the left where the slide left it. A description panel occupies the
right-hand side — the space the slide was setting up.

Hotspots sit over the sixteen icons on the real app screenshot, derived from
the screen box rather than hand-placed:

- The screen shows the **top 1520px** of the 4730px source (cover-fit at
  phone aspect crops the rest).
- Columns at **12.5% / 37.5% / 62.5% / 87.5%** of screen width.
- Rows at **26.3% / 40.3% / 54.2% / 68.1%** of screen height.
- Hit radius about 29px at the resting size, scaling with the phone.

Order matches the app exactly:

| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| **1** | Send Money | Mobile Recharge | Cash Out | Make Payment |
| **2** | Add Money | Pay Bill | Savings | Loan |
| **3** | Insurance | bKash to Bank | Education | NGO |
| **4** | Toll Pay | Request Money | Remittance | Donation |

## Motion beats

| # | Trigger | What happens |
|---|---------|--------------|
| 1 | Slide completes | Hotspots become live. Panel shows a default state. |
| 2 | Select an icon | Its ring lights up; the panel swaps to that service. |
| 3 | Deselect / select another | Panel swaps again. |

## Content slots

Sixteen titles (above) plus a line each. **PLACEHOLDER** copy — I have a set
written from the earlier build and can reuse it, but it is mine, not bKash's.

## Acceptance

- [ ] Every hotspot sits centred on its icon at the resting size.
- [ ] Selecting swaps the panel without layout shift — no jump as copy
      changes length.
- [ ] Panel is legible over the white ground and does not collide with the
      phone at the demo resolution.
- [ ] Works with the phone at its final position, not only mid-animation.

## Explicitly NOT this

- **NOT** hotspots that drift off their icons as the phone scales. They are
  positioned as fractions of the screen box, so they scale with it.
- **NOT** a panel that resizes as copy changes length — it holds its height.
- **NOT** live during the zoom. Nothing is selectable until the slide is done.

## Resolved (Nahian, 2026-09-17)

1. **Click to lock only.** No hover preview, no scroll-to-select.
2. **First service auto-selected** (Send Money).
3. Placeholder copy kept — mine, not bKash's.
4. **This is the last section of the page.** Nothing follows it. Scrolling
   back up reverses the move and resets the selection to the first service.

## Verified

- 16 hotspots at columns 12.5 / 37.5 / 62.5 / 87.5% and rows 26.3 / 40.3 /
  54.2 / 68.1% of the screen box — exactly as derived, 58px across at rest.
- Clicking icon 7 gives "07 / 16 — Savings" with exactly one ring lit.
- Picking NGO then scrolling up returns the panel to Send Money.
- Page height ends flush with the section.


---

## Revision: rebuild (DRAFT, 2026-09-18)

> Closes audit rows **P8** and **P9**.

### The panel covers the icons it describes

On mobile the description panel is a gradient over the foot of the device, and
it lands **on top of row 4** — Toll Pay, Request Money, Remittance and Donation
are all obscured by the copy explaining them (**P8**). At full-bleed width there
is nowhere for a panel to go, so this is a composition problem, not a spacing
one. Options: the panel becomes a sheet the selected icon pushes up into with
the grid shifted, or selection scrolls the chosen icon clear first.

### Desktop composition is left-heavy

Phone at 28% across, panel starting beside it, ~200px of dead space at the
right edge (**P9**). The panel is also text-only and carries no visual tie back
to the hotspot that is lit — nothing connects the ring on the screen to the
words. Both worth fixing while it is being rebuilt anyway.

### Carried forward unchanged

Click-to-lock only, first service auto-selected, hotspots derived as fractions
of the screen box, panel holds its height so copy length cannot shift the
layout. All verified working in the prototype and all still right.
