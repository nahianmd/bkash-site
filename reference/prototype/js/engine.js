/* ============================================================
   bKash — scroll engine

   Replaces the original's setInterval(tick, 16) + per-tick
   getBoundingClientRect storm. Three things changed:

   1. One requestAnimationFrame loop, synced to the compositor,
      parked when nothing is moving.
   2. A strict read phase then a write phase. The original
      interleaved rect reads with style writes, forcing several
      layout recalculations inside every single tick.
   3. Damping that adapts to the input device. See pickLambda().
   ============================================================ */

export const Engine = (() => {
  const readers = [];   // fn(state) -> may read layout, must not write
  const writers = [];   // fn(state) -> may write style, must not read layout
  let running = false;
  let lastT = 0;
  let idleFrames = 0;

  const state = {
    y: 0,          // raw scroll position
    sy: 0,         // smoothed scroll position
    vh: 0, vw: 0,
    dt: 0,         // seconds since last frame, clamped
    t: 0,          // seconds since start
    lambda: 8,     // damping rate, set by input detection
    moving: false,
  };

  /* Frame-rate independent exponential damping.
     `lambda` is a rate in 1/seconds: higher tracks tighter,
     lower trails more. This is the correct form — the naive
     `cur += (tgt-cur) * k` with a fixed k changes behaviour
     whenever the frame rate does. */
  const damp = (a, b, lambda, dt) => b + (a - b) * Math.exp(-lambda * dt);

  const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;

  /* ---- input device detection -------------------------------
     A mouse wheel delivers a staircase: few events, large
     quantised deltas (usually ±100, or deltaMode=1 in lines).
     Without generous smoothing the camera visibly teleports
     between steps.

     A trackpad delivers a dense stream of small, often
     fractional deltas, and macOS has ALREADY applied inertia.
     Smoothing that again gives you smoothing on top of
     smoothing — the page feels laggy and swimmy, which reads as
     broken rather than cinematic.

     Same constant, opposite outcomes, so we classify rather
     than guess. Confidence builds over the first ~12 events and
     then we stop listening.                                    */
  const LAMBDA = { wheel: 5.5, trackpad: 11.5, unknown: 8 };
  let samples = 0, wheelish = 0;

  function onWheel(e) {
    const d = Math.abs(e.deltaY);
    if (d === 0) return;
    // deltaMode 1 = lines, only ever a real wheel.
    // Large integer deltas that are multiples of 20 are wheel notches.
    const isWheel = e.deltaMode === 1 || (Number.isInteger(d) && d >= 40 && d % 20 === 0);
    wheelish += isWheel ? 1 : -1;
    if (++samples >= 12) {
      state.lambda = wheelish > 0 ? LAMBDA.wheel : LAMBDA.trackpad;
      window.removeEventListener('wheel', onWheel);
    } else {
      // blend toward the running guess so it settles smoothly
      state.lambda = wheelish > 0 ? LAMBDA.wheel : LAMBDA.trackpad;
    }
  }

  function measure() {
    state.vw = window.innerWidth;
    state.vh = window.innerHeight;
  }

  function frame(now) {
    const t = now / 1000;
    state.dt = lastT ? clamp(t - lastT, 0.001, 0.05) : 0.016;
    state.t = t;
    lastT = t;

    state.y = window.scrollY || window.pageYOffset || 0;
    const prev = state.sy;
    state.sy = damp(state.sy, state.y, state.lambda, state.dt);
    // Snap out of asymptote so we can park the loop.
    if (Math.abs(state.sy - state.y) < 0.05) state.sy = state.y;
    state.moving = state.sy !== prev;

    // READ phase — layout queries only, no writes.
    for (let i = 0; i < readers.length; i++) readers[i](state);
    // WRITE phase — style mutations only, no layout queries.
    for (let i = 0; i < writers.length; i++) writers[i](state);

    // Park after a second of stillness; any scroll or resize wakes us.
    idleFrames = state.moving ? 0 : idleFrames + 1;
    if (idleFrames > 60) { running = false; return; }
    requestAnimationFrame(frame);
  }

  function wake() {
    idleFrames = 0;
    if (!running) { running = true; lastT = 0; requestAnimationFrame(frame); }
  }

  /* Run the read/write phases synchronously, outside rAF.
     Needed because requestAnimationFrame does not fire while a tab
     is hidden — which is correct behaviour, but makes automated
     screenshots impossible. `settle` also converges the damping so
     a captured frame shows the camera at rest rather than mid-chase. */
  function step(dt = 0.016) {
    state.dt = dt;
    state.y = window.scrollY || 0;
    state.sy = damp(state.sy, state.y, state.lambda, dt);
    if (Math.abs(state.sy - state.y) < 0.05) state.sy = state.y;
    measure();
    for (let i = 0; i < readers.length; i++) readers[i](state);
    for (let i = 0; i < writers.length; i++) writers[i](state);
  }

  function settle(frames = 90) {
    for (let i = 0; i < frames; i++) step(0.016);
  }

  return {
    state,
    damp,
    clamp,
    step,
    settle,
    /** Register a layout-reading callback. */
    read(fn) { readers.push(fn); return this; },
    /** Register a style-writing callback. */
    write(fn) { writers.push(fn); return this; },
    wake,
    start() {
      measure();
      window.addEventListener('scroll', wake, { passive: true });
      window.addEventListener('resize', () => { measure(); wake(); });
      window.addEventListener('wheel', onWheel, { passive: true });
      state.sy = state.y = window.scrollY || 0;
      wake();
      return this;
    },
  };
})();

/* ============================================================
   Reveal — IntersectionObserver, not per-frame rect checks.

   The original walked every [data-reveal] element every tick
   calling getBoundingClientRect(). IntersectionObserver does
   the same job off the main thread and stops costing anything
   once an element has fired.
   ============================================================ */

export function initReveal(root = document) {
  const els = root.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });

  els.forEach((el, i) => {
    // Stagger within a group of siblings, capped so a long list
    // never leaves the last item waiting a noticeable beat.
    const group = el.dataset.revealGroup;
    if (group) el.style.setProperty('--reveal-delay', `${Math.min(i % 6, 5) * 70}ms`);
    io.observe(el);
  });
}

/* ============================================================
   Counters — count-up that respects tabular figures.
   ============================================================ */

export function initCounters(root = document) {
  const els = [...root.querySelectorAll('[data-count]')];
  if (!els.length) return;

  const run = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dp = target < 10 && !Number.isInteger(target) ? 1 : 0;
    const dur = 1400;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * e).toFixed(dp) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      run(entry.target);
      io.unobserve(entry.target);
    }
  }, { threshold: 0.4 });

  els.forEach(el => { el.textContent = '0' + (el.dataset.suffix || ''); io.observe(el); });
}
