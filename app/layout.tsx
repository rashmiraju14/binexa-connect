
import { getSiteOrigin } from "@/lib/site-origin";
import type { Metadata } from "next";
import "./globals.css";
import "@/components/auth-popup.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  title: {
    default: "Binexa Connect | Binexa Health",
    template: "%s | Binexa Connect",
  },
  description:
    "A Binexa Health community for wellness education, health technology, resources, and meaningful conversations.",
  icons: {
    icon: "/brand/binexa-favicon.png",
  },
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
