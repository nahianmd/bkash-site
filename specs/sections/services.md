# Section 4: Bento → phone → sixteen services

> Status: DRAFT
> Model: **Fable 5.1** to specify and to build the emergence and the mobile
> panel; **Opus 5** for the bento layout, the grid, the panel content.
> Source: Nahian, 2026-09-17 (`phone-bento.md` and `phone-services.md`,
> both approved) and 2026-09-18 (bento reinstated, made beautiful, parallax on
> approach; the phone as the transition into the sixteen services);
> `specs/design-language.md`. New spec, 2026-09-18, absorbing both earlier
> ones. They stand as the record of what was approved and why; this file is
> the still-first version.

## Job

The product. Three states in one section:

1. **The bento** — six real photographs and a stat, bKash everywhere. The
   strongest "it is in every corner of life" still on the site, and the ground
   the phone emerges from.
2. **The emergence** — the phone tile becomes a device and comes forward in 3D
   as the wall falls away. The flashy transition. Approved 2026-09-17.
3. **The services** — the phone, large, showing the real app home screen;
   sixteen services, each selectable, each with a title, a line, and evidence.

Documentary register throughout (Rule 1). This is the last section on the
page; the footer follows.

## The still — the bento

### 1920

Eight cells on the dark ground shared with the people section: **six
photographs, one stat card, the phone tile.** The approved 3-column, 12-row
grid, with the right column offset against the left — the asymmetry is the
rhythm, kept on purpose.

```
col 1            col 2                 col 3
+----------+  +------------------------------------+
|  a       |  |  d   (wide, spans cols 2-3)         |
+----------+  +------------------+------------------+
|  b       |  |                  |  e  (stat)       |
+----------+  |     [ PHONE ]    +------------------+
|  c       |  |                  |  f               |
+----------+  |                  +------------------+
              |                  |  g               |
              +------------------+------------------+
```

**It fits the viewport on both axes.** The middle column is sized from the row
height so the phone tile is a true 360/760 — that is right and stays. But the
grid's *width* is then fit to `min(available width, height × aspect)`, so
height governs the tile and not the page margins. The prototype sized the
whole grid from `84vh` and rendered it at 43% of a 16:9 screen with 543px of
white either side. That is the one thing not to repeat.

Per tile: photograph at `cover`, crop set by eye, **one caption on one scrim**
(Rule 3), one type step, corners from one token. **The stat card is the focal
point** — pink, typographic, the one thing that is not a photograph. The phone
tile at rest is indistinguishable from its neighbours: same corners, no bezel,
the app screen at the tile's aspect so the sixteen icons are whole.

Headline above the grid, in normal flow, so it scrolls past before the pin.

### 390

**Four photographs, the stat, and the phone** — two columns, three rows,
sized to `--vh` minus the nav. Not the desktop seven with three hidden: four
chosen for what they say together. Proposed: `boatman` (payment on a boat),
`agent` (cash at a counter), `train` (money on the move), `sendmoney` (the app
in a hand). The phone tile keeps its aspect. Top row clears the nav (the
prototype's did not).

## Depth (Rule 2) — parallax on approach, one object on the fall

As the section scrolls into view, not yet pinned, the tiles sit in **three
depth groups** — say `a d g` back, `b e f` middle, `c` and the phone front —
and drift at slightly different rates. The drift is a function of distance
from the pin point and is **exactly zero when the section pins**, so every
tile is at rest the moment the fall begins. Depth on the way in; one rigid
plane on the way out; no discontinuity.

Rule 4 on hover: the pointed-at tile is full, the others recede. Not on the
phone tile — it has no hover state at rest; it is just a tile.

## Motion

One pinned ScrollTrigger. Progress is scrubbed across a **fraction** of the
travel and the rest holds, so the services are readable before the section
releases — the prototype learned this the hard way.

| Phase | Progress | What happens |
|---|---|---|
| Approach | before pin | Parallax drift → zero at the pin. |
| Fall + emergence | 0 → ~70% | **As approved.** The grid falls as one rigid plane, hinged at its bottom edge, tipping away and receding. Simultaneously the phone tile separates: its aspect narrows to a true phone, a bezel grows, the notch arrives late, and it comes forward — scaled about a fixed point — as the wall goes back. The wall is gone before the phone finishes. |
| Slide | ~70 → ~80% | Desktop only: the phone slides left to make the right column for the panel. |
| Services | ~80 → 100% | The phone at its final size. Hotspots live. Panel resolves. Hold. |

Ported from `reference/prototype/js/phone.js`: the rigid-plane transform, the
tile-to-device interpolation, the derived hotspot geometry, the measure-once
slot caching. Dropped: the six layout properties written per frame — the
device's box is a transform now (P2); `will-change` on layout props (P3); the
`ANIM_SPAN` fudge (P4), which ScrollTrigger's explicit end replaces.

### The services state

**Desktop.** Phone ~520px wide, slid left to ~28% across; panel to its right,
anchored to the phone's edge, holding its height so copy length cannot shift
it. The dead space right of the panel in the prototype (P9) is closed by the
panel's measure and by the family photograph (below) giving it a second column.

Sixteen hotspots as fractions of the screen box — columns at 12.5 / 37.5 /
62.5 / 87.5%, rows at 26.3 / 40.3 / 54.2 / 68.1% — so they scale with the
device and cannot drift off their icons. **Click to lock**, first service
auto-selected, no hover preview. **Rule 4:** the selected icon is full; the
other fifteen recede on the screen itself, so the ring is no longer the only
thing connecting the selection to the panel.

Panel: index (`07 / 16`), title, one line, and the **family photograph**.

**Mobile.** The phone grows until it is **~92% of the viewport width — not
edge to edge.** The bezel survives, so it reads as a phone and not a screenshot
under the site's nav (P7). Your handset frames the bKash phone.

The panel is a **bottom sheet** over the lower ~35% of the screen, and it may
**never cover the selected row** (P8 — the prototype's covered all of row 4).
When a service is tapped, the screen *inside the device* shifts up as needed
so the selected icon sits just above the sheet — the app screenshot is
720×4730, the whole home screen, so there is room to shift. Tap outside, or
the sheet's handle, to close. This is the one piece of this section that has
to be judged on a real handset.

### Reduced motion

The bento still, not pinned, followed in normal flow by the phone at its final
size with the panel beside or beneath it. The services are fully usable
without the fall.

## The sixteen and their families

Sixteen services, six documentary photographs, and Rule 1 keeps the rendered
set out — so not one photograph per service. **Five families, one photograph
each,** and the panel shows the family's.

| Family | Services | Photograph |
|---|---|---|
| Send | Send Money, Request Money, bKash to Bank, Remittance | `sendmoney.jpg` |
| Pay | Make Payment, Pay Bill, Mobile Recharge, Toll Pay, Education Fee | `boatman.jpg` (QR on the hull) |
| Cash | Cash Out, Add Money | `agent.jpg` (the counter) |
| Grow | Savings, Loan, Insurance | `train.jpg` |
| Give | Donation, NGO | `ferry.jpg` |

`merchant.jpg` is the sixth and sits in the bento only. The Grow and Give
pairings are the weakest — `train` is not obviously savings — and are the
first thing to swap if the client can supply two more photographs. Open
question 2.

## Content slots

| Slot | Content | Status |
|---|---|---|
| Six photographs | `bento/*.jpg`, 1400×932, one shoot | **DOCUMENTARY**, real bKash branding in frame |
| App home screen | `phone-screen.jpg` (720×4730) | **REAL** app UI |
| Sixteen names | in the app's order, as the prototype has them | **APP** — `NGO` vs the icon set's `Microfinance` is an open content gap |
| Sixteen lines | one each | **PLACEHOLDER** — written here, not bKash's |
| Stat card | `85 million` + line | **CLIENT DECK** (the About page's figure) |
| Bento captions | one per photograph | **PLACEHOLDER** |
| Section headline | `Everything money does, in one place.` | **PLACEHOLDER** |

## Audit rows closed

P1 the `84vh` width · P2 six layout writes per frame · P3 `will-change` on
layout props · P4 `ANIM_SPAN` · P5 mobile one-screen promise · P6 three cards
hidden on mobile · P7 bezel lost at full width · P8 panel covering row 4 ·
P9 left-heavy desktop end pose.

## Acceptance

- [ ] The bento at 1920 and at 390, motion disabled, reads as a composed still
      on the dark ground. **Nahian's eye.**
- [ ] At 1920×992 and 1920×1080 the grid fills at least 80% of the viewport
      width and fits within `--vh` minus the nav. No 543px margins.
- [ ] Every caption measures at least 4.5:1 on its scrim, both widths.
- [ ] Parallax: tiles in three groups move at three rates on approach, and
      every tile is at its rest position at the exact scroll position where
      the pin engages — measured, zero offset.
- [ ] Hover on a tile: it is full, the others recede; the phone tile has no
      hover state.
- [ ] The fall is one rigid plane; the phone separates and comes forward; the
      wall is gone before the phone finishes growing. As approved.
- [ ] Scrubbing back reverses the whole move to the bento at rest.
- [ ] Desktop end pose: phone and panel share the width with no dead column;
      the panel does not move when copy length changes.
- [ ] Sixteen hotspots sit centred on their icons at the final size; selected
      icon full, fifteen receded.
- [ ] Mobile: the device stops at ~92% width with a visible bezel; the sheet
      never covers the selected row; the tapped icon is visible above the
      sheet for all sixteen.
- [ ] The section holds after the services are live for about half a screen
      before the footer rises.
- [ ] Reduced motion: bento still, then the phone and panel usable.
- [ ] No horizontal overflow at 390.

## Explicitly NOT this

- **NOT cards falling individually or staggered.** One rigid plane. (Built
  wrong once.)
- **NOT the phone falling with the grid or merely scaling in place.** It
  separates and comes forward.
- **NOT per-tile animation during the fall.** Parallax ends at the pin.
- **NOT a grid sized from height alone.** Both axes.
- **NOT seven tiles with three hidden on a phone.** Six chosen.
- **NOT the phone edge-to-edge on a phone.** The bezel is the point.
- **NOT a panel that covers what it describes.**
- **NOT hover-to-select.** Click to lock, as approved.
- **NOT a crop-filled screen.** The sixteen read whole.
- **NOT rendered imagery** anywhere in this section (Rule 1).

## Open questions

1. **The dark ground** — same question as the people section; one answer for
   both.
2. **The five families** and their photographs. Grow and Give are stretched.
   Ask the client for two photographs, or accept the pairings?
3. **Screen scrub on desktop** (open since 09-17): does the app screen scroll
   inside the device as the phone grows, or hold on the top? Written as hold;
   on mobile it shifts only to keep the tapped row clear of the sheet.
4. **Where the desktop zoom stops** (open since 09-17): ~520px wide and slid
   left, as built and as `phone-services.md` approved. Confirm, or bigger.
5. **`NGO` vs `Microfinance`** — the app says one, the icon set says the other.
