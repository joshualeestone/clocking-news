import { readAllFeeds } from "@/lib/rss";

export const revalidate = 60; // ISR: rebuild page at most once a minute

export default async function Home() {
  const items = await readAllFeeds(100);

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <div className="animated-header px-4 py-2 text-xs uppercase tracking-wide">
        <div className="flex items-center gap-3">
          <span className="font-bold">Clocking.News</span>
          <span className="h-2 w-2 rounded-full bg-green-500 pulse-green" />
          <span className="opacity-90">Live</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 border-b border-white/10 text-sm">
        <span className="opacity-75">Top (latest across {items.length} deduped)</span>
      </div>

      {/* List */}
      <ol className="px-4 py-4 space-y-3">
        {items.map((it, i) => (
          <li key={it.id} className="leading-snug">
            <a
              href={it.link}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {i + 1}. {it.title}
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
