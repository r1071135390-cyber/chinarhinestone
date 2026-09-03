import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, BarChart3 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { RESOURCES, FAQS } from "@/lib/v2";

export const metadata: Metadata = {
  title: "Heat Transfer Guides & Resources for Garment Manufacturers | ChinaRhinestone",
  description:
    "Guides and resources for garment manufacturers sourcing custom heat transfers: technology selection, fabric compatibility, artwork guidelines, application settings and durability. Learn before you buy from a China manufacturer.",
  alternates: {
    canonical: "/resources",
  },
};

export default function ResourcesPage() {
  const guides = RESOURCES.filter((r) => r.category === "Guides");
  const insights = RESOURCES.filter((r) => r.category === "Comparisons & Insights");

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Resources"
        title="Heat Transfer Guides & Insights"
        intro="Practical information for garment manufacturers evaluating custom heat transfers — from technology selection to artwork preparation and durability expectations."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Resources", href: "/resources" }]}
      />

      {/* Guides */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-700" />
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Guides</h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guides.map((r) => (
              <Link
                key={r.slug}
                href={`/resources/${r.slug}`}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
              >
                <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {r.tagline}
                </p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                  Read guide
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Comparisons & Insights */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-700" />
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Comparisons & Insights
            </h2>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((r) => (
              <Link
                key={r.slug}
                href={`/resources/${r.slug}`}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
              >
                <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {r.tagline}
                </p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                  Read article
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <h2 className="text-center text-2xl font-black tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200">
            {FAQS.map((f) => (
              <details key={f.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-slate-900 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="shrink-0 text-xl font-light text-blue-700 transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
