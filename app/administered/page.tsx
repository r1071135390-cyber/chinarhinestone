import Link from "next/link";
import { LayoutDashboard, Users, Building2, FileText, Plus } from "lucide-react";
import PiListModule from "@/components/admin/PiListModule";

const ADMIN_LINKS = [
  {
    href: "/administered/summary/",
    label: "PI Overview",
    description: "Totals, monthly value and currency breakdown",
    icon: FileText,
  },
  {
    href: "/administered/new-pi/",
    label: "New PI",
    description: "Create a proforma invoice and send it to the customer",
    icon: Plus,
  },
  {
    href: "/administered/bank-accounts",
    label: "Bank Accounts",
    description: "Manage USD / EUR / GBP / CNY receiving accounts",
    icon: Building2,
  },
  {
    href: "/administered/customers",
    label: "Customers",
    description: "View customer list and their PI history",
    icon: Users,
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#0a0a0a]">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b]">
                Internal · Sales Team
              </div>
              <div className="text-lg font-black leading-none">Admin Portal</div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10">
          <h1 className="mb-3 text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            ChinaRhinestone
          </h1>
          <p className="text-base text-[#6b6b6b]">
            Internal sales and operations portal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {ADMIN_LINKS.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group border-2 border-black bg-white p-6 transition-all hover:border-[#ff4d00] hover:shadow-[4px_4px_0_0_#ff4d00]"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-[#0a0a0a] group-hover:bg-[#ff4d00]">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="mb-2 text-xl font-black uppercase tracking-tight">{label}</h2>
              <p className="text-sm text-[#6b6b6b]">{description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <PiListModule />
        </div>
      </div>
    </main>
  );
}
