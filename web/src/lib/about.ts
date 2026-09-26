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
    for (const im of imgs)
      im.style.width = `${(parseFloat(im.dataset.w ?? '0') / divisor).toFixed(1)}px`;
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
  const tl = gsap
    .timeline({ paused: true })
    .to(proxy, { p: 1, duration: 1, ease: 'none', onUpdate: render });
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

/* ---- the board: a carousel ----------------------------------------
   After a reference video (Nahian, 2026-09-26). One director at the
   centre, the rest a filmstrip either side; a ring, so it loops. Each
   item is laid out at the centre's size on the centre, and moved and
   scaled with ONE transform — scaled down only, so the strip stays
   sharp; CSS transitions do the motion. Geometry is measured on resize,
   never per frame. It advances by itself every few seconds (paused on
   hover, on focus, off screen, and never under reduced motion), and by
   thumbnail, arrow, arrow key or swipe. */
const BOD_TINTS = 5;
function initBoard(): void {
  const root = document.querySelector<HTMLElement>('[data-bod]');
  const view = root?.querySelector<HTMLElement>('.bod__view');
  if (!root || !view) return;
  const items = [...root.querySelectorAll<HTMLElement>('[data-bod-item]')];
  const caps = [...root.querySelectorAll<HTMLElement>('[data-bod-cap]')];
  const panel = root.querySelector<HTMLElement>('[data-bod-panel]');
  const eyebrow = root.querySelector<HTMLElement>('[data-bod-eyebrow]');
  const count = root.querySelector<HTMLElement>('[data-bod-count]');
  const n = items.length;
  if (n === 0) return;

  let active = 0;
  let geo = { aw: 0, tw: 0, gap: 0, show: 3 };
  const rel = (i: number) => {
    /* the shortest signed distance round the ring */
    let d = (i - active) % n;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };
  const lastD = new Array<number>(n).fill(0);

  function measure() {
    const W = view!.clientWidth;
    const phone = W < 640;
    const aw = phone ? Math.min(W * 0.56, rem(15)) : Math.min(Math.max(W * 0.24, rem(15)), rem(21));
    const ah = aw * 1.2;
    const st = phone ? 0.46 : 0.4;
    const px = (v: number) => `${v.toFixed(1)}px`;
    root!.style.setProperty('--aw', px(aw));
    root!.style.setProperty('--ah', px(ah));
    geo = { aw, tw: aw * st, gap: phone ? 10 : 16, show: phone ? 2 : 4 };
    layout(true);
  }
  function rem(v: number) {
    return v * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
  }

  function layout(jump = false) {
    const { aw, tw, gap, show } = geo;
    const st = tw / aw;
    items.forEach((el, i) => {
      const d = rel(i);
      let x = 0;
      let s = 1;
      if (d !== 0) {
        const k = Math.abs(d);
        x = Math.sign(d) * (aw / 2 + gap + tw / 2 + (k - 1) * (tw + gap));
        s = st;
      }
      /* an item that goes round the back of the ring jumps, unseen */
      const wrapped = Math.abs(d - lastD[i]) > n / 2;
      el.classList.toggle('is-jump', jump || wrapped);
      el.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) scale(${s.toFixed(4)})`;
      el.style.opacity = Math.abs(d) > show ? '0' : '1';
      el.style.zIndex = String(n - Math.abs(d));
      el.tabIndex = Math.abs(d) > show ? -1 : 0;
      el.setAttribute('aria-current', d === 0 ? 'true' : 'false');
      lastD[i] = d;
    });
    caps.forEach((c, i) => c.classList.toggle('is-on', i === active));
    if (panel) panel.style.backgroundColor = `var(--bod-tint-${(active % BOD_TINTS) + 1})`;
    if (eyebrow) eyebrow.textContent = caps[active]?.querySelector('.bod__role')?.textContent ?? '';
    if (count) count.textContent = String(active + 1).padStart(2, '0');
  }
  function go(i: number) {
    active = ((i % n) + n) % n;
    layout();
  }

  items.forEach((el, i) => el.addEventListener('click', () => go(i)));
  root.querySelector('[data-bod-prev]')?.addEventListener('click', () => go(active - 1));
  root.querySelector('[data-bod-next]')?.addEventListener('click', () => go(active + 1));
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(active - 1);
    else if (e.key === 'ArrowRight') go(active + 1);
    else return;
    e.preventDefault();
  });
  /* swipe: a horizontal drag of 40px turns one */
  let sx = 0;
  let sy = 0;
  view.addEventListener('pointerdown', (e) => {
    sx = e.clientX;
    sy = e.clientY;
  });
  view.addEventListener('pointerup', (e) => {
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - sy)) go(active + (dx < 0 ? 1 : -1));
  });

  /* auto-advance, only while visible and not being handled */
  let timer = 0;
  let visible = false;
  let held = false;
  const run = () => {
    clearInterval(timer);
    timer = 0;
    if (visible && !held && !reducedMotion()) timer = window.setInterval(() => go(active + 1), 3600);
  };
  root.addEventListener('pointerenter', () => ((held = true), run()));
  root.addEventListener('pointerleave', () => ((held = false), run()));
  root.addEventListener('focusin', () => ((held = true), run()));
  root.addEventListener('focusout', () => ((held = false), run()));
  new IntersectionObserver((es) => {
    visible = es.some((e) => e.isIntersecting);
    run();
  }).observe(root);

  measure();
  window.addEventListener('resize', measure);
}

export function initAbout(): void {
  initReveal();
  initCounters();
  initInvestors();
  initWall();
  initBoard();
}
