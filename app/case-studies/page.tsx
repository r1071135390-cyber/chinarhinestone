import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { CASE_STUDIES } from "@/lib/v2";

export const metadata: Metadata = {
  title: "Case Studies — Custom Heat Transfer Programs for Garment Manufacturers | ChinaRhinestone",
  description:
    "Case studies of custom heat transfer programs in production for sportswear, workwear and fashion apparel manufacturers. Technology selection, bulk production and repeat supply from a China manufacturer.",
  alternates: {
    canonical: "/case-studies",
  },
};

const CASE_DETAILS: Record<string, { summary: string; points: string[] }> = {
  "case-01": {
    summary:
      "A sportswear manufacturer needed main brand logos that survive compression fabrics and repeated washing. We developed silicone logo transfers with stretch-matched specifications, validated with wash and stretch-cycle testing before bulk production.",
    points: [
      "Technology: stretch-rated silicone transfer system",
      "Validated on the customer's actual performance knit before production",
      "Specification archived for repeat seasonal orders",
    ],
  },
  "case-02": {
    summary:
      "A workwear producer required branding and hi-vis markings that hold up through industrial laundering. We supplied reflective transfer markings with documented application parameters for their production lines.",
    points: [
      "Technology: reflective transfer system rated for visibility performance",
      "Application parameters documented for the customer's press setup",
      "Repeat-order consistency maintained across garment programs",
    ],
  },
  "case-03": {
    summary:
      "A fashion apparel brand wanted sparkling decoration for a seasonal collection. Using our free online design studio, the customer prepared rhinestone artwork, then we handled color matching, sampling and bulk production.",
    points: [
      "Technology: rhinestone transfers from the 32-color stone library",
      "Artwork developed in our free online design studio",
      "Sampling and bulk production from one manufacturing partner",
    ],
  },
};

export default function CaseStudiesPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Case Studies"
        title="Custom Transfer Programs in Production"
        intro="Examples of how garment manufacturers use our transfer technologies — from development and sampling through bulk production and repeat orders."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Case Studies", href: "/case-studies" }]}
      />

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="space-y-12">
            {CASE_STUDIES.map((c) => {
              const detail = CASE_DETAILS[c.id];
              return (
                <article
                  key={c.id}
                  className="grid items-center gap-8 rounded-2xl border border-slate-200 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12"
                >
                  <div className="overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      decoding="async"
                      width={1200}
                      height={900}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {c.technology}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {c.industry}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {c.application}
                      </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900">
                      {c.title}
                    </h2>
                    <p className="mt-3 leading-relaxed text-slate-600">{detail?.summary}</p>
                    <ul className="mt-4 space-y-2">
                      {detail?.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl bg-slate-50 p-8 text-center">
            <h2 className="text-xl font-black text-slate-900">
              Have a similar program in mind?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Send us your artwork and requirements — we&apos;ll confirm the right
              technology and a sampling plan.
            </p>
            <Link
              href="/get-a-quote"
              className="mt-5 inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              Get a Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
