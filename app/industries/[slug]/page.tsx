import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Breadcrumb } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { INDUSTRIES, TECHNOLOGIES, APPLICATIONS, getIndustry } from "@/lib/v2";

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return {
    title: `Heat Transfers for ${industry.name} | ChinaRhinestone`,
    description: `${industry.tagline} Custom heat transfer manufacturing for apparel production — bulk orders, consistent quality and repeat supply from a China-based manufacturer.`,
    alternates: {
      canonical: `/industries/${industry.slug}`,
    },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  const others = INDUSTRIES.filter((i) => i.slug !== industry.slug);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Industries", href: "/industries" },
              { label: industry.name, href: `/industries/${industry.slug}` },
            ]}
          />
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                {industry.primary ? "Primary Focus" : "Industry"}
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {industry.name}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                {industry.description}
              </p>
              <Link
                href="/get-a-quote"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                Get a Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={industry.image}
                alt={industry.name}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What we provide */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            What We Provide for {industry.name.replace(" Manufacturers", "")}
          </h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Custom transfer development around your artwork and garment requirements",
              "Consistent specifications across sampling, bulk production and repeat orders",
              "Quality control inspection from development through final production",
              "Production scheduling that supports your garment manufacturing timeline",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-sm font-medium text-slate-800">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recommended technologies */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Recommended Technologies
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Commonly used transfer technologies for {industry.name.toLowerCase()}.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECHNOLOGIES.slice(0, 4).map((t) => (
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

      {/* Internal linking */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-black text-slate-900">Common Applications</h2>
              <ul className="mt-4 space-y-2.5">
                {APPLICATIONS.slice(0, 5).map((a) => (
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
              <h2 className="text-lg font-black text-slate-900">Other Industries</h2>
              <ul className="mt-4 space-y-2.5">
                {others.map((i) => (
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
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
