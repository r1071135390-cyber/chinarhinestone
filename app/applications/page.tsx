import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Tag, Heart, FileSearch, Hash, Eye, Gem } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { APPLICATIONS } from "@/lib/v2";

export const metadata: Metadata = {
  title: "Custom Garment Transfer Applications — Logos, Labels, Names & Numbers | ChinaRhinestone",
  description:
    "Custom heat transfer applications for garment manufacturers: logo transfers, garment branding, heat transfer labels, name & number transfers, reflective markings and decorative transfers. Bulk production for apparel factories.",
  alternates: {
    canonical: "/applications",
  },
};

const GROUPS = [
  {
    label: "Branding",
    slugs: ["logo-heat-transfers", "garment-branding-transfers"],
  },
  {
    label: "Garment Identification",
    slugs: ["heat-transfer-labels", "name-number-transfers"],
  },
  {
    label: "Special Effects",
    slugs: ["reflective-marking-transfers", "decorative-heat-transfers"],
  },
];

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "logo-heat-transfers": Tag,
  "garment-branding-transfers": Heart,
  "heat-transfer-labels": FileSearch,
  "name-number-transfers": Hash,
  "reflective-marking-transfers": Eye,
  "decorative-heat-transfers": Gem,
};

export default function ApplicationsPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Applications"
        title="One Transfer Partner. Multiple Apparel Applications."
        intro="From brand logos to garment labels and decorative graphics, we develop transfer solutions around your production requirements — all through one manufacturing partner."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Applications" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="space-y-12">
            {GROUPS.map((g) => (
              <div key={g.label}>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {g.label}
                  </h2>
                  <span className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {APPLICATIONS.filter((a) => g.slugs.includes(a.slug)).map((a) => {
                    const Icon = ICONS[a.slug] ?? Tag;
                    return (
                      <Link
                        key={a.slug}
                        href={`/applications/${a.slug}`}
                        className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                          <Icon className="h-5 w-5 text-blue-700" />
                        </div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">{a.name}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {a.description}
                        </p>
                        <p className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                          Explore {a.name}
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
