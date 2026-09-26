/* ============================================================
   bKash — the About page's lists, as data. Content is the
   prototype's (reference/prototype/js/about.js), verbatim: real
   names, a real executive quote, real customers' words. Cleared for an
   internal pitch; not yet by bKash for a public URL (CLAUDE.md).
   ============================================================ */

export type Person = { file: string; name: string; role: string; bio: string[] };
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

/* Names, roles and biographies are bkash.com's own (the About page's
   board modals, saved 2026-09-26), verbatim. */
export const BOARD: Person[] = [
  {
    file: 'shameran-abed',
    name: "Shameran Abed",
    role: "Chairman",
    bio: [
      "Mr. Shameran Abed is the chairman of the Board of Directors of bKash Limited. He is part of the senior management of BRAC's Microfinance Programme in Bangladesh, which accounts for a major portion of Bangladesh's over $3 billion and 22 million borrower microfinance industry. In addition to managing a part of field operations, he works on product development and delinquency management issues. Prior to joining BRAC, Shameran worked as an editorial writer at one of Bangladesh's main English daily newspapers where he wrote primarily on politics.",
      "He has an undergraduate degree in Economics from Hamilton College in New York, and qualified as a lawyer and was called to the Bar of England and Wales from the Honourable Society of Lincoln's Inn in 2006.",
    ],
  },
  {
    file: 'tareq-refat-ullah-khan',
    name: "Tareq Refat Ullah Khan",
    role: "Director",
    bio: [
      "Mr. Tareq Refat Ullah Khan is the Managing Director & CEO of BRAC Bank PLC, the country’s most trusted, innovative, and impactful financial institution. A seasoned banking professional with nearly 30 years of experience, he has been instrumental in shaping Bangladesh’s corporate, commercial, and institutional banking landscape.",
      "Since joining BRAC Bank in 2017 as Head of Corporate Banking, Mr. Khan has led the transformation of its wholesale banking franchise, driving significant growth in assets in line with the Bank’s risk appetite, trade finance, transaction banking, and digital innovation. Under his leadership, pioneering digital platforms such as CORPnet have strengthened BRAC Bank’s position as a leader in institutional banking.",
      "Mr. Khan began his career at IFIC Bank PLC in 1996 and later served at AB Bank PLC and Eastern Bank PLC. For his outstanding contributions, he earned both the CEO’s Award and the Chairman’s Award at EBL.",
      "He holds a Bachelor of Commerce, a Master of Commerce in Marketing, and an MBA, and is an alumnus of the prestigious Cornell Senior Executive Leadership Program (SELP). He is also an Omega-certified risk professional and has completed advanced international programs on leadership, governance, and risk management from several reputed institutions across the globe.",
      "A lifelong learner and thought leader, Mr. Khan is committed to advancing innovation, sustainability, and inclusive growth in Bangladesh’s financial sector. Beyond banking, he is an active contributor to society, serving as a member, donor, and organizer of various social, educational, and sports organizations — reflecting his deep commitment to community development and nation-building.",
    ],
  },
  {
    file: 'asif-saleh',
    name: "Asif Saleh",
    role: "Director",
    bio: [
      "Mr. Asif Saleh is a director of bKash Limited, nominated by BRAC Bank Limited. He is the executive director of BRAC Limited. He brings with him a diverse multi-sectoral experience in senior leadership roles in private, public and non-government sectors, with a proven track record of effectively managing interfaces of development programming, operational and financial sustainability and building effective partnerships, both within and outside BRAC.",
      "Mr. Saleh has been deeply anchored in driving the strategic direction of BRAC. He joined the organization in 2011 and took up an increasingly important role in leading advocacy for social change, information technology, communications and social innovation. He has been instrumental in BRAC's concentration on emerging development challenges in the areas of urban poverty, youth skills development, inclusive growth and migration. As the senior director of the empowerment program cluster, he led BRAC's new programmatic areas, namely, the urban development program, human rights and legal aid services, skills development program and migration program. He also led the development of BRAC's five-year strategic plan in 2016.",
      "Prior to joining BRAC, Mr. Saleh worked as a policy specialist for the Access to Information (A2i) Program at the Prime Minister's Office. As part of the Government's Digital Bangladesh initiative, he led the policy effort to expand affordable broadband connectivity across Bangladesh and devised the Government's m-governance strategy. He was also a key part of the Union Digital Centre team that created digital service centers in every union in Bangladesh. Since then, he has actively promoted the role of technology and frugal innovation in the development sector. He spent 12 years in Goldman Sachs in different fintech roles and institutional client sales in New York and London, ending his term there as an Executive Director. He has also worked in Glaxo Wellcome, IBM and Nortel.",
      "Mr. Saleh is the founder of Drishtipat, a global organization with chapters across the globe focusing on human and economic rights of Bangladeshis. He was recognized for his work by the Bangladeshi American Foundation in 2007, Asia Society's Asia 21 program in 2008 and was selected as an Asia 21 Fellow in 2012. He was selected as a Young Global Leader by the World Economic Forum in 2013.",
      "Mr. Saleh is an active member in a range of international networks and alliances, advocating inclusive achievement of the Sustainable Development Goals. He is a non-resident fellow at the Center for Global Development in Washington, D.C. He is a member of the Millions Learning International Advisory Group, Brookings Institute, which addresses the question of how to scale quality education for all children and youth. He is also a member of the South Africa-based Innovation Edge, an institution promoting early Childhood development. Mr. Saleh chairs BRAC IT Services Limited, co-chairs BRAC Net, and is on the Board of BRAC Bank, and edotco Bangladesh Ltd. He is also a board member of multiple non-profits, including Institute of Informatics and Development, and Maya.",
      "Mr. Saleh holds a bachelor’s degree in computer science and an MBA in management and marketing from the Stern School of Business, New York University.",
    ],
  },
  {
    file: 'fahima-choudhury',
    name: "Fahima Choudhury",
    role: "Director",
    bio: [
      "Ms. Fahima Choudhury was appointed as an Independent Director to the board of BRAC Bank Limited in April 2018. At present, she also serves as member of the Board Risk Management Committee and the Board Audit Committee.",
      "Since end-2018, Ms. Choudhury also serves as a BRAC Bank Nominated Director on the boards of BRAC-EPL Investments Ltd. and BRAC-EPL Stock Brokerage Ltd.; and is currently the Acting Chair of both these companies. In the end of 2021, she was nominated by BRAC Bank as a Director onto the board of bKash Ltd.",
      "Ms. Choudhury is a management consultant and a marketing communications & advertising specialist with over 25 years of experience in various entrepreneurial and leadership roles across multiple firms. Due to her long involvement in the advertising business, she has had the opportunity to serve diverse range of local and international clients across a number of sectors and industries.",
      "Ms. Choudhury started her career in Adcomm Limited (one of the oldest and most renowned advertising agencies in the country) rising to the position of Director, before moving on to establish her own integrated marketing communications agency called Marka. Later, Marka was acquired by Ogilvy & Mather Worldwide (part of the WPP Group), and Ms. Choudhury became the Managing Director (and shareholder) of Ogilvy & Mather Bangladesh. In the past she has also been a member of Ogilvy APAC regional council, as well as Assistant General Secretary in the Advertising Agencies Association of Bangladesh. Ms. Choudhury left the advertising industry in 2020 in order to focus on her consultancy business.",
      "Aside from this, Ms. Choudhury is also a Director of Adcomm Holdings which has business involvements in various other industries (including hospitality, media and IT).",
      "Ms. Choudhury did her B.Sc. (Hons.) Management and M.Sc. Management from the London School of Economics & Political Science in the United Kingdom.",
    ],
  },
  {
    file: 'nicholas-hughes',
    name: "Nicholas Hughes",
    role: "Director",
    bio: [
      "Mr. Nicholas Hughes is a Director of bKash Limited nominated by Money in Motion LLC. He is the Managing Director of Signal Point Partners, established in 2009 to focus on mobile commerce opportunities in emerging markets. Hughes was previously Head of Mobile Payments at Vodafone, where he founded the payment service M-PESA. In Kenya, M-PESA has attracted more than 13 million subscribers since its launch in 2007.",
      "In 2010 Hughes was a winner of The Economist's Innovation Award for Social & Economic Impact. He holds a PhD In Applied Science (1992) and an MBA with distinction from London Business School (2001).",
    ],
  },
  {
    file: 'shinya-yoshino',
    name: "Shinya Yoshino",
    role: "Director",
    bio: [
      "Mr. Shinya Yoshino has over 16 years of experience in the financial and technology sectors in Japan, the U.S., Asia, Latin America, and several other emerging markets. His career with IFC began in 2007. At IFC, he has played a key role in implementing venture capital investment and corporate finance projects in FinTech. His responsibilities also included managing multiple portfolio companies. He focuses on early stage/growth investments in FinTech. He is currently leading the global portfolio operations of IFC's FinTech investments and managing 45+ active investments globally. Prior to joining IFC, Shinya worked for technology giant Mitsubishi Corporation, where he was responsible for investments in IT businesses, business development, and strategic partnerships. Shinya holds a BA from Keio University and an MBA from Harvard Business School.",
    ],
  },
  {
    file: 'edward-yue',
    name: "Edward Yue",
    role: "Director",
    bio: [
      "Mr. Edward Yue is the General Manager of Ant International for Southeast Asia, Australia, and New Zealand & Global Strategic Partnerships. His responsibilities are to expand Alipay+ merchant coverage and drive e-wallet/banking partnerships across the region.",
      "Before joining Ant International, Edward worked at DBS Bank (Singapore) and was responsible for creating Singapore’s most popular lifestyle app, DBS PayLah! He has also held leadership roles at American Express International and Westpac Banking Corporation.",
    ],
  },
  {
    file: 'jason-park',
    name: "Jason Park",
    role: "Director",
    bio: [
      "Jungnam Jason Park is a Director of bKash Limited, nominated by SoftBank Investment Advisers. He is an Investment Vice President at SoftBank Investment Advisers, which manages the funds of the SoftBank Vision Fund. Currently, he focuses on identifying and investing in technology companies in Southeast Asia and Korea. Mr. Park has been active in a wide range of growth stage VC investments in Asia, including bKash in Bangladesh, since joining SoftBank in 2017. Prior to this, he was a technology strategist at SK Telecom and LG Electronics, helping corporates make decisions on their technology acquisitions and alliances. He also co-founded Frontrow in 2009, a fashion e-commerce company which is now a part of Shinsegae Group. He received a BA in Economics from Seoul National University, majoring in agricultural economics and rural development.",
    ],
  },
  {
    file: 'anita-ghazi-rahman',
    name: "Anita Ghazi Rahman",
    role: "Director",
    bio: [
      "Ms. Anita Ghazi Rahman is a director of bKash Limited, nominated by BRAC Bank Limited.",
      "She is an Independent Director of Lightcastle Partners. She is a member of the National Advisory Board for Impact Investment in Bangladesh and also a member of the Investment Committee in Startup Bangladesh Ltd, the flagship venture capital fund of the ICT Ministry of Bangladesh.",
      "She has experience in the corporate legal sector and heads the litigation practice of her law firm called The Legal Circle. She provides corporate and transactional advice for business formation, employment, financing, IP, services and procurement contracts, joint ventures, mergers & acquisitions, and other business restructurings.",
      "Apart from this, Ms. Anita also mentors national and international incubator and accelerator programmes. Anita frequently mentors for BetterStories, Founders’ Institute, GP Accelerator, LightCastle Center for Advanced Learning, Seedstars, Startup Dhaka, YGAP, and BYLC Ventures, among others. She is a sponsor-member of Bangladesh Angels Network (BAN).",
      "She obtained her LL.B. (Hons) degree from University College London (UCL) in 2002 and was called to the Bar of England and Wales from Lincoln’s Inn in July 2003. Ms. Anita qualified as an Advocate in Bangladesh.",
    ],
  },
  {
    file: 'douglas-feagin',
    name: "Douglas Feagin",
    role: "Director",
    bio: [
      "Mr. Douglas Feagin is a director of bKash Limited, nominated by Alipay Singapore E-commerce Private Ltd. He was a Board Director in bKash from 2018 to 2020. He is also currently working as the Senior Vice President of Global Strategic Partnerships and Investments at Ant Group. He joined Ant Financial in June 2016 to spearhead Ant Financial’s globalization strategy as well as Alipay’s international business development, operations, and marketing activities. Before joining Ant Financial, Mr. Feagin was a senior partner at Goldman, Sachs & Co. and had been maintaining good working relationships with a wide range of clients in the US, Latin America, and Asia across many sectors including banking, tech, and insurance. During his 21-year tenure at Goldman, Sachs, Mr. Feagin specialized in merger and acquisition, IPO, equity offering, principal investing, and corporate restructuring. He joined Goldman Sachs as the Managing Director in 2002 and later became a Partner in 2006. Douglas graduated from the University of Virginia in 1988 and received his MBA from Harvard Business School in 1994.",
    ],
  },
  {
    file: 'gregory-c-chen',
    name: "Gregory C. Chen",
    role: "Director",
    bio: [
      "Mr. Gregory C. Chen is a Director of bKash Limited, nominated by BRAC Bank Limited. He has over 25 years of experience in microfinance and finance innovations. His experience spans multiple continents with his deepest focus on South Asia. He is the current Managing Director of BRAC International and prior to this, he led international teams in renowned institutions like Consultative Group to Assist the Poor (CGAP), ShoreBank International, Bank of America and Aga Khan Rural Support Programme.",
      "Mr. Gregory has multiple publications on digital financing, mobile payments etc. and he has completed his Masters from Harvard University and BA in Economics from Wasleyan University.",
    ],
  },
  {
    file: 'weixiang-lim',
    name: "Weixiang Lim",
    role: "Director",
    bio: [
      "Weixiang Lim is a Director on SoftBank Investment Advisers’ Asia team, based in Singapore. He plays a key role in driving investments across Southeast Asia, with a focus artificial intelligence across sectors such as Super Apps, fintech, healthtech and vertical e-commerce.",
      "Driven by the momentum of startup ecosystems in United States and China, Weixiang sees Southeast Asia as the next frontier for innovation. He joined SBIA to help shape this opportunity, drawing on insights from global colleagues to navigate a fast-evolving market. His approach is sector-agnostic and grounded in the realities of the region’s emerging tech landscape.",
      "Before joining SBIA, Weixiang was with Temasek, where he focused on global consumer investments from offices in Singapore and Shanghai.",
      "He sees SBIA’s AI-forward strategy as a powerful unifier across sectors and geographies, and as a source of conviction in how the firm identifies and supports the next generation of category leaders.",
    ],
  },
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
