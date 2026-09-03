"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    subject: "quote",
    message: "",
  });

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
          <h1 className="mt-6 text-2xl font-black text-slate-900">Message Sent</h1>
          <p className="mt-3 text-slate-600">
            Thank you, {form.name || "friend"}. Our sales team will reply to{" "}
            <b>{form.email}</b> within 24 hours (Mon–Sat, GMT+8).
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 rounded border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-400">Contact</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Get in Touch</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Need a bulk quote, have questions about transfer technologies or lead times, or want to arrange a factory visit? We reply to all inquiries within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-3 lg:px-8">
          {/* Contact info */}
          <div className="space-y-6 lg:col-span-1">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Factory</h3>
              <div className="mt-3 space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                  <span>Yiwu, Zhejiang, China<br />(Yiwu International Trade City area)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-blue-700" />
                  <span>+86 13764593988 (WhatsApp / WeChat)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-blue-700" />
                  <span>info@chinarhinestone.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-blue-700" />
                  <span>Mon–Sat 9:00–18:00 (GMT+8)</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-5">
              <h4 className="font-bold text-blue-900">Quick Quote Tip</h4>
              <p className="mt-2 text-sm leading-relaxed text-blue-800">
                For fastest pricing, include: artwork (or description), desired size in inches/cm, garment type and fabric, transfer technology, estimated quantity, and delivery country.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <h4 className="font-bold text-slate-900">Want instant pricing?</h4>
              <p className="mt-2 text-sm text-slate-600">
                Use our free online design studio to create rhinestone transfers with live stone counts — no wait.
              </p>
              <a
                href="/designer.html"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                Open Design Studio →
              </a>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-black text-slate-900">Send us a message</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Your Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Company</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Country</label>
                  <input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="quote">Request a bulk quote</option>
                    <option value="custom">Custom design / development</option>
                    <option value="sample">Order a sample</option>
                    <option value="technology">Transfer technology question</option>
                    <option value="partnership">Distribution / partnership</option>
                    <option value="factory">Factory visit</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your project: artwork description, desired size, garment and fabric, transfer technology, quantity, delivery country..."
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
              <p className="mt-3 text-xs text-slate-500">
                We reply within 24 hours on business days. Your information is never shared.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
