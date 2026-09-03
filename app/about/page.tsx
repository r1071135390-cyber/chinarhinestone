import Link from "next/link";
import { Factory, Award, Users, Globe, ArrowRight, CheckCircle2, Play, Camera, ShieldCheck, Repeat } from "lucide-react";
import type { Metadata } from "next";
import { WHY_US } from "@/lib/v2";

export const metadata: Metadata = {
  title: "About Us — Custom Heat Transfer Manufacturer in China | ChinaRhinestone",
  description:
    "ChinaRhinestone is a Yiwu-based custom heat transfer manufacturer in China serving garment manufacturers in 30+ countries. Custom development, bulk production, quality control and repeat order supply.",
  alternates: {
    canonical: "/about",
  },
};

const FACTS = [
  { icon: Factory, label: "Founded", value: "2018" },
  { icon: Users, label: "B2B Clients", value: "5,000+" },
  { icon: Award, label: "Monthly Capacity", value: "50M+ stones" },
  { icon: Globe, label: "Countries Served", value: "30+" },
];

/* ── Factory Gallery — add photos & videos here ── */
type MediaItem = {
  id: string;
  type: "image" | "video";
  src: string;
  thumb?: string;
  title: string;
  category: string;
  date: string;
};

const MEDIA: MediaItem[] = [
  {
    id: "m01",
    type: "image",
    src: "/hero-rhinestone.webp",
    title: "Rhinestone Transfer Sample",
    category: "Products",
    date: "2026-08-28",
  },
  {
    id: "m02",
    type: "image",
    src: "/samples/logo.jpg",
    title: "Production Floor",
    category: "Production",
    date: "2026-08-28",
  },
  // Add new items below:
  // {
  //   id: "m03",
  //   type: "video",
  //   src: "https://www.youtube.com/embed/VIDEO_ID",
  //   thumb: "/factory/video03-thumb.jpg",
  //   title: "Stone Setting Machine",
  //   category: "Equipment",
  //   date: "2026-09-01",
  // },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">About Us</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Why Garment Manufacturers Rely on Us
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            ChinaRhinestone is a custom heat transfer manufacturer based in Yiwu, China —
            producing silicone, reflective, rhinestone, DTF, 3D, PU and specialty transfers for
            garment manufacturers worldwide.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {FACTS.map((f) => (
              <div key={f.label} className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <f.icon className="mx-auto h-7 w-7 text-blue-700" />
                <div className="mt-3 text-3xl font-black text-slate-900">{f.value}</div>
                <div className="mt-1 text-sm font-medium text-slate-600">{f.label}</div>
              </div>
            ))}
          </div>

          {/* Story + What manufacturers rely on */}
          <div className="mt-16 grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Our Story</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-slate-700">
                <p>
                  ChinaRhinestone started in 2018 as a small workshop in Yiwu, Zhejiang — the world&apos;s largest small commodities trading hub. What began as a local stone-setting shop has grown into a full-service custom heat transfer manufacturer serving garment manufacturers in over 30 countries.
                </p>
                <p>
                  We operate our own production lines: from artwork development and color matching, through transfer production and automated stone setting, to quality control and packing. Owning the full chain means consistent quality, predictable lead times, and factory-direct pricing.
                </p>
                <p>
                  In 2026 we launched our free online design studio, allowing customers worldwide to create custom rhinestone transfers directly in their browser — with live stone counts and production-ready file export.
                </p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                Why Manufacturers Work With Us
              </h2>
              <ul className="mt-4 space-y-3">
                {WHY_US.map((v) => (
                  <li key={v.title} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-slate-700">
                      <b>{v.title}.</b> {v.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Consistency + CTA banner */}
          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-8">
              <ShieldCheck className="h-8 w-8 text-blue-700" />
              <h3 className="mt-4 text-xl font-black text-slate-900">
                Specifications, Not Promises
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Every program is produced against a written, approved specification — and
                archived so repeat orders match the first batch. See how our production
                and quality control process works.
              </p>
              <Link
                href="/quality-control"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                Explore Quality Control
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 p-8">
              <Repeat className="h-8 w-8 text-blue-700" />
              <h3 className="mt-4 text-xl font-black text-slate-900">
                Built for Repeat Production
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Garment programs don&apos;t run once. Our manufacturing process is
                designed for ongoing supply — sampling, bulk production and repeat
                orders under consistent specifications.
              </p>
              <Link
                href="/manufacturing"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                See Our Manufacturing Process
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Factory Gallery */}
          <div className="mt-16">
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6 text-blue-600" />
              <h2 className="text-3xl font-black text-slate-900">Factory Gallery</h2>
            </div>
            <p className="mt-2 text-slate-600">
              Real photos and videos from our production floor. Updated regularly.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {MEDIA.map((item) => (
                <figure key={item.id} className="group overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {item.type === "video" ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        {item.thumb && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumb} alt={item.title} className="h-full w-full object-cover opacity-70 transition group-hover:scale-105 group-hover:opacity-90" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                            <Play className="ml-0.5 h-5 w-5 fill-slate-900 text-slate-900" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.src} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    )}
                    <span className="absolute left-3 top-3 rounded bg-slate-900/80 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
                      {item.category}
                    </span>
                  </div>
                  <figcaption className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm font-medium text-slate-800">{item.title}</span>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-400">
              To add content: drop images into <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">public/factory/</code> and add a block to the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">MEDIA</code> array at the top of this file.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-16 rounded-2xl bg-slate-900 p-8 text-center text-white sm:p-12">
            <h2 className="text-2xl font-black sm:text-3xl">Ready to work together?</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Try our free online design studio for rhinestone transfers, or send your
              artwork for a quote on any of our transfer technologies.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/get-a-quote"
                className="inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                Get a Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="/designer.html"
                className="inline-flex items-center justify-center gap-2 rounded border border-slate-600 px-6 py-2.5 text-sm font-bold text-white transition hover:border-white hover:bg-slate-800"
              >
                Try the Design Studio
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
