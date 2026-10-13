"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, FileText } from "lucide-react";

interface CustomerSummary {
  id: string;
  customer_name: string;
  company: string | null;
  pi_count: number;
  last_pi_date: string | null;
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/customers/list?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { ok: boolean; customers?: CustomerSummary[] };
      setCustomers(data.customers ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#0a0a0a]">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b]">
                Internal · Sales Team
              </div>
              <div className="text-lg font-black leading-none">Customer Management</div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="mb-3 text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            Customers
          </h1>
          <p className="text-base text-[#6b6b6b]">
            View all customers and their PI history. Click any customer card to
            see their pro forma invoices.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void fetchCustomers();
                }
              }}
              placeholder="Search by name or company…"
              className="w-full border-2 border-black/20 bg-white py-3 pl-10 pr-4 text-base text-black outline-none focus:border-[#ff4d00]"
            />
          </div>
          <button
            onClick={() => void fetchCustomers()}
            className="border-2 border-black bg-[#0a0a0a] px-6 py-3 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-[#ff4d00] hover:border-[#ff4d00]"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="mb-6 border-2 border-red-700 bg-red-50 p-4 text-sm text-red-800">
            <strong className="font-black">Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="border-2 border-black bg-white p-10 text-center text-base font-bold uppercase tracking-widest text-black/50">
            Loading customers…
          </div>
        ) : customers.length === 0 ? (
          <div className="border-2 border-black bg-white p-10 text-center text-base font-bold uppercase tracking-widest text-black/50">
            No customers found
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {customers.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/admin/customers?id=${c.id}`)}
                className="group border-2 border-black bg-white p-5 text-left transition-all hover:border-[#ff4d00] hover:shadow-[4px_4px_0_0_#ff4d00]"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center bg-[#0a0a0a] group-hover:bg-[#ff4d00]">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-widest text-black/50">
                      {c.pi_count} PI{c.pi_count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
                <h2 className="mb-1 text-base font-black leading-tight">{c.customer_name}</h2>
                {c.company && (
                  <p className="mb-2 text-sm text-black/50">{c.company}</p>
                )}
                {c.last_pi_date && (
                  <p className="text-xs text-black/30">
                    Last PI: {new Date(c.last_pi_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
