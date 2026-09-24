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
export const WALL = {
  /* The intro (Nahian, 2026-09-24, after a reference video): on black,
     the heading's words arrive one by one, each easing in from the right
     as it fades up, the line panning so the newest word is near the
     middle; "Motion" comes last, in pink, and the white words dim. Then
     the view zooms into "Motion" and back out, and the whole line
     settles as the section's heading, above the collage. Fractions of
     the section's progress. The stage size is the words' size while
     they arrive, as a fraction of the frame's width (px capped); the
     zoom takes "Motion" to `zoomWidth` of the frame. */
  intro: {
    word0: 0.006,
    wordStep: 0.019,
    wordDur: 0.024,
    zoomIn: [0.13, 0.168],
    zoomOut: [0.178, 0.216],
    dim: 0.4,
    stageFont: { vw: 0.07, max: 72 },
    zoomWidth: 0.6,
  },
  /* The landing (Nahian, 2026-09-24): each tile flies in from the front
     — from `from`× its size, out along the line from the frame's centre
     through its cell, so it comes from the viewer's side — and settles,
     fading in over the first `fade` of its flight. Each flight takes
     `flight` of the section's progress; the flights are spread so the
     first photograph starts at `first`, once the heading has settled,
     and the phone photograph lands exactly at wallEnd. */
  fly: { from: 2.2, fade: 0.35, flight: 0.05, first: 0.226 },
  /* Phases of the section's progress: the intro, the collage, then the
     phone as before — the old phases, rescaled so each keeps its screens
     of travel with the intro's 1.6 in front. */
  wallEnd: 0.6,
  arriveHoldEnd: 0.695,
  emergeEnd: 0.836,
  restEnd: 0.884,
  slideEnd: 0.962,
  travelScreens: 6.1,
  scrub: 0.6,
  /* Rest B: the device's height as a fraction of --vh (desktop), or its
     width as a fraction of the viewport (phone). */
  rest: {
    desktopHeightFrac: 0.9,
    phoneWidthFrac: 0.92,
    /* clear air between the resting handset and the copy on a phone */
    phoneCopyGap: 'var(--s-8)',
    /* The resting pose (Nahian, 2026-09-24): slanted, but only just. A
       small lean back about the BOTTOM edge and a turn that shows the
       slab's left edge — the turn, not the lean, is what reads as 3D.
       Eased in with the slide; the life plays on top of it. */
    leanDeg: 6,
    turnDeg: 12,
    /* a slight roll, counter-clockwise: the top-left tips out to the
       left while the bottom-left stays square to you (Nahian, 2026-09-24) */
    rollDeg: -3,
    /* The rim (Nahian, 2026-09-24, from "bKash Mobile.png"): a light
       bezel between the screen and the pink line, as a fraction of the
       screen's width — 16px on the reference's 600. The same on every
       side, so the screen's centre, which the emergence is solved
       about, does not move. */
    rimFrac: 0.027,
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
/* The phone photograph fills its collage block like every other tile
   (Nahian, 2026-09-24: no white around it), so it is cover-cropped;
   this is its object-position, as fractions. The screen spans 20–74%
   of the photograph's height and the widest block keeps 16–81% at this
   anchor, so the whole screen always shows. Services.astro writes it as
   CSS and measure() solves the quad through the same crop. */
export const PHONE_POS = { x: 0.5, y: 0.45 };
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

/* ---- the mosaic (Nahian, 2026-09-24) ------------------------------
   The Pinterest columns are gone. The photographs land one by one as
   you scroll into a collage that fills the pinned frame edge to edge —
   a mood board, not a grid (the reference was one): pieces of different
   sizes, straight, square-cornered, no border, each running a little
   past its block so it overlaps its neighbours by an uneven amount.
   They land in a random order all over the frame, never row by row; the
   title first, and the phone photograph last, into the centre, where
   the phone then rises out of it.

   The randomness is seeded, so the collage is the same on every visit
   and every build. Grid lines are 1-based. The title is no longer a
   tile — it is the section's heading, above the collage (the intro).
   Desktop 11×6: the phone photograph a 1×2 block at the centre, at its
   natural size (Nahian, 2026-09-24: the 4×4 was too big), the 32
   photographs packed round it in blocks of 1×1, 2×1, 1×2 and 2×2.
   Phone 6×8: the phone 2×2 at the centre, eighteen photographs. */
export type Block = { c: number; r: number; w: number; h: number };
export type Mosaic = {
  cols: number;
  rows: number;
  phone: Block;
  /** the seed for the packing, the landing order and the overlaps */
  seed: number;
  photos: { photo: string; pos: string }[];
};
/** How far a tile runs past its block on each side, in % of the block:
    top, right, bottom, left. */
export type Overlap = [number, number, number, number];
export type MosaicTile = Block & { order: number; over: Overlap } & (
    | { kind: 'phone' }
    | { kind: 'photo'; photo: string; pos: string }
  );

const ph = (photo: string, pos: string) => ({ photo, pos });

export const MOSAIC: { desktop: Mosaic; phone: Mosaic } = {
  desktop: {
    cols: 11,
    rows: 6,
    phone: { c: 6, r: 3, w: 1, h: 2 },
    seed: 20260924,
    photos: [
      ph('riders', '50% 50%'),
      ph('fruit-seller', '50% 40%'),
      ph('station', '60% 50%'),
      ph('boy', '50% 40%'),
      ph('village-shop', '70% 50%'),
      ph('grocer', '50% 40%'),
      ph('school', '50% 55%'),
      ph('anisul', '50% 35%'),
      ph('boatman', '50% 50%'),
      ph('flower-seller', '50% 45%'),
      ph('minar', '65% 50%'),
      ph('fabric', '50% 50%'),
      ph('mangroves', '50% 40%'),
      ph('girls-books', '50% 50%'),
      ph('window-man', '50% 45%'),
      ph('ferry', '45% 40%'),
      ph('munni', '50% 30%'),
      ph('boat', '50% 50%'),
      ph('schoolgirl', '50% 40%'),
      ph('umbrella', '55% 50%'),
      ph('family-agent', '50% 40%'),
      ph('fisherman', '50% 45%'),
      ph('jacket', '50% 40%'),
      ph('agent', '40% 50%'),
      ph('shajib', '55% 50%'),
      ph('friends', '50% 50%'),
      ph('window-mother', '70% 50%'),
      ph('agent-shop', '50% 50%'),
      ph('train', '60% 40%'),
      ph('merchant', '60% 50%'),
      ph('sendmoney', '35% 50%'),
      ph('banner', '50% 50%'),
    ],
  },
  phone: {
    cols: 6,
    rows: 8,
    phone: { c: 3, r: 4, w: 2, h: 2 },
    seed: 20260924,
    photos: [
      ph('riders', '50% 50%'),
      ph('fruit-seller', '50% 40%'),
      ph('boy', '50% 40%'),
      ph('minar', '65% 50%'),
      ph('grocer', '50% 40%'),
      ph('fabric', '50% 50%'),
      ph('girls-books', '50% 50%'),
      ph('mangroves', '50% 40%'),
      ph('school', '50% 55%'),
      ph('flower-seller', '50% 45%'),
      ph('window-man', '50% 45%'),
      ph('boat', '50% 50%'),
      ph('schoolgirl', '50% 40%'),
      ph('family-agent', '50% 40%'),
      ph('jacket', '50% 40%'),
      ph('fisherman', '50% 45%'),
      ph('umbrella', '55% 50%'),
      ph('station', '60% 50%'),
    ],
  },
};

/** mulberry32: a small seeded PRNG, so the collage is reproducible. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SIZES: [number, number][] = [
  [2, 2],
  [2, 1],
  [1, 2],
  [1, 1],
];

/** Pack exactly `n` blocks into the free cells, filling every one: at
    each first-empty cell (row by row) take a random size that fits and
    keeps the count reachable — never fewer cells left than photos, never
    more than four per photo. Null if the dice paint it into a corner. */
function pack(m: Mosaic, n: number, rand: () => number): Block[] | null {
  const taken: boolean[][] = Array.from({ length: m.rows + 1 }, () =>
    new Array(m.cols + 1).fill(false),
  );
  for (const b of [m.phone])
    for (let r = b.r; r < b.r + b.h; r++) for (let c = b.c; c < b.c + b.w; c++) taken[r][c] = true;
  let free = 0;
  for (let r = 1; r <= m.rows; r++) for (let c = 1; c <= m.cols; c++) if (!taken[r][c]) free++;
  const fits = (c: number, r: number, w: number, h: number) => {
    if (c + w - 1 > m.cols || r + h - 1 > m.rows) return false;
    for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) if (taken[y][x]) return false;
    return true;
  };
  const out: Block[] = [];
  for (let r = 1; r <= m.rows; r++)
    for (let c = 1; c <= m.cols; c++) {
      if (taken[r][c]) continue;
      const left = n - out.length;
      if (left <= 0) return null;
      const ok = SIZES.filter(([w, h]) => {
        const s = w * h;
        return fits(c, r, w, h) && free - s >= left - 1 && free - s <= 4 * (left - 1);
      });
      if (ok.length === 0) return null;
      const [w, h] = ok[Math.floor(rand() * ok.length)];
      for (let y = r; y < r + h; y++) for (let x = c; x < c + w; x++) taken[y][x] = true;
      free -= w * h;
      out.push({ c, r, w, h });
    }
  return out.length === n ? out : null;
}

/** The collage as tiles, in landing order: the photographs in a random
    order, the phone last. The photographs take the packed
    blocks in the old wall's order (row by row), so neighbours stay
    neighbours; only when they land is shuffled. Throws if no packing is
    found, so a bad edit fails the build. */
export function mosaicTiles(m: Mosaic): MosaicTile[] {
  const n = m.photos.length;
  let blocks: Block[] | null = null;
  let rand = rng(m.seed);
  for (let s = 0; s < 500 && !blocks; s++) {
    rand = rng(m.seed + s);
    blocks = pack(m, n, rand);
  }
  if (!blocks) throw new Error(`mosaic: no packing of ${n} photographs found`);
  /* uneven overlap, 4–9% of the block on each side */
  const over = (): Overlap => [0, 0, 0, 0].map(() => 4 + Math.round(rand() * 5)) as Overlap;
  /* landing order: a Fisher–Yates shuffle of the photographs */
  const land = blocks.map((_, i) => i);
  for (let i = land.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [land[i], land[j]] = [land[j], land[i]];
  }
  const photos: MosaicTile[] = blocks.map((b, i) => ({
    kind: 'photo',
    ...b,
    ...m.photos[i],
    order: land.indexOf(i),
    over: over(),
  }));
  photos.sort((a, b) => a.order - b.order);
  return [
    ...photos,
    { kind: 'phone', ...m.phone, order: n, over: [0, 0, 0, 0] },
  ];
}

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
  const introBox = section.querySelector<HTMLElement>('[data-intro]');
  const introLine = section.querySelector<HTMLElement>('[data-intro-line]');
  const words = [...section.querySelectorAll<HTMLElement>('[data-word]')];

  /* ---- the intro: measured once per resize ------------------------
     Every state is the line under ONE transform, found from a focus
     point in the line (f), a scale (s) and where on screen the focus
     should sit (P): translate = P − L − s·f, origin top-left, L being
     the line's laid-out position in the pin.

     Crisp type: the line is LAID OUT at its biggest — the size at which
     "Motion" fills the zoom — and every state is a scale DOWN from there,
     the resting heading included. Scaling text up enlarges a bitmap and
     blurs it (Nahian, 2026-09-24: "the resolution of the copy is bad");
     scaling down stays sharp. CSS sets the heading size, for no JS. */
  const intro = {
    L: { x: 0, y: 0 },
    w: 0,
    h: 0,
    centres: [] as number[],
    stage: { x: 0, y: 0 },
    rest: { x: 0, y: 0 },
    sStage: 1,
    sRest: 1,
    last: [] as string[],
  };
  function measureIntro() {
    if (!introBox || !introLine || words.length === 0) return;
    const I = WALL.intro;
    const key = words[words.length - 1];
    /* at the heading's own size first: how big the zoom must be */
    introLine.style.fontSize = '';
    const fsRest = parseFloat(getComputedStyle(introLine).fontSize) || 40;
    const k = (I.zoomWidth * vw) / Math.max(1, key.offsetWidth);
    /* then lay the line out at that size, and measure it there */
    introLine.style.fontSize = `${(fsRest * k).toFixed(2)}px`;
    intro.L = {
      x: introBox.offsetLeft + introLine.offsetLeft,
      y: introBox.offsetTop + introLine.offsetTop,
    };
    intro.w = introLine.offsetWidth;
    intro.h = introLine.offsetHeight;
    intro.centres = words.map((w) => w.offsetLeft + w.offsetWidth / 2);
    const navH = resolvePx('var(--nav-h)', 72);
    intro.stage = { x: vw / 2, y: (navH + vh) / 2 };
    intro.rest = {
      x: introBox.offsetLeft + introBox.offsetWidth / 2,
      y: introBox.offsetTop + introBox.offsetHeight / 2,
    };
    /* scales relative to the laid-out size: the zoom is 1 */
    intro.sRest = 1 / k;
    intro.sStage = Math.min(I.stageFont.max, vw * I.stageFont.vw) / (fsRest * k);
    intro.last = words.map(() => '');
    introDone = '';
  }

  let vw = 1;
  let vh = 1;
  /* The mosaic's tiles, in landing order, each with its landed centre
     in the pin (read once per resize) and the last style written, so a
     tile that is not moving costs nothing per frame. */
  type Tile = { el: HTMLElement; cx: number; cy: number; last: string };
  let tiles: Tile[] = [];
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
  let rim = 0;
  let cam: Camera = { cx: 0, cy: 0, d: 1500, ox: 0, oy: 0 };
  /* The slide: where the phone rests beside the copy, and its size there,
     relative to Rest B. Solved from the copy's own measured height. */
  let slide = { dx: 0, dy: 0, s: 1 };

  /* The wall that is on screen at this width; the other is display:none. */
  function activeWall(): HTMLElement | null {
    for (const w of section!.querySelectorAll<HTMLElement>('[data-wall]'))
      if (getComputedStyle(w).display !== 'none') return w;
    return null;
  }

  function measure() {
    vw = pin.clientWidth;
    vh = pin.clientHeight;
    measureIntro();
    const wall = activeWall();
    if (!wall) return;
    wallEl = wall;
    /* Where each tile sits once landed, in the pin: offsets, which a
       transform does not move, so this is right mid-flight too. A tile's
       offsetParent is its cell, a cell's the wall, the wall's the pin.
       One layout read per resize. */
    const inPin = (el: HTMLElement) => {
      const cell = el.offsetParent as HTMLElement;
      return {
        left: wall.offsetLeft + cell.offsetLeft + el.offsetLeft,
        top: wall.offsetTop + cell.offsetTop + el.offsetTop,
        w: el.offsetWidth,
        h: el.offsetHeight,
      };
    };
    tiles = [...wall.querySelectorAll<HTMLElement>('[data-tile]')]
      .sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order))
      .map((el) => {
        const r = inPin(el);
        return { el, cx: r.left + r.w / 2, cy: r.top + r.h / 2, last: '' };
      });
    const tile = wall.querySelector<HTMLElement>('[data-tile="phone"]');
    if (!tile) return;
    /* The photographed screen's corners in the pin once the phone
       photograph has landed. The tile cover-crops the photograph, so
       its fractions are the IMAGE's: scaled to cover the tile, then
       offset by the object-position, as the browser draws it. */
    const t = inPin(tile);
    const k = Math.max(t.w / PHONE_PHOTO.w, t.h / PHONE_PHOTO.h);
    const iw = PHONE_PHOTO.w * k;
    const ih = PHONE_PHOTO.h * k;
    const ix = t.left + (t.w - iw) * PHONE_POS.x;
    const iy = t.top + (t.h - ih) * PHONE_POS.y;
    const Q = PHONE_QUAD;
    const quad = [Q.tl, Q.tr, Q.br, Q.bl].flatMap(([fx, fy]) => [ix + fx * iw, iy + fy * ih]);

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
      /* The device is the screen plus its rim, centred: the rim is equal
         on every side, so the centre is still the display's, which is
         what the placement below is solved about. */
      rim = screenW * WALL.rest.rimFrac;
      const dw = screenW + 2 * rim;
      const dh = screenH + 2 * rim;
      device.style.width = `${dw.toFixed(1)}px`;
      device.style.height = `${dh.toFixed(1)}px`;
      device.style.left = `${((vw - dw) / 2).toFixed(1)}px`;
      device.style.top = `${((vh - dh) / 2).toFixed(1)}px`;
      const screenR = (screenW * Dp.r) / Dp.w;
      device.style.setProperty('--screen-r', `${screenR.toFixed(1)}px`);
      device.style.setProperty('--rim', `${rim.toFixed(1)}px`);
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
        const s = Math.min(1, avail / dh, (vw - 2 * gutter) / dw);
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
        const s = Math.min(1, (colR - colL) / dw, (vh - navH - gutter) / dh);
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
    /* half the device's height: the pivot is the rim's bottom edge */
    const h = screenH / 2 + rim;
    return (
      `translate3d(${L.dx.toFixed(2)}px, ${L.dy.toFixed(2)}px, 0) scale(${L.s.toFixed(4)}) ` +
      `translate3d(0, ${(h * (1 - Math.cos(t))).toFixed(2)}px, ${(-h * Math.sin(t)).toFixed(2)}px) ` +
      `rotateZ(${(WALL.rest.rollDeg * DEG * l).toFixed(5)}rad) ` +
      `rotateX(${t.toFixed(5)}rad) rotateY(${(WALL.rest.turnDeg * DEG * l + L.ry).toFixed(5)}rad)`
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

  /* ---- the intro: word by word, into "Motion", out to the heading ---
     Three states of the one line: the STAGE (the words arriving, big,
     centred in the frame, panning with the newest word), the ZOOM (into
     "Motion", the last word), and the HEADING (at rest, no transform).
     Scale is interpolated in log space, so the zoom reads as a steady
     push, as the hero's camera does. The white words dim as "Motion"
     arrives and brighten again on the way out. */
  let introDone = '';
  function renderIntro(p: number) {
    if (!introLine || words.length === 0) return;
    const I = WALL.intro;
    const n = words.length;
    const zout = cubicInOut(ramp(p, I.zoomOut[0], I.zoomOut[1]));
    const place = (s: number, fx: number, Px: number, Py: number) => {
      const tx = Px - intro.L.x - s * fx;
      const ty = Py - intro.L.y - s * (intro.h / 2);
      introLine.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${s.toFixed(5)})`;
    };
    /* settled: the heading, centred in its band — write it once */
    if (zout >= 1) {
      if (introDone === 'rest') return;
      introDone = 'rest';
      place(intro.sRest, intro.w / 2, intro.rest.x, intro.rest.y);
      words.forEach((w, k) => {
        w.style.opacity = '';
        w.style.transform = '';
        intro.last[k] = '';
      });
      return;
    }
    introDone = '';
    const rev = words.map((_, k) => {
      const t = ramp(p, I.word0 + k * I.wordStep, I.word0 + k * I.wordStep + I.wordDur);
      return 1 - Math.pow(1 - t, 3);
    });
    /* the pan: towards the newest word, with a little of the line's
       middle so the start of the line does not leave too soon */
    const r = rev.reduce((a, b) => a + b, 0);
    const x = Math.min(Math.max(r - 1, 0), n - 1);
    const i0 = Math.floor(x);
    const i1 = Math.min(n - 1, i0 + 1);
    const cr = intro.centres[i0] + (intro.centres[i1] - intro.centres[i0]) * (x - i0);
    const fStage = (intro.centres[0] + cr) / 2 + ((cr - (intro.centres[0] + cr) / 2) * 0.65);
    const fKey = intro.centres[n - 1];
    const fRest = intro.w / 2;
    const lg = (a: number, b: number, t: number) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * t);
    const mix = (a: number, b: number, t: number) => a + (b - a) * t;
    let s: number;
    let fx: number;
    let Px: number;
    let Py: number;
    if (zout > 0) {
      s = lg(1, intro.sRest, zout);
      fx = mix(fKey, fRest, zout);
      Px = mix(intro.stage.x, intro.rest.x, zout);
      Py = mix(intro.stage.y, intro.rest.y, zout);
    } else {
      const zin = cubicInOut(ramp(p, I.zoomIn[0], I.zoomIn[1]));
      s = lg(intro.sStage, 1, zin);
      fx = mix(fStage, fKey, zin);
      Px = intro.stage.x;
      Py = intro.stage.y;
    }
    place(s, fx, Px, Py);
    /* the words: in from the right as they fade up; the white ones dim
       while "Motion" holds the stage */
    const dimBy = rev[n - 1] * (1 - zout);
    const nudge = intro.h * 0.4;
    words.forEach((w, k) => {
      const op = rev[k] * (k < n - 1 ? 1 - (1 - I.dim) * dimBy : 1);
      const key = `${op.toFixed(3)}|${((1 - rev[k]) * nudge).toFixed(1)}`;
      if (key === intro.last[k]) return;
      intro.last[k] = key;
      w.style.opacity = op.toFixed(3);
      w.style.transform = rev[k] >= 1 ? '' : `translate3d(${((1 - rev[k]) * nudge).toFixed(1)}px, 0, 0)`;
    });
  }

  /* ---- the wall: the tiles land, one by one, from the front ---------
     Tile k, in landing order, flies over
     [start, start + flight]: at t it is scaled s = 1 + (from − 1)(1 − e)
     about its own centre, and carried out along the ray from the frame's
     centre through its cell by (s − 1) — so it projects from in front of
     the wall, not from the side. e is an ease-out; opacity comes up over
     the first `fade` of the flight. One transform and one opacity per
     moving tile per frame, and nothing for a tile that is not moving. */
  function renderWall(p: number) {
    const F = WALL.fly;
    const n = tiles.length;
    if (n < 2) return;
    const span = (WALL.wallEnd - F.flight - F.first) / (n - 1);
    for (let k = 0; k < n; k++) {
      const tl = tiles[k];
      const t = ramp(p, F.first + k * span, F.first + k * span + F.flight);
      let key: string;
      if (t >= 1) key = '';
      else if (t <= 0) key = 'hidden';
      else {
        const e = 1 - Math.pow(1 - t, 3);
        const s = 1 + (F.from - 1) * (1 - e);
        const dx = (tl.cx - vw / 2) * (s - 1);
        const dy = (tl.cy - vh / 2) * (s - 1);
        key = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) scale(${s.toFixed(4)})|${Math.min(1, t / F.fade).toFixed(3)}`;
      }
      if (key === tl.last) continue;
      tl.last = key;
      const st = tl.el.style;
      if (key === '') {
        st.transform = '';
        st.opacity = '';
        st.zIndex = '';
      } else if (key === 'hidden') {
        st.transform = '';
        st.opacity = '0';
        st.zIndex = '';
      } else {
        const [tf, op] = key.split('|');
        st.transform = tf;
        st.opacity = op;
        /* in flight it is in front of every landed tile */
        st.zIndex = '2';
      }
    }
  }

  const proxy = { p: 0 };
  const render = () => {
    renderIntro(proxy.p);
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
        pose,
        poseRms,
        cam,
        slide,
        rest: { restW, restH, screenW, screenH },
        ticking,
        tiles: tiles.length,
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
