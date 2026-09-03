/* ─────────────────────────────────────────────────────────────
   Country-specific extras for industry pages.
   Keep this in lib/ (not inside the page file) because Next.js
   page files may only export a fixed set of symbols
   (default, metadata, generateStaticParams, etc.).
   ───────────────────────────────────────────────────────────── */

export type IndustryExtras = {
  countries: string[];
  cities: string[];
  shipping: string;
  highlights: string[];
};

export const DYNAMIC_INDUSTRY_EXTRAS: Record<string, IndustryExtras> = {
  "pakistan-garment-exporters": {
    countries: ["Pakistan"],
    cities: [
      "Karachi",
      "Lahore",
      "Faisalabad",
      "Sialkot",
      "Multan",
      "Gujranwala",
      "Islamabad",
      "Rawalpindi",
    ],
    shipping: "Karachi Port & Port Qasim",
    highlights: [
      "Custom development and bulk production aligned with Pakistan's garment export cycle",
      "Cricket, football and teamwear transfer programs — jerseys, shorts, caps, training wear",
      "Sialkot sports manufacturing support — match-grade transfers for export programs",
      "Faisalabad knit & sweater transfer programs (winterwear for EU/US buyers)",
      "Shipping scheduled to Karachi Port / Port Qasim with full export documentation",
    ],
  },
  "bangladesh-knitwear-manufacturers": {
    countries: ["Bangladesh"],
    cities: [
      "Dhaka",
      "Gazipur",
      "Narayanganj",
      "Chittagong",
      "Savar",
      "Tongi",
      "Mymensingh",
      "Khulna",
    ],
    shipping: "Chittagong Port & Mongla Port",
    highlights: [
      "Knit & sweater transfer programs designed for Bangladesh's knit sector production rhythm",
      "T-shirt, polo and jersey transfers for RMG exporters — buyer-ready quality and packaging",
      "Repeat order support with consistent specifications across seasonal programs",
      "Sampling turnaround compatible with Bangladesh's compressed lead times",
      "Shipping scheduled to Chittagong / Mongla Port with full export documentation",
    ],
  },
};

export function getIndustryExtras(slug: string): IndustryExtras | undefined {
  return DYNAMIC_INDUSTRY_EXTRAS[slug];
}
