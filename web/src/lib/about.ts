/* ============================================================
   bKash — About page behaviour: reveals, the counters, the investor
   logos' shared size, and the Journey Wall's pan on a ScrollTrigger.
   Ported from reference/prototype/js/about.js and engine.js; the
   hand-rolled engine and the sticky+320vh wall are replaced by
   ScrollTrigger and --vh (CLAUDE.md).
   ============================================================ */

import { gsap, ScrollTrigger, reducedMotion } from './scroll';
import { LOGO_DIVISOR, LOGO_FILL } from './about-data';

/* ---- reveals ----------------------------------------------------
   Elements start shifted (base.css [data-reveal]); the observer adds
   .is-in once, near the viewport's lower edge. Siblings in a group
   stagger by a capped step, written as a custom property. */
function initReveal(): void {
  const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  if (els.length === 0) return;
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );
  const groups = new Map<string, number>();
  for (const el of els) {
    const g = el.dataset.revealGroup;
    if (g) {
      const i = groups.get(g) ?? 0;
      groups.set(g, i + 1);
      el.style.setProperty('--reveal-delay', `${Math.min(i % 6, 5) * 70}ms`);
    }
    io.observe(el);
  }
}

/* ---- counters -----------------------------------------------------
   Count-up over 1.4s, cubic out, tabular figures (.t-num). Reduced
   motion shows the number. */
function initCounters(): void {
  const els = [...document.querySelectorAll<HTMLElement>('[data-count]')];
  if (els.length === 0) return;
  const final = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.count ?? '0');
    const dp = target < 10 && !Number.isInteger(target) ? 1 : 0;
    return target.toFixed(dp) + (el.dataset.suffix ?? '');
  };
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => (el.textContent = final(el)));
    return;
  }
  const run = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.count ?? '0');
    const suffix = el.dataset.suffix ?? '';
    const dp = target < 10 && !Number.isInteger(target) ? 1 : 0;
    const dur = 1400;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dp) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        run(e.target as HTMLElement);
        io.unobserve(e.target);
      }
    },
    { threshold: 0.4 },
  );
  els.forEach((el) => {
    el.textContent = '0' + (el.dataset.suffix ?? '');
    io.observe(el);
  });
}

/* ---- investors ----------------------------------------------------
   One shared divisor sets every logo's width from its source width
   (data-w, written at build), so the area normalisation holds. On the
   phone grid the divisor is solved so the widest fits its cell. One
   layout read per resize. */
function initInvestors(): void {
  const row = document.querySelector<HTMLElement>('[data-investors]');
  if (!row) return;
  const imgs = [...row.querySelectorAll<HTMLImageElement>('img[data-w]')];
  const fit = () => {
    const cs = getComputedStyle(row);
    let divisor = LOGO_DIVISOR;
    if (cs.display === 'grid') {
      const cols = cs.gridTemplateColumns.split(' ').filter(Boolean).length;
      const gap = parseFloat(cs.columnGap) || 0;
      const cell = (row.clientWidth - gap * (cols - 1)) / cols;
      const widest = imgs.reduce((m, im) => Math.max(m, parseFloat(im.dataset.w ?? '0')), 0);
      if (cell > 0 && widest > 0) divisor = Math.max(LOGO_DIVISOR, widest / (cell * LOGO_FILL));
    }
    for (const im of imgs) im.style.width = `${(parseFloat(im.dataset.w ?? '0') / divisor).toFixed(1)}px`;
  };
  fit();
  window.addEventListener('resize', fit);
}

/* ---- the journey wall --------------------------------------------
   A 6:1 artwork panned while the section is pinned. The distance is
   the artwork's overhang past the frame — derived, so it stays right at
   any width. A progress bar rides the same number. Reduced motion:
   no pin; the artwork scrolls sideways under the finger. */
function initWall(): void {
  const section = document.querySelector<HTMLElement>('[data-wall]');
  const pin = section?.querySelector<HTMLElement>('[data-wall-pin]');
  const track = section?.querySelector<HTMLElement>('[data-wall-track]');
  const fill = section?.querySelector<HTMLElement>('[data-wall-fill]');
  if (!section || !pin || !track) return;
  if (reducedMotion()) {
    section.classList.add('wall--static');
    return;
  }
  let travel = 0;
  const measure = () => {
    travel = Math.max(0, track.scrollWidth - pin.clientWidth);
  };
  const proxy = { p: 0 };
  const render = () => {
    track.style.transform = `translate3d(${(-travel * proxy.p).toFixed(1)}px, 0, 0)`;
    if (fill) fill.style.transform = `scaleX(${proxy.p.toFixed(4)})`;
  };
  measure();
  render();
  const tl = gsap.timeline({ paused: true }).to(proxy, { p: 1, duration: 1, ease: 'none', onUpdate: render });
  ScrollTrigger.create({
    id: 'journey-wall',
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    pin,
    pinSpacing: false,
    animation: tl,
    scrub: 0.6,
    onRefreshInit: measure,
    onRefresh: render,
  });
}

export function initAbout(): void {
  initReveal();
  initCounters();
  initInvestors();
  initWall();
}
