import type { Metadata } from "next";
import { Clock, ShieldCheck } from "lucide-react";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = {
  title: "Get a Quote — Custom Heat Transfer Manufacturing | ChinaRhinestone",
  description:
    "Request a quote for custom heat transfers from a China manufacturer. Send your artwork and project details — we reply within 24 hours with technology recommendations, sampling plan and bulk pricing for garment manufacturers.",
  alternates: {
    canonical: "/get-a-quote",
  },
};

export default function GetAQuotePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-slate-900 py-12 text-white lg:py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Get a Quote</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Tell Us About Your Transfer Project
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            Send your artwork and project details. We reply within 24 hours with a
            technology recommendation, sampling plan and pricing — from one manufacturer,
            not a trading company.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-400" />
              Reply within 24 hours
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              Your artwork stays confidential
            </span>
          </div>
        </div>
      </section>

      <QuoteForm />
    </div>
  );
}
