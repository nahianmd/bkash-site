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
import { createSceneRig, poseFor, type Cam, type Cut } from './scene-rig';
import { BEATS, PLATE } from './hero-beats';
import { BIRD, createBirdOverlay } from './bird';

/* ---- the section's tuning, one object -------------------------
   styles/README.md: what is genuinely per-section lives here, not
   as literals in the maths. The beats (camera targets and cutout
   boxes) are data in hero-beats.ts so the components can read them
   at build time; the dev handle nudges them live. */
export const HERO = {
  /* Which slice of the wide plate a narrow screen shows at beat 0.
     A window centred at 46% contains Amena, the tea stall and Faysal
     (spec, 390). Desktop centres. */
  focusX: { desktop: 0.5, phone: 0.46 },

  beats: BEATS,

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
  /* The bird rides the same pin: its travel is appended to the hero's,
     and the hero's beats occupy the first `share` of the trigger. */
  get share() {
    const hero = this.travelPerBeat * (this.beats.length - 1);
    return hero / (hero + BIRD.travelScreens);
  },
  scrub: 0.6,
  snap: true,
  /* Rule 2's lead on the cutout plane: they moved relative to the street
     mid-segment, which read as people sliding on the ground (Nahian,
     2026-09-19). OFF. The depth cue belongs to the caption plane. */
  parallaxLead: 0,
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

  const marker = section.querySelector<HTMLElement>('[data-nav-dark-end]');
  const birdRoot = section.querySelector<HTMLElement>('[data-bird-live]');
  const bird = birdRoot ? createBirdOverlay(birdRoot, pin, rig, marker, HERO.scaleEase) : null;

  /* One pin for both: the section's travel is the hero's beats plus the
     bird's, and the CSS fallback height is overwritten from the configs
     so there is one source. */
  const heroScreens = HERO.travelPerBeat * (HERO.beats.length - 1);
  section.style.setProperty('--hero-screens', String(1 + heroScreens + BIRD.travelScreens));

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
  /* One render for the whole travel. In the hero's share, the camera,
     focus, chrome and depth; the bird's mask stays fully open (q = 0).
     In the tail, the bird owns the scene — it pulls the camera back and
     lifts the recede — and the hero only fades its last caption with it. */
  const render = () => {
    const P = proxy.p;
    const share = HERO.share;
    if (P <= share || !bird) {
      const p = share > 0 ? Math.min(P / share, 1) : 0;
      rig.applyCam(camAt(p));
      const focus = rig.applyFocus(p);
      renderChrome(p, focus);
      renderDepth(p);
      bird?.renderAt(0);
    } else {
      const q = (P - share) / (1 - share);
      const e = bird.renderAt(q);
      const lastCap = capEls[capEls.length - 1];
      if (lastCap) lastCap.style.opacity = (1 - e).toFixed(3);
      if (openEl) openEl.style.opacity = '0';
    }
  };

  const remeasure = () => {
    rig.measure();
    bird?.measure();
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
      ? {
          /* Directional, and only within the hero's share: a forward tick
             lands on the NEXT beat, a backward one on the previous; past
             beat 3 the bird's reveal is left unsnapped — one rest at the
             end of the scrub is its composed frame. */
          snapTo: (value: number, self?: { direction: number }) => {
            const share = HERO.share;
            if (value > share + 1e-6) return value;
            const n = HERO.beats.length - 1;
            const beats = Array.from({ length: n + 1 }, (_, i) => (i / n) * share);
            const dir = self?.direction ?? 0;
            if (dir > 0) return beats.find((b) => b >= value - 1e-4) ?? share;
            if (dir < 0) return [...beats].reverse().find((b) => b <= value + 1e-4) ?? 0;
            return beats.reduce((a, b) => (Math.abs(b - value) < Math.abs(a - value) ? b : a));
          },
          duration: { min: 0.2, max: 0.6 },
          ease: 'power2.inOut',
        }
      : undefined,
    /* Before ScrollTrigger recomputes its own geometry (resize, load,
       --vh jump), re-measure the box so the pinned frame is right. */
    onRefreshInit: () => {
      rig.measure();
      bird?.measure();
    },
    onRefresh: render,
  });

  /* Dev handle: placement is judged by eye, not measured (spec). */
  if (!import.meta.env.DEV) return;

  /* ---- dev only: the placement tool -------------------------------
     Screen px → plate fractions is one division: the scene is the plate's
     cover box scaled by the camera, so a drag of dx px is dx / (box.W × s)
     of the plate. Inside the DEV guard, so none of it ships. */
  let placeOff: (() => void) | null = null;
  function placeTool(on: boolean) {
    placeOff?.();
    placeOff = null;
    if (!on) return;
    const hud = document.createElement('div');
    hud.style.cssText =
      'position:fixed;left:12px;top:calc(var(--nav-h, 72px) + 12px);z-index:9999;padding:10px 12px;background:rgba(0,0,0,.82);color:#0f0;font:12px/1.5 ui-monospace,monospace;border-radius:8px;';
    document.body.appendChild(hud);
    let active = 1;
    const fields: (keyof Cut)[] = ['x', 'y', 'w', 'soft'];
    /* Resizing keeps the FEET where they are: the box grows about its
       bottom-centre. Height in plate fractions follows the drawing's
       aspect through the plate's. */
    const resized = (i: number, cut: Cut, w: number): Cut => {
      /* The box's aspect is the drawing's, set by the generated CSS, so
         it is right before the image has even decoded. */
      const el = rig.cuts[i];
      const aspect = el && el.offsetWidth ? el.offsetHeight / el.offsetWidth : 1;
      const hOf = (ww: number) => (ww * aspect * PLATE.w) / PLATE.h;
      const nw = Math.max(0.005, w);
      return {
        ...cut,
        w: +nw.toFixed(4),
        x: +(cut.x + (cut.w - nw) / 2).toFixed(4),
        y: +(cut.y + hOf(cut.w) - hOf(nw)).toFixed(4),
      };
    };
    const lines = () =>
      HERO.beats
        .filter((b) => b.cut)
        .map(
          (b) =>
            `  { id: '${b.id}', cam: ${JSON.stringify(b.cam).replace(/"/g, '')}, cut: ${JSON.stringify(b.cut).replace(/"/g, '')} },`,
        )
        .join('\n');
    const inputs = new Map<string, HTMLInputElement>();
    const build = () => {
      hud.innerHTML = '';
      const head = document.createElement('div');
      head.textContent =
        'PLACE — drag: move · shift-drag or [ ]: size (about the feet) · arrows: nudge (shift ×10) · w = width, fraction of the plate · soft = px at the wide shot';
      hud.appendChild(head);
      HERO.beats.forEach((b, i) => {
        if (!b.cut) return;
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-top:4px;';
        const name = document.createElement('span');
        name.textContent = b.id.padEnd(7);
        name.style.cssText = 'display:inline-block;width:56px;';
        row.appendChild(name);
        for (const k of fields) {
          const lab = document.createElement('label');
          lab.style.cssText = 'display:inline-flex;gap:3px;align-items:center;';
          lab.textContent = k;
          const inp = document.createElement('input');
          inp.type = 'number';
          inp.step = k === 'soft' ? '0.1' : '0.001';
          inp.min = '0';
          inp.style.cssText =
            'width:64px;background:#111;color:#0f0;border:1px solid #2a2;border-radius:4px;padding:1px 4px;font:inherit;';
          inp.value = String(b.cut![k] ?? 0);
          inp.addEventListener('input', () => {
            const v = parseFloat(inp.value);
            if (!Number.isFinite(v)) return;
            b.cut =
              k === 'w' ? resized(i, b.cut!, v) : { ...b.cut!, [k]: +v.toFixed(k === 'soft' ? 2 : 4) };
            active = i;
            rig.measure();
            render();
            print();
          });
          inputs.set(`${i}.${k}`, inp);
          lab.appendChild(inp);
          row.appendChild(lab);
        }
        hud.appendChild(row);
      });
      const out = document.createElement('pre');
      out.style.cssText = 'margin:8px 0 0;white-space:pre;color:#9f9;';
      out.dataset.out = '';
      hud.appendChild(out);
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.textContent = 'copy lines for hero-beats.ts';
      copy.style.cssText =
        'margin-top:6px;background:#0f0;color:#000;border:0;border-radius:4px;padding:3px 8px;font:inherit;cursor:pointer;';
      copy.addEventListener('click', () => navigator.clipboard?.writeText(lines()));
      hud.appendChild(copy);
    };
    const print = () => {
      const out = hud.querySelector<HTMLElement>('[data-out]');
      if (out) out.textContent = lines();
      console.log('[hero place]\n' + lines());
    };
    const show = () => {
      HERO.beats.forEach((b, i) => {
        if (!b.cut) return;
        for (const k of fields) {
          const inp = inputs.get(`${i}.${k}`);
          if (inp && document.activeElement !== inp) inp.value = String(b.cut![k] ?? 0);
        }
      });
      print();
    };
    build();
    const offs: (() => void)[] = [() => hud.remove()];
    rig.cuts.forEach((el, i) => {
      if (!el) return;
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'move';
      el.style.outline = '2px solid #0f0';
      let x0 = 0;
      let y0 = 0;
      let dragging = false;
      let start = HERO.beats[i].cut!;
      const down = (ev: PointerEvent) => {
        active = i;
        x0 = ev.clientX;
        y0 = ev.clientY;
        start = { ...HERO.beats[i].cut! };
        dragging = true;
        try {
          el.setPointerCapture(ev.pointerId);
        } catch {}
        ev.preventDefault();
      };
      const move = (ev: PointerEvent) => {
        if (!dragging) return;
        const k = rig.box.W * rig.scale;
        const dx = (ev.clientX - x0) / k;
        const dy = (ev.clientY - y0) / (rig.box.H * rig.scale);
        HERO.beats[i].cut = ev.shiftKey
          ? resized(i, start, start.w + dx)
          : { ...start, x: +(start.x + dx).toFixed(4), y: +(start.y + dy).toFixed(4) };
        rig.measure();
      };
      const up = (ev: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        try {
          el.releasePointerCapture(ev.pointerId);
        } catch {}
        show();
      };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      offs.push(() => {
        el.removeEventListener('pointerdown', down);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.style.pointerEvents = '';
        el.style.cursor = '';
        el.style.outline = '';
      });
    });
    const keys = (ev: KeyboardEvent) => {
      if (document.activeElement instanceof HTMLInputElement) return;
      const b = HERO.beats[active];
      if (!b?.cut) return;
      const step = (ev.shiftKey ? 0.01 : 0.001);
      if (ev.key === '[' || ev.key === ']') {
        ev.preventDefault();
        b.cut = resized(active, b.cut, b.cut.w + (ev.key === ']' ? step : -step));
        rig.measure();
        render();
        show();
        return;
      }
      const d: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };
      const m = d[ev.key];
      if (!m) return;
      ev.preventDefault();
      b.cut = { ...b.cut, x: +(b.cut.x + m[0]).toFixed(4), y: +(b.cut.y + m[1]).toFixed(4) };
      rig.measure();
      render();
      show();
    };
    window.addEventListener('keydown', keys);
    offs.push(() => window.removeEventListener('keydown', keys));
    placeOff = () => offs.forEach((f) => f());
    show();
  }
  if (location.search.includes('place')) placeTool(true);

  {
    const w = window as any;
    w.__bkash = w.__bkash ?? {};
    w.__bkash.hero = {
      config: HERO,
      rig,
      box: () => rig.box,
      /** Outline the cutout boxes to check their placement on the street. */
      showBoxes(on = true) {
        rig.cuts.forEach((el) => el && (el.style.outline = on ? '2px solid #0f0' : ''));
      },
      /** The placement panel: drag a cutout to move it, shift-drag to
          resize, arrows to nudge, or type x / y / w / soft. Prints the
          lines to paste into hero-beats.ts. Also on with `?place`. */
      place(on = true) {
        placeTool(on);
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
        const p = Math.min(proxy.p / HERO.share, 1);
        return { progress: st.progress, heroP: p, cam: camAt(p) };
      },
      /** Scroll to a beat (0–3) and settle. */
      goTo(i: number) {
        const p = (i / (HERO.beats.length - 1)) * HERO.share;
        window.scrollTo(0, st.start + (st.end - st.start) * p);
        ScrollTrigger.update();
        return this.settle();
      },
      /** Scroll to the bird's own progress q (0–1) and settle. */
      goToBird(q: number) {
        const p = HERO.share + q * (1 - HERO.share);
        window.scrollTo(0, st.start + (st.end - st.start) * p);
        ScrollTrigger.update();
        return {
          ...this.settle(),
          bird: bird ? { rest: bird.rest(), start: bird.start() } : null,
        };
      },
      bird: () => (bird ? { rest: bird.rest(), start: bird.start(), config: BIRD } : null),
    };
  }
}
