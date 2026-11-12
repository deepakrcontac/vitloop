import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthInit from "./components/AuthInit";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "VITLoop - Campus Marketplace",
  description: "Buy, sell, rent and rate faculty at VIT Vellore",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VITLoop",
  },
  other: {
    "google-adsense-account": "ca-pub-2873280188849738",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2873280188849738"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <AuthInit />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
