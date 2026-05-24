import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VITLoop - Campus Marketplace",
  description: "Buy, sell, rent and rate faculty at VIT Vellore",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}