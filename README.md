# Count and cache

A small shop has three slow price lookups in `src/catalog.js`. You will build
wrappers for them in `src/meter.js`. One counts how often a function really
runs. One remembers results so the same lookup never runs twice. One meters a
whole set of functions at once and keeps a log.

Each wrapper is a function that behaves like the one it wraps but remembers
something between calls. So every task comes down to this module's questions.
Where does the memory live? Which call made it? Which functions share it? What
does each name mean when the code finally runs? And the wrappers must pass
arguments on exactly as they got them: none, one, a missing one that should
fall back to its default, or any number.

## Getting started

1. Open **your repository**. It is made for you: private, and named for this
   homework, the term and your username — `<term>-cs140-scope-<you>`. On
   [this homework's page](https://wwcc.dev/#/lesson/scope-assignment), type your GitHub
   username and click **Open my Codespace**. On your own computer, clone it
   with GitHub Desktop (**Code**, then **Open with GitHub Desktop**) and check
   that `node --version` prints 22 or later. Start Here's *How a homework works*
   walks through both.
2. Run the tests:

```bash
npm test
```

Nothing to install. At first almost every test fails, because the starter
throws `not implemented`. The tests also run on every push, and you can see
the results in your repository's **Actions** tab.

The tests are part of the spec. Each task has its own file in `test/`, and
each test's name says what it checks. When one fails, read its message: it
says what came back, and which idea to look at.

## Using an AI assistant

`AGENTS.md` in this repository tells AI coding assistants how this course wants
them to help: as a tutor who explains errors, asks questions and gives hints,
not by writing your answers. Most assistants read it automatically. It is in
the open, so read it too. It says what good AI help looks like.

## The tasks

Do them in order. Each one uses the one before.

### Task 1 — Count the calls

Write `counted(fn)` in `src/meter.js`. It returns a wrapper that calls `fn`
with every argument it was given, returns `fn`'s result, and counts its calls.
The wrapper has two methods: `calls()` returns the count and `reset()` sets it
back to 0.

```js
const price = counted(priceOf);
price("A1");        // 1200
price("B2");        // 450
price.calls();      // 2
```

Two wrappers count separately, even of the same function. Nothing outside may
reach the count except through `calls()` and `reset()`.

Tests: `test/1-counted.test.js`.

### Task 2 — Remember the results

Write `memoised(fn, keyOf = keyFor)`. The first call with some arguments runs
`fn` and remembers the result. A later call with the same key returns the
remembered result without running `fn`. The key comes from
`keyOf(...args)`; the default, `keyFor`, is written for you.

```js
const slow = counted(priceOf);
const fast = memoised(slow);
fast("A1"); fast("A1"); fast("B2"); fast("A1");
slow.calls();       // 2 — the real lookup ran once per distinct sku
```

The wrapper has `size()` and `clear()`. Remember every result, including `0`,
`""`, `false` and `undefined`: a lookup that answered "nothing" still
answered. Two memoised wrappers never share results.

Tests: `test/2-memoised.test.js`.

### Task 3 — Meter a whole object

Write `meterAll(api, names = Object.keys(api))`. It returns a meter whose
`api` property is a new object with one wrapper for each name. The meter keeps
one log of which wrapper was called, in order.

```js
import * as catalog from "./catalog.js";   // an object: { bundle, priceOf, shipping }

const meter = meterAll(catalog);
meter.api.priceOf("A1");
meter.api.bundle("A1", "B2", "C3");
meter.api.priceOf("D4");
meter.log();        // ["priceOf", "bundle", "priceOf"]
meter.counts();     // { bundle: 1, priceOf: 2, shipping: 0 }
```

You will make the wrappers in a loop, and each one runs long after the loop
has finished. Each one has to know its own name when it runs. The caller's
`api` object must not change. And the array `log()` returns belongs to the
caller: changing it must not change the meter's log.

Tests: `test/3-meter-all.test.js`.

### Task 4 — An honest key

`keyFor` turns the arguments into a string with `JSON.stringify`. That has a
flaw that Task 2's tests do not hit:

```js
keyFor("A1", undefined);   // '["A1",null]'
keyFor("A1", null);        // '["A1",null]'
```

JSON writes `undefined` inside an array as `null`. But the two calls are not
the same call. `shipping("A1", undefined)` fires the default zone and costs
500. `shipping("A1", null)` does not, and costs 0. A memoised `shipping` hands
back 500 for both.

Rewrite `keyFor` so different arguments give different keys. Keep it one
string, and keep the same arguments giving the same key.

One question the tests leave to you: should `f(x)` and `f(x, undefined)` share
a key? A parameter cannot tell them apart. A rest parameter can:
`((...xs) => xs.length)` returns 1 for the first and 2 for the second. Decide,
make `keyFor` do it, and defend the choice in **Your answers** below.

Tests: `test/4-keys.test.js`.

## The review

`review/limits.js` was written by a teammate. It limits how many requests each
user may make to each route of the shop's API. It has four defects. Three are
about names, scope and closures; one is from earlier in the course.

Write your review in `REVIEW.md`, one section per defect:

- **Lines** — which lines are involved.
- **What goes wrong** — the mechanism, in a sentence or two.
- **An input that shows it** — a concrete call and what it produces.
- **The fix** — what to change, and why that fixes the mechanism.

Run the file to check your inputs. No test reads `REVIEW.md`; a person does.
Write it for the teammate, who should be able to act on each finding without
asking you anything.

## Your answers

Fill these in, here in this README. A sentence or two each.

1. **Task 4:** do `f(x)` and `f(x, undefined)` share a key in your `keyFor`?
   Why is that the right choice for a memoiser that wraps any function?

   *Your answer:*

2. **Task 3:** you call `meterAll` twice. How many `log` bindings exist, and
   which functions can reach each one?

   *Your answer:*

3. **Task 1:** a caller writes `price.count = 0` on your counting wrapper.
   What happens to the count, and why?

   *Your answer:*

## What "done" means

- `npm test` passes, every test.
- `REVIEW.md` has all four findings, each with lines, mechanism, input and fix.
- The three answers above are filled in.
