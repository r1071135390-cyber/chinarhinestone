import type { MetadataRoute } from "next";
import {
  TECHNOLOGIES,
  INDUSTRIES,
  APPLICATIONS,
  FABRICS,
  RESOURCES,
} from "@/lib/v2";

const BASE = "https://chinarhinestone.com";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/heat-transfers`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/industries`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/applications`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/fabrics`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/resources`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/get-a-quote`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/manufacturing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/quality-control`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/case-studies`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/designer.html`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const techPages: MetadataRoute.Sitemap = TECHNOLOGIES.map((t) => ({
    url: `${BASE}/heat-transfers/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: t.tier === "core" ? 0.9 : 0.7,
  }));

  const industryPages: MetadataRoute.Sitemap = INDUSTRIES.map((i) => ({
    url: `${BASE}/industries/${i.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: i.primary ? 0.9 : 0.8,
  }));

  const applicationPages: MetadataRoute.Sitemap = APPLICATIONS.map((a) => ({
    url: `${BASE}/applications/${a.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const fabricPages: MetadataRoute.Sitemap = FABRICS.map((f) => ({
    url: `${BASE}/fabrics/${f.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const resourcePages: MetadataRoute.Sitemap = RESOURCES.map((r) => ({
    url: `${BASE}/resources/${r.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...techPages,
    ...industryPages,
    ...applicationPages,
    ...fabricPages,
    ...resourcePages,
  ];
}
