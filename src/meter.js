// meter.js — wrappers that remember.
//
// Every function here takes a function and gives back a new one that behaves
// the same to its caller, but remembers something between calls. Where that
// memory lives — which scope, made by which call — is the whole assignment.
//
// Replace each `throw new Error("not implemented")` with a real body.
// README.md has the tasks in order; the tests in test/ say exactly what each
// function must do.

/**
 * Task 1. Wrap `fn` so every call is counted.
 *
 * The wrapper passes on every argument it is given, exactly as it got them
 * — none, one, or many — and returns whatever `fn` returns.
 *
 * The wrapper also carries two methods:
 *   wrapper.calls()  how many times the wrapper has been called
 *   wrapper.reset()  start the count again from 0
 *
 * The count must be reachable only through those two methods. Two wrappers,
 * even of the same `fn`, count separately.
 *
 * @param {Function} fn
 * @returns {Function} the counting wrapper
 */
export function counted(fn) {
  throw new Error("not implemented");
}

/**
 * The default cache key: every argument, in order, as one string.
 * Two calls with the same key are treated as the same call.
 *
 * Given, and good enough for Task 2. Task 4 finds out where it is wrong.
 *
 * @param {...*} args
 * @returns {string}
 */
export function keyFor(...args) {
  return JSON.stringify(args);
}

/**
 * Task 2. Wrap `fn` so a repeated call returns the remembered result instead
 * of running `fn` again.
 *
 * Each call works out a key with `keyOf`, passing it every argument. If a
 * call with that key has happened before, return the result it produced —
 * whatever that result was — without calling `fn`. Otherwise call `fn` with
 * every argument, remember the result under the key, and return it.
 *
 * `keyOf` defaults to `keyFor`.
 *
 * The wrapper also carries two methods:
 *   wrapper.size()   how many results are remembered
 *   wrapper.clear()  forget them all
 *
 * The remembered results must be reachable only through those methods. Two
 * wrappers never share remembered results.
 *
 * @param {Function} fn
 * @param {Function} [keyOf=keyFor]
 * @returns {Function} the remembering wrapper
 */
export function memoised(fn, keyOf = keyFor) {
  throw new Error("not implemented");
}

/**
 * Task 3. Meter several functions of one object at once.
 *
 * Returns a meter:
 *   meter.api     a NEW object with one wrapper for each name in `names`.
 *                 Calling meter.api[name](...) calls api[name] with the same
 *                 arguments and returns its result.
 *   meter.log()   the names of the metered calls so far, in the order they
 *                 happened, as an array
 *   meter.counts() an object with one property per metered name: how many
 *                 times it has been called (0 if never)
 *
 * `names` defaults to every key of `api`. The original `api` object is not
 * changed. Every wrapper in one meter writes to that meter's one log; two
 * meters share nothing.
 *
 * @param {Object} api   an object whose properties are functions
 * @param {string[]} [names=Object.keys(api)]
 * @returns {{ api: Object, log: () => string[], counts: () => Object }}
 */
export function meterAll(api, names = Object.keys(api)) {
  throw new Error("not implemented");
}
