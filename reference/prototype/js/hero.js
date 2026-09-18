/* ============================================================
   bKash — hero camera sequence (stepped)

   One scroll gesture advances exactly one beat. The camera is no
   longer tied to scroll position — it is a time-based tween
   between composed frames, so every frame the CEO sees is one
   somebody framed on purpose. There is no half-zoomed in-between
   state to get stranded in.

   Beats: 0 wide establishing -> 1 customer -> 2 agent
          -> 3 merchant -> 4 collage (the bird)

   SCENE stays a plain data structure: swapping the placeholder
   art for real photography is an edit here, not in the motion.
   ============================================================ */

import { Engine } from './engine.js';
import { BIRD_ASPECT, LIVE_BOX, buildBird } from './bird.js';

const { clamp } = Engine;

export const SCENE = {
  plate: {
    wide: 'assets/img/scene-plate-wide.webp',
    alt: 'A neighbourhood market street at golden hour',
  },
  subjects: [
    {
      id: 'customer',
      img: 'assets/img/cut-customer.webp',
      alt: 'A mother and daughter using a phone',
      eyebrow: 'Customer',
      head: '7 in 10 Adults in Bangladesh',
      sub: 'Control Their Money with bKash',
      box: { x: 0.206, y: 0.434, w: 0.178 },
      cam: { x: 29.5, y: 57.0, s: 3.1 },
    },
    {
      id: 'agent',
      img: 'assets/img/cut-agent.webp',
      alt: 'A village agent shop',
      eyebrow: 'Agent',
      head: 'One Agent Every 2 KM',
      sub: 'Your Neighborhood is the Branch',
      box: { x: 0.442, y: 0.105, w: 0.298 },
      cam: { x: 59.1, y: 28.2, s: 3.0 },
    },
    {
      id: 'merchant',
      img: 'assets/img/cut-merchant.webp',
      alt: 'A pink bKash merchant point',
      eyebrow: 'Merchant',
      head: 'From Floating Stalls to Digital Storefronts',
      sub: 'Moving Millions of Cashless Commerce',
      /* Framed to fill the height and sit right of centre, leaving the
         left third clear for the caption. cam.x is offset left of the
         stall's own centre (82.3) so the subject lands at ~66% across. */
      box: { x: 0.763, y: 0.180, w: 0.120 },
      cam: { x: 79.4, y: 27.0, s: 5.5 },
    },
  ],
};

const WIDE = { x: 50, y: 50, s: 1 };

/* ---- portrait plate, for phones ------------------------------
   The wide plate is 16:9. On a portrait phone, object-fit cover
   shows only about a QUARTER of its width — while the cutouts are
   positioned against the viewport, so the people end up standing
   in the wrong places relative to the background.

   The original prototype solved this with a second, portrait
   photograph and re-placed every cutout against where its subject
   actually sits in it. These fractions are its values. The camera
   targets cannot be constants because they depend on how the plate
   cover-crops at the current viewport, so they are derived in
   anchorPortrait() below — which is the part of the old code most
   worth keeping.                                                 */
const PORTRAIT_PLATE = 'assets/img/scene-plate-portrait.webp';
const PORTRAIT_IW = 940, PORTRAIT_IH = 1672;

const PORTRAIT_SUBJECTS = [
  // fx, fw, fy are fractions of the portrait plate; ratio is the
  // cutout's own h/w; cx, cy and fillH aim the camera at it.

  /* Amena moved inward from 0.085. Two reasons, both about the portrait
     crop: at 0.085 she hugs the left edge of the screen in the
     establishing shot, and her camera target landed at 20% across —
     closer to the edge than `50/s` allows, so the camera could not
     centre on her without exposing the ground behind. Moving her toward
     the middle fixes the cause rather than capping the symptom. */
  { fx: 0.130, fw: 0.300, fy: 0.480, ratio: 1671 / 941,  cx: 0.50, cy: 0.17, fillH: 0.40 },
  { fx: 0.400, fw: 0.330, fy: 0.350, ratio: 1048 / 1501, cx: 0.42, cy: 0.60, fillH: 0.46 },
  { fx: 0.760, fw: 0.150, fy: 0.380, ratio: 1159 / 1358, cx: 0.50, cy: 0.52, fillH: 0.40 },
];

const isPhone = () => window.matchMedia('(max-width: 767px)').matches;

/* Depth of field. 0 = off — the blur flattened the scene and killed
   the sense of depth the zoom was creating. Kept as a dial rather
   than deleted so it can be brought back at a low value. */
const DOF = 0;

/* Where the bird comes to rest: right-hand side, vertically centred,
   leaving the left column for the copy. */
const BIRD_REST_W   = 0.36;   // width, as a fraction of viewport width
const BIRD_REST_PAD = 0.13;   // gap from the right edge
const BIRD_REST_CY  = 0.50;   // vertical centre, as a fraction of height

/* On a phone there is no room for a side-by-side layout, so the mark
   goes large and centred with the copy beneath it. At 36% of a 415px
   screen it was 155px across — too small to read as the bKash bird. */
const BIRD_PHONE = { w: 0.74, cy: 0.38 };

/* Tween shape. 1100ms is long enough to read as a camera move
   rather than a cut, short enough that a presenter never feels
   they are waiting on the machine. */
const DUR = 1100;
const GESTURE_GAP = 140;   // ms of quiet that marks a NEW gesture
const COOLDOWN = 260;      // ms after a step before another is accepted
const TOUCH_STEP = 32;     // px of finger travel that commits to a beat

const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function initHero(scene = SCENE) {
  const section = document.querySelector('[data-hero]');
  if (!section) return;

  const sceneEl = section.querySelector('[data-hero-scene]');
  const blurEl  = section.querySelector('[data-hero-blur]');
  const openEl  = section.querySelector('[data-hero-open]');
  const capEls  = [...section.querySelectorAll('[data-hero-cap]')];
  const dotEls  = [...section.querySelectorAll('[data-hero-dot]')];
  const collage = section.querySelector('[data-collage]');

  // beat 0 = wide, 1..n = subjects, last = collage
  const cams = [WIDE, ...scene.subjects.map(s => s.cam), scene.subjects[scene.subjects.length - 1].cam];
  const LAST = cams.length - 1;
  const COLLAGE_STEP = LAST;

  const viewport = section.querySelector('[data-hero-viewport]');

  let step = 0, fromStep = 0;
  let cam = { ...WIDE };
  let from = { ...WIDE }, to = { ...WIDE };
  let t0 = 0, animating = false;

  /* ---- portrait re-anchor ------------------------------------
     Swaps the plate, re-places each cutout against it, and derives
     fresh camera targets from where they actually landed. Re-run on
     resize because every number depends on the cover-crop. */
  function anchorPortrait() {
    const phone = isPhone();
    const plate = section.querySelector('[data-hero-plate]');
    const blur  = section.querySelector('[data-hero-blur]');
    const cuts  = [...section.querySelectorAll('.hero__subject')];
    if (!plate || cuts.length !== scene.subjects.length) return;

    const src = phone ? PORTRAIT_PLATE : scene.plate.wide;
    if (!plate.src.endsWith(src)) { plate.src = src; if (blur) blur.src = src; }

    if (!phone) {
      scene.subjects.forEach((sub, i) => {
        cuts[i].style.left  = `${sub.box.x * 100}%`;
        cuts[i].style.top   = `${sub.box.y * 100}%`;
        cuts[i].style.width = `${sub.box.w * 100}%`;
        cams[i + 1] = sub.cam;
      });
      cams[cams.length - 1] = scene.subjects[scene.subjects.length - 1].cam;
      return;
    }

    // Where the portrait plate actually lands under object-fit: cover.
    const W = window.innerWidth, H = window.innerHeight;
    const k = Math.max(W / PORTRAIT_IW, H / PORTRAIT_IH);
    const dw = PORTRAIT_IW * k, dh = PORTRAIT_IH * k;
    const ox = (W - dw) / 2, oy = (H - dh) / 2;

    PORTRAIT_SUBJECTS.forEach((p, i) => {
      const el = cuts[i];
      el.style.left  = `${ox + p.fx * dw}px`;
      el.style.top   = `${oy + p.fy * dh}px`;
      el.style.width = `${p.fw * dw}px`;

      const wpx = p.fw * dw, hpx = wpx * p.ratio;
      const left = ox + p.fx * dw, top = oy + p.fy * dh;
      cams[i + 1] = {
        x: ((left + wpx * p.cx) / W) * 100,
        y: ((top + hpx * p.cy) / H) * 100,
        /* Minimum raised from 1.6: below about 2 the camera cannot
           centre on a subject this far off-centre, and it also
           framed them too small on a phone. */
        s: clamp((p.fillH * H) / hpx, 2.2, 9),
      };
    });
    cams[cams.length - 1] = cams[cams.length - 2];
  }

  const built = buildBird(section, scene);
  const birdEl = built && built.bird;
  const liveHost = built && built.liveHost;
  const liveFacet = built && built.liveFacet;

  /* Bird-space geometry. BW/BH are the bird's natural size; every
     facet polygon is a percentage of that box, so picking BW once
     keeps the maths in plain pixels. */
  const BW = 1195, BH = BW / BIRD_ASPECT;

  function poses(vw, vh) {
    const BH_ = BH;
    // Rest: right-aligned, vertically centred.
    const phone = isPhone();
    const kr = ((phone ? BIRD_PHONE.w : BIRD_REST_W) * vw) / BW;
    const restX = phone ? (vw - BW * kr) / 2
                        : vw * (1 - BIRD_REST_PAD) - BW * kr;
    const restY = (phone ? BIRD_PHONE.cy : BIRD_REST_CY) * vh - (BH_ * kr) / 2;

    /* The fixed point of the whole move: where the live facet's centre
       sits once the bird is at rest. Holding it still and varying only
       the scale makes the reveal a pure zoom. */
    const fx = restX + LIVE_BOX.cx * BW * kr;
    const fy = restY + LIVE_BOX.cy * BH_ * kr;

    /* Start scale: enough that the live facet covers the viewport
       ABOUT THAT POINT. Derived rather than guessed, because the fixed
       point is off-centre now — a facet centred at 79% of the width
       has to be far larger to reach the left edge than one centred in
       the middle, and a fixed safety factor would not have covered it. */
    const ksx = 2 * Math.max(fx, vw - fx) / (LIVE_BOX.w * BW);
    const ksy = 2 * Math.max(fy, vh - fy) / (LIVE_BOX.h * BH_);
    const ks = Math.max(ksx, ksy) * 1.02;

    const at = (k) => ({ k, x: fx - LIVE_BOX.cx * BW * k, y: fy - LIVE_BOX.cy * BH_ * k });
    return { start: at(ks), rest: at(kr), fx, fy, ks, kr, at };
  }

  /* Size the live facet's plate so that at the start pose it lands
     pixel-for-pixel on the viewport, carrying beat 3's camera. That
     alignment is the whole trick — get it wrong and the handover
     shows as a jump. */
  function layoutLive(vw, vh) {
    if (!liveHost) return;
    const { start } = poses(vw, vh);
    liveHost.style.width  = (vw / start.k) + 'px';
    liveHost.style.height = (vh / start.k) + 'px';
    liveHost.style.left   = (-start.x / start.k) + 'px';
    liveHost.style.top    = (-start.y / start.k) + 'px';
    const c = cams[cams.length - 2];   // the merchant beat
    const img = liveHost.querySelector('.bird__scene');
    if (img) {
      img.style.transform =
        `translate3d(${(50 - c.x * c.s).toFixed(3)}%, ${(50 - c.y * c.s).toFixed(3)}%, 0) scale(${c.s})`;
    }
  }

  let lastLayoutW = 0, lastLayoutH = 0;

  let lastWheel = 0, cooldownUntil = 0;

  /* Who owns a vertical drag: the hero, or the browser. Latched by the
     browser at touchstart for the whole gesture, so it has to be correct
     BEFORE the finger lands — decided in the read phase, applied in the
     write phase, never from inside a touch handler. */
  let heroOwns = true, ownTouch = 'none';
  section.style.touchAction = 'none';   // engaged at rest: the hero starts on screen

  function paintChrome() {
    capEls.forEach((el, i) => el.classList.toggle('is-on', !animating && step === i + 1));
    dotEls.forEach((el, i) => el.classList.toggle('is-on', i === Math.min(step, dotEls.length - 1)));
    if (openEl) openEl.classList.toggle('is-out', step > 0);
    section.classList.toggle('is-collage', step === COLLAGE_STEP);
    /* The nav is a sibling of the hero, not a child, so it cannot be
       styled by a descendant selector. Flag the light ground on body
       and let initNav's own logic pick it up. */
    document.body.classList.toggle('hero-light', step === COLLAGE_STEP);
    if (collage) collage.classList.toggle('is-on', step === COLLAGE_STEP);
  }

  function goTo(i, instant = false) {
    i = clamp(i, 0, LAST);
    if (i === step && !instant) return;
    fromStep = step;
    step = i;
    from = { ...cam };
    to = cams[i];
    t0 = performance.now();
    animating = !instant;
    if (instant) { cam = { ...to }; }
    paintChrome();
    Engine.wake();
  }

  Engine.read((st) => {
    if (st.vw !== lastLayoutW || st.vh !== lastLayoutH) {
      lastLayoutW = st.vw; lastLayoutH = st.vh;
      layoutLive(st.vw, st.vh);
    }
    /* Hand vertical touch back the moment the hero stops filling the
       screen, or the page cannot be scrolled with a finger resting on
       the hero. Cached here so the touch handler never has to measure:
       a getBoundingClientRect per touchmove is a forced reflow on every
       frame of a drag, on the device least able to afford one. */
    heroOwns = engaged();
  });

  Engine.write((st) => {
    if (animating) {
      const raw = clamp((performance.now() - t0) / DUR, 0, 1);
      const e = easeInOut(raw);
      // Scale in log space so the perceived zoom rate stays constant.
      cam.x = from.x + (to.x - from.x) * e;
      cam.y = from.y + (to.y - from.y) * e;
      cam.s = Math.exp(Math.log(from.s) + (Math.log(to.s) - Math.log(from.s)) * Math.pow(e, 0.86));
      if (raw >= 1) {
        animating = false;
        cooldownUntil = performance.now() + COOLDOWN;
        paintChrome();
      }
      Engine.wake();
    }

    /* Keep the scene covering the screen.

       It is viewport-sized and scaled about its own origin, so it only
       reaches both edges while

           50/s  <=  cam.x  <=  100 - 50/s

       Outside that the pin's black ground shows through at an edge. The
       hand-tuned desktop targets all satisfy it, but the portrait ones
       are DERIVED from where each cutout lands, and Amena's came out at
       x = 20 against a minimum scale of 1.6 — which needs x >= 31.25.
       Clamped per frame, not per target, because the bound moves with
       the scale as the camera travels. */
    const half = 50 / cam.s;
    const cx = clamp(cam.x, half, 100 - half);
    const cy = clamp(cam.y, half, 100 - half);

    sceneEl.style.transform =
      `translate3d(${(50 - cx * cam.s).toFixed(3)}%, ${(50 - cy * cam.s).toFixed(3)}%, 0) scale(${cam.s.toFixed(4)})`;

    if (blurEl) blurEl.style.opacity = (DOF * clamp((cam.s - 1) / 2.4, 0, 1)).toFixed(3);

    /* ---- the collapse: one camera move ----------------------
       The bird is a fixed object. At morph 0 it is scaled so the
       live facet alone covers the viewport — what you see IS beat
       3. At morph 1 it rests at BIRD_REST_W on the right. Only
       the bird's own transform changes; no facet moves relative
       to any other, and nothing fades. */
    if (birdEl) {
      const m0 = fromStep === COLLAGE_STEP ? 1 : 0;
      const m1 = step === COLLAGE_STEP ? 1 : 0;
      const eNow = animating ? clamp((performance.now() - t0) / DUR, 0, 1) : 1;
      const morph = m0 + (m1 - m0) * easeInOut(eNow);

      /* Visible whenever the collapse is in play, not gated on the
         morph value. Gating on morph left a one-frame hole: the
         full-bleed viewport hides the instant .is-collage lands, so
         the bird has to be on screen already at morph 0 — where it
         is showing exactly what the viewport was showing. */
      const live = step === COLLAGE_STEP || (animating && fromStep === COLLAGE_STEP);
      birdEl.style.visibility = live ? 'visible' : 'hidden';
      if (live) {
        const p = poses(st.vw, st.vh);
        /* Publish where the bird comes to REST (not where it is now —
           mid-zoom its left edge is far off-screen) so the copy can be
           centred in the column it leaves. */
        section.style.setProperty('--bird-left', p.rest.x.toFixed(1) + 'px');
        /* Scale travels in log space: a pull-back of this range reads at
           a constant rate only if interpolated that way. Position is
           then DERIVED from the scale about the fixed point, never
           interpolated separately — that is what keeps it a pure zoom. */
        const k  = Math.exp(Math.log(p.ks) + (Math.log(p.kr) - Math.log(p.ks)) * morph);
        const at = p.at(k);
        const bx = at.x, by = at.y;
        birdEl.style.transform =
          `translate3d(${bx.toFixed(2)}px, ${by.toFixed(2)}px, 0) scale(${k.toFixed(5)})`;

        /* The live overlay exists only to make the handover invisible.
           Once the zoom is under way the artwork's own photograph of
           the same facet takes over. */
        if (liveFacet) liveFacet.style.opacity = (1 - clamp((morph - 0.05) / 0.35, 0, 1)).toFixed(3);
      }
    }

    const want = heroOwns ? 'none' : 'auto';
    if (want !== ownTouch) {
      ownTouch = want;
      section.style.touchAction = want;
    }
  });

  /* ---- input: one gesture, one beat ------------------------
     A trackpad flick emits thirty-odd wheel events. Accepting
     them all would rip through the whole sequence, so a step is
     only taken on the FIRST event of a gesture — identified by a
     quiet gap before it — and only once the previous move has
     finished settling. */
  function engaged() {
    const r = section.getBoundingClientRect();
    return r.top <= 2 && r.bottom >= window.innerHeight - 2;
  }

  function tryStep(dir) {
    const next = step + dir;
    if (next < 0 || next > LAST) return false;   // hand scrolling back to the page
    goTo(next);
    return true;
  }

  window.addEventListener('wheel', (e) => {
    const now = performance.now();
    const fresh = now - lastWheel > GESTURE_GAP;
    lastWheel = now;
    if (!engaged()) return;

    if (animating || now < cooldownUntil) { e.preventDefault(); return; }
    if (!fresh) { e.preventDefault(); return; }  // same flick, already handled

    const dir = e.deltaY > 0 ? 1 : -1;
    // At the ends, let the page take the scroll so the section releases.
    if ((dir > 0 && step === LAST) || (dir < 0 && step === 0)) return;
    e.preventDefault();
    tryStep(dir);
  }, { passive: false });

  /* Touch: one swipe, one beat.

     Two things have to be true for this to work on a real device, and
     neither shows up in a desktop browser at phone width:

     1. The section must declare `touch-action: none` BEFORE the finger
        lands. Otherwise the compositor pans the page on its own thread
        without waiting to hear from JavaScript at all.
     2. preventDefault has to be called on the FIRST touchmove, not once
        some swipe distance is met. The browser decides within a move or
        two whether a gesture is a scroll, and once it has, every later
        touchmove arrives with cancelable false — preventDefault becomes
        a silent no-op and the page scrolls away underneath the beats.

     So the gesture is claimed immediately and the threshold only decides
     WHEN to step, never whether to take the gesture. */
  let ty = 0, tx = 0, touching = false, taken = false;
  section.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { touching = false; return; }
    ty = e.touches[0].clientY;
    tx = e.touches[0].clientX;
    touching = true;
    taken = false;
  }, { passive: true });

  section.addEventListener('touchmove', (e) => {
    if (!touching || !heroOwns) return;
    if (e.cancelable) e.preventDefault();   // claim it now, while we still can
    if (taken) return;

    const dy = ty - e.touches[0].clientY;
    const dx = tx - e.touches[0].clientX;
    if (Math.abs(dy) < TOUCH_STEP || Math.abs(dy) <= Math.abs(dx)) return;

    taken = true;                            // one gesture, one beat
    if (animating || performance.now() < cooldownUntil) return;

    const dir = dy > 0 ? 1 : -1;
    if (dir > 0 && step === LAST) { releaseDown(); return; }
    if (dir < 0 && step === 0) return;       // nothing above the hero
    tryStep(dir);
  }, { passive: false });

  section.addEventListener('touchend', () => { touching = false; }, { passive: true });
  section.addEventListener('touchcancel', () => { touching = false; }, { passive: true });

  /* The wheel releases at the last beat by simply not preventing the
     event. Touch has no such fallthrough — the section is holding the
     gesture — so the handover is explicit: one section, smoothly. */
  function releaseDown() {
    const top = window.scrollY + section.getBoundingClientRect().bottom;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* Keyboard and presentation clickers. */
  window.addEventListener('keydown', (e) => {
    if (!engaged()) return;
    const fwd = e.key === 'PageDown' || e.key === 'ArrowDown' || e.key === ' ';
    const back = e.key === 'PageUp' || e.key === 'ArrowUp';
    if (!fwd && !back) return;
    const dir = fwd ? 1 : -1;
    if ((dir > 0 && step === LAST) || (dir < 0 && step === 0)) return;
    e.preventDefault();
    if (!animating && performance.now() >= cooldownUntil) tryStep(dir);
  });

  // Dots are clickable, so a presenter can jump straight to a beat.
  dotEls.forEach((el, i) => {
    el.addEventListener('click', () => goTo(i));
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
  });

  anchorPortrait();
  window.addEventListener('resize', () => { anchorPortrait(); goTo(step, true); });

  /* Live tuning for the portrait plate's ground line.

     The cutouts' vertical placement has to be judged by eye against
     the photograph, and it cannot be measured — so expose a nudge
     rather than round-trip guesses. In the console:

       __bkash.hero.nudge(2, 0.01)   // move Rahim down 1% of the plate
       __bkash.hero.nudge(1, -0.005) // move Faisal up
       __bkash.hero.values()         // read the numbers back out

     Subjects are 0 Amena, 1 Faisal, 2 Rahim. */
  function nudge(i, delta) {
    if (!PORTRAIT_SUBJECTS[i]) return 'no such subject (0 Amena, 1 Faisal, 2 Rahim)';
    PORTRAIT_SUBJECTS[i].fy = +(PORTRAIT_SUBJECTS[i].fy + delta).toFixed(4);
    anchorPortrait();
    goTo(step, true);
    return values();
  }
  function values() {
    return PORTRAIT_SUBJECTS.map((p, i) =>
      ['Amena', 'Faisal', 'Rahim'][i] + ' fy: ' + p.fy).join('\n');
  }

  goTo(0, true);
  return { goTo, anchorPortrait, nudge, values, get step() { return step; } };
}
