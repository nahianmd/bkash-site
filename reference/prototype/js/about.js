/* ============================================================
   bKash — About page
   See specs/sections/about.md

   Everything here rides the shared Engine: reveals and counters
   come from engine.js, and only the Journey Wall needs a frame
   callback of its own.
   ============================================================ */

import { Engine } from './engine.js';

const { clamp } = Engine;

/* ---- board of directors ------------------------------------
   Portraits range from 175px to 2400px across, in mixed aspects.
   They are unified with a duotone treatment in CSS rather than
   baked into the files — it makes twelve mismatched sources read
   as one art direction, and it is reversible.                  */
export const BOARD = [
  { img: 'assets/img/about/board/shameran-abed.jpg',         name: 'Shameran Abed',         role: 'Chairman' },
  { img: 'assets/img/about/board/tareq-refat-ullah-khan.jpg', name: 'Tareq Refat Ullah Khan', role: 'Director' },
  { img: 'assets/img/about/board/asif-saleh.jpg',            name: 'Asif Saleh',            role: 'Director' },
  { img: 'assets/img/about/board/fahima-choudhury.jpg',      name: 'Fahima Choudhury',      role: 'Director' },
  { img: 'assets/img/about/board/nicholas-hughes.jpg',       name: 'Nicholas Hughes',       role: 'Director' },
  { img: 'assets/img/about/board/shinya-yoshino.jpg',        name: 'Shinya Yoshino',        role: 'Director' },
  { img: 'assets/img/about/board/edward-yue.jpg',            name: 'Edward Yue',            role: 'Director' },
  { img: 'assets/img/about/board/jason-park.jpg',            name: 'Jason Park',            role: 'Director' },
  { img: 'assets/img/about/board/anita-ghazi-rahman.jpg',    name: 'Anita Ghazi Rahman',    role: 'Director' },
  { img: 'assets/img/about/board/douglas-feagin.jpg',        name: 'Douglas Feagin',        role: 'Director' },
  { img: 'assets/img/about/board/gregory-c-chen.jpg',        name: 'Gregory C. Chen',       role: 'Director' },
  { img: 'assets/img/about/board/weixiang-lim.jpg',          name: 'Weixiang Lim',          role: 'Director' },
];

/* Shared divisor for investor logo display size. Larger = smaller
   logos. 3 puts all six on one desktop line at 3x pixel density, and is
   the floor everywhere — the mobile grid only ever shrinks them. */
const LOGO_DIVISOR = 3;
/* How much of its grid cell the widest wordmark is allowed to take, so
   neighbouring marks never appear to touch. */
const LOGO_FILL = 0.9;

export const INVESTORS = [
  { img: 'assets/img/about/investors/brac-bank.png',        name: 'BRAC Bank' },
  { img: 'assets/img/about/investors/money-in-motion.png',  name: 'Money in Motion' },
  { img: 'assets/img/about/investors/ifc.png',              name: 'IFC' },
  { img: 'assets/img/about/investors/gates-foundation.png', name: 'Bill & Melinda Gates Foundation' },
  { img: 'assets/img/about/investors/ant-international.png',name: 'Ant International' },
  { img: 'assets/img/about/investors/softbank.png',         name: 'SoftBank' },
];

export const VOICES = [
  { img: 'assets/img/about/voices/golam-bariul-mojib.jpg', tag: 'Effortless',
    quote: 'I keep my digital money in bKash and handle all my expenses digitally, effortlessly. Day or night, for every kind of spending, bKash is my cash money.',
    name: 'Golam Bariul Mojib', city: 'Dhaka' },
  { img: 'assets/img/about/voices/rima-akter.jpg', tag: 'Reliable',
    quote: 'I receive my salary in bKash and then spend that money for all my needs through bKash — easily and safely.',
    name: 'Rima Akter', city: 'Savar' },
  { img: 'assets/img/about/voices/tashrif-khan.jpg', tag: 'Humanitarian',
    quote: 'People from one end of the country are reaching out to those at the other end. Their love and support arrived instantly — through bKash.',
    name: 'Tashrif Khan', city: 'Dhaka' },
  { img: 'assets/img/about/voices/farhana-akter-dil.jpg', tag: 'From abroad',
    quote: 'Countless people like me depend on remittances. bKash has made life simpler for everyone — remittances now arrive right here.',
    name: 'Farhana Akter Dil', city: 'Dhaka' },
];

export function initAbout() {
  buildBoard();
  buildInvestors();
  buildVoices();
  initWall();
}

function buildVoices() {
  const row = document.querySelector('[data-voices]');
  if (!row) return;
  VOICES.forEach((v, i) => {
    const el = document.createElement('figure');
    el.className = 'voices__card';
    el.dataset.reveal = 'up';
    el.style.setProperty('--reveal-delay', `${i * 80}ms`);

    const im = document.createElement('img');
    im.className = 'voices__face';
    im.src = v.img;
    im.alt = v.name;
    im.loading = 'lazy';
    el.appendChild(im);

    const body = document.createElement('figcaption');
    body.innerHTML =
      '<p class="t-eyebrow voices__tag">' + v.tag + '</p>' +
      '<blockquote class="t-body">&ldquo;' + v.quote + '&rdquo;</blockquote>' +
      '<p class="voices__who t-sm"><strong>' + v.name + '</strong>' + v.city + '</p>';
    el.appendChild(body);
    row.appendChild(el);
  });
}

function buildBoard() {
  const grid = document.querySelector('[data-board]');
  if (!grid) return;
  BOARD.forEach((p, i) => {
    const el = document.createElement('figure');
    el.className = 'board__card';
    el.dataset.reveal = 'up';
    el.dataset.revealGroup = 'board';
    el.style.setProperty('--reveal-delay', `${Math.min(i % 6, 5) * 60}ms`);
    const im = document.createElement('img');
    im.src = p.img;
    im.alt = p.name;
    im.loading = 'lazy';
    el.appendChild(im);
    const cap = document.createElement('figcaption');
    cap.innerHTML = '<p class="board__name">' + p.name +
                    '</p><p class="board__role t-sm">' + p.role + '</p>';
    el.appendChild(cap);
    grid.appendChild(el);
  });
}

function buildInvestors() {
  const row = document.querySelector('[data-investors]');
  if (!row) return;
  const imgs = [];
  INVESTORS.forEach((v, i) => {
    const el = document.createElement('div');
    el.className = 'investors__item';
    el.dataset.reveal = 'up';
    el.style.setProperty('--reveal-delay', `${i * 70}ms`);
    const im = document.createElement('img');
    im.src = v.img;
    im.alt = v.name;
    el.appendChild(im);
    row.appendChild(el);
    imgs.push(im);
  });

  /* The files are area-normalised against each other, so ONE shared
     divisor sets every logo's display size and keeps them equal weight
     — no per-logo table to drift.

     Desktop lays them out as a flex row at natural width, where 3 fits
     all six on a line. The mobile grid hands each mark a fixed cell
     instead, and 3 overflows it — money-in-motion is 219px wide against
     a 165px cell. So the divisor is SOLVED for there rather than fixed:
     whatever makes the widest wordmark fit. Still one divisor for all
     six, which is what keeps the normalisation intact. */
  const fit = () => {
    const cs = getComputedStyle(row);
    let divisor = LOGO_DIVISOR;
    if (cs.display === 'grid') {
      const cols = cs.gridTemplateColumns.split(' ').filter(Boolean).length;
      const gap  = parseFloat(cs.columnGap) || 0;
      const cell = (row.clientWidth - gap * (cols - 1)) / cols;
      const widest = imgs.reduce((m, im) => Math.max(m, im.naturalWidth || 0), 0);
      if (cell > 0 && widest > 0) divisor = Math.max(LOGO_DIVISOR, widest / (cell * LOGO_FILL));
    }
    imgs.forEach(im => {
      if (im.naturalWidth) im.style.width = (im.naturalWidth / divisor) + 'px';
    });
  };

  imgs.forEach(im => { if (!im.complete) im.addEventListener('load', fit); });
  fit();
  window.addEventListener('resize', fit);
}

/* ---- the journey wall --------------------------------------
   A 6:1 artwork panned horizontally while the section is pinned.
   Progress is measured against the pin's own travel, and the
   distance is whatever the artwork overhangs the viewport by —
   derived, so it stays correct at any window size.             */
function initWall() {
  const section = document.querySelector('[data-wall]');
  if (!section) return;
  const pin   = section.querySelector('[data-wall-pin]');
  const track = section.querySelector('[data-wall-track]');
  const fill  = section.querySelector('[data-wall-fill]');
  if (!pin || !track) return;

  let p = 0, travel = 0;

  Engine.read((st) => {
    const r = section.getBoundingClientRect();
    const span = r.height - st.vh;
    p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
    travel = Math.max(0, track.scrollWidth - pin.clientWidth);
  });

  Engine.write(() => {
    track.style.transform = `translate3d(${(-travel * p).toFixed(1)}px, 0, 0)`;
    if (fill) fill.style.transform = `scaleX(${p.toFixed(4)})`;
  });
}
