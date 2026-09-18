# Spec: Foundation

> Status: APPROVED
> Model: **Opus 5**. A port of a token system that already exists plus two
> additions. Every answer is determinable from `reference/`. Do not spend
> Fable credit here.
> Source: Claude, 2026-09-18, written from the prototype audit and the frozen
> reference rather than from an interview. Nahian approves or corrects.

## Problem

`web/` is three files. Every section that follows needs a type scale, a colour
system, spacing, fonts, an image convention, and a page shell — and if each
section brings its own, they diverge. That is not hypothetical: the prototype
accumulated **21 ad-hoc font sizes and 12 letter-spacing values with no
relationship between them**, and its own `tokens.css` names that as the root
cause of both the "unbalanced typography" and the alignment drift the client
reacted to.

Foundation exists so that is structurally impossible the second time. It is
built once, before any section, and every section inherits it.

It also closes five findings from `specs/prototype-audit.md` in one place
instead of nine: **X4** (tokens not enforced), **X5** (no dark-section tokens),
**X6** (missing type step), **X8** (no `srcset`/AVIF, `font-display:block`),
**X9** (motion constants scattered).

## Goals

- One closed token system in `web/src/styles/tokens.css`, ported from
  `reference/prototype/css/tokens.css`, which is already good — a closed scale
  with size, line-height and tracking **bundled per step** so they cannot drift
  apart. This is the single best thing in the prototype and it survives intact.
- **Dark-section tokens.** Dark sections currently hand-write
  `rgba(255,255,255,.72)` in a dozen places. Named tokens instead, so "text on
  dark" is one decision.
- **A step between `--fs-h1` (60px) and `--fs-display` (76px)**, and a
  dedicated pull-quote step. The About page's CEO quote is the least-designed
  moment on the site partly because there is no size for it.
- Fonts self-hosted, subset to latin + latin-ext, **no invisible-text flash**.
- One `astro:assets` convention every section follows, written down.
- `Nav` and `Footer` components working on both pages.
- Zero inline `style=""` and zero magic numbers in anything foundation ships.

## Non-goals

- Any scroll-animated section. No ScrollTrigger work here beyond what
  `lib/scroll.ts` already does.
- Real copy. The nav and footer carry the prototype's link labels as
  **PLACEHOLDER** until bKash approves them.
- Bangla. The toggle renders, visibly disabled, never silently dead.
- The `.pageswitch` demo pill — deliberately not ported.
- The About page's own sections. Foundation gives it a shell and nothing more.

## Scope

**Ports from the prototype, largely as-is:**

| From | To | Change |
|---|---|---|
| `css/tokens.css` | `web/src/styles/tokens.css` | + dark tokens, + the two type steps, + motion tokens |
| `css/base.css` | `web/src/styles/base.css` | reset, `@font-face`, `.wrap`/`.stack`/`.sr-only`, buttons |
| `css/nav.css` + nav markup | `web/src/components/Nav.astro` | drop the mega-panel remnants and the page-switcher |
| `css/footer.css` + footer markup | `web/src/components/Footer.astro` | unchanged structurally |
| `assets/fonts/*.woff2` | `web/src/assets/fonts/` | verify coverage first — see Edge cases |

**New:**

- `web/src/pages/about.astro` — a shell page so the nav's two-page behaviour is
  real and testable.
- The image convention, documented in `web/src/styles/README.md` or in
  `CLAUDE.md`: which widths, which formats, when `loading="eager"`.

**Deletes:** the smoke test in `web/src/pages/index.astro`.

## Acceptance criteria

Visual and measurable. `/verify` checks each one.

**Tokens**
- [ ] Every type step is defined exactly once, with its size, line-height and
      tracking together. Nothing in `web/` sets a bare `font-size`.
- [ ] A rendered specimen page shows all eight type steps at 390px and 1920px;
      the ratio between adjacent steps holds at both widths and no two steps
      render within 2px of each other.
- [ ] There is a step between `--fs-h1` and `--fs-display`, and a pull-quote
      step distinct from `--fs-lead`.
- [ ] `grep -rn 'rgba(255, *255, *255' web/src` returns nothing — dark text
      colours come from tokens.
- [ ] `grep -rn 'style="' web/src` returns nothing.

**Fonts**
- [ ] All four weights render correctly at 390px and 1920px, latin and
      latin-ext (test string must include `ā ē ī ō ū` and a `—`).
- [ ] No flash of invisible text on a cold load throttled to Slow 4G. Text is
      readable within the first paint or falls back to a metric-compatible
      stack.
- [ ] No font file is requested that the page does not use.

**Shell**
- [ ] Nav is transparent over a dark hero and solid over light sections, on
      both pages, driven by a class toggle — not a per-frame style write.
- [ ] The nav's solid state has a contrast ratio of at least 4.5:1 for its
      links.
- [ ] The Support button is present on **both** pages (audit A7 — it was
      missing on About).
- [ ] A `--nav-h` token exists and is the single source for any section needing
      to clear the fixed header (audit X2).
- [ ] The Bangla toggle is visible, clearly inert, not focusable, and announces
      as disabled.
- [ ] Mobile drawer opens, traps focus, closes on Escape, and restores focus to
      the burger.
- [ ] No horizontal overflow at 390px on either page.

**Images**
- [ ] One reference image rendered through the agreed convention emits AVIF and
      WebP with a `srcset`, and its largest variant is no wider than it can be
      displayed.

**Build**
- [ ] `npm run check` and `npm run build` clean.
- [ ] `prefers-reduced-motion: reduce` leaves both shell pages fully readable.

## Edge cases

- **The font files may be inconsistently subset.** `inter-latin-500.woff2` is
  **13KB** against **48KB** for weight 400 and **107KB** for 600. That spread is
  not explainable by weight alone and suggests one of them was subset to a
  different glyph set. Verify coverage per weight before relying on it —
  a missing glyph in a headline weight is the kind of thing that only shows up
  on the one word that needs it.
- Nav over a hero that is dark at the top and light at the bottom (the bird
  beat did exactly this) — the solid/transparent rule needs a defined owner,
  and `hero-light` sticking on `body` forever was audit finding H7.
- `prefers-reduced-motion` on a machine that also has JS disabled.
- Long link labels in Bangla later — the nav must not depend on English metrics.

## Constraints

- `CLAUDE.md` hard constraints apply: never `100vh`, mobile is its own
  composition, no scroll-jacking, reduced-motion must degrade coherently.
- Astro 7.3.3, GSAP 3.15. No new runtime dependencies without a reason.
- Everything visual goes through tokens. If a value is not in `tokens.css` it
  does not go in the markup.

## Open questions

> **All five resolved 2026-09-18** — see the resolution table at the head of
> `specs/foundation/plan.md`, together with `design-language.md`'s OQ1 (the
> ground is a scrim). Kept here as the record of what was asked.

One batch. Items 1 and 2 are for bKash, not for Nahian to invent — and I
checked the client deck (`Website_N_1.pptx`) hoping to answer them: it carries
only the default Office theme (Aptos, stock accent colours), so it says nothing
about brand.

1. **Is Inter the right typeface, or does bKash have an official one?** Inter
   was the prototype's substitute choice, not a brand decision. Everything in
   the type scale is tuned to Inter's metrics — the negative tracking at display
   sizes especially — so swapping later is a retune, not a find-and-replace.

2. **Which of these pinks and greys are official?** `--pink: #e2136e` is
   presumably the brand pink. But `--pink-lift: #ff2d87`, `--pink-wash`,
   `--pink-line` and the entire warm-neutral ink ramp (`--ink` through
   `--ink-4`) were invented in the prototype to sit next to it. If bKash has a
   secondary palette, these should be it instead. **This one has teeth:**
   `--pink-lift` on sand is audit finding H4, the illegible hero eyebrow.

3. **Nav structure — keep it as the prototype had it?** Top level is
   Consumers / Business / Company, plus EN / বাংলা and a Support button. The
   mega-panels were already dropped on 2026-09-17 because two real pages could
   not fill them.

4. **Footer — keep the four columns** (Services, Business, Company, Help &
   security) with the prototype's link labels as placeholder?

5. **Does About get the same dark-hero-then-solid nav treatment as the
   homepage**, or should it just start solid? It currently floats over a
   photographic hero.

## Explicitly NOT this

Foundation is infrastructure, but the same failure mode applies — so the
near-misses worth ruling out:

- **NOT a redesign of the type scale.** The prototype's scale is good and the
  client has seen it. This ports it and closes two gaps. It does not re-pick
  ratios.
- **NOT a CSS framework.** No Tailwind, no utility layer. Plain CSS custom
  properties, which is what the constitution describes.
- **NOT a component library.** Two components, Nav and Footer, because two
  pages need them. Nothing speculative.
- **NOT porting `base.css` wholesale.** Its `@media (prefers-reduced-motion)`
  block kills transitions globally with `!important`, which will fight
  ScrollTrigger later. Reduced motion needs a considered answer, not a blanket
  override.
- **NOT the page-switcher pill**, and not the debug HUD.
