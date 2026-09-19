/* ============================================================
   bKash — a thousand more stories → the phone → sixteen services
   specs/sections/services.md · specs/services/plan.md

   Task 1: data and the wall's configuration. The scrub arrives in
   task 2. Everything per-section lives here as one object each.
   ============================================================ */

import { gsap, ScrollTrigger, reducedMotion, isPhone } from './scroll';
import { cubicInOut } from './scene-rig';
import { MODEL, POSE_ZERO, solvePose, type Camera, type Pose } from './device';
import type { Phone3D } from './phone3d';

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
  wallEnd: 0.4,
  arriveHoldEnd: 0.5,
  emergeEnd: 0.65,
  restEnd: 0.7,
  zoomEnd: 0.9,
  travelScreens: 5.5,
  scrub: 0.6,
  /* Rest B: the device's height as a fraction of --vh (desktop), or its
     width as a fraction of the viewport (phone). */
  rest: { desktopHeightFrac: 0.9, phoneWidthFrac: 0.92 },
  /* Over the first part of the emergence the device fades in over the
     photographed screen it is posed on; the wall (hand included) fades
     as the phone lifts out of it. Fractions of the emergence. */
  deviceFadeIn: 0.2,
  wallFade: [0.05, 0.55],
};

/* ---- the photographed phone -------------------------------------
   `phone.jpg` (2250×3000): a handset held at a slight turn, the home
   screen up. The four corners of its SCREEN as fractions of the
   photograph — fitted from the pixels (tools: the screen edges as
   lines, intersected), not placed by eye. The tile shows the whole
   photograph at its own aspect, so these are the tile's fractions too.
   The device is posed in 3D so its corners land on these; the pose is
   SOLVED per viewport (see solvePose), then interpolated to identity —
   the phone stands up and comes forward out of the hand. */
export const PHONE_PHOTO = { w: 2250, h: 3000 };
export const PHONE_QUAD = {
  tl: [0.3831, 0.2038],
  tr: [0.7092, 0.2022],
  br: [0.6597, 0.7432],
  bl: [0.3362, 0.7365],
} as const;


/* Per-photograph crops: the subject decides where the frame sits. */
const P = (photo: string, crop: Crop, pos: string): WallTile => ({
  kind: 'photo',
  photo,
  crop,
  pos,
});

/* Columns top→bottom. Ten photographs repeated at different crops —
   PLACEHOLDER density until the client's twenty arrive. The phone tile
   rides the fastest column, with tiles after it so the column never runs
   out beneath it at arrival. */
export const COLUMNS: { desktop: WallTile[][]; phone: WallTile[][] } = {
  desktop: [
    [
      P('boatman', 'wide', '50% 50%'),
      P('agent', 'tall', '40% 50%'),
      P('sendmoney', 'square', '35% 50%'),
      P('train', 'wide', '55% 45%'),
      P('banner', 'tall', '50% 50%'),
      P('shajib', 'wide', '55% 50%'),
      P('merchant', 'tall', '60% 50%'),
      P('munni', 'square', '50% 40%'),
      P('ferry', 'wide', '45% 40%'),
    ],
    [
      { kind: 'title' },
      P('anisul', 'tall', '50% 35%'),
      P('ferry', 'wide', '45% 40%'),
      P('merchant', 'square', '60% 50%'),
      P('munni', 'tall', '50% 30%'),
      P('boatman', 'square', '50% 45%'),
      P('agent', 'wide', '40% 50%'),
      P('train', 'tall', '60% 40%'),
      P('sendmoney', 'wide', '35% 50%'),
    ],
    [
      P('train', 'tall', '60% 40%'),
      P('shajib', 'square', '55% 50%'),
      P('agent', 'wide', '40% 50%'),
      P('merchant', 'tall', '60% 50%'),
      P('banner', 'wide', '50% 50%'),
      P('anisul', 'square', '50% 35%'),
      P('boatman', 'tall', '50% 45%'),
      { kind: 'phone' },
      P('munni', 'wide', '50% 40%'),
      P('ferry', 'square', '45% 40%'),
    ],
    [
      P('ferry', 'tall', '45% 40%'),
      P('banner', 'wide', '50% 50%'),
      P('munni', 'square', '50% 40%'),
      P('sendmoney', 'tall', '35% 50%'),
      P('anisul', 'wide', '50% 35%'),
      P('boatman', 'square', '50% 45%'),
      P('shajib', 'tall', '55% 40%'),
      P('train', 'square', '60% 40%'),
      P('agent', 'tall', '40% 50%'),
    ],
  ],
  phone: [
    [
      P('boatman', 'wide', '50% 50%'),
      { kind: 'title' },
      P('agent', 'tall', '40% 50%'),
      P('train', 'square', '60% 40%'),
      P('merchant', 'wide', '60% 50%'),
      P('munni', 'tall', '50% 30%'),
      P('ferry', 'square', '45% 40%'),
      P('sendmoney', 'wide', '35% 50%'),
      P('anisul', 'tall', '50% 35%'),
      P('banner', 'square', '50% 50%'),
    ],
    [
      P('anisul', 'tall', '50% 35%'),
      P('sendmoney', 'square', '35% 50%'),
      P('ferry', 'wide', '45% 40%'),
      P('shajib', 'tall', '55% 40%'),
      P('banner', 'square', '50% 50%'),
      P('boatman', 'tall', '50% 45%'),
      { kind: 'phone' },
      P('merchant', 'square', '60% 50%'),
      P('train', 'wide', '55% 45%'),
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

export function initServices() {
  const section = document.querySelector<HTMLElement>('[data-services]');
  const pinEl = section?.querySelector<HTMLElement>('[data-services-pin]');
  if (!section || !pinEl) return;
  const pin: HTMLElement = pinEl;

  /* One pin, the travel from config, one source. */
  section.style.setProperty('--svc-screens', String(1 + WALL.travelScreens));

  const device = section.querySelector<HTMLElement>('[data-device]');
  const canvas = section.querySelector<HTMLCanvasElement>('[data-device-3d]');
  /* The phone as an object: loaded as the section approaches; null until
     then, and null for good if WebGL or the model fails — the CSS device
     is the fallback, and always the device from Rest B on. */
  let phone3d: Phone3D | null = null;

  let vw = 1;
  let vh = 1;
  let cols: Col[] = [];
  let fastRate = 1;
  let wallEl: HTMLElement | null = null;
  /* The emergence, solved once per resize: the pose that lays the device
     over the photographed screen at arrival, and how well it fits. */
  let pose: Pose = POSE_ZERO;
  let poseRms = 0;
  const ground = section.querySelector<HTMLElement>('[data-ground]');
  const grid = section.querySelector<HTMLElement>('[data-grid]');
  const gridIn = section.querySelector<HTMLElement>('[data-grid-in]');
  const marker = section.querySelector<HTMLElement>('[data-svc-marker]');
  /* The zoom's end, solved once per resize from the real grid: the scale
     and translate that put the screenshot's icon lattice under the cells. */
  let zoom = { s: 1, dy: 0 };
  /* Rest B: the body, and the display inside it — both from the model's
     proportions, so the WebGL handset coincides with the CSS device. */
  let restW = 1;
  let restH = 1;
  let screenW = 1;
  let screenH = 1;
  let cam: Camera = { cx: 0, cy: 0, d: 1500, ox: 0, oy: 0 };
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

    /* Rest B by formula — the body's height on desktop, its width on a
       phone — then the CSS device sized and centred once, its display,
       corners and island set from the handset's proportions. */
    if (device) {
      const B = MODEL.body;
      const Dp = MODEL.display;
      restH = isPhone() ? (WALL.rest.phoneWidthFrac * vw * B.h) / B.w : WALL.rest.desktopHeightFrac * vh;
      restW = (restH * B.w) / B.h;
      screenW = (restW * Dp.w) / B.w;
      screenH = (restH * Dp.h) / B.h;
      device.style.width = `${restW.toFixed(1)}px`;
      device.style.height = `${restH.toFixed(1)}px`;
      device.style.left = `${((vw - restW) / 2).toFixed(1)}px`;
      device.style.top = `${((vh - restH) / 2).toFixed(1)}px`;
      device.style.borderRadius = `${((restW * B.r) / B.w).toFixed(1)}px`;
      const set = (k: string, px: number) => device.style.setProperty(k, `${px.toFixed(1)}px`);
      set('--screen-inset-x', (restW - screenW) / 2);
      set('--screen-inset-y', (restH - screenH) / 2);
      set('--screen-r', (screenW * Dp.r) / Dp.w);
      set('--island-w', (screenW * MODEL.island.w) / Dp.w);
      set('--island-h', (screenH * MODEL.island.h) / Dp.h);
      set('--island-top', (restH - screenH) / 2 + (screenH * MODEL.island.top) / Dp.h);
      /* The pin's camera, read, not assumed. The pose is solved for the
         DISPLAY — the photographed corners are the screen's — about the
         device's centre, which is the display's. */
      const cs = getComputedStyle(pin);
      const d = parseFloat(cs.perspective) || 1500;
      const [ox, oy] = cs.perspectiveOrigin.split(' ').map(parseFloat);
      cam = { cx: vw / 2, cy: vh / 2, d, ox: ox || vw / 2, oy: oy || vh / 2 };
      const solved = solvePose(quad, screenW, screenH, cam);
      pose = solved.pose;
      poseRms = solved.rms;
      phone3d?.setCamera(vw, vh, cam, screenW);
    }

    /* The real grid, by formula: as wide as the cap allows and no taller
       than the frame — whichever binds. Column pitch P; row pitch
       P × SCREEN.pitchRatio so the lattice matches the screenshot's. */
    if (gridIn) {
      /* Tokens resolved to px through a probe: a custom property's computed
         value is its raw text ("4.5rem", "clamp(...)"), and parseFloat of
         that read --nav-h as 4.5px and --gutter as nothing. */
      const gutter = resolvePx('var(--gutter)', 32);
      const navH = resolvePx('var(--nav-h)', 72);
      const capW = Math.min(vw - 2 * gutter, 56 * 16);
      const capH = vh - navH - 2 * gutter;
      const P = Math.min(capW / 4, capH / (4 * SCREEN.pitchRatio));
      gridIn.style.setProperty('--grid-w', `${(P * 4).toFixed(1)}px`);
      gridIn.style.setProperty('--col', `${P.toFixed(1)}px`);
      gridIn.style.setProperty('--row', `${(P * SCREEN.pitchRatio).toFixed(1)}px`);
      /* Zoom end relative to Rest B: the screenshot's column pitch is
         0.25 × the screen width; the lattice centre sits (mean row) above
         the screen's centre. The grid is centred in the frame, so dx = 0. */
      const sEnd = P / (0.25 * screenW);
      const meanRow = SCREEN.rows.reduce((a, b) => a + b, 0) / SCREEN.rows.length;
      /* Where the grid's lattice centre actually sits — measured, so the
         zoom follows the grid's own centring (below the nav) rather than
         assuming the frame's centre. */
      const gi = gridIn.getBoundingClientRect();
      const pi = pin.getBoundingClientRect();
      const gridCy = gi.top + gi.height / 2 - pi.top;
      zoom = { s: sEnd, dy: gridCy - vh / 2 - (meanRow - 0.5) * screenH * sEnd };
      /* The detail layout, by formula: the frame splits at the middle —
         stage left, grid right — and the grid scales to FIT its column,
         never past 1. One transform on the grid; the cells keep layout. */
      const gap = resolvePx('var(--s-6)', 32);
      const colL = vw / 2 + gap / 2;
      const colR = vw - gutter;
      const detailS = Math.min(1, (colR - colL) / (P * 4), capH / (P * 4 * SCREEN.pitchRatio));
      gridIn.style.setProperty('--detail-s', detailS.toFixed(4));
      gridIn.style.setProperty('--detail-dx', `${((colL + colR) / 2 - vw / 2).toFixed(1)}px`);
    }
  }

  /* ---- the emergence: one transform on the device, one on the wall ----
     The device starts at the solved pose — on the photographed screen, in
     the hand — fades in over it, then the pose interpolates to identity:
     it stands up, turns to face the viewer and comes forward to Rest B.
     Six numbers scaled by (1 − e); one transform per frame. */
  const ramp = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));
  function poseAt(u: number): string {
    const q = pose;
    return (
      `translate3d(${(q.tx * u).toFixed(2)}px, ${(q.ty * u).toFixed(2)}px, ${(q.tz * u).toFixed(2)}px) ` +
      `rotateZ(${(q.rz * u).toFixed(5)}rad) rotateY(${(q.ry * u).toFixed(5)}rad) rotateX(${(q.rx * u).toFixed(5)}rad)`
    );
  }
  function renderEmergence(p: number) {
    const raw = (p - WALL.arriveHoldEnd) / (WALL.emergeEnd - WALL.arriveHoldEnd);
    const e = cubicInOut(Math.min(Math.max(raw, 0), 1));
    const live = p > WALL.arriveHoldEnd;
    /* The object carries the emergence and the hold; the CSS device takes
       over at restEnd for the zoom, where the two coincide. Without WebGL
       the CSS device does all of it. */
    const use3d = phone3d !== null && p < WALL.restEnd;
    const fade = live ? ramp(e, 0, WALL.deviceFadeIn).toFixed(3) : '0';
    if (canvas) canvas.style.opacity = use3d ? fade : '0';
    if (use3d && phone3d) {
      phone3d.setPose(pose, 1 - e);
      if (live) phone3d.render();
    }
    if (device && p <= WALL.restEnd) {
      device.style.opacity = use3d ? '0' : fade;
      device.style.transform = poseAt(1 - e);
    }
    /* The wall — the hand with it — tips back as ONE plane, hinged at its
       bottom edge, and recedes as the phone lifts out. */
    if (wallEl) {
      wallEl.style.transform =
        e > 0
          ? `translate3d(0, ${(6 * e).toFixed(2)}%, ${(-950 * e).toFixed(0)}px) rotateX(${(64 * e).toFixed(2)}deg)`
          : '';
      wallEl.style.opacity = (1 - ramp(e, WALL.wallFade[0], WALL.wallFade[1])).toFixed(3);
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

  /* ---- selection: one flip for any pair ----------------------------- */
  const flip = section.querySelector<HTMLElement>('[data-card-flip]');
  const faces = [...section.querySelectorAll<HTMLImageElement>('[data-face-icon]')];
  const titleEl = section.querySelector<HTMLElement>('[data-stage-title]');
  const lineEl = section.querySelector<HTMLElement>('[data-stage-line]');
  const copyEl = section.querySelector<HTMLElement>('[data-stage-copy]');
  const cells = [...section.querySelectorAll<HTMLButtonElement>('[data-cell]')];
  const iconSrc = (i: number) => cells[i]?.querySelector('img')?.getAttribute('src') ?? '';

  let selected = -1;
  let flipped = false;
  let autoTimer: number | null = null;
  let copyTimer: number | null = null;

  function select(i: number, animate = true) {
    if (i === selected || !SERVICES[i]) return;
    const first = selected < 0;
    selected = i;
    cells.forEach((c, k) => c.classList.toggle('is-on', k === i));
    /* Put the new icon on the hidden face, then turn the card over. The
       first selection just shows the front. */
    const hidden = flipped ? 0 : 1;
    if (first) {
      faces.forEach((f) => (f.src = iconSrc(i)));
    } else {
      faces[hidden].src = iconSrc(i);
      flipped = !flipped;
      flip?.classList.toggle('is-flipped', flipped);
    }
    const write = () => {
      if (titleEl) titleEl.textContent = SERVICES[i].name;
      if (lineEl) lineEl.textContent = SERVICES[i].line;
      if (copyEl) copyEl.style.opacity = '1';
    };
    if (first || !animate) write();
    else {
      if (copyEl) copyEl.style.opacity = '0';
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = window.setTimeout(write, 260);
    }
    section!.classList.add('is-detail');
    /* On a phone the strip centres the chosen one. */
    if (isPhone())
      cells[i].scrollIntoView({
        inline: 'center',
        block: 'nearest',
        behavior: animate ? 'smooth' : 'auto',
      });
  }

  cells.forEach((c, i) => c.addEventListener('click', () => select(i)));
  /* Swiping the strip picks the item nearest its centre. */
  if (gridIn) {
    let t: number | null = null;
    gridIn.addEventListener(
      'scroll',
      () => {
        if (!isPhone() || !section!.classList.contains('is-detail')) return;
        if (t) clearTimeout(t);
        t = window.setTimeout(() => {
          const mid = gridIn.getBoundingClientRect().left + gridIn.clientWidth / 2;
          let best = 0;
          let bd = Infinity;
          cells.forEach((c, k) => {
            const r = c.getBoundingClientRect();
            const d = Math.abs(r.left + r.width / 2 - mid);
            if (d < bd) {
              bd = d;
              best = k;
            }
          });
          select(best);
        }, 120);
      },
      { passive: true },
    );
  }

  /* The detail layout applies only once the grid has landed; scrubbing
     back through the zoom returns the full grid, the selection kept. */
  function renderState(p: number) {
    const landed = p >= WALL.zoomEnd - 1e-6;
    if (landed && selected < 0 && autoTimer === null) {
      autoTimer = window.setTimeout(() => select(0), 500);
    }
    section!.classList.toggle('is-detail', landed && selected >= 0);
  }

  const proxy = { p: 0 };
  /* ---- the zoom to the grid --------------------------------------
     0.70 → 0.90 the device scales (log space) to the solved end and
     drifts by dy so the icon lattice lands under the cells; over the last
     quarter the cells fade up and the screenshot — with the device — fades
     out over white. */
  function renderZoom(p: number) {
    if (!device) return;
    const raw = (p - WALL.restEnd) / (WALL.zoomEnd - WALL.restEnd);
    const z = cubicInOut(Math.min(Math.max(raw, 0), 1));
    if (p > WALL.restEnd) {
      const k = Math.exp(Math.log(zoom.s) * z);
      const dy = zoom.dy * z;
      device.style.transform = `translate3d(0, ${dy.toFixed(2)}px, 0) scale(${k.toFixed(4)})`;
    }
    const x = Math.min(1, Math.max(0, (raw - 0.75) / 0.25));
    if (p > WALL.restEnd) device.style.opacity = (1 - x).toFixed(3);
    if (ground) ground.style.opacity = x.toFixed(3);
    if (grid) {
      grid.style.opacity = x.toFixed(3);
      grid.style.pointerEvents = x > 0.99 ? 'auto' : 'none';
    }
    if (marker) marker.hidden = x > 0.5;
  }

  const render = () => {
    renderWall(proxy.p);
    renderEmergence(proxy.p);
    renderZoom(proxy.p);
    renderState(proxy.p);
  };
  const remeasure = () => {
    measure();
    render();
  };
  measure();
  render();
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);

  /* Reduced motion: the wall with the phone tile at centre, then the grid
     and the card in flow, first service selected. No travel. */
  if (reducedMotion()) {
    section.classList.add('svc--static');
    proxy.p = WALL.wallEnd;
    remeasure();
    select(0, false);
    section.classList.add('is-detail');
    return;
  }

  /* The phone as an object, loaded as the section comes within a screen:
     three.js and the 305KB model, once, off the hero's path. */
  let loading3d: Promise<void> | null = null;
  function load3d(): Promise<void> {
    if (loading3d) return loading3d;
    const c = canvas;
    if (!c || !c.dataset.model || !c.dataset.screen) return (loading3d = Promise.resolve());
    loading3d = import('./phone3d')
      .then((m) => m.createPhone3D(c, c.dataset.model!, c.dataset.screen!))
      .then((ph) => {
        phone3d = ph;
        ph.setCamera(vw, vh, cam, screenW);
        render();
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.warn('[services] phone3d unavailable', err);
      });
    return loading3d;
  }
  if (canvas) {
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        io.disconnect();
        load3d();
      },
      { rootMargin: '100% 0px' },
    );
    io.observe(section);
  }

  const tl = gsap
    .timeline({ paused: true })
    .to(proxy, { p: 1, duration: 1, ease: 'none', onUpdate: render });

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
        zoom,
        rest: { restW, restH, screenW, screenH },
        phone3d: phone3d !== null,
        bounds3d: phone3d?.bounds(),
        cols: cols.map((c) => ({ rate: c.rate, h: c.el.scrollHeight })),
      }),
      settle() {
        tl.progress(st.progress);
        render();
        return { progress: st.progress, selected, flipped };
      },
      select,
      /* Where the device's corners actually render, via four point-sized
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
      /* the WebGL camera's projection of the display's corners */
      corners3d: () => phone3d?.projectDisplayCorners() ?? [],
      load3d,
      goTo(p: number) {
        window.scrollTo(0, st.start + (st.end - st.start) * p);
        ScrollTrigger.update();
        return this.settle();
      },
    };
  }
}
