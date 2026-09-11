/* The release calendar hook, and the ET session arithmetic built on it.
 *
 * This lived in @markets/calendar, and the shell's TopBar imported it for the
 * market-open indicator -- the one place the shell reached into a section,
 * which shell/package.json declared as a knowing exception. Once the platform
 * splits, shell is shared and calendar belongs to one side, so that import
 * would point from the parent into a submodule. The hook was always
 * shell-shaped: no JSX, and its only dependency is shell's own api.js. The
 * Calendar SURFACE stays where it is; only the hook moves.
 */
import { useEffect, useState } from 'react';
import { fetchCalendar } from '@markets/shell/lib/api.js';

let cached = null;
/* The calendar feed is shared by the docket, the status pill and the calendar
   view, so it is fetched once and memoised for the session. */
export function useCalendar() {
  const [state, setState] = useState(() => cached
    ? { data: cached, error: null, loading: false }
    : { data: null, error: null, loading: true });
  useEffect(() => {
    if (cached) return;
    let alive = true;
    fetchCalendar()
      .then((d) => { cached = d; if (alive) setState({ data: d, error: null, loading: false }); })
      .catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => { alive = false; };
  }, []);
  return state;
}

export const SESSION = {
  'Before open': ['☀', 'before the open', 'pre-open'],
  'After close': ['☾', 'after the close', 'post-close'],
};

export function etParts() {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { dow: p.weekday, mins: (Number(p.hour) % 24) * 60 + Number(p.minute) };
}
