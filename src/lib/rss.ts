import { FEEDS } from "./feeds";
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseTagValue: true,
});

// Normalize a single item from various RSS formats
function normalizeItem(raw: any, source: string) {
  const item = raw || {};
  const title = String(item.title || "").trim();
  const link =
    item.link?.["@_href"] || // some Atom feeds
    item.link ||
    item.guid?.["@_isPermaLink"] === "true" ? item.guid : item.guid ||
    "";
  const pub =
    item.pubDate ||
    item.published ||
    item.updated ||
    item["dc:date"] ||
    null;

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
    const json = parser.parse(xml);

    // try rss -> channel -> item OR atom -> feed -> entry
    const channelItems =
      json?.rss?.channel?.item ??
      json?.feed?.entry ??
      json?.channel?.item ??
      [];

    const items = Array.isArray(channelItems) ? channelItems : [channelItems];
    return items.map((it: any) => normalizeItem(it, url));
  } catch {
    return [];
  }
}

export async function readAllFeeds(limit = 50) {
  const all = await Promise.all(FEEDS.map(readOne));
  const flat = all.flat().filter((x) => x.title && x.link);

  // simple de-dupe by normalized link
  const seen = new Set<string>();
  const deduped = flat.filter((x) => {
    const key = x.link.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // sort by time (desc)
  deduped.sort((a, b) => b.pubDate - a.pubDate);

  return deduped.slice(0, limit);
}
