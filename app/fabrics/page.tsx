import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Layers, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { FABRICS } from "@/lib/v2";

export const metadata: Metadata = {
  title: "Heat Transfer Fabric Compatibility — Cotton, Polyester, Nylon & More | ChinaRhinestone",
  description:
    "Heat transfer compatibility by fabric type: cotton, polyester, nylon, stretch and performance fabrics. We recommend the right custom heat transfer technology for your garment material. China manufacturer, bulk supply.",
  alternates: {
    canonical: "/fabrics",
  },
};

export default function FabricsPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Fabric Compatibility"
        title="The Right Transfer Starts With Your Fabric"
        intro="Different fabrics can require different transfer solutions. We consider fabric composition, stretch, garment construction and application requirements when recommending a transfer technology."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Fabrics", href: "/fabrics" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FABRICS.map((f) => (
              <Link
                key={f.slug}
                href={`/fabrics/${f.slug}`}
                className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                  <Layers className="h-5 w-5 text-blue-700" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">{f.name}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{f.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.description}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                  Explore {f.name} Compatibility
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 rounded-xl bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-slate-600">
              <span className="font-bold text-slate-900">
                Not sure what works with your fabric?
              </span>{" "}
              Send us your garment information and we&apos;ll help you evaluate the options.
            </p>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-1.5 rounded bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              <MessageCircle className="h-4 w-4" />
              Ask Our Team
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
