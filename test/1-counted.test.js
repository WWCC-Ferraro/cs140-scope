// Task 1 — counted(fn)
import { test } from "node:test";
import assert from "node:assert/strict";
import { counted } from "../src/meter.js";
import { priceOf, shipping, bundle } from "../src/catalog.js";

test("the wrapper returns what fn returns", () => {
  const w = counted(priceOf);
  const got = w("A1");
  assert.equal(got, 1200,
    `counted(priceOf)("A1") gave ${got}; priceOf("A1") gives 1200. ` +
    "The wrapper should hand back fn's result — check that it returns the value of the call.");
});

test("the wrapper passes on any number of arguments", () => {
  const w = counted(bundle);
  const got = w("A1", "B2", "C3", "D4");
  assert.equal(got, bundle("A1", "B2", "C3", "D4"),
    `With four skus the wrapper gave ${got}, but bundle itself gives ${bundle("A1", "B2", "C3", "D4")}. ` +
    "Extra arguments were lost or bundled into one. Look at Rest parameters and spread: collect them all, then spread them into the call.");
});

test("the wrapper passes arguments separately, not as one array", () => {
  const w = counted((a, b) => a + b);
  const got = w(2, 3);
  assert.equal(got, 5,
    `(a, b) => a + b, wrapped and called with (2, 3), gave ${JSON.stringify(got)}. ` +
    "If fn received a single array, the arguments need spreading back out at the call.");
});

test("a missing argument still reaches fn as missing, so fn's default fires", () => {
  const w = counted(shipping);
  const got = w("A1");
  assert.equal(got, 500,
    `counted(shipping)("A1") gave ${got}; shipping("A1") uses its default zone and gives 500. ` +
    "Whatever the caller left out must arrive at fn as undefined — see Parameters, arity and defaults.");
});

test("calls() counts every call", () => {
  const w = counted(priceOf);
  w("A1"); w("B2"); w("A1");
  assert.equal(typeof w.calls, "function", "The wrapper needs a calls() method.");
  assert.equal(w.calls(), 3, `After three calls, calls() returned ${w.calls()}.`);
});

test("the count survives between calls rather than starting again", () => {
  const w = counted(priceOf);
  w("A1");
  const afterOne = w.calls();
  w("A1");
  assert.equal(w.calls(), afterOne + 1,
    `calls() went from ${afterOne} to ${w.calls()} after one more call. If the count keeps resetting, ` +
    "it is declared somewhere that is made fresh on every call. Look at Closures keep their surroundings: which call should make it?");
});

test("two wrappers count separately, even of the same fn", () => {
  const a = counted(priceOf);
  const b = counted(priceOf);
  a("A1"); a("A1"); b("B2");
  assert.deepEqual([a.calls(), b.calls()], [2, 1],
    `Expected a.calls() = 2 and b.calls() = 1; got ${a.calls()} and ${b.calls()}. ` +
    "Two wrappers are sharing one count. Each call of counted must make its own — count the calls that create the binding.");
});

test("reset() starts the count again from 0", () => {
  const w = counted(priceOf);
  w("A1"); w("A1");
  w.reset();
  w("A1");
  assert.equal(w.calls(), 1, `After reset() and one call, calls() returned ${w.calls()}.`);
});

test("the count is reachable only through calls() and reset()", () => {
  const w = counted(priceOf);
  w("A1");
  const nonFunctions = Object.keys(w).filter((k) => typeof w[k] !== "function");
  assert.deepEqual(nonFunctions, [],
    `The wrapper has data properties anyone can overwrite: ${nonFunctions.join(", ")}. ` +
    "Keep the count as a binding the wrapper closes over, not as a property of the wrapper.");
});
