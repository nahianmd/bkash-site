/* ============================================================
   bKash — the bird
   specs/sections/bird.md · specs/bird/plan.md

   The mark as a window. The content is the hero's scene, posed at
   beat 3 by the shared rig; over it a white sheet with the bird as
   its hole. Task 2: static at rest. The pull-back arrives in task 3.
   ============================================================ */

import { gsap, ScrollTrigger, reducedMotion, isPhone } from './scroll';
import { createSceneRig } from './scene-rig';
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
  /* The start scale covers the viewport with this much to spare. */
  startMargin: 1.02,
  scrub: 0.6,
};

type Pose = { k: number; ox: number; oy: number };

export function initBird() {
  const section = document.querySelector<HTMLElement>('[data-bird]');
  const pinEl = section?.querySelector<HTMLElement>('[data-bird-pin]');
  const sceneEl = section?.querySelector<HTMLElement>('[data-hero-scene]');
  const hole = section?.querySelector<SVGGElement>('[data-bird-hole]');
  const lines = section?.querySelector<SVGGElement>('[data-bird-lines]');
  const copy = section?.querySelector<HTMLElement>('[data-bird-copy]');
  if (!section || !pinEl || !sceneEl || !hole || !lines) return;
  const pin: HTMLElement = pinEl;
  const scene: HTMLElement = sceneEl;

  /* The same rig as the hero, the same options, parked on beat 3. */
  const rig = createSceneRig(scene, pin, HERO);
  const LAST = HERO.beats.length - 1;

  let vw = 1;
  let vh = 1;

  /* ---- rest pose, by formula -------------------------------- */
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

  const setTransform = (pose: Pose) => {
    const t = `translate(${pose.ox.toFixed(2)} ${pose.oy.toFixed(2)}) scale(${pose.k.toFixed(5)})`;
    hole.setAttribute('transform', t);
    lines.setAttribute('transform', t);
  };

  function measure() {
    vw = pin.clientWidth;
    vh = pin.clientHeight;
    rig.poseAtBeat(LAST);
    const rest = restPose();
    pin.style.setProperty('--bird-bottom', `${(rest.oy + rest.k * BIRD_H).toFixed(1)}px`);
    return rest;
  }

  /* Task 2: the rest pose, static. */
  const render = () => {
    setTransform(measure());
    if (copy) copy.style.opacity = '1';
  };
  render();
  window.addEventListener('resize', render);
  window.addEventListener('load', render);

  void gsap;
  void ScrollTrigger;
  void reducedMotion;
  void START_CANDIDATES;
  void centroidPx;
  void facetPx;
  void BIRD.startMargin;

  if (import.meta.env.DEV) {
    const w = window as any;
    w.__bkash = w.__bkash ?? {};
    w.__bkash.bird = { config: BIRD, rig, rest: restPose };
  }
}
