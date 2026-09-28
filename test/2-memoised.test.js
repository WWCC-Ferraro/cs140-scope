// Task 2 — memoised(fn, keyOf = keyFor)
import { test } from "node:test";
import assert from "node:assert/strict";
import { counted, memoised } from "../src/meter.js";
import { priceOf, bundle } from "../src/catalog.js";

// A stand-in for a slow lookup that records every time it really runs.
function spy(fn) {
  const runs = [];
  const s = (...args) => { runs.push(args); return fn(...args); };
  s.runs = runs;
  return s;
}

test("the first call runs fn and returns its result", () => {
  const f = spy(priceOf);
  const m = memoised(f);
  const got = m("C3");
  assert.equal(got, 3000, `memoised(priceOf)("C3") gave ${got}; priceOf("C3") gives 3000.`);
  assert.equal(f.runs.length, 1, `fn ran ${f.runs.length} times for one call.`);
});

test("a repeated call returns the remembered result without running fn", () => {
  const f = spy(priceOf);
  const m = memoised(f);
  m("A1"); m("A1"); m("A1");
  assert.equal(f.runs.length, 1,
    `Three identical calls ran fn ${f.runs.length} times; it should run once. ` +
    "If the cache is empty on every call, it is declared inside the wrapper — made fresh each time it runs.");
});

test("different arguments are remembered separately", () => {
  const f = spy(priceOf);
  const m = memoised(f);
  const a = m("A1"), b = m("B2");
  assert.deepEqual([a, b], [1200, 450], `m("A1") and m("B2") gave ${a} and ${b}.`);
  assert.equal(f.runs.length, 2, `Two different calls should run fn twice; it ran ${f.runs.length} times.`);
});

test("every argument reaches fn and the key, however many there are", () => {
  const f = spy(bundle);
  const m = memoised(f);
  const got = m("A1", "B2", "C3");
  assert.equal(got, bundle("A1", "B2", "C3"),
    `m("A1", "B2", "C3") gave ${got}; bundle gives ${bundle("A1", "B2", "C3")}. Collect every argument, then spread it into the call.`);
  const other = m("A1", "B2", "D4");
  assert.equal(other, bundle("A1", "B2", "D4"),
    `A call differing only in its third argument gave the remembered ${other}. The key must be made from every argument.`);
});

test("a remembered result of 0, undefined or false is still remembered", () => {
  for (const value of [0, undefined, false, ""]) {
    const f = spy(() => value);
    const m = memoised(f);
    m("x"); m("x");
    assert.equal(f.runs.length, 1,
      `fn returning ${JSON.stringify(value) ?? "undefined"} ran ${f.runs.length} times for two identical calls. ` +
      "Asking the cache for a truthy value treats a falsy result as missing — ask whether the key is there, not what it holds.");
  }
});

test("two memoised wrappers never share remembered results", () => {
  const price = memoised(priceOf);
  const doubled = memoised((sku) => priceOf(sku) * 2);
  price("A1");
  const got = doubled("A1");
  assert.equal(got, 2400,
    `The second wrapper returned ${got} for "A1" — the first wrapper's result. ` +
    "Both wrappers are reading one cache. Each call of memoised needs its own; see Closures keep their surroundings.");
});

test("a custom keyOf decides which calls count as the same", () => {
  const f = spy(priceOf);
  const m = memoised(f, (sku) => sku.toUpperCase());
  m("a1");
  const got = m("A1");
  assert.equal(f.runs.length, 1, `With a case-blind keyOf, m("a1") then m("A1") ran fn ${f.runs.length} times.`);
  assert.equal(got, priceOf("a1"), "The second call should return the remembered result.");
});

test("keyOf receives every argument", () => {
  const seen = [];
  const m = memoised(bundle, (...args) => { seen.push(args.length); return args.join("+"); });
  m("A1", "B2", "C3");
  assert.deepEqual(seen, [3], `keyOf received ${seen[0]} argument(s) for a three-argument call.`);
});

test("passing undefined for keyOf uses the default", () => {
  const f = spy(priceOf);
  const m = memoised(f, undefined);
  m("A1"); m("A1");
  assert.equal(f.runs.length, 1,
    "memoised(fn, undefined) should behave like memoised(fn) — a default fires on undefined.");
});

test("size() and clear() report and forget remembered results", () => {
  const f = spy(priceOf);
  const m = memoised(f);
  m("A1"); m("B2"); m("A1");
  assert.equal(m.size(), 2, `After two distinct calls, size() returned ${m.size()}.`);
  m.clear();
  assert.equal(m.size(), 0, `After clear(), size() returned ${m.size()}.`);
  m("A1");
  assert.equal(f.runs.length, 3, "After clear(), a call that was remembered should run fn again.");
});

test("the remembered results are reachable only through size() and clear()", () => {
  const m = memoised(priceOf);
  m("A1");
  const nonFunctions = Object.keys(m).filter((k) => typeof m[k] !== "function");
  assert.deepEqual(nonFunctions, [],
    `The wrapper exposes data properties: ${nonFunctions.join(", ")}. Keep the cache in a binding the wrapper closes over.`);
});

test("memoised and counted combine: the count shows how often the real lookup ran", () => {
  const slow = counted(priceOf);
  const fast = memoised(slow);
  fast("A1"); fast("A1"); fast("B2"); fast("A1");
  assert.equal(slow.calls(), 2,
    `Four calls through the memoiser, two distinct, reached the real lookup ${slow.calls()} times; expected 2.`);
});
