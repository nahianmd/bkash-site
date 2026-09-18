/* ============================================================
   bKash — debug HUD  (development only)

   Shows the pinned-section scroll progress so a position can be
   referred to precisely: "at 40% the phone should be…".

   OFF by default. Press `d` to toggle, or open the file with
   #debug on the URL to start with it on. Nothing renders and no
   callback is registered until it is switched on.
   ============================================================ */

import { Engine } from './engine.js';

export function initDebug() {
  const box = document.createElement('div');
  box.className = 'dbg';
  box.hidden = true;
  document.body.appendChild(box);

  let on = /(^|[#&?])debug\b/.test(location.hash + location.search);
  box.hidden = !on;

  window.addEventListener('keydown', (e) => {
    // ignore while typing into anything
    if (e.key !== 'd' || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    on = !on;
    box.hidden = !on;
    Engine.wake();
  });

  const pct = (v) => (v * 100).toFixed(1).padStart(5) + '%';

  Engine.write(() => {
    if (!on) return;
    const api = window.__bkash || {};
    const phone = api.phone;
    const hero = api.hero;
    const dev = document.querySelector('[data-phone-device]');

    const rows = [];
    if (hero) rows.push(['hero beat', String(hero.step)]);
    if (phone) {
      rows.push(['phone zoom', pct(phone.progress)]);
      rows.push(['growth', pct(phone.growth)]);
      rows.push(['phase', ['', 'zoom', 'slide'][phone.phase] || '-']);
    }
    if (dev) {
      const r = dev.getBoundingClientRect();
      rows.push(['phone w', `${Math.round(r.width)}px`]);
      rows.push(['phone size', `${Math.round(r.width)} x ${Math.round(r.height)}`]);
    }
    rows.push(['viewport', `${innerWidth} x ${innerHeight}`]);

    box.innerHTML = rows
      .map(([k, v]) => `<span>${k}</span><b>${v}</b>`)
      .join('');
  });
}
