"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  RefreshCw,
  FileText,
  Calendar,
  TrendingUp,
  Eye,
  Lock,
  Trash2,
  AlertTriangle,
  X,
  Coins,
  Pencil,
} from "lucide-react";

// ─── Inline FxRates type (adapted from @/lib/fx-rates) ──────────────────────
export interface FxRates {
  baseCurrency: string;
  rates: Record<string, number>;
  asOf: string;
  source: string;
}

// Owner-only access
const OWNER_PASSWORD = "HOMEdorm521$$$";
const SESSION_KEY = "cr_pi_summary_unlocked";

interface PiListItem {
  id: number | string;
  piNumber: string;
  customerName: string | null;
  customerCompany: string | null;
  totalCents: number | null;
  currency: string | null;
  totalDisplay: string;
  status: string | null;
  createdAt: string;
  paymentCount?: number;
  paidAmountCents?: number;
  duplicatePayment?: boolean;
}

interface CurrencyBucket {
  cents: number;
  display: string;
}

interface SummaryStats {
  totalCount: number;
  shownCount: number;
  monthCount: number;
  duplicatePaymentCount?: number;
  totalsByCurrency: Record<string, CurrencyBucket>;
  monthTotalsByCurrency: Record<string, CurrencyBucket>;
  totalValueUsdCents: number;
  totalValueUsdDisplay: string;
  monthValueUsdCents: number;
  monthValueUsdDisplay: string;
  fx: FxRates;
}

function statusColor(status: string | null): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  const s = (status || "draft").toLowerCase();
  switch (s) {
    case "paid":
      return { bg: "bg-[#0a0a0a]", text: "text-white", border: "border-[#0a0a0a]", label: "PAID" };
    case "sent":
      return { bg: "bg-[#00c2ff]", text: "text-[#0a0a0a]", border: "border-[#00c2ff]", label: "SENT" };
    case "awaiting_payment":
    case "bank_transfer_pending":
      return { bg: "bg-[#ffd166]", text: "text-[#0a0a0a]", border: "border-[#ffd166]", label: "AWAITING PAYMENT" };
    case "cancelled":
    case "canceled":
      return { bg: "bg-white", text: "text-[#6b6b6b]", border: "border-[#6b6b6b]", label: "CANCELLED" };
    case "draft":
    default:
      return { bg: "bg-[#ff4d00]", text: "text-white", border: "border-[#ff4d00]", label: "DRAFT" };
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SummaryClient() {
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [pis, setPis] = useState<PiListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setUnlocked(true);
      }
    } catch {
      // sessionStorage may be unavailable
    }
    setReady(true);
  }, []);

  const [confirmTarget, setConfirmTarget] = useState<PiListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pwInput === OWNER_PASSWORD) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
      setUnlocked(true);
      setPwError(null);
    } else {
      setPwError("Wrong password.");
    }
  }

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pi/list", { cache: "no-store" });
      if (!res.ok) {
        const t = await res.text();
        setError(`Load failed (${res.status}): ${t}`);
        return;
      }
      const data = (await res.json()) as {
        summary: SummaryStats;
        pis: PiListItem[];
      };
      setStats(data.summary);
      setPis(data.pis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (unlocked) {
      void fetchData();
    }
  }, [unlocked]);

  function requestDelete(p: PiListItem) {
    setDeleteError(null);
    setConfirmTarget(p);
  }

  function cancelDelete() {
    if (deleting) return;
    setConfirmTarget(null);
    setDeleteError(null);
  }

  async function confirmDelete() {
    if (!confirmTarget || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/pi/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ piNumber: confirmTarget.piNumber }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        hint?: string;
      };
      if (!res.ok || !data.success) {
        const msg = data.hint
          ? `${data.error || "Delete failed"} — ${data.hint}`
          : data.error || `Delete failed (${res.status})`;
        setDeleteError(msg);
        return;
      }
      setConfirmTarget(null);
      await fetchData();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Network error");
    } finally {
      setDeleting(false);
    }
  }

  // ---------- Locked view ----------

  if (ready && !unlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-4 py-12">
        <div className="w-full max-w-md border-2 border-black bg-white p-8 shadow-[6px_6px_0_0_rgba(10,10,10,1)]">
          <div className="mb-5 flex h-12 w-12 items-center justify-center border-2 border-black bg-[#0a0a0a] text-white">
            <Lock className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <h1 className="mb-1 text-2xl font-black uppercase leading-tight tracking-tight">
            PI Summary
          </h1>
          <p className="mb-5 text-sm text-[#6b6b6b]">
            Owner-only. Enter the password to view sales overview.
          </p>
          <form onSubmit={tryUnlock}>
            <input
              type="password"
              autoFocus
              autoComplete="off"
              value={pwInput}
              onChange={(e) => {
                setPwInput(e.target.value);
                setPwError(null);
              }}
              placeholder="Password"
              className="mb-2 w-full border-2 border-black bg-white px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/40"
            />
            {pwError && (
              <div className="mb-2 text-xs font-bold text-[#ff4d00]">
                {pwError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-[#0a0a0a] px-4 py-2 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-[#ff4d00]"
            >
              Unlock
            </button>
          </form>
          <div className="mt-5 border-t border-[#e5e5e5] pt-4 text-xs text-[#6b6b6b]">
            <Link href="/admin/" className="font-bold uppercase tracking-wider text-black hover:text-[#ff4d00]">
              ← Back to admin
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ---------- Main summary view ----------

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#0a0a0a] font-black text-white">
              CR
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b]">
                Internal · Owner Only
              </div>
              <div className="text-lg font-black leading-none">PI Summary</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => void fetchData()}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-black hover:text-[#ff4d00] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={2.5} />
              Refresh
            </button>
            <Link href="/admin/" className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-black hover:text-[#ff4d00]">
              <ArrowLeft className="h-4 w-4" strokeWidth={2.5} />
              Back to admin
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="mb-3 text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            PI Overview
          </h1>
          <p className="max-w-2xl text-lg text-[#6b6b6b]">
            All proforma invoices in one place. Showing the {pis.length} most recent PIs.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 border-2 border-[#ff4d00] bg-white p-4 text-sm font-bold text-[#ff4d00]">
            {error}
          </div>
        )}

        {/* Duplicate-payment warning */}
        {stats && (stats.duplicatePaymentCount ?? 0) > 0 && (
          <div className="mb-6 flex items-start gap-3 border-2 border-[#ff4d00] bg-[#fff4ef] p-4 text-sm font-bold text-[#ff4d00]">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2.5} />
            <div>
              {stats.duplicatePaymentCount} invoice(s) received more than one payment.
              Check the rows flagged "Duplicate" below and refund the extra payment
              from the Stripe dashboard.
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<FileText className="h-6 w-6" strokeWidth={2.5} />}
            label="Total PIs"
            value={stats ? String(stats.totalCount) : "—"}
            sub={
              stats && stats.totalCount > stats.shownCount
                ? `Showing ${stats.shownCount} here`
                : "All time"
            }
            accent="#0a0a0a"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" strokeWidth={2.5} />}
            label="This Month"
            value={stats ? String(stats.monthCount) : "—"}
            sub="PIs created"
            accent="#00c2ff"
          />
          <ByCurrencyCard
            icon={<Coins className="h-6 w-6" strokeWidth={2.5} />}
            label="By Currency"
            stats={stats}
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" strokeWidth={2.5} />}
            label="USD Equivalent"
            value={stats ? stats.totalValueUsdDisplay : "—"}
            sub={
              stats
                ? `Rates as of ${stats.fx.asOf} · ${stats.fx.source}`
                : "Rates as of —"
            }
            accent="#ff4d00"
          />
        </div>

        {/* PI list */}
        <div className="border-2 border-black bg-white">
          <div className="flex items-center justify-between border-b-2 border-black bg-[#0a0a0a] px-6 py-4 text-white">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" strokeWidth={2.5} />
              <h2 className="text-lg font-black uppercase tracking-tight">
                Recent PIs
              </h2>
            </div>
            <Link
              href="/admin/new-pi/"
              className="bg-[#ff4d00] px-3 py-1.5 text-xs font-black uppercase tracking-wider text-black hover:bg-[#e64500]"
            >
              + New PI
            </Link>
          </div>

          {loading && !stats ? (
            <div className="px-6 py-16 text-center text-sm text-[#6b6b6b]">
              <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" strokeWidth={2.5} />
              Loading…
            </div>
          ) : pis.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mb-2 text-base font-black uppercase tracking-tight">
                No PIs yet
              </div>
              <div className="mb-4 text-sm text-[#6b6b6b]">
                Create your first proforma invoice to see it here.
              </div>
              <Link
                href="/admin/new-pi/"
                className="inline-block bg-[#ff4d00] px-4 py-2 text-sm font-black uppercase tracking-wider text-black hover:bg-[#e64500]"
              >
                + Create a PI
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-black bg-[#faf9f6] text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
                    <th className="px-4 py-3">PI Number</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">View</th>
                    <th className="px-4 py-3 text-right">Edit</th>
                    <th className="px-4 py-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {pis.map((p) => {
                    const sc = statusColor(p.status);
                    return (
                      <tr
                        key={String(p.id)}
                        className="border-b border-[#e5e5e5] transition-colors last:border-b-0 hover:bg-[#faf9f6]"
                      >
                        <td className="px-4 py-3 font-black tracking-tight">{p.piNumber}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold">{p.customerName || "—"}</div>
                          {p.customerCompany && (
                            <div className="text-xs text-[#6b6b6b]">{p.customerCompany}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#6b6b6b]">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3 text-right font-bold">{p.totalDisplay}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block border-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${sc.bg} ${sc.text} ${sc.border}`}>
                            {sc.label}
                          </span>
                          {p.duplicatePayment && (
                            <div className="mt-1">
                              <span
                                className="inline-block border-2 border-[#ff4d00] bg-[#ff4d00] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                                title={`${p.paymentCount ?? 0} payments received for this invoice — refund the extra one`}
                              >
                                Duplicate · {p.paymentCount}× paid
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/pay/?pi=${encodeURIComponent(p.piNumber)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black hover:text-[#ff4d00]"
                            title="Open public PI page"
                          >
                            <Eye className="h-3.5 w-3.5" strokeWidth={2.5} />
                            Open
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {sc.label === "DRAFT" || sc.label === "SENT" ? (
                            <Link
                              href={`/admin/edit-pi/?pi=${encodeURIComponent(p.piNumber)}`}
                              className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-black hover:text-[#ff4d00]"
                              title={`Edit PI ${p.piNumber}`}
                            >
                              <Pencil className="h-3.5 w-3.5" strokeWidth={2.5} />
                              Edit
                            </Link>
                          ) : (
                            <span className="inline-flex cursor-not-allowed items-center gap-1 text-xs font-black uppercase tracking-wider text-[#c0c0c0]" title={`PI status "${sc.label}" is locked for editing.`}>
                              <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
                              Locked
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {sc.label === "PAID" ? (
                            <span className="inline-flex cursor-not-allowed items-center gap-1 text-xs font-black uppercase tracking-wider text-[#c0c0c0]" title="Paid PIs cannot be deleted. Refund via Stripe Dashboard first.">
                              <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
                              Locked
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => requestDelete(p)}
                              className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#6b6b6b] hover:text-[#ff4d00]"
                              title={`Delete PI ${p.piNumber}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footnote */}
        <div className="mt-8 space-y-2 text-xs text-[#6b6b6b]">
          <p>
            Per-row amounts are the PI's actual currency. Per-currency totals show real exposure.
            The "USD Equivalent" card uses a hardcoded FX table for a single headline number.
          </p>
          {stats?.fx && (
            <p>
              Rates as of <span className="font-bold">{stats.fx.asOf}</span>
              {" "}({stats.fx.source}):{" "}
              {Object.entries(stats.fx.rates)
                .map(([code, rate]) => `1 ${stats.fx.baseCurrency} = ${rate} ${code}`)
                .join(" · ")}
              .
            </p>
          )}
        </div>
      </div>

      {confirmTarget && (
        <DeleteConfirmModal
          target={confirmTarget}
          deleting={deleting}
          error={deleteError}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(10,10,10,1)]">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
        <span style={{ color: accent }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-black tracking-tight text-black md:text-3xl">{value}</div>
      <div className="mt-1 text-xs text-[#6b6b6b]">{sub}</div>
    </div>
  );
}

// ─── Delete confirm modal ────────────────────────────────────────────────
function DeleteConfirmModal({
  target,
  deleting,
  error,
  onCancel,
  onConfirm,
}: {
  target: PiListItem;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    setTyped("");
  }, [target.piNumber]);

  const matches = typed.trim() === target.piNumber;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) onCancel();
      }}
    >
      <div className="w-full max-w-md border-2 border-black bg-white shadow-[8px_8px_0_0_rgba(255,77,0,1)]">
        <div className="flex items-start justify-between border-b-2 border-black bg-[#ff4d00] px-5 py-3 text-black">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" strokeWidth={2.5} />
            <h2 id="delete-modal-title" className="text-base font-black uppercase tracking-tight">
              Delete this PI?
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="text-black hover:opacity-70 disabled:opacity-30"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="mb-4 text-sm text-[#0a0a0a]">
            You are about to permanently delete this proforma invoice. This cannot be undone.
          </p>

          <dl className="mb-5 space-y-1 border-l-2 border-[#ff4d00] bg-[#fff7f3] px-3 py-2 text-xs">
            <div className="flex justify-between gap-3">
              <dt className="font-black uppercase tracking-wider text-[#6b6b6b]">PI Number</dt>
              <dd className="font-bold">{target.piNumber}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-black uppercase tracking-wider text-[#6b6b6b]">Customer</dt>
              <dd className="font-bold">{target.customerName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-black uppercase tracking-wider text-[#6b6b6b]">Total</dt>
              <dd className="font-bold">{target.totalDisplay}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-black uppercase tracking-wider text-[#6b6b6b]">Status</dt>
              <dd className="font-bold uppercase">{target.status || "draft"}</dd>
            </div>
          </dl>

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
            Type <code className="rounded bg-[#0a0a0a] px-1.5 py-0.5 text-[10px] text-white">{target.piNumber}</code> to confirm
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={deleting}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            placeholder={target.piNumber}
            className="mb-2 w-full border-2 border-black bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d00]/40 disabled:opacity-50"
          />

          {error && (
            <div className="mb-3 border-2 border-[#ff4d00] bg-white px-3 py-2 text-xs font-bold text-[#ff4d00]">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              className="border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!matches || deleting}
              className="inline-flex items-center gap-1.5 bg-[#ff4d00] px-4 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-[#e64500] disabled:opacity-40"
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Delete permanently
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── By-currency totals card ─────────────────────────────────────────
function ByCurrencyCard({
  icon,
  label,
  stats,
}: {
  icon: React.ReactNode;
  label: string;
  stats: SummaryStats | null;
}) {
  const PREFERRED_ORDER = ["USD", "EUR", "GBP", "CNY"];
  const entries = stats
    ? Object.entries(stats.totalsByCurrency).sort(([a], [b]) => {
        const ai = PREFERRED_ORDER.indexOf(a);
        const bi = PREFERRED_ORDER.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      })
    : [];

  return (
    <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_rgba(10,10,10,1)]">
      <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6b6b6b]">
        <span style={{ color: "#00c2ff" }}>{icon}</span>
        <span>{label}</span>
      </div>
      {!stats ? (
        <div className="text-2xl font-black tracking-tight text-black md:text-3xl">—</div>
      ) : entries.length === 0 ? (
        <div className="text-2xl font-black tracking-tight text-black md:text-3xl">—</div>
      ) : (
        <ul className="space-y-1.5">
          {entries.map(([code, bucket]) => {
            const isActive = bucket.cents > 0;
            return (
              <li
                key={code}
                className={"flex items-baseline justify-between gap-3 " + (isActive ? "" : "opacity-40")}
              >
                <span className="font-black uppercase tracking-wider text-[10px] text-[#6b6b6b]">
                  {code}
                </span>
                <span className={"font-bold tracking-tight " + (isActive ? "text-black" : "text-[#9a9a9a]")}>
                  {isActive ? bucket.display : "no activity"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
