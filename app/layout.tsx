import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";

const SITE_URL = "https://chinarhinestone.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ChinaRhinestone — Custom Heat Transfer Manufacturer for Garment Manufacturers",
    template: "%s",
  },
  description:
    "Custom heat transfer manufacturer in Yiwu, China. Rhinestone, silicone, reflective, DTF, 3D, PU and specialty heat transfers for garment manufacturers worldwide. Custom development, bulk production, repeat orders.",
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
    title: "ChinaRhinestone — Custom Heat Transfer Manufacturer",
    description:
      "Custom rhinestone, silicone, reflective, DTF, 3D, PU and specialty heat transfers for garment manufacturers. Bulk production, repeat orders.",
    images: ["/images/hero-showcase.webp"],
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
      <body className="min-h-screen bg-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
