import Link from "next/link";
import { readAllFeeds } from "../lib/rss";
import ThemeToggle from "../components/ThemeToggle";
import { MAX_ITEMS } from "../lib/config";
import { FEEDS } from "../lib/feeds";

export const dynamic = "force-dynamic"; // render on request

// Unique news-site count from FEEDS (hostname-based)
const SITE_COUNT = (() => {
  const set = new Set<string>();
  for (const u of FEEDS) {
    try { set.add(new URL(u).hostname.replace(/^www\./, "")); }
    catch { set.add(u); }
  }
  return set.size;
})();

function timeAgo(ts: number, now: number): string {
  if (!ts) return "";
  let s = Math.max(0, Math.floor((now - ts) / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  const w = Math.floor(d / 7);
  const mo = Math.floor(d / 30);
  const y = Math.floor(d / 365);
  if (s < 60) return `${s}s ago`;
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  if (w < 5) return `${w}w ago`;
  if (mo < 12) return `${mo}mo ago`;
  return `${y}y ago`;
}

type PageProps = { searchParams?: { limit?: string } };

export default async function Home({ searchParams }: PageProps) {
  const req = Number(searchParams?.limit ?? "");
  const limit =
    Number.isFinite(req) && req > 0 ? Math.min(req, MAX_ITEMS) : MAX_ITEMS;

  const items = await readAllFeeds(limit);
  const now = Date.now();

  const canShowMore = limit < MAX_ITEMS && items.length >= limit;
  const nextLimit = Math.min(limit + 50, MAX_ITEMS);

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      {/* Header */}
      <div className="px-4 py-2 text-xs uppercase tracking-wide">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold">Clocking.News</span>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="opacity-90">{SITE_COUNT} news sites reviewed by AI</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Subheader */}
      <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 text-sm">
        <span className="opacity-75">Top {MAX_ITEMS} Global</span>
      </div>

      {/* List */}
      <ol className="px-4 py-4 space-y-3">
        {items.map((it, i) => {
          const ago = it.pubDate ? timeAgo(it.pubDate, now) : "";
          return (
            <li key={it.id} className="leading-snug">
              <a
                href={it.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:opacity-80"
              >
                {i + 1}. {it.title}
              </a>
              {ago && <span className="ml-2 text-xs opacity-60">({ago})</span>}
            </li>
          );
        })}
      </ol>

      {canShowMore && (
        <div className="px-4 pb-8">
          <Link
            prefetch={false}
            href={`/?limit=${nextLimit}`}
            className="inline-block text-sm underline opacity-80 hover:opacity-100"
          >
            Show 50 more
          </Link>
        </div>
      )}
    </main>
  );
}
