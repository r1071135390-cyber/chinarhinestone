"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, FileText, Pencil, Eye, RefreshCw, ChevronDown } from "lucide-react";
import { OWNER_PASSWORD } from "@/lib/admin-auth";
import CustomerEditDialog, {
  type CustomerEditable,
} from "@/components/admin/CustomerEditDialog";

interface CustomerSummary {
  id: string;
  customer_name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  pi_count: number;
  last_pi_date: string | null;
}

/** One proforma invoice of a customer (shape returned by /api/admin/customers/:id). */
interface CustomerPI {
  id: string;
  pi_number: string | null;
  created_at: string;
  total_amount: string | null;
  currency: string | null;
  status: string | null;
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CustomerEditable | null>(null);
  /** Id of the customer whose invoices are expanded. */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  /** Loaded invoice lists, keyed by customer id. */
  const [piHistory, setPiHistory] = useState<Record<string, CustomerPI[]>>({});
  const [piLoading, setPiLoading] = useState<string | null>(null);
  const [piError, setPiError] = useState<Record<string, string>>({});
  const router = useRouter();

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/customers/list?${params}`, {
        cache: "no-store",
        headers: { "X-Admin-Token": OWNER_PASSWORD },
      });
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

  /**
   * Expands the invoice list of one customer. The list is fetched on demand
   * from the customer detail endpoint and cached, so expanding the same row
   * twice does not hit the API again.
   */
  const togglePIs = useCallback(
    async (customerId: string) => {
      if (expandedId === customerId) {
        setExpandedId(null);
        return;
      }
      setExpandedId(customerId);
      if (piHistory[customerId]) return;

      setPiLoading(customerId);
      setPiError((prev) => ({ ...prev, [customerId]: "" }));
      try {
        const res = await fetch(`/api/admin/customers/${encodeURIComponent(customerId)}`, {
          cache: "no-store",
          headers: { "X-Admin-Token": OWNER_PASSWORD },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          ok: boolean;
          customer?: { pi_history?: CustomerPI[] };
        };
        setPiHistory((prev) => ({
          ...prev,
          [customerId]: json.customer?.pi_history ?? [],
        }));
      } catch (err) {
        setPiError((prev) => ({
          ...prev,
          [customerId]: err instanceof Error ? err.message : "Failed to load invoices",
        }));
      } finally {
        setPiLoading(null);
      }
    },
    [expandedId, piHistory]
  );

  function formatDate(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  /** Badge colours for a PI status, matching the summary table. */
  function statusClass(status: string | null): string {
    switch ((status || "draft").toLowerCase()) {
      case "paid":
        return "bg-[#0a0a0a] text-white border-[#0a0a0a]";
      case "sent":
        return "bg-[#00c2ff] text-[#0a0a0a] border-[#00c2ff]";
      case "awaiting_payment":
      case "bank_transfer_pending":
        return "bg-[#ffd166] text-[#0a0a0a] border-[#ffd166]";
      case "cancelled":
      case "canceled":
        return "bg-white text-[#6b6b6b] border-[#6b6b6b]";
      default:
        return "bg-[#ff4d00] text-white border-[#ff4d00]";
    }
  }

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
          <button
            type="button"
            onClick={() => void fetchCustomers()}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-black hover:text-[#ff4d00] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={2.5} />
            Refresh
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="mb-3 text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            Customers
          </h1>
          <p className="text-base text-[#6b6b6b]">
            All customers and their PI history in one list. Edit a customer to
            update the contact details on every one of their invoices.
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
              placeholder="Search by name, company, email or phone…"
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
          <div className="border-2 border-black bg-white">
            <header className="flex items-center justify-between border-b-2 border-black bg-[#0a0a0a] px-6 py-4 text-white">
              <h2 className="text-base font-black uppercase tracking-tight">
                Customer List
              </h2>
              <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                {customers.length} customer{customers.length !== 1 ? "s" : ""}
              </span>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-black bg-[#faf9f6] text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 text-right" title="Click a number to list the invoices of that customer">
                      PIs
                    </th>
                    <th className="px-4 py-3 text-right">Last PI</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const expanded = expandedId === c.id;
                    const invoices = piHistory[c.id];
                    return (
                      <Fragment key={c.id}>
                        <tr
                          className="border-b border-[#e5e5e5] transition-colors hover:bg-[#faf9f6]"
                        >
                          <td className="px-4 py-3 font-black tracking-tight">
                            {c.customer_name}
                          </td>
                          <td className="px-4 py-3 text-[#6b6b6b]">{c.company || "—"}</td>
                          <td className="px-4 py-3">
                            {c.email ? (
                              <a
                                href={`mailto:${c.email}`}
                                className="font-bold text-black underline decoration-[#ff4d00] decoration-2 underline-offset-2 hover:text-[#ff4d00]"
                              >
                                {c.email}
                              </a>
                            ) : (
                              <span className="text-[#c0c0c0]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[#6b6b6b]">{c.phone || "—"}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => void togglePIs(c.id)}
                              disabled={c.pi_count === 0}
                              aria-expanded={expanded}
                              title={`${c.pi_count} invoice${c.pi_count !== 1 ? "s" : ""} of ${c.customer_name}`}
                              className="inline-flex items-center gap-1 font-bold text-black underline decoration-[#ff4d00] decoration-2 underline-offset-2 hover:text-[#ff4d00] disabled:cursor-default disabled:text-[#c0c0c0] disabled:no-underline"
                            >
                              {c.pi_count}
                              {c.pi_count > 0 && (
                                <ChevronDown
                                  className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                                  strokeWidth={3}
                                />
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right text-[#6b6b6b]">
                            {formatDate(c.last_pi_date)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-4">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditing({
                                    id: c.id,
                                    customer_name: c.customer_name,
                                    company: c.company,
                                    email: c.email,
                                    phone: c.phone,
                                    address: c.address,
                                  })
                                }
                                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black hover:text-[#ff4d00]"
                                title={`Edit ${c.customer_name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(`/administered/customers?id=${encodeURIComponent(c.id)}`)
                                }
                                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black hover:text-[#ff4d00]"
                                title={`Open the full record of ${c.customer_name}`}
                              >
                                <Eye className="h-3.5 w-3.5" strokeWidth={2.5} />
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expanded && (
                          <tr className="border-b border-[#e5e5e5] bg-[#faf9f6]">
                            <td colSpan={7} className="px-4 py-4">
                              {piLoading === c.id ? (
                                <p className="py-3 text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
                                  Loading invoices…
                                </p>
                              ) : piError[c.id] ? (
                                <p className="py-3 text-xs font-bold text-[#ff4d00]">
                                  Failed to load invoices: {piError[c.id]}
                                </p>
                              ) : !invoices || invoices.length === 0 ? (
                                <p className="py-3 text-xs font-bold uppercase tracking-wider text-[#6b6b6b]">
                                  No invoices for this customer.
                                </p>
                              ) : (
                                <div className="overflow-x-auto border-2 border-black bg-white">
                                  <table className="w-full min-w-[640px] text-left text-xs">
                                    <thead>
                                      <tr className="border-b-2 border-black bg-[#0a0a0a] text-[10px] font-black uppercase tracking-wider text-white">
                                        <th className="px-4 py-2">PI Number</th>
                                        <th className="px-4 py-2">Date</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2 text-right">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {invoices.map((pi) => (
                                        <tr
                                          key={pi.id}
                                          className="border-b border-[#e5e5e5] last:border-b-0"
                                        >
                                          <td className="px-4 py-2 font-mono font-bold">
                                            {pi.pi_number ?? "—"}
                                          </td>
                                          <td className="px-4 py-2 text-[#6b6b6b]">
                                            {formatDate(pi.created_at)}
                                          </td>
                                          <td className="px-4 py-2 font-bold">
                                            {pi.total_amount && pi.currency
                                              ? `${pi.currency.toUpperCase()} ${pi.total_amount}`
                                              : "—"}
                                          </td>
                                          <td className="px-4 py-2">
                                            <span
                                              className={`inline-block border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusClass(pi.status)}`}
                                            >
                                              {pi.status ?? "unknown"}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-right">
                                            {pi.pi_number ? (
                                              <a
                                                href={`/pay/?pi=${encodeURIComponent(pi.pi_number)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="font-black uppercase tracking-wider text-black hover:text-[#ff4d00]"
                                              >
                                                Open PI
                                              </a>
                                            ) : (
                                              <span className="text-[#c0c0c0]">—</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-6 flex items-start gap-2 text-xs text-[#6b6b6b]">
          <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
          Click the PI count to expand the invoices of that customer. A customer is
          grouped by their email address (or by name when they have none), and
          editing a customer updates every proforma invoice that belongs to them.
        </p>
      </div>

      {editing && (
        <CustomerEditDialog
          customer={editing}
          onClose={() => setEditing(null)}
          onDone={async () => {
            setEditing(null);
            await fetchCustomers();
          }}
        />
      )}
    </main>
  );
}
