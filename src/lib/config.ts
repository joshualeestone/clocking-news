// src/lib/config.ts
export const MAX_ITEMS = (() => {
  const raw = process.env.NEXT_PUBLIC_MAX_ITEMS ?? "";
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 100; // default to 100
})();
