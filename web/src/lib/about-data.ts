/* ============================================================
   bKash — the About page's lists, as data. Content is the
   prototype's (reference/prototype/js/about.js), verbatim: real
   names, a real executive quote, real customers' words. Cleared for an
   internal pitch; not yet by bKash for a public URL (CLAUDE.md).
   ============================================================ */

export type Person = { file: string; name: string; role: string };
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
    label: 'Products & Services',
    note: 'One account, an entire financial ecosystem',
  },
];

export const TRIAD = [
  { title: 'Store Value', line: 'Keep what you earn. Keep control.' },
  { title: 'Pay & Be Paid', line: 'Send, receive, and pay. Anytime. Anywhere.' },
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
    city: 'Dhaka',
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
    city: 'Dhaka',
  },
];

/* Investor logos: backgrounds keyed out and trimmed, then AREA-normalised
   against each other (reference/PROGRESS), so one shared divisor sets
   every logo's display size. Larger = smaller logos. 3 puts all six on
   one desktop line at 3x density. On the phone grid the divisor is
   solved so the widest wordmark fits its cell. */
export const LOGO_DIVISOR = 3;
export const LOGO_FILL = 0.9;
