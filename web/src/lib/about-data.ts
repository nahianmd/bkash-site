/* ============================================================
   bKash — the About page's lists, as data. Content is the
   prototype's (reference/prototype/js/about.js), verbatim: real
   names, a real executive quote, real customers' words. Cleared for an
   internal pitch; not yet by bKash for a public URL (CLAUDE.md).
   ============================================================ */

/** Where the face sits in the photograph, as fractions of its width (cx)
    and height (crown, eye, chin) — read off each source, so the page can
    crop all twelve to one head size and one eye line. */
export type Face = { cx: number; crown: number; eye: number; chin: number };
export type Person = { file: string; name: string; role: string; face?: Face };

/* Measured 2026-09-26 against a 10% grid over each source. */
export const BOARD_FACES: Record<string, Face> = {
  'shameran-abed': { cx: 0.5, crown: 0.085, eye: 0.32, chin: 0.59 },
  'tareq-refat-ullah-khan': { cx: 0.52, crown: 0.125, eye: 0.34, chin: 0.54 },
  'asif-saleh': { cx: 0.5, crown: 0.02, eye: 0.22, chin: 0.52 },
  'fahima-choudhury': { cx: 0.507, crown: 0.16, eye: 0.387, chin: 0.56 },
  'nicholas-hughes': { cx: 0.5, crown: 0.083, eye: 0.41, chin: 0.69 },
  'shinya-yoshino': { cx: 0.5, crown: 0.027, eye: 0.38, chin: 0.68 },
  'edward-yue': { cx: 0.5, crown: 0.123, eye: 0.39, chin: 0.57 },
  'jason-park': { cx: 0.5, crown: 0.03, eye: 0.384, chin: 0.69 },
  'anita-ghazi-rahman': { cx: 0.5, crown: 0.072, eye: 0.33, chin: 0.5 },
  'douglas-feagin': { cx: 0.5, crown: 0.107, eye: 0.373, chin: 0.607 },
  'gregory-c-chen': { cx: 0.51, crown: 0.096, eye: 0.3, chin: 0.49 },
  'weixiang-lim': { cx: 0.52, crown: 0.01, eye: 0.397, chin: 0.69 },
};
export type Investor = { file: string; name: string };
export type Voice = { file: string; tag: string; quote: string; name: string; city: string };

/* Deck p.8, verbatim — and its two notes: the sublines run to two lines
   (a measure on `.stats__note`), and they carry NO full stop. */
export const STATS = [
  {
    count: 85,
    suffix: 'M+',
    icon: 'customers',
    label: 'Customers',
    note: '1 in 20 global MFS transactions by bKash',
  },
  {
    count: 350,
    suffix: 'K+',
    icon: 'agents',
    label: 'Agents',
    note: 'Human ATMs extending financial access to the grassroots',
  },
  {
    count: 1,
    suffix: 'M+',
    icon: 'merchants',
    label: 'Merchants',
    note: 'Democratizing digital payments',
  },
  {
    count: 200,
    suffix: '+',
    icon: 'products',
    label: 'Products & services',
    note: 'One account, an entire financial ecosystem',
  },
];

export const TRIAD = [
  { title: 'Store value', line: 'Keep what you earn. Keep control.' },
  { title: 'Pay & be paid', line: 'Send, receive, and pay. Anytime. Anywhere.' },
  { title: 'Empower', line: 'More access. More choice. More possibilities.' },
];

export const BOARD: Person[] = [
  { file: 'shameran-abed', name: 'Shameran Abed', role: 'Chairman' },
  { file: 'tareq-refat-ullah-khan', name: 'Tareq Refat Ullah Khan', role: 'Director' },
  { file: 'asif-saleh', name: 'Asif Saleh', role: 'Director' },
  { file: 'fahima-choudhury', name: 'Fahima Choudhury', role: 'Director' },
  { file: 'nicholas-hughes', name: 'Nicholas Hughes', role: 'Director' },
  { file: 'shinya-yoshino', name: 'Shinya Yoshino', role: 'Director' },
  { file: 'edward-yue', name: 'Edward Yue', role: 'Director' },
  { file: 'jason-park', name: 'Jason Park', role: 'Director' },
  { file: 'anita-ghazi-rahman', name: 'Anita Ghazi Rahman', role: 'Director' },
  { file: 'douglas-feagin', name: 'Douglas Feagin', role: 'Director' },
  { file: 'gregory-c-chen', name: 'Gregory C. Chen', role: 'Director' },
  { file: 'weixiang-lim', name: 'Weixiang Lim', role: 'Director' },
];

export const INVESTORS: Investor[] = [
  { file: 'brac-bank', name: 'BRAC Bank' },
  { file: 'money-in-motion', name: 'Money in Motion' },
  { file: 'ifc', name: 'IFC' },
  { file: 'gates-foundation', name: 'Bill & Melinda Gates Foundation' },
  { file: 'ant-international', name: 'Ant International' },
  { file: 'softbank', name: 'SoftBank' },
];

export const VOICES: Voice[] = [
  {
    file: 'golam-bariul-mojib',
    tag: 'Effortless',
    quote:
      'I keep my digital money in bKash and handle all my expenses digitally, effortlessly. Day or night, for every kind of spending, bKash is my cash money.',
    name: 'Golam Bariul Mojib',
    city: 'Chittagong',
  },
  {
    file: 'rima-akter',
    tag: 'Reliable',
    quote:
      'I receive my salary in bKash and then spend that money for all my needs through bKash — easily and safely.',
    name: 'Rima Akter',
    city: 'Savar',
  },
  {
    file: 'tashrif-khan',
    tag: 'Humanitarian',
    quote:
      'People from one end of the country are reaching out to those at the other end. Their love and support arrived instantly — through bKash.',
    name: 'Tashrif Khan',
    city: 'Dhaka',
  },
  {
    file: 'farhana-akter-dil',
    tag: 'From abroad',
    quote:
      'Countless people like me depend on remittances. bKash has made life simpler for everyone — remittances now arrive right here.',
    name: 'Farhana Akter Dil',
    city: 'Sylhet',
  },
];

/* Investor logos: backgrounds keyed out and trimmed, then AREA-normalised
   against each other (reference/PROGRESS), so one shared divisor sets
   every logo's display size. Larger = smaller logos. 3 puts all six on
   one desktop line at 3x density. On the phone grid the divisor is
   solved so the widest wordmark fits its cell. */
export const LOGO_DIVISOR = 3;
export const LOGO_FILL = 0.9;
