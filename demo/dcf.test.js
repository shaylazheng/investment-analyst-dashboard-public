/* The DCF arithmetic, against answers computable by hand.
 *
 * The load-bearing property is the round trip: feed evOf() a growth rate, hand
 * the resulting EV to impliedGrowth(), and get the same rate back. That is the
 * whole surface in one assertion — if the inverse does not invert, every
 * "implied growth" number on the page is decoration.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evOf, impliedGrowth, fairValue, inputsFrom, growthAt } from './dcf.js';

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} !~ ${b}`);

const BASE = { revenue: 1000, margin: 0.20, years: 10, wacc: 0.09, terminal: 0.025 };

/* ---- the forward direction ---------------------------------------------- */

test('a single year with no terminal growth is just the discounted perpetuity', () => {
  // One year, zero growth: FCF_1 = 1000 * 0.2 = 200.
  // PV of the explicit stage = 200/1.09.
  // TV = 200 * 1.0 / (0.09 - 0) = 2222.22..., discounted one year.
  const ev = evOf({ revenue: 1000, margin: 0.2, growth: 0, years: 1, wacc: 0.09, terminal: 0 });
  const expected = 200 / 1.09 + (200 / 0.09) / 1.09;
  near(ev, expected, 1e-9);
});

test('EV rises monotonically with growth, which is what makes bisection safe', () => {
  let prev = -Infinity;
  for (const g of [-0.2, -0.05, 0, 0.05, 0.15, 0.3, 0.6]) {
    const ev = evOf({ ...BASE, growth: g });
    assert.ok(ev > prev, `EV should increase at g=${g}`);
    prev = ev;
  }
});

test('the model is undefined when the discount rate does not exceed terminal growth', () => {
  // Otherwise the perpetuity diverges and the "value" is whatever the sign of
  // a negative denominator makes it — worse than no answer.
  assert.equal(evOf({ ...BASE, growth: 0.1, wacc: 0.03, terminal: 0.03 }), null);
  assert.equal(evOf({ ...BASE, growth: 0.1, wacc: 0.02, terminal: 0.04 }), null);
});

test('a higher discount rate lowers the value', () => {
  const cheap = evOf({ ...BASE, growth: 0.1, wacc: 0.07 });
  const dear = evOf({ ...BASE, growth: 0.1, wacc: 0.12 });
  assert.ok(dear < cheap);
});

/* ---- the inverse -------------------------------------------------------- */

test('impliedGrowth inverts evOf exactly — the round trip', () => {
  for (const g of [-0.10, 0, 0.05, 0.12, 0.25, 0.40, 0.80]) {
    const ev = evOf({ ...BASE, growth: g });
    const { growth, reason } = impliedGrowth({ ...BASE, targetEv: ev });
    assert.equal(reason, null, `no reason expected at g=${g}`);
    near(growth, g, 1e-6);
  }
});

test('the round trip survives a different horizon and discount rate', () => {
  const cfg = { revenue: 5000, margin: 0.08, years: 5, wacc: 0.11, terminal: 0.02 };
  const ev = evOf({ ...cfg, growth: 0.33 });
  near(impliedGrowth({ ...cfg, targetEv: ev }).growth, 0.33, 1e-6);
});

test('a price above what the model can reach is reported as bounded, not as a number', () => {
  const r = impliedGrowth({ ...BASE, targetEv: 1e18 });
  assert.equal(r.bounded, 'high');
  assert.ok(r.reason);
});

test('a negative-FCF company is refused rather than bounded', () => {
  // Every cash flow on the path is negative, so no growth rate produces a
  // positive EV. Returning the floor would look like an answer.
  const r = impliedGrowth({ ...BASE, margin: -0.05, targetEv: 1000 });
  assert.equal(r.growth, null);
  assert.match(r.reason, /negative/);
});

test('impliedGrowth refuses incomplete inputs instead of guessing', () => {
  assert.equal(impliedGrowth({ ...BASE, targetEv: 0 }).growth, null);
  assert.equal(impliedGrowth({ ...BASE, revenue: 0, targetEv: 100 }).growth, null);
  assert.equal(impliedGrowth({ ...BASE, targetEv: 100, wacc: 0.02, terminal: 0.03 }).growth, null);
});

/* ---- equity bridge ------------------------------------------------------ */

test('fairValue bridges enterprise value to a per-share number', () => {
  const ev = evOf({ ...BASE, growth: 0.1 });
  const { equity, perShare } = fairValue({ ...BASE, growth: 0.1, netDebt: 500, shares: 100 });
  near(equity, ev - 500, 1e-9);
  near(perShare, (ev - 500) / 100, 1e-9);
});

test('net cash lifts equity above enterprise value', () => {
  const ev = evOf({ ...BASE, growth: 0.1 });
  const { equity } = fairValue({ ...BASE, growth: 0.1, netDebt: -200, shares: 100 });
  near(equity, ev + 200, 1e-9);
});

/* ---- input assembly ----------------------------------------------------- */

test('inputsFrom builds FCF from cash flow, not earnings', () => {
  const i = inputsFrom({ revenue: 1000, cfo: 300, capex: 100, cash: 50, debt: 200, shares: 10, price: 100 });
  near(i.fcf, 200);
  near(i.margin, 0.2);
  near(i.netDebt, 150);
  near(i.marketCap, 1000);
});

test('the DCF target is enterprise value, so debt is added to market cap', () => {
  // Discounting a cash flow stream and comparing it to market CAP values the
  // debt at zero, which flatters every levered company.
  const i = inputsFrom({ revenue: 1000, cfo: 300, capex: 100, cash: 0, debt: 400, shares: 10, price: 100 });
  near(i.ev, 1400);
});

test('a net-cash company has an enterprise value below its market cap', () => {
  const i = inputsFrom({ revenue: 1000, cfo: 300, capex: 100, cash: 600, debt: 100, shares: 10, price: 100 });
  near(i.netDebt, -500);
  near(i.ev, 500);
});

test('missing pieces propagate as null rather than as zero', () => {
  const i = inputsFrom({ revenue: 1000, cfo: null, capex: 100, shares: 10, price: 100 });
  assert.equal(i.fcf, null);
  assert.equal(i.margin, null);
});

/* ---- an end-to-end case on real-shaped numbers -------------------------- */

test('NVDA-shaped inputs produce a sane implied growth', () => {
  // The levels /api/peers/provenance actually returns, rounded.
  const i = inputsFrom({
    revenue: 253_491e6, cfo: 125_648e6, capex: 6_572e6,
    cash: 13_237e6, debt: 7_470e6, shares: 24_300e6, price: 200.75,
  });
  near(i.fcf, 119_076e6);
  assert.ok(i.margin > 0.46 && i.margin < 0.48, `margin ${i.margin}`);
  assert.ok(i.netDebt < 0, 'net cash');

  const { growth, reason } = impliedGrowth({
    targetEv: i.ev, revenue: i.revenue, margin: i.margin,
    years: 10, wacc: 0.09, terminal: 0.025,
  });
  assert.equal(reason, null);
  // Sanity, not a claim about NVDA: a ~41x EV/FCF multiple has to imply real
  // growth, and a two-stage model should not need a triple-digit rate for it.
  assert.ok(growth > 0.05 && growth < 0.60, `implied growth ${growth}`);

  // And it round-trips back to the price that produced it.
  near(evOf({ revenue: i.revenue, margin: i.margin, growth, years: 10, wacc: 0.09, terminal: 0.025 }),
       i.ev, i.ev * 1e-9);
});

/* ---- the refusals ------------------------------------------------------- */

/* These live in the route rather than here, but the classifier they depend on
 * is ratios.js's, and the mapping from SIC to "do not model this way" is the
 * part worth pinning: it is the difference between a blank cell and a
 * confidently wrong -4.1% implied growth. */
import { sectorProfile } from '@markets/core/lib/ratios.js';

test('the SIC ranges that must never be modelled as a DCF', () => {
  // ZION and JPM are national commercial banks; CFO for a bank carries deposit
  // and loan flows, so "CFO less capex" is not free cash flow.
  assert.equal(sectorProfile('6021'), 'bank');
  assert.equal(sectorProfile('6022'), 'bank');
  assert.equal(sectorProfile('6199'), 'general');   // just outside the range
  // Berkshire files under fire/marine/casualty insurance.
  assert.equal(sectorProfile('6331'), 'insurance');
  assert.equal(sectorProfile('6798'), 'reit');
  // Semiconductors are modellable.
  assert.equal(sectorProfile('3674'), 'general');
});

test('an unknown or absent SIC falls back to general rather than refusing', () => {
  // Refusing on a missing classification would silently blank every filer SEC
  // has not categorised, which is a much bigger set than the financials.
  assert.equal(sectorProfile(null), 'general');
  assert.equal(sectorProfile(''), 'general');
  assert.equal(sectorProfile('not-a-sic'), 'general');
});

/* ---- growth fade -------------------------------------------------------- */

test('fade off reproduces the flat model exactly', () => {
  // The whole existing suite depends on this, so it is asserted rather than
  // assumed.
  for (const t of [1, 5, 10]) near(growthAt(t, 10, 0.3, 0.025, false), 0.3, 1e-12);
  near(evOf({ ...BASE, growth: 0.2, fade: false }),
       evOf({ ...BASE, growth: 0.2 }), 1e-12);
});

test('fade runs from the initial rate to the terminal rate', () => {
  // Nothing grows 30% for a decade and then 2.5% for ever; the fade makes the
  // handoff into the perpetuity continuous instead of a cliff.
  near(growthAt(1, 10, 0.30, 0.025, true), 0.30, 1e-12);
  near(growthAt(10, 10, 0.30, 0.025, true), 0.025, 1e-12);
  near(growthAt(5, 10, 0.30, 0.025, true), 0.30 + (0.025 - 0.30) * (4 / 9), 1e-12);
});

test('a faded path is worth less than a flat one at the same initial rate', () => {
  const flat = evOf({ ...BASE, growth: 0.30, fade: false });
  const faded = evOf({ ...BASE, growth: 0.30, fade: true });
  assert.ok(faded < flat, 'decaying growth must be worth less');
});

test('the round trip holds under a fade too', () => {
  // If the inverse stops inverting when fade is on, every implied growth on
  // the surface silently becomes decoration.
  for (const g of [0, 0.08, 0.25, 0.55]) {
    const ev = evOf({ ...BASE, growth: g, fade: true });
    const r = impliedGrowth({ ...BASE, targetEv: ev, fade: true });
    assert.equal(r.reason, null);
    near(r.growth, g, 1e-6);
  }
});

test('EV stays monotonic in the initial rate under a fade, which is what keeps bisection valid', () => {
  let prev = -Infinity;
  for (const g of [-0.1, 0, 0.1, 0.3, 0.6, 1.0]) {
    const ev = evOf({ ...BASE, growth: g, fade: true });
    assert.ok(ev > prev, `EV must increase at g=${g}`);
    prev = ev;
  }
});

test('a fade implies a HIGHER initial rate for the same price', () => {
  // Same market cap, less growth in the later years, so the early years must
  // carry more. This is the number that changes on screen when fade is on.
  const ev = evOf({ ...BASE, growth: 0.20, fade: false });
  const flat = impliedGrowth({ ...BASE, targetEv: ev, fade: false }).growth;
  const faded = impliedGrowth({ ...BASE, targetEv: ev, fade: true }).growth;
  near(flat, 0.20, 1e-6);
  assert.ok(faded > flat, `faded ${faded} should exceed flat ${flat}`);
});

/* ---- dilution ----------------------------------------------------------- */

test('dilution compounds over the horizon and lowers value per share', () => {
  const none = fairValue({ ...BASE, growth: 0.1, netDebt: 0, shares: 100, dilution: 0 });
  const some = fairValue({ ...BASE, growth: 0.1, netDebt: 0, shares: 100, dilution: 0.02 });
  near(some.futureShares, 100 * 1.02 ** 10, 1e-9);
  // Ten years at 2% is 22% more shares — not a rounding error.
  near(some.perShare, none.perShare / 1.02 ** 10, 1e-9);
  assert.ok(some.perShare < none.perShare);
});

test('buybacks are expressible as negative dilution', () => {
  const shrink = fairValue({ ...BASE, growth: 0.1, netDebt: 0, shares: 100, dilution: -0.03 });
  assert.ok(shrink.futureShares < 100);
  assert.ok(shrink.perShare > fairValue({ ...BASE, growth: 0.1, netDebt: 0, shares: 100 }).perShare);
});

test('the enterprise value is untouched by dilution', () => {
  // Dilution divides the equity differently; it does not change what the
  // business is worth. Conflating the two would double-count it.
  const a = fairValue({ ...BASE, growth: 0.1, netDebt: 0, shares: 100, dilution: 0 });
  const b = fairValue({ ...BASE, growth: 0.1, netDebt: 0, shares: 100, dilution: 0.05 });
  near(a.ev, b.ev, 1e-9);
  near(a.equity, b.equity, 1e-9);
});
