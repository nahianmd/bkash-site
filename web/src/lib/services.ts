/* ============================================================
   bKash — a thousand more stories → the phone → sixteen services
   specs/sections/services.md · specs/services/plan.md

   One pin: the wall, the phone's arrival, the emergence (the screen,
   frameless with a thin pink line, standing up out of the photographed
   hand), the slide to its resting place beside the copy — leaning back
   about its bottom edge — and then a screen that is alive: an idle
   sway and a tilt under the pointer. The sixteen services are their
   own section (services-detail.ts), reached by the button.
   ============================================================ */

import { gsap, ScrollTrigger, reducedMotion, isPhone } from './scroll';
import { cubicInOut } from './scene-rig';
import { MODEL, POSE_ZERO, solvePlacement, type Camera, type Pose } from './device';

/** What the screen does after the emergence: where it slides to, how big
    it is there, and the small rotations that keep it alive — CSS
    conventions (px, y down, rotate signs as the pose's). */
type Live = { dx: number; dy: number; s: number; rx: number; ry: number };

/* ---- the sixteen, in the app's order ---------------------------
   Names are the app's; NGO is the app's word for the Microfinance
   icon. Lines are PLACEHOLDER, written here, not bKash's. */
export const SERVICES = [
  {
    id: 'send-money',
    name: 'Send Money',
    line: 'Money to any bKash number in seconds, at any hour.',
  },
  {
    id: 'mobile-recharge',
    name: 'Mobile Recharge',
    line: 'Top up any operator from the balance you already keep.',
  },
  {
    id: 'cash-out',
    name: 'Cash Out',
    line: 'Turn digital money into notes at any of 3.5 lakh agent points.',
  },
  {
    id: 'make-payment',
    name: 'Make Payment',
    line: 'Scan a merchant’s QR and pay. No card, no terminal, no change.',
  },
  {
    id: 'add-money',
    name: 'Add Money',
    line: 'Bring funds in from a bank, a card, or a remittance from abroad.',
  },
  {
    id: 'pay-bill',
    name: 'Pay Bill',
    line: 'Electricity, gas, water and internet, settled without leaving home.',
  },
  {
    id: 'savings',
    name: 'Savings',
    line: 'Put a little aside each week and watch it build. No minimum.',
  },
  {
    id: 'loan',
    name: 'Loan',
    line: 'Small instant credit, decided on your record here. No paperwork.',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    line: 'Cover for health, accident and travel, from a few taka a month.',
  },
  {
    id: 'bkash-to-bank',
    name: 'bKash to Bank',
    line: 'Move money into a bank account without queueing at one.',
  },
  {
    id: 'education',
    name: 'Education',
    line: 'School and university fees paid on time, no day lost travelling.',
  },
  {
    id: 'ngo',
    name: 'NGO',
    line: 'Give to registered organisations, with the receipt in your history.',
  },
  {
    id: 'toll-pay',
    name: 'Toll Pay',
    line: 'Cross the bridge without stopping to find change.',
  },
  {
    id: 'request-money',
    name: 'Request Money',
    line: 'Ask to be paid back, and skip the awkward reminder.',
  },
  {
    id: 'remittance',
    name: 'Remittance',
    line: 'Money from abroad, landing here in minutes rather than days.',
  },
  {
    id: 'donation',
    name: 'Donation',
    line: 'Reach people at the other end of the country, instantly.',
  },
] as const;

/* ---- the screenshot's icon geometry -----------------------------
   Derived, not placed (reference/prototype/js/phone.js): the home
   screen is 720x4730; the icon block's columns and rows as fractions
   of the visible screen box when it shows the top 1520px at phone
   aspect. The row pitch over the column pitch is what the real grid
   is built to match, so the zoom can land on it by construction. */
export const SCREEN = {
  cols: [0.125, 0.375, 0.625, 0.875],
  /** the icon rows, in the screenshot's own pixels */
  rowsPx: [400, 612, 824, 1036],
  /** the display's aspect is the handset's (device.ts), so the CSS
      device, the WebGL device and the lattice all share it */
  get aspect() {
    return MODEL.aspect;
  },
  /** the rows as fractions of the visible screen box */
  get rows() {
    const visible = MODEL.shot.w / this.aspect;
    return this.rowsPx.map((px) => px / visible);
  },
  /** row pitch / column pitch, in screen-box units */
  get pitchRatio() {
    return (this.rows[1] - this.rows[0]) / this.aspect / (this.cols[1] - this.cols[0]);
  },
};

/* ---- the wall ---------------------------------------------------- */
export type Crop = 'tall' | 'square' | 'wide';
export type WallTile =
  | { kind: 'photo'; photo: string; crop: Crop; pos: string }
  | { kind: 'title' }
  | { kind: 'phone' };

export const WALL = {
  /* Relative column rates — the recorded exception to the plane tokens
     (design-language, services.md). The fastest column carries the
     phone; the wall's travel is DERIVED so that column's phone tile
     arrives at centre exactly when the wall phase ends. */
  rates: { desktop: [0.85, 1.0, 1.15, 0.85], phone: [0.85, 1.15] },
  /* Phases of the section's progress. */
  wallEnd: 0.489,
  arriveHoldEnd: 0.611,
  emergeEnd: 0.794,
  restEnd: 0.856,
  slideEnd: 0.956,
  travelScreens: 4.5,
  scrub: 0.6,
  /* Rest B: the device's height as a fraction of --vh (desktop), or its
     width as a fraction of the viewport (phone). */
  rest: {
    desktopHeightFrac: 0.9,
    phoneWidthFrac: 0.92,
    /* clear air between the resting handset and the copy on a phone */
    phoneCopyGap: 'var(--s-8)',
    /* The resting lean (Nahian, 2026-09-24): the screen is one flat
       panel, its top tipped back this many degrees about its BOTTOM edge
       — the bottom stays square to you, the top recedes. Eased in with
       the slide; the life plays on top of it. */
    leanDeg: 14,
  },
  /* Over the first part of the emergence the device fades in over the
     photographed screen it is posed on; the wall (hand included) fades
     as the phone lifts out of it, and the ground turns white beneath.
     Fractions of the emergence. */
  deviceFadeIn: 0.2,
  wallFade: [0.05, 0.55],
  /* Alive: the idle sway (degrees, px, seconds) and the tilt under the
     pointer (degrees at the frame's edge; how fast it follows). */
  alive: {
    swayY: 4,
    swayX: 2,
    bob: 6,
    periods: [3.1, 4.3, 2.7],
    nudgeY: 12,
    nudgeX: 8,
    follow: 0.08,
  },
};

/* ---- the photographed phone -------------------------------------
   `phone.jpg` (2250×3000): a handset held at a slight turn, the home
   screen up. The four corners of its SCREEN as fractions of the
   photograph — fitted from the pixels (tools: the screen edges as
   lines, intersected), not placed by eye. The tile shows the whole
   photograph at its own aspect, so these are the tile's fractions too.
   The device is posed in 3D so its corners land on these; the pose is
   SOLVED per viewport (device.ts), then interpolated to identity —
   the phone stands up and comes forward out of the hand. */
export const PHONE_PHOTO = { w: 2250, h: 3000 };
export const PHONE_QUAD = {
  tl: [0.3831, 0.2038],
  tr: [0.7092, 0.2022],
  br: [0.6597, 0.7432],
  bl: [0.3362, 0.7365],
  /* The handset's tilt in the photograph, solved once in the photograph's
     own pixels (tools/photo-pose.mjs; weak perspective, 4.3px rms on a
     1600px phone): the top leans back 11.4°, the right side is 16.4°
     nearer — the side whose edge the photograph shows — and a 0.6° roll.
     CSS rotation conventions, radians. */
  tilt: { rx: 0.1982, ry: -0.2868, rz: 0.0105 },
};

/* Per-photograph crops: the subject decides where the frame sits. */
const P = (photo: string, crop: Crop, pos: string): WallTile => ({
  kind: 'photo',
  photo,
  crop,
  pos,
});

/* Columns top→bottom. Thirty-two photographs — the client's twenty-two
   (2026-09-19) and the ten from before — each used once on desktop, plus
   two repeats at other crops so the outer column is as tall as the rest
   (it must not run out before the phone arrives); the phone's two
   columns carry the eighteen that read best small. Crops
   follow the subject: tall for a standing figure, square for a face or
   a pair, wide for a scene. The phone tile rides the fastest column,
   with tiles after it so the column never runs out beneath it. */
export const COLUMNS: { desktop: WallTile[][]; phone: WallTile[][] } = {
  desktop: [
    [
      P('riders', 'wide', '50% 50%'),
      P('fruit-seller', 'tall', '50% 40%'),
      P('station', 'wide', '60% 50%'),
      P('boy', 'square', '50% 40%'),
      P('village-shop', 'wide', '70% 50%'),
      P('grocer', 'tall', '50% 40%'),
      P('school', 'wide', '50% 55%'),
      P('anisul', 'square', '50% 35%'),
      P('boatman', 'wide', '50% 50%'),
    ],
    [
      { kind: 'title' },
      P('flower-seller', 'tall', '50% 45%'),
      P('minar', 'wide', '65% 50%'),
      P('fabric', 'square', '50% 50%'),
      P('mangroves', 'tall', '50% 40%'),
      P('girls-books', 'wide', '50% 50%'),
      P('window-man', 'square', '50% 45%'),
      P('ferry', 'wide', '45% 40%'),
      P('munni', 'tall', '50% 30%'),
    ],
    [
      P('boat', 'wide', '50% 50%'),
      P('schoolgirl', 'tall', '50% 40%'),
      P('umbrella', 'wide', '55% 50%'),
      P('family-agent', 'square', '50% 40%'),
      P('fisherman', 'wide', '50% 45%'),
      P('jacket', 'tall', '50% 40%'),
      { kind: 'phone' },
      P('agent', 'wide', '40% 50%'),
      P('shajib', 'square', '55% 50%'),
    ],
    [
      P('friends', 'wide', '50% 50%'),
      P('window-mother', 'square', '70% 50%'),
      P('agent-shop', 'wide', '50% 50%'),
      P('train', 'tall', '60% 40%'),
      P('merchant', 'square', '60% 50%'),
      P('sendmoney', 'wide', '35% 50%'),
      P('banner', 'tall', '50% 50%'),
      P('boat', 'square', '50% 50%'),
      P('fisherman', 'tall', '50% 45%'),
    ],
  ],
  phone: [
    [
      P('riders', 'wide', '50% 50%'),
      { kind: 'title' },
      P('fruit-seller', 'tall', '50% 40%'),
      P('boy', 'square', '50% 40%'),
      P('minar', 'wide', '65% 50%'),
      P('grocer', 'tall', '50% 40%'),
      P('fabric', 'square', '50% 50%'),
      P('girls-books', 'wide', '50% 50%'),
      P('mangroves', 'tall', '50% 40%'),
      P('school', 'wide', '50% 55%'),
    ],
    [
      P('flower-seller', 'tall', '50% 45%'),
      P('window-man', 'square', '50% 45%'),
      P('boat', 'wide', '50% 50%'),
      P('schoolgirl', 'tall', '50% 40%'),
      P('family-agent', 'square', '50% 40%'),
      P('jacket', 'tall', '50% 40%'),
      { kind: 'phone' },
      P('fisherman', 'wide', '50% 45%'),
      P('umbrella', 'wide', '55% 50%'),
    ],
  ],
};

type Col = { el: HTMLElement; rate: number };

/** Resolve a CSS length expression (tokens, calc, clamp) to px. */
function resolvePx(expr: string, fallback: number): number {
  const probe = document.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;width:${expr};`;
  document.body.appendChild(probe);
  const px = parseFloat(getComputedStyle(probe).width);
  probe.remove();
  return Number.isFinite(px) ? px : fallback;
}

const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

const DEG = Math.PI / 180;

export function initServices() {
  const section = document.querySelector<HTMLElement>('[data-services]');
  const pinEl = section?.querySelector<HTMLElement>('[data-services-pin]');
  if (!section || !pinEl) return;
  const pin: HTMLElement = pinEl;

  /* One pin, the travel from config, one source. */
  section.style.setProperty('--svc-screens', String(1 + WALL.travelScreens));

  const device = section.querySelector<HTMLElement>('[data-device]');
  const ground = section.querySelector<HTMLElement>('[data-ground]');
  const marker = section.querySelector<HTMLElement>('[data-svc-marker]');
  const copy = section.querySelector<HTMLElement>('[data-copy]');

  let vw = 1;
  let vh = 1;
  let cols: Col[] = [];
  let fastRate = 1;
  let wallEl: HTMLElement | null = null;
  /* The emergence, solved once per resize: the pose that lays the device
     over the photographed screen at arrival, and how well it fits. */
  let pose: Pose = POSE_ZERO;
  let poseRms = 0;
  /* Rest B: the body, and the display inside it, from the model's
     proportions. The body now only sets the scale; the screen alone is
     drawn (Nahian, 2026-09-24). */
  let restW = 1;
  let restH = 1;
  let screenW = 1;
  let screenH = 1;
  let cam: Camera = { cx: 0, cy: 0, d: 1500, ox: 0, oy: 0 };
  /* The slide: where the phone rests beside the copy, and its size there,
     relative to Rest B. Solved from the copy's own measured height. */
  let slide = { dx: 0, dy: 0, s: 1 };
  /* The fastest column's total translate at arrival — DERIVED from where
     the phone tile sits, so it lands at centre exactly at wallEnd. */
  let D = 0;

  /* The wall that is on screen at this width; the other is display:none. */
  function activeWall(): HTMLElement | null {
    for (const w of section!.querySelectorAll<HTMLElement>('[data-wall]'))
      if (getComputedStyle(w).display !== 'none') return w;
    return null;
  }

  function measure() {
    vw = pin.clientWidth;
    vh = pin.clientHeight;
    const wall = activeWall();
    if (!wall) return;
    const rates = isPhone() ? WALL.rates.phone : WALL.rates.desktop;
    cols = [...wall.querySelectorAll<HTMLElement>('[data-wall-col]')].map((el, i) => ({
      el,
      rate: rates[i] ?? 1,
    }));
    fastRate = Math.max(...cols.map((c) => c.rate));
    const tile = wall.querySelector<HTMLElement>('[data-tile="phone"]');
    if (!tile) return;
    wallEl = wall;
    /* The columns carry will-change: transform, which makes each one an
       offsetParent — so the tile's offsets are column-relative and the
       column's are wall-relative. Both are added. The wall's top-left is
       the pin's. One layout read per resize. */
    const col = tile.parentElement as HTMLElement;
    const tileW = tile.offsetWidth;
    const tileH = tile.offsetHeight;
    const tileTop = col.offsetTop + tile.offsetTop;
    const tileLeft = col.offsetLeft + tile.offsetLeft;
    /* The photographed screen's corners in the pin, at arrival: the tile
       is the photograph at its own aspect, so its fractions are the
       tile's. Its centre, not the tile's, is what lands at the viewport
       centre. */
    const Q = PHONE_QUAD;
    const qcy = (Q.tl[1] + Q.tr[1] + Q.br[1] + Q.bl[1]) / 4;
    D = tileTop + qcy * tileH - vh / 2;
    const quad = [Q.tl, Q.tr, Q.br, Q.bl].flatMap(([fx, fy]) => [
      tileLeft + fx * tileW,
      tileTop + fy * tileH - D,
    ]);

    const gutter = resolvePx('var(--gutter)', 32);
    const navH = resolvePx('var(--nav-h)', 72);
    const gap = resolvePx('var(--s-6)', 32);

    /* Rest B by formula — the body's height on desktop, its width on a
       phone — then the CSS device sized and centred once, its display,
       corners and island set from the handset's proportions. */
    if (device) {
      const B = MODEL.body;
      const Dp = MODEL.display;
      restH = isPhone()
        ? (WALL.rest.phoneWidthFrac * vw * B.h) / B.w
        : WALL.rest.desktopHeightFrac * vh;
      restW = (restH * B.w) / B.h;
      screenW = (restW * Dp.w) / B.w;
      screenH = (restH * Dp.h) / B.h;
      /* The device IS the screen now: sized to the display, centred, its
         corners the display's. Its centre is still the display's, which
         is what the placement below is solved about. */
      device.style.width = `${screenW.toFixed(1)}px`;
      device.style.height = `${screenH.toFixed(1)}px`;
      device.style.left = `${((vw - screenW) / 2).toFixed(1)}px`;
      device.style.top = `${((vh - screenH) / 2).toFixed(1)}px`;
      device.style.setProperty('--screen-r', `${((screenW * Dp.r) / Dp.w).toFixed(1)}px`);
      /* The pin's camera, read, not assumed. The placement is solved for
         the DISPLAY — the photographed corners are the screen's — about the
         device's centre, which is the display's; the tilt is the photo's. */
      const cs = getComputedStyle(pin);
      const d = parseFloat(cs.perspective) || 1500;
      const [ox, oy] = cs.perspectiveOrigin.split(' ').map(parseFloat);
      cam = { cx: vw / 2, cy: vh / 2, d, ox: ox || vw / 2, oy: oy || vh / 2 };
      const solved = solvePlacement(quad, screenW, screenH, cam, PHONE_QUAD.tilt);
      pose = solved.pose;
      poseRms = solved.rms;

      /* The slide, by formula. Desktop: the frame splits at the middle,
         copy left, phone right; the phone goes to its column's centre and
         shrinks only if the column is narrower than it. Phone: the copy
         sits at the bottom at its own measured height; the phone takes
         what is left above it, centred there. */
      if (isPhone()) {
        /* The band the phone rests in: below the nav, above the copy,
           with WALL.rest.phoneCopyGap reserved as clear air between the
           handset and the title — the one dial for how big it reads
           (Nahian, 2026-09-20). The phone is centred in that band and
           scaled to fit it. */
        const copyH = copy?.offsetHeight ?? 0;
        const gap = resolvePx(WALL.rest.phoneCopyGap, 64);
        const top = navH + gutter;
        /* the copy sits at --search-space, not the gutter, so it clears
           the dock in the corner (Services.astro) */
        const copyBottom = resolvePx('var(--search-space)', 140);
        const bottom = vh - copyBottom - copyH - gap;
        const avail = Math.max(0, bottom - top);
        const s = Math.min(1, avail / screenH, (vw - 2 * gutter) / screenW);
        slide = { dx: 0, dy: (top + bottom) / 2 - vh / 2, s };
      } else {
        /* The phone belongs to the right: the centre of the right column,
           centred in the space below the nav, no taller than it. Copy and
           phone are then gathered toward each other by ONE amount,
           --svc-gather (the copy's CSS reads the same token), so the
           distance shrinks slightly without either leaving its side
           (Nahian, 2026-09-20). */
        const colL = vw / 2 + gap / 2;
        const colR = vw - gutter;
        const gather = resolvePx('var(--svc-gather)', 0);
        const s = Math.min(1, (colR - colL) / screenW, (vh - navH - gutter) / screenH);
        slide = { dx: (colL + colR) / 2 - gather - vw / 2, dy: navH / 2, s };
      }
    }
  }

  /* ---- alive: the idle sway and the tilt under the pointer ------------
     Both in CSS rotation conventions, both scaled by how far the slide
     has come, so the emergence stays exact. One state, followed each
     tick; nothing runs while the section is off screen. */
  const nudge = { x: 0, y: 0 };
  const nudgeTarget = { x: 0, y: 0 };
  let t0 = performance.now();
  function liveAt(p: number, now: number): Live {
    const l = cubicInOut(ramp(p, WALL.restEnd, WALL.slideEnd));
    const a = WALL.alive;
    const t = (now - t0) / 1000;
    const swayY = a.swayY * Math.sin((2 * Math.PI * t) / a.periods[0]);
    const swayX = a.swayX * Math.sin((2 * Math.PI * t) / a.periods[1]);
    const bob = a.bob * Math.sin((2 * Math.PI * t) / a.periods[2]);
    return {
      dx: slide.dx * l,
      dy: slide.dy * l + bob * l,
      s: 1 + (slide.s - 1) * l,
      rx: (swayX + nudge.x) * DEG * l,
      ry: (swayY + nudge.y) * DEG * l,
    };
  }
  /* Pointer position as a fraction of the frame — no layout read: the
     pinned frame fills the viewport. Cursor right: the right side comes
     toward you (a negative rotateY); cursor up: the top does. */
  pin.addEventListener(
    'pointermove',
    (ev) => {
      const nx = (ev.clientX / (window.innerWidth || 1) - 0.5) * 2;
      const ny = (ev.clientY / (window.innerHeight || 1) - 0.5) * 2;
      nudgeTarget.y = -nx * WALL.alive.nudgeY;
      nudgeTarget.x = ny * WALL.alive.nudgeX;
    },
    { passive: true },
  );
  pin.addEventListener('pointerleave', () => {
    nudgeTarget.x = 0;
    nudgeTarget.y = 0;
  });

  /* ---- the emergence and the slide: the screen ---- */
  function poseAt(u: number): string {
    const q = pose;
    return (
      `translate3d(${(q.tx * u).toFixed(2)}px, ${(q.ty * u).toFixed(2)}px, ${(q.tz * u).toFixed(2)}px) ` +
      `rotateZ(${(q.rz * u).toFixed(5)}rad) rotateY(${(q.ry * u).toFixed(5)}rad) rotateX(${(q.rx * u).toFixed(5)}rad)`
    );
  }
  /* After the emergence: the slide, the lean and the life, one transform.
     The lean turns the panel about its BOTTOM edge — CSS turns about the
     centre, so the centre is carried back by what the turn moved the
     bottom edge: up (1 − cos t)·h/2 and in sin t·h/2. */
  function restAt(p: number, now: number): string {
    const L = liveAt(p, now);
    const l = cubicInOut(ramp(p, WALL.restEnd, WALL.slideEnd));
    const t = WALL.rest.leanDeg * DEG * l + L.rx;
    const h = screenH / 2;
    return (
      `translate3d(${L.dx.toFixed(2)}px, ${L.dy.toFixed(2)}px, 0) scale(${L.s.toFixed(4)}) ` +
      `translate3d(0, ${(h * (1 - Math.cos(t))).toFixed(2)}px, ${(-h * Math.sin(t)).toFixed(2)}px) ` +
      `rotateX(${t.toFixed(5)}rad) rotateY(${L.ry.toFixed(5)}rad)`
    );
  }
  function renderPhone(p: number, now: number) {
    const raw = (p - WALL.arriveHoldEnd) / (WALL.emergeEnd - WALL.arriveHoldEnd);
    const e = cubicInOut(Math.min(Math.max(raw, 0), 1));
    const live = p > WALL.arriveHoldEnd;
    if (device) {
      device.style.opacity = live ? ramp(e, 0, WALL.deviceFadeIn).toFixed(3) : '0';
      device.style.transform = p <= WALL.emergeEnd ? poseAt(1 - e) : restAt(p, now);
    }
    /* The wall — the hand with it — tips back as ONE plane, hinged at its
       bottom edge, and recedes as the phone lifts out; the ground turns
       white beneath, and the nav goes solid over it. */
    if (wallEl) {
      wallEl.style.transform =
        e > 0
          ? `translate3d(0, ${(6 * e).toFixed(2)}%, ${(-950 * e).toFixed(0)}px) rotateX(${(64 * e).toFixed(2)}deg)`
          : '';
      wallEl.style.opacity = (1 - ramp(e, WALL.wallFade[0], WALL.wallFade[1])).toFixed(3);
    }
    if (ground) ground.style.opacity = e.toFixed(3);
    if (marker) marker.hidden = e > 0.5;
    /* The copy rises in with the slide and is live once it is there. */
    if (copy) {
      const l = cubicInOut(ramp(p, WALL.restEnd, WALL.slideEnd));
      copy.style.opacity = ramp(l, 0.3, 1).toFixed(3);
      copy.style.transform = `translate3d(0, ${((1 - l) * 24).toFixed(1)}px, 0)`;
      copy.classList.toggle('is-on', l > 0.5);
    }
  }

  /* ---- the wall: three rates, one transform each ------------------ */
  function renderWall(p: number) {
    const w = Math.min(Math.max(p / WALL.wallEnd, 0), 1);
    for (const c of cols) {
      const y = -(c.rate / fastRate) * D * w;
      c.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    }
  }

  const proxy = { p: 0 };
  const render = () => {
    renderWall(proxy.p);
    renderPhone(proxy.p, performance.now());
  };
  const remeasure = () => {
    measure();
    render();
  };
  measure();
  render();
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);

  /* Reduced motion: the wall with the phone tile at centre, the copy in
     flow beneath. No travel, no object. */
  if (reducedMotion()) {
    section.classList.add('svc--static');
    proxy.p = WALL.wallEnd;
    remeasure();
    if (copy) {
      copy.style.opacity = '1';
      copy.style.transform = '';
      copy.classList.add('is-on');
    }
    return;
  }

  const tl = gsap
    .timeline({ paused: true })
    .to(proxy, { p: 1, duration: 1, ease: 'none', onUpdate: render });

  /* The life: one render per tick while the section is pinned, the screen
     is out, and the tab is visible. The nudge follows its target here. */
  let ticking = false;
  const tick = () => {
    if (proxy.p < WALL.emergeEnd) return;
    nudge.x += (nudgeTarget.x - nudge.x) * WALL.alive.follow;
    nudge.y += (nudgeTarget.y - nudge.y) * WALL.alive.follow;
    renderPhone(proxy.p, performance.now());
  };
  const setTicking = (on: boolean) => {
    if (on === ticking) return;
    ticking = on;
    if (on) {
      t0 = performance.now() - ((performance.now() - t0) % 1e6);
      gsap.ticker.add(tick);
    } else gsap.ticker.remove(tick);
  };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) setTicking(false);
    else if (st.isActive) setTicking(true);
  });

  const st = ScrollTrigger.create({
    id: 'services',
    trigger: section,
    start: 'top top',
    end: 'bottom bottom',
    pin,
    pinSpacing: false,
    animation: tl,
    scrub: WALL.scrub,
    onRefreshInit: measure,
    onRefresh: render,
    onToggle: (self) => setTicking(self.isActive && !document.hidden),
  });

  if (import.meta.env.DEV) {
    const w = window as any;
    w.__bkash = w.__bkash ?? {};
    w.__bkash.services = {
      config: WALL,
      geometry: () => ({
        vw,
        vh,
        D,
        fastRate,
        pose,
        poseRms,
        cam,
        slide,
        rest: { restW, restH, screenW, screenH },
        ticking,
        cols: cols.map((c) => ({ rate: c.rate, h: c.el.scrollHeight })),
      }),
      settle() {
        tl.progress(st.progress);
        render();
        return { progress: st.progress };
      },
      /* Where the CSS device's corners actually render, via four point-sized
         children under the live transform — to check the solve against
         the browser's own projection. */
      corners() {
        if (!device) return [];
        const pts: number[] = [];
        for (const [l, t] of [
          [0, 0],
          [100, 0],
          [100, 100],
          [0, 100],
        ]) {
          const m = document.createElement('i');
          m.style.cssText = `position:absolute;left:${l}%;top:${t}%;width:0;height:0;`;
          device.appendChild(m);
          const r = m.getBoundingClientRect();
          const pr = pin.getBoundingClientRect();
          pts.push(r.left - pr.left, r.top - pr.top);
          m.remove();
        }
        return pts;
      },
      nudge: (x: number, y: number) => {
        nudgeTarget.x = x;
        nudgeTarget.y = y;
        nudge.x = x;
        nudge.y = y;
        render();
      },
      goTo(p: number) {
        window.scrollTo(0, st.start + (st.end - st.start) * p);
        ScrollTrigger.update();
        return this.settle();
      },
    };
  }
}
