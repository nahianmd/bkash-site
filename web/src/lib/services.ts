/* ============================================================
   bKash — a thousand more stories → the phone → sixteen services
   specs/sections/services.md · specs/services/plan.md

   Task 1: data and the wall's configuration. The scrub arrives in
   task 2. Everything per-section lives here as one object each.
   ============================================================ */

import { gsap, ScrollTrigger, reducedMotion, isPhone } from './scroll';
import { cubicInOut } from './scene-rig';

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
  rows: [0.2631, 0.4026, 0.542, 0.6814],
  aspect: 360 / 760,
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
  /* The phone tile's width as a fraction of its column, so it is
     SMALLER than Rest B and grows into it. */
  phoneTileFrac: { desktop: 0.6, phone: 0.75 },
  /* Rest B: the device's height as a fraction of --vh (desktop), or its
     width as a fraction of the viewport (phone). */
  rest: { desktopHeightFrac: 0.9, phoneWidthFrac: 0.92 },
};

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

export function initServices() {
  const section = document.querySelector<HTMLElement>('[data-services]');
  const pinEl = section?.querySelector<HTMLElement>('[data-services-pin]');
  if (!section || !pinEl) return;
  const pin: HTMLElement = pinEl;

  /* One pin, the travel from config, one source. */
  section.style.setProperty('--svc-screens', String(1 + WALL.travelScreens));

  const device = section.querySelector<HTMLElement>('[data-device]');
  const bezel = section.querySelector<HTMLElement>('[data-device-bezel]');
  const notch = section.querySelector<HTMLElement>('[data-device-notch]');

  let vw = 1;
  let vh = 1;
  let cols: Col[] = [];
  let fastRate = 1;
  let wallEl: HTMLElement | null = null;
  let tileEl: HTMLElement | null = null;
  /* The emergence, solved once per resize: the device at Rest B, and the
     scale/offset that lay it exactly over the tile at arrival. dy is zero
     by construction — D put the tile's centre at the viewport centre. */
  let emerge = { k0: 1, dx: 0, dy: 0 };
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
    tileEl = tile;
    /* The columns carry will-change: transform, which makes each one an
       offsetParent — so the tile's offsets are column-relative and the
       column's are wall-relative. Both are added. The wall's top-left is
       the pin's. One layout read per resize. */
    const col = tile.parentElement as HTMLElement;
    const tileW = tile.offsetWidth;
    const tileH = tile.offsetHeight;
    const tileTop = col.offsetTop + tile.offsetTop;
    const tileLeft = col.offsetLeft + tile.offsetLeft;
    D = tileTop + tileH / 2 - vh / 2;

    /* Rest B by formula, then the device sized and centred once. */
    if (device) {
      const restH = isPhone()
        ? (WALL.rest.phoneWidthFrac * vw) / SCREEN.aspect
        : WALL.rest.desktopHeightFrac * vh;
      const restW = restH * SCREEN.aspect;
      device.style.width = `${restW.toFixed(1)}px`;
      device.style.height = `${restH.toFixed(1)}px`;
      device.style.left = `${((vw - restW) / 2).toFixed(1)}px`;
      device.style.top = `${((vh - restH) / 2).toFixed(1)}px`;
      const k0 = tileW / restW;
      /* The tile's corners are --r-lg; scaled by k0 the device must show the
         same, so its resting radius is the tile's divided by k0. */
      const r = parseFloat(getComputedStyle(tile).borderRadius) || 22;
      device.style.borderRadius = `${(r / k0).toFixed(1)}px`;
      device.style.setProperty('--bezel', `${(restW * 0.028).toFixed(1)}px`);
      emerge = { k0, dx: tileLeft + tileW / 2 - vw / 2, dy: 0 };
    }
  }

  /* ---- the emergence: one transform on the device, one on the wall ---- */
  function renderEmergence(p: number) {
    const raw = (p - WALL.arriveHoldEnd) / (WALL.emergeEnd - WALL.arriveHoldEnd);
    const e = cubicInOut(Math.min(Math.max(raw, 0), 1));
    const live = p > WALL.arriveHoldEnd;
    if (tileEl) tileEl.style.opacity = live ? '0' : '';
    if (device) {
      device.style.opacity = live ? '1' : '0';
      const k = emerge.k0 + (1 - emerge.k0) * e;
      const dx = emerge.dx * (1 - e);
      const dy = emerge.dy * (1 - e);
      device.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${k.toFixed(4)})`;
    }
    if (bezel) bezel.style.opacity = e.toFixed(3);
    if (notch) notch.style.opacity = Math.min(1, Math.max(0, (e - 0.5) / 0.5)).toFixed(3);
    /* The wall tips back as ONE plane, hinged at its bottom edge, and
       recedes — the approved move. Reaches zero opacity as the tilt completes. */
    if (wallEl) {
      wallEl.style.transform =
        e > 0
          ? `translate3d(0, ${(6 * e).toFixed(2)}%, ${(-950 * e).toFixed(0)}px) rotateX(${(64 * e).toFixed(2)}deg)`
          : '';
      wallEl.style.opacity = (1 - Math.min(1, Math.max(0, (e - 0.34) / 0.66))).toFixed(3);
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
    renderEmergence(proxy.p);
  };
  const remeasure = () => {
    measure();
    render();
  };
  measure();
  render();
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);

  /* Reduced motion: the wall with the phone tile at centre, no travel. */
  if (reducedMotion()) {
    section.classList.add('svc--static');
    proxy.p = WALL.wallEnd;
    remeasure();
    return;
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
        emerge,
        cols: cols.map((c) => ({ rate: c.rate, h: c.el.scrollHeight })),
      }),
      settle() {
        tl.progress(st.progress);
        render();
        return { progress: st.progress };
      },
      goTo(p: number) {
        window.scrollTo(0, st.start + (st.end - st.start) * p);
        ScrollTrigger.update();
        return this.settle();
      },
    };
  }
}
