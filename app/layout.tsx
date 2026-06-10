import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
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

const siteDescription =
  "Találj megbízható szakit a közeledben a legkisebb javításoktól a teljes lakásfelújításig, vagy vállalj fusimunkát szabadon, jutalékok nélkül. Csatlakozz a Fusizók közösségéhez!";

const openGraphDescription =
  "A platform, ahol a szakértelem találkozik a lakossági igényekkel. Legyen szó egy TV felszereléséről vagy lakásfelújításról.";

const openGraphTitle =
  "Fusizók – Építsd a vállalkozásod, vagy találd meg a tökéletes szakit!";

export const metadata: Metadata = {
  metadataBase: new URL(getMetadataBaseUrl()),
  title: {
    default: "Fusizók | Szakember Kereső & Másodállású Barkács Munkák",
    template: "%s | Fusizók",
  },
  description: siteDescription,
  keywords: [
    "szakember kereső",
    "fusimunka",
    "barkácsolás",
    "lakásfelújítás",
    "szaki kereső",
    "másodállás",
    "gyors javítás",
    "fusizok",
  ],
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "/",
    siteName: "Fusizók",
    title: openGraphTitle,
    description: openGraphDescription,
    images: [
      {
        url: "/pwa-icon-512",
        width: 512,
        height: 512,
        alt: "Fusizók logó",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: openGraphTitle,
    description: openGraphDescription,
    images: ["/pwa-icon-512"],
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
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
