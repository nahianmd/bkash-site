/* ============================================================
   bKash — the sixteen services, selectable. Its own section on white,
   reached from the phone section's "See details" button. The grid's
   lattice keeps the home screen's rhythm (SCREEN.pitchRatio); the card
   flips to whichever service is chosen; the rest recede (Rule 4).
   ============================================================ */

import { SERVICES, SCREEN } from './services';
import { isPhone } from './scroll';

export function initServicesDetail() {
  const section = document.querySelector<HTMLElement>('[data-services-detail]');
  if (!section) return;
  const gridIn = section.querySelector<HTMLElement>('[data-grid-in]');
  const flip = section.querySelector<HTMLElement>('[data-card-flip]');
  const faces = [...section.querySelectorAll<HTMLImageElement>('[data-face-icon]')];
  const titleEl = section.querySelector<HTMLElement>('[data-stage-title]');
  const lineEl = section.querySelector<HTMLElement>('[data-stage-line]');
  const copyEl = section.querySelector<HTMLElement>('[data-stage-copy]');
  const cells = [...section.querySelectorAll<HTMLButtonElement>('[data-cell]')];
  const iconSrc = (i: number) => cells[i]?.querySelector('img')?.getAttribute('src') ?? '';

  /* The grid's pitch, by formula: the column is the grid's width over
     four; the row is the column times the screenshot's row/column
     ratio, so the sixteen sit as they do on the phone. */
  function measure() {
    if (!gridIn) return;
    const P = gridIn.clientWidth / 4;
    gridIn.style.setProperty('--col', `${P.toFixed(1)}px`);
    gridIn.style.setProperty('--row', `${(P * SCREEN.pitchRatio).toFixed(1)}px`);
  }

  let selected = -1;
  let flipped = false;
  let copyTimer: number | null = null;

  function select(i: number, animate = true) {
    if (i === selected || !SERVICES[i]) return;
    const first = selected < 0;
    selected = i;
    cells.forEach((c, k) => {
      c.classList.toggle('is-on', k === i);
      c.setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
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
    /* On a phone the chosen one is kept in view. */
    if (isPhone() && animate)
      cells[i].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }

  cells.forEach((c, i) => c.addEventListener('click', () => select(i)));
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  select(0, false);

  if (import.meta.env.DEV) {
    const w = window as any;
    w.__bkash = w.__bkash ?? {};
    w.__bkash.servicesDetail = { select, state: () => ({ selected, flipped }) };
  }
}
