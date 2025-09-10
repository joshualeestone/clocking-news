// src/app/page.tsx
import { readAllFeeds } from "@/lib/rss";
import ThemeToggle from "@/components/ThemeToggle";

export const revalidate = 60; // rebuild at most once per minute

export default async function Home() {
  const items = await readAllFeeds(100);

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <div className="animated-header px-4 py-2 text-xs uppercase tracking-wide text-white">
        <div className="flex items-center justify-between gap-3">
          {/* Left side: brand + live */}
          <div className="flex items-center gap-3">
            <span className="font-bold">Clocking.News</span>
            <span className="h-2 w-2 rounded-full bg-green-500 pulse-green" />
            <span className="opacity-90">Live</span>
          </div>
          {/* Right side: toggle */}
          <ThemeToggle />
        </div>
      </div>

      <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 text-sm">
        <span className="opacity-75">Top (deduped) — {items.length} items</span>
      </div>

      <ol className="px-4 py-4 space-y-3">
        {items.map((it, i) => (
          <li key={it.id} className="leading-snug">
            <a
              href={it.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-link"
            >
              {i + 1}. {it.title}
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
