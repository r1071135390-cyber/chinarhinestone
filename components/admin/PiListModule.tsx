"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Lock, RefreshCw, Search, FileText, AlertTriangle } from "lucide-react";
import MarkPaidControl from "@/components/admin/MarkPaidControl";
import DeleteControl from "@/components/admin/DeleteControl";

interface PiListItem {
  id: number | string;
  piNumber: string;
  customerName: string | null;
  customerCompany: string | null;
  totalDisplay: string;
  status: string | null;
  createdAt: string;
  paidAt?: string | null;
  paymentMethod?: string | null;
  paymentCount?: number;
  duplicatePayment?: boolean;
}

interface PiListResponse {
  summary?: {
    totalCount?: number;
    duplicatePaymentCount?: number;
    paymentLedgerAvailable?: boolean;
  };
  pis?: PiListItem[];
  error?: string;
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "awaiting_payment", label: "Awaiting" },
  { key: "paid", label: "Paid" },
] as const;

function statusStyle(status: string | null): { bg: string; text: string; border: string; label: string } {
  switch ((status || "draft").toLowerCase()) {
    case "paid":
      return { bg: "bg-[#0a0a0a]", text: "text-white", border: "border-[#0a0a0a]", label: "PAID" };
    case "sent":
      return { bg: "bg-[#00c2ff]", text: "text-[#0a0a0a]", border: "border-[#00c2ff]", label: "SENT" };
    case "awaiting_payment":
    case "bank_transfer_pending":
      return { bg: "bg-[#ffd166]", text: "text-[#0a0a0a]", border: "border-[#ffd166]", label: "AWAITING" };
    case "cancelled":
    case "canceled":
      return { bg: "bg-white", text: "text-[#6b6b6b]", border: "border-[#6b6b6b]", label: "CANCELLED" };
    default:
      return { bg: "bg-[#ff4d00]", text: "text-white", border: "border-[#ff4d00]", label: "DRAFT" };
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export default function PiListModule() {
  const [pis, setPis] = useState<PiListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/list", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as PiListResponse;
      if (!res.ok) {
        setError(data.error || `Failed to load invoices (${res.status})`);
        return;
      }
      setPis(data.pis ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pis.filter((p) => {
      if (statusFilter !== "all" && (p.status || "draft").toLowerCase() !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        p.piNumber.toLowerCase().includes(q) ||
        (p.customerName || "").toLowerCase().includes(q) ||
        (p.customerCompany || "").toLowerCase().includes(q)
      );
    });
  }, [pis, statusFilter, search]);

  const duplicateCount = pis.filter((p) => p.duplicatePayment).length;

  return (
    <section className="border-2 border-black bg-white">
      {/* Module header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black bg-[#0a0a0a] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" strokeWidth={2.5} />
          <h2 className="text-sm font-black uppercase tracking-tight sm:text-base">
            PI List
          </h2>
          <span className="border border-white/40 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-1 border border-white/40 px-2 py-1 text-[10px] font-black uppercase tracking-wider hover:border-[#ff4d00] hover:text-[#ff4d00] disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} strokeWidth={2.5} />
            Refresh
          </button>
          <Link
            href="/administered/summary/"
            className="border border-white/40 px-2 py-1 text-[10px] font-black uppercase tracking-wider hover:border-[#ff4d00] hover:text-[#ff4d00]"
          >
            Full Overview
          </Link>
          <Link
            href="/administered/new-pi/"
            className="bg-[#ff4d00] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-black hover:bg-[#e64500]"
          >
            + New PI
          </Link>
        </div>
      </div>

      {/* Toolbar — filters first, then the list */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-black bg-[#faf9f6] px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`border-2 px-2 py-1 text-[10px] font-black uppercase tracking-wider transition-colors ${
                statusFilter === f.key
                  ? "border-[#ff4d00] bg-[#ff4d00] text-black"
                  : "border-black/20 bg-white text-[#6b6b6b] hover:border-black"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[160px] flex-1">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="PI no. / customer…"
            className="w-full border-2 border-black/20 bg-white py-1.5 pl-7 pr-2 text-xs text-black outline-none focus:border-[#ff4d00]"
          />
        </div>
      </div>

      {/* Duplicate-payment warning */}
      {duplicateCount > 0 && (
        <div className="flex items-start gap-2 border-b-2 border-[#ff4d00] bg-[#fff4ef] px-4 py-2.5 text-xs font-bold text-[#ff4d00]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
          <div>
            {duplicateCount} invoice(s) received more than one payment — see the
            flagged rows below and refund the extra one from the Stripe dashboard.
          </div>
        </div>
      )}

      {error ? (
        <div className="px-4 py-8 text-center text-sm font-bold text-[#ff4d00]">{error}</div>
      ) : loading ? (
        <div className="px-4 py-8 text-center text-sm text-[#6b6b6b]">
          <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin" strokeWidth={2.5} />
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <div className="mb-2 text-sm font-black uppercase tracking-tight">
            {pis.length === 0 ? "No PIs yet" : "No matching PIs"}
          </div>
          <div className="mb-4 text-xs text-[#6b6b6b]">
            {pis.length === 0
              ? "Create your first proforma invoice to see it here."
              : "Adjust the status filter or search keyword."}
          </div>
          {pis.length === 0 && (
            <Link
              href="/administered/new-pi/"
              className="inline-block bg-[#ff4d00] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#e64500]"
            >
              + Create a PI
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-white text-[10px] font-black uppercase tracking-wider text-[#6b6b6b]">
                <th className="px-3 py-2">PI Number</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const sc = statusStyle(p.status);
                const editable = sc.label === "DRAFT" || sc.label === "SENT";
                return (
                  <tr
                    key={String(p.id)}
                    className="border-b border-[#e5e5e5] transition-colors last:border-b-0 hover:bg-[#faf9f6]"
                  >
                    <td className="px-3 py-2.5 font-black tracking-tight">{p.piNumber}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-bold">{p.customerName || "—"}</div>
                      {p.customerCompany && (
                        <div className="text-[10px] text-[#6b6b6b]">{p.customerCompany}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[#6b6b6b]">{formatDate(p.createdAt)}</td>
                    <td className="px-3 py-2.5 text-right font-bold">{p.totalDisplay}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-block border-2 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${sc.bg} ${sc.text} ${sc.border}`}
                      >
                        {sc.label}
                      </span>
                      {sc.label === "PAID" && p.paidAt && (
                        <div className="mt-0.5 text-[9px] leading-tight text-[#6b6b6b]">
                          {p.paymentMethod ? (
                            <span className="font-bold uppercase">{p.paymentMethod}</span>
                          ) : null}
                          {p.paymentMethod ? " · " : ""}
                          {formatDate(p.paidAt)}
                        </div>
                      )}
                      {p.duplicatePayment && (
                        <div className="mt-1">
                          <span
                            className="inline-block border-2 border-[#ff4d00] bg-[#ff4d00] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white"
                            title={`${p.paymentCount ?? 0} payments received for this invoice`}
                          >
                            Dup · {p.paymentCount}× paid
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/pay/?pi=${encodeURIComponent(p.piNumber)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black hover:text-[#ff4d00]"
                          title="Open public PI page"
                        >
                          <Eye className="h-3 w-3" strokeWidth={2.5} />
                          Open
                        </Link>
                        {editable ? (
                          <Link
                            href={`/administered/edit-pi/?pi=${encodeURIComponent(p.piNumber)}`}
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-black hover:text-[#ff4d00]"
                            title={`Edit PI ${p.piNumber}`}
                          >
                            <Pencil className="h-3 w-3" strokeWidth={2.5} />
                            Edit
                          </Link>
                        ) : (
                          <span
                            className="inline-flex cursor-not-allowed items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#c0c0c0]"
                            title={`PI status "${sc.label}" is locked for editing.`}
                          >
                            <Lock className="h-3 w-3" strokeWidth={2.5} />
                            Locked
                          </span>
                        )}
                        <MarkPaidControl
                          piNumber={p.piNumber}
                          status={p.status}
                          customerName={p.customerName}
                          totalDisplay={p.totalDisplay}
                          size="sm"
                          onDone={() => void load()}
                        />
                        <DeleteControl
                          piNumber={p.piNumber}
                          status={p.status}
                          customerName={p.customerName}
                          totalDisplay={p.totalDisplay}
                          size="sm"
                          onDone={() => void load()}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
