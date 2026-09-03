"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  MessageCircle,
  Mail,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  CORE_TECHNOLOGIES,
  SPECIALTY_TECHNOLOGIES,
  INDUSTRIES,
  APPLICATIONS,
  FABRICS,
  RESOURCES,
} from "@/lib/v2";

/* ── Menu groupings (Phase 24 spec) ── */
const APP_GROUPS = [
  {
    label: "Branding",
    slugs: ["logo-heat-transfers", "garment-branding-transfers"],
  },
  {
    label: "Garment Identification",
    slugs: ["heat-transfer-labels", "name-number-transfers"],
  },
  {
    label: "Special Effects",
    slugs: ["reflective-marking-transfers", "decorative-heat-transfers"],
  },
];

const RESOURCE_GROUPS = [
  {
    label: "Guides",
    slugs: [
      "heat-transfer-guide",
      "fabric-compatibility",
      "artwork-guidelines",
      "heat-transfer-application-guide",
    ],
  },
  {
    label: "Comparisons & Insights",
    slugs: ["silicone-vs-pu", "best-heat-transfers-for-sportswear", "heat-transfer-durability"],
  },
];

function ColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

function MenuLink({
  href,
  label,
  badge,
}: {
  href: string;
  label: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group/item flex items-center gap-2 rounded px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-700"
    >
      <span>{label}</span>
      {badge && (
        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
          {badge}
        </span>
      )}
    </Link>
  );
}

function PanelFooter({ href, label }: { href: string; label: string }) {
  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 px-2.5 text-sm font-bold text-blue-700 transition hover:text-blue-800"
      >
        {label}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const isActive = (prefix: string) => pathname === prefix || pathname.startsWith(prefix + "/");

  const toggleSection = (key: string) =>
    setOpenSection(openSection === key ? null : key);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      {/* Top bar — factory contact info */}
      <div className="hidden border-b border-slate-100 bg-slate-50 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs text-slate-600 lg:px-8">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-3 w-3" />
              WhatsApp / WeChat +86 13764593988
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3 w-3" />
              info@chinarhinestone.com
            </span>
            <span>Factory: Yiwu, Zhejiang, China</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700">✓ 24h Quote</span>
            <span className="text-emerald-700">✓ Low MOQ</span>
            <span className="text-emerald-700">✓ Worldwide Shipping</span>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="ChinaRhinestone — Custom Heat Transfer Manufacturer"
            className="h-9 w-auto"
          />
          <span className="hidden text-lg font-black tracking-tight text-slate-900 sm:inline">
            China<span className="text-blue-700">Rhinestone</span>
          </span>
        </Link>

        {/* Desktop nav with mega menus */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
          {/* Heat Transfers mega menu */}
          <div className="group relative">
            <button
              className={`flex items-center gap-1 rounded px-3 py-2 text-sm font-semibold transition ${
                isActive("/heat-transfers")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Heat Transfers
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-[500px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="grid grid-cols-2 gap-x-4">
                  <div>
                    <ColumnHeader>Core Technologies</ColumnHeader>
                    <ul>
                      {CORE_TECHNOLOGIES.map((t) => (
                        <li key={t.slug}>
                          <MenuLink
                            href={`/heat-transfers/${t.slug}`}
                            label={t.name}
                            badge={t.hasDesignerTool ? "Design Tool" : undefined}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <ColumnHeader>Specialty</ColumnHeader>
                    <ul>
                      {SPECIALTY_TECHNOLOGIES.map((t) => (
                        <li key={t.slug}>
                          <MenuLink href={`/heat-transfers/${t.slug}`} label={t.name} />
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">
                        Need sparkling transfers?
                      </p>
                      <a
                        href="/designer.html"
                        className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:text-blue-800"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Try our free Design Studio
                      </a>
                    </div>
                  </div>
                </div>
                <PanelFooter href="/heat-transfers" label="Explore All Heat Transfers" />
              </div>
            </div>
          </div>

          {/* Industries mega menu */}
          <div className="group relative">
            <button
              className={`flex items-center gap-1 rounded px-3 py-2 text-sm font-semibold transition ${
                isActive("/industries")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Industries
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-[440px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="grid grid-cols-2 gap-x-4">
                  <div>
                    <ColumnHeader>Garment Manufacturing</ColumnHeader>
                    <MenuLink
                      href="/industries/garment-manufacturers"
                      label="Garment Manufacturers"
                      badge="Primary"
                    />
                    <p className="mt-2 px-2.5 text-xs leading-relaxed text-slate-500">
                      Built around apparel production — sampling, bulk and repeat orders.
                    </p>
                  </div>
                  <div>
                    <ColumnHeader>Apparel Segments</ColumnHeader>
                    <ul>
                      {INDUSTRIES.filter((i) => i.slug !== "garment-manufacturers").map((i) => (
                        <li key={i.slug}>
                          <MenuLink href={`/industries/${i.slug}`} label={i.name} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <PanelFooter href="/industries" label="Find Your Industry" />
              </div>
            </div>
          </div>

          {/* Applications mega menu */}
          <div className="group relative">
            <button
              className={`flex items-center gap-1 rounded px-3 py-2 text-sm font-semibold transition ${
                isActive("/applications")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Applications
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-[600px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="grid grid-cols-3 gap-x-4">
                  {APP_GROUPS.map((g) => (
                    <div key={g.label}>
                      <ColumnHeader>{g.label}</ColumnHeader>
                      <ul>
                        {APPLICATIONS.filter((a) => g.slugs.includes(a.slug)).map((a) => (
                          <li key={a.slug}>
                            <MenuLink href={`/applications/${a.slug}`} label={a.name} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <PanelFooter href="/applications" label="Explore All Applications" />
              </div>
            </div>
          </div>

          {/* Fabrics dropdown */}
          <div className="group relative">
            <button
              className={`flex items-center gap-1 rounded px-3 py-2 text-sm font-semibold transition ${
                isActive("/fabrics")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Fabrics
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-64 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <ColumnHeader>Fabrics We Work With</ColumnHeader>
                <ul>
                  {FABRICS.map((f) => (
                    <li key={f.slug}>
                      <MenuLink href={`/fabrics/${f.slug}`} label={f.name} />
                    </li>
                  ))}
                </ul>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <p className="px-2.5 text-xs text-slate-500">Not sure about compatibility?</p>
                  <Link
                    href="/contact"
                    className="mt-1 inline-flex items-center gap-1.5 px-2.5 text-sm font-bold text-blue-700 hover:text-blue-800"
                  >
                    Ask Us
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Resources mega menu */}
          <div className="group relative">
            <button
              className={`flex items-center gap-1 rounded px-3 py-2 text-sm font-semibold transition ${
                isActive("/resources")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Resources
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-[480px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
                <div className="grid grid-cols-2 gap-x-4">
                  {RESOURCE_GROUPS.map((g) => (
                    <div key={g.label}>
                      <ColumnHeader>{g.label}</ColumnHeader>
                      <ul>
                        {RESOURCES.filter((r) => g.slugs.includes(r.slug)).map((r) => (
                          <li key={r.slug}>
                            <MenuLink href={`/resources/${r.slug}`} label={r.name} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <MenuLink href="/case-studies" label="Latest Projects — Case Studies" />
                </div>
              </div>
            </div>
          </div>

          {/* About dropdown */}
          <div className="group relative">
            <button
              className={`flex items-center gap-1 rounded px-3 py-2 text-sm font-semibold transition ${
                isActive("/about") ||
                isActive("/manufacturing") ||
                isActive("/quality-control") ||
                pathname === "/case-studies"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              About
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-60 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100">
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                <ul>
                  <li><MenuLink href="/about" label="About ChinaRhinestone" /></li>
                  <li><MenuLink href="/manufacturing" label="Manufacturing" /></li>
                  <li><MenuLink href="/quality-control" label="Quality Control" /></li>
                  <li><MenuLink href="/case-studies" label="Case Studies" /></li>
                  <li><MenuLink href="/contact" label="Contact" /></li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <a
            href="/designer.html"
            className="inline-flex items-center gap-1.5 rounded border border-blue-700 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            <Sparkles className="h-4 w-4" />
            Design Studio
          </a>
          <Link
            href="/get-a-quote"
            className="rounded bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
          >
            Get a Quote
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded p-2 text-slate-700 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="max-h-[calc(100vh-64px)] overflow-y-auto border-t border-slate-200 bg-white lg:hidden">
          <div className="px-4 py-3">
            {/* Heat Transfers */}
            <button
              onClick={() => toggleSection("tech")}
              className="flex w-full items-center justify-between rounded px-3 py-2.5 text-sm font-bold text-slate-800"
            >
              Heat Transfers
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition ${openSection === "tech" ? "rotate-180" : ""}`}
              />
            </button>
            {openSection === "tech" && (
              <div className="ml-3 border-l-2 border-slate-100 pl-3">
                <p className="mt-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Core Technologies</p>
                {CORE_TECHNOLOGIES.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/heat-transfers/${t.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {t.name}
                  </Link>
                ))}
                <p className="mt-2 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Specialty</p>
                {SPECIALTY_TECHNOLOGIES.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/heat-transfers/${t.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {t.name}
                  </Link>
                ))}
                <Link
                  href="/heat-transfers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded px-3 py-2 text-sm font-bold text-blue-700"
                >
                  All Heat Transfers →
                </Link>
              </div>
            )}

            {/* Industries */}
            <button
              onClick={() => toggleSection("industries")}
              className="flex w-full items-center justify-between rounded px-3 py-2.5 text-sm font-bold text-slate-800"
            >
              Industries
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition ${openSection === "industries" ? "rotate-180" : ""}`}
              />
            </button>
            {openSection === "industries" && (
              <div className="ml-3 border-l-2 border-slate-100 pl-3">
                {INDUSTRIES.map((i) => (
                  <Link
                    key={i.slug}
                    href={`/industries/${i.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {i.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Applications */}
            <button
              onClick={() => toggleSection("applications")}
              className="flex w-full items-center justify-between rounded px-3 py-2.5 text-sm font-bold text-slate-800"
            >
              Applications
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition ${openSection === "applications" ? "rotate-180" : ""}`}
              />
            </button>
            {openSection === "applications" && (
              <div className="ml-3 border-l-2 border-slate-100 pl-3">
                {APPLICATIONS.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/applications/${a.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {a.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Fabrics */}
            <button
              onClick={() => toggleSection("fabrics")}
              className="flex w-full items-center justify-between rounded px-3 py-2.5 text-sm font-bold text-slate-800"
            >
              Fabrics
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition ${openSection === "fabrics" ? "rotate-180" : ""}`}
              />
            </button>
            {openSection === "fabrics" && (
              <div className="ml-3 border-l-2 border-slate-100 pl-3">
                {FABRICS.map((f) => (
                  <Link
                    key={f.slug}
                    href={`/fabrics/${f.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {f.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Resources */}
            <button
              onClick={() => toggleSection("resources")}
              className="flex w-full items-center justify-between rounded px-3 py-2.5 text-sm font-bold text-slate-800"
            >
              Resources
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition ${openSection === "resources" ? "rotate-180" : ""}`}
              />
            </button>
            {openSection === "resources" && (
              <div className="ml-3 border-l-2 border-slate-100 pl-3">
                {RESOURCES.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/resources/${r.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {r.name}
                  </Link>
                ))}
                <Link
                  href="/case-studies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Case Studies
                </Link>
              </div>
            )}

            {/* About */}
            <button
              onClick={() => toggleSection("about")}
              className="flex w-full items-center justify-between rounded px-3 py-2.5 text-sm font-bold text-slate-800"
            >
              About
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition ${openSection === "about" ? "rotate-180" : ""}`}
              />
            </button>
            {openSection === "about" && (
              <div className="ml-3 border-l-2 border-slate-100 pl-3">
                {[
                  { href: "/about", label: "About ChinaRhinestone" },
                  { href: "/manufacturing", label: "Manufacturing" },
                  { href: "/quality-control", label: "Quality Control" },
                  { href: "/case-studies", label: "Case Studies" },
                  { href: "/contact", label: "Contact" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile CTAs */}
            <div className="flex flex-col gap-2 border-t border-slate-100 pb-4 pt-4">
              <a
                href="/designer.html"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center justify-center gap-1.5 rounded border border-blue-700 px-4 py-2.5 text-sm font-bold text-blue-700"
              >
                <Sparkles className="h-4 w-4" />
                Design Studio
              </a>
              <Link
                href="/get-a-quote"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded bg-blue-700 px-4 py-2.5 text-center text-sm font-bold text-white"
              >
                Get a Quote
              </Link>
              <p className="pt-1 text-center text-xs text-slate-500">
                WhatsApp / WeChat +86 13764593988
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
