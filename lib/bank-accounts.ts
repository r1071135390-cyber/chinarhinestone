/**
 * lib/bank-accounts.ts
 *
 * Single source of truth for the factory's bank accounts.
 *
 * The values below are copied verbatim from the shared BANK Supabase
 * (project viyqjlfdguhycbvqbrny, table bank_accounts, site_slug =
 * 'sublimapparel') — the same factory that sublimapparel.com and
 * oemtshirts.com pay into. They are the REAL account numbers; do not
 * replace them with placeholders.
 *
 * At runtime the app reads the live rows from the BANK project
 * (/api/admin/bank-accounts) and falls back to this table when the BANK
 * project is not configured.
 *
 * Two shapes live here on purpose:
 *   - BankAccount     snake_case, the PI-document display contract
 *                     (components/pi/PIDisplay.tsx + GET /api/pi/:pi_number)
 *   - BankAccountInfo camelCase, the admin editor contract
 *                     (app/administered/new-pi, app/administered/edit-pi)
 */

export type SupportedCurrency = "usd" | "eur" | "gbp" | "cny";

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ["usd", "eur", "gbp", "cny"];

/**
 * Display contract for the PI document. Field names match the JSON that
 * GET /api/pi/:pi_number returns, so /pay can hand it straight to
 * <PIDisplay />.
 */
export interface BankAccount {
  id: string;
  currency: string;
  label?: string;
  symbol?: string;
  beneficiary_name: string;
  company_address?: string;
  bank_name: string;
  bank_address: string;
  account_number: string;
  swift_code: string;
  cnaps?: string;
  iban?: string;
  bank_country?: string;
  routing_number?: string;
  intermediary_bank?: string;
  intermediary_swift?: string;
  notes?: string;
  is_active: boolean;
}

/** Admin editor contract (camelCase). */
export interface BankAccountInfo {
  currency: string;
  label: string;
  symbol: string;
  beneficiary: string;
  companyAddress: string;
  bankName: string;
  account: string;
  swift: string;
  bankAddress: string;
  iban?: string;
  bankCountry?: string;
  routingNumber?: string;
  cnaps?: string;
  intermediaryBank?: string;
  notes?: string;
}

/** A row of the Supabase `bank_accounts` table. */
export interface BankAccountRow {
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
  iban?: string | null;
  bank_country?: string | null;
  routing_number?: string | null;
  cnaps?: string | null;
  intermediary_bank?: string | null;
  notes?: string | null;
  updated_at?: string;
}

export const BANK_ACCOUNTS: Record<SupportedCurrency, BankAccountInfo> = {
  usd: {
    currency: "usd",
    label: "USD — US Dollar",
    symbol: "$",
    beneficiary: "YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD",
    companyAddress: "2nd Floor, No.11 Anshang Road, Yiwu City, China",
    bankName: "JPMorgan Chase Bank, N.A. New York Branch",
    account: "30000005242662",
    swift: "CHASUS33",
    bankAddress: "270 Park Ave. New York, NY 10017",
    bankCountry: "US",
    routingNumber: "028000024(ACH) / 021000021(WIRE)",
    notes: "Add reference: PI number (e.g. SA202610020002).",
  },
  eur: {
    currency: "eur",
    label: "EUR — Euro",
    symbol: "€",
    beneficiary: "YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD",
    companyAddress: "2nd Floor, No.11 Anshang Road, Yiwu City, China",
    bankName: "World First Netherlands B.V.",
    account: "NL39WOFT2010007024",
    swift: "WOFTNL22",
    bankAddress: "Herengract 448, Amsterdam, 1017 CA, Netherlands",
    iban: "NL39WOFT2010007024",
    bankCountry: "NL",
    notes: "EUR wires may route via intermediary bank. Sender's bank may charge a fee; we receive net only.",
  },
  gbp: {
    currency: "gbp",
    label: "GBP — British Pound",
    symbol: "£",
    beneficiary: "YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD",
    companyAddress: "2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China",
    bankName: "Agricultural Bank of China, Zhejiang Branch",
    account: "19648014040108531",
    swift: "ABOCCNBJ110",
    bankAddress: "No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China",
    bankCountry: "CN",
    notes: "GBP wires via SWIFT; please add PI number in the wire reference.",
  },
  cny: {
    currency: "cny",
    label: "CNY — Chinese Yuan (RMB)",
    symbol: "¥",
    beneficiary: "义乌市好梦家居用品制造有限公司",
    companyAddress: "浙江省义乌市安商路11号二楼",
    bankName: "中国农业银行浙江省分行",
    account: "19648014040108531",
    swift: "ABOCCNBJ110",
    bankAddress: "浙江省金华市义乌市宾王路181号",
    bankCountry: "CN",
    cnaps: "103338671188",
    notes: "国内人民币电汇请使用CNAPS代码103338671188。",
  },
};

export function getBankAccount(currency: string | null | undefined): BankAccountInfo {
  const key = (currency ?? "usd").toLowerCase() as SupportedCurrency;
  return BANK_ACCOUNTS[key] ?? BANK_ACCOUNTS.usd;
}

/** Convert a Supabase snake_case row → the admin editor camelCase shape. */
export function bankAccountFromRow(
  row: BankAccountRow | null | undefined,
  currency: string,
): BankAccountInfo {
  const fallback = getBankAccount(currency);
  if (!row) return fallback;
  return {
    currency: row.currency,
    label: row.label,
    symbol: row.symbol,
    beneficiary: row.beneficiary,
    companyAddress: row.company_address,
    bankName: row.bank_name,
    account: row.account,
    swift: row.swift,
    bankAddress: row.bank_address,
    iban: row.iban ?? undefined,
    bankCountry: row.bank_country ?? undefined,
    routingNumber: row.routing_number ?? undefined,
    cnaps: row.cnaps ?? undefined,
    intermediaryBank: row.intermediary_bank ?? undefined,
    notes: row.notes ?? undefined,
  };
}

/**
 * Convert the public API's snake_case bank payload → the camelCase shape
 * the PI document renders. Missing optional fields fall back to the
 * hardcoded table so the document is never half-empty.
 */
export function bankAccountInfoFromDisplay(
  row: BankAccount | null | undefined,
  currency?: string,
): BankAccountInfo {
  const cur = (row?.currency ?? currency ?? "usd").toLowerCase();
  const fallback = getBankAccount(cur);
  if (!row) return fallback;
  return {
    currency: row.currency || fallback.currency,
    label: row.label || fallback.label,
    symbol: row.symbol || fallback.symbol,
    beneficiary: row.beneficiary_name || fallback.beneficiary,
    companyAddress: row.company_address || fallback.companyAddress,
    bankName: row.bank_name || fallback.bankName,
    account: row.account_number || fallback.account,
    swift: row.swift_code || fallback.swift,
    bankAddress: row.bank_address || fallback.bankAddress,
    iban: row.iban ?? fallback.iban,
    bankCountry: row.bank_country ?? fallback.bankCountry,
    routingNumber: row.routing_number ?? fallback.routingNumber,
    cnaps: row.cnaps ?? fallback.cnaps,
    intermediaryBank: row.intermediary_bank ?? fallback.intermediaryBank,
    notes: row.notes ?? fallback.notes,
  };
}
