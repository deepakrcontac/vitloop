import type { Metadata } from "next";
import "./globals.css";
import AuthInit from "./components/AuthInit";

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
      <body>
        <AuthInit />
        {children}
      </body>
    </html>
  );
}
