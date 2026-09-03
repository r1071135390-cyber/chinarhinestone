import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/layout/PageHero";
import { CtaBand } from "@/components/layout/CtaBand";
import { APPLICATIONS, TECHNOLOGIES, INDUSTRIES, getApplication } from "@/lib/v2";

export function generateStaticParams() {
  return APPLICATIONS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = getApplication(slug);
  if (!app) return {};
  return {
    title: `${app.name} for Garment Manufacturers | ChinaRhinestone`,
    description: `${app.tagline} Custom ${app.name.toLowerCase()} manufactured in bulk for apparel factories and garment production teams. Request a quote within 24 hours.`,
    alternates: {
      canonical: `/applications/${app.slug}`,
    },
  };
}

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApplication(slug);
  if (!app) notFound();

  const others = APPLICATIONS.filter((a) => a.slug !== app.slug);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Applications", href: "/applications" },
              { label: app.name, href: `/applications/${app.slug}` },
            ]}
          />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Application
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {app.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            {app.description}
          </p>
          <Link
            href="/get-a-quote"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
          >
            Get a Quote
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Technologies */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Technologies for {app.name}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            {app.name} can be produced with different transfer technologies depending on your
            garment, fabric and desired effect.
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
      <section className="border-t border-slate-200 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-black text-slate-900">Common Industries</h2>
              <ul className="mt-4 space-y-2.5">
                {INDUSTRIES.slice(0, 5).map((i) => (
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
            <div>
              <h2 className="text-lg font-black text-slate-900">Other Applications</h2>
              <ul className="mt-4 space-y-2.5">
                {others.map((a) => (
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
          </div>
        </div>
      </section>

      <CtaBand />
    </div>
  );
}
