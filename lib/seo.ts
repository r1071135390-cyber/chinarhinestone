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

/* ── Product schema builder (for product detail pages) ────────────────
 *
 * Inputs (all optional except name/description/image):
 *   - slug:         URL slug — used to build the @id and the SKU.
 *   - name:         Human-readable product name.
 *   - shortName:    Short variant for the alternateName field.
 *   - description:  Product description, 1-3 sentences.
 *   - image:        Primary hero image URL (relative or absolute).
 *   - gallery:      Optional additional image URLs — added to `image` array.
 *   - category:     Google product category string (defaults to "Heat Transfer Labels").
 *   - material:     Optional material string (e.g. "Austrian crystal").
 *   - brand:        Optional brand override (defaults to "ChinaRhinestone").
 *   - isB2B:        When true (default), emits a quote-based Offer with no
 *                   numeric price. Set to false to include an AggregateOffer
 *                   with lowPrice/highPrice (used by retailers with a public
 *                   price list).
 *
 * Why a quote-based Offer: chinarhinestone.com prices every order by specs,
 * so publishing a single numeric price would be misleading. Google accepts
 * an Offer that only declares availability + priceCurrency + a free-text
 * priceSpecification.description, and still surfaces the Product graph.
 * ───────────────────────────────────────────────────────────────────── */
export function buildProductSchema(input: {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  image: string;
  gallery?: { type: "image" | "video"; src: string }[];
  category?: string;
  material?: string;
  brand?: string;
  isB2B?: boolean;
}) {
  const {
    slug,
    name,
    shortName,
    description,
    image,
    gallery = [],
    category = "Heat Transfer Labels",
    material,
    brand = SITE_NAME,
    isB2B = true,
  } = input;

  /* ── Image list — primary first, then unique gallery images. ── */
  const imageList = [absoluteUrl(image)];
  for (const item of gallery) {
    if (item.type === "image") {
      const abs = absoluteUrl(item.src);
      if (!imageList.includes(abs)) imageList.push(abs);
    }
  }

  /* ── SKU — deterministic, derived from slug. Stable across rebuilds. ── */
  const sku = `CR-${slug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/heat-transfers/${slug}`),
    name,
    alternateName: shortName,
    description,
    url: absoluteUrl(`/heat-transfers/${slug}`),
    image: imageList,
    brand: { "@type": "Brand", name: brand },
    manufacturer: { "@id": `${SITE_URL}#organization` },
    category,
    sku,
    mpn: sku,
  };

  if (material) {
    schema.material = material;
  }

  /* ── Offer: B2B quote-based or retail AggregateOffer. ── */
  if (isB2B) {
    schema.offers = {
      "@type": "Offer",
      url: absoluteUrl("/get-a-quote"),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      availabilityStarts: "2020-01-01",
      priceValidUntil: "2026-12-31",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE_URL}#organization` },
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        description:
          "Bulk pricing varies by quantity, design, materials and specifications. Request a custom quote.",
      },
    };
  }

  return schema;
}

/* ── Article builder (for blog / case-study detail pages) ───────────── */
export function buildArticleSchema(input: {
  slug: string;
  headline: string;
  description: string;
  image?: string;
  authorName?: string;
  datePublished?: string;
  dateModified?: string;
  articleType?: "Article" | "NewsArticle" | "BlogPosting" | "TechArticle";
}) {
  const {
    slug,
    headline,
    description,
    image,
    authorName = SITE_NAME,
    datePublished,
    dateModified,
    articleType = "Article",
  } = input;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": articleType,
    "@id": absoluteUrl(`/resources/${slug}`),
    headline,
    description,
    url: absoluteUrl(`/resources/${slug}`),
    inLanguage: SITE_LANGUAGE,
    author: { "@type": "Organization", name: authorName, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
  };

  if (image) schema.image = absoluteUrl(image);
  if (datePublished) schema.datePublished = datePublished;
  if (dateModified) schema.dateModified = dateModified;

  return schema;
}
