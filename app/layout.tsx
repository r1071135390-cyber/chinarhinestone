import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import {
  SITE_URL,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1e3a8a",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // Use a no-op template so each page owns its full title (most pages
    // already end with the brand; adding it here would duplicate it).
    default: "ChinaRhinestone — Custom Heat Transfer Manufacturer",
    template: "%s",
  },
  description:
    "Custom heat transfer manufacturer in Yiwu, China: rhinestone, silicone, reflective, DTF, 3D, PU and specialty transfers for garment factories worldwide.",
  keywords: [
    "custom heat transfer manufacturer",
    "rhinestone heat transfers China",
    "silicone heat transfers wholesale",
    "reflective heat transfers supplier",
    "DTF heat transfer film",
    "3D raised heat transfers",
    "PU heat transfers",
    "glitter heat transfer sheets",
    "heat transfer for sportswear",
    "heat transfer for workwear",
    "heat transfer for fashion apparel",
    "garment heat transfer labels",
    "Pakistan garment heat transfers",
    "Bangladesh knitwear heat transfers",
    "custom transfers bulk order",
    "China rhinestone transfers",
    "rhinestone design studio",
    "free heat transfer design tool",
  ],
  authors: [{ name: "ChinaRhinestone", url: SITE_URL }],
  creator: "ChinaRhinestone",
  publisher: "ChinaRhinestone",
  openGraph: {
    type: "website",
    siteName: "ChinaRhinestone",
    locale: "en_US",
    url: SITE_URL,
    title: "Custom Heat Transfer Manufacturer | ChinaRhinestone",
    description:
      "Custom rhinestone, silicone, reflective, DTF, 3D, PU and specialty heat transfers for garment manufacturers. China manufacturer — bulk production, repeat orders, quote within 24 hours.",
    images: [
      {
        url: "/images/hero-showcase.webp",
        width: 1200,
        height: 900,
        alt: "Custom heat transfers on performance sportswear — silicone, reflective and rhinestone effects",
      },
    ],
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  twitter: {
    card: "summary_large_image",
    site: "@ChinaRhinestone",
    creator: "@ChinaRhinestone",
    title: "ChinaRhinestone — Custom Heat Transfer Manufacturer",
    description:
      "Custom rhinestone, silicone, reflective, DTF, 3D, PU and specialty heat transfers for garment manufacturers. Bulk production, repeat orders.",
    images: ["/images/hero-showcase.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
};

/* Organization + WebSite (with SearchAction) — used globally. */
const organizationSchema = {
  ...buildOrganizationSchema(),
  "@id": `${SITE_URL}#organization`,
};

const websiteSchema = buildWebSiteSchema();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* DNS prefetch — establish TCP/TLS early for external services */}
        <link rel="dns-prefetch" href="//www.google.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        {/* Preconnect — open connection before DNS resolution completes */}
        <link rel="preconnect" href="https://www.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        {/* Preload the brand logo — it appears in the header on every page. */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" fetchPriority="high" />
        {/* Preload the hero image for the homepage so it lands in cache early. */}
        <link
          rel="preload"
          href="/images/hero-showcase.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-screen bg-white antialiased pb-16 md:pb-0">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <WhatsAppFab />
        <MobileBottomNav />
      </body>
    </html>
  );
}
