"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Send, CheckCircle2, FileImage } from "lucide-react";
import { TECHNOLOGIES, FABRICS, APPLICATIONS } from "@/lib/v2";

const inputCls =
  "mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";
const labelCls = "block text-sm font-semibold text-slate-700";

const GARMENT_TYPES = [
  "T-shirts & knitwear",
  "Sportswear / jerseys",
  "Activewear",
  "Hoodies & fleece",
  "Workwear / uniforms",
  "Fashion apparel",
  "Other (describe below)",
];

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [form, setForm] = useState({
    company: "",
    website: "",
    contactName: "",
    email: "",
    whatsapp: "",
    country: "",
    garmentType: "",
    fabric: "",
    transferType: "",
    application: "",
    transferSize: "",
    quantity: "",
    designs: "",
    deliveryDate: "",
    requirements: "",
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to /api/inquiries when backend is ready
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <div className="max-w-md text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-600" />
          <h1 className="mt-6 text-2xl font-black text-slate-900">Request Received</h1>
          <p className="mt-3 leading-relaxed text-slate-600">
            Thank you, {form.contactName || "there"}. Our team will review your project and
            reply to <b>{form.email}</b> within 24 hours (Mon–Sat, GMT+8) with a technology
            recommendation, sampling plan and pricing.
          </p>
          {fileName && (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-slate-500">
              <FileImage className="h-4 w-4" />
              Artwork attached: {fileName}
            </p>
          )}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/resources/heat-transfer-guide"
              className="rounded border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Read the Heat Transfer Guide
            </Link>
            <a
              href="/designer.html"
              className="rounded bg-blue-700 px-5 py-2 text-sm font-bold text-white hover:bg-blue-800"
            >
              Try the Design Studio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 lg:py-16">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 p-6 sm:p-10">
          {/* ── Company & contact ── */}
          <fieldset>
            <legend className="text-lg font-black text-slate-900">Company & Contact</legend>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Company Name *</label>
                <input required value={form.company} onChange={set("company")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Company Website</label>
                <input
                  value={form.website}
                  onChange={set("website")}
                  placeholder="https://"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Contact Name *</label>
                <input required value={form.contactName} onChange={set("contactName")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Business Email *</label>
                <input required type="email" value={form.email} onChange={set("email")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp / WeChat</label>
                <input value={form.whatsapp} onChange={set("whatsapp")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country *</label>
                <input required value={form.country} onChange={set("country")} className={inputCls} />
              </div>
            </div>
          </fieldset>

          {/* ── Project details ── */}
          <fieldset className="mt-10">
            <legend className="text-lg font-black text-slate-900">Project Details</legend>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Garment Type *</label>
                <select required value={form.garmentType} onChange={set("garmentType")} className={inputCls}>
                  <option value="">Select garment type…</option>
                  {GARMENT_TYPES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Fabric</label>
                <select value={form.fabric} onChange={set("fabric")} className={inputCls}>
                  <option value="">Select fabric…</option>
                  {FABRICS.map((f) => (
                    <option key={f.slug} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                  <option value="Other">Other / not sure</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Transfer Type</label>
                <select value={form.transferType} onChange={set("transferType")} className={inputCls}>
                  <option value="">Select technology…</option>
                  {TECHNOLOGIES.map((t) => (
                    <option key={t.slug} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                  <option value="Not sure">Not sure — recommend for me</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Application</label>
                <select value={form.application} onChange={set("application")} className={inputCls}>
                  <option value="">Select application…</option>
                  {APPLICATIONS.map((a) => (
                    <option key={a.slug} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Transfer Size</label>
                <input
                  value={form.transferSize}
                  onChange={set("transferSize")}
                  placeholder="e.g. 20 × 8 cm"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Quantity *</label>
                <input
                  required
                  value={form.quantity}
                  onChange={set("quantity")}
                  placeholder="e.g. 5,000 pcs"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Number of Designs</label>
                <input
                  value={form.designs}
                  onChange={set("designs")}
                  placeholder="e.g. 3"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Required Delivery Date</label>
                <input type="date" value={form.deliveryDate} onChange={set("deliveryDate")} className={inputCls} />
              </div>
            </div>
          </fieldset>

          {/* ── Artwork & requirements ── */}
          <fieldset className="mt-10">
            <legend className="text-lg font-black text-slate-900">Artwork & Requirements</legend>
            <div className="mt-5 space-y-4">
              <div>
                <label className={labelCls}>Artwork Upload</label>
                <label
                  htmlFor="artwork"
                  className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/50"
                >
                  <Upload className="h-6 w-6 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">
                    {fileName || "Click to upload your artwork"}
                  </span>
                  <span className="text-xs text-slate-500">
                    AI, EPS, SVG, PDF, PNG — vector files preferred
                  </span>
                </label>
                <input
                  id="artwork"
                  type="file"
                  accept=".ai,.eps,.svg,.pdf,.png,.jpg,.jpeg,.psd,.zip"
                  className="hidden"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                />
              </div>
              <div>
                <label className={labelCls}>Additional Requirements</label>
                <textarea
                  rows={5}
                  value={form.requirements}
                  onChange={set("requirements")}
                  placeholder="Colors / Pantone references, placement, finish expectations, packaging, delivery terms…"
                  className={inputCls}
                />
              </div>
            </div>
          </fieldset>

          <button
            type="submit"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
          >
            <Send className="h-4 w-4" />
            Submit Quote Request
          </button>
          <p className="mt-3 text-xs text-slate-500">
            We reply within 24 hours on business days. Your artwork and project information
            are never shared.
          </p>
        </form>
      </div>
    </section>
  );
}
