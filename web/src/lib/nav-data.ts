/* ============================================================
   bKash — the header's structure, from the client's sheet
   (`assets/bKash website button journey.xlsx`, "Header", 2026-09-19).
   Pure data, rendered twice by Nav.astro — the bar's panels and the
   drawer's accordion — so the two cannot drift apart.

   Hrefs: the sheet names a few real routes (/offers, /smart-spending,
   /security-and-protection, /online-merchants, /services); its other
   "goes to" cells are shifted against their rows, so the rest are
   PLACEHOLDER slugs derived from the labels. Every one is a page that
   does not exist yet.
   ============================================================ */

export type NavItem = { label: string; href: string };
/** A subsection: a link, or a heading over a list of links. */
export type NavGroup = { label: string; href?: string; items?: NavItem[] };
/** A top-level menu: a panel of groups. */
export type NavMenu = {
  id: 'consumers' | 'business' | 'company';
  label: string;
  /** the panel's groups, in reading order */
  groups: NavGroup[];
  /** groups the panel sets apart — Consumers' three plain links */
  aside?: NavItem[];
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
const list = (base: string, labels: string[]): NavItem[] =>
  labels.map((label) => ({ label, href: `${base}/${slug(label)}` }));

/* ---- the footer ---------------------------------------------------
   The same sheet's Sheet1: social links first, then Consumers, Business
   and Company. Hrefs are the header's, so the two cannot send the same
   label to two different places. Social URLs are the sheet's own
   (Header, rows 111–114) and are the only real links on this site. */
export const SOCIAL = [
  { label: 'Facebook', href: 'https://www.facebook.com/bkashlimited' },
  { label: 'YouTube', href: 'https://www.youtube.com/bkashlimited' },
  { label: 'Instagram', href: 'https://www.instagram.com/bkashlimited' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/bkash' },
] as const;

export const FOOTER_COLUMNS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Consumers',
    items: [
      { label: 'Services', href: '/services' },
      { label: 'Learning center', href: '/services/learning-center' },
      { label: 'Offers', href: '/offers' },
      { label: 'Lifestyle', href: '/smart-spending' },
      { label: 'Keep your bKash safe', href: '/security-and-protection' },
    ],
  },
  {
    label: 'Business',
    items: [
      { label: 'Online business', href: '/online-merchants' },
      ...list('/business', [
        'Merchant',
        'Agent',
        'Education institution',
        'Payroll',
        'Corporate and enterprise',
        'Microfinance',
        'Supplier',
      ]),
    ],
  },
  {
    label: 'Company',
    items: [
      { label: 'About us', href: '/about' },
      ...list('/company', [
        'bKash career',
        'bKash life',
        'Sustainability',
        'Risk management',
        'Code of conduct',
        'Governance',
        'Newsroom',
      ]),
    ],
  },
];

export const NAV_MENUS: NavMenu[] = [
  {
    id: 'consumers',
    label: 'Consumers',
    groups: [
      { label: 'Send', items: list('/services', ['Send money', 'Group send money', 'bKash to bank', 'Remittance']) },
      { label: 'Fund loading', items: list('/services', ['Cash-in', 'Add money', 'Agent', 'Priyo agent']) },
      {
        label: 'Pay',
        items: list('/services', [
          'Payment',
          'Pay bill',
          'Mobile recharge',
          'Toll',
          'Education fee',
          'Microfinance',
          'Donation',
          'Insurance',
        ]),
      },
      { label: 'Borrow', items: list('/services', ['Loan']) },
      { label: 'Save', items: list('/services', ['Savings']) },
      { label: 'Ticket & travelling', items: list('/services', ['Train', 'Plane', 'Bus', 'Launch', 'Hotel']) },
      {
        label: 'Purchase',
        items: list('/services', [
          'GP packages',
          'Metrorail tickets',
          'Air tickets',
          'Hotel bookings',
          'Games',
          'Quizzes',
          'BCS study materials',
        ]),
      },
      { label: 'Subscriptions', items: list('/services', ['Bongo', 'Boighor', 'Chorki', 'Toffee', 'Music', 'Audiobook']) },
      { label: 'Learning center', href: '/services/learning-center' },
      { label: 'Game zone', href: '/services/game-zone' },
    ],
    aside: [
      { label: 'All services', href: '/services' },
      { label: 'Offers', href: '/offers' },
      { label: 'Lifestyle', href: '/smart-spending' },
      { label: 'Keep your bKash safe', href: '/security-and-protection' },
    ],
  },
  {
    id: 'business',
    label: 'Business',
    groups: [
      {
        label: 'For business',
        items: [
          { label: 'Online business', href: '/online-merchants' },
          ...list('/business', [
            'Merchant',
            'Agent',
            'Education institution',
            'Payroll',
            'Corporate and enterprise',
            'Microfinance',
            'Supplier',
          ]),
        ],
      },
    ],
  },
  {
    id: 'company',
    label: 'Company',
    groups: [
      {
        label: 'Company overview',
        items: [
          { label: 'About us', href: '/about' },
          ...list('/company', [
            'bKash career',
            'bKash life',
            'Sustainability',
            'Risk management',
            'Code of conduct',
            'Governance',
          ]),
        ],
      },
      { label: 'News', items: [{ label: 'Newsroom', href: '/company/newsroom' }] },
    ],
  },
];
