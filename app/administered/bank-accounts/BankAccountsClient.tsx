"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, RefreshCw, AlertCircle, CheckCircle2, Building2, RotateCcw } from "lucide-react";
import { SUPPORTED_CURRENCIES, type BankAccountRow as DbBankAccountRow, type SupportedCurrency } from "@/lib/bank-accounts";

interface FormBankAccountRow {
  id: number;
  site_slug: string;
  currency: string;
  label: string;
  symbol: string;
  beneficiary: string;
  company_address: string;
  bank_name: string;
  account: string;
  swift: string;
  bank_address: string;
  iban?: string;
  bank_country?: string;
  routing_number?: string;
  cnaps?: string;
  intermediary_bank?: string;
  notes?: string;
  updated_at: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

interface FormState {
  row: FormBankAccountRow;
  dirty: boolean;
  saveState: SaveState;
  errorMsg: string | null;
}

const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  usd: "US Dollar",
  eur: "Euro",
  gbp: "British Pound",
  cny: "Chinese Yuan (RMB)",
};

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  cny: "¥",
};

function emptyBankAccount(currency: SupportedCurrency): FormBankAccountRow {
  return {
    id: 0,
    site_slug: "chinarhinestone",
    currency,
    label: `${currency.toUpperCase()} — ${CURRENCY_LABELS[currency]}`,
    symbol: CURRENCY_SYMBOLS[currency],
    beneficiary: "",
    company_address: "",
    bank_name: "",
    account: "",
    swift: "",
    bank_address: "",
    iban: undefined,
    bank_country: undefined,
    routing_number: undefined,
    cnaps: undefined,
    intermediary_bank: undefined,
    notes: undefined,
    updated_at: new Date().toISOString(),
  };
}

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-[200px_1fr] md:items-start md:gap-4">
      <label className="pt-1 text-xs font-black uppercase tracking-wide text-black/70">
        {label}
      </label>
      <div>
        {children}
        {hint && <p className="mt-1 text-[11px] text-black/50">{hint}</p>}
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  mono,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
  readOnly?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full border-2 border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-[#ff4d00] ${
        readOnly ? "cursor-not-allowed bg-black/5 text-black/70" : ""
      } ${
        mono ? "font-mono" : ""
      }`}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 2,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      readOnly={readOnly}
      className={`w-full border-2 border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-[#ff4d00] ${
        readOnly ? "cursor-not-allowed bg-black/5 text-black/70" : ""
      }`}
    />
  );
}

function NullableTextInput({
  value,
  onChange,
  placeholder,
  mono,
  readOnly,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  placeholder?: string;
  mono?: boolean;
  readOnly?: boolean;
}) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full border-2 border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition-colors focus:border-[#ff4d00] ${
        readOnly ? "cursor-not-allowed bg-black/5 text-black/70" : ""
      } ${
        mono ? "font-mono" : ""
      }`}
    />
  );
}

function CurrencyCard({
  currency,
  state,
  onChange,
  onSave,
  onReset,
  readOnly,
}: {
  currency: SupportedCurrency;
  state: FormState;
  onChange: (next: FormBankAccountRow) => void;
  onSave: () => void;
  onReset: () => void;
  readOnly?: boolean;
}) {
  const row = state.row;
  const setField = <K extends keyof FormBankAccountRow>(k: K, v: FormBankAccountRow[K]) =>
    onChange({ ...row, [k]: v });

  return (
    <section className="border-2 border-black bg-white">
      <header className="flex items-center justify-between gap-3 border-b-2 border-black bg-[#faf9f6] px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-black font-black text-white">
            {row.symbol}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-black/50">
              {currency.toUpperCase()} — {CURRENCY_LABELS[currency]}
            </div>
            <h2 className="text-lg font-black uppercase leading-none tracking-tight">
              Bank Info — {currency.toUpperCase()}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state.saveState === "saved" && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
          {state.dirty && state.saveState !== "saved" && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Modified
            </span>
          )}
          {state.saveState === "error" && state.errorMsg && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700">
              <AlertCircle className="h-4 w-4" />
              {state.errorMsg}
            </span>
          )}
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={onReset}
                disabled={!state.dirty || state.saveState === "saving"}
                title="Discard unsaved changes and reload the saved values"
                className="inline-flex items-center gap-2 border-2 border-black/30 bg-white px-4 py-2 text-sm font-black uppercase tracking-wider text-black transition-all hover:border-black hover:bg-black/5 disabled:cursor-not-allowed disabled:border-black/10 disabled:text-black/30"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!state.dirty || state.saveState === "saving"}
                className="inline-flex items-center gap-2 border-2 border-black bg-[#ff4d00] px-4 py-2 text-sm font-black uppercase tracking-wider text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/10 disabled:text-black/40"
              >
                {state.saveState === "saving" ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
            </>
          )}
          {readOnly && (
            <span
              className="inline-flex items-center gap-1 border border-black/30 bg-black/5 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black/60"
              title="Bank accounts are managed in the shared BANK Supabase"
            >
              Read-only
            </span>
          )}
        </div>
      </header>

      <div className="space-y-3 p-5">
        <FieldRow label="Label">
          <TextInput
            value={row.label}
            onChange={(v) => setField("label", v)}
            placeholder={`${currency.toUpperCase()} — ${CURRENCY_LABELS[currency]}`}
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Symbol">
          <TextInput
            value={row.symbol}
            onChange={(v) => setField("symbol", v)}
            placeholder={CURRENCY_SYMBOLS[currency]}
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Beneficiary" hint="Name on the receiving account — must match corporate registration.">
          <TextInput
            value={row.beneficiary}
            onChange={(v) => setField("beneficiary", v)}
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Beneficiary address (company_address)">
          <TextArea
            value={row.company_address}
            onChange={(v) => setField("company_address", v)}
            rows={2}
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Bank name">
          <TextInput
            value={row.bank_name}
            onChange={(v) => setField("bank_name", v)}
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Account number / IBAN">
          <TextInput
            value={row.account}
            onChange={(v) => setField("account", v)}
            mono
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="SWIFT / BIC">
          <TextInput
            value={row.swift}
            onChange={(v) => setField("swift", v)}
            mono
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Bank address">
          <TextArea
            value={row.bank_address}
            onChange={(v) => setField("bank_address", v)}
            rows={2}
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="IBAN" hint="EUR accounts only. Leave blank for other currencies.">
          <NullableTextInput
            value={row.iban}
            onChange={(v) => setField("iban", v)}
            mono
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Bank country (ISO-3166-1 alpha-2)">
          <NullableTextInput
            value={row.bank_country}
            onChange={(v) => setField("bank_country", v)}
            placeholder="e.g. CN, US, DE"
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Routing number" hint="USD wires via Fed/ACH only.">
          <NullableTextInput
            value={row.routing_number}
            onChange={(v) => setField("routing_number", v)}
            mono
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="CNAPS" hint="CNY domestic wires only.">
          <NullableTextInput
            value={row.cnaps}
            onChange={(v) => setField("cnaps", v)}
            mono
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Intermediary bank" hint="Optional — some corridors require one.">
          <NullableTextInput
            value={row.intermediary_bank}
            onChange={(v) => setField("intermediary_bank", v)}
            readOnly={readOnly}
          />
        </FieldRow>

        <FieldRow label="Notes" hint="Shown on the PI under Bank Info.">
          <TextArea
            value={row.notes ?? ""}
            onChange={(v) => setField("notes", v === "" ? undefined : v)}
            rows={3}
            readOnly={readOnly}
          />
        </FieldRow>

        <div className="border-t border-black/10 pt-3 text-[11px] text-black/50">
          Last updated: {new Date(row.updated_at).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </section>
  );
}

export default function BankAccountsClient() {
  const [forms, setForms] = useState<Record<SupportedCurrency, FormState> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [bankSource, setBankSource] = useState<string>("unknown");

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bank-accounts", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        ok: boolean;
        accounts?: DbBankAccountRow[];
        bankSource?: string;
        readOnly?: boolean;
      };
      const rows = data.accounts ?? [];
      setReadOnly(Boolean(data.readOnly));
      setBankSource(data.bankSource ?? "unknown");
      const next: Record<SupportedCurrency, FormState> = {} as Record<SupportedCurrency, FormState>;
      for (const c of SUPPORTED_CURRENCIES) {
        const dbRow = rows.find((r) => r.currency === c);
        if (dbRow) {
          const formRow: FormBankAccountRow = {
            id: dbRow.id,
            site_slug: dbRow.site_slug,
            currency: dbRow.currency,
            label: dbRow.label,
            symbol: dbRow.symbol,
            beneficiary: dbRow.beneficiary,
            company_address: dbRow.company_address,
            bank_name: dbRow.bank_name,
            account: dbRow.account,
            swift: dbRow.swift,
            bank_address: dbRow.bank_address,
            iban: dbRow.iban ?? undefined,
            bank_country: dbRow.bank_country ?? undefined,
            routing_number: dbRow.routing_number ?? undefined,
            cnaps: dbRow.cnaps ?? undefined,
            intermediary_bank: dbRow.intermediary_bank ?? undefined,
            notes: dbRow.notes ?? undefined,
            updated_at: dbRow.updated_at ?? "",
          };
          next[c] = { row: formRow, dirty: false, saveState: "idle", errorMsg: null };
        } else {
          next[c] = { row: emptyBankAccount(c), dirty: false, saveState: "idle", errorMsg: null };
        }
      }
      setForms(next);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load bank accounts");
    }
  }, []);

  useEffect(() => {
    void fetchAll();
  }, [fetchAll]);

  const handleChange = (currency: SupportedCurrency, next: FormBankAccountRow) => {
    if (!forms) return;
    setForms({
      ...forms,
      [currency]: { ...forms[currency], row: next, dirty: true, saveState: "idle", errorMsg: null },
    });
  };

  const handleReset = async (currency: SupportedCurrency) => {
    if (!forms) return;
    try {
      const res = await fetch("/api/admin/bank-accounts", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { ok: boolean; accounts?: DbBankAccountRow[] };
      const rows = data.accounts ?? [];
      const dbRow = rows.find((r) => r.currency?.toLowerCase() === currency.toLowerCase());
      if (!dbRow) return;
      const fresh: FormBankAccountRow = {
        id: dbRow.id,
        site_slug: dbRow.site_slug,
        currency: dbRow.currency,
        label: dbRow.label,
        symbol: dbRow.symbol,
        beneficiary: dbRow.beneficiary,
        company_address: dbRow.company_address,
        bank_name: dbRow.bank_name,
        account: dbRow.account,
        swift: dbRow.swift,
        bank_address: dbRow.bank_address,
        iban: dbRow.iban ?? undefined,
        bank_country: dbRow.bank_country ?? undefined,
        routing_number: dbRow.routing_number ?? undefined,
        cnaps: dbRow.cnaps ?? undefined,
        intermediary_bank: dbRow.intermediary_bank ?? undefined,
        notes: dbRow.notes ?? undefined,
        updated_at: dbRow.updated_at ?? "",
      };
      setForms({
        ...forms,
        [currency]: { row: fresh, dirty: false, saveState: "idle", errorMsg: null },
      });
    } catch {
      // best-effort; silent
    }
  };

  const handleSave = async (currency: SupportedCurrency) => {
    if (!forms) return;
    const current = forms[currency];

    const requiredFields: { key: keyof FormBankAccountRow; label: string }[] = [
      { key: "label", label: "Label" },
      { key: "symbol", label: "Symbol" },
      { key: "beneficiary", label: "Beneficiary" },
      { key: "company_address", label: "Beneficiary address (company_address)" },
      { key: "bank_name", label: "Bank name" },
      { key: "account", label: "Account number / IBAN" },
      { key: "swift", label: "SWIFT / BIC" },
      { key: "bank_address", label: "Bank address" },
    ];
    const missing = requiredFields
      .filter(({ key }) => !current.row[key] || String(current.row[key]).trim() === "")
      .map(({ label }) => label);
    if (missing.length > 0) {
      setForms({
        ...forms,
        [currency]: {
          ...current,
          saveState: "error",
          errorMsg: `Required field(s) empty: ${missing.join(", ")}`,
        },
      });
      return;
    }

    setForms({
      ...forms,
      [currency]: { ...current, saveState: "saving", errorMsg: null },
    });
    try {
      const r = current.row;
      const res = await fetch("/api/admin/bank-accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currency: r.currency,
          label: r.label,
          symbol: r.symbol,
          beneficiary: r.beneficiary,
          company_address: r.company_address,
          bank_name: r.bank_name,
          account: r.account,
          swift: r.swift,
          bank_address: r.bank_address,
          iban: r.iban,
          bank_country: r.bank_country,
          routing_number: r.routing_number,
          cnaps: r.cnaps,
          intermediary_bank: r.intermediary_bank,
          notes: r.notes,
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }
      await fetchAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setForms({
        ...forms,
        [currency]: { ...current, saveState: "error", errorMsg: msg },
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="border-b-2 border-black bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#0a0a0a] font-black text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#6b6b6b]">
                Internal · Sales Team
              </div>
              <div className="text-lg font-black leading-none">Bank Account Management</div>
            </div>
          </div>
          <Link
            href="/administered/"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-black hover:text-[#ff4d00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Hero */}
        <div className="mb-8">
          <h1 className="mb-3 text-4xl font-black uppercase leading-tight tracking-tight md:text-5xl">
            Receiving Accounts
          </h1>
          <p className="max-w-3xl text-base text-[#6b6b6b]">
            {readOnly
              ? "Bank accounts are sourced from the shared BANK Supabase (sublimapparel-owned). Updates there flow into every site automatically."
              : "Each PI shows the bank account that matches the customer's currency. Edit any field below and Save — the change flows into every new PI's Bank Info block immediately."}
          </p>
        </div>

        {readOnly && (
          <div className="mb-6 flex items-start gap-2 border-2 border-amber-700 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <strong className="font-black">Read-only mode:</strong> bank accounts
              are managed in the shared BANK Supabase{" "}
              <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
                {bankSource}
              </code>
              . To update, edit the BANK DB directly or use sublimapparel&apos;s
              admin.
            </div>
          </div>
        )}

        {loadError && (
          <div className="mb-6 flex items-start gap-2 border-2 border-red-700 bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <strong className="font-black">Failed to load:</strong> {loadError}
            </div>
          </div>
        )}

        {!forms ? (
          <div className="border-2 border-black bg-white p-10 text-center text-base font-bold uppercase tracking-widest text-black/50">
            Loading bank accounts…
          </div>
        ) : (
          <div className="space-y-6">
            {SUPPORTED_CURRENCIES.map((c) => (
              <CurrencyCard
                key={c}
                currency={c}
                state={forms[c]}
                onChange={(next) => handleChange(c, next)}
                onSave={() => handleSave(c)}
                onReset={() => handleReset(c)}
                readOnly={readOnly}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
