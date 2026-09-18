# Prototype audit

Findings from a review of the demo build on 2026-09-18, before any porting.
Both pages were driven in Chrome at 1920x992 and in a 390x780 iframe, stepping
through every hero beat, the bento pin, and the full About page.

Organised by section so each section's spec can pull its own list. **A section
is not BUILT until its rows here are either fixed or explicitly deferred.**

Nothing here is a criticism of the demo — it hit a one-night deadline and
shipped. These are the things a hosted site cannot carry.

---

## Cross-cutting

| # | Finding | Evidence |
|---|---------|----------|
| X1 | **`100vh` everywhere, no `dvh`/`svh`.** Mobile URL bar collapses mid-scroll and every pinned section resizes under the animation. | `hero.css:10,26`, `phone.css:13,20,266`, `about.css:168,172,310` |
| X2 | **Fixed nav overlaps content.** Bento top row and the phone's status bar sit under the 4.5rem header at both widths. | Bento grid is `inset:0` inside the pin with no nav offset |
| X3 | **Reveals are IO-gated with no fallback.** Everything below the fold is `opacity:0` until IntersectionObserver fires. A missed observation — bfcache, deep link, print — leaves a blank section. | `engine.js:161`. Reproduced: jumping to About's stats left it blank |
| X4 | **Tokens not enforced.** ~8 inline `style=""` in `about.html`; `.people__name` is `font-size:1.44rem`, off-scale. | The exact thing React was dropped to escape |
| X5 | **No dark-section tokens.** Dark sections hand-write `rgba(255,255,255,.72)` in a dozen places. | Fix in `foundation` |
| X6 | **Type scale has no step** between `--fs-h1` (60px) and `--fs-display` (76px), and nothing for a pull-quote. | `tokens.css` |
| X7 | **~21MB of unreferenced assets.** `HOMEPAGE.svg` 16MB, `phone-screen.svg` 3.6MB, `stories/`, `feature-hero.webp`, `bird-flap.webp`. | Already excluded from `reference/assets/` |
| X8 | **No `srcset`, no AVIF/WebP, `font-display:block`** on all four Inter faces. 11MB homepage. | Fixed by `astro:assets` in `foundation` |
| X9 | **Motion constants scattered** as JS literals (`DUR`, `COOLDOWN`, `ANIM_SPAN`, `GROW_END`, `SLIDE_X`, `FOCUS_Y_FRAC`). | One config object per section |

---

## Hero

| # | Finding | Evidence |
|---|---------|----------|
| H1 | **Scroll-jacked, not pinned.** `hero__pin` is `position:relative` despite the comment saying sticky. Five beats advance by `preventDefault()` on wheel/touch. Scrollbar doesn't move; reads as frozen. No scrubbing. | `hero.css:24`, `hero.js:404-470` |
| H2 | **`getBoundingClientRect()` inside the wheel handler** — a forced recalc per event, 100+/sec on a trackpad, during the most performance-sensitive moment on the page. Cached for touch, not for wheel. | `hero.js:400` called from `hero.js:410` |
| H3 | **`touch-action:none` set at init.** If JS is slow or errors first, a phone cannot scroll the page at all. | `hero.js` ~line 300 |
| H4 | **Caption eyebrow illegible.** Pink `--pink-lift` on sand at beats 1 and 3. Beat 2 is white-on-pale-wood — the worst case. `.hero__cap-name` has no text-shadow while `.hero__cap-line` does. | Captured at each beat |
| H5 | **Bird beat headline breaks badly.** Hardcoded `<br>` plus a narrow column gives four lines with an orphaned "of": *Writing Millions / of / Stories in / Motion*. | `index.html:98` |
| H6 | **White hairline seams** between the bird's facets. | Visible at the bird beat |
| H7 | **`hero-light` never comes off `body`** after beat 4. | `hero.js:216` |
| H8 | **Mobile: different photograph.** The portrait plate is a different scene with a different composition; the headline lands on top of the subject. | 390px capture |
| H9 | **Mobile: captions run edge-to-edge**, `t-h2` at 26px with no measure control. | 390px capture |
| H10 | **Mobile bird beat:** ~150px dead air between mark and copy; copy clipped at the bottom. | 390px capture |
| H11 | `initNav` rects the hero **every read frame**; IntersectionObserver does it free. | `main.js:57` |

---

## Phone bento

| # | Finding | Evidence |
|---|---------|----------|
| P1 | **Grid renders at ~43% of viewport width on a 16:9 screen.** `padding-inline: max(gutter, (100% - min(92vw, 84vh))/2)` — at 1920x992, `84vh`=833px, leaving **543px of dead white each side**. Only looks right on a tall window. | `phone.css:58`, measured |
| P2 | **Six layout-triggering properties written per frame** on the device (`width`, `height`, `left`, `top`, `padding`, `borderRadius`). | `phone.js:390-410` |
| P3 | **`will-change: transform, width, height`** — does nothing on layout props, pins a layer. | `phone.css:158` |
| P4 | **`ANIM_SPAN` is a workaround** for a sticky pin unsticking mid-animation. ScrollTrigger should make it unnecessary. | `phone.js` |
| P5 | **Mobile: "one screen" promise breaks.** Top card clipped under the nav, bottom two run past the fold. | 390px capture |
| P6 | **Mobile: 3 of 7 cards `display:none`** — mobile gets a thinner story than desktop. | `phone.css:277` |
| P7 | **Mobile: device loses its bezel** at full width, so it stops reading as a phone and reads as a broken full-bleed screenshot, with the site nav above the app's own status bar. | 390px capture |
| P8 | **Mobile: service panel covers the icons it describes** — row 4 (Toll Pay / Request Money / Remittance / Donation) fully obscured. | 390px capture |
| P9 | **Desktop end pose is left-heavy** — ~200px dead right of the panel; panel is text-only with no tie to the selected hotspot. | 1920px capture |

---

## People stories

| # | Finding | Evidence |
|---|---------|----------|
| S1 | **No unified grade** across the three portraits — one bright green, one dark, one busy. They don't read as a set. | 1920px capture |
| S2 | May be **redundant entirely** if the bird carries nine selectable stories. Decide during the bird spec. | — |

---

## About

| # | Finding | Evidence |
|---|---------|----------|
| A1 | **Board is 6,190px tall on mobile** — one column, twelve near-full-width portraits, **38% of the whole page**. Needs two columns and a tighter crop. | Measured at 390px |
| A2 | **Journey Wall unreadable on mobile** — a ~290px strip with milestone text at roughly 5px, dead space above and below. Needs a different mobile form entirely (vertical timeline or swipeable cards), not a scaled pan. | 390px capture |
| A3 | **CEO quote is the least-designed moment on the page** — eight lines of `t-body` in a dark band with a small portrait. Should be the most designed. | 1920px capture |
| A4 | **Journey section is centre-aligned** while the entire rest of the page is left-aligned. | 1920px capture |
| A5 | **Board grid and investor row leave trailing space** inside `.wrap` — auto-fill columns not filling. | 1920px capture |
| A6 | **Hero headline overflows the gutter** at 390px — "Financial Freedom" touches the right edge. | 390px capture |
| A7 | **No Support button** in the About nav, though the homepage has one. | Both pages |
| A8 | **Board portrait exposure is inconsistent** across the set even under the duotone. | 390px capture |

---

## Demo chrome to remove

- `.pageswitch` pill — fixed bottom-centre, lands on content in at least five
  places. Site nav replaces it.
- `debug.js` + `debug.css`.
