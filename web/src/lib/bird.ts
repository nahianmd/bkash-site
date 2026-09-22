/* ============================================================
   bKash — the bird overlay
   specs/sections/bird.md · specs/bird/plan.md (revised 2026-09-19)

   The mark as a window over the hero's own scene, inside the hero's
   own pin. This module owns the geometry and the per-frame writes;
   hero.ts owns the trigger and calls renderAt() for the tail of the
   travel. There is no second scene and no second pin — Nahian saw the
   seam between two pins (the hero's camera still catching up on its
   scrub lag as it unpinned), and one frame cannot seam with itself.
   ============================================================ */

import { isPhone } from './scroll';
import { camBetween, cubicInOut, type Cam } from './scene-rig';
import { BIRD_W, BIRD_H, START_CANDIDATES, centroidPx, facetPx } from './bird-shape';

export const BIRD = {
  /* Rest pose B (decided 2026-09-18): centred, copy beneath. */
  rest: {
    desktop: { heightFrac: 0.58, cyFrac: 0.42 },
    phone: { widthFrac: 0.86, cyFrac: 0.34, minWidthPx: 300 },
  },
  /* Screens of travel the hero's pin adds for the bird. */
  travelScreens: 2.5,
  /* Phase fractions of the bird's own progress q: motion ends, copy resolves. */
  motionEnd: 0.8,
  copyFrom: 0.7,
  copyTo: 0.8,
  /* The cast crossfades in and LANDS at 0.70 — Nahian, 2026-09-22: "swap
     lands when the bird fully rests and when the copy is about to appear."
     Those read as two moments, because motionEnd is 0.8 and copyFrom 0.7,
     and they are not: cubicInOut front-loads the ease, so at q = 0.70 the
     eased motion is 0.9922 and the mark is 1.017x its rest size — 1.7%
     off, invisible — while the copy is still at exactly zero. So 0.70 is
     both "fully rested" and "copy about to appear", and neither motionEnd
     nor copyFrom had to move.

     It cannot start much earlier than this. topWing and middle are the
     START_CANDIDATES, so at q = 0 one of the two cast facets is scaled
     until it covers the frame; a cast visible then would open the section
     on a screen-filling portrait instead of the street continuing out of
     the hero — the seam the one-pin design exists to prevent. */
  swapFrom: 0.58,
  swapTo: 0.7,
  /* What the street does while the window shrinks.
     'wide' — the camera pulls back from beat 3 to the establishing shot
              and the recede lifts: the mark rests on the bright, whole
              street. Nahian: "closing on the whole display, zooming out."
     'hold' — the street stays at beat 3, receded (option a, strictly). */
  content: 'wide' as 'wide' | 'hold',
  startMargin: 1.02,
};

type Pose = { k: number; ox: number; oy: number };
type Start = { facet: number; c: [number, number]; fp: [number, number]; k: number };

/* The subset of the scene rig the overlay needs. */
type Rig = {
  applyCam(cam: Cam): void;
  applyRecede(r: number): void;
  applyFocus(p: number, weight?: number): number[];
  beatCams(): Cam[];
  cuts: (HTMLElement | null)[];
};

export function createBirdOverlay(
  root: HTMLElement,
  pin: HTMLElement,
  rig: Rig,
  scaleEase: number,
) {
  const hole = root.querySelector<SVGGElement>('[data-bird-hole]');
  const lines = root.querySelector<SVGGElement>('[data-bird-lines]');
  const copy = root.querySelector<HTMLElement>('[data-bird-copy]');
  if (!hole || !lines) return null;
  const holeEl: SVGGElement = hole;
  const linesEl: SVGGElement = lines;
  /* Optional: the static poster has no cast group, and neither does a
     build where the spec's revision is reverted. */
  const castEl = root.querySelector<SVGGElement>('[data-bird-cast]');

  let vw = 1;
  let vh = 1;
  let rest: Pose = { k: 1, ox: 0, oy: 0 };
  let start: Start = { facet: 1, c: [0, 0], fp: [0, 0], k: 1 };

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

  /* The start facet and scale, solved — see specs/bird/plan.md. For a
     facet with vertices v and centroid c landing at fp at rest, the
     facet at scale k is fp + k(v − c); the viewport rectangle is inside
     it iff every corner satisfies every edge's inward half-plane. The
     candidate needing the smaller k wins, per viewport. */
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
          k = Math.max(k, ((P[0] - fp[0]) * nx + (P[1] - fp[1]) * ny) / den);
        }
      }
      k *= BIRD.startMargin;
      if (!best || k < best.k) best = { facet: i, c, fp, k };
    }
    return best!;
  }

  const setMask = (k: number) => {
    /* Origin derived from the scale about the fixed point — never
       interpolated separately. */
    const ox = start.fp[0] - k * start.c[0];
    const oy = start.fp[1] - k * start.c[1];
    const t = `translate(${ox.toFixed(2)} ${oy.toFixed(2)}) scale(${k.toFixed(5)})`;
    holeEl.setAttribute('transform', t);
    linesEl.setAttribute('transform', t);
    /* One transform for all three groups: the cast's geometry is in
       bird-box units, so it tracks the shrink with no maths of its own. */
    if (castEl) castEl.setAttribute('transform', t);
  };

  function measure() {
    vw = pin.clientWidth;
    vh = pin.clientHeight;
    rest = restPose();
    start = solveStart();
    pin.style.setProperty('--bird-bottom', `${(rest.oy + rest.k * BIRD_H).toFixed(1)}px`);
  }

  /**
   * Render the bird at its own progress q in 0..1. Writes the mask, and
   * — for 'wide' — the scene's camera and recede. Returns the eased
   * motion fraction so the hero can fade its last caption with it.
   */
  function renderAt(q: number): number {
    const e = cubicInOut(Math.min(Math.max(q, 0) / BIRD.motionEnd, 1));
    const k = Math.exp(Math.log(start.k) + (Math.log(rest.k) - Math.log(start.k)) * e);
    setMask(k);
    if (BIRD.content === 'wide' && q > 0) {
      const cams = rig.beatCams();
      rig.applyCam(camBetween(cams[cams.length - 1], cams[0], e, scaleEase));
      /* The street and the other two come back as the window opens; the
         cutouts stay — the plate has no people of its own. */
      rig.applyFocus(1, 1 - e);
    }
    if (castEl) {
      const w = Math.min(1, Math.max(0, (q - BIRD.swapFrom) / (BIRD.swapTo - BIRD.swapFrom)));
      castEl.style.opacity = w.toFixed(3);
    }
    if (copy) {
      const c = Math.min(1, Math.max(0, (q - BIRD.copyFrom) / (BIRD.copyTo - BIRD.copyFrom)));
      copy.style.opacity = c.toFixed(3);
      copy.style.transform = `translate3d(0, ${((1 - c) * 12).toFixed(1)}px, 0)`;
    }
    /* Transparent nav while the street dominates, solid once the white
       has won — nav.ts's own escape hatch, driven both ways. */
    /* The nav stays transparent through the whole pin, the bird's white
       included — its own dark underlay carries the links over anything
       (Nahian, 2026-09-20). The marker at the section's end does the
       switch; nothing toggles it here. */
    return e;
  }

  return {
    measure,
    renderAt,
    rest: () => rest,
    start: () => start,
  };
}
