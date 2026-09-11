import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { RESOURCES, getResource, getRelatedProducts } from "@/lib/v2";
import { buildArticleSchema } from "@/lib/seo";

const SITE_URL = "https://chinarhinestone.com";

/* ── Article content ─────────────────────────────────────── */
type Section = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

type Article = {
  intro: string;
  sections: Section[];
};

const ARTICLES: Record<string, Article> = {
  "heat-transfer-guide": {
    intro:
      "Custom heat transfers let garment manufacturers apply logos, graphics, labels and decorative effects with a heat press — no sewing, no screen-printing line, minimal garment handling. This guide covers the main technology families, how to choose between them, and what happens between artwork approval and bulk delivery.",
    sections: [
      {
        heading: "What Is a Custom Heat Transfer?",
        paragraphs: [
          "A heat transfer is a pre-manufactured graphic built on a carrier film. The decoration layer — silicone, PU, reflective material, rhinestones or specialty effects — is produced in our facility first, then applied to the finished garment with a heat press. This separates decoration production from garment production: your sewing line keeps moving, and branding becomes a fast final step.",
          "Because the transfer is produced before application, colors, dimensions and placement can be controlled to a specification and repeated across orders — which is why transfers are widely used for brand logos, care labels, names and numbers, and decorative graphics in garment manufacturing.",
        ],
      },
      {
        heading: "The Main Technology Families",
        bullets: [
          "Silicone — soft, stretchable and raised; the most common choice for performance apparel branding",
          "PU — thin, clean-edged and cost-effective for logos, names, numbers and multi-color graphics",
          "Reflective — high-visibility logos and safety markings for sportswear and workwear",
          "Rhinestone — precise stone placement for sparkling fashion and teamwear decoration, with a free online design tool",
          "3D & raised — dimensional effects with sharp edges for premium brand marks",
          "Glitter, flock and specialty — decorative effects including metallic, holographic and glow-in-the-dark finishes",
        ],
      },
      {
        heading: "How to Choose a Technology",
        paragraphs: [
          "Selection usually comes down to four questions: What fabric is the garment made of? How much does it stretch? What look and hand feel does the brand want? And how will the garment be washed in real use?",
          "A compression polyester top calls for a thin, stretchable system like silicone. A hi-vis workwear jacket needs reflective. A fashion tee can carry rhinestone or glitter. When several technologies fit, we help you compare hand feel, durability and unit cost with physical samples — not just a spec sheet.",
        ],
      },
      {
        heading: "From Artwork to Bulk Production",
        bullets: [
          "Artwork review — we check files, sizing and color separation, then confirm the recommended technology",
          "Sampling — a production-method sample is made for your approval before any bulk order",
          "Testing — application parameters are confirmed on your actual fabric, including wash and stretch testing where required",
          "Production — transfers are manufactured to the approved specification with in-process QC",
          "Delivery — transfers ship with application instructions matched to your press setup",
        ],
      },
    ],
  },

  "fabric-compatibility": {
    intro:
      "Fabric composition is the single biggest factor in heat transfer selection. The same logo can perform beautifully on a cotton tee and fail on a coated nylon shell — not because of the artwork, but because of the fabric. This guide explains what changes and how we evaluate it.",
    sections: [
      {
        heading: "Why Fabric Composition Matters",
        paragraphs: [
          "Every transfer system is engineered around a bonding temperature and an adhesive chemistry. The fabric determines whether the garment can tolerate that temperature, whether the surface will accept the bond, and how the applied transfer behaves when the fabric stretches, wicks moisture or gets washed repeatedly.",
        ],
      },
      {
        heading: "Cotton and Cotton Blends",
        paragraphs: [
          "Cotton is the most forgiving substrate: it tolerates standard application temperatures, and its fiber structure bonds well with all major transfer technologies. The practical variables are weave density and garment shrinkage — pre-shrunk garments and denser weaves give the most consistent results.",
        ],
      },
      {
        heading: "Polyester and Dye Migration",
        paragraphs: [
          "Polyester is the standard performance fabric, but it introduces two risks: dye migration, where disperse dyes bleed into the transfer during application or storage, and sensitivity in sublimated fabrics. We address this with dye-blocking layers, adjusted curing profiles and pre-testing on the actual dye lot whenever the garment is sublimated or deeply colored.",
        ],
      },
      {
        heading: "Nylon and Technical Shells",
        paragraphs: [
          "Nylon distorts at high temperatures, so transfers must be applied cooler and longer. Water-repellent coatings and seam-sealed constructions add further constraints. Silicone, reflective and selected specialty systems are the typical recommendations; adhesion testing on the coated fabric is essential before bulk production.",
        ],
      },
      {
        heading: "Stretch and Performance Fabrics",
        paragraphs: [
          "Once elastane content becomes significant, the transfer has to stretch and recover with the fabric. Stretch-compatible silicone and PU systems maintain adhesion and appearance through repeated flexing. Our fabric pages include a compatibility matrix by technology, and we validate stretch performance with cycle testing — not just a wash test.",
        ],
      },
      {
        heading: "Always Test Before Bulk",
        paragraphs: [
          "Compatibility tables are a starting point, not a guarantee: fabric finishes, dyes and constructions vary by supplier. For any new program we run application testing on your actual fabric and confirm the result with a physical sample before production begins.",
        ],
      },
    ],
  },

  "artwork-guidelines": {
    intro:
      "Good artwork files are the fastest path to accurate transfers and clean production. This guide covers the file formats, color specifications and sizing details that keep your transfer project on schedule.",
    sections: [
      {
        heading: "Vector Files Come First",
        paragraphs: [
          "Vector files (AI, EPS, SVG, PDF from vector source) define every edge mathematically, so we can scale your artwork to any transfer size without quality loss and cut separation layers precisely. For logos, lettering and technical graphics, vector is the format we ask for.",
        ],
      },
      {
        heading: "Raster Files: When They Work",
        paragraphs: [
          "Photographic, gradient or airbrushed artwork can only be raster. Provide PNG or PSD at 300 dpi or higher at the actual final transfer size. Low-resolution files pulled from web pages or presentations almost always need to be rebuilt before they can be produced.",
        ],
      },
      {
        heading: "Color Specification",
        bullets: [
          "Provide Pantone (PMS) references for critical brand colors — screens vary, references don't",
          "For rhinestone designs, colors are matched to our 32-color stone library",
          "Tell us the garment color up front; the same ink looks different on white, black and heather",
          "Specify any finish expectations: matte, gloss, metallic, translucent",
        ],
      },
      {
        heading: "Sizing and Placement",
        paragraphs: [
          "Send artwork at the exact intended size or tell us the target dimensions in inches or centimeters — including placement (left chest, full back, sleeve, hem label). If you are unsure, we can recommend standard sizes by garment type and placement during artwork review.",
        ],
      },
      {
        heading: "What We Check Before Production",
        paragraphs: [
          "Before anything is made, we review every file for line weights, minimum detail size, color separation count and overall reproducibility in the chosen technology. If something in the file will not survive production — a hairline stroke that will fill in, a gradient that can't be separated — we flag it and propose a fix, so the first physical sample is a useful one.",
        ],
      },
    ],
  },

  "heat-transfer-application-guide": {
    intro:
      "Applying transfers correctly is what protects the work put into producing them. This guide covers standard application parameters, fabric-specific adjustments and the checks that keep production consistent across shifts.",
    sections: [
      {
        heading: "Standard Application Parameters",
        paragraphs: [
          "The table below shows typical starting parameters by technology. Exact values for your order — temperature, pressure, dwell time and peel — are printed on the application sheet that ships with every production order, confirmed against your fabric during sampling.",
        ],
      },
      {
        heading: "Fabric-Specific Adjustments",
        bullets: [
          "Polyester: apply at the lower end of the temperature range and confirm the fabric's heat tolerance first",
          "Nylon and coated shells: reduced temperature with extended dwell time, tested before production",
          "Stretch fabrics: pre-stress check — apply, stretch and confirm the transfer flexes without cracking",
          "Moisture-wicking finishes: test adhesion on the finished fabric, not the raw fabric",
        ],
      },
      {
        heading: "Production Press Checklist",
        bullets: [
          "Confirm press temperature with a surface thermometer — displayed values drift on heavy-use presses",
          "Verify even pressure across the platen; uneven pressure shows up as partial adhesion",
          "Keep a first-off sample from each batch for comparison during the run",
          "Log temperature, pressure and dwell time per style so any shift can reproduce the original result",
        ],
      },
      {
        heading: "Common Issues and Fixes",
        bullets: [
          "Transfer lifts at edges — usually under-application: re-press with corrected temperature/pressure",
          "Color shift on dark garments — check for dye migration; dye-blocking layers may be required",
          "Indentation or shine around the graphic — pressure too high or dwell too long",
          "Cracking after stretching — wrong technology for the fabric's stretch level; consult us before rerunning",
        ],
      },
    ],
  },

  "silicone-vs-pu": {
    intro:
      "Silicone and PU are the two most-used transfer technologies in garment manufacturing — and the comparison comes up in almost every program. Both can carry a logo beautifully; they differ in hand feel, stretch, durability and cost structure.",
    sections: [
      {
        heading: "Quick Comparison",
        bullets: [
          "Hand feel — silicone is softer and more elastic; PU is thin and smooth",
          "Appearance — silicone has a raised, dimensional look; PU sits flatter with a clean edge",
          "Stretch — silicone recovers better on high-stretch fabrics; PU is good on moderate stretch",
          "Durability — both wash well when correctly matched to the fabric; silicone leads on stretch garments",
          "Cost — PU is generally the more economical option at volume",
        ],
      },
      {
        heading: "Choose Silicone When",
        bullets: [
          "The garment is high-stretch: compression wear, leggings, performance jerseys",
          "The brand wants a soft, premium hand feel with a raised texture",
          "The application is a main brand mark on activewear or sportswear",
        ],
      },
      {
        heading: "Choose PU When",
        bullets: [
          "You need crisp, multi-color graphics at a controlled cost",
          "The application is names, numbers or large logo programs on t-shirts and knitwear",
          "The garment has low-to-moderate stretch and a flat finish is preferred",
        ],
      },
      {
        heading: "The Honest Answer",
        paragraphs: [
          "For most programs the decision is confirmed by touching physical samples on the actual fabric — a spec sheet rarely settles a hand-feel question. We routinely provide both technologies as samples on the same fabric so your team can compare side by side before committing to bulk production.",
        ],
      },
    ],
  },

  "best-heat-transfers-for-sportswear": {
    intro:
      "Sportswear is the most demanding category for heat transfers: high-stretch fabrics, moisture management, repeated washing and brand-critical appearance. These are the technologies that consistently perform in performance apparel programs.",
    sections: [
      {
        heading: "What Sportswear Demands From a Transfer",
        bullets: [
          "Stretch and recovery — the graphic must flex with the fabric without cracking",
          "Breathability — thick or stiff transfers are noticeable on lightweight knits",
          "Wash durability — team and activewear are washed hot and often",
          "Clean brand reproduction — logos must stay sharp through the garment's life",
        ],
      },
      {
        heading: "Silicone for Main Branding",
        paragraphs: [
          "Silicone is the default for performance apparel branding: soft, elastic, raised and highly wash-durable on polyester and stretch fabrics. It handles the repeated flex of compression garments and keeps its shape where harder systems crack.",
        ],
      },
      {
        heading: "Reflective for Visibility",
        paragraphs: [
          "Running apparel, cycling kit and training gear use reflective logos and graphics for low-light visibility. Modern reflective transfers stay flexible enough for performance fabrics while maintaining high-visibility performance after repeated washing.",
        ],
      },
      {
        heading: "PU for Names, Numbers and Volume",
        paragraphs: [
          "For jersey numbers, player names and large-volume logo programs, PU offers crisp multi-color reproduction at the most economical unit cost — with enough stretch for standard knit sportswear.",
        ],
      },
      {
        heading: "Recommendations by Garment",
        bullets: [
          "Performance jerseys and tops — silicone main branding, PU names and numbers",
          "Compression wear — stretch-rated silicone only",
          "Running and cycling apparel — silicone or PU graphics plus reflective detailing",
          "Team uniforms — PU number programs with silicone crest options",
        ],
      },
    ],
  },

  "heat-transfer-durability": {
    intro:
      "Durability questions decide repeat orders: will the logo still look right after 30, 50, 100 washes? Here is how transfer durability is actually evaluated, what to expect from each technology, and the factors that matter more than most buyers realize.",
    sections: [
      {
        heading: "How Durability Is Evaluated",
        paragraphs: [
          "The industry baseline is repeated domestic wash cycles — typically 30 to 50 — followed by inspection for cracking, peeling, color change and edge lifting. For stretch garments we add stretch-cycle testing, because a transfer that survives the washing machine can still fail from repeated flexing in wear.",
        ],
      },
      {
        heading: "What to Expect by Technology",
        bullets: [
          "Silicone — excellent wash durability and the best stretch recovery; the standard for performance wear",
          "PU — very good wash performance on knits when correctly applied",
          "Reflective — retains visibility performance through extended wash cycles when applied to spec",
          "Rhinestone — stone retention depends on placement, fabric and garment care; wash testing confirms each program",
          "Specialty effects — durability varies by effect; glitter and foil systems are validated per program",
        ],
      },
      {
        heading: "What Actually Causes Failures",
        paragraphs: [
          "Most durability failures are not material failures — they are application failures. Under-temperature pressing, worn press platens, contaminated fabric finishes and home dryers all cause transfers to fail long before the material's limit. This is why we ship application parameters with every order and why sampling on your actual fabric matters.",
        ],
      },
      {
        heading: "Setting Expectations With Your Customers",
        paragraphs: [
          "Care instructions are part of durability: washing inside-out, avoiding bleach and industrial drycleaning where not rated, and low-heat drying all extend transfer life. We help our garment manufacturer customers set accurate care-label expectations for each technology and program so end-customer complaints stay low.",
        ],
      },
    ],
  },

  /* ── Long-tail: Dye migration on polyester ─────────────── */
  "dye-migration-prevention": {
    intro:
      "Dye migration is the single most common color-bleed defect we see on polyester garments. The white logo on a red sublimated jersey slowly turns pink in the press or in storage, and nobody catches it until the customer does. This guide explains what dye migration is, why polyester is uniquely vulnerable, and what we do — in coating, adhesive and process — to stop it.",
    sections: [
      {
        heading: "What Dye Migration Actually Is",
        paragraphs: [
          "Polyester is dyed with disperse dyes that sit inside the fiber rather than locking onto its surface. Under heat, those dye molecules become mobile again and travel into any material pressed against the fabric — including the adhesive, ink or coating of a heat transfer. The result is a transfer that gradually picks up the garment's color: white graphics turn pink on red jerseys, blue graphics go muddy on royal polyesters, and pastel prints shift toward the fabric's undertone.",
        ],
      },
      {
        heading: "Why Polyester Is Uniquely Vulnerable",
        bullets: [
          "Sublimated jerseys — dyes deposited during sublimation are the most mobile; they migrate under very mild heat",
          "Deep, saturated colors — the more dye packed into the fiber, the more there is to bleed",
          "Stretch knits — heat and pressure concentrate at raised points, accelerating migration at logo edges",
          "Storage in warm conditions — migration continues slowly in stacked cartons, sometimes appearing weeks after pressing",
        ],
      },
      {
        heading: "How We Prevent It",
        paragraphs: [
          "Three layers of prevention, applied in order. None of them is optional on a sublimated or deeply dyed polyester — together they stop migration under production conditions and storage.",
        ],
        bullets: [
          "Dye-blocking adhesive — a formulated polymer layer between fabric and graphic that physically traps migrating dye molecules; standard on every polyester DTF and most silicone recipes we ship",
          "Adjusted curing profile — lower press temperature, longer dwell time and a controlled cool-down reduce the heat energy available to mobilize dye",
          "Substrate choice — for very high-risk fabrics we move to DTF or migration-rated silicone rather than conventional PU systems that don't carry a barrier layer",
        ],
      },
      {
        heading: "What Garment Manufacturers Can Do",
        bullets: [
          "Tell us the dye method up front — sublimated, piece-dyed, garment-dyed and yarn-dyed fabrics all behave differently",
          "Send the actual garment or a dyed swatch with your artwork — lab samples are not enough to predict migration",
          "Avoid stacking hot transfers — let garments cool before folding or packing",
          "Store transfers in a cool, dry place — heat accelerates migration even when no transfer is happening",
        ],
      },
      {
        heading: "When Dye Migration Cannot Be Fully Stopped",
        paragraphs: [
          "There are fabric / dye combinations where even the best barrier cannot fully prevent bleed — typically very high-saturation sublimation prints in reds, royal blues and deep purples. In those cases we recommend running a test pressing on the exact garment, evaluating after 24 hours of room-temperature storage, and shifting the technology if the test shows unacceptable color shift. This is the honest answer: dye migration is a fabric problem, not a transfer problem, and the only permanent fix is the fabric.",
        ],
      },
    ],
  },

  /* ── Long-tail: Sourcing from China (high B2B intent) ──── */
  "sourcing-custom-heat-transfers-from-china": {
    intro:
      "Sourcing custom heat transfers from a Chinese manufacturer is a real B2B workflow — not a 'send artwork, get product' transaction. This article walks through the questions garment manufacturers should ask before committing: MOQ, lead time, sampling discipline, QC, communication, shipping and what the realistic first-order experience looks like.",
    sections: [
      {
        heading: "Why China for Custom Heat Transfers",
        paragraphs: [
          "China remains the center of garment decoration manufacturing for a reason: concentrated supply chains, multiple competing technologies under one roof, mature sampling and production capacity, and pricing that allows Western and regional manufacturers to compete on finished garment cost. The trade-off — distance, language, time zone and quality variability across factories — is real but manageable when you know what to evaluate.",
        ],
      },
      {
        heading: "What to Evaluate Before You Commit",
        bullets: [
          "Technology range — a supplier who can run silicone, reflective, DTF and specialty transfers keeps your program flexible; a single-technology factory forces you to split orders",
          "In-house sampling — sampling done on the production line, not a separate studio, gives samples that match bulk output",
          "MOQ by technology — rhinestone, silicone and reflective typically start at 100–500 pieces; DTF can run lower, hot-fix rolls are the most flexible",
          "Lead time — sample 5–10 days, bulk 10–25 days depending on technology and quantity; faster is possible at a price",
          "Communication — one named account contact, English fluency, and a documented review process for artwork and specs",
        ],
      },
      {
        heading: "The Sampling Process in Practice",
        paragraphs: [
          "The fastest way to evaluate a Chinese transfer supplier is to run a real sample program: send production artwork, request a sample on the actual garment or fabric, and judge on (a) color and dimensional accuracy, (b) application parameters, (c) wash performance after 5–10 cycles, and (d) whether the sample was actually produced on the line that will run the bulk order. A factory that refuses to sample on your fabric — or that insists on a generic test swatch — is a red flag for the bulk order that follows.",
        ],
      },
      {
        heading: "QC and Repeat Orders",
        bullets: [
          "Request a documented QC process — in-process inspection, AQL sampling, pre-shipment check",
          "Lock approved specifications in writing: Pantone references, dimensions, adhesive type, application parameters, packaging",
          "Plan repeat orders around the same specification — locked specs mean re-orders run without re-sampling",
          "Agree on defect handling before bulk — credit, replacement or rework, with thresholds documented",
        ],
      },
      {
        heading: "Shipping, Lead Time and Total Cost",
        paragraphs: [
          "Sea freight is the standard for full-bulk orders (20–35 days transit from Yiwu / Ningbo / Shanghai to most ports); air freight is reserved for samples and rush replenishments. Total landed cost should be modeled with the supplier's quote: per-piece price, sampling cost (often credited against the first bulk order), tooling or setup fees, freight, duty and any warehousing at the destination. A quote that looks cheaper on a per-piece basis is often more expensive once these adders are included.",
        ],
      },
      {
        heading: "What Working With Us Looks Like",
        paragraphs: [
          "We are a custom heat transfer manufacturer based in Yiwu, China, with production across silicone, reflective, rhinestone, DTF, 3D, PU and specialty technologies under one roof. Garment manufacturers send us artwork and project specs; we review files, recommend a technology, sample on the actual fabric when required, and manufacture the approved transfer to a locked specification that supports repeat orders. Quote requests are answered within 24 hours, and we work with programs from a few hundred pieces upward.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return RESOURCES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) return {};
  return {
    title: `${resource.name} | ChinaRhinestone`,
    description: `${resource.tagline} Guidance for garment manufacturers sourcing custom heat transfers from China.`,
    alternates: {
      canonical: `/resources/${resource.slug}`,
    },
  };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();

  const article = ARTICLES[resource.slug];
  const related = RESOURCES.filter(
    (r) => r.category === resource.category && r.slug !== resource.slug
  );
  /* CTA-friendly product links: surface the most-used heat-transfer
   * technologies so the article drives traffic into the product funnel. */
  const relatedProducts = getRelatedProducts("rhinestone-heat-transfers", 4);

  /* Use the shared article schema builder (defined in lib/seo.ts) so
   * every page that emits an article follows the same shape and
   * Google only has to learn one format. */
  const articleSchema = buildArticleSchema({
    slug: resource.slug,
    headline: resource.name,
    description: resource.tagline,
    datePublished: "2026-08-29",
    dateModified: "2026-08-29",
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
      { "@type": "ListItem", position: 3, name: resource.name, item: `${SITE_URL}/resources/${resource.slug}` },
    ],
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageHero
        eyebrow={resource.category}
        title={resource.name}
        intro={resource.tagline}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: resource.name, href: `/resources/${resource.slug}` },
        ]}
      />

      {/* Article body */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-3 lg:px-8">
          <article className="lg:col-span-2">
            {article ? (
              <>
                <p className="text-lg leading-relaxed text-slate-700">{article.intro}</p>
                <div className="mt-12 space-y-12">
                  {article.sections.map((s, i) => (
                    <div key={s.heading}>
                      <h2 className="flex items-baseline gap-3 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                        <span className="text-sm font-bold text-blue-700">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {s.heading}
                      </h2>
                      {s.paragraphs?.map((p) => (
                        <p key={p.slice(0, 40)} className="mt-4 leading-relaxed text-slate-600">
                          {p}
                        </p>
                      ))}
                      {s.bullets && (
                        <ul className="mt-4 space-y-2.5">
                          {s.bullets.map((b) => (
                            <li key={b} className="flex items-start gap-3">
                              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
                              <span className="leading-relaxed text-slate-600">{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-lg leading-relaxed text-slate-600">{resource.tagline}</p>
            )}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              {related.length > 0 && (
                <>
                  <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
                    Related {resource.category === "Guides" ? "Guides" : "Articles"}
                  </h2>
                  <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
                    {related.map((r) => (
                      <li key={r.slug}>
                        <Link
                          href={`/resources/${r.slug}`}
                          className="flex items-start justify-between gap-3 px-5 py-4 transition hover:bg-slate-50"
                        >
                          <div>
                            <p className="text-sm font-bold text-slate-900">{r.name}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                              {r.tagline}
                            </p>
                          </div>
                          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="mt-6 rounded-xl bg-slate-900 p-6 text-white">
                <p className="text-sm font-bold">Have a production question?</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Talk to our team about your garment program — we answer with
                  specifications and samples, not brochures.
                </p>
                <Link
                  href="/get-a-quote"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  Get a Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Cross-link to products — surfaces the editorial
               * content inside the product funnel and gives Google
               * reciprocal crawl paths between /resources/* and
               * /heat-transfers/*. */}
              <h2 className="mt-8 text-sm font-bold uppercase tracking-[0.15em] text-slate-500">
                Popular Technologies
              </h2>
              <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {relatedProducts.map((t) => (
                  <li key={t.slug}>
                    <Link
                      href={`/heat-transfers/${t.slug}`}
                      className="flex items-start justify-between gap-3 px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                          {t.shortName}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
