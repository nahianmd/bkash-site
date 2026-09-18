/* ============================================================
   bKash — hero camera
   specs/sections/hero.md · specs/hero/plan.md

   Four beats over four screens of travel. ScrollTrigger hands us
   progress; the scene rig (scene-rig.ts) turns it into a pose and
   writes ONE transform per frame. This file owns what is the hero's
   alone: its config, the chrome (headline, captions), the depth
   lead, the trigger and snap, and the dev handle.
   ============================================================ */

import { gsap, ScrollTrigger, reducedMotion } from './scroll';
import { createSceneRig, poseFor, type Beat, type Cam } from './scene-rig';

/* ---- the section's tuning, one object -------------------------
   styles/README.md: what is genuinely per-section lives here, not
   as literals in the maths. Camera targets and cutout boxes are
   STARTING VALUES read off the plate — placed against an offline
   composite; the dev handle nudges them live. */
export const HERO = {
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

  /* On a phone the caption takes the bottom third, so each subject must
     sit in the middle third (Rule 3). The camera puts its target at the
     viewport centre, so to raise the subject it aims BELOW the subject —
     the lift is added to cam.y. And a 4x push on a 390px screen makes
     one person 35% of the height, so the phone zooms less. Both by eye;
     measured to land every subject's centre in the middle third. */
  phoneCyLift: 0.05,
  phoneScale: 0.7,

  /* Rule 4's tokens were sized for receding siblings; the hero applies
     them to the whole plate, which is the largest surface on the site.
     1 = the tokens exactly. Turn down only if the street goes too dark
     under a focused subject — one dial, by eye. */
  recedeStrength: 1,

  travelPerBeat: 1,
  scrub: 0.6,
  snap: true,
  /* Rule 2: the cutout plane leads the plate mid-segment, zero at
     every beat. 1 = the token rate, 0 = off. FLAGGED (PROGRESS.md): the
     lead peaks exactly when a cutout is half-visible over its drawn
     figure; the next pass moves it to the caption plane. */
  parallaxLead: 1,
  /* The prototype's exponent on the eased scale — keeps the perceived
     zoom rate constant across a 1x→4x push. */
  scaleEase: 0.86,
};

export function initHero() {
  const section = document.querySelector<HTMLElement>('[data-hero]');
  const pinEl = section?.querySelector<HTMLElement>('[data-hero-pin]');
  const sceneEl = section?.querySelector<HTMLElement>('[data-hero-scene]');
  if (!section || !pinEl || !sceneEl) return;
  /* Rebound so the narrowing survives into the closures below. */
  const pin: HTMLElement = pinEl;
  const scene: HTMLElement = sceneEl;

  const rig = createSceneRig(scene, pin, HERO);

  const openEl = section.querySelector<HTMLElement>('[data-hero-open]');
  const capEls = HERO.beats.map((_, i) =>
    i === 0 ? null : section.querySelector<HTMLElement>(`[data-hero-cap="${i}"]`),
  );

  const css = getComputedStyle(document.documentElement);
  const LEAD =
    ((parseFloat(css.getPropertyValue('--plane-front')) || 1.06) - 1) * HERO.parallaxLead;

  const camAt = (p: number): Cam => rig.camAt(p, HERO.scaleEase);

  /* ---- chrome: captions ride the focus; the headline leaves once ---- */
  function renderChrome(p: number, focus: number[]) {
    for (let i = 1; i < HERO.beats.length; i++) {
      const cap = capEls[i];
      if (!cap) continue;
      const f = focus[i];
      cap.style.opacity = f.toFixed(3);
      cap.style.transform = `translate3d(0, ${((1 - f) * 12).toFixed(1)}px, 0)`;
      cap.style.pointerEvents = f > 0.5 ? '' : 'none';
    }
    /* The beat-0 headline leaves over the first segment and stays gone —
       not a tent, or it would return once Amena's focus passed. */
    if (openEl) {
      const o = Math.max(0, 1 - (HERO.beats.length - 1) * p);
      openEl.style.opacity = o.toFixed(3);
      openEl.style.transform = `translate3d(0, ${((1 - o) * -12).toFixed(1)}px, 0)`;
      openEl.style.pointerEvents = o > 0.5 ? '' : 'none';
    }
  }

  /* ---- depth (Rule 2) --------------------------------------------
     The lead is a fraction of the camera's translate across the current
     segment, shaped by 4f(1−f): zero at both beats, peak between. Applied
     to the cutouts in scene space (divided by the scale, since they live
     inside the scaled scene). */
  function renderDepth(p: number) {
    if (LEAD === 0) return;
    const cams = rig.beatCams();
    const n = cams.length - 1;
    const t = Math.min(Math.max(p, 0), 1) * n;
    const i = Math.min(Math.floor(t), n - 1);
    const f = t - i;
    const a = poseFor(cams[i], rig.box, rig.vw, rig.vh);
    const b = poseFor(cams[i + 1], rig.box, rig.vw, rig.vh);
    const shape = 4 * f * (1 - f);
    const s = camAt(p).s;
    const lx = ((b.tx - a.tx) * LEAD * shape) / s;
    const ly = ((b.ty - a.ty) * LEAD * shape) / s;
    for (let k = 1; k < HERO.beats.length; k++) {
      const cut = rig.cuts[k];
      if (!cut) continue;
      cut.style.transform =
        k === i || k === i + 1 ? `translate3d(${lx.toFixed(2)}px, ${ly.toFixed(2)}px, 0)` : '';
    }
  }

  /* The scrubbed progress lives on a proxy tweened by a timeline that
     ScrollTrigger drives. That is what makes `scrub: 0.6` a real damping
     rather than a no-op — scrub smooths an ANIMATION, and the camera is
     not a GSAP animation, so the animation is this proxy. */
  const proxy = { p: 0 };
  const render = () => {
    rig.applyCam(camAt(proxy.p));
    const focus = rig.applyFocus(proxy.p);
    renderChrome(proxy.p, focus);
    renderDepth(proxy.p);
  };

  const remeasure = () => {
    rig.measure();
    render();
  };
  rig.measure();
  render();
  window.addEventListener('resize', remeasure);
  /* This script runs before the layout's initScroll() writes --vh from
     visualViewport, so the first measure may see the 100vh fallback.
     Measure again once everything has loaded. */
  window.addEventListener('load', remeasure);

  /* Reduced motion: beat 0 as a composed still, no travel, no trigger.
     The section's own CSS collapses its height under .hero--static; the
     no-JS path reaches the same still through .no-js in CSS alone. */
  if (reducedMotion()) {
    section.classList.add('hero--static');
    remeasure();
    return;
  }

  const tl = gsap
    .timeline({ paused: true })
    .to(proxy, { p: 1, duration: 1, ease: 'none', onUpdate: render });

  const st = ScrollTrigger.create({
    id: 'hero',
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    pin,
    pinSpacing: false,
    animation: tl,
    scrub: HERO.scrub,
    /* Snap keeps every frame a viewer rests on a composed one, without
       taking the gesture: the scrollbar moves the whole way and any
       position is reachable; snap only decides where it settles. */
    snap: HERO.snap
      ? { snapTo: [0, 1 / 3, 2 / 3, 1], duration: { min: 0.2, max: 0.6 }, ease: 'power2.inOut' }
      : undefined,
    /* Before ScrollTrigger recomputes its own geometry (resize, load,
       --vh jump), re-measure the box so the pinned frame is right. */
    onRefreshInit: rig.measure,
    onRefresh: render,
  });

  /* Dev handle: placement is judged by eye, not measured (spec). */
  if (import.meta.env.DEV) {
    const w = window as any;
    w.__bkash = w.__bkash ?? {};
    w.__bkash.hero = {
      config: HERO,
      rig,
      box: () => rig.box,
      /** Force the cutouts visible to check they sit on their drawn figures. */
      showCuts(on = true) {
        rig.cuts.forEach((el) => el && (el.style.opacity = on ? '1' : ''));
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
        rig.measure();
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
        rig.applyCam(rig.beatCams()[i]);
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
        rig.poseAtBeat(i);
      },
      /** Force the scrubbed camera to the trigger's current progress and
          render — the hidden automation tab never ticks the damping. */
      settle() {
        tl.progress(st.progress);
        render();
        return { progress: st.progress, cam: camAt(proxy.p) };
      },
      /** Scroll to a beat (0–3) and settle. */
      goTo(i: number) {
        const p = i / (HERO.beats.length - 1);
        window.scrollTo(0, st.start + (st.end - st.start) * p);
        ScrollTrigger.update();
        return this.settle();
      },
    };
  }
}
