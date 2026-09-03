import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { INDUSTRIES } from "@/lib/v2";

export const metadata: Metadata = {
  title: "Heat Transfers for Garment Manufacturers & Apparel Factories | ChinaRhinestone",
  description:
    "Custom heat transfer solutions for garment manufacturers, sportswear factories, workwear producers, fashion apparel brands, teamwear makers, Pakistan garment exporters and Bangladesh knitwear manufacturers. Bulk production, consistent quality, repeat orders from a China manufacturer.",
  alternates: {
    canonical: "/industries",
  },
};

export default function IndustriesPage() {
  const garment = INDUSTRIES.find((i) => i.slug === "garment-manufacturers");
  const segments = INDUSTRIES.filter((i) => i.slug !== "garment-manufacturers");

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Industries"
        title="Built for Garment Manufacturers"
        intro="We work with apparel manufacturers that need reliable custom transfers for ongoing garment production, from individual projects to repeat bulk orders."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Industries", href: "/industries" }]}
      />

      {/* Primary: Garment Manufacturers */}
      {garment && (
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                  Garment Manufacturing
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                  {garment.name}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-slate-600">
                  {garment.description}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {[
                    "Consistent specifications across repeat orders",
                    "Production scheduling aligned with your garment program",
                    "Quality control from development to final inspection",
                    "Support for sampling, bulk production and ongoing supply",
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/industries/${garment.slug}`}
                  className="mt-8 inline-flex items-center gap-2 rounded bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
                >
                  Explore Garment Manufacturers
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={garment.image}
                  alt={garment.name}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Apparel segments */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Apparel Segments
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Find Your Industry
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Transfer solutions organized around the requirements of each apparel segment.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {segments.map((i) => (
              <Link
                key={i.slug}
                href={`/industries/${i.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={i.image}
                    alt={i.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-slate-900">{i.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{i.tagline}</p>
                  <p className="mt-2 text-sm font-bold text-blue-700">
                    Explore {i.name.replace(" Manufacturers", "")} →
                  </p>
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
