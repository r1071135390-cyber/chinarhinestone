"use client";

import Link from "next/link";
import {
  Shirt,
  Layers,
  Factory,
  Sparkles,
  Wrench,
  Truck,
  Home,
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
 * Mobile-only bottom navigation bar.
 * Shown on screens < md (Tailwind default = 768px).
 * Sticks to the bottom of the viewport, matches the pattern in the
 * reference screenshot (Products / Solutions / Fabrics / Techniques / Tools / Shipping).
 */
export function MobileBottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur shadow-[0_-4px_20px_rgba(15,23,42,0.08)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-6">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          // Treat /products/<x> as active for /products, etc.
          const active =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition ${
                  active
                    ? "text-blue-700"
                    : "text-slate-600 hover:text-blue-700"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${active ? "text-blue-700" : "text-slate-500"}`}
                />
                <span className="leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
