# Section: Phone — bento grid that collapses into the device

> Status: APPROVED — Nahian, 2026-09-17
> Source: Nahian, 2026-09-17, with an Insta360 "Luna Ultra" reference screenshot
> Replaces: the current split-screen phone section (phone left, copy right)

## Intent

The app's capabilities are shown as a wall of evidence — a bento grid of
feature cards — and then everything that is not the phone gets out of the way,
leaving the device alone and full-screen. The grid earns the phone its moment
rather than just sitting next to it.

## Layout

A bento grid occupying **exactly one screen**, no internal scrolling.
**Centred, not full-bleed** — it holds a max width with clear space either
side. Dark ground, for contrast against the hero handing over on white.

Layout per Nahian's diagram (`specs/refs/phone-bento-layout.jpeg`), as a
3-column x 12-row grid:

```
col 1            col 2                 col 3
+----------+  +------------------------------------+
|  a       |  |  d   (wide, spans cols 2-3)         |
|          |  |                                     |
+----------+  +------------------+------------------+
|  b       |  |                  |  e  (copy only)  |
|          |  |     [ PHONE ]    +------------------+
+----------+  |                  |  f               |
|  c       |  |                  +------------------+
|          |  |                  |  g               |
+----------+  +------------------+------------------+
```

The right column's rows are deliberately offset against the left column's,
which is what gives a bento its rhythm rather than reading as three tidy
stacks.

**The phone tile is a real phone's proportions.** The middle column is sized
in JS from the row height so the slot lands at exactly 360/760, and the whole
bento is then narrowed to suit — the grid is driven off viewport HEIGHT, not
width. Two things follow from that:

- At rest the tile is indistinguishable from its neighbours: same corners, no
  bezel, even gaps. It only *becomes* a phone on scroll.
- The screen art needs no cropping. `object-fit: cover` on a box that already
  matches the source's aspect shows the app's full width, so the sixteen
  service icons stay whole rather than being trimmed at the edges. They simply
  become more readable as the phone grows.

## Motion beats

| # | Trigger | What happens | Duration |
|---|---------|--------------|----------|
| 1 | Approach | Section scrolls into view normally. Nothing pinned, nothing animating. Grid is fully readable at rest. | — |
| 2 | Section fills the viewport | It pins. Scroll continues to be consumed by the section rather than the page. | — |
| 3 | Scroll while pinned | The phone cell **zooms in continuously**, growing out of its cell toward a fixed end point. | 0–100% of pin |
| 4 | Same scroll, same time | The grid **falls as a whole** — one rigid plane, hinged along its bottom edge, tipping away from the viewer and receding. The cards do not move independently of each other. Gradual and scroll-linked: at any scroll position the plane sits at a definite angle. | 0–~80% of pin |
| 4b | Same scroll, same time | The device **separates from that plane and emerges toward the viewer in 3D** — it does not fall with the grid. It comes forward on Z out of the wall as the wall lays down behind it. | 0–100% of pin |
| 5 | End of pin | Phone at its end size. Section releases scroll to the page. | — |

The fall and the zoom are **simultaneous**, not sequential — the grid clears
as the phone grows through it.

## Content slots

The phone cell — the device, carrying the real app home screen
(`phone-screen.jpg`, already built).

Five feature cells, all **real supplied photography** (2026-09-17), 1600x1066
originals resized to 1400px:

| Cell | Asset | Subject | Caption (PLACEHOLDER copy) |
|------|-------|---------|----------------------------|
| A | `bento/sendmoney.jpg` | Hand holding a phone mid-transfer, Tk 10,000 on screen | "Send money in seconds" |
| B | `bento/agent.jpg` | Agent counter under bKash signage, customer at the glass | "3.5 lakh agents, open when banks are not" |
| C | `bento/boatman.jpg` | Boatman on the Buriganga, bKash QR fixed to his boat | "Take payment anywhere" |
| D | `bento/train.jpg` | Train window, two people, two phones | "Money moves before the train does" |
| E | `bento/ferry.jpg` | Cloth seller at a launch terminal, bKash sticker on the pillar | "A shop that fits in a hand" |

All five carry authentic bKash branding — real QR stickers, real signage, real
app screens — which makes this section the strongest evidence on the page and
a deliberate contrast with the AI hero (needs.md A0).

## Acceptance

- [ ] The grid fits one screen at the demo resolution with no internal scroll.
- [ ] Scrolling into the section is ordinary — no pin, no motion, until it
      fills the viewport.
- [ ] Once pinned, the phone grows continuously and ends up filling the screen.
- [ ] Non-phone cells tip and fall in 3D, staggered, and are gone before the
      phone finishes filling.
- [ ] Zoom and fall happen together, not one after the other.
- [ ] The section releases scroll cleanly at the end and on the way back up.

## Explicitly NOT this

- **NOT** cards falling individually or staggered. The grid is ONE plane and
  it falls as one rigid object. (Built wrong once this way — the reference
  uses a single transformer element inside one perspective container.)
- **NOT** the device falling with the grid, or merely scaling in place. It
  SEPARATES from the plane and comes forward on Z as the plane goes back.
- **NOT** a phone-shaped element parked inside a rectangular cell. That was
  what made the gaps look uneven — the leftover space around the device WAS
  the gap.
- **NOT** a crop-filled screen. The services must read whole.
- **NOT** the cells fading or scaling out.
- **NOT** the cells falling first and then the phone zooming. Simultaneous.
- **NOT** a pinned section that starts animating the moment it enters view.
  It behaves as an ordinary section until it fills the screen.
- **NOT** the existing side-by-side layout (phone left, copy panel right).
  That layout is replaced entirely.
- **NOT** stepped like the hero. Continuous scroll.
- **NOT** falling toward the viewer. They fall BACK, away, into the screen.
- **NOT** a timed animation that plays once the pin starts. Every card's angle
  is a direct function of scroll position, so it can be scrubbed back and
  forth and always sits mid-fall at a definite angle.

## Resolved (Nahian, 2026-09-17)

1. Five supplied photographs — see Content slots.
2. Hover interaction deferred: "just zoom to a point". The phone grows to a
   fixed end size and stops. Hotspot code stays in the tree but inert.
3. Falls **back**, away from the viewer, not front-facing. Gradual and
   scroll-linked, not instantaneous. **As a whole** — the grid is one plane,
   and the device emerges out of it in 3D rather than falling with it.
   (Reference: insta360.com Luna Ultra, `section.sec-bento` >
   `.part-1[perspective:1400px]` > `.part-1-transformer` — a single
   transformed element for the entire grid.)
4. Continuous scroll.

## Open questions

1. **Screen scrub.** The phone's screen art is the real app home page and it is
   long — 720x4730, the whole scrolling home screen rather than just the top.
   We can move the visible window down it as the phone grows, so the app
   appears to scroll inside the device. Or it can hold on the top of the home
   screen and not move. Which?
2. **Where does "zoom to a point" stop?** Assuming the phone ends roughly
   filling the viewport height with margin — large enough to dominate, not
   cropped. Say if you want it bigger or cropped to the screen edges.
