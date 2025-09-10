import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clocking.News",
  description: "Top 100 Global • AI-reviewed sources",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white text-black dark:bg-black dark:text-white">
      <body>{children}</body>
    </html>
  );
}
