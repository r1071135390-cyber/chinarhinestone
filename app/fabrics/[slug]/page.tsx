import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Check, Minus, MessageCircle } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { FABRICS, TECHNOLOGIES, getTechnology, getFabric } from "@/lib/v2";

/* ── Per-fabric detail content ─────────────────────────────
   General guidance only — final specs are confirmed through
   sampling and testing with the customer's actual fabric. */
const FABRIC_DETAIL: Record<
  string,
  { recommended: string[]; considerations: string[] }
> = {
  cotton: {
    recommended: [
      "rhinestone-heat-transfers",
      "dtf-heat-transfers",
      "pu-heat-transfers",
      "silicone-heat-transfers",
      "glitter-heat-transfers",
    ],
    considerations: [
      "Weave and weight affect adhesion — heavier, denser weaves generally provide the most reliable bond",
      "Garments should be fully dry before application; cotton's moisture content can affect bonding",
      "Ring-spun and combed cotton provide smoother surfaces for fine-detail transfers",
      "Pre-shrunk garments are recommended to prevent transfer distortion after laundering",
    ],
  },
  polyester: {
    recommended: [
      "reflective-heat-transfers",
      "dtf-heat-transfers",
      "silicone-heat-transfers",
      "pu-heat-transfers",
      "3d-raised-heat-transfers",
    ],
    considerations: [
      "Dye migration can occur with disperse dyes — dye-blocking or lower-temperature solutions are recommended",
      "Performance polyester knits require stretch-compatible transfer systems",
      "Sublimated fabrics need dedicated testing to prevent ghosting and color shift",
      "Mesh and open-knit constructions affect carrier and coverage recommendations",
    ],
  },
  nylon: {
    recommended: [
      "silicone-heat-transfers",
      "reflective-heat-transfers",
      "specialty-heat-transfers",
    ],
    considerations: [
      "Nylon requires lower application temperatures to avoid fabric distortion or shrinkage",
      "Coated and DWR-treated nylons need adhesion testing before production",
      "Taffeta and ripstop weaves may require carrier adjustments for full coverage",
      "Seam-sealed garments should be checked for heat sensitivity before application",
    ],
  },
  "stretch-fabrics": {
    recommended: [
      "silicone-heat-transfers",
      "dtf-heat-transfers",
      "pu-heat-transfers",
      "rhinestone-heat-transfers",
    ],
    considerations: [
      "Elastane content above 15% requires high-stretch transfer systems",
      "Transfers must recover with the fabric without cracking through repeated wear",
      "Compression garments need thin, flexible transfers with strong stretch recovery",
      "Application testing should include repeated stretch cycles, not just wash testing",
    ],
  },
  "performance-fabrics": {
    recommended: [
      "silicone-heat-transfers",
      "dtf-heat-transfers",
      "pu-heat-transfers",
      "reflective-heat-transfers",
    ],
    considerations: [
      "Moisture-wicking finishes can affect adhesive bonding — surface testing is recommended",
      "Thin, breathable transfer constructions preserve the fabric's moisture management properties",
      "Lightweight knit constructions require precise pressure control during application",
      "Proprietary fabric finishes should always be tested before committing to bulk production",
    ],
  },
};

/* ── Fabric × technology compatibility (general guidance) ── */
const COMPATIBLE: Record<string, string[]> = {
  cotton: [
    "silicone-heat-transfers",
    "reflective-heat-transfers",
    "rhinestone-heat-transfers",
    "dtf-heat-transfers",
    "3d-raised-heat-transfers",
    "pu-heat-transfers",
    "glitter-heat-transfers",
    "flock-heat-transfers",
    "specialty-heat-transfers",
  ],
  polyester: [
    "silicone-heat-transfers",
    "reflective-heat-transfers",
    "dtf-heat-transfers",
    "3d-raised-heat-transfers",
    "pu-heat-transfers",
    "glitter-heat-transfers",
    "flock-heat-transfers",
    "specialty-heat-transfers",
  ],
  nylon: [
    "silicone-heat-transfers",
    "reflective-heat-transfers",
    "specialty-heat-transfers",
  ],
  "stretch-fabrics": [
    "silicone-heat-transfers",
    "rhinestone-heat-transfers",
    "dtf-heat-transfers",
    "pu-heat-transfers",
    "flock-heat-transfers",
  ],
  "performance-fabrics": [
    "silicone-heat-transfers",
    "reflective-heat-transfers",
    "dtf-heat-transfers",
    "3d-raised-heat-transfers",
    "pu-heat-transfers",
  ],
};

export function generateStaticParams() {
  return FABRICS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fabric = getFabric(slug);
  if (!fabric) return {};
  return {
    title: `Heat Transfers for ${fabric.name} Fabric | Compatibility Guide — ChinaRhinestone`,
    description: `${fabric.description} Recommended transfer technologies, compatibility matrix and production considerations for custom heat transfers on ${fabric.name.toLowerCase()} garments. China manufacturer, bulk supply.`,
    alternates: {
      canonical: `/fabrics/${fabric.slug}`,
    },
  };
}

export default async function FabricPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fabric = getFabric(slug);
  if (!fabric) notFound();

  const detail = FABRIC_DETAIL[fabric.slug];
  const recommendedTechs = detail.recommended
    .map((s) => getTechnology(s))
    .filter((t) => t !== undefined);
  const others = FABRICS.filter((f) => f.slug !== fabric.slug);

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Fabric Compatibility"
        title={`Heat Transfers for ${fabric.name}`}
        intro={fabric.description}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Fabrics", href: "/fabrics" },
          { label: fabric.name, href: `/fabrics/${fabric.slug}` },
        ]}
      />

      {/* Compatibility matrix */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {fabric.name} × Transfer Technology Compatibility
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            How {fabric.name.toLowerCase()} works with each of our transfer technologies.
            This matrix is general guidance — final compatibility is confirmed through
            sampling and testing with your actual fabric.
          </p>
          <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">
                    Fabric
                  </th>
                  {TECHNOLOGIES.map((t) => (
                    <th
                      key={t.slug}
                      className="border-b border-slate-200 px-3 py-3 text-center font-bold text-slate-900"
                    >
                      {t.shortName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FABRICS.map((f) => {
                  const compatible = COMPATIBLE[f.slug] ?? [];
                  const isCurrent = f.slug === fabric.slug;
                  return (
                    <tr key={f.slug} className={isCurrent ? "bg-blue-50/60" : undefined}>
                      <th
                        scope="row"
                        className={`border-b border-slate-200 px-4 py-3 text-left font-semibold ${
                          isCurrent ? "text-blue-700" : "text-slate-800"
                        }`}
                      >
                        {f.name}
                        {isCurrent && (
                          <span className="ml-2 rounded bg-blue-700 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            This fabric
                          </span>
                        )}
                      </th>
                      {TECHNOLOGIES.map((t) => {
                        const ok = compatible.includes(t.slug);
                        return (
                          <td
                            key={t.slug}
                            className="border-b border-slate-200 px-3 py-3 text-center"
                          >
                            {ok ? (
                              <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Compatible" />
                            ) : (
                              <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="Not recommended" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            ✓ Generally compatible · — Not typically recommended. Actual compatibility depends
            on fabric construction, finishes and testing results.
          </p>
        </div>
      </section>

      {/* Recommended technologies */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Recommended Transfers for {fabric.name}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Technologies we most commonly recommend for {fabric.name.toLowerCase()} garments.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedTechs.map((t) => (
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

      {/* Key considerations */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                What We Consider for {fabric.name}
              </h2>
              <ul className="mt-6 space-y-3">
                {detail.considerations.map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm leading-relaxed text-slate-700">{c}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-col items-start gap-3 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-slate-600">
                  <span className="font-bold text-slate-900">Working with {fabric.name}?</span>{" "}
                  Send us your fabric details and we&apos;ll confirm the right approach.
                </p>
                <Link
                  href="/get-a-quote"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask Our Team
                </Link>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Other Fabrics</h2>
              <ul className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {others.map((f) => (
                  <li key={f.slug}>
                    <Link
                      href={`/fabrics/${f.slug}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{f.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{f.tagline}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-blue-700" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
