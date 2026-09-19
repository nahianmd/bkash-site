/* ============================================================
   bKash — people: three of the 85 million.
   specs/sections/people.md

   Two things only. The recede state (Rule 4) for tap and keyboard —
   hover is CSS. And the depth (Rule 2): three planes, ground / cards /
   captions, drifting at the token rates as the section crosses the
   viewport. One transform per plane per frame; no pin.
   ============================================================ */

import { gsap, ScrollTrigger, reducedMotion } from './scroll';

export function initPeople() {
  const section = document.querySelector<HTMLElement>('[data-people]');
  if (!section) return;
  const cards = [...section.querySelectorAll<HTMLElement>('[data-people-card]')];
  const caps = [...section.querySelectorAll<HTMLElement>('[data-people-caps]')];
  const cardsPlane = section.querySelector<HTMLElement>('[data-people-cards]');

  /* ---- focus: tap and keyboard mirror hover ---- */
  const pick = (el: HTMLElement | null) => {
    cards.forEach((c) => c.classList.toggle('is-on', c === el));
    section.classList.toggle('is-picked', el !== null);
  };
  cards.forEach((c) => {
    c.addEventListener('click', (e) => {
      /* The CTA is a link; a tap on it follows it. */
      if ((e.target as HTMLElement).closest('a')) return;
      pick(c.classList.contains('is-on') ? null : c);
    });
    c.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pick(c.classList.contains('is-on') ? null : c);
      }
    });
    c.addEventListener('focusin', () => pick(c));
  });
  section.addEventListener('focusout', (e) => {
    const to = e.relatedTarget as Node | null;
    if (!to || !section.contains(to)) pick(null);
  });
  document.addEventListener('pointerdown', (e) => {
    if (section.classList.contains('is-picked') && !section.contains(e.target as Node)) pick(null);
  });

  /* ---- depth: the planes drift at the token rates ----
     t runs −0.5 → 0.5 as the section's centre crosses the viewport's.
     The ground is the section itself (rate --plane-back); the cards
     lead it by (mid − back) of the viewport height, the captions by
     (front − back). Felt, not noticed. */
  if (reducedMotion() || !cardsPlane) return;
  const css = getComputedStyle(document.documentElement);
  const rate = (name: string, fallback: number) => parseFloat(css.getPropertyValue(name)) || fallback;
  const back = rate('--plane-back', 0.94);
  const mid = rate('--plane-mid', 1);
  const front = rate('--plane-front', 1.06);
  let vh = 1;
  const proxy = { p: 0 };
  const render = () => {
    const t = proxy.p - 0.5;
    const dyCards = -(mid - back) * vh * t;
    const dyCaps = -(front - mid) * vh * t;
    cardsPlane.style.transform = `translate3d(0, ${dyCards.toFixed(1)}px, 0)`;
    for (const c of caps) c.style.transform = `translate3d(0, ${dyCaps.toFixed(1)}px, 0)`;
  };
  const measure = () => {
    vh = window.innerHeight;
  };
  measure();
  const tl = gsap.timeline({ paused: true }).to(proxy, { p: 1, duration: 1, ease: 'none', onUpdate: render });
  ScrollTrigger.create({
    id: 'people',
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    animation: tl,
    scrub: 0.6,
    onRefreshInit: measure,
    onRefresh: render,
  });
}
