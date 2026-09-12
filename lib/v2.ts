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

/**
 * A single media item in a technology's gallery. Supports both still
 * images and short video clips (e.g. product demo reels).
 *
 * - For `image`: `src` is the image URL. `poster` is unused.
 * - For `video`: `src` is the video file URL (mp4 / webm). `poster` is
 *   strongly recommended — it is shown while the video is loading and
 *   on touch devices where autoplay is blocked. Without a poster, the
 *   user sees a black frame.
 */
export type GalleryMedia = {
  type: "image" | "video";
  src: string;
  /** Optional cover image. For video, used as `poster`. */
  poster?: string;
  /** Optional override for the alt text on this slide. */
  alt?: string;
};

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
  /**
   * Optional gallery shown in the hero carousel and the lightbox gallery
   * below the page. Mixed media is supported — entries can be either
   * images or short video clips. If omitted, only `image` is used.
   */
  gallery?: GalleryMedia[];
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
    /* Real production gallery: full-cover showcase of the rhinestone
     * product line (14 photos + 1 production-process video) lifted
     * straight from public/rhinestone-assets/ (extracted from
     * Rhinestone.7z on 2026-09-12).
     *
     * Order is intentional:
     *   1. RST-01 — best product photo, used as the page cover image
     *   2. RST-00 — production-process video, plays in the carousel
     *   3+. Additional production photos in sequence */
    gallery: [
      { type: "image", src: "/rhinestone-assets/RST-01.webp", alt: "Multi-color rhinestone logo on black fabric" },
      { type: "video", src: "/rhinestone-assets/RST-00.mp4", alt: "Rhinestone heat transfer production process" },
      { type: "image", src: "/rhinestone-assets/RST-02.webp", alt: "Crystal rhinestone pattern detail" },
      { type: "image", src: "/rhinestone-assets/RST-03.webp", alt: "Custom rhinestone motif on apparel" },
      { type: "image", src: "/rhinestone-assets/RST-04.webp", alt: "Dense rhinestone placement, close-up" },
      { type: "image", src: "/rhinestone-assets/RST-05.webp", alt: "Rhinestone heat transfer on garment front" },
      { type: "image", src: "/rhinestone-assets/RST-06.webp", alt: "Single-color rhinestone wordmark" },
      { type: "image", src: "/rhinestone-assets/RST-07.webp", alt: "Rhinestone decoration on sleeve" },
      { type: "image", src: "/rhinestone-assets/RST-08.webp", alt: "Full-coverage rhinestone transfer sample" },
      { type: "image", src: "/rhinestone-assets/RST-09.webp", alt: "Rhinestone transfer applied to jersey" },
      { type: "image", src: "/rhinestone-assets/RST-10.webp", alt: "Rhinestone badge with letter detail" },
      { type: "image", src: "/rhinestone-assets/RST-11.webp", alt: "Iridescent rhinestone pattern" },
      { type: "image", src: "/rhinestone-assets/RST-12.webp", alt: "Rhinestone logo on dark tee" },
      { type: "image", src: "/rhinestone-assets/RST-13.webp", alt: "Rhinestone logo on cap" },
      { type: "image", src: "/rhinestone-assets/RST-14.webp", alt: "Crystal AB-finish rhinestone close-up" },
    ],
  },
  {
    slug: "silicone-heat-transfers",
    name: "Silicone Heat Transfers",
    shortName: "Silicone",
    tagline:
      "Standard-thickness silicone — the everyday choice for soft, raised branding.",
    description:
      "Standard Silicone is the entry point of our silicone line (typical thickness 0.3 – 0.5mm). It delivers a soft, slightly raised surface with the best stretch recovery of any silicone we make. Choose this when you want a clean raised logo with a soft hand feel and you do not need the bolder 3D look of 3D Thick or High-Density Silicone.",
    features: [
      "Thickness: 0.3 – 0.5mm (our thinnest silicone)",
      "Softest hand feel in the silicone family",
      "Best stretch recovery of any silicone type",
      "Subtle raise — most economical option",
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
    image: "/images/products/gallery/dtf-heat-transfers/DTF-01.webp",
    gallery: [
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-01.webp", alt: "DTF heat transfer — image 1" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-02.webp", alt: "DTF heat transfer — image 2" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-03.webp", alt: "DTF heat transfer — image 3" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-04.webp", alt: "DTF heat transfer — image 4" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-05.webp", alt: "DTF heat transfer — image 5" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-06.webp", alt: "DTF heat transfer — image 6" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-07.webp", alt: "DTF heat transfer — image 7" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-08.webp", alt: "DTF heat transfer — image 8" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-09.webp", alt: "DTF heat transfer — image 9" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-10.webp", alt: "DTF heat transfer — image 10" },
      { type: "image", src: "/images/products/gallery/dtf-heat-transfers/DTF-11.webp", alt: "DTF heat transfer — image 11" },
    ],
    tier: "core",
  },
  {
    slug: "3d-raised-heat-transfers",
    name: "3D & Raised Heat Transfers",
    shortName: "3D / Raised",
    tagline:
      "An overview of every dimensional transfer technique — choose your material, thickness and visual impact.",
    description:
      "3D & Raised is not a single process. It is the family of transfer techniques that add visible depth, raised edges or textured surfaces to a garment — covering silicone (standard, thick and high-density), gradient silicone, PU foam and other raised effects. Use this page to compare the options, then move to a specific technology for sampling and production.",
    features: [
      "Covers all dimensional transfer techniques",
      "Material options: silicone, PU foam, high-density compounds",
      "Typical thickness range: 0.3 – 2.5mm",
      "Choose by visual impact, hand feel and budget",
    ],
    image: "/images/tech-3d.jpg",
    tier: "specialty",
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

  /* ── Rhinestone product line (8 SKUs) ─────────────────── */
  {
    slug: "rhinestone-austrian-grade",
    name: "Austrian-Grade Rhinestone Transfers",
    shortName: "Austrian Rhinestone",
    tagline: "Premium Austrian-cut crystal rhinestone transfers for luxury apparel, dancewear and high-end fashion.",
    description:
      "Top-tier Austrian-cut crystal rhinestone transfers, manufactured for luxury apparel, dancewear and high-end fashion. Precision stone placement with maximum brilliance and clarity.",
    features: [
      "Austrian-cut crystal stones",
      "Maximum brilliance and clarity",
      "12-facet precision cut",
      "Ideal for luxury and dancewear",
    ],
    image: "/images/products/rhinestone-austrian-grade.webp",
    tier: "core",
    hasDesignerTool: true,
  },
  {
    slug: "rhinestone-korean-grade",
    name: "Korean-Grade Rhinestone Transfers",
    shortName: "Korean Rhinestone",
    tagline: "High-quality Korean rhinestone transfers — the sweet spot for fashion apparel and premium teamwear.",
    description:
      "Korean-grade rhinestone transfers for fashion apparel and premium teamwear. Excellent clarity and cut at a more accessible price point than Austrian stones.",
    features: [
      "Korean-cut crystal stones",
      "High brilliance and clarity",
      "Reliable for fashion programs",
      "Strong price-quality balance",
    ],
    image: "/images/products/rhinestone-korean-grade.webp",
    tier: "core",
    hasDesignerTool: true,
  },
  {
    slug: "rhinestone-china-grade-a",
    name: "China A-Grade Rhinestone Transfers",
    shortName: "A-Grade Rhinestone",
    tagline: "China A-grade rhinestone transfers for sportswear, teamwear and mid-tier fashion programs.",
    description:
      "China A-grade rhinestone transfers for sportswear, teamwear and mid-tier fashion programs. Good clarity and consistent quality at volume-production pricing.",
    features: [
      "China A-grade stones",
      "Consistent cut and clarity",
      "Volume-production pricing",
      "Sportswear and teamwear ready",
    ],
    image: "/images/products/rhinestone-china-grade-a.webp",
    tier: "core",
    hasDesignerTool: true,
  },
  {
    slug: "rhinestone-china-grade-b",
    name: "China B-Grade Rhinestone Transfers",
    shortName: "B-Grade Rhinestone",
    tagline: "Budget-friendly B-grade rhinestone transfers for kids wear, promos and high-volume orders.",
    description:
      "Budget-friendly B-grade rhinestone transfers for kids wear, promotional apparel and high-volume orders. Reliable sparkle at the lowest cost per square inch.",
    features: [
      "Budget-friendly B-grade stones",
      "Bright sparkle and color",
      "High-volume ready",
      "Kids wear and promos",
    ],
    image: "/images/products/rhinestone-china-grade-b.webp",
    tier: "core",
    hasDesignerTool: true,
  },
  {
    slug: "rhinestone-custom-designs",
    name: "Custom-Design Rhinestone Transfers",
    shortName: "Custom Rhinestone",
    tagline: "Custom shapes, letters, numbers and motifs — hearts, stars, animals, logos, anything you can imagine.",
    description:
      "Custom-design rhinestone transfers: hearts, stars, animals, letters, numbers, logos and bespoke motifs. Free design tool with 32-color stone library.",
    features: [
      "Custom shapes and motifs",
      "Letters and numbers",
      "32-color stone library",
      "Free online design tool",
    ],
    image: "/images/products/rhinestone-custom-designs.webp",
    tier: "core",
    hasDesignerTool: true,
  },
  {
    slug: "rhinestone-multi-color",
    name: "Multi-Color Rhinestone Layouts",
    shortName: "Multi-Color Rhinestone",
    tagline: "Multi-color stone layouts for vibrant designs, mascots, character art and decorative apparel.",
    description:
      "Multi-color rhinestone layout transfers for vibrant designs, mascots, character art and decorative apparel. Up to 32 colors per design from our universal stone library.",
    features: [
      "Up to 32 colors per design",
      "Character and mascot art",
      "Vibrant color matching",
      "Decorative apparel ready",
    ],
    image: "/images/products/rhinestone-multi-color.webp",
    tier: "core",
    hasDesignerTool: true,
  },
  {
    slug: "rhinestone-iron-on",
    name: "Iron-On Rhinestone Transfers",
    shortName: "Iron-On Rhinestone",
    tagline: "Consumer-friendly iron-on rhinestone transfers — apply at home with a household iron.",
    description:
      "Consumer-friendly iron-on rhinestone transfers. Apply with a household iron or heat press — pre-cut motifs, letters and designs ready to apply.",
    features: [
      "Household iron compatible",
      "Pre-cut designs and motifs",
      "Letters and small graphics",
      "Easy home application",
    ],
    image: "/images/products/rhinestone-iron-on.webp",
    tier: "specialty",
    hasDesignerTool: true,
  },
  {
    slug: "rhinestone-hot-fix",
    name: "Hot-Fix Rhinestone Rolls",
    shortName: "Hot-Fix Rhinestone",
    tagline: "Industrial hot-fix rhinestone rolls for automated rhinestone setting machines and high-volume production.",
    description:
      "Industrial hot-fix rhinestone transfer rolls for automated setting machines and high-volume production. Pre-spaced stones on carrier film, ready for machine application.",
    features: [
      "Pre-spaced on carrier film",
      "Compatible with setting machines",
      "High-volume production",
      "Consistent stone spacing",
    ],
    image: "/images/products/rhinestone-hot-fix.webp",
    tier: "specialty",
  },

  /* ── Silicone product line (6 SKUs) ─────────────────── */
  {
    slug: "silicone-3d-thick",
    name: "3D Thick Silicone Transfers",
    shortName: "3D Thick Silicone",
    tagline:
      "Thick silicone with a pronounced raised effect — visible 3D, still soft to the touch.",
    description:
      "3D Thick Silicone is roughly twice as thick as standard silicone (typical 0.8 – 1.2mm). It gives a clearly visible raised effect with crisp edges while keeping the same soft-touch feel. Choose this when standard silicone is too flat for your design but you do not need the maximum thickness of HD 3D Silicone — a strong fit for streetwear, team logos, caps and chest badges.",
    features: [
      "Thickness: 0.8 – 1.2mm (about 2× standard silicone)",
      "Pronounced 3D raise with crisp edges",
      "Still soft to the touch — no hard plastic feel",
      "Best for streetwear, team logos, caps and chest badges",
    ],
    image: "/images/products/silicone-3d-thick.webp",
    tier: "core",
  },
  {
    slug: "silicone-3d-density",
    name: "High-Density 3D Silicone",
    shortName: "HD 3D Silicone",
    tagline:
      "Our thickest, densest silicone — maximum 3D impact for premium and athletic brands.",
    description:
      "HD 3D Silicone is our flagship thickness (typical 1.5 – 2.5mm). It produces the most dramatic raised effect and the heaviest hand feel — the substantial look you see on premium athletic wear and luxury streetwear labels. Choose this when dimensional impact and a solid feel under the fingers matter more than cost. Pricier than 3D Thick due to higher material use.",
    features: [
      "Thickness: 1.5 – 2.5mm (our thickest silicone)",
      "Heaviest, most substantial hand feel",
      "Maximum 3D visual impact",
      "Best for premium athletic, luxury streetwear and high-end labels",
    ],
    image: "/images/products/silicone-3d-density.webp",
    tier: "core",
  },
  {
    slug: "silicone-thin-flat",
    name: "Thin Flat Silicone Transfers",
    shortName: "Thin Silicone",
    tagline: "Thin flat silicone transfers — smooth silicone surface without raised effect, for subtle branding.",
    description:
      "Thin flat silicone transfers with smooth surface and subtle dimensional effect. Ideal for logos and graphics where a soft silicone hand feel is wanted without a thick 3D profile.",
    features: [
      "Smooth silicone surface",
      "Subtle dimension",
      "Soft hand feel",
      "Clean logo application",
    ],
    image: "/images/products/silicone-thin-flat.webp",
    tier: "core",
  },
  {
    slug: "silicone-multi-color",
    name: "Multi-Color Silicone Transfers",
    shortName: "Multi-Color Silicone",
    tagline: "Multi-color silicone transfers — vibrant color combinations for logos, characters and graphics.",
    description:
      "Multi-color silicone transfers for vibrant color combinations. Perfect for logos, character art, mascot graphics and any design requiring multiple silicone colors in a single transfer.",
    features: [
      "Multiple colors per design",
      "Character and mascot art",
      "Vibrant color matching",
      "Single transfer application",
    ],
    image: "/images/products/silicone-multi-color.webp",
    tier: "core",
  },
  {
    slug: "silicone-gradient",
    name: "Gradient Silicone Transfers",
    shortName: "Gradient Silicone",
    tagline:
      "Silicone with smooth color transitions — combine any thickness with ombre color.",
    description:
      "Gradient Silicone is a color variant, not a thickness variant — it can be produced at standard, thick or HD silicone thickness. The value is the smooth color transition from one shade to another within a single logo, creating an ombre effect flat-color silicone cannot achieve. Choose this for limited drops, collaborations and any brand where color depth matters as much as physical depth.",
    features: [
      "Available on any silicone thickness (standard, thick or HD)",
      "Smooth ombre color transitions within a single logo",
      "Combine with 3D raise for maximum visual impact",
      "Best for limited drops, collaborations, fashion-forward lines",
    ],
    image: "/images/products/silicone-gradient.webp",
    tier: "core",
  },
  {
    slug: "silicone-metallic-look",
    name: "Metallic-Look Silicone Transfers",
    shortName: "Metallic Silicone",
    tagline: "Metallic-look silicone transfers — the soft hand of silicone with the visual punch of metal.",
    description:
      "Metallic-look silicone transfers combining the soft hand feel of silicone with the visual punch of metallic finishes. Gold, silver, copper and custom metallic colors available.",
    features: [
      "Metallic visual effect",
      "Soft silicone hand feel",
      "Gold, silver, copper tones",
      "Custom metallic colors",
    ],
    image: "/images/products/silicone-metallic-look.webp",
    tier: "core",
  },

  /* ── Reflective product line (4 SKUs) ────────────────── */
  {
    slug: "reflective-silver-grey",
    name: "Silver-Grey Reflective Transfers",
    shortName: "Silver Reflective",
    tagline: "Silver-grey reflective transfers for workwear, safety apparel and high-visibility garments.",
    description:
      "Silver-grey reflective transfers for workwear, safety apparel and high-visibility garments. Meets common reflective standards for industrial and outdoor use.",
    features: [
      "Silver-grey base color",
      "High-visibility effect",
      "Industrial laundering durable",
      "Safety apparel compliant",
    ],
    image: "/images/products/reflective-silver-grey.webp",
    tier: "core",
  },
  {
    slug: "reflective-rainbow",
    name: "Rainbow Reflective Transfers",
    shortName: "Rainbow Reflective",
    tagline: "Rainbow reflective transfers for fashion apparel, streetwear and statement pieces.",
    description:
      "Rainbow reflective transfers for fashion apparel, streetwear and statement pieces. Multi-color shift under light — striking visual effect for limited collections.",
    features: [
      "Multi-color light shift",
      "Fashion-forward effect",
      "Streetwear and statement pieces",
      "Limited collection ready",
    ],
    image: "/images/products/reflective-rainbow.webp",
    tier: "core",
  },
  {
    slug: "reflective-multi-color",
    name: "Multi-Color Reflective Transfers",
    shortName: "Multi-Color Reflective",
    tagline: "Multi-color reflective transfers — colored reflective logos and graphics for sportswear and workwear.",
    description:
      "Multi-color reflective transfers with colored reflective effect. Logos and graphics retain their daytime color while gaining nighttime visibility — ideal for sportswear, workwear and teamwear.",
    features: [
      "Colored reflective effect",
      "Daytime color preserved",
      "Nighttime visibility",
      "Sportswear and workwear",
    ],
    image: "/images/products/reflective-multi-color.webp",
    tier: "core",
  },
  {
    slug: "reflective-high-gloss",
    name: "High-Gloss Reflective Transfers",
    shortName: "High-Gloss Reflective",
    tagline: "High-gloss silver reflective transfers — premium reflective effect for performance sportswear.",
    description:
      "High-gloss silver reflective transfers with premium reflective effect. Maximum brightness and visibility for performance sportswear, running apparel and outdoor gear.",
    features: [
      "Maximum brightness",
      "Premium reflective effect",
      "Running and outdoor apparel",
      "Performance sportswear",
    ],
    image: "/images/products/reflective-high-gloss.webp",
    tier: "core",
  },

  /* ── DTF product line (4 SKUs) ──────────────────────── */
  {
    slug: "dtf-universal",
    name: "Universal DTF Transfers",
    shortName: "Universal DTF",
    tagline: "Universal DTF transfers — full-color, photo-quality prints that work on most fabric types.",
    description:
      "Universal DTF (Direct-to-Film) transfers with full-color, photo-quality detail. Works on cotton, polyester, blends and most common garment fabrics without color separation.",
    features: [
      "Full-color photo-quality",
      "Unlimited colors",
      "Most fabric types",
      "No color separation",
    ],
    image: "/images/products/dtf-universal.webp",
    tier: "core",
  },
  {
    slug: "dtf-pet-polyester",
    name: "Polyester DTF Transfers",
    shortName: "Polyester DTF",
    tagline: "Polyester-specific DTF transfers — engineered to handle dye migration on PET and performance fabrics.",
    description:
      "Polyester-specific DTF transfers engineered to prevent dye migration on PET, polyester and performance fabrics. Anti-sublimation formula keeps colors sharp on dyed polyester.",
    features: [
      "Anti-sublimation formula",
      "Prevents dye migration",
      "Polyester and PET optimized",
      "Sharp colors on dyed fabrics",
    ],
    image: "/images/products/dtf-pet-polyester.webp",
    tier: "core",
  },
  {
    slug: "dtf-cotton",
    name: "Cotton DTF Transfers",
    shortName: "Cotton DTF",
    tagline: "Cotton-specific DTF transfers — optimized adhesion and softness on natural-fiber garments.",
    description:
      "Cotton-specific DTF transfers optimized for natural-fiber garments. Excellent adhesion and soft hand feel on cotton, cotton-blends and other natural fibers.",
    features: [
      "Cotton and natural fibers",
      "Optimized adhesion",
      "Soft hand feel",
      "Cotton-blend compatible",
    ],
    image: "/images/products/dtf-cotton.webp",
    tier: "core",
  },
  {
    slug: "dtf-gold-silver",
    name: "Metallic DTF Transfers (Gold / Silver)",
    shortName: "Metallic DTF",
    tagline: "Metallic DTF transfers — gold and silver foil effects via digital print, no separate foil process.",
    description:
      "Metallic DTF transfers with gold and silver foil effects. Digital print process delivers metallic shine without a separate foil-application step — faster and more cost-effective.",
    features: [
      "Gold and silver metallic",
      "Digital print process",
      "No separate foil step",
      "Faster and more affordable",
    ],
    image: "/images/products/dtf-gold-silver.webp",
    tier: "core",
  },

  /* ── Specialty product line (5 SKUs) ────────────────── */
  {
    slug: "specialty-hot-stamping-gold",
    name: "Gold Hot-Stamping Transfers",
    shortName: "Gold Foil",
    tagline: "Gold hot-stamping foil transfers — bright, mirror-like gold finish for premium branding.",
    description:
      "Gold hot-stamping foil transfers with bright, mirror-like gold finish. Premium branding effect for luxury apparel, fashion collections and limited-edition programs.",
    features: [
      "Mirror-like gold finish",
      "Premium branding effect",
      "Luxury apparel ready",
      "Limited-edition appeal",
    ],
    image: "/images/products/specialty-hot-stamping-gold.webp",
    tier: "specialty",
  },
  {
    slug: "specialty-hot-stamping-silver",
    name: "Silver Hot-Stamping Transfers",
    shortName: "Silver Foil",
    tagline: "Silver hot-stamping foil transfers — bright, mirror-like silver finish for sporty and modern branding.",
    description:
      "Silver hot-stamping foil transfers with bright, mirror-like silver finish. Sporty and modern branding for streetwear, sportswear and techwear collections.",
    features: [
      "Mirror-like silver finish",
      "Sporty modern branding",
      "Streetwear and techwear",
      "High-impact visual",
    ],
    image: "/images/products/specialty-hot-stamping-silver.webp",
    tier: "specialty",
  },
  {
    slug: "specialty-laser-hologram",
    name: "Laser Hologram Transfers",
    shortName: "Hologram",
    tagline: "Laser hologram transfers — rainbow diffraction effect for futuristic, tech-inspired branding.",
    description:
      "Laser hologram transfers with rainbow diffraction effect. Futuristic, tech-inspired branding for streetwear, gaming apparel and limited-edition drops.",
    features: [
      "Rainbow diffraction effect",
      "Holographic finish",
      "Futuristic branding",
      "Gaming and streetwear",
    ],
    image: "/images/products/gallery/specialty-laser-hologram/SLH-02.webp",
    gallery: [
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-02.webp",
      },
      {
        type: "video",
        src: "/videos/specialty-laser-hologram/SLH-demo.mp4",
        poster: "/images/products/gallery/specialty-laser-hologram/SLH-02.webp",
      },
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-03.webp",
      },
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-04.webp",
      },
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-05.webp",
      },
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-06.webp",
      },
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-07.webp",
      },
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-08.webp",
      },
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-09.webp",
      },
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-10.webp",
      },
      {
        type: "image",
        src: "/images/products/gallery/specialty-laser-hologram/SLH-11.webp",
      },
    ],
    tier: "specialty",
  },
  {
    slug: "specialty-glow-dark",
    name: "Glow-in-the-Dark Transfers",
    shortName: "Glow-in-Dark",
    tagline: "Glow-in-the-dark transfers — photoluminescent effect for safety, novelty and kids apparel.",
    description:
      "Glow-in-the-dark heat transfers with photoluminescent effect. Charges under light, glows in darkness. Perfect for safety markings, novelty apparel and kids wear.",
    features: [
      "Photoluminescent glow",
      "Charges under light",
      "Safety and novelty use",
      "Kids apparel ready",
    ],
    image: "/images/products/specialty-glow-dark.webp",
    tier: "specialty",
  },
  {
    slug: "specialty-thermochromic",
    name: "Thermochromic (Heat-Color Change) Transfers",
    shortName: "Thermochromic",
    tagline: "Thermochromic transfers — color changes with temperature for interactive, novelty apparel.",
    description:
      "Thermochromic heat transfers that change color with temperature. Interactive effect for novelty apparel, kids wear, sportswear (showing body heat) and promotional products.",
    features: [
      "Color changes with heat",
      "Interactive effect",
      "Novelty and kids wear",
      "Sportswear heat mapping",
    ],
    image: "/images/products/specialty-thermochromic.webp",
    tier: "specialty",
  },

  /* ── PU / Glitter / Flock (3 SKUs) ──────────────────── */
  {
    slug: "pu-matte-glossy",
    name: "PU Matte & Glossy Transfers",
    shortName: "PU Matte/Glossy",
    tagline: "PU transfers in matte or glossy finish — clean, versatile branding for any garment program.",
    description:
      "PU heat transfers available in matte or glossy finish. Clean, versatile branding solution for logos, names, numbers and graphics on any garment program.",
    features: [
      "Matte or glossy finish",
      "Thin and clean edges",
      "Excellent stretchability",
      "Cost-effective for volume",
    ],
    image: "/images/products/pu-matte-glossy.webp",
    tier: "core",
  },
  {
    slug: "glitter-holographic",
    name: "Holographic Glitter Transfers",
    shortName: "Holographic Glitter",
    tagline: "Holographic glitter transfers — color-shifting sparkle for fashion and statement apparel.",
    description:
      "Holographic glitter heat transfers with color-shifting sparkle effect. Statement-making decoration for fashion apparel, dancewear and limited-edition collections.",
    features: [
      "Color-shifting sparkle",
      "Holographic finish",
      "Statement decoration",
      "Dancewear and fashion",
    ],
    image: "/images/products/glitter-holographic.webp",
    tier: "specialty",
  },
  {
    slug: "flock-multi-color",
    name: "Multi-Color Flock Transfers",
    shortName: "Multi-Color Flock",
    tagline: "Multi-color flock transfers — soft, velvety surface with multiple colors in a single design.",
    description:
      "Multi-color flock heat transfers with soft, velvety surface texture. Combine multiple flock colors in a single design for premium matte effect on fashion apparel.",
    features: [
      "Soft velvety surface",
      "Multiple colors per design",
      "Premium matte look",
      "Fashion apparel ready",
    ],
    image: "/images/products/flock-multi-color.webp",
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
  {
    slug: "pakistan-garment-exporters",
    name: "Pakistan Garment Exporters",
    tagline: "Heat transfers for Pakistan's knitwear, jersey and readymade garment exporters — Karachi, Lahore, Faisalabad.",
    description:
      "Heat transfer supplier for Pakistan's garment export industry. We support knitwear factories, jersey manufacturers, cricket and football apparel makers, and RMG exporters in Karachi, Lahore, Faisalabad, Sialkot and Multan with custom rhinestone, silicone, reflective, DTF, 3D and PU heat transfers. Sampling, bulk production and reliable repeat orders — designed for the export lead times of Karachi Port and Port Qasim.",
    image: "/images/industry-garment.jpg",
  },
  {
    slug: "bangladesh-knitwear-manufacturers",
    name: "Bangladesh Knitwear Manufacturers",
    tagline: "Heat transfers for Bangladesh knitwear, jersey and sweater manufacturers — Dhaka, Gazipur, Narayanganj.",
    description:
      "Heat transfer supplier for Bangladesh's knitwear and sweater industry. We support knit and woven garment factories, jersey manufacturers, T-shirt and polo makers, and RMG exporters in Dhaka, Gazipur, Narayanganj, Chittagong and Savar with custom rhinestone, silicone, reflective, DTF, 3D and PU heat transfers. Designed for the production rhythm of Bangladesh's knit sector and the export cycle out of Chittagong Port.",
    image: "/images/industry-garment.jpg",
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
  {
    /* Long-tail: a high-intent search query garment manufacturers type
     * when they hit a recurring color-bleed defect. This article owns
     * the "dye migration heat transfer" SERP. */
    slug: "dye-migration-prevention",
    name: "Dye Migration Prevention on Polyester",
    category: "Guides",
    tagline:
      "Why dyed polyester ruins transfers — and how dye-blocking systems, curing profiles and substrate choice stop it.",
  },
  {
    /* Long-tail: the dominant B2B search phrasing for our category.
     * Captures the "custom heat transfer supplier China" SERP and
     * explicitly addresses the risks (MOQ, lead time, QC) buyers
     * worry about. */
    slug: "sourcing-custom-heat-transfers-from-china",
    name: "Sourcing Custom Heat Transfers from China",
    category: "Comparisons & Insights",
    tagline:
      "What garment manufacturers should evaluate when sourcing custom heat transfers from a Chinese manufacturer — MOQ, lead time, sampling, QC and shipping.",
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

/* ── Related-product helper (D-3 internal-link deepening) ───
 *
 * Returns up to `limit` Technology objects that are most contextually
 * related to the given product. The matching is slug-prefix based so
 * it survives data changes without manual curation:
 *
 *   1. Same product family (e.g. "rhinestone-*" → other "rhinestone-*")
 *   2. Same base technology (e.g. "silicone-3d-thick" → other "silicone-*"
 *      and the "3d-raised-heat-transfers" overview page)
 *   3. If still short, fall back to the other TECHNOLOGIES so the page
 *      always has something to show in the related-products slot.
 *
 * The returned list is stable in order (deterministic) and never
 * includes the input product.
 * ───────────────────────────────────────────────────────────── */
export const getRelatedProducts = (slug: string, limit = 4): Technology[] => {
  const tech = getTechnology(slug);
  if (!tech) return [];
  const others = TECHNOLOGIES.filter((t) => t.slug !== slug);

  // Group 1: exact same family prefix (e.g. "rhinestone-" vs "rhinestone-austrian-grade")
  const familyKey = tech.slug.split("-")[0]; // "rhinestone", "silicone", ...
  const sameFamily = others.filter((t) => t.slug.startsWith(`${familyKey}-`));

  // Group 2: siblings that share the same core technology — e.g. any
  // 3D silicone SKU should surface the 3D-raised overview page.
  const sameCore = others.filter(
    (t) =>
      !sameFamily.includes(t) &&
      ((tech.slug.startsWith("silicone-") && t.slug === "3d-raised-heat-transfers") ||
        (tech.slug === "3d-raised-heat-transfers" && t.slug.startsWith("silicone-")))
  );

  const ordered = [...sameFamily, ...sameCore, ...others];
  // De-dup while preserving order.
  const seen = new Set<string>();
  const unique = ordered.filter((t) => {
    if (seen.has(t.slug)) return false;
    seen.add(t.slug);
    return true;
  });
  return unique.slice(0, limit);
};

/* ── Related-resources helper (links product pages to guides) ──
 *
 * Maps a technology slug to the resource(s) most likely to help a
 * garment manufacturer evaluating that technology. Falls back to the
 * general "heat-transfer-guide" when nothing specific applies.
 * ───────────────────────────────────────────────────────────── */
export const getRelatedResources = (slug: string): string[] => {
  const map: Record<string, string[]> = {
    "rhinestone-heat-transfers": ["heat-transfer-guide", "artwork-guidelines"],
    "rhinestone-austrian-grade": ["heat-transfer-guide", "heat-transfer-durability"],
    "rhinestone-korean-grade": ["heat-transfer-guide", "silicone-vs-pu"],
    "rhinestone-china-grade-a": ["heat-transfer-guide", "heat-transfer-durability"],
    "rhinestone-china-grade-b": ["heat-transfer-guide", "heat-transfer-durability"],
    "rhinestone-custom-designs": ["artwork-guidelines", "heat-transfer-guide"],
    "rhinestone-multi-color": ["artwork-guidelines", "heat-transfer-guide"],
    "rhinestone-iron-on": ["heat-transfer-application-guide", "heat-transfer-guide"],
    "rhinestone-hot-fix": ["heat-transfer-application-guide", "heat-transfer-guide"],
    "silicone-heat-transfers": ["silicone-vs-pu", "best-heat-transfers-for-sportswear"],
    "silicone-3d-thick": ["silicone-vs-pu", "best-heat-transfers-for-sportswear"],
    "silicone-3d-density": ["silicone-vs-pu", "best-heat-transfers-for-sportswear"],
    "silicone-thin-flat": ["silicone-vs-pu", "heat-transfer-guide"],
    "silicone-multi-color": ["artwork-guidelines", "silicone-vs-pu"],
    "silicone-gradient": ["artwork-guidelines", "silicone-vs-pu"],
    "silicone-metallic-look": ["silicone-vs-pu", "heat-transfer-guide"],
    "reflective-heat-transfers": ["best-heat-transfers-for-sportswear", "heat-transfer-durability"],
    "reflective-silver-grey": ["fabric-compatibility", "heat-transfer-durability"],
    "reflective-rainbow": ["fabric-compatibility", "heat-transfer-guide"],
    "reflective-multi-color": ["artwork-guidelines", "best-heat-transfers-for-sportswear"],
    "reflective-high-gloss": ["best-heat-transfers-for-sportswear", "fabric-compatibility"],
    "dtf-heat-transfers": ["artwork-guidelines", "fabric-compatibility"],
    "dtf-universal": ["fabric-compatibility", "dye-migration-prevention"],
    "dtf-pet-polyester": ["fabric-compatibility", "dye-migration-prevention"],
    "dtf-cotton": ["fabric-compatibility", "heat-transfer-guide"],
    "dtf-gold-silver": ["artwork-guidelines", "heat-transfer-guide"],
    "3d-raised-heat-transfers": ["silicone-vs-pu", "best-heat-transfers-for-sportswear"],
    "pu-heat-transfers": ["silicone-vs-pu", "best-heat-transfers-for-sportswear"],
    "pu-matte-glossy": ["silicone-vs-pu", "best-heat-transfers-for-sportswear"],
    "glitter-heat-transfers": ["heat-transfer-guide", "artwork-guidelines"],
    "glitter-holographic": ["artwork-guidelines", "heat-transfer-guide"],
    "flock-heat-transfers": ["heat-transfer-guide", "fabric-compatibility"],
    "flock-multi-color": ["artwork-guidelines", "heat-transfer-guide"],
    "specialty-heat-transfers": ["artwork-guidelines", "sourcing-custom-heat-transfers-from-china"],
    "specialty-hot-stamping-gold": ["artwork-guidelines", "heat-transfer-durability"],
    "specialty-hot-stamping-silver": ["artwork-guidelines", "heat-transfer-durability"],
    "specialty-laser-hologram": ["artwork-guidelines", "heat-transfer-guide"],
    "specialty-glow-dark": ["fabric-compatibility", "heat-transfer-guide"],
    "specialty-thermochromic": ["fabric-compatibility", "heat-transfer-guide"],
  };
  return map[slug] ?? [
    "sourcing-custom-heat-transfers-from-china",
    "heat-transfer-guide",
  ];
};

/* ── Helpers ─────────────────────────────────────────────── */
export const getTechnology = (slug: string) => TECHNOLOGIES.find((t) => t.slug === slug);
export const getIndustry = (slug: string) => INDUSTRIES.find((i) => i.slug === slug);
export const getApplication = (slug: string) => APPLICATIONS.find((a) => a.slug === slug);
export const getFabric = (slug: string) => FABRICS.find((f) => f.slug === slug);
export const getResource = (slug: string) => RESOURCES.find((r) => r.slug === slug);

/**
 * Resolve the gallery media list for a technology.
 *
 * - If `tech.gallery` is defined, those entries are returned as-is.
 *   Each entry can be an image OR a video (see `GalleryMedia`).
 * - Otherwise, falls back to a single-image gallery built from
 *   `tech.image`.
 *
 * Components consuming this list are responsible for rendering video
 * slides with a poster, autoplay/pause on slide change, and a play
 * overlay in the gallery grid.
 */
export const getGalleryImages = (tech: Technology): GalleryMedia[] => {
  if (tech.gallery && tech.gallery.length > 0) {
    return tech.gallery;
  }
  return [{ type: "image", src: tech.image }];
};
