import "./globals.css";

export const metadata = {
  title: "Clocking.News",
  description: "Top global headlines — aggregated and deduped.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
