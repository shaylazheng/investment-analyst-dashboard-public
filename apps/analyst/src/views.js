/* The view registry — the ONE place that knows what surfaces exist and how
 * they are grouped.
 *
 * Before this file the list lived in four: store.jsx's VIEWS array (hash
 * routing), App.jsx's VIEWS map (components), TopBar.jsx's label pairs (the
 * nav) and boot.js's SURFACE_LABEL (the cover caption). Four lists that had to
 * agree, and adding a surface meant remembering all four. App.jsx still owns
 * the component map, because only it can import the components — but it now
 * asserts against this registry rather than restating it.
 *
 * Grouping exists because a flat strip stops working somewhere around ten
 * tabs, and the plan for this platform is fifteen. The groups are by QUESTION
 * ASKED, not by data source:
 *
 *   Market   what is the market doing
 *   Company  what is this company worth
 *   Insider  who is buying and selling their own stock, across the market
 *   Learn    teach me
 *
 * Surfaces are listed here only once they are built. A nav that advertises a
 * view with no component behind it is worse than a short nav.
 */

export const GROUPS = [
  { id: 'company', label: 'Company', views: [
    /* Summary leads the group. It is the only tab here that answers "what IS
       this company" rather than computing something about it, and the other six
       all read better once you have. */
    ['summary', 'Summary'],
    ['management', 'Management'],
    /* Industry sits between the people inside one company and the hand-picked
       peer table: the wide shot — everyone SEC registers under the company's
       own filed industry code — before Competitors narrows to a chosen few. */
    ['industry', 'Industry'],
    ['competitors', 'Competitors'],
    ['valuation', 'Valuation'],
    ['graph', 'Graph'],
    ['outlook', 'Risks & Catalysts'],
  ]},
  /* Insider is its own group rather than a fifth Company tab.
   *
   * It is the one surface here whose default state is not about a company at
   * all: it opens on a market-wide screen of every Form 4 filed, and narrowing
   * it to one issuer is a drill-in rather than its purpose. Sitting inside
   * Company it read as "the fifth thing to know about NVDA", which is the wrong
   * frame for a screener — the other four all fail without a ticker and this
   * one is at its most useful without one. */
  { id: 'insider', label: 'Insider', views: [
    ['insider', 'Insider'],
  ]},
];


/** Every view id, in nav order. store.jsx validates the hash against this. */
export const VIEW_IDS = GROUPS.flatMap((g) => g.views.map(([id]) => id));

export const VIEW_LABEL = Object.fromEntries(GROUPS.flatMap((g) => g.views));

export const DEFAULT_VIEW = 'summary';

/** Which group a view belongs to; falls back to the first so the nav always
 *  has something highlighted rather than rendering an empty second row. */
export const groupOf = (view) =>
  GROUPS.find((g) => g.views.some(([id]) => id === view))?.id || GROUPS[0].id;

export const groupById = (id) => GROUPS.find((g) => g.id === id) || GROUPS[0];
