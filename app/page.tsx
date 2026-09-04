import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Sparkles,
  Upload,
  Layers,
  Factory,
  ShieldCheck,
  FileSearch,
  ClipboardCheck,
  ScanLine,
  BadgeCheck,
  Shirt,
  HardHat,
  Sparkle,
  Dumbbell,
  Trophy,
  Tag,
  Heart,
  Hash,
  Eye,
  Gem,
  CheckCircle2,
} from "lucide-react";
import {
  TECHNOLOGIES,
  INDUSTRIES,
  APPLICATIONS,
  FABRICS,
  PROCESS_STEPS,
  MANUFACTURING_CAPS,
  QC_STAGES,
  CASE_STUDIES,
  WHY_US,
  FAQS,
  TRUST_POINTS,
  TRANSFER_MATRIX,
} from "@/lib/v2";

export const metadata: Metadata = {
  title: "Custom Heat Transfer Manufacturer for Garment Manufacturers | ChinaRhinestone",
  description:
    "ChinaRhinestone is a custom heat transfer manufacturer in China supplying rhinestone, silicone, reflective, DTF, 3D, PU, glitter and specialty heat transfers for garment manufacturers, apparel factories, Pakistan garment exporters and Bangladesh knitwear manufacturers worldwide. Bulk production, consistent quality, repeat orders — get a quote within 24 hours.",
  alternates: {
    canonical: "/",
  },
};

/* ── Section helpers ── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">{children}</p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-slate-600">{intro}</p>}
    </div>
  );
}

/* Homepage technology cards — the 6 core technologies */
const HOME_TECH_SLUGS = [
  "rhinestone-heat-transfers",
  "silicone-heat-transfers",
  "reflective-heat-transfers",
  "dtf-heat-transfers",
  "3d-raised-heat-transfers",
  "pu-heat-transfers",
];

const INDUSTRY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "sportswear-manufacturers": Trophy,
  "workwear-manufacturers": HardHat,
  "fashion-apparel-manufacturers": Sparkle,
  "activewear-manufacturers": Dumbbell,
  "teamwear-manufacturers": Shirt,
};

const APP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "logo-heat-transfers": Tag,
  "garment-branding-transfers": Heart,
  "heat-transfer-labels": FileSearch,
  "name-number-transfers": Hash,
  "reflective-marking-transfers": Eye,
  "decorative-heat-transfers": Gem,
};

/* ── FAQPage structured data (rich results) ── */
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function HomePage() {
  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* ── SECTION 01 — HERO ── */}
      <section className="bg-slate-900 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <Eyebrow>Custom Heat Transfer Manufacturer</Eyebrow>
            <h1 className="mt-4 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
              Custom Heat Transfer Solutions for Garment Manufacturers
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              From artwork development and sampling to bulk production, we provide custom
              heat transfer solutions for sportswear, workwear, fashion apparel and other
              garment manufacturing applications.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/get-a-quote"
                className="inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-7 py-3 text-base font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                Get a Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/get-a-quote"
                className="inline-flex items-center justify-center gap-2 rounded border border-slate-600 px-7 py-3 text-base font-bold text-white transition hover:border-white hover:bg-slate-800"
              >
                <Upload className="h-4 w-4" />
                Send Your Artwork
              </Link>
            </div>
            <p className="mt-5 text-sm text-slate-400">
              Custom development · Bulk production · Quality control
            </p>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-showcase.webp"
                alt="Custom heat transfers on performance sportswear — silicone, reflective and rhinestone effects"
                width={1200}
                height={900}
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 left-4 hidden rounded-xl border border-slate-700 bg-slate-800/95 px-4 py-3 shadow-xl backdrop-blur sm:block">
              <p className="text-xs font-medium text-slate-400">Rhinestone Design Studio</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm font-bold text-white">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                Design transfers online — free
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 02 — TRUST BAR ── */}
      <section className="border-b border-slate-200 bg-slate-50">
        <h2 className="sr-only">Why Choose ChinaRhinestone</h2>
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {TRUST_POINTS.map((t) => (
            <div key={t.title} className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 03 — TECHNOLOGIES ── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Our Technologies"
              title="Heat Transfers Made for Garment Production"
              intro="Choose from multiple transfer technologies based on your garment, fabric, design and desired effect."
            />
            <Link
              href="/heat-transfers"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              Explore All Heat Transfers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TECHNOLOGIES.filter((t) => HOME_TECH_SLUGS.includes(t.slug)).map((t) => (
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
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                    Explore {t.shortName} Transfers
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 04 — TRANSFER SELECTION ── */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Choosing the Right Technology"
            title="Not Sure Which Transfer You Need?"
            intro="The right transfer depends on your garment, fabric, application and desired appearance. Tell us what you're producing and we'll help you evaluate suitable options."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TRANSFER_MATRIX.map((row) => (
              <Link
                key={row.effect}
                href={`/heat-transfers/${row.slug}`}
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 transition hover:border-blue-300 hover:shadow-md"
              >
                <span className="text-sm font-bold text-slate-900">{row.effect}</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-blue-700">
                  {row.tech}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/get-a-quote"
              className="inline-flex items-center gap-2 rounded bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              Get a Transfer Recommendation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 05 — INDUSTRIES ── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Who We Serve"
            title="Built for Garment Manufacturers"
            intro="We work with apparel manufacturers that need reliable custom transfers for ongoing garment production, from individual projects to repeat bulk orders."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {INDUSTRIES.filter((i) => i.slug !== "garment-manufacturers").map((i) => {
              const Icon = INDUSTRY_ICONS[i.slug] ?? Shirt;
              return (
                <Link
                  key={i.slug}
                  href={`/industries/${i.slug}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={i.image}
                      alt={i.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <Icon className="h-5 w-5 text-blue-700" />
                    <h3 className="mt-2 text-base font-bold text-slate-900">{i.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{i.tagline}</p>
                    <p className="mt-2 text-sm font-bold text-blue-700">
                      Explore {i.name.replace(" Manufacturers", "")} →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION 06 — APPLICATIONS ── */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Applications"
            title="One Transfer Partner. Multiple Apparel Applications."
            intro="From brand logos to garment labels and decorative graphics, we develop transfer solutions around your production requirements."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {APPLICATIONS.map((a) => {
              const Icon = APP_ICONS[a.slug] ?? Tag;
              return (
                <Link
                  key={a.slug}
                  href={`/applications/${a.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Icon className="h-5 w-5 text-blue-700" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{a.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{a.tagline}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </p>
                </Link>
              );
            })}
          </div>
          <div className="mt-8">
            <Link
              href="/applications"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              Explore All Applications
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 07 — FABRIC COMPATIBILITY ── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Fabric Compatibility"
            title="The Right Transfer Starts With Your Fabric"
            intro="Different fabrics can require different transfer solutions. We consider fabric composition, stretch, garment construction and application requirements when recommending a transfer technology."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {FABRICS.map((f) => (
              <Link
                key={f.slug}
                href={`/fabrics/${f.slug}`}
                className="group rounded-xl border border-slate-200 bg-white px-5 py-6 text-center transition hover:border-blue-300 hover:shadow-md"
              >
                <Layers className="mx-auto h-6 w-6 text-blue-700" />
                <h3 className="mt-3 text-base font-bold text-slate-900">{f.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.tagline}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-start gap-4 rounded-xl bg-slate-50 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-slate-600">
              <span className="font-bold text-slate-900">
                Not sure what works with your fabric?
              </span>{" "}
              Send us your garment information and we&apos;ll help you evaluate the options.
            </p>
            <Link
              href="/contact"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              Ask Our Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 08 — PROCESS ── */}
      <section className="border-y border-slate-200 bg-slate-900 py-16 text-white lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
              Our Process
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              From Your Artwork to Production
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-300">
              A straightforward process designed around apparel manufacturing requirements.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS_STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-xl border border-slate-700 bg-slate-800/60 p-6"
              >
                <p className="text-2xl font-black text-blue-400">{s.step}</p>
                <h3 className="mt-3 text-base font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 09 — MANUFACTURING ── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Manufacturing"
                title="Production Built for Repeat Orders"
                intro="Our production process is organized around consistent specifications, quality control and repeat garment production."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {MANUFACTURING_CAPS.map((c) => (
                  <div key={c.title} className="rounded-xl border border-slate-200 p-5">
                    <Factory className="h-5 w-5 text-blue-700" />
                    <h3 className="mt-3 text-sm font-bold text-slate-900">{c.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  href="/manufacturing"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
                >
                  Explore Our Manufacturing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/industry-garment.jpg"
                alt="Apparel production with custom heat transfer branding"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 10 — QUALITY CONTROL ── */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Quality Control"
            title="Quality Control at Every Stage"
            intro="Consistency matters when transfers become part of your garment production process. We check projects throughout development and production."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QC_STAGES.map((s, idx) => (
              <div key={s.title} className="relative rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  {idx === 0 && <FileSearch className="h-5 w-5 text-blue-700" />}
                  {idx === 1 && <ClipboardCheck className="h-5 w-5 text-blue-700" />}
                  {idx === 2 && <ScanLine className="h-5 w-5 text-blue-700" />}
                  {idx === 3 && <BadgeCheck className="h-5 w-5 text-blue-700" />}
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/quality-control"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              Explore Our Quality Control
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 11 — CASE STUDIES ── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Projects"
            title="Recent Heat Transfer Projects"
            intro="Explore examples of custom transfer projects developed for different garment applications."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {CASE_STUDIES.map((c) => (
              <Link
                key={c.id}
                href="/case-studies"
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-lg"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image}
                    alt={c.title}
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                  <p className="mt-2 text-xs text-slate-500">
                    Technology: {c.technology} · Application: {c.application} · Industry:{" "}
                    {c.industry}
                  </p>
                  <p className="mt-3 text-sm font-bold text-blue-700">
                    View Project →
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
            >
              View All Case Studies
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SECTION 12 — WHY CHINARHINESTONE ── */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHeading
            eyebrow="Why Work With Us"
            title="A Transfer Manufacturing Partner for Apparel Production"
            intro="We focus on the requirements that matter when custom transfers become part of a garment manufacturing process."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {WHY_US.map((w) => (
              <div key={w.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <ShieldCheck className="h-5 w-5 text-blue-700" />
                <h3 className="mt-3 text-sm font-bold text-slate-900">{w.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 13 — FAQ ── */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" center />
          <div className="mt-10 divide-y divide-slate-200 rounded-xl border border-slate-200">
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

      {/* ── SECTION 14 — FINAL CTA ── */}
      <section className="bg-slate-900 py-16 text-white lg:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Start Your Project
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Have a Heat Transfer Project?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">
            Send us your artwork, garment information and estimated quantity. We&apos;ll help
            you evaluate the right transfer solution for your production.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/get-a-quote"
              className="inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-7 py-3 text-base font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              Get a Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/get-a-quote"
              className="inline-flex items-center justify-center gap-2 rounded border border-slate-600 px-7 py-3 text-base font-bold text-white transition hover:border-white hover:bg-slate-800"
            >
              <Upload className="h-4 w-4" />
              Send Your Artwork
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Custom development · Samples · Bulk production · Repeat orders
          </p>
        </div>
      </section>
    </div>
  );
}
