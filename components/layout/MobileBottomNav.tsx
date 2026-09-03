"use client";

import Link from "next/link";
import {
  Shirt,
  Layers,
  Factory,
  Sparkles,
  Wrench,
  Truck,
} from "lucide-react";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ITEMS: Item[] = [
  { href: "/heat-transfers", label: "Products", icon: Shirt },
  { href: "/applications", label: "Solutions", icon: Layers },
  { href: "/fabrics", label: "Fabrics", icon: Factory },
  { href: "/manufacturing", label: "Techniques", icon: Sparkles },
  { href: "/designer.html", label: "Tools", icon: Wrench },
  { href: "/contact", label: "Shipping", icon: Truck },
];

/**
 * Mobile-only bottom navigation bar styled like an iOS tab bar.
 * - Floats above the bottom edge with rounded corners and a subtle shadow.
 * - Active item: full rounded-rectangle (pill) background in light blue,
 *   matching the iOS tab bar selected state.
 * - Shown on screens < md (Tailwind default = 768px).
 */
export function MobileBottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-3 bottom-3 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur">
        <ul className="grid grid-cols-6 px-1 py-1">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition ${
                    active
                      ? "bg-blue-100/80 text-blue-700"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      active ? "text-blue-700" : "text-slate-400"
                    }`}
                  />
                  <span className="leading-none">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
