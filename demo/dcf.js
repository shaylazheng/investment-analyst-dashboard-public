/* Reverse DCF arithmetic. Pure — no HTTP, no files, no clock.
 *
 * The surface this feeds asks the question the other way round from a normal
 * model. Instead of "what do I think this is worth", it asks: at today's
 * price, what growth rate is the market already paying for? That number is
 * falsifiable in a way a fair value estimate is not — you can say "I don't
 * believe 34% for eight years" without having to defend a target price.
 *
 * A two-stage FCF model, deliberately the simplest one that is honest:
 *
 *   FCF_t = revenue_0 · (1+g)^t · margin          for t = 1..N
 *   TV    = FCF_N · (1+g_term) / (r − g_term)
 *   EV    = Σ FCF_t/(1+r)^t + TV/(1+r)^N
 *
 * Margin is held flat on purpose. Letting both growth and margin vary makes
 * the answer unidentifiable — infinitely many (growth, margin) pairs hit the
 * same EV — so one has to be pinned, and margin is the one you can observe
 * today. The surface says so.
 */

/** The growth rate applied in year t under a linear fade.
 *
 *  Constant growth for a decade is the model's biggest lie: nothing grows 30%
 *  a year for ten years and then 2.5% for ever. `fade` interpolates linearly
 *  from the initial rate down to the terminal rate across the horizon, so the
 *  handoff into the perpetuity is continuous rather than a cliff.
 *
 *  fade = false reproduces the flat model exactly, which is what keeps the
 *  original tests meaningful.
 */
export function growthAt(t, years, growth, terminal, fade) {
  if (!fade || years <= 1) return growth;
  // Year 1 is the initial rate; year `years` is the terminal rate.
  return growth + ((terminal - growth) * (t - 1)) / (years - 1);
}

/** Enterprise value of a growth path. The forward direction. */
export function evOf({ revenue, margin, growth, years, wacc, terminal, fade = false }) {
  if (!(wacc > terminal)) return null;      // the perpetuity diverges otherwise
  if (!(years > 0) || revenue == null || margin == null) return null;

  let pv = 0;
  let rev = revenue;
  let fcfN = 0;
  for (let t = 1; t <= years; t++) {
    rev *= 1 + growthAt(t, years, growth, terminal, fade);
    const fcf = rev * margin;
    pv += fcf / (1 + wacc) ** t;
    fcfN = fcf;
  }
  const tv = (fcfN * (1 + terminal)) / (wacc - terminal);
  return pv + tv / (1 + wacc) ** years;
}

/* The bracket for the search. Wider than any real company on either end: a
 * business shrinking 90% a year, or growing 16x a year, is outside the range
 * where a two-stage model means anything, and reporting the bound is more
 * honest than reporting the number at the bound. */
const LO = -0.90, HI = 15.0;

/** The inverse: the growth rate that makes the model reproduce `targetEv`.
 *
 *  Bisection rather than a closed form. EV is strictly increasing in growth
 *  once wacc > terminal, so bisection cannot land on the wrong root, and it
 *  cannot diverge the way Newton can when the terminal value dominates. 200
 *  iterations puts the answer well inside floating-point noise.
 */
export function impliedGrowth({ targetEv, revenue, margin, years, wacc, terminal, fade = false }) {
  if (!(targetEv > 0) || !(revenue > 0) || margin == null || !(wacc > terminal)) {
    return { growth: null, reason: 'inputs incomplete or wacc <= terminal growth' };
  }
  // A company burning cash cannot be valued this way: every FCF on the path is
  // negative, so no growth rate produces a positive EV. Say that rather than
  // returning a bound that looks like an answer.
  if (margin <= 0) {
    return { growth: null, reason: 'trailing free cash flow is negative, so no growth rate reproduces a positive value' };
  }

  /* Under a fade this solves for the INITIAL rate, since every later year is
     a fixed interpolation of it. EV is still strictly increasing in that rate
     — the fade is a monotone linear map — so bisection remains valid. */
  const f = (g) => evOf({ revenue, margin, growth: g, years, wacc, terminal, fade });
  const evLo = f(LO), evHi = f(HI);
  if (evLo == null || evHi == null) return { growth: null, reason: 'model undefined at the bracket' };
  if (targetEv < evLo) return { growth: LO, reason: 'below the model floor', bounded: 'low' };
  if (targetEv > evHi) return { growth: HI, reason: 'above the model ceiling', bounded: 'high' };

  let lo = LO, hi = HI;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < targetEv) lo = mid; else hi = mid;
  }
  return { growth: (lo + hi) / 2, reason: null };
}

/** Equity value per share implied by a growth assumption — the forward
 *  direction, for the "what would I pay" half of the surface. */
export function fairValue({ revenue, margin, growth, years, wacc, terminal,
                           netDebt, shares, dilution = 0, fade = false }) {
  const ev = evOf({ revenue, margin, growth, years, wacc, terminal, fade });
  if (ev == null || !(shares > 0)) return { ev: null, equity: null, perShare: null };
  const equity = ev - (netDebt || 0);
  /* Share count grows with stock compensation at most of these companies, and
     the value accrues to a larger denominator than today's. Ignoring it makes
     every per-share figure optimistic by exactly the compounded dilution --
     which over ten years at 2% is 22%, not a rounding error. */
  const future = shares * (1 + dilution) ** years;
  return { ev, equity, perShare: equity / future, futureShares: future };
}

/** What the inputs are, assembled from raw XBRL levels. Kept here so the route
 *  stays a transport layer and this stays testable. */
export function inputsFrom({ revenue, cfo, capex, cash, debt, shares, price }) {
  // FCF is cash from operations less capex. Not net income: the whole point of
  // discounting cash is that earnings can be accrued and cash cannot.
  const fcf = cfo != null && capex != null ? cfo - capex : null;
  const margin = fcf != null && revenue ? fcf / revenue : null;
  const netDebt = (debt || 0) - (cash || 0);
  const marketCap = shares != null && price != null ? shares * price : null;
  // Enterprise value is what a DCF produces, so the target has to be EV too.
  // Comparing a discounted cash flow stream against market CAP silently values
  // the debt at zero.
  const ev = marketCap != null ? marketCap + netDebt : null;
  return { revenue, fcf, margin, netDebt, marketCap, ev, shares, price };
}
