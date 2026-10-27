"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, FileText } from "lucide-react";
import { OWNER_PASSWORD } from "@/lib/admin-auth";

interface PIHistory {
  id: string;
  pi_number: string | null;
  created_at: string;
  total_amount: string | null;
  currency: string | null;
  status: string | null;
}

interface CustomerDetail {
  customer_name: string;
  company: string | null;
  email: string | null;
  pi_history: PIHistory[];
}

export default function CustomerDetailClient({ customerId }: { customerId: string }) {
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        cache: "no-store",
        headers: { "X-Admin-Token": OWNER_PASSWORD },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ok: boolean; customer?: CustomerDetail };
      if (!json.customer) throw new Error("Customer not found");
      setData(json.customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  return (
    <main className="min-h-screen bg-[#faf9f6] pb-20">
      <div className="mx-auto max-w-5xl px-6 py-10">
        {error && (
          <div className="mb-6 flex items-start gap-2 border-2 border-red-700 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <strong className="font-black">Failed to load:</strong> {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className="border-2 border-black bg-white p-10 text-center text-base font-bold uppercase tracking-widest text-black/50">
            Loading customer…
          </div>
        ) : data ? (
          <>
            {/* Customer header */}
            <div className="mb-8 border-2 border-black bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="mb-1 text-3xl font-black uppercase leading-tight tracking-tight">
                    {data.customer_name}
                  </h1>
                  {data.company && (
                    <p className="mb-2 text-base text-black/50">{data.company}</p>
                  )}
                  {data.email && (
                    <p className="text-sm text-black/50">{data.email}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs font-black uppercase tracking-widest text-black/50">
                    {data.pi_history.length} PI{data.pi_history.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* PI History table */}
            <div className="border-2 border-black bg-white">
              <header className="border-b-2 border-black bg-[#faf9f6] px-6 py-4">
                <h2 className="text-base font-black uppercase tracking-tight">
                  Pro Forma Invoice History
                </h2>
              </header>

              {data.pi_history.length === 0 ? (
                <div className="p-10 text-center text-base font-bold uppercase tracking-widest text-black/50">
                  No PIs found for this customer.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/10 text-left">
                        <th className="px-6 py-3 text-xs font-black uppercase tracking-wider text-black/50">
                          PI Number
                        </th>
                        <th className="px-6 py-3 text-xs font-black uppercase tracking-wider text-black/50">
                          Date
                        </th>
                        <th className="px-6 py-3 text-xs font-black uppercase tracking-wider text-black/50">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-xs font-black uppercase tracking-wider text-black/50">
                          Status
                        </th>
                        <th className="px-6 py-3 text-xs font-black uppercase tracking-wider text-black/50">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pi_history.map((pi) => (
                        <tr key={pi.id} className="border-b border-black/10 last:border-0 hover:bg-black/[0.02]">
                          <td className="px-6 py-4 font-mono font-bold">
                            {pi.pi_number ?? "—"}
                          </td>
                          <td className="px-6 py-4">
                            {new Date(pi.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4">
                            {pi.total_amount && pi.currency
                              ? `${pi.currency.toUpperCase()} ${pi.total_amount}`
                              : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block border border-black/20 px-2 py-0.5 text-xs font-bold uppercase">
                              {pi.status ?? "unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {pi.pi_number ? (
                              <Link
                                href={`/pay/?pi=${pi.pi_number}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#ff4d00] hover:text-black"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                View PI
                              </Link>
                            ) : (
                              <span className="text-xs text-black/30">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="border-2 border-black bg-white p-10 text-center text-base font-bold uppercase tracking-widest text-black/50">
            Customer not found.
          </div>
        )}
      </div>
    </main>
  );
}
