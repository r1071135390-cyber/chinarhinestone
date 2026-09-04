import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Sparkles } from "lucide-react";

/* ── Footer link data (Phase 24 spec: Footer = second SEO navigation system) ── */
const COLUMNS = [
  {
    title: "Technologies",
    links: [
      { href: "/heat-transfers/rhinestone-heat-transfers", label: "Rhinestone" },
      { href: "/heat-transfers/silicone-heat-transfers", label: "Silicone" },
      { href: "/heat-transfers/reflective-heat-transfers", label: "Reflective" },
      { href: "/heat-transfers/dtf-heat-transfers", label: "DTF" },
      { href: "/heat-transfers/3d-raised-heat-transfers", label: "3D & Raised" },
      { href: "/heat-transfers/pu-heat-transfers", label: "PU" },
      { href: "/heat-transfers", label: "All Heat Transfers" },
    ],
  },
  {
    title: "Industries",
    links: [
      { href: "/industries/garment-manufacturers", label: "Garment Manufacturers" },
      { href: "/industries/sportswear-manufacturers", label: "Sportswear" },
      { href: "/industries/workwear-manufacturers", label: "Workwear" },
      { href: "/industries/fashion-apparel-manufacturers", label: "Fashion Apparel" },
      { href: "/industries/activewear-manufacturers", label: "Activewear" },
      { href: "/industries/teamwear-manufacturers", label: "Teamwear" },
      { href: "/industries/pakistan-garment-exporters", label: "Pakistan Exporters" },
      { href: "/industries/bangladesh-knitwear-manufacturers", label: "Bangladesh Knitwear" },
    ],
  },
  {
    title: "Applications",
    links: [
      { href: "/applications/logo-heat-transfers", label: "Logo Transfers" },
      { href: "/applications/heat-transfer-labels", label: "Heat Transfer Labels" },
      { href: "/applications/name-number-transfers", label: "Names & Numbers" },
      { href: "/applications/garment-branding-transfers", label: "Garment Branding" },
      { href: "/applications/reflective-marking-transfers", label: "Reflective Markings" },
      { href: "/applications/decorative-heat-transfers", label: "Decorative Transfers" },
    ],
  },
  {
    title: "Fabrics",
    links: [
      { href: "/fabrics/cotton", label: "Cotton" },
      { href: "/fabrics/polyester", label: "Polyester" },
      { href: "/fabrics/nylon", label: "Nylon" },
      { href: "/fabrics/stretch-fabrics", label: "Stretch Fabrics" },
      { href: "/fabrics/performance-fabrics", label: "Performance Fabrics" },
      { href: "/fabrics", label: "All Fabrics" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources/heat-transfer-guide", label: "Heat Transfer Guide" },
      { href: "/resources/fabric-compatibility", label: "Fabric Compatibility" },
      { href: "/resources/artwork-guidelines", label: "Artwork Guidelines" },
      { href: "/resources/heat-transfer-durability", label: "Transfer Durability" },
      { href: "/case-studies", label: "Case Studies" },
      { href: "/resources", label: "All Resources" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/manufacturing", label: "Manufacturing" },
      { href: "/quality-control", label: "Quality Control" },
      { href: "/contact", label: "Contact" },
      { href: "/get-a-quote", label: "Get a Quote" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {/* Brand row */}
        <div className="grid gap-8 border-b border-slate-800 pb-10 lg:grid-cols-2">
          <div>
            <Link href="/" className="inline-flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="ChinaRhinestone — Custom Heat Transfer Manufacturer"
                width={140}
                height={36}
                loading="lazy"
                decoding="async"
                className="h-9 w-auto rounded"
              />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Custom heat transfer manufacturer in Yiwu, China. Rhinestone, silicone,
              reflective, DTF, 3D, PU and specialty transfers for garment manufacturers
              worldwide — from custom development to bulk production and repeat orders.
            </p>
            <a
              href="/designer.html"
              className="mt-4 inline-flex items-center gap-1.5 rounded border border-blue-500/60 px-4 py-2 text-sm font-bold text-blue-400 transition hover:bg-blue-500/10"
            >
              <Sparkles className="h-4 w-4" />
              Free Online Design Studio
            </a>
          </div>
          <div className="grid grid-cols-1 gap-3 self-end sm:grid-cols-2 lg:justify-items-end">
            <ul className="space-y-3 text-sm lg:col-span-2 lg:flex lg:flex-col lg:items-end">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
                <span>Yiwu, Zhejiang, China</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-blue-400" />
                <span>WhatsApp / WeChat +86 13764593988</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-blue-400" />
                <span>info@chinarhinestone.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 shrink-0 text-blue-400" />
                <span>Mon–Sat 9:00–18:00 (GMT+8)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 6-column SEO navigation */}
        <div className="grid grid-cols-2 gap-8 pt-10 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-slate-400 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Yiwu HomeDorm Commodity Manufacturing Co., Ltd. All rights reserved.</p>
          <p className="mt-3 text-slate-600">
            ChinaRhinestone.com is a website of Yiwu HomeDorm Commodity Manufacturing Co., Ltd. —
            registered in Yiwu, Zhejiang, China. All artwork, designs and trademarks shown are
            property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
