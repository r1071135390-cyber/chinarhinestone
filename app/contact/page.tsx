import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { SITE_URL, buildBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact | Heat Transfer Manufacturer China | ChinaRhinestone",
  description:
    "Contact ChinaRhinestone for custom heat transfer quotes, bulk orders and samples. China manufacturer — we reply within 24 hours.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact ChinaRhinestone — Heat Transfer Manufacturer",
    description:
      "Get a quote or talk to a heat transfer manufacturer. Reply within 24 hours, factory direct from Yiwu, China.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
};

/* ContactPage + BreadcrumbList JSON-LD — confirms the page role to Google. */
const breadcrumbSchema = buildBreadcrumbSchema([
  { label: "Home", href: "/" },
  { label: "Contact", href: "/contact" },
]);

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact ChinaRhinestone",
  url: `${SITE_URL}/contact`,
  description:
    "Contact ChinaRhinestone for custom heat transfer quotes, bulk orders, samples and factory visits. Reply within 24 hours.",
  inLanguage: "en",
  isPartOf: { "@type": "WebSite", name: "ChinaRhinestone", url: SITE_URL },
  primaryImageOfPage: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
  },
  about: { "@id": `${SITE_URL}#organization` },
};

export default function ContactPage() {
  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      {/* Visible breadcrumb nav — ContactForm is a client component so we
         cannot place this inside it without losing server-side rendering. */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-7xl bg-slate-900 px-4 pt-4 text-sm text-slate-400 lg:px-8"
      >
        <Link href="/" className="transition hover:text-white">
          Home
        </Link>
        <ChevronRight className="mx-1.5 inline h-3.5 w-3.5 align-middle text-slate-500" />
        <span className="font-medium text-slate-200">Contact</span>
      </nav>
      <ContactForm />
    </div>
  );
}
