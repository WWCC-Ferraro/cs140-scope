// Task 4 — an honest key
import { test } from "node:test";
import assert from "node:assert/strict";
import { keyFor, memoised } from "../src/meter.js";
import { shipping } from "../src/catalog.js";

test("undefined and null give different keys", () => {
  const a = keyFor("A1", undefined), b = keyFor("A1", null);
  assert.notEqual(a, b,
    `keyFor("A1", undefined) and keyFor("A1", null) are both ${JSON.stringify(a)}. ` +
    "A default fires on undefined and not on null, so these two calls can return different things.");
});

test("a call with null is not answered from a call with undefined", () => {
  const m = memoised(shipping);
  m("A1", undefined);                      // the default zone: 500
  const got = m("A1", null);
  assert.equal(got, shipping("A1", null),
    `m("A1", null) returned ${got}, the remembered answer for m("A1", undefined). ` +
    `shipping("A1", null) is ${shipping("A1", null)}: null is a value, so shipping's default did not fire.`);
});

test("a number and the same digits as a string give different keys", () => {
  assert.notEqual(keyFor(1), keyFor("1"), `keyFor(1) and keyFor("1") are both ${JSON.stringify(keyFor(1))}.`);
});

test("one argument containing a comma is not two arguments", () => {
  assert.notEqual(keyFor("a,b"), keyFor("a", "b"),
    `keyFor("a,b") and keyFor("a", "b") are both ${JSON.stringify(keyFor("a", "b"))}. ` +
    "Whatever separates the arguments must not be something an argument can contain.");
});

test("the same arguments still give the same key", () => {
  assert.equal(keyFor("A1", "overseas"), keyFor("A1", "overseas"));
  assert.equal(keyFor({ sku: "A1" }, [1, 2]), keyFor({ sku: "A1" }, [1, 2]),
    "Two calls with equal objects and arrays should share a key, as JSON gives them.");
});

test("the text \"undefined\" is not the value undefined", () => {
  assert.notEqual(keyFor("undefined"), keyFor(undefined),
    `keyFor("undefined") and keyFor(undefined) are both ${JSON.stringify(keyFor(undefined))}.`);
});
