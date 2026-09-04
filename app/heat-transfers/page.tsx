import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { CORE_TECHNOLOGIES, SPECIALTY_TECHNOLOGIES } from "@/lib/v2";

export const metadata: Metadata = {
  title: "Custom Heat Transfers — Rhinestone, Silicone, Reflective, DTF, 3D, PU | ChinaRhinestone",
  description:
    "Custom heat transfers for garment manufacturers: rhinestone, silicone, reflective, DTF, 3D raised, PU, glitter, flock and specialty transfers. China manufacturer, bulk production, custom development and repeat supply. Request a quote.",
  alternates: {
    canonical: "/heat-transfers",
  },
};

export default function HeatTransfersPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Heat Transfers"
        title="Heat Transfers Made for Garment Production"
        intro="Choose from multiple transfer technologies based on your garment, fabric, design and desired effect. All technologies are manufactured in-house for consistent quality across sampling, bulk production and repeat orders."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Heat Transfers", href: "/heat-transfers" }]}
      />

      {/* Core technologies */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Core Technologies
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              The Technologies Behind Most Programs
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Five proven technologies covering the majority of garment branding and
              decoration requirements.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_TECHNOLOGIES.map((t) => (
              <Link
                key={t.slug}
                href={`/heat-transfers/${t.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={t.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {t.hasDesignerTool && (
                    <span className="absolute left-3 top-3 flex items-center gap-1 rounded bg-blue-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      <Sparkles className="h-3 w-3" />
                      Free Design Tool
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.tagline}</p>
                  <ul className="mt-4 space-y-1.5">
                    {t.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                    Explore {t.shortName} Transfers
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Specialty technologies */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              Specialty
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
              Specialty Effects for Standout Designs
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Eye-catching effects for fashion programs and premium garment decoration.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SPECIALTY_TECHNOLOGIES.map((t) => (
              <Link
                key={t.slug}
                href={`/heat-transfers/${t.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-lg"
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
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.tagline}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                    Explore {t.shortName} Transfers
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Help choosing */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-10">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Not Sure Which Transfer You Need?
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
              The right transfer depends on your garment, fabric, application and desired
              appearance. Tell us what you&apos;re producing and we&apos;ll help you evaluate
              suitable options.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/get-a-quote"
                className="inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                Get a Transfer Recommendation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/fabrics"
                className="inline-flex items-center justify-center gap-2 rounded border border-slate-300 px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-white"
              >
                Check Fabric Compatibility
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
