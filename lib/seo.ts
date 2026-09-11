/* ──────────────────────────────────────────────────────────────────────────
 * lib/seo.ts — Centralized SEO helpers (JSON-LD builders, URL utilities).
 *
 * Used by every page that emits structured data. Keeping the builders here
 * means we only fix one place if Google changes its schema requirements.
 * ──────────────────────────────────────────────────────────────────────── */

export const SITE_URL = "https://chinarhinestone.com";
export const SITE_NAME = "ChinaRhinestone";
export const SITE_LOCALE = "en_US";
export const SITE_LANGUAGE = "en";

/* ── Absolute URL helper — strips leading slash and joins with SITE_URL. ── */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/* ── BreadcrumbList builder ─────────────────────────────────────────────
 * items: ordered from outermost (Home) to current page. The current page
 * can either have a URL (we will set it) or no URL (we use the parent URL).
 * ─────────────────────────────────────────────────────────────────── */
export function buildBreadcrumbSchema(
  items: { label: string; href?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => {
      // If a breadcrumb item omits href, treat it as the current page and
      // point it at the previous item's URL (so the chain stays valid).
      let url: string;
      if (item.href) {
        url = absoluteUrl(item.href);
      } else if (idx > 0) {
        url = absoluteUrl(items[idx - 1].href || "/");
      } else {
        url = SITE_URL;
      }
      return {
        "@type": "ListItem",
        position: idx + 1,
        name: item.label,
        item: url,
      };
    }),
  };
}

/* ── ItemList builder — for collection/listing pages ───────────────────
 * listItems: ordered list of items. The first item appears at position 1.
 * The schema.org ListItem supports position + url + name; an optional
 * `image` is allowed.
 * ─────────────────────────────────────────────────────────────────── */
export function buildItemListSchema(
  listName: string,
  listItems: { name: string; url: string; image?: string; description?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: listItems.map((li, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: li.name,
      url: absoluteUrl(li.url),
      ...(li.image ? { image: absoluteUrl(li.image) } : {}),
      ...(li.description ? { description: li.description } : {}),
    })),
  };
}

/* ── FAQPage builder — rich-results eligible ─────────────────────────── */
export function buildFAQSchema(
  faqs: { q: string; a: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/* ── WebSite builder (with SearchAction for sitelinks search box) ───── */
export function buildWebSiteSchema(opts?: {
  description?: string;
  potentialAction?: boolean;
}) {
  const description =
    opts?.description ||
    "Custom heat transfer manufacturer producing rhinestone, silicone, reflective, DTF, 3D, PU and specialty heat transfers for garment manufacturers worldwide.";

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: SITE_LANGUAGE,
    description,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  if (opts?.potentialAction !== false) {
    schema.potentialAction = {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/resources?q={search_term_string}`,
      },
      // Sitelinks search box requires this exact query-input property.
      "query-input": "required name=search_term_string",
    };
  }

  return schema;
}

/* ── Organization builder (for layout.tsx + about page) ──────────────── */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: "Yiwu HomeDorm Commodity Manufacturing Co., Ltd.",
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
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
}

/* ── LocalBusiness (helps surface contact details in branded SERP) ──── */
export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}#business`,
    name: SITE_NAME,
    image: absoluteUrl("/logo.png"),
    url: SITE_URL,
    telephone: "+86-13764593988",
    email: "info@chinarhinestone.com",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Yiwu",
      addressRegion: "Zhejiang",
      addressCountry: "CN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:30",
        closes: "18:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "17:00",
      },
    ],
  };
}
