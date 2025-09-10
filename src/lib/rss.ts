import { FEEDS } from "./feeds";
import { XMLParser } from "fast-xml-parser";
import he from "he";
import { MAX_ITEMS, FETCH_TIMEOUT_MS, PER_FEED_CACHE_MS } from "./config";

export type Item = {
  id: string;
  title: string;
  link: string;
  pubDate: number;
  source: string;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: true,
});

function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, "");
}

function normalizeItem(raw: any, source: string): Item {
  const rawTitle = String(raw?.title ?? "").trim();
  const title = stripTags(he.decode(rawTitle));

  const rawLink =
    raw?.link?.["@_href"] ||
    raw?.link ||
    (raw?.guid?.["@_isPermaLink"] === "true" ? raw?.guid : raw?.guid) ||
    "";

  const link = typeof rawLink === "string" ? rawLink : String(rawLink || "");

  const pub =
    raw?.pubDate || raw?.published || raw?.updated || raw?.["dc:date"] || null;

  return {
    id: (link || title).slice(0, 400),
    title,
    link,
    pubDate: pub ? new Date(pub).getTime() : 0,
    source,
  };
}

// simple in-memory per-feed cache (works in a single serverless run)
const FEED_CACHE = new Map<string, { expires: number; items: Item[] }>();

async function fetchWithTimeout(url: string, ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, next: { revalidate: 60 } });
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

async function readOne(url: string): Promise<Item[]> {
  const cached = FEED_CACHE.get(url);
  const now = Date.now();
  if (cached && cached.expires > now) return cached.items;

  try {
    const xml = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    const data = parser.parse(xml);
    const items =
      data?.rss?.channel?.item ??
      data?.feed?.entry ??
      data?.channel?.item ??
      [];
    const arr = Array.isArray(items) ? items : [items];
    const normalized = arr.map((it) => normalizeItem(it, url));
    FEED_CACHE.set(url, { expires: now + PER_FEED_CACHE_MS, items: normalized });
    return normalized;
  } catch {
    return [];
  }
}

export async function readAllFeeds(limit = MAX_ITEMS): Promise<Item[]> {
  const lists = await Promise.all(FEEDS.map(readOne));
  const flat = lists.flat().filter((x) => x.title && x.link);

  // de-dupe by normalized link
  const seen = new Set<string>();
  const deduped = flat.filter((x) => {
    const key = x.link.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => b.pubDate - a.pubDate);
  return deduped.slice(0, limit);
}
