/* ============================================================
   bKash — hero camera
   specs/sections/hero.md · specs/hero/plan.md

   Four beats over four screens of travel. ScrollTrigger hands us
   progress; this file turns it into a pose and writes ONE transform
   per frame on the scene.

   The one idea that matters (plan, Approach): the scene is the
   PLATE'S COVER BOX, not the viewport. Camera targets and cutout
   positions are fractions of the plate; the box and the plate share
   a coordinate system at every aspect, so one wide image serves a
   phone and a desktop alike. The prototype anchored cutouts to the
   viewport and needed a second photograph to hide the drift.
   ============================================================ */

import { gsap, ScrollTrigger, reducedMotion, isPhone } from './scroll';

type Cam = { x: number; y: number; s: number };
type Cut = { x: number; y: number; w: number };
type Beat = { id: string; cam: Cam; cut?: Cut };
type Box = { ox: number; oy: number; W: number; H: number };

/* ---- the section's tuning, one object -------------------------
   styles/README.md: what is genuinely per-section lives here, not
   as literals in the maths. Camera targets and cutout boxes are
   STARTING VALUES read off the plate — set by eye against the build
   with the dev handle (spec: "set by eye, nudge() kept in dev"). */
export const HERO = {
  plate: { w: 1600, h: 893 },

  /* Which slice of the wide plate a narrow screen shows at beat 0.
     A window centred at 46% contains Amena, the tea stall and Faysal
     (spec, 390). Desktop centres. */
  focusX: { desktop: 0.5, phone: 0.46 },

  beats: [
    { id: 'open', cam: { x: 0.5, y: 0.5, s: 1 } },
    { id: 'amena', cam: { x: 0.41, y: 0.5, s: 4 }, cut: { x: 0.388, y: 0.47, w: 0.04 } },
    { id: 'rahim', cam: { x: 0.37, y: 0.74, s: 3 }, cut: { x: 0.312, y: 0.745, w: 0.1 } },
    { id: 'faysal', cam: { x: 0.55, y: 0.78, s: 3.5 }, cut: { x: 0.52, y: 0.71, w: 0.072 } },
  ] as Beat[],

  /* On a phone the caption takes the bottom third, so each subject's
     camera target sits higher — Rule 3, copy and person in different
     thirds. Fraction of the plate's height, by eye. */
  phoneCyLift: 0.08,

  travelPerBeat: 1,
  scrub: 0.6,
  snap: true,
  /* Rule 2: the cutout plane leads the plate mid-segment, zero at
     every beat. 1 = the token rate, 0 = off. */
  parallaxLead: 1,
  /* The prototype's exponent on the eased scale — keeps the perceived
     zoom rate constant across a 1x→4x push. */
  scaleEase: 0.86,
};

/* ---- geometry ------------------------------------------------ */

/** How the plate cover-fits a viewport, centred. Recomputed on resize only. */
export function coverBox(vw: number, vh: number): Box {
  const k = Math.max(vw / HERO.plate.w, vh / HERO.plate.h);
  const W = HERO.plate.w * k;
  const H = HERO.plate.h * k;
  return { ox: (vw - W) / 2, oy: (vh - H) / 2, W, H };
}

/**
 * The transform that puts plate point (cam.x, cam.y) at the viewport
 * centre at scale cam.s, with the scene's origin at 0 0 — and clamped
 * so the scaled box still covers the viewport on every edge. The
 * prototype's `50/s <= cx <= 100 - 50/s` clamp, generalised to a box
 * that is not the viewport: it is a clamp on the translate itself.
 */
export function poseFor(cam: Cam, box: Box, vw: number, vh: number) {
  const s = cam.s;
  let tx = vw / 2 - box.ox - s * cam.x * box.W;
  let ty = vh / 2 - box.oy - s * cam.y * box.H;
  tx = Math.min(-box.ox, Math.max(vw - box.ox - s * box.W, tx));
  ty = Math.min(-box.oy, Math.max(vh - box.oy - s * box.H, ty));
  return { tx, ty, s };
}

const cubicInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Camera between two beats. Position eases; scale eases in LOG space. */
export function camBetween(a: Cam, b: Cam, f: number): Cam {
  const e = cubicInOut(f);
  const es = Math.pow(e, HERO.scaleEase);
  return {
    x: a.x + (b.x - a.x) * e,
    y: a.y + (b.y - a.y) * e,
    s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * es),
  };
}

/* ---- the section --------------------------------------------- */

export function initHero() {
  const section = document.querySelector<HTMLElement>('[data-hero]');
  const pinEl = section?.querySelector<HTMLElement>('[data-hero-pin]');
  const sceneEl = section?.querySelector<HTMLElement>('[data-hero-scene]');
  if (!section || !pinEl || !sceneEl) return;
  /* Rebound so the narrowing survives into the closures below. */
  const pin: HTMLElement = pinEl;
  const scene: HTMLElement = sceneEl;

  const cuts = HERO.beats.map((b) =>
    b.cut ? scene.querySelector<HTMLElement>(`[data-hero-cut="${b.id}"]`) : null,
  );

  let box = coverBox(1, 1);
  let vw = 1;
  let vh = 1;

  /* The beats as they apply at this viewport: beat 0 aims at the
     chosen slice on a phone, and every subject sits higher there so
     the caption has the bottom third. */
  function beatCams(): Cam[] {
    const phone = isPhone();
    return HERO.beats.map((b, i) => {
      if (i === 0) return { ...b.cam, x: phone ? HERO.focusX.phone : HERO.focusX.desktop };
      return phone ? { ...b.cam, y: b.cam.y - HERO.phoneCyLift } : b.cam;
    });
  }

  /* ONE layout read per resize, none per frame. The scene becomes the
     plate's cover box in px; the plate fills it edge to edge (its
     aspect matches, so nothing crops inside the box); each cutout is
     placed as a fraction of it. */
  function measure() {
    vw = pin.clientWidth;
    vh = pin.clientHeight;
    box = coverBox(vw, vh);
    scene.style.left = `${box.ox}px`;
    scene.style.top = `${box.oy}px`;
    scene.style.width = `${box.W}px`;
    scene.style.height = `${box.H}px`;
    HERO.beats.forEach((b, i) => {
      const el = cuts[i];
      if (!el || !b.cut) return;
      el.style.left = `${b.cut.x * 100}%`;
      el.style.top = `${b.cut.y * 100}%`;
      el.style.width = `${b.cut.w * 100}%`;
    });
  }

  function applyCam(cam: Cam) {
    const p = poseFor(cam, box, vw, vh);
    scene.style.transform = `translate3d(${p.tx.toFixed(2)}px, ${p.ty.toFixed(2)}px, 0) scale(${p.s.toFixed(4)})`;
  }

  /* Static pose for now — the camera arrives in task 3. Beat 0 is the
     composed still at every width, JS or not. */
  measure();
  applyCam(beatCams()[0]);
  const remeasure = () => {
    measure();
    applyCam(beatCams()[0]);
  };
  window.addEventListener('resize', remeasure);
  /* This script runs before the layout's initScroll() writes --vh from
     visualViewport, so the first measure may see the 100vh fallback.
     Measure again once everything has loaded. */
  window.addEventListener('load', remeasure);

  void gsap;
  void ScrollTrigger;
  void reducedMotion;

  /* Dev handle: placement is judged by eye, not measured (spec). */
  if (import.meta.env.DEV) {
    const w = window as any;
    w.__bkash = w.__bkash ?? {};
    w.__bkash.hero = {
      config: HERO,
      box: () => box,
      /** Force the cutouts visible to check they sit on their drawn figures. */
      showCuts(on = true) {
        cuts.forEach((el) => el && (el.style.opacity = on ? '1' : ''));
      },
      /** Move a cutout box by fractions of the plate; returns the values to paste back. */
      nudge(i: number, dx = 0, dy = 0, dw = 0) {
        const b = HERO.beats[i];
        if (!b?.cut) return 'no cutout on that beat (1 amena, 2 rahim, 3 faysal)';
        b.cut = {
          x: +(b.cut.x + dx).toFixed(4),
          y: +(b.cut.y + dy).toFixed(4),
          w: +(b.cut.w + dw).toFixed(4),
        };
        measure();
        return this.values();
      },
      /** Aim a beat's camera; returns the values to paste back. */
      aim(i: number, dx = 0, dy = 0, ds = 0) {
        const b = HERO.beats[i];
        if (!b) return 'no such beat';
        b.cam = {
          x: +(b.cam.x + dx).toFixed(4),
          y: +(b.cam.y + dy).toFixed(4),
          s: +(b.cam.s + ds).toFixed(3),
        };
        applyCam(beatCams()[i]);
        return this.values();
      },
      values: () =>
        HERO.beats
          .map(
            (b) =>
              `${b.id}: cam ${JSON.stringify(b.cam)}${b.cut ? ' cut ' + JSON.stringify(b.cut) : ''}`,
          )
          .join('\n'),
      /** Park the camera on a beat (static, no scroll) — for placing by eye. */
      park(i: number) {
        applyCam(beatCams()[i]);
      },
    };
  }
}
