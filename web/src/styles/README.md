# Foundation conventions

The token system is `tokens.css`; the primitives are `base.css`. This file is
the part that is a rule rather than a value — how images and per-section
constants are handled. Both exist because the prototype had no convention and
the cost showed up as an 11MB homepage and six motion constants scattered
across four files.

## Images

**Everything through `astro:assets`.** Audit **X8**: the prototype shipped an
11MB homepage with no `srcset` and no AVIF/WebP, on a site that serves
Bangladesh. That is most of why Astro was chosen.

- Source files live in `src/assets/`. **Never `public/`** for anything a
  section renders — files in `public/` are copied verbatim, so they get no
  format conversion, no `srcset`, and no hashing.
- Photographs use `<Picture formats={['avif', 'webp']} />`. AVIF first, WebP as
  the fallback, the original as the `<img>` src.
- Flat art and logos are SVG, inlined as a component when they need to respond
  to `currentColor` — see `components/Logo.astro` for why that matters.
- **Cap the largest variant at the element's maximum display width × 2.** This
  is the one rule that needs stating, because the default is to emit up to the
  source's intrinsic width: the 6000×4000 merchant frame would otherwise ship a
  2560px variant for a tile that displays at 600. Pass `widths` explicitly when
  the element is smaller than the viewport.
- **`loading="eager"` plus `fetchpriority="high"` on exactly one image per
  page** — the LCP element. Everything else stays lazy, which is the default.
  On the homepage that is the hero plate; on About, the banner.
- Always give `width`/`height` (or let `astro:assets` infer them from the
  import) so nothing reflows under a pin as it decodes. `lib/scroll.ts` already
  refreshes ScrollTrigger on `window.load` for the same reason.

Breakpoints are set once in `astro.config.mjs`: `390, 640, 768, 1024, 1280,
1536, 1920, 2560` — the project's two design widths, the common sizes between,
and a 2× ceiling. Astro's defaults start at 640 and have nothing at 390.

## Text on a photograph

One way only: the `.on-photo` class from `base.css`. Apply it to the **text
block**, never to a whole container — a scrim that is already fading behind the
top line of a caption is how the prototype's hero captions vanished into sand.
See design language Rule 3.

## Per-section motion constants

Audit **X9**: the prototype scattered `DUR`, `COOLDOWN`, `ANIM_SPAN`,
`GROW_END`, `SLIDE_X` and `FOCUS_Y_FRAC` as bare literals across four JS files.

The shared ones are tokens now — durations, easings and the plane rates all
live in `tokens.css`. What is genuinely per-section stays per-section, but as
**one exported config object at the top of that section's module**, not as
literals buried in the maths:

```ts
export const HERO = {
  beats: 4,
  focusYFrac: 0.62,
  travelPerBeat: 1,
} as const;
```

That way a section's tuning is one object to read and one object to change, and
`/verify` can print it.

## The rules that are greps

`/verify` runs these. They are worth knowing before writing rather than after:

- `grep -rn 'style="' src` — nothing. No inline styles.
- `grep -rn 'rgba(255, *255, *255' src` — nothing. Text on dark comes from the
  `--on-night-*` tokens. (This is also why `tokens.css` writes alpha in the
  modern `rgb(r g b / a)` form: the token file has to pass its own test.)
- `grep -rn 'font-size' src` — every hit is inside `tokens.css`. Type comes
  from the `.t-*` classes, which bundle size, line-height, tracking and measure
  so they cannot drift apart.
- No `100vh` on a pinned section. Size against `--vh`, which `lib/scroll.ts`
  keeps truthful from `visualViewport`.
- No `<br>` inside a headline. Headlines have a measure token instead.
