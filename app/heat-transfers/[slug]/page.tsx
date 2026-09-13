import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, Upload } from "lucide-react";
import { Breadcrumb } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { HeroCarousel } from "@/components/product/HeroCarousel";
import { ProductGallery } from "@/components/product/ProductGallery";
import {
  TECHNOLOGIES,
  INDUSTRIES,
  APPLICATIONS,
  FABRICS,
  getTechnology,
  getGalleryImages,
  getRelatedProducts,
  getRelatedResources,
  getResource,
} from "@/lib/v2";
import {
  buildProductSchema,
} from "@/lib/seo";

/* ── Infer the canonical material string for Product.material ──
 * Used by the Product JSON-LD. Falls back to a generic label for
 * specialty technologies that have no fixed material.
 * ───────────────────────────────────────────────────────────── */
function inferMaterial(slug: string): string | undefined {
  if (slug.startsWith("rhinestone-austrian")) return "Austrian-cut crystal";
  if (slug.startsWith("rhinestone-korean")) return "Korean-cut crystal";
  if (slug.startsWith("rhinestone-china-grade-a")) return "China A-grade crystal";
  if (slug.startsWith("rhinestone-china-grade-b")) return "China B-grade crystal";
  if (slug.startsWith("rhinestone-")) return "Crystal rhinestone";
  if (slug.startsWith("silicone-")) return "Silicone";
  if (slug.startsWith("reflective-")) return "Reflective film";
  if (slug.startsWith("dtf-")) return "DTF PET film with hot-melt adhesive";
  if (slug.startsWith("pu-")) return "Polyurethane (PU)";
  if (slug.startsWith("flock-")) return "Nylon / viscose flock fiber";
  if (slug.startsWith("glitter-")) return "Glitter particles with adhesive";
  if (slug.startsWith("3d-raised")) return "Silicone or PU foam";
  if (slug.startsWith("specialty-")) return undefined; // varies
  return undefined;
}

export function generateStaticParams() {
  return TECHNOLOGIES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tech = getTechnology(slug);
  if (!tech) return {};
  return {
    title: `${tech.name} | ChinaRhinestone`,
    description: `${tech.tagline} Bulk production and repeat orders for garment manufacturers. Reply within 24 hours.`,
    alternates: {
      canonical: `/heat-transfers/${tech.slug}`,
    },
    keywords: [
      `${tech.name.toLowerCase()}`,
      `custom ${tech.shortName.toLowerCase()} heat transfers`,
      `${tech.shortName} heat press transfers wholesale`,
      "custom heat transfer China manufacturer",
      "garment heat transfer bulk order",
      "apparel heat press transfers",
      ...(tech.aliases ?? []).map((a) => a.toLowerCase()),
    ],
  };
}

export default async function TechnologyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tech = getTechnology(slug);
  if (!tech) notFound();

  const galleryMedia = getGalleryImages(tech);
  /* Related-product list is now context-aware (same family / same
   * technology) — see getRelatedProducts in lib/v2.ts. */
  const others = getRelatedProducts(tech.slug);
  /* Resource pages (guides & comparisons) most relevant to this
   * product. Surfaces the editorial content in the product funnel
   * and gives Google fresh cross-linked crawl paths between
   * /heat-transfers/* and /resources/*. */
  const relatedResources = getRelatedResources(tech.slug)
    .map((s) => getResource(s))
    .filter((r): r is NonNullable<ReturnType<typeof getResource>> => Boolean(r));

  /* Note: the <Breadcrumb /> component below already emits its own
   * BreadcrumbList JSON-LD via PageHero, so we don't add a second one
   * here — adding a duplicate would trigger a Google structured-data
   * "multiple breadcrumb" warning. */

  /* Product schema — declared so Google indexes the page as a product
   * (eligible for Product rich snippets and Product graph knowledge
   * panel). */
  const productSchema = buildProductSchema({
    slug: tech.slug,
    name: tech.name,
    shortName: tech.shortName,
    description: tech.description,
    image: tech.image,
    gallery: tech.gallery,
    material: inferMaterial(tech.slug),
    category:
      tech.tier === "core"
        ? "Custom Heat Transfers for Apparel"
        : "Specialty Heat Transfers for Apparel",
  });

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Heat Transfers", href: "/heat-transfers" },
              { label: tech.name, href: `/heat-transfers/${tech.slug}` },
            ]}
          />
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                {tech.tier === "core" ? "Core Technology" : "Specialty Technology"}
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {tech.name}
              </h1>
              {tech.aliases && tech.aliases.length > 0 && (
                <p className="mt-2 text-sm font-medium text-slate-400">
                  Also known as: {tech.aliases.join(" · ")}
                </p>
              )}
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                {tech.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/get-a-quote"
                  className="inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
                >
                  Get a Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {tech.hasDesignerTool ? (
                  <a
                    href="/designer.html"
                    className="inline-flex items-center justify-center gap-2 rounded border border-blue-500/60 px-6 py-3 text-sm font-bold text-blue-400 transition hover:bg-blue-500/10"
                  >
                    <Sparkles className="h-4 w-4" />
                    Design Online — Free
                  </a>
                ) : (
                  <Link
                    href="/get-a-quote"
                    className="inline-flex items-center justify-center gap-2 rounded border border-slate-600 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-slate-800"
                  >
                    <Upload className="h-4 w-4" />
                    Send Your Artwork
                  </Link>
                )}
              </div>
            </div>
            <div>
              <HeroCarousel media={galleryMedia} alt={tech.name} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Product gallery */}
      {galleryMedia.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {tech.shortName} Product Gallery
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Production samples, application examples and detail views.
                Click any image to open full-size.
              </p>
            </div>
            <ProductGallery media={galleryMedia} alt={tech.name} />
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Key Characteristics
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {tech.name} developed for garment production programs — sampling, bulk
                manufacturing and repeat orders.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
              {tech.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-800">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            How to Order {tech.shortName} Transfers
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Send us your artwork and requirements. We&apos;ll review your project, recommend
            specifications, produce samples when required and manufacture your transfers to
            confirmed specifications.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Send Artwork",
                text: "Share your logo, graphic or design files.",
              },
              {
                step: "02",
                title: "Review & Sample",
                text: "We confirm specifications and produce samples when required.",
              },
              {
                step: "03",
                title: "Bulk Production",
                text: "Approved transfers are manufactured for your program.",
              },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-slate-200 bg-white p-6">
                <p className="text-xl font-black text-blue-700">{s.step}</p>
                <h3 className="mt-2 text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal linking: industries + applications + fabrics */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Common Industries</h2>
              <ul className="mt-4 space-y-2.5">
                {INDUSTRIES.slice(0, 4).map((i) => (
                  <li key={i.slug}>
                    <Link
                      href={`/industries/${i.slug}`}
                      className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      {i.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Common Applications</h2>
              <ul className="mt-4 space-y-2.5">
                {APPLICATIONS.slice(0, 4).map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/applications/${a.slug}`}
                      className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      {a.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Fabric Compatibility</h2>
              <ul className="mt-4 space-y-2.5">
                {FABRICS.slice(0, 4).map((f) => (
                  <li key={f.slug}>
                    <Link
                      href={`/fabrics/${f.slug}`}
                      className="text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      {f.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Other technologies */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Explore Other Technologies
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((t) => (
              <Link
                key={t.slug}
                href={`/heat-transfers/${t.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={t.name}
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                  <p className="mt-1 text-xs font-bold text-blue-700">Explore →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Related guides & insights (editorial cross-link) */}
      {relatedResources.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Helpful Guides for {tech.shortName}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Practical reading on selection, application and durability — drawn from
                our production work with garment manufacturers.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {relatedResources.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/resources/${r.slug}`}
                    className="group flex h-full items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-sm"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                        {r.category}
                      </p>
                      <h3 className="mt-2 text-base font-bold text-slate-900">
                        {r.name}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {r.tagline}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-700 transition group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <CtaBand />
    </div>
  );
}
