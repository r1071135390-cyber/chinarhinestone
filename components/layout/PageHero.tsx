import Link from "next/link";
import { ChevronRight } from "lucide-react";

const SITE_URL = "https://chinarhinestone.com";

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  /* BreadcrumbList structured data — items without href (current page) are skipped */
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items
      .filter((item) => item.href)
      .map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.label,
        item: `${SITE_URL}${item.href}`,
      })),
  };

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-500" />}
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="text-slate-400 transition hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-200">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumb,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  breadcrumb: { label: string; href?: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <Breadcrumb items={breadcrumb} />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">{intro}</p>
        )}
        {children}
      </div>
    </section>
  );
}
