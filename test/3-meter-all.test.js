// Task 3 — meterAll(api, names = Object.keys(api))
import { test } from "node:test";
import assert from "node:assert/strict";
import { meterAll } from "../src/meter.js";
import * as catalog from "../src/catalog.js";

// A plain object with three different functions, so a mix-up shows.
function makeApi() {
  return {
    first: () => "first",
    second: (x) => "second " + x,
    third: (...xs) => "third " + xs.length,
  };
}

test("each wrapper calls its own function, not the last one in the loop", () => {
  const meter = meterAll(makeApi());
  let got;
  try { got = meter.api.first(); } catch (e) { got = e.constructor.name + ": " + e.message; }
  assert.equal(got, "first",
    `meter.api.first() gave ${JSON.stringify(got)}. Each wrapper was made on its own pass of a loop, ` +
    "but it runs later. If it reads a loop counter when it runs, it sees where the loop ended. " +
    "See A closure keeps the binding, not the value — count the bindings.");
});

test("every wrapper returns its own function's result", () => {
  const meter = meterAll(makeApi());
  const got = [meter.api.first(), meter.api.second("x"), meter.api.third(1, 2, 3)];
  assert.deepEqual(got, ["first", "second x", "third 3"], `Got ${JSON.stringify(got)}.`);
});

test("wrappers pass arguments on exactly as given", () => {
  const meter = meterAll(catalog);
  assert.equal(meter.api.shipping("A1"), 500, "shipping(\"A1\") through the meter should use shipping's own default zone.");
  assert.equal(meter.api.shipping("A1", "overseas"), 2000, "shipping(\"A1\", \"overseas\") through the meter should give 2000.");
  assert.equal(meter.api.bundle("A1", "B2", "C3"), catalog.bundle("A1", "B2", "C3"), "bundle through the meter lost arguments.");
});

test("log() records each call's name, in order", () => {
  const meter = meterAll(makeApi());
  meter.api.second("a"); meter.api.first(); meter.api.second("b");
  const got = meter.log();
  assert.deepEqual(got, ["second", "first", "second"],
    `log() returned ${JSON.stringify(got)}. If you see undefined or the same name everywhere, ` +
    "the wrappers are all reading one loop binding when they run.");
});

test("counts() gives every metered name, including ones never called", () => {
  const meter = meterAll(makeApi());
  meter.api.first(); meter.api.first(); meter.api.third();
  assert.deepEqual(meter.counts(), { first: 2, second: 0, third: 1 }, `counts() returned ${JSON.stringify(meter.counts())}.`);
});

test("names chooses which functions are metered", () => {
  const meter = meterAll(makeApi(), ["second"]);
  assert.deepEqual(Object.keys(meter.api), ["second"], `meter.api has ${JSON.stringify(Object.keys(meter.api))}; only "second" was asked for.`);
  meter.api.second("x");
  assert.deepEqual(meter.counts(), { second: 1 }, `counts() returned ${JSON.stringify(meter.counts())}.`);
});

test("leaving names out meters every function on the object", () => {
  const meter = meterAll(catalog);
  assert.deepEqual(Object.keys(meter.api).sort(), ["bundle", "priceOf", "shipping"],
    "With no names given, the default should be every key of api — a default can use a parameter to its left.");
});

test("the original api object is not changed", () => {
  const api = makeApi();
  const original = api.first;
  const meter = meterAll(api);
  meter.api.first();
  assert.equal(api.first, original,
    "api.first was replaced. meter.api must be a new object; the caller's object is theirs. See Copying versus aliasing.");
  assert.notEqual(meter.api, api, "meter.api is the same object as api — build a new one.");
});

test("two meters share nothing", () => {
  const api = makeApi();
  const a = meterAll(api);
  const b = meterAll(api);
  a.api.first(); a.api.first(); b.api.second("x");
  assert.deepEqual(b.log(), ["second"], `The second meter's log is ${JSON.stringify(b.log())}. Each call of meterAll must make its own log.`);
  assert.equal(a.counts().first, 2, `The first meter counted ${a.counts().first} calls of first.`);
  assert.equal(b.counts().first, 0, `The second meter counted ${b.counts().first} calls of first — calls made through the other meter.`);
});

test("changing the array log() returns does not change the meter's log", () => {
  const meter = meterAll(makeApi());
  meter.api.first();
  const seen = meter.log();
  seen.push("forged");
  seen.length = 0;
  assert.deepEqual(meter.log(), ["first"],
    `After a caller changed the array it was given, log() returned ${JSON.stringify(meter.log())}. ` +
    "Handing out the log itself lets anyone rewrite it. Hand out a copy — see Copying versus aliasing.");
});
