/* ============================================================
   bKash — scroll infrastructure

   One place where GSAP ScrollTrigger is registered and configured,
   so no section has to think about it twice.

   This replaces the prototype's hand-rolled engine (`src/js/engine.js`).
   That engine was correct — rAF loop, strict read/write phases,
   frame-rate-independent damping — but it also hand-rolled pinning,
   progress measurement and resize re-measurement, and that is where
   its bugs lived: `offsetTop` on a sticky element, the ANIM_SPAN
   workaround for a pin that unsticks mid-animation, focus points
   tuned against one screen height. ScrollTrigger owns all of that.

   What we keep from the prototype is the part worth keeping: the
   camera maths inside each section. ScrollTrigger hands a section
   `progress`; the section's own maths turns that into a pose.
   ============================================================ */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** True when the viewer has asked the OS for less motion. */
export const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The project's single phone breakpoint. Matches the CSS. */
export const isPhone = () => window.matchMedia('(max-width: 767px)').matches;

/* ---- viewport height, told the truth ------------------------
   `100vh` is a lie on mobile: the URL bar collapses as you scroll and
   the viewport grows under the animation, so every pinned section
   resizes mid-move. This was the single biggest mobile bug in the
   prototype. `--vh` is the real, current height; sections size
   against it instead. ScrollTrigger is refreshed only when the height
   changes by enough to matter, because refreshing on every pixel of
   URL-bar drift is its own kind of jank. */
let lastVH = 0;

function writeVH() {
  const vh = window.visualViewport?.height ?? window.innerHeight;
  if (Math.abs(vh - lastVH) < 1) return;
  const bigJump = Math.abs(vh - lastVH) > 80;
  lastVH = vh;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  if (bigJump) ScrollTrigger.refresh();
}

/**
 * Boot the scroll system. Call once, from the base layout.
 */
export function initScroll() {
  writeVH();
  window.visualViewport?.addEventListener('resize', writeVH);
  window.addEventListener('orientationchange', () => {
    // The new height is not readable until after the rotation settles.
    setTimeout(() => {
      writeVH();
      ScrollTrigger.refresh();
    }, 300);
  });

  // Images decoding late change the page height under a pin, which
  // leaves every trigger measuring against a stale document.
  window.addEventListener('load', () => ScrollTrigger.refresh());

  exposeDevHandle();
}

/* ---- deterministic driving, for verification ----------------
   The automation tab runs hidden, so requestAnimationFrame never
   fires there and ScrollTrigger will not advance on its own — a
   screenshot taken after setting scrollY shows a stale frame. This
   handle lets /verify set a position and force the update, so a
   captured frame is the frame that position actually produces.

   Dev and preview only; stripped from a production build. */
function exposeDevHandle() {
  if (!import.meta.env.DEV && !import.meta.env.PUBLIC_EXPOSE_DEV_HANDLE) return;

  /* Merge, never replace: a section's own script may have registered
     its handle first — Hero.astro's runs before the layout's. */
  const w = window as any;
  w.__bkash = Object.assign(w.__bkash ?? {}, {
    gsap,
    ScrollTrigger,
    /** Jump to an absolute scroll position and settle the frame. */
    driveTo(y: number) {
      window.scrollTo(0, y);
      ScrollTrigger.update();
      return window.scrollY;
    },
    /** Jump to a fraction of a named trigger's travel and settle. */
    driveSection(id: string, progress: number) {
      const st = ScrollTrigger.getById(id);
      if (!st) return `no trigger with id "${id}"`;
      const y = st.start + (st.end - st.start) * progress;
      window.scrollTo(0, y);
      ScrollTrigger.update();
      return { y: window.scrollY, progress: st.progress };
    },
    /** Every registered trigger, for finding ids and travel. */
    triggers: () =>
      ScrollTrigger.getAll().map((st) => ({
        id: (st.vars as any).id ?? null,
        start: Math.round(st.start),
        end: Math.round(st.end),
        progress: +st.progress.toFixed(4),
      })),
  });
}

export { gsap, ScrollTrigger };
