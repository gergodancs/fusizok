import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BetaLaunchModal } from "@/components/layout/beta-launch-modal";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  CLIENT_FOCUSED_OG_DESCRIPTION,
  CLIENT_FOCUSED_OG_TITLE,
  CLIENT_FOCUSED_SITE_DESCRIPTION,
  CLIENT_FOCUSED_SITE_TITLE,
  SITE_KEYWORDS,
} from "@/lib/seo/site-metadata";
import { getMetadataBaseUrl } from "@/lib/seo/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBaseUrl()),
  title: {
    default: CLIENT_FOCUSED_SITE_TITLE,
    template: "%s | Fusizok.hu",
  },
  description: CLIENT_FOCUSED_SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "/",
    siteName: "Fusizok.hu",
    title: CLIENT_FOCUSED_OG_TITLE,
    description: CLIENT_FOCUSED_OG_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Fusizok.hu – Írd ki a munkát, ajánlatok jönnek",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: CLIENT_FOCUSED_OG_TITLE,
    description: CLIENT_FOCUSED_OG_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "fusizok",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950 font-sans text-zinc-100">
        <BetaLaunchModal />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
