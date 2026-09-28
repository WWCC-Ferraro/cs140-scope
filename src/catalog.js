// catalog.js — a small shop's price lookups. You do not change this file.
//
// Pretend each of these is slow: a database query, a call to a supplier. The
// wrappers you build in meter.js exist so that the shop can see how often each
// one really runs, and stop running the same lookup twice.
//
// Look at the three signatures. Between them they take one argument, an
// optional second argument with a default, and any number of arguments. A
// wrapper that works for all three has to pass arguments on exactly as it got
// them.

const PRICES = { A1: 1200, B2: 450, C3: 3000, D4: 99 };   // in cents
const RATES = { domestic: 500, overseas: 2000, pickup: 0 };

/** The price of one item, in cents. An unknown sku costs 0. */
export function priceOf(sku) {
  return PRICES[sku] ?? 0;
}

/**
 * What it costs to ship one item, in cents. `zone` defaults to "domestic".
 * An unknown zone — including null — ships nowhere, so it costs nothing.
 */
export function shipping(sku, zone = "domestic") {
  if (!(sku in PRICES)) return 0;
  return RATES[zone] ?? 0;
}

/** The price of several items bought together: 10% off for three or more. */
export function bundle(...skus) {
  let total = 0;
  for (const sku of skus) total += priceOf(sku);
  return skus.length >= 3 ? Math.round(total * 0.9) : total;
}
