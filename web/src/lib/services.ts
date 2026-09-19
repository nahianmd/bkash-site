/* ============================================================
   bKash — a thousand more stories → the phone → sixteen services
   specs/sections/services.md · specs/services/plan.md

   Task 1: data and the wall's configuration. The scrub arrives in
   task 2. Everything per-section lives here as one object each.
   ============================================================ */

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
   is LAST in its column, and its column is the fastest. */
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
    ],
  ],
};

export function initServices() {
  /* Task 2 brings the scrub. */
}
