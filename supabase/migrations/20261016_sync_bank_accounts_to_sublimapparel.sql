-- supabase/migrations/20261016_sync_bank_accounts_to_sublimapparel.sql
--
-- Sync chinarhinestone bank account rows to match sublimapparel exactly.
-- Owner confirmed chinarhinestone is the same factory; bank info is identical.
--
-- Run this in the Supabase SQL Editor after applying earlier migrations.

-- 0. Free tier workaround — must run BEFORE any long DML on free tier
ALTER ROLE service_role SET statement_timeout = 0;

-- 1. USD
UPDATE public.bank_accounts SET
  label             = 'USD — US Dollar',
  symbol            = '$',
  beneficiary       = 'YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD',
  company_address   = '2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China',
  bank_name         = 'Agricultural Bank of China, Zhejiang Branch',
  account           = '19648014040108531',
  swift             = 'ABOCCNBJ110',
  bank_address      = 'No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China',
  routing_number    = NULL,
  cnaps             = NULL,
  intermediary_bank = NULL,
  intermediary_swift = NULL,
  notes             = 'Add reference: PI number (e.g. CR202610020002).',
  updated_at        = NOW()
WHERE site_slug = 'chinarhinestone' AND currency = 'USD';

-- 2. EUR
UPDATE public.bank_accounts SET
  label             = 'EUR — Euro',
  symbol            = '€',
  beneficiary       = 'YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD',
  company_address   = '2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China',
  bank_name         = 'Agricultural Bank of China, Zhejiang Branch',
  account           = '19648014040108531',
  swift             = 'ABOCCNBJ110',
  bank_address      = 'No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China',
  routing_number    = NULL,
  cnaps             = NULL,
  intermediary_bank = NULL,
  intermediary_swift = NULL,
  notes             = 'EUR wires may route via intermediary bank. Sender''s bank may charge a fee; we receive net only.',
  updated_at        = NOW()
WHERE site_slug = 'chinarhinestone' AND currency = 'EUR';

-- 3. GBP
UPDATE public.bank_accounts SET
  label             = 'GBP — British Pound',
  symbol            = '£',
  beneficiary       = 'YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD',
  company_address   = '2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China',
  bank_name         = 'Agricultural Bank of China, Zhejiang Branch',
  account           = '19648014040108531',
  swift             = 'ABOCCNBJ110',
  bank_address      = 'No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China',
  routing_number    = NULL,
  cnaps             = NULL,
  intermediary_bank = NULL,
  intermediary_swift = NULL,
  notes             = 'GBP wires via SWIFT; please add PI number in the wire reference.',
  updated_at        = NOW()
WHERE site_slug = 'chinarhinestone' AND currency = 'GBP';

-- 4. CNY
UPDATE public.bank_accounts SET
  label             = 'CNY — Chinese Yuan (RMB)',
  symbol            = '¥',
  beneficiary       = '义乌市好梦家居用品制造有限公司',
  company_address   = '浙江省义乌市安商路11号二楼',
  bank_name         = '中国农业银行浙江省分行',
  account           = '19648014040108531',
  swift             = 'ABOCCNBJ110',
  bank_address      = '浙江省金华市义乌市宾王路181号',
  routing_number    = NULL,
  cnaps             = '103338671188',
  intermediary_bank = NULL,
  intermediary_swift = NULL,
  notes             = '国内人民币电汇请使用CNAPS代码103338671188。',
  updated_at        = NOW()
WHERE site_slug = 'chinarhinestone' AND currency = 'CNY';

-- 5. Verify
SELECT currency, beneficiary, account, swift, bank_name
FROM public.bank_accounts
WHERE site_slug = 'chinarhinestone'
ORDER BY currency;
