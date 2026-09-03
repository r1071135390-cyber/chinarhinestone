import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ShieldCheck, Repeat, FileCheck2 } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { QC_STAGES } from "@/lib/v2";

export const metadata: Metadata = {
  title: "Quality Control for Custom Heat Transfers | ChinaRhinestone Manufacturer",
  description:
    "Quality control for custom heat transfers: artwork review, sample inspection, in-production monitoring and final QC before shipment — consistent quality across repeat bulk orders for garment manufacturers.",
  alternates: {
    canonical: "/quality-control",
  },
};

const PRINCIPLES = [
  {
    icon: FileCheck2,
    title: "Specification-First",
    text: "Every order runs against a written specification — artwork, dimensions, colors, technology and application parameters. If it isn't specified, it isn't produced.",
  },
  {
    icon: Repeat,
    title: "Repeat-Order Consistency",
    text: "Approved specifications are archived and reused for repeat orders, so batch 3 looks like batch 1. This is what garment production lines actually need.",
  },
  {
    icon: ShieldCheck,
    title: "Tested on Your Fabric",
    text: "Where required, we test application, wash and stretch performance on your actual fabric before bulk production — not on a generic swatch.",
  },
];

export default function QualityControlPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Quality Control"
        title="Production & Quality Control"
        intro="Consistent specifications from sampling through bulk production and repeat orders. Quality control at ChinaRhinestone is a production process, not a final glance."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Quality Control", href: "/quality-control" }]}
      />

      {/* QC stages */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            QC at Every Production Stage
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {QC_STAGES.map((s, i) => (
              <div key={s.title} className="rounded-xl border border-slate-200 p-6">
                <span className="text-sm font-black text-blue-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            How We Keep Quality Consistent
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                  <p.icon className="h-5 w-5 text-blue-700" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                What Gets Checked
              </h2>
              <ul className="mt-6 space-y-3">
                {[
                  "Dimensional accuracy against the approved artwork",
                  "Color consistency against approved references",
                  "Edge definition and registration for multi-layer transfers",
                  "Stone placement and retention for rhinestone programs",
                  "Reflective performance for visibility-critical markings",
                  "Application parameters documented for your production team",
                ].map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm leading-relaxed text-slate-700">{c}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/get-a-quote"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                Start a Project With Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl bg-slate-900 p-8 text-white">
              <h3 className="text-lg font-black">Quality You Can Verify</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                We don&apos;t ask you to trust adjectives. Every program starts with a
                physical sample you approve, and every repeat order is produced against
                the same archived specification.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                If a batch doesn&apos;t meet the approved standard, it doesn&apos;t ship.
                That policy is cheaper for everyone than a rejected garment run.
              </p>
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm">
                <ShieldCheck className="h-4 w-4 shrink-0 text-blue-400" />
                Spec-controlled production · Archiving for repeat orders
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
