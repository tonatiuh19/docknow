import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DockNow - Find & Book Marina Slips Worldwide",
  description:
    "Discover and book marina slips, private docks, and yacht berths worldwide. The easiest way to find docking for your boat.",
  keywords:
    "marina, dock, boat slip, yacht berth, boat docking, marina reservation",
  authors: [{ name: "DockNow" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "DockNow - Find & Book Marina Slips Worldwide",
    description: "Discover and book marina slips worldwide",
    type: "website",
    locale: "en_US",
    alternateLocale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
