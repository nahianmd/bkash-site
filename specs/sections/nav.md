# Header: the menus

> Status: BUILT (2026-09-20)
> Model: **Fable 5.1**.
> Source: the client's sheet, `web/src/assets/bKash website button
> journey.xlsx` ("Header"), relayed by Nahian 2026-09-19: "make the nav
> collapse."

## Job

Three menus — Consumers, Business, Company — that open panels under the
bar and collapse again; the language switch and Support unchanged. One
structure (`lib/nav-data.ts`) rendered twice: the bar's panels and the
drawer's accordion, so the two cannot drift (audit A7).

## The structure (the sheet's)

- **Consumers** — the services in their groups (Send, Fund loading, Pay,
  Borrow, Save, Ticket & travelling, Purchase, Subscriptions, Learning
  center, Game zone) in five columns, and set apart: All services,
  Offers, Lifestyle, Keep your bKash safe.
- **Business** — Online business, Merchant, Agent, Education institution,
  Payroll, Corporate and enterprise, Microfinance, Supplier.
- **Company** — Company overview (About us, bKash career, bKash life,
  Sustainability, Risk management, Code of conduct, Governance); News
  (Newsroom).
- Support: the sheet says "menu, opens dropdown" with nothing under it —
  left as the pill until there is something.

## Behaviour

Desktop: click toggles a panel; on a device that can hover, resting on
a button opens after 80ms and leaving the header closes after 220ms, so
crossing from the bar into the panel never drops it. Escape closes and
returns focus to the button; a click outside closes; focus leaving the
header closes; following a link closes. One panel at a time. While a
panel is open the bar is solid whatever the ground beneath it, so bar
and panel read as one sheet. Panels fade and rise a few px on the
motion tokens. No layout reads per frame; one forced layout per open.

Phone (≤900px): the drawer's list becomes an accordion of native
`<details>`, nested where the sheet nests (Consumers › Pay › …). Keyboard
and screen readers get the native semantics.

## Hrefs

The sheet names a few real routes (`/offers`, `/smart-spending`,
`/security-and-protection`, `/online-merchants`, `/services`); its other
"goes to" cells are shifted against their rows, so the rest are
PLACEHOLDER slugs from the labels (`/services/pay-bill`, `/company/
governance` …). **None of these pages exist yet** except `/about`.

## Acceptance

- [x] Three panels, one open at a time; aria-expanded tracks; Escape,
      outside click and focus-out close. Measured.
- [x] The bar is solid while a panel is open, over the hero included.
- [x] Consumers: 10 groups, 4 links set apart, 5 columns at 1920.
- [x] The drawer has 14 `<details>` (3 menus + 11 groups); no JS needed.
- [ ] Hover open/close timing on a real pointer — **verify.**
- [ ] The panel's fade on a real display — **verify.**
- [ ] The sheet's hrefs confirmed with the client.

## Explicitly NOT this

- NOT a hover-only menu (touch and keyboard open it too).
- NOT two hand-written copies of the structure.
- NOT the footer — the sheet's footer rows wait for their own pass.
