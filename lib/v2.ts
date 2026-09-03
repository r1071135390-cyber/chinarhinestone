/* ─────────────────────────────────────────────────────────────
   ChinaRhinestone 2.0 — Central Data Model
   All pages render from this single source of truth.
   Plan: V2.0 Repositioning (Custom Heat Transfer Manufacturer)
   ───────────────────────────────────────────────────────────── */

export const SITE = {
  name: "ChinaRhinestone",
  descriptor: "Custom Heat Transfer Manufacturer",
  tagline: "Custom Heat Transfer Solutions for Garment Manufacturers",
  phone: "+86 13764593988",
  phoneLabel: "WhatsApp / WeChat",
  email: "info@chinarhinestone.com",
  company: "Yiwu HomeDorm Commodity Manufacturing Co., Ltd.",
  location: "Yiwu, Zhejiang, China",
  founded: "2018",
  designerTool: "/designer.html",
};

/* ── Technologies (8) ────────────────────────────────────── */
export type Technology = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  features: string[];
  image: string;
  tier: "core" | "specialty";
  hasDesignerTool?: boolean;
};

export const TECHNOLOGIES: Technology[] = [
  {
    slug: "rhinestone-heat-transfers",
    name: "Rhinestone Heat Transfers",
    shortName: "Rhinestone",
    tagline: "Custom sparkling transfers for fashion apparel, teamwear and decorative garment applications.",
    description:
      "Custom sparkling transfers for fashion apparel, teamwear and decorative garment applications.",
    features: [
      "Precise stone placement",
      "Multiple stone qualities and sizes",
      "32-color universal stone library",
      "Free online design tool",
    ],
    image: "/images/tech-rhinestone.jpg",
    tier: "core",
    hasDesignerTool: true,
  },
  {
    slug: "silicone-heat-transfers",
    name: "Silicone Heat Transfers",
    shortName: "Silicone",
    tagline: "Soft-touch, dimensional and raised silicone transfers for apparel branding and garment decoration.",
    description:
      "Soft-touch, dimensional and raised silicone transfers for apparel branding and garment decoration.",
    features: [
      "Soft, flexible hand feel",
      "Raised, dimensional finish",
      "Strong stretch recovery",
      "Multiple color options",
    ],
    image: "/images/tech-silicone.jpg",
    tier: "core",
  },
  {
    slug: "reflective-heat-transfers",
    name: "Reflective Heat Transfers",
    shortName: "Reflective",
    tagline: "Reflective logos, graphics and markings for sportswear, running apparel, workwear and more.",
    description:
      "Reflective logos, graphics and markings for sportswear, running apparel, workwear and more.",
    features: [
      "High-visibility reflective effect",
      "Ideal for safety and sportswear",
      "Wash-durable performance",
      "Custom shapes and lettering",
    ],
    image: "/images/tech-reflective.jpg",
    tier: "core",
  },
  {
    slug: "dtf-heat-transfers",
    name: "DTF Heat Transfers",
    shortName: "DTF",
    tagline: "Full-color digital transfers with photo-quality detail — unlimited colors, no color separation, ideal for multi-color and photographic designs.",
    description:
      "Full-color digital transfers with photo-quality detail — unlimited colors, no color separation, ideal for multi-color and photographic designs.",
    features: [
      "Unlimited colors, photo-quality detail",
      "No color separation required",
      "Soft, stretchable finish",
      "Works on cotton, polyester and blends",
    ],
    image: "/images/tech-dtf.jpg",
    tier: "core",
  },
  {
    slug: "3d-raised-heat-transfers",
    name: "3D & Raised Heat Transfers",
    shortName: "3D / Raised",
    tagline: "Dimensional transfer effects that add depth, texture and visual impact to garment designs.",
    description:
      "Dimensional transfer effects that add depth, texture and visual impact to garment designs.",
    features: [
      "High-density raised finish",
      "Sharp edge definition",
      "Textured visual impact",
      "Premium brand look",
    ],
    image: "/images/tech-3d.jpg",
    tier: "core",
  },
  {
    slug: "pu-heat-transfers",
    name: "PU Heat Transfers",
    shortName: "PU",
    tagline: "Clean and versatile transfers for logos, graphics, names, numbers and garment branding.",
    description:
      "Clean and versatile transfers for logos, graphics, names, numbers and garment branding.",
    features: [
      "Thin, clean edge finish",
      "Excellent stretchability",
      "Full color range",
      "Cost-effective for volume",
    ],
    image: "/images/tech-pu.jpg",
    tier: "core",
  },
  {
    slug: "glitter-heat-transfers",
    name: "Glitter Heat Transfers",
    shortName: "Glitter",
    tagline: "Sparkling glitter transfers for eye-catching garment decoration.",
    description: "Sparkling glitter transfers for eye-catching garment decoration.",
    features: ["Dense glitter surface", "Vivid color payoff", "Durable wash performance"],
    image: "/images/tech-glitter.jpg",
    tier: "specialty",
  },
  {
    slug: "flock-heat-transfers",
    name: "Flock Heat Transfers",
    shortName: "Flock",
    tagline: "Soft, velvety-textured transfers with a premium matte finish.",
    description: "Soft, velvety-textured transfers with a premium matte finish.",
    features: ["Velvet touch surface", "Matte premium look", "Good opacity on darks"],
    image: "/images/tech-flock.jpg",
    tier: "specialty",
  },
  {
    slug: "specialty-heat-transfers",
    name: "Specialty Heat Transfers",
    shortName: "Specialty",
    tagline: "Custom-developed effects for unique garment decoration requirements.",
    description: "Custom-developed effects for unique garment decoration requirements.",
    features: [
      "Metallic, foil, holographic",
      "Glow-in-the-dark",
      "Puff and embossed",
      "Custom development",
    ],
    image: "/images/tech-specialty.jpg",
    tier: "specialty",
  },
];

export const CORE_TECHNOLOGIES = TECHNOLOGIES.filter((t) => t.tier === "core");
export const SPECIALTY_TECHNOLOGIES = TECHNOLOGIES.filter((t) => t.tier === "specialty");

/* ── Industries (6) ──────────────────────────────────────── */
export type Industry = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  primary?: boolean;
};

export const INDUSTRIES: Industry[] = [
  {
    slug: "garment-manufacturers",
    name: "Garment Manufacturers",
    tagline: "A transfer partner built around garment production — from sampling to repeat bulk orders.",
    description:
      "Custom transfer solutions for clothing factories and garment manufacturers worldwide. We support your production schedule with consistent specifications, quality control and repeat manufacturing.",
    image: "/images/industry-garment.jpg",
    primary: true,
  },
  {
    slug: "sportswear-manufacturers",
    name: "Sportswear Manufacturers",
    tagline: "Custom transfers for jerseys, teamwear, running apparel and performance sportswear.",
    description:
      "Custom transfers for jerseys, teamwear, running apparel and performance sportswear. Silicone, reflective and PU technologies engineered for performance fabrics.",
    image: "/images/industry-sportswear.jpg",
  },
  {
    slug: "workwear-manufacturers",
    name: "Workwear Manufacturers",
    tagline: "Branding, identification and reflective transfer solutions for workwear and uniforms.",
    description:
      "Branding, identification and reflective transfer solutions for workwear and uniforms. Durable transfers built for industrial laundering and safety compliance.",
    image: "/images/industry-workwear.jpg",
  },
  {
    slug: "fashion-apparel-manufacturers",
    name: "Fashion Apparel Manufacturers",
    tagline: "Decorative and premium transfer effects for fashion garments and apparel collections.",
    description:
      "Decorative and premium transfer effects for fashion garments and apparel collections. Rhinestone, 3D and specialty effects for seasonal collections.",
    image: "/images/industry-fashion.jpg",
  },
  {
    slug: "activewear-manufacturers",
    name: "Activewear Manufacturers",
    tagline: "Flexible transfer solutions for activewear, training apparel and performance garments.",
    description:
      "Flexible transfer solutions for activewear, training apparel and performance garments. Stretch-compatible transfers that move with the body.",
    image: "/images/industry-activewear.jpg",
  },
  {
    slug: "teamwear-manufacturers",
    name: "Teamwear Manufacturers",
    tagline: "Names, numbers, logos and graphics for team jerseys and sports uniforms.",
    description:
      "Names, numbers, logos and graphics for team jerseys and sports uniforms. Fast-turnaround customization programs for team decoration.",
    image: "/images/industry-teamwear.jpg",
  },
];

/* ── Applications (6) ────────────────────────────────────── */
export type Application = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
};

export const APPLICATIONS: Application[] = [
  {
    slug: "logo-heat-transfers",
    name: "Logo Transfers",
    tagline: "Custom logos for chest, back, sleeve and other garment placements.",
    description:
      "Custom logos for chest, back, sleeve and other garment placements. Precise reproduction of your brand mark in your chosen transfer technology.",
  },
  {
    slug: "garment-branding-transfers",
    name: "Garment Branding",
    tagline: "Brand marks, graphics and visual identity elements.",
    description:
      "Brand marks, graphics and visual identity elements. Consistent branding across your entire garment program.",
  },
  {
    slug: "heat-transfer-labels",
    name: "Heat Transfer Labels",
    tagline: "Neck labels, size marks, care information and branding.",
    description:
      "Neck labels, size marks, care information and branding. Tagless label solutions that replace woven labels.",
  },
  {
    slug: "name-number-transfers",
    name: "Name & Number Transfers",
    tagline: "Names, jersey numbers, team names and identification.",
    description:
      "Names, jersey numbers, team names and identification. Personalization programs for teamwear and sportswear.",
  },
  {
    slug: "reflective-marking-transfers",
    name: "Reflective Markings",
    tagline: "Reflective logos, text and graphics.",
    description:
      "Reflective logos, text and graphics. High-visibility safety markings for workwear and sportswear.",
  },
  {
    slug: "decorative-heat-transfers",
    name: "Decorative Transfers",
    tagline: "Rhinestone, glitter, textured and specialty effects.",
    description:
      "Rhinestone, glitter, textured and specialty effects. Eye-catching decoration for fashion and performance apparel.",
  },
];

/* ── Fabrics (5) ─────────────────────────────────────────── */
export type Fabric = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
};

export const FABRICS: Fabric[] = [
  {
    slug: "cotton",
    name: "Cotton",
    tagline: "Natural fiber garments and knitwear.",
    description:
      "Cotton and cotton-blend garments. Transfer selection considers weave, weight and garment construction for reliable adhesion and wash durability.",
  },
  {
    slug: "polyester",
    name: "Polyester",
    tagline: "The most common performance garment fabric.",
    description:
      "Polyester garments including performance knits and sportswear. We account for dye migration and stretch when recommending transfer solutions.",
  },
  {
    slug: "nylon",
    name: "Nylon",
    tagline: "Technical outerwear and packable garments.",
    description:
      "Nylon shells and technical fabrics. Lower-temperature transfer solutions protect sensitive coatings and finishes.",
  },
  {
    slug: "stretch-fabrics",
    name: "Stretch Fabrics",
    tagline: "Elastane blends and compression garments.",
    description:
      "Stretch fabrics with elastane content. Flexible transfer technologies maintain adhesion and appearance through repeated stretching.",
  },
  {
    slug: "performance-fabrics",
    name: "Performance Fabrics",
    tagline: "Moisture-wicking and technical knits.",
    description:
      "Moisture-wicking and technical knits. Thin, breathable transfer solutions preserve fabric performance characteristics.",
  },
];

/* ── Resources (7) ───────────────────────────────────────── */
export type Resource = {
  slug: string;
  name: string;
  category: "Guides" | "Comparisons & Insights";
  tagline: string;
};

export const RESOURCES: Resource[] = [
  {
    slug: "heat-transfer-guide",
    name: "Heat Transfer Guide",
    category: "Guides",
    tagline: "Technologies, materials and production considerations for custom garment transfers.",
  },
  {
    slug: "fabric-compatibility",
    name: "Fabric Compatibility Guide",
    category: "Guides",
    tagline: "How fabric composition affects transfer technology selection.",
  },
  {
    slug: "artwork-guidelines",
    name: "Artwork Guidelines",
    category: "Guides",
    tagline: "File formats, sizing and design requirements for transfer production.",
  },
  {
    slug: "heat-transfer-application-guide",
    name: "Heat Transfer Application Guide",
    category: "Guides",
    tagline: "Temperature, pressure and dwell time for applying transfers in production.",
  },
  {
    slug: "silicone-vs-pu",
    name: "Silicone vs PU Heat Transfers",
    category: "Comparisons & Insights",
    tagline: "Comparing hand feel, durability, cost and application for two core technologies.",
  },
  {
    slug: "best-heat-transfers-for-sportswear",
    name: "Best Heat Transfers for Sportswear",
    category: "Comparisons & Insights",
    tagline: "Technology recommendations for performance apparel programs.",
  },
  {
    slug: "heat-transfer-durability",
    name: "Heat Transfer Durability",
    category: "Comparisons & Insights",
    tagline: "Wash testing and durability expectations by technology.",
  },
];

/* ── Transfer Selector mapping (Homepage Section 04) ─────── */
export const TRANSFER_MATRIX = [
  { effect: "Soft Touch", tech: "Silicone", slug: "silicone-heat-transfers" },
  { effect: "Reflective Effect", tech: "Reflective", slug: "reflective-heat-transfers" },
  { effect: "Sparkle", tech: "Rhinestone", slug: "rhinestone-heat-transfers" },
  { effect: "Full Color / Photo", tech: "DTF", slug: "dtf-heat-transfers" },
  { effect: "Raised / 3D", tech: "Silicone / 3D", slug: "3d-raised-heat-transfers" },
  { effect: "Clean Branding", tech: "PU", slug: "pu-heat-transfers" },
  { effect: "Special Effects", tech: "Specialty", slug: "specialty-heat-transfers" },
];

/* ── Process (5 steps) ───────────────────────────────────── */
export const PROCESS_STEPS = [
  { step: "01", title: "Artwork", text: "Send us your logo, graphic or artwork." },
  { step: "02", title: "Development", text: "We review your requirements and recommend a suitable transfer solution." },
  { step: "03", title: "Sample", text: "Produce samples for approval when required." },
  { step: "04", title: "Bulk Production", text: "Manufacture your approved transfers according to confirmed specifications." },
  { step: "05", title: "Delivery", text: "Pack and arrange delivery according to your project requirements." },
];

/* ── Manufacturing (4 capabilities) ──────────────────────── */
export const MANUFACTURING_CAPS = [
  {
    title: "Custom Development",
    text: "Develop transfer designs according to your artwork and project requirements.",
  },
  {
    title: "Bulk Production",
    text: "Produce approved transfers for garment manufacturing programs.",
  },
  {
    title: "Quality Control",
    text: "Inspect production to maintain consistent specifications.",
  },
  {
    title: "Repeat Orders",
    text: "Support ongoing production with approved specifications and repeat manufacturing.",
  },
];

/* ── Quality Control (4 stages) ──────────────────────────── */
export const QC_STAGES = [
  { title: "Artwork Review", text: "Review artwork and production requirements." },
  { title: "Sample Inspection", text: "Check samples before bulk production when required." },
  { title: "Production Inspection", text: "Monitor specifications during bulk manufacturing." },
  { title: "Final QC", text: "Inspect finished transfers before shipment." },
];

/* ── Case Studies (3) ────────────────────────────────────── */
export const CASE_STUDIES = [
  {
    id: "case-01",
    title: "Silicone Logo Transfers for Sportswear",
    technology: "Silicone",
    application: "Logo",
    industry: "Sportswear",
    image: "/images/case-sportswear.jpg",
  },
  {
    id: "case-02",
    title: "Reflective Transfers for Workwear",
    technology: "Reflective",
    application: "Branding",
    industry: "Workwear",
    image: "/images/case-workwear.jpg",
  },
  {
    id: "case-03",
    title: "Rhinestone Transfers for Fashion Apparel",
    technology: "Rhinestone",
    application: "Decoration",
    industry: "Fashion",
    image: "/images/case-fashion.jpg",
  },
];

/* ── Why Us (5) ──────────────────────────────────────────── */
export const WHY_US = [
  {
    title: "Multiple Technologies",
    text: "Access different transfer technologies through one manufacturing partner.",
  },
  {
    title: "Custom Development",
    text: "Develop solutions around your artwork, garment and desired effect.",
  },
  {
    title: "Production Support",
    text: "From sampling to bulk production and repeat orders.",
  },
  {
    title: "Quality Control",
    text: "Maintain consistent specifications throughout production.",
  },
  {
    title: "Manufacturing Focus",
    text: "Built around the needs of garment manufacturers rather than retail customers.",
  },
];

/* ── FAQ (6) ─────────────────────────────────────────────── */
export const FAQS = [
  {
    q: "What types of heat transfers do you manufacture?",
    a: "We provide custom rhinestone, silicone, reflective, DTF, 3D / raised, PU and other specialty heat transfer solutions.",
  },
  {
    q: "Do you work with garment manufacturers?",
    a: "Yes. Our primary focus is supplying custom transfers for apparel production and garment manufacturing projects.",
  },
  {
    q: "Can you make transfers from our artwork?",
    a: "Yes. Send us your artwork and project requirements for review and custom development.",
  },
  {
    q: "What fabrics can you work with?",
    a: "We support projects involving cotton, polyester, nylon, stretch fabrics and other materials, depending on the specific application requirements.",
  },
  {
    q: "Can we order samples?",
    a: "Yes. Samples can be developed when required before bulk production.",
  },
  {
    q: "Do you support repeat orders?",
    a: "Yes. We can maintain approved specifications to support repeat production.",
  },
];

/* ── Trust Bar (4) ───────────────────────────────────────── */
export const TRUST_POINTS = [
  {
    title: "Custom Development",
    text: "Develop transfers around your artwork and garment requirements.",
  },
  {
    title: "Multiple Technologies",
    text: "Silicone, reflective, rhinestone, 3D, PU and specialty effects.",
  },
  {
    title: "Bulk Production",
    text: "Production support for ongoing garment manufacturing.",
  },
  {
    title: "Quality Control",
    text: "Inspection from development through final production.",
  },
];

/* ── Helpers ─────────────────────────────────────────────── */
export const getTechnology = (slug: string) => TECHNOLOGIES.find((t) => t.slug === slug);
export const getIndustry = (slug: string) => INDUSTRIES.find((i) => i.slug === slug);
export const getApplication = (slug: string) => APPLICATIONS.find((a) => a.slug === slug);
export const getFabric = (slug: string) => FABRICS.find((f) => f.slug === slug);
export const getResource = (slug: string) => RESOURCES.find((r) => r.slug === slug);
