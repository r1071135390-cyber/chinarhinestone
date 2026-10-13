export type SupportedCurrency = "usd" | "eur" | "gbp" | "cny";

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ["usd", "eur", "gbp", "cny"];

export interface BankAccount {
  id: string;
  currency: string;
  beneficiary_name: string;
  bank_name: string;
  bank_address: string;
  account_number: string;
  swift_code: string;
  intermediary_bank?: string;
  intermediary_swift?: string;
  is_active: boolean;
}

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "ba-usd-001",
    currency: "USD",
    beneficiary_name: "Yiwu HomeDorm Commodity Manufacturing Co., Ltd.",
    bank_name: "Bank of China, Yiwu Branch",
    bank_address: "No. 168 Mid Yangdong Road, Yiwu, Zhejiang, China",
    account_number: "1234567890123456",
    swift_code: "BKCHCNBJ95N",
    is_active: true,
  },
  {
    id: "ba-eur-001",
    currency: "EUR",
    beneficiary_name: "Yiwu HomeDorm Commodity Manufacturing Co., Ltd.",
    bank_name: "Bank of China, Yiwu Branch",
    bank_address: "No. 168 Mid Yangdong Road, Yiwu, Zhejiang, China",
    account_number: "1234567890123457",
    swift_code: "BKCHCNBJ95N",
    intermediary_bank: "Bank of America, New York",
    intermediary_swift: "BOFAUS3N",
    is_active: true,
  },
  {
    id: "ba-cny-001",
    currency: "CNY",
    beneficiary_name: "义乌市豪多商品制造有限公司",
    bank_name: "中国银行义乌支行",
    bank_address: "中国浙江省义乌市稠州中路168号",
    account_number: "1234567890123458",
    swift_code: "BKCHCNBJ95N",
    is_active: true,
  },
];

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
  iban?: string;
  bank_country?: string;
  routing_number?: string;
  cnaps?: string;
  intermediary_bank?: string;
  intermediary_swift?: string;
  notes?: string;
  updated_at: string;
}

/** Convert Supabase snake_case row → client camelCase BankAccount shape */
export function bankAccountFromRow(row: BankAccountRow): BankAccount {
  return {
    id: String(row.id),
    currency: row.currency,
    beneficiary_name: row.beneficiary,
    bank_name: row.bank_name,
    bank_address: row.bank_address,
    account_number: row.account,
    swift_code: row.swift,
    intermediary_bank: row.intermediary_bank,
    intermediary_swift: row.intermediary_swift,
    is_active: true,
  };
}
