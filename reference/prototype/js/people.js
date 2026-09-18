/* ============================================================
   bKash — people stories
   Ported from the reference implementation in
   `Website homepage version/src/App.tsx` (PeopleStories).

   A row of tiles that expand on hover: the pointed-at tile takes
   three shares of the row, its neighbours shrink to just over a
   half share each. The expansion is pure CSS — this file only
   adds click/keyboard equivalents, so the section still works on
   a touchscreen or if the CEO never moves the mouse.
   ============================================================ */

export const PEOPLE = [
  { id: 'anisul', img: 'assets/img/people/anisul.jpg',
    tag: 'Customer', name: 'Anisul Haque', role: 'CNG Driver',
    cta: 'Know his story', accent: '#a80048' },
  { id: 'munni', img: 'assets/img/people/munni.jpg',
    tag: 'Agent', name: 'Munni Barua', role: 'Known as "bKash Didi"',
    cta: 'Know her story', accent: '#d4005b' },
  { id: 'shajib', img: 'assets/img/people/shajib.jpg',
    tag: 'Merchant', name: 'Shajib Ahmed', role: 'Book Shop Owner',
    cta: 'Know his story', accent: '#7c0037' },
];

export function initPeople() {
  const row = document.querySelector('[data-people]');
  if (!row) return;

  PEOPLE.forEach((p) => {
    const el = document.createElement('article');
    el.className = 'people__tile';
    el.style.setProperty('--accent', p.accent);
    el.tabIndex = 0;

    const im = document.createElement('img');
    im.className = 'people__img';
    im.src = p.img;
    im.alt = `${p.name}, ${p.role}`;
    el.appendChild(im);

    const veil = document.createElement('div');
    veil.className = 'people__veil';
    el.appendChild(veil);

    const body = document.createElement('div');
    body.className = 'people__body';
    body.innerHTML =
      '<span class="people__tag t-xs">' + p.tag + '</span>' +
      '<p class="people__name">' + p.name + '</p>' +
      '<p class="people__role t-sm">' + p.role + '</p>' +
      '<div class="people__cta-wrap">' +
        '<a class="people__cta t-sm" href="#">' + p.cta +
        '<span aria-hidden="true">&#8594;</span></a>' +
      '</div>';
    el.appendChild(body);
    row.appendChild(el);
  });

  /* Click and keyboard equivalents of hover, so the section is not
     mouse-only. `is-open` mirrors whatever :hover does. */
  const tiles = [...row.children];
  const open = (el) => {
    const already = el.classList.contains('is-open');
    tiles.forEach(t => t.classList.remove('is-open'));
    row.classList.toggle('is-picked', !already);
    if (!already) el.classList.add('is-open');
  };
  tiles.forEach((el) => {
    el.addEventListener('click', () => open(el));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); }
    });
  });
}
