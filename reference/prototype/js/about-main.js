/* ============================================================
   bKash — About page entry point
   ============================================================ */

import { Engine, initReveal, initCounters } from './engine.js';
import { initAbout } from './about.js';
import { initDebug } from './debug.js';

function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;
  // On About the nav floats over a dark photographic hero, then goes
  // solid once it reaches the light sections below it.
  const hero = document.querySelector('.ab-hero');
  let solid = false;
  Engine.read((st) => {
    const edge = hero ? hero.getBoundingClientRect().bottom - 80 : 80 - st.y;
    const want = edge <= 0;
    if (want !== solid) { solid = want; nav.classList.toggle('is-solid', want); }
  });

  const drawer = document.querySelector('[data-drawer]');
  document.querySelector('[data-drawer-open]')?.addEventListener('click', () => {
    drawer?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
  document.querySelector('[data-drawer-close]')?.addEventListener('click', () => {
    drawer?.classList.remove('is-open');
    document.body.style.overflow = '';
  });
}

function boot() {
  initNav();
  initAbout();
  initReveal();
  initCounters();
  Engine.start();
  window.__bkash = { Engine };
  initDebug();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
