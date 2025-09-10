export const MAX_ITEMS =
  Number(process.env.NEXT_PUBLIC_MAX_ITEMS ?? "100");

export const FETCH_TIMEOUT_MS =
  Number(process.env.FETCH_TIMEOUT_MS ?? "8000"); // 8s

export const PER_FEED_CACHE_MS =
  Number(process.env.PER_FEED_CACHE_MS ?? "120000"); // 2m
