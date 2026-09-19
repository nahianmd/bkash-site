/* ============================================================
   bKash — the scene rig

   The one piece of machinery the hero and the bird share. A scene
   is the plate plus three cutouts (HeroScene.astro); the rig sizes
   it to the plate's cover box, places the cutouts as fractions of
   that box, poses a camera, and applies focus — the same code
   path for both sections, which is what makes the bird's opening
   frame the hero's closing frame by construction.

   The one idea that matters (specs/hero/plan.md): the scene is the
   PLATE'S COVER BOX, not the viewport. Camera targets and cutout
   positions are fractions of the plate; the box and the plate share
   a coordinate system at every aspect, so one wide image serves a
   phone and a desktop alike.
   ============================================================ */

import { isPhone } from './scroll';
import { PLATE, type Beat, type Cam, type Cut } from './hero-beats';

export type { Beat, Cam, Cut };
export type Box = { ox: number; oy: number; W: number; H: number };
export { PLATE };

/** How the plate cover-fits a viewport, centred. Recomputed on resize only. */
export function coverBox(vw: number, vh: number): Box {
  const k = Math.max(vw / PLATE.w, vh / PLATE.h);
  const W = PLATE.w * k;
  const H = PLATE.h * k;
  return { ox: (vw - W) / 2, oy: (vh - H) / 2, W, H };
}

/**
 * The transform that puts plate point (cam.x, cam.y) at the viewport
 * centre at scale cam.s, with the scene's origin at 0 0 — clamped so
 * the scaled box still covers the viewport on every edge. The
 * prototype's `50/s <= cx <= 100 - 50/s`, generalised to a box that is
 * not the viewport: a clamp on the translate itself.
 */
export function poseFor(cam: Cam, box: Box, vw: number, vh: number) {
  const s = cam.s;
  let tx = vw / 2 - box.ox - s * cam.x * box.W;
  let ty = vh / 2 - box.oy - s * cam.y * box.H;
  tx = Math.min(-box.ox, Math.max(vw - box.ox - s * box.W, tx));
  ty = Math.min(-box.oy, Math.max(vh - box.oy - s * box.H, ty));
  return { tx, ty, s };
}

export const cubicInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Camera between two beats. Position eases; scale eases in LOG space. */
export function camBetween(a: Cam, b: Cam, f: number, scaleEase = 0.86): Cam {
  const e = cubicInOut(f);
  const es = Math.pow(e, scaleEase);
  return {
    x: a.x + (b.x - a.x) * e,
    y: a.y + (b.y - a.y) * e,
    s: Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * es),
  };
}

export type RigOptions = {
  beats: Beat[];
  focusX: { desktop: number; phone: number };
  phoneCyLift: number;
  phoneScale: number;
  recedeStrength: number;
};

export function createSceneRig(scene: HTMLElement, pin: HTMLElement, opts: RigOptions) {
  const plateEl = scene.querySelector<HTMLElement>('.scene__plate');
  const cuts = opts.beats.map((b) =>
    b.cut ? scene.querySelector<HTMLElement>(`[data-hero-cut="${b.id}"]`) : null,
  );

  /* Recede from the token set, read ONCE. Written per frame as values
     rather than toggling .is-receded, because it scrubs with the camera
     (base.css says exactly this). No blur, ever. */
  const css = getComputedStyle(document.documentElement);
  const tok = (name: string, fallback: number) =>
    parseFloat(css.getPropertyValue(name)) || fallback;
  const RECEDE = {
    opacity: tok('--recede-opacity', 0.45),
    saturate: tok('--recede-saturate', 0.72),
    brightness: tok('--recede-brightness', 0.82),
  };

  let box = coverBox(1, 1);
  let vw = 1;
  let vh = 1;

  /* The beats as they apply at this viewport: beat 0 aims at the chosen
     slice on a phone, and every subject sits higher there so the caption
     has the bottom third — the camera puts its target at the viewport
     centre, so raising a subject means aiming BELOW it. */
  function beatCams(): Cam[] {
    const phone = isPhone();
    return opts.beats.map((b, i) => {
      if (i === 0) return { ...b.cam, x: phone ? opts.focusX.phone : opts.focusX.desktop };
      return phone
        ? { ...b.cam, y: b.cam.y + opts.phoneCyLift, s: b.cam.s * opts.phoneScale }
        : b.cam;
    });
  }

  /* ONE layout read per resize, none per frame. The scene becomes the
     plate's cover box in px; the plate fills it edge to edge (its aspect
     matches, so nothing crops inside the box); each cutout is placed as
     a fraction of it. */
  function measure() {
    vw = pin.clientWidth;
    vh = pin.clientHeight;
    box = coverBox(vw, vh);
    scene.style.left = `${box.ox}px`;
    scene.style.top = `${box.oy}px`;
    scene.style.width = `${box.W}px`;
    scene.style.height = `${box.H}px`;
    opts.beats.forEach((b, i) => {
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
    lastScale = cam.s;
  }
  let lastScale = 1;

  /* Focus (Rule 4): a tent per beat, focus_i = 1 − |n·p − i|, clamped. */
  const n = opts.beats.length - 1;
  const focusOf = (p: number, i: number) => Math.max(0, 1 - Math.abs(n * p - i));

  /* The cutouts are always there — the plate has no people of its own.
     Focus is Rule 4 alone: while a subject is focused, the street and the
     OTHER two recede by the token set; the subject stays full. The
     plate's recede is the sum of focus, never above 1; each cutout's is
     the sum of the others'. Returns the focus per beat for the chrome. */
  function applyFocus(p: number, weight = 1): number[] {
    const f = opts.beats.map((_, i) => (i === 0 ? 0 : focusOf(p, i)));
    const total = f.reduce((a, b) => a + b, 0);
    applyRecede(Math.min(1, total) * weight);
    for (let i = 1; i < opts.beats.length; i++) {
      const cut = cuts[i];
      if (cut) recedeEl(cut, Math.min(1, total - f[i]) * weight);
    }
    return f;
  }

  /** One element receded by 0..1 of the token set — the same numbers for the plate and the cutouts. */
  function recedeEl(el: HTMLElement, amount: number) {
    const r = Math.min(1, Math.max(0, amount)) * opts.recedeStrength;
    el.style.opacity = (1 - r * (1 - RECEDE.opacity)).toFixed(3);
    el.style.filter =
      r > 0.001
        ? `saturate(${(1 - r * (1 - RECEDE.saturate)).toFixed(3)}) brightness(${(1 - r * (1 - RECEDE.brightness)).toFixed(3)})`
        : '';
  }

  /** The plate's recede alone, 0..1 of the token set; the cutouts lift with it. */
  function applyRecede(amount: number) {
    if (plateEl) recedeEl(plateEl, amount);
  }

  /** Camera along the beats for a progress in 0..1. */
  function camAt(p: number, scaleEase?: number): Cam {
    const cams = beatCams();
    const t = Math.min(Math.max(p, 0), 1) * n;
    const i = Math.min(Math.floor(t), n - 1);
    return camBetween(cams[i], cams[i + 1], t - i, scaleEase);
  }

  /** Park the scene on a beat: camera, cutouts and recede as at that beat. */
  function poseAtBeat(i: number) {
    measure();
    applyCam(beatCams()[i]);
    applyFocus(i / n);
  }

  return {
    get box() {
      return box;
    },
    get vw() {
      return vw;
    },
    get vh() {
      return vh;
    },
    cuts,
    /** the camera's current scale, for tools that convert screen px to plate fractions */
    get scale() {
      return lastScale;
    },
    beatCams,
    measure,
    applyCam,
    applyFocus,
    applyRecede,
    focusOf,
    camAt,
    poseAtBeat,
  };
}
