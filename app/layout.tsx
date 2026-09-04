import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const SITE_URL = "https://chinarhinestone.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ChinaRhinestone — Custom Heat Transfer Manufacturer for Garment Manufacturers",
    template: "%s | ChinaRhinestone",
  },
  description:
    "Custom heat transfer manufacturer in Yiwu, China. Rhinestone, silicone, reflective, DTF, 3D, PU and specialty heat transfers for garment manufacturers worldwide. Custom development, bulk production, repeat orders.",
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
    url: SITE_URL,
    title: "ChinaRhinestone — Custom Heat Transfer Manufacturer for Garment Manufacturers",
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

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ChinaRhinestone",
  legalName: "Yiwu HomeDorm Commodity Manufacturing Co., Ltd.",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Custom heat transfer manufacturer producing rhinestone, silicone, reflective, DTF, 3D, PU and specialty heat transfers for garment manufacturers worldwide.",
  foundingDate: "2018",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Yiwu",
    addressRegion: "Zhejiang",
    addressCountry: "CN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+86-13764593988",
    email: "info@chinarhinestone.com",
    contactType: "sales",
    availableLanguage: ["English", "Chinese", "Urdu", "Bengali"],
    areaServed: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Pakistan" },
      { "@type": "Country", name: "Bangladesh" },
      { "@type": "Country", name: "India" },
      { "@type": "Country", name: "Turkey" },
      { "@type": "Country", name: "Mexico" },
      { "@type": "Country", name: "Brazil" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Preload the brand logo — it appears in the header on every page. */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
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
