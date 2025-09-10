import Link from "next/link";
import { readAllFeeds } from "@/lib/rss";
import ThemeToggle from "@/components/ThemeToggle";
import { MAX_ITEMS } from "@/lib/config";

export const dynamic = "force-dynamic"; // render at request time (no build-time prerender)

type PageProps = { searchParams?: { limit?: string } };

export default async function Home({ searchParams }: PageProps) {
  const req = Number(searchParams?.limit ?? "");
  const limit =
    Number.isFinite(req) && req > 0 ? Math.min(req, MAX_ITEMS) : MAX_ITEMS;

  const items = await readAllFeeds(limit);

  const canShowMore = limit < MAX_ITEMS && items.length >= limit;
  const nextLimit = Math.min(limit + 50, MAX_ITEMS);

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <div className="px-4 py-2 text-xs uppercase tracking-wide">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-bold">Clocking.News</span>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="opacity-90">Live</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 text-sm">
        <span className="opacity-75">Top (deduped) — {items.length} items</span>
      </div>

      <ol className="px-4 py-4 space-y-3">
        {items.map((it, i) => {
          let host = "";
          try {
            host = new URL(it.link).hostname.replace(/^www\./, "");
          } catch {}
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
              {host && <span className="ml-2 text-xs opacity-60">({host})</span>}
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
