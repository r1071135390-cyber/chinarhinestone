import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, Upload } from "lucide-react";
import { Breadcrumb } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import {
  TECHNOLOGIES,
  INDUSTRIES,
  APPLICATIONS,
  FABRICS,
  getTechnology,
} from "@/lib/v2";

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
    title: `${tech.name} | Custom ${tech.shortName} Manufacturer ChinaRhinestone`,
    description: `${tech.tagline} Custom development, bulk production and repeat orders for garment manufacturers worldwide. Request a quote — reply within 24 hours.`,
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

  const others = TECHNOLOGIES.filter((t) => t.slug !== tech.slug).slice(0, 4);

  const SITE_URL = "https://chinarhinestone.com";
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Heat Transfers", item: `${SITE_URL}/heat-transfers` },
      { "@type": "ListItem", position: 3, name: tech.name, item: `${SITE_URL}/heat-transfers/${tech.slug}` },
    ],
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
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
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tech.image}
                alt={tech.name}
                width={1200}
                height={900}
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

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

      <CtaBand />
    </div>
  );
}
