import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="bg-white">
      <section className="bg-slate-900 py-20 text-white lg:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            404 — Page Not Found
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
            This Page Has Moved or No Longer Exists
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
            The page you&apos;re looking for doesn&apos;t exist. Explore our heat
            transfer technologies, or tell us about your project directly.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/heat-transfers"
              className="inline-flex items-center justify-center gap-2 rounded bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
            >
              <Search className="h-4 w-4" />
              Browse Heat Transfers
            </Link>
            <Link
              href="/get-a-quote"
              className="inline-flex items-center justify-center gap-2 rounded border border-slate-600 px-6 py-3 text-sm font-bold text-white transition hover:border-white hover:bg-slate-800"
            >
              Get a Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-center text-xl font-black tracking-tight text-slate-900">
            Popular Pages
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/heat-transfers/rhinestone-heat-transfers",
                title: "Rhinestone Heat Transfers",
                text: "Custom sparkling transfers with a free online design tool.",
              },
              {
                href: "/heat-transfers/dtf-heat-transfers",
                title: "DTF Heat Transfers",
                text: "Full-color digital transfers with photo-quality detail.",
              },
              {
                href: "/industries",
                title: "Industries We Serve",
                text: "Solutions for sportswear, workwear and fashion manufacturers.",
              },
              {
                href: "/resources",
                title: "Resources & Guides",
                text: "Guides on technology selection, fabrics and application.",
              },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="rounded-xl border border-slate-200 p-6 transition hover:border-blue-300 hover:shadow-md"
              >
                <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
