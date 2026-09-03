import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileSearch, MessageSquare, FlaskConical, Beaker, Factory, ScanLine, Package, Truck } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { MANUFACTURING_CAPS, TECHNOLOGIES } from "@/lib/v2";

export const metadata: Metadata = {
  title: "Heat Transfer Manufacturing Process — Artwork to Bulk Production | ChinaRhinestone",
  description:
    "How we manufacture custom heat transfers: artwork review, technology recommendation, sampling, testing, bulk production, QC, packing and delivery. China-based manufacturer serving garment factories worldwide.",
  alternates: {
    canonical: "/manufacturing",
  },
};

const STEPS = [
  {
    icon: FileSearch,
    title: "Artwork",
    text: "Send us your logo, graphic or artwork. We review files, sizing and color separation, and flag anything that needs adjusting before production.",
  },
  {
    icon: MessageSquare,
    title: "Process Recommendation",
    text: "We confirm the right transfer technology for your garment, fabric, stretch level and desired effect — with alternatives where they exist.",
  },
  {
    icon: FlaskConical,
    title: "Sampling",
    text: "A production-method sample is made for your approval. What you approve is what gets produced — specification, color, size and finish.",
  },
  {
    icon: Beaker,
    title: "Testing",
    text: "Application parameters are confirmed on your actual fabric, including wash and stretch testing where the program requires it.",
  },
  {
    icon: Factory,
    title: "Bulk Production",
    text: "Approved transfers are manufactured to the confirmed specification with in-process quality monitoring.",
  },
  {
    icon: ScanLine,
    title: "QC",
    text: "Final inspection checks each batch against the approved standard before anything is packed.",
  },
  {
    icon: Package,
    title: "Packing",
    text: "Transfers are packed according to your order requirements — by style, color, size or production line, ready for your factory floor.",
  },
  {
    icon: Truck,
    title: "Delivery",
    text: "International shipping with tracking, including DDP options, aligned with your garment production schedule.",
  },
];

export default function ManufacturingPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Manufacturing"
        title="From Artwork to Bulk Production"
        intro="A controlled, repeatable production process that supports garment manufacturing — not a one-off print job. Every order follows the same eight stages."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Manufacturing", href: "/manufacturing" }]}
      />

      {/* 8-step process */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50">
                    <s.icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <span className="text-sm font-black text-slate-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="mt-4 text-base font-bold text-slate-900">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Manufacturing Capabilities
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            What we provide as a manufacturing partner to garment producers.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MANUFACTURING_CAPS.map((c) => (
              <div key={c.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technologies we produce */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Technologies We Produce
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Eight transfer technologies from one manufacturing partner.
              </p>
            </div>
            <Link
              href="/heat-transfers"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              Explore All Technologies
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECHNOLOGIES.map((t) => (
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
