# Plan: Foundation

> The HOW. Produced from `specs/foundation/spec.md` during the Plan phase.
> Model: **Opus 5** (matches the spec's tag).
> Written 2026-09-18. Awaiting Nahian's approval.

## Spec

`specs/foundation/spec.md` (DRAFT). It also implements `specs/design-language.md`
(APPROVED), which adds three acceptance criteria: a ground token set, a recede
token set, and plane-rate tokens.

### Open questions — resolved 2026-09-18

| # | Question | Answer |
|---|---|---|
| 1 | Is Inter right? | **Proceed with Inter**, unresolved with bKash. The Astro fonts config makes the family one config entry plus one CSS variable, so a swap is a config change plus a tracking retune — recorded as a new row in `specs/needs.md`, not a blocker. |
| 2 | Which pinks and greys are official? | **Anchor the ramp to the mark.** See "The palette has a source" below. |
| 3 | Nav structure? | **Keep it** — Consumers / Business / Company, EN / বাংলা, Support, burger below 900px. Labels are PLACEHOLDER. |
| 4 | Footer four columns? | **Keep them**, prototype link labels as PLACEHOLDER. |
| 5 | Does About get the dark-hero nav treatment? | **Answered generically.** Nav state is owned by a sentinel, not by the page. About is transparent because its banner opts in, not because it is About. |
| DL-1 | Ground: scrim or clear zone? | **Scrim.** All four still-first section specs already assume it. |

`hero.md:174` — "NOT text-shadow as a legibility strategy. The scrim is the
ground"; `people.md:33` — "one crop, one scrim, one caption block, one type
step"; `services.md:57` — "one caption on one scrim". The choice was already
made in three places; this records it.

---

## What exists today

### In `web/` (the real build)

Almost nothing, and that is accurate — `START-HERE.md` says so.

- `src/lib/scroll.ts` — **keep entirely.** Registers ScrollTrigger, keeps
  `--vh` truthful from `visualViewport` with an 80px threshold before
  refreshing, and exposes `__bkash.driveSection(id, progress)` so `/verify` can
  force a frame in a hidden tab. Foundation adds nothing to it and changes
  nothing in it. It already exports `reducedMotion()` and `isPhone()`, which
  the nav will use.
- `src/layouts/Base.astro` — **rewritten.** Currently a bare shell: no
  stylesheet imports, no nav, no footer, no `noindex`.
- `src/pages/index.astro` — the smoke test. **Deleted**, per the spec, and per
  `START-HERE.md`: "Delete it when the first real section lands."
- `astro.config.mjs` — `defineConfig({})`. Empty.
- Astro **7.3.3**, GSAP **3.15**, sharp 0.35.4, prettier + prettier-plugin-astro,
  `astro check` wired. `printWidth: 96`, single quotes.

Verified in `node_modules` rather than assumed:

- **`fonts` is a stable top-level config option** in Astro 7.3.3, not
  experimental (`core/config/schemas/base.js:272`). `unifont`, `fontace` and
  `@capsizecss/unpack` are already direct dependencies of Astro.
- `Font` is exported from `astro:assets` (`astro/client.d.ts:58`) alongside
  `Image`, `Picture` and `getImage`.
- `image.layout`, `image.objectFit`, `image.breakpoints` and
  `image.responsiveStyles` are all stable config
  (`core/config/schemas/base.d.ts:95-104`). Responsive `srcset` is a config
  line, not hand-rolled.

### In `reference/prototype/` (frozen, read-only)

**Ported close to verbatim:**

| From | To | Change on the way across |
|---|---|---|
| `css/tokens.css:11-30` — brand, ink, ground | `web/src/styles/tokens.css` | `--pink-lift` retired; two mark colours added |
| `css/tokens.css:44-51` — the eight type steps | same | Two steps added; 390px floors raised (see below) |
| `css/tokens.css:53-58` — spacing scale | same | Verbatim |
| `css/tokens.css:60-64` — measure, page, gutter | same | Verbatim |
| `css/tokens.css:66-77` — radius, elevation, motion | same | Verbatim; motion values become the reduced-motion hook |
| `css/tokens.css:85-160` — `.t-*` classes | same | Verbatim structure, two classes added |
| `css/base.css:27-70` — reset, primitives, buttons | `web/src/styles/base.css` | `@font-face` block dropped entirely; reduced-motion block rewritten |
| `css/nav.css:1-120` | `web/src/components/Nav.astro` | Page-switcher dropped; drawer becomes `<dialog>` |
| `css/footer.css` | `web/src/components/Footer.astro` | `rgba(255,255,255,…)` replaced by dark tokens; `.pageswitch` bottom padding dropped |
| `index.html:20-56` — nav markup | `Nav.astro` | Two inline `style=""` removed (`index.html:47,48`) |
| `index.html:153-182` — footer markup | `Footer.astro` | Structural port |

**Deliberately NOT ported, with the reason:**

- **`base.css:24` and the other four `@font-face` rules.** See the font finding
  below — the binaries they point at cannot satisfy the spec.
- **`base.css:72-79`** — the blanket
  `*, *::before, *::after { transition-duration: .01ms !important }`. The
  spec's "Explicitly NOT this" already rules it out; it would fight
  ScrollTrigger. Replaced by a token-level answer.
- **`nav.css:122-160`** — `.pageswitch`. Demo chrome.
- **`main.js:47-62`** — `initNav`'s `Engine.read` loop, which calls
  `hero.getBoundingClientRect()` every read frame (audit **H11**) and reads a
  one-way `body.hero-light` class that is never removed (audit **H7**).
  Replaced by an IntersectionObserver sentinel that fixes both.
- **`main.js:64-73`** — the drawer's `document.body.style.overflow = 'hidden'`.
  A native `<dialog>` handles scroll-lock, focus trap and Escape.
- `css/debug.css`, `js/debug.js`.

---

## Three findings from the investigation

These change what foundation ships. Each is measured, not inferred.

### 1. The font binaries cannot satisfy the spec's own criteria

The spec's Edge cases flagged the 13KB/48KB/107KB spread as suspicious. It is
worse than the compressed sizes suggest. Reading `totalSfntSize` from each
woff2 header — the decompressed font size, a direct proxy for glyph count:

| file | compressed | **decompressed** |
|---|---|---|
| `inter-latin-400.woff2` | 48 KB | 123 KB |
| `inter-latin-500.woff2` | 13 KB | **26 KB** |
| `inter-latin-600.woff2` | 108 KB | **222 KB** |
| `inter-latin-700.woff2` | 26 KB | 45 KB |
| `inter-latin-ext-400.woff2` | 85 KB | 189 KB |

Weight 600 holds **8.5× more glyph data than weight 500**, and more than the
latin-**ext** file. These are five different subsets, not one subset at five
weights.

Worse, and decisive: **there is only one latin-ext file, at weight 400.**
`.t-h1` is weight 700; `.t-h2`, `.t-h3` and `.t-eyebrow` are weight 600. A
single `ā` in a headline falls back to the system font mid-word. The
`@font-face` rules for 500/600/700 also carry no `unicode-range`
(`base.css:14-25`), so the browser downloads all of them unconditionally.

That is three acceptance criteria failing by construction: "all four weights
render correctly… latin and latin-ext", "no flash of invisible text", and "no
font file is requested that the page does not use" — the last one also because
all four faces are `font-display: block` (audit **X8**).

**Resolved (Nahian, 2026-09-18): Astro's fonts API with the npm provider.**

### 2. The palette has a source on disk

`specs/refs/bkash-logo.svg` — the official mark — uses exactly four fills:

| hex | count | role |
|---|---|---|
| `#e2136e` | 4 | the brand pink; confirms `--pink` |
| `#d12053` | 3 | mid |
| `#9e1638` | 2 | deep |
| `#231f20` | 2 | the wordmark's near-black |

`--pink-lift: #ff2d87` appears nowhere in the mark. It was invented, and it is
the audit's **H4** — the illegible hero eyebrow on sand.

**Resolved (Nahian, 2026-09-18): anchor the ramp to the mark.** `--pink` and
`--pink-deep` stay exactly as `CLAUDE.md` names them. `#d12053` and `#9e1638`
join as `--pink-mid` and `--pink-dark` — the bird's facets will need
brand-accurate pinks. `--pink-lift` is retired and re-issued as
`--pink-on-dark`, contractually usable only on `--night` / `--night-2`. That
closes H4 at the token level as well as via the scrim.

### 3. One acceptance criterion is unsatisfiable as written

> "no two steps render within 2px of each other"

At 1920 the existing scale already renders `--fs-body` 16, `--fs-sm` 14,
`--fs-xs` 12 — 2px apart, by design, and correctly so. At 390 the clamp floors
put `--fs-lead` at 17px against `--fs-body` at 16px: **1px apart**. The
criterion fails against the prototype's own scale at both widths, before we add
anything.

The guard it was reaching for is real — the prototype had 21 ad-hoc sizes — but
it is aimed at the wrong end of the scale. **Proposed amendment**, for Nahian:

- [ ] Every step's rendered size at 1920 and at 390 matches the table in
      `tokens.css` to the pixel.
- [ ] No two **display** steps (`display` … `h3`) render within 4px of each
      other at either width.
- [ ] The **text** steps (`lead`, `body`, `sm`, `xs`) render at exactly their
      specified values at both widths.

That is stricter where drift actually happened and checkable where the original
was not.

---

## Approach

Six files of CSS and two components, in a fixed order: tokens, then base, then
the shell that consumes them. Nothing speculative — the spec's "NOT a component
library" holds, and only Nav and Footer get built because only two pages exist.

The one place this plan goes beyond a port is the **three token sets the design
language demands** (ground, recede, planes). Those did not exist in the
prototype in any form; they are the layer above the tokens that it never had.
They are designed here, once, with stated contracts, so that the four section
specs consume them rather than each inventing a variant.

**The alternative rejected:** porting `tokens.css` and `base.css` unchanged and
letting each section add what it needs. That is exactly how the prototype
arrived at 21 font sizes and 12 tracking values — the failure foundation exists
to make structurally impossible. The extra cost now is one afternoon of token
design; the cost later is the same drift with four sections' worth of momentum
behind it.

---

## Motion

Foundation ships **no pinned or scrubbed section**. The spec's Non-goals say
so, and `lib/scroll.ts` already owns ScrollTrigger. There are exactly three
moving parts, and none of them is scroll-driven:

- **Nav solid/transparent** — an IntersectionObserver crossing, one class
  toggle per crossing. Not a ScrollTrigger, not a per-frame write.
- **Drawer open/close** — a `<dialog>` state change.
- **`[data-reveal]`** — a CSS transition on a class the section adds.

What foundation *does* ship for motion is the **vocabulary** every later
section is required to use, so that ScrollTrigger work stays consistent:

| Token | Value | Contract |
|---|---|---|
| `--plane-back` | `0.94` | The back plane lags the section's own travel |
| `--plane-mid` | `1` | The subject plane moves at section rate |
| `--plane-front` | `1.06` | The front plane leads |
| `--ease` | `cubic-bezier(.22,1,.36,1)` | Entrances, camera settles |
| `--ease-io` | `cubic-bezier(.65,0,.35,1)` | State toggles |
| `--t-fast/base/slow/veil` | `.18 / .32 / .62 / .85s` | Named by intent |

`±6%` is design-language Rule 2's "never more than a few percent apart", made
a number so no section picks its own. Sections multiply their own scrub
distance by these; foundation does not animate anything with them.

**Audit X9** ("motion constants scattered as JS literals") is closed here only
for the shared ones. Per-section constants — `FOCUS_Y_FRAC`, `GROW_END` — stay
per-section but move into one exported config object per section file. That is
a rule this plan writes down in `web/src/styles/README.md`; it is enforced
section by section, not by foundation.

### Nav state — the sentinel, in detail

This replaces `main.js:47-62` and fixes **H7** and **H11** together.

- A dark full-bleed header **opts in** by placing `<span data-nav-dark-end>` as
  its last child — a zero-height marker at the point where the dark region ends.
- One `IntersectionObserver`, `rootMargin: '-{--nav-h} 0px 0px 0px'`,
  `threshold: 0`, observing every such marker.
- The nav is transparent while the marker is still below the nav band, solid
  once it has passed above it. Direction is read from
  `entry.boundingClientRect.top`, so the state is correct whether the callback
  fires on entry or on exit, and correct on a deep link or a bfcache restore —
  which is where **X3** bit.
- **A page with no marker gets a solid nav from the first paint.** That is the
  generic answer to open question 5.
- `rootMargin` uses only the top offset, so it does not depend on viewport
  height and does not need recomputing when the mobile URL bar collapses.

**The escape hatch, and why it is needed.** The hero pins and turns white
mid-pin for the bird beat — a colour change that element geometry cannot
express. So the contract is: `[data-nav-dark-end]` may be **toggled** by a
section's own ScrollTrigger via `onToggle`, at a beat boundary, not per frame.
Because it is driven by ScrollTrigger's own state rather than a one-way class
add, it comes back off on the way up. `hero-light` sticking on `body` forever
was H7; this is the structural fix, and the hero spec inherits the contract
rather than inventing one.

Foundation ships the observer and the contract. No page uses the marker yet —
both shell pages get a solid nav until the hero lands.

---

## Layout

### Desktop (1440–1920)

Nav is fixed, `--nav-h: 4.5rem`, links left of centre after a 6.4rem logo, meta
group (`EN / বাংলা`, Support) pushed right by `margin-inline-start: auto`.
Content is `.wrap` — `max-width: var(--page)` (84rem), `padding-inline:
var(--gutter)` which clamps 1.25rem→4rem. Footer is four auto-fit columns at
`minmax(10rem, 1fr)` on `--night`, with a base row for copyright and legal.

The specimen page is a single `.wrap` column: every type step as a labelled
row showing the token name, the computed px, and a live sample, plus swatch
grids for the palette, the dark tokens, the scrim over a worked photograph,
and a recede before/after pair.

### 390px — its own composition, not overrides

This is where the prototype's nav was thinnest, so it is stated in full.

- **`--nav-h` drops to `3.5rem` (56px).** 4.5rem is 18% of a 390×780 screen's
  width in height terms and eats the top of every pinned section — audit **X2**.
  The token is redefined inside a `@media (max-width: 767px)` block in
  `tokens.css`, so the one source stays one source and every section that
  clears the header follows automatically.
- **The nav carries three things and no more:** logo, `EN / বাংলা`, burger. The
  Support button moves into the drawer, where it is the last item and full
  width. This is not "hiding Support" — the spec's criterion is that Support is
  present on both pages, and in the drawer it is, at a bigger tap target than
  it had in the desktop bar.
- **The drawer is the primary navigation at this width**, not a fallback. It
  opens full-screen on `--paper`, items at `.t-h3` with `--s-4` flow — a
  comfortable 44px+ tap target each — Support as a `.btn--primary` at the
  bottom, and a Close affordance at the top on the same side as the burger so
  the thumb does not travel.
- **The footer's four columns become two**, driven by the existing
  `auto-fit`/`minmax(10rem, 1fr)` with no media query: 390 minus two 1.25rem
  gutters is 350px, which fits two 10rem columns plus the 1.5rem gap floor.
  It falls out of the grid rather than being forced, which is why no override
  is needed.
- **`--gutter` floors at 1.25rem (20px)**, and `.wrap` has no `max-width`
  effect at this size. Audit **A6** — the About headline touching the right
  edge — was a `.wrap`-less header, not a gutter failure; the shell fixes it by
  having the headline inside `.wrap`.
- **Type floors are raised** (see the scale table) so the ten steps stay
  distinguishable at the width where they are most crowded.
- **No horizontal overflow.** `body { overflow-x: hidden }` ports from
  `base.css:41`, but it is a safety net, not the mechanism — the criterion is
  checked with `document.documentElement.scrollWidth` against
  `window.innerWidth`, which `overflow-x: hidden` does not mask.

### The type scale, both widths

Ten steps. The two additions the spec asks for are `--fs-hero` (between `h1`
and `display`) and `--fs-quote` (the pull-quote, distinct from `lead`).

> **Corrected at task 2** — the table below replaces the one first written
> here, which failed its own guard. See "Task 2 correction" below.

| Token | 390px | 1920px | Δ to next, 390 | Δ to next, 1920 | Band |
|---|---|---|---|---|---|
| `--fs-display` | 46 | 76 | 5 | 8 | display |
| `--fs-hero` **new** | 41 | 68 | 5 | 8 | display |
| `--fs-h1` | 36 | 60 | 8 | 20 | display |
| `--fs-h2` | 28 | 40 | 4 | 6 | display |
| `--fs-quote` **new** | 24 | 34 | 4 | 8 | display |
| `--fs-h3` | 20 | 26 | 2 | 5 | text |
| `--fs-lead` | 18 | 21 | 2 | 5 | text |
| `--fs-body` | 16 | 16 | 2 | 2 | text |
| `--fs-sm` | 14 | 14 | 2 | 2 | text |
| `--fs-xs` | 12 | 12 | — | — | text |

Every **display** step is ≥4px from its neighbour at both widths. The **text**
steps land on exact values. `h3` sits in the text band because at 20/26px it is
a subheading, not a display size. Verified numerically: all ten steps resolve to
these exact pixels at 390 and 1920.

Each clamp is derived from its two endpoints, not picked:

```
clamp(<390 value>, <intercept>rem + <slope>vw, <1920 value>)
slope     = (v1920 − v390) / (1920 − 390) × 100   [vw]
intercept = (v390 − slope/100 × 390) / 16          [rem]
```

Worked, for `--fs-display`: slope = (76−42)/1530 × 100 = **2.222vw**;
intercept = (42 − 0.02222×390)/16 = **2.083rem**. So
`clamp(2.625rem, 2.083rem + 2.222vw, 4.75rem)`. The remaining nine follow the
same derivation, and the formula goes in a comment above the block so the next
person adding a step does not guess.

Line-height and tracking stay bundled per step in the `.t-*` classes exactly as
`tokens.css:85-160` has them — that is the single best thing in the prototype.
`.t-hero` takes `line-height: 1.0`, `letter-spacing: -0.032em` (between
display's -0.035 and h1's -0.028). `.t-quote` takes `line-height: 1.28`,
`letter-spacing: -0.018em`, `font-weight: 400` — lighter than a heading on
purpose, because it is speech.

---

## The three design-language token sets

### Ground — the scrim (Rule 3)

```
--scrim-strength: 0.62;
--scrim-fade:     6rem;
--scrim-ink:      var(--on-night);
```

`0.62` is derived, not chosen by eye. The criterion is 4.5:1 for text on a
photograph, and the worst case is a **pure white photograph** under the scrim:

- composite ground = `255 × (1 − 0.62)` = 96.9 → relative luminance 0.1193
- text at `--on-night` (white α .92) over it = 242.4 → luminance 0.8909
- contrast = (0.8909 + 0.05) / (0.1193 + 0.05) = **5.56:1**

The curve, for the record: `0.55` → 4.32:1 (**fails**), `0.58` → 4.80:1,
`0.60` → 5.16:1, `0.62` → 5.56:1, `0.72` → 8.12:1. 0.62 clears the bar
against the brightest possible photograph with headroom, which means the
criterion passes **by construction** rather than by checking each composition.
`/verify` still measures real pixels; this just means it should never find a
failure.

**The contract, which matters more than the number:** the scrim is at full
strength across the whole text block and only fades above it, over
`--scrim-fade`. A gradient that is already fading behind the top line of a
caption is how the prototype's captions vanished. One utility class, `.on-photo`,
applies the scrim and `--scrim-ink` together; it is the only sanctioned way
text sits on an image anywhere in `web/`.

### Recede (Rule 4) — and a conflict worth Nahian's eye

```
--recede-opacity:   0.45;
--recede-saturate:  0.72;
--recede-brightness:0.82;
--recede-t:         var(--t-base);
```

**The conflict.** `design-language.md` describes recede as "dim, **soft**,
desaturated" and requires it to be "visually identical in hero, people and
services". But `hero.md:93` says "**Recede is scrubbed with the camera** … not
a state that flips on arrival", and `CLAUDE.md` performance rule 2 says "never
animate `filter: blur()` per frame". Those three cannot all hold if softness
means a live blur.

**My call, for confirmation:** the shared recede is **opacity + saturate +
brightness, with no blur**. Those are cheap compositor filters and scrub
safely. "Soft" is delivered, where a section genuinely needs it, by the
technique `CLAUDE.md` rule 2 prescribes — a pre-rendered blurred copy crossfaded
on opacity — under `--recede-soft-opacity`, which is a per-element opt-in and
still just an opacity animation. The three sections stay visually identical
because they all use the same base token set; the hero can add the pre-rendered
copy for its plate without changing what recede *is*.

The alternative — blur in the shared set — would mean either the hero stops
scrubbing its recede (contradicting `hero.md`) or we break a `CLAUDE.md`
performance rule on the most performance-sensitive moment on the page. Neither
is worth it for softness that is the least legible of the three cues anyway.

### Dark-section tokens (audit X5)

Named for the ground they sit on, so "text on dark" is one decision:

```
--on-night:      rgba(255,255,255,.92);   /* headings */
--on-night-2:    rgba(255,255,255,.72);   /* body */
--on-night-3:    rgba(255,255,255,.52);   /* meta */
--on-night-line: rgba(255,255,255,.12);   /* rules and dividers */
```

These are the exact values the prototype hand-wrote across the footer, people
and phone CSS — ported, named once, and then enforced by the spec's own grep.

---

## Reduced motion — the considered answer

The spec forbids porting `base.css:72-79`'s blanket `!important` override.
Instead, two mechanisms that already exist:

1. **In CSS:** `@media (prefers-reduced-motion: reduce)` redefines
   `--t-fast`, `--t-base`, `--t-slow`, `--t-veil` to `1ms` in `tokens.css`.
   Because every transition in `web/` is required to use those tokens, every
   transition collapses — with no universal selector, no `!important`, and
   nothing that ScrollTrigger can collide with. `[data-reveal]` additionally
   resets to `opacity: 1; transform: none`, ported from `base.css:143`.
2. **In JS:** `reducedMotion()` already exists in `lib/scroll.ts`. The contract
   for every later section is that it checks it and renders its resting state
   rather than creating the ScrollTrigger — which is what `index.astro` already
   does today.

Foundation's own criterion is weaker than a section's: both shell pages must be
fully readable with reduced motion on. The drawer opens instantly, the nav
swaps state instantly, reveals are already visible.

**Edge case from the spec — reduced motion *and* JS disabled.** With no JS the
sentinel never runs, so the nav must be **solid by default in CSS** and made
transparent by a class the observer adds. The prototype had it the other way
round (`nav.css:13` sets `color: #fff` with `.is-solid` as the override), which
means a JS failure leaves white links on white. Inverting the default is a
one-line change with a real failure mode behind it.

---

## Files to add / change

```
web/astro.config.mjs                   CHANGE  fonts + image config
web/package.json                       CHANGE  + @fontsource-variable/inter (dev)

web/src/styles/tokens.css              ADD     the closed system
web/src/styles/base.css                ADD     reset, primitives, buttons
web/src/styles/README.md               ADD     image + token conventions

web/src/components/Nav.astro           ADD     header, drawer, sentinel contract
web/src/components/Footer.astro        ADD     four columns + base row
web/src/lib/nav.ts                      ADD     sentinel observer + dialog wiring

web/src/layouts/Base.astro             CHANGE  styles, <Font>, Nav, Footer, noindex
web/src/pages/index.astro              CHANGE  smoke test deleted, shell only
web/src/pages/about.astro              ADD     shell page
web/src/pages/specimen.astro           ADD     the criterion's specimen page

web/src/assets/img/logo-bkash.svg      ADD     from specs/refs/ (2KB, not the 75KB PNG)
web/src/assets/img/about/banner.jpg    ADD     one worked astro:assets example
```

`web/src/.DS_Store` gets deleted on the way past.

**The logo.** `reference/assets/img/logo-bkash.png` is 75KB raster.
`specs/refs/bkash-logo.svg` is 2KB vector, and it is the file that gave us the
palette. It also removes `nav.css:47`'s `filter: brightness(0) invert(1)` hack
for the transparent nav — an SVG can use `currentColor` instead, which is what
`.btn--outline` already does correctly (`base.css:118`).

---

## Fonts — the configuration

```js
// astro.config.mjs
fonts: [{
  name: 'Inter',
  cssVariable: '--font-inter',
  provider: fontProviders.npm({ remote: false }),
  weights: ['400 700'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  optimizedFallbacks: true,
  fallbacks: ['ui-sans-serif', 'system-ui', '-apple-system', 'Helvetica Neue', 'sans-serif'],
}]
```

Verified against the installed types rather than recalled:

- `fontProviders.npm(options)` is `Omit<NpmProviderOptions, 'root' | 'readFile'>`
  — Astro supplies both, so local `node_modules` resolution works out of the
  box. `remote: false` (**not** `fallbackToCdn`) forbids the jsDelivr fallback,
  so the build needs no network and is reproducible from the lockfile.
- `@fontsource-variable/inter@5.3.0` exists and exports `.` (`index.css`) and
  `./files/*.woff2`. The npm provider reads `index.css` by default, which
  carries one `@font-face` per subset **with** its `unicode-range` — the thing
  the prototype's three unranged faces were missing.
- `weights: ['400 700']` is a variable range: one file per subset covers 400,
  500, 600 and 700. Two files instead of five, and the latin-ext hole closes
  because latin-ext is one file covering the whole range.
- `optimizedFallbacks: true` is why `@capsizecss/unpack` is an Astro
  dependency — it generates a metric-compatible fallback face, which with
  `display: swap` is exactly the spec's "readable within the first paint or
  falls back to a metric-compatible stack". No `font-display: block`, so
  audit **X8**'s invisible-text half is closed.

`<Font cssVariable="--font-inter" preload />` goes in `Base.astro`'s `<head>`;
it emits the `@font-face` CSS and the preload links. `tokens.css` sets
`--font: var(--font-inter), ui-sans-serif, …`.

Expected payload is two woff2 files, roughly 85KB total, against 280KB of
inconsistently-subset statics. **Expected, not measured** — the build is the
measurement, and it is a task below.

---

## Assets

**The convention**, written into `web/src/styles/README.md` and enforced from
here on:

```js
// astro.config.mjs
image: {
  layout: 'constrained',
  objectFit: 'cover',
  responsiveStyles: true,
  breakpoints: [390, 640, 768, 1024, 1280, 1536, 1920, 2560],
}
```

- Everything from `src/assets/`, through `<Image>` or `<Picture>`. Nothing that
  a scroll loop touches goes in `public/`.
- `<Picture formats={['avif', 'webp']} />` for photographs; AVIF first, WebP
  fallback, original as the `<img>` src.
- Breakpoints are the project's two design widths plus the common ones between
  and a 2× ceiling — not Astro's defaults, which start at 640 and have nothing
  at 390.
- **The largest emitted variant is capped at the element's maximum display
  width × 2.** This is the spec's criterion and it needs stating as a rule
  because the default is to emit up to the source's intrinsic width — the
  6000×4000 merchant frame would otherwise ship a 2560px variant for a tile
  that displays at 600.
- `loading="eager"` plus `fetchpriority="high"` on **exactly one** image per
  page — the LCP element. Everything else lazy. The hero plate and the About
  banner are the two.
- Every image declares intrinsic `width`/`height` so nothing reflows under a
  pin as it decodes. `lib/scroll.ts` already refreshes ScrollTrigger on
  `window.load` for the same reason.

**PLACEHOLDER:** all nav and footer link labels; every `href="#"`. The two
images foundation ships are the logo (real, official) and the About banner
(real photography, but a documentary image used as a convention demo — About's
own spec re-decides it).

---

## Verification

How `/verify` checks each criterion. Sonnet 5, per `CLAUDE.md`.

| Criterion | Method |
|---|---|
| Type steps defined once, no bare `font-size` | `grep -rn 'font-size' web/src --include=*.css --include=*.astro` — every hit is inside `tokens.css` |
| Scale table holds | `/specimen` at 1920 and 390; `getComputedStyle` each `.t-*` row, compare to the table above |
| Step between h1 and display; quote ≠ lead | Present in `tokens.css` and rendered on `/specimen` |
| No hand-written white | `grep -rn 'rgba(255, *255, *255' web/src` → empty |
| No inline style | `grep -rn 'style="' web/src` → empty |
| Four weights, latin + latin-ext | `/specimen` renders `Āā Ēē Īī Ōō Ūū — ` at 400/500/600/700; screenshot at both widths. A fallback substitution is visible as a metric break |
| No FOIT on Slow 4G | DevTools throttle, cold cache, capture first paint; `document.fonts.status` |
| No unused font file | Network panel: exactly two woff2 requests |
| Nav transparent over dark, solid over light | Both shell pages have no marker → solid from first paint. The transparent path is verified by adding a temporary `[data-nav-dark-end]` to `/specimen` |
| Nav solid contrast ≥ 4.5:1 | `--ink` `#191316` on `rgba(255,255,255,.92)` over `--paper` → computed, then sampled |
| Support on both pages | Present in `Nav.astro`; at ≥900px in the bar, below in the drawer. Both pages, both widths |
| `--nav-h` is the single source | `grep -rn '4.5rem\|3.5rem' web/src` → only `tokens.css` |
| Bangla toggle inert | `aria-disabled="true"`, `tabindex="-1"`, `pointer-events: none`; Tab order skips it; a screen reader announces it disabled |
| Drawer focus + Escape | Open, Tab to the end and past it, Escape, confirm focus is on the burger. `<dialog>` gives all three; verify it rather than assume |
| No horizontal overflow at 390 | `documentElement.scrollWidth <= innerWidth` on both pages |
| One image through the convention | Built `dist/`: the banner emits AVIF + WebP with `srcset`, largest variant ≤ 2× display width |
| `check` + `build` clean | `npm run check && npm run build` |
| Reduced motion readable | Emulate `prefers-reduced-motion: reduce`, capture both pages at both widths |

**Nahian's eye only:**
- Whether the scale *looks* right at 390 with the raised floors. The numbers
  are defensible; the rhythm is a judgement.
- Whether `--scrim-strength: 0.62` reads as a designed ground or as a grey bar
  over a photograph. It is provably legible; that is not the same as good.
- Whether the recede without blur is enough separation.
- The drawer as the primary navigation at 390, with Support inside it.

---

## Task checklist

Ten tasks, one commit each. Each ends with `npm run check && npm run build`.

- [x] **1. Fonts.** Install `@fontsource-variable/inter` as a devDependency;
      add the `fonts` block to `astro.config.mjs`; `<Font>` into `Base.astro`.
      Confirm in `dist/` that exactly two woff2 files are emitted and record
      the real total against the ~85KB estimate.
      **Done, with one correction — see "Task 1 correction" below.**
- [x] **2. `tokens.css`.** The full closed system: palette anchored to the
      mark, ten type steps with derived clamps and the derivation in a comment,
      spacing, measure, radius, elevation, motion, z-index, `--nav-h` with its
      390px redefinition, `--vh: 100vh` fallback, dark tokens, scrim tokens,
      recede tokens, plane rates. Plus the `.t-*` classes with size,
      line-height and tracking bundled.
- [x] **3. `base.css`.** Reset, `.wrap` / `.stack` / `.sr-only`, buttons,
      `.is-inert`, `[data-reveal]`, `.on-photo`, the recede state class, and
      the token-level reduced-motion block. **No `@font-face`.**
- [x] **4. `/specimen`.** Every type step with its token name and computed px,
      palette swatches, dark tokens on `--night`, the scrim over a real
      photograph, a recede before/after pair. This is a deliverable — a
      criterion depends on it — not a scratch page.
- [x] **5. `Base.astro`.** Style imports, `<Font>`, `Nav`, `Footer`, `<slot>`,
      `noindex` by default. Keeps the existing `initScroll()` call untouched.
- [x] **6. `Nav.astro` + `lib/nav.ts`.** Markup from `index.html:20-56` with
      the two inline styles removed, the SVG logo on `currentColor`, the
      sentinel observer, the `<dialog>` drawer, the 390px composition with
      Support inside the drawer. Solid-by-default in CSS.
- [x] **7. `Footer.astro`.** Four columns from `index.html:153-182`, dark
      tokens instead of hand-written white, `.pageswitch` padding dropped.
- [x] **8. Pages.** Delete the smoke test from `index.astro`; add
      `about.astro`. Both are shells — nav, a heading, footer — and nothing
      more. Delete `web/src/.DS_Store`.
- [ ] **9. Images.** `image` config; `styles/README.md` with the convention and
      the per-section motion-config rule; the About banner through `<Picture>`
      as the worked example; verify the emitted `srcset` in `dist/`.
- [ ] **10. Close out.** Reduced-motion pass over both pages and the specimen;
      run every grep in the Verification table; update `PROGRESS.md`; add the
      Inter-vs-bKash row to `specs/needs.md`; set the spec to BUILT.

---

## Task 1 correction — the provider, 2026-09-18

**The npm provider cannot do subsets, so the plan's mechanism was wrong.**
`resolveFromLocal(pkgName, cssFile, family, options.formats)` at
`unifont/dist/index.mjs:780` never receives `options.subsets`; the provider
parses the package's whole `index.css` and returns every face in it. Built as
planned, it emitted **all seven subsets** — cyrillic, cyrillic-ext, greek,
greek-ext, vietnamese, latin-ext, latin — 213KB, and **preloaded every one**.
A preload is an unconditional request, so that breaks "no font file is
requested that the page does not use" outright.

`fontProviders.fontsource()` was tested as the alternative and is worse: four
files, 422KB, every face duplicated, four preloads, and it fetches from the
CDN at build.

**Resolved: `fontProviders.local()`** with the two subsets named explicitly as
variants, `src` given as a package import so the files stay pinned to the
devDependency and the build still needs no network. The unicode ranges are
copied verbatim from `@fontsource-variable/inter@5.3.0`'s own `index.css` —
19 ranges for latin, 17 for latin-ext — and are generated into the config
rather than retyped.

Every property the plan claimed is preserved: two files, offline,
version-pinned, correct `unicode-range`, `display: swap`, one variable file
per subset covering 400/500/600/700, and `optimizedFallbacks` emitting a
metric-compatible `fallback: Arial` face. Only the provider changed.

**Measured, against the plan's ~85KB estimate:** latin **47KB**, latin-ext
**83KB**, **132KB total**. The estimate was low. Only latin is needed to render
any current page.

### Open, for Nahian — latin-ext is preloaded but never rendered

`<Font preload />` preloads **both** faces, so every page pays 83KB of
high-priority latin-ext that no current page uses. The board names on About
are ASCII; latin-ext exists to satisfy the spec's coverage criterion and to
survive a European name later.

It cannot be filtered declaratively: `filterPreloads` matches on
`weight`/`style`/`subset`, both variants are `100 900`/`normal`, and the local
provider builds its `FontData` from a whitelist that **excludes `subset`**
(`astro/dist/assets/fonts/providers/local.js:39-49`). The only route is
`preload={false}` plus a hand-rolled `<link rel="preload">` built from
`fontData['--font-inter'][0]` — correct, but **order-dependent on our own
config**, which is the kind of clever-but-fragile thing foundation should not
carry without a decision.

Three options, Nahian's call:

1. **Leave it** — 132KB preloaded, 83KB of it wasted. Simplest.
2. **Preload latin only** via the `fontData` index, with the order dependency
   commented. ~5 lines in `Base.astro`.
3. **`preload={false}`** — both load at normal priority after CSS. The
   metric-compatible fallback means little layout shift, but the real font
   arrives later.

Not blocking; the shell tasks do not depend on it.


## Task 2 correction — the 390px ladder, 2026-09-18

**The scale table first written in this plan failed the guard the same plan
proposed.** At 390px it had `quote` 22 against `h3` 20, and `h3` 20 against
`lead` 18 — 2px gaps inside a band the amended criterion requires to be ≥4px
apart. The table and the criterion were written without being cross-checked
against each other.

The guard is right and the table was wrong, so the table moved. Two changes:

1. **The 390px display steps widen** — 46/41/36/28/24 in place of
   42/38/34/26/22. Every display step is now ≥4px from its neighbour at 390 as
   well as at 1920. The 1920 column is untouched.
2. **The band boundary moves up one step**, from "`display`…`h3`" to
   "`display`…`quote`". `h3` renders at 20px/26px, which is a subheading, and
   the 2px rhythm it shares with `lead`/`body`/`sm`/`xs` is the normal, correct
   spacing for the text end of a scale — not drift. Forcing 4px there would push
   either `h3` into `h2` or `lead` into `body`.

The alternative considered and rejected: keep the narrower 390 ladder and let
`quote` collapse onto `h2` at phone width, distinguished only by weight and
leading. That is defensible typography, but it means the scale has a different
number of steps at each width, which is a special case every later section would
have to remember. Widening five numbers costs nothing by comparison.

**Consequence worth watching:** `--fs-display` at 390 is now 46px, not 42px. A
hero headline is ~15 characters per line at that size inside a 350px measure.
`--measure-display` is 18ch, so it wraps deliberately rather than overflowing,
but design-language Rule 3 requires copy and any human subject to occupy
different thirds at 390px, and a taller headline makes that harder. This is the
risk already listed below as "the type floors are a judgement dressed as
arithmetic" — the hero's 390px composition is where it gets settled.


## Risks

**The `weights: ['400 700']` range may not resolve the way I expect.** The
schema accepts a string tuple and fontsource's variable `index.css` declares
`font-weight: 100 900`, but I have not run it. *First check:* the emitted
`@font-face` in `dist/` — if it carries a single weight instead of a range,
switch to `@fontsource/inter` (static) with `weights: [400, 500, 600, 700]`.
Four files instead of two, still correctly ranged and subset, still strictly
better than the port. Cost: one task redone.

**`remote: false` may make the provider fail rather than fall back.** That is
the point, but if the local resolution path has a quirk the build breaks
outright instead of degrading. *First check:* run task 1's build before writing
any CSS — it is task 1 for exactly this reason. Fallback is
`fontProviders.fontsource()`, which fetches at build time; we lose offline
reproducibility and nothing else.

**The scrim contract is easy to break and hard to see breaking.** A section
that applies `.on-photo` to a container rather than to the text block gets a
gradient that fades behind its own top line — the prototype's exact failure.
*First check:* `/specimen` includes a deliberately long two-line caption over a
bright photograph; if the top line is fainter than the bottom, the contract is
being applied at the wrong level.

**`--nav-h` at 3.5rem may be too tight for the logo and the burger.** 56px with
a 44px tap target leaves 6px of breathing room each side. *First check:*
screenshot at 390 in task 6; if it is cramped, 3.75rem (60px) still clears the
bento's top row, but re-verify X2 against `services.md`'s `--vh`-minus-nav
sizing before changing it.

**The type floors are a judgement dressed as arithmetic.** The ≥4px separation
is real; whether 42px display on a 390px screen is right for *this* site is
not something the numbers settle, and Rule 3's "copy and subject occupy
different thirds" gets harder as the headline grows. *First check:* the hero's
390px composition, when it is built — if the headline cannot hold its third,
the floor comes down and the whole ladder shifts with it. Cheap to change now,
expensive after four sections consume it.

**Two acceptance criteria are amended by this plan, not met by it.** The 2px
rule (unsatisfiable as written) and the recede-without-blur decision both need
Nahian's agreement before task 2. They are called out above; if either is
rejected, task 2 changes before it is written, not after.
