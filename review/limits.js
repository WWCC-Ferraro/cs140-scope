// limits.js — request limits for the shop's API. Written by a teammate.
// Each user gets a budget per route; a scheduler elsewhere calls reset() on
// every limiter once a minute. Not wired in yet: this is the version up for review.

const perMinute = 5;

export function makeLimiter(perMinute = perMinute) {
  const used = new Map();

  return {
    allow(user, cost = 1) {
      const spent = (used.get(user) ?? 0) + cost;
      if (spent > perMinute) return false;
      used.set(user, spent);
      return true;
    },
    reset() {
      used.clear();
    },
    usage() {
      return used;
    },
  };
}

// cost is how much of the budget one request uses; null means the normal cost.
// A route with no max gets the shop-wide default.
export const routes = [
  { path: "/search", max: 20, cost: 2 },
  { path: "/price", max: 60, cost: null },
  { path: "/cart", cost: null },
];

export function limitRoutes(table) {
  const handlers = {};
  for (var i = 0; i < table.length; i++) {
    const limiter = makeLimiter(table[i].max);
    handlers[table[i].path] = function (user) {
      return limiter.allow(user, table[i].cost) ? "ok" : "slow down";
    };
  }
  return handlers;
}
