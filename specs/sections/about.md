# Page: About bKash

> Status: BUILT — needs Nahian's eye
> Model: **Opus 5.** Exception: **Fable 5.1** for the Journey Wall on mobile —
> a 6:1 artwork that cannot pan on a phone is an open creative problem with no
> existing answer.
> Source: Nahian, 2026-09-17 — "all of them, it's pretty straightforward"

## Sections, in order

1. **Hero** — full-bleed banner, headline, lead, CTA.
2. **Stats** — four count-ups: 84M customers, 350K agents, 1M merchants,
   16+ products. Tabular figures so digits do not jitter the layout.
3. **Platform triad** — Store Value / Pay & Be Paid / Empower.
4. **Investors** — six logos: BRAC Bank, Money in Motion, IFC, Gates
   Foundation, Ant International, SoftBank. Flattened to one weight so six
   different logo treatments read as a set; colour returns on hover.
5. **Board of Directors** — twelve portraits with a duotone treatment.
6. **CEO quote** — Kamal Quadir, on dark.
7. **Journey Wall** — the 60x10ft artwork panned horizontally while pinned.
8. **Voices** — four testimonials.
9. **Careers**, **Road Ahead**, **footer**.

## Notes worth keeping

**The Journey Wall needed a rasteriser.** The source is a 51MB PDF and this
machine has no Ghostscript, Inkscape or pdftoppm. `tools/pdfraster.swift`
renders it through CoreGraphics. Rendered at 14x, then cropped to the artwork
by row density — the artboard caption underneath is sparse text where the
artwork's maroon ground fills its rows. The crop came out at **exactly 6.00
aspect**, matching the filename's "60x10 ft", which is how we know it found
the right bounds. Exported at 5200x867, 618KB.

Chrome around the wall is kept deliberately tight: at 6:1, every pixel of
height given back to the artwork is six pixels of readable width. At 64vh the
wall renders 3593px wide, about 240px per milestone — legible.

**The duotone is a filter, not baked in.** Portraits run 175px to 2400px
across in mixed aspects. Flattening them to one pink-and-ink treatment makes
the set read as art direction rather than a scrape, and stops the four
low-resolution ones announcing themselves. Colour returns on hover, and the
whole thing is one CSS line to remove.

## Open

- [ ] Copy is the original prototype's, lightly edited. Not bKash-approved.
- [ ] Board bio modals were in the original; not built — nobody asked, and
      there are no bios to put in them.
- [ ] `needs.md` A2: four portraits remain low-resolution. Duotone covers it;
      better sources would still be better.


---

## Revision: rebuild (DRAFT, 2026-09-18)

> Closes audit rows **A1–A8**. The section list and the two "notes worth
> keeping" above are unchanged — the duotone reasoning and the Journey Wall
> rasteriser both still hold.

### Mobile is where this page falls down

Two findings are severe enough to need design decisions, not fixes:

- **The board is 6,190px tall on a phone** — one column, twelve near-full-width
  portraits, **38% of the entire page height** (**A1**). Two columns and a
  tighter crop.
- **The Journey Wall is unreadable on a phone** (**A2**). At 6:1 it renders as a
  ~290px strip with milestone text at roughly 5px, with dead space above and
  below. A horizontal pan cannot work at that aspect on a phone. It needs a
  different form — a vertical timeline, or swipeable per-milestone cards built
  from the same artwork. **This is the biggest single piece of design work on
  the About page.**

Also: the hero headline overflows the gutter at 390px (**A6**).

### Desktop

- **The CEO quote is the least-designed moment on the page** (**A3**) — eight
  lines of body copy in a dark band beside a small portrait. It is the only
  first-person voice on the site and should carry the most weight. Foundation
  adds a pull-quote type step for exactly this.
- The Journey section is **centre-aligned** while every other section is
  left-aligned (**A4**).
- Board grid and investor row **leave trailing space** inside `.wrap` —
  auto-fill columns not filling (**A5**).
- **No Support button** in the nav, though the homepage has one (**A7**) —
  fixed in `foundation`.
- Board portrait **exposure is inconsistent** across the set even under the
  duotone (**A8**). Normalising luminance before the filter would settle it.

### Pinning

The Journey Wall's pin moves to ScrollTrigger like every other pinned section,
and sizes against `--vh` rather than `100vh`.
