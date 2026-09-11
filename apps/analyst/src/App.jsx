import { useEffect, useState } from 'react';
import { AppProvider, useApp } from '@markets/shell/lib/store.jsx';
import { TopBar, SubNav } from '@markets/shell/components/TopBar.jsx';
import { Summary } from '@markets/summary/Summary.jsx';
import { Management } from '@markets/management/Management.jsx';
import { Industry } from '@markets/industry/Industry.jsx';
import { Competitors } from '@markets/competitors/Competitors.jsx';
import { Valuation } from '@markets/valuation/Valuation.jsx';
import { Graph } from '@markets/graph/Graph.jsx';
import { Outlook } from '@markets/outlook/Outlook.jsx';
import { Insider } from '@markets/insider/Insider.jsx';
import { RegistryProvider } from '@markets/shell/lib/registry.jsx';
import { GROUPS, VIEW_IDS, DEFAULT_VIEW } from './views.js';
import { SURFACE_SOURCES, KIND_LABEL } from './sources.js';

/* This file is the composition for the Company tabs and the Form 4 screener -- the only place that
   knows which surfaces this app has. Each is imported from its own package, so what renders here
   is the same module `npm run dev -w @markets/<section>` renders — there is no
   second copy to drift.

   It owns the component map because only it can import the components; views.js
   owns the LIST, and the check below makes the two unable to disagree: a
   surface in the nav with no component would render a blank workspace, and one
   here but not there is unreachable. */
const VIEWS = {
  summary: Summary, management: Management, industry: Industry,
  competitors: Competitors, valuation: Valuation, graph: Graph,
  outlook: Outlook, insider: Insider,
};

if (import.meta.env?.DEV) {
  const mapped = Object.keys(VIEWS);
  const missing = VIEW_IDS.filter((id) => !mapped.includes(id));
  const orphan = mapped.filter((id) => !VIEW_IDS.includes(id));
  if (missing.length) console.error(`[views] in the nav with no component: ${missing.join(', ')}`);
  if (orphan.length) console.error(`[views] component with no nav entry, unreachable: ${orphan.join(', ')}`);
}

/* Everything the shell needs to know about which surfaces exist. Passed in
   rather than imported by the shell, so packages/shell stays ignorant of the
   section list and a section can render without the rest of the dashboard. */
const REGISTRY = {
  groups: GROUPS,
  defaultView: DEFAULT_VIEW,
  sources: SURFACE_SOURCES,
  kindLabel: KIND_LABEL,
};

function Clock() {
  const [now, setNow] = useState('');
  useEffect(() => {
    const tick = () => setNow(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
    }).format(new Date()) + ' ET');
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return <span className="sb-item sb-right">{now}</span>;
}

function Shell() {
  const { view } = useApp();
  const View = VIEWS[view] || Summary;
  return (
    <div className="app">
      <TopBar />
      <SubNav />
      <main className="workspace"><View /></main>
      <footer className="statusbar">
        <span className="sb-item">
          Demo · Generated data. No external data connections.
        </span>
        <Clock />
      </footer>
    </div>
  );
}

export default function App() {
  /* RegistryProvider must sit ABOVE AppProvider: the store validates the opening
     hash against the registry's view ids on its very first render. */
  return (
    <RegistryProvider value={REGISTRY}>
      <AppProvider><Shell /></AppProvider>
    </RegistryProvider>
  );
}
