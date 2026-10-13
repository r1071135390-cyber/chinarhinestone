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
