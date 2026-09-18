/* ============================================================
   bKash — the bird
   specs/sections/bird.md · specs/bird/plan.md

   The mark as a window. The content is the hero's scene, posed at
   beat 3 by the shared rig; over it a white sheet with the bird as
   its hole. Scroll shrinks the hole about one fixed point — and the
   content pulls back with it, from Faysal's close-up to the whole
   street, the recede lifting — until the mark rests, centred, with
   the bright street inside it.
   ============================================================ */

import { gsap, ScrollTrigger, reducedMotion, isPhone } from './scroll';
import { createSceneRig, camBetween, cubicInOut, type Cam } from './scene-rig';
import { HERO } from './hero';
import { BIRD_W, BIRD_H, START_CANDIDATES, centroidPx, facetPx } from './bird-shape';

export const BIRD = {
  /* Rest pose B (decided 2026-09-18): centred, copy beneath. */
  rest: {
    desktop: { heightFrac: 0.58, cyFrac: 0.42 },
    phone: { widthFrac: 0.86, cyFrac: 0.34, minWidthPx: 300 },
  },
  travelScreens: 2.5,
  /* Phase fractions of the scrub: motion ends, copy resolves. */
  motionEnd: 0.8,
  copyFrom: 0.7,
  copyTo: 0.8,
  /* What the street does while the window shrinks.
     'wide' — the camera pulls back from beat 3 to the establishing shot
              and the recede lifts: the mark rests on the bright, whole
              street. Nahian: "closing on the whole display, zooming out."
     'hold' — the street stays at beat 3, receded: a bird-shaped crop of
              Faysal's close-up (option a, strictly). */
  content: 'wide' as 'wide' | 'hold',
  /* The start scale covers the viewport with this much to spare. */
  startMargin: 1.02,
  /* When the white has won and the nav should go solid. */
  navSolidAt: 0.5,
  scrub: 0.6,
};

type Pose = { k: number; ox: number; oy: number };
type Start = { facet: number; c: [number, number]; fp: [number, number]; k: number };

export function initBird() {
  const section = document.querySelector<HTMLElement>('[data-bird]');
  const pinEl = section?.querySelector<HTMLElement>('[data-bird-pin]');
  const sceneEl = section?.querySelector<HTMLElement>('[data-hero-scene]');
  const hole = section?.querySelector<SVGGElement>('[data-bird-hole]');
  const lines = section?.querySelector<SVGGElement>('[data-bird-lines]');
  const copy = section?.querySelector<HTMLElement>('[data-bird-copy]');
  const marker = section?.querySelector<HTMLElement>('[data-bird-marker]');
  if (!section || !pinEl || !sceneEl || !hole || !lines) return;
  const pin: HTMLElement = pinEl;
  const scene: HTMLElement = sceneEl;

  /* The same rig as the hero, the same options. */
  const rig = createSceneRig(scene, pin, HERO);
  const LAST = HERO.beats.length - 1;
  const faysal = rig.cuts[LAST];

  let vw = 1;
  let vh = 1;
  let rest: Pose = { k: 1, ox: 0, oy: 0 };
  let start: Start = { facet: 1, c: [0, 0], fp: [0, 0], k: 1 };

  /* ---- rest pose, by formula ------------------------------------ */
  function restPose(): Pose {
    if (isPhone()) {
      const r = BIRD.rest.phone;
      const k = Math.max(r.widthFrac * vw, r.minWidthPx) / BIRD_W;
      return { k, ox: vw / 2 - (k * BIRD_W) / 2, oy: r.cyFrac * vh - (k * BIRD_H) / 2 };
    }
    const r = BIRD.rest.desktop;
    const k = (r.heightFrac * vh) / BIRD_H;
    return { k, ox: vw / 2 - (k * BIRD_W) / 2, oy: r.cyFrac * vh - (k * BIRD_H) / 2 };
  }

  /* ---- the start facet and scale, solved ------------------------
     For a facet with vertices v and centroid c, whose centroid lands at
     fp when the mark is at rest, the facet at scale k is fp + k(v − c).
     The viewport rectangle is inside it iff every corner P satisfies
     every edge's inward half-plane. With inward normal n and edge point
     a: (P − fp)·n ≥ k·((a − c)·n), and (a − c)·n < 0, so
     k ≥ ((P − fp)·n) / ((a − c)·n). k_start is the max over 3 edges × 4
     corners. The candidate needing the SMALLER k_start wins — per
     viewport, so a phone and a desktop may start inside different
     facets, and neither is a judgement. */
  function solveStart(): Start {
    const corners: [number, number][] = [
      [0, 0],
      [vw, 0],
      [0, vh],
      [vw, vh],
    ];
    let best: Start | null = null;
    for (const i of START_CANDIDATES) {
      const v = facetPx(i);
      const c = centroidPx(i);
      const fp: [number, number] = [rest.ox + rest.k * c[0], rest.oy + rest.k * c[1]];
      let k = 0;
      for (let e = 0; e < 3; e++) {
        const a = v[e];
        const b = v[(e + 1) % 3];
        let nx = b[1] - a[1];
        let ny = -(b[0] - a[0]);
        if ((c[0] - a[0]) * nx + (c[1] - a[1]) * ny < 0) {
          nx = -nx;
          ny = -ny;
        }
        const den = (a[0] - c[0]) * nx + (a[1] - c[1]) * ny; // < 0
        for (const P of corners) {
          const num = (P[0] - fp[0]) * nx + (P[1] - fp[1]) * ny;
          k = Math.max(k, num / den);
        }
      }
      k *= BIRD.startMargin;
      if (!best || k < best.k) best = { facet: i, c, fp, k };
    }
    return best!;
  }

  /* ---- per-frame writes ----------------------------------------- */
  const setMask = (k: number) => {
    /* Origin derived from the scale about the fixed point — never
       interpolated separately. */
    const ox = start.fp[0] - k * start.c[0];
    const oy = start.fp[1] - k * start.c[1];
    const t = `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${k.toFixed(5)})`;
    hole.setAttribute('transform', t);
    lines.setAttribute('transform', t);
  };

  const camClose = (): Cam => rig.beatCams()[LAST];
  const camWide = (): Cam => rig.beatCams()[0];

  function renderAt(p: number) {
    const e = cubicInOut(Math.min(p / BIRD.motionEnd, 1));
    /* The window: log-space scale from covering one facet to the rest. */
    const k = Math.exp(Math.log(start.k) + (Math.log(rest.k) - Math.log(start.k)) * e);
    setMask(k);
    /* The street: pulls back with the window, or holds at beat 3. */
    if (BIRD.content === 'wide') {
      rig.applyCam(camBetween(camClose(), camWide(), e, HERO.scaleEase));
      if (faysal) faysal.style.opacity = (1 - e).toFixed(3);
      rig.applyRecede(1 - e);
    }
    /* Copy resolves late, on the front plane. */
    if (copy) {
      const c = Math.min(1, Math.max(0, (p - BIRD.copyFrom) / (BIRD.copyTo - BIRD.copyFrom)));
      copy.style.opacity = c.toFixed(3);
      copy.style.transform = `translate3d(0, ${((1 - c) * 12).toFixed(1)}px, 0)`;
    }
    /* The nav: transparent while the street dominates, solid once the
       white has won — nav.ts's own escape hatch, driven both ways. */
    if (marker) marker.hidden = p > BIRD.navSolidAt;
  }

  function measure() {
    vw = pin.clientWidth;
    vh = pin.clientHeight;
    rig.poseAtBeat(LAST);
    rest = restPose();
    start = solveStart();
    pin.style.setProperty('--bird-bottom', `${(rest.oy + rest.k * BIRD_H).toFixed(1)}px`);
  }

  const proxy = { p: 0 };
  const render = () => renderAt(proxy.p);
  const remeasure = () => {
    measure();
    render();
  };
  measure();
  render();
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);

  /* Reduced motion: the rest pose as a still, no travel, no trigger. */
  if (reducedMotion()) {
    section.classList.add('bird--static');
    proxy.p = 1;
    remeasure();
    return;
  }

  const tl = gsap
    .timeline({ paused: true })
    .to(proxy, { p: 1, duration: 1, ease: 'none', onUpdate: render });

  const st = ScrollTrigger.create({
    id: 'bird',
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    pin,
    pinSpacing: false,
    animation: tl,
    scrub: BIRD.scrub,
    /* No snap: one rest at the end of the scrub is the composed frame.
       Snapping to it would whip two screens of reveal into 0.6s. */
    onRefreshInit: measure,
    onRefresh: render,
  });

  if (import.meta.env.DEV) {
    const w = window as any;
    w.__bkash = w.__bkash ?? {};
    w.__bkash.bird = {
      config: BIRD,
      rig,
      rest: () => rest,
      start: () => start,
      settle() {
        tl.progress(st.progress);
        render();
        return { progress: st.progress, k: proxy.p };
      },
      goTo(p: number) {
        window.scrollTo(0, st.start + (st.end - st.start) * p);
        ScrollTrigger.update();
        return this.settle();
      },
    };
  }
}
