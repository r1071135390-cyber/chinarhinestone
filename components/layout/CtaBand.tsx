import Link from "next/link";
import { ArrowRight, Upload } from "lucide-react";

export function CtaBand({
  title = "Have a Heat Transfer Project?",
  body = "Send us your artwork, garment information and estimated quantity. We'll help you evaluate the right transfer solution for your production.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="bg-slate-900 py-16 text-white">
      <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          Start Your Project
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-300">{body}</p>
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
      </div>
    </section>
  );
}
