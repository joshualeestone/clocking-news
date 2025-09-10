import { FEEDS } from "./feeds";
import { XMLParser } from "fast-xml-parser";
import he from "he";
import { MAX_ITEMS } from "./config";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: true,
});

const TIMEOUT_MS = 8000; // abort any single feed after 8s

function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, "");
}

// Safely convert various node shapes to plain text
function toText(v: any): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return toText(v[0]);
  if (typeof v === "object") {
    return (
      v["#text"] ??
      v["_text"] ??
      v["$text"] ??
      v["__cdata"] ??
      v["_cdata"] ??
      v["#cdata"] ??
      v["cdata"] ??
      ""
    );
  }
  return "";
}

// Normalize link (Atom, RSS2, arrays, or objects)
function extractLink(v: any): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    const cand =
      v.find((l: any) => (l?.["@_rel"] ?? "alternate") === "alternate") ?? v[0];
    return cand?.["@_href"] ?? cand?.href ?? "";
  }
  if (v && typeof v === "object") return v["@_href"] ?? v.href ?? "";
  return "";
}

function normalizeItem(raw: any, source: string) {
  const rawTitleNode = raw?.title ?? raw?.summary ?? raw?.description ?? "";
  const title = stripTags(he.decode(toText(rawTitleNode))).trim();

  const rawLinkNode =
    raw?.link ??
    (raw?.guid?.["@_isPermaLink"] === "true" ? raw?.guid : raw?.guid) ??
    raw?.id ??
    "";
  const link = extractLink(rawLinkNode);

  const pubNode =
    raw?.pubDate || raw?.published || raw?.updated || raw?.["dc:date"] || null;
  const pubDate = pubNode ? new Date(toText(pubNode)).getTime() : 0;

  const safeTitle = title || (link ? new URL(link).hostname : "Untitled");

  return {
    id: (link || safeTitle).slice(0, 400),
    title: safeTitle,
    link,
    pubDate,
    source,
  };
}

async function readOne(url: string) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      next: { revalidate: 60 }, // per-feed cache for 60s
      signal: controller.signal,
      headers: {
        "user-agent": "ClockingNewsBot/1.0 (+https://clocking.news)",
      },
    });

    clearTimeout(timer);

    const xml = await res.text();
    const data = parser.parse(xml);
    const items =
      data?.rss?.channel?.item ??
      data?.feed?.entry ??
      data?.channel?.item ??
      [];
    const arr = Array.isArray(items) ? items : [items].filter(Boolean);
    return arr.map((it) => normalizeItem(it, url));
  } catch {
    return [];
  }
}

export async function readAllFeeds(limit: number = MAX_ITEMS) {
  const lists = await Promise.allSettled(FEEDS.map(readOne));
  const flat = lists
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((x) => x.title && x.link);

  // de-dupe by normalized URL
  const seen = new Set<string>();
  const deduped = flat.filter((x) => {
    try {
      const u = new URL(x.link);
      const key = `${u.host}${u.pathname}`.replace(/\/$/, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    } catch {
      const key = x.link.replace(/^https?:\/\//, "").replace(/\/$/, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }
  });

  deduped.sort((a, b) => b.pubDate - a.pubDate);
  return deduped.slice(0, limit);
}
