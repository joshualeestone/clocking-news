import { FEEDS } from "./feeds";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: true,
});

function normalizeItem(raw: any, source: string) {
  const title = String(raw?.title ?? "").trim();
  const link =
    raw?.link?.["@_href"] || raw?.link ||
    (raw?.guid?.["@_isPermaLink"] === "true" ? raw?.guid : raw?.guid) || "";
  const pub =
    raw?.pubDate || raw?.published || raw?.updated || raw?.["dc:date"] || null;

  return {
    id: (link || title).slice(0, 400),
    title,
    link: typeof link === "string" ? link : String(link || ""),
    pubDate: pub ? new Date(pub).getTime() : 0,
    source,
  };
}

async function readOne(url: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const xml = await res.text();
    const data = parser.parse(xml);
    const items =
      data?.rss?.channel?.item ??
      data?.feed?.entry ??
      data?.channel?.item ??
      [];
    const arr = Array.isArray(items) ? items : [items];
    return arr.map((it) => normalizeItem(it, url));
  } catch {
    return [];
  }
}

export async function readAllFeeds(limit = 50) {
  const lists = await Promise.all(FEEDS.map(readOne));
  const flat = lists.flat().filter((x) => x.title && x.link);

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
