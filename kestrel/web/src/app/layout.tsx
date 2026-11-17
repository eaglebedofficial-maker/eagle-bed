import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Kestrel — Amazon intelligence", template: "%s · Kestrel" },
  description: "Product intelligence, historical data, keywords and supplier sourcing for Amazon sellers.",
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#0B1020" }, { color: "#F7F9FC" }] };

// Applies the saved theme before first paint (dark is the default).
const themeScript = `try{var t=localStorage.getItem('k:theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-screen font-sans"><Providers>{children}</Providers></body>
    </html>
  );
}
