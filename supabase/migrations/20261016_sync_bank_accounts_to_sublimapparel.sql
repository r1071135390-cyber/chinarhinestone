-- supabase/migrations/20261016_sync_bank_accounts_to_sublimapparel.sql
--
-- Corrects the chinarhinestone bank account rows to the REAL factory
-- accounts from the shared BANK Supabase project (viyqjlfdguhycbvqbrny,
-- site_slug='sublimapparel'), read live on 2026-10-26.
--
-- The first version of this file wrote placeholder values (Agricultural
-- Bank of China for every currency, account 19648014040108531). Running
-- it again now overwrites those with the real accounts.
--
-- 20261014_chinarhinestone_pi.sql now seeds the same values with
-- ON CONFLICT ... DO UPDATE, so running that file alone is enough.
-- Run this too if you already ran the old version of this file.
--
-- Run in the Supabase SQL Editor of project zxobbdaqzkbfaoyahggz.

-- 0. Free tier workaround — must run BEFORE any long DML on free tier
ALTER ROLE service_role SET statement_timeout = 0;

-- 1. USD — JPMorgan Chase Bank, N.A. New York Branch
UPDATE public.bank_accounts SET
  label              = 'USD — US Dollar',
  symbol             = '$',
  beneficiary        = 'YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD',
  company_address    = '2nd Floor, No.11 Anshang Road, Yiwu City, China',
  bank_name          = 'JPMorgan Chase Bank, N.A. New York Branch',
  account            = '30000005242662',
  swift              = 'CHASUS33',
  bank_address       = '270 Park Ave. New York, NY 10017',
  iban               = NULL,
  bank_country       = 'US',
  routing_number     = '028000024(ACH) / 021000021(WIRE)',
  cnaps              = NULL,
  intermediary_bank  = NULL,
  intermediary_swift = NULL,
  notes              = 'Add reference: PI number (e.g. SA202610020002).',
  updated_at         = NOW()
WHERE site_slug = 'chinarhinestone' AND currency = 'USD';

-- 2. EUR — World First Netherlands B.V.
UPDATE public.bank_accounts SET
  label              = 'EUR — Euro',
  symbol             = '€',
  beneficiary        = 'YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD',
  company_address    = '2nd Floor, No.11 Anshang Road, Yiwu City, China',
  bank_name          = 'World First Netherlands B.V.',
  account            = 'NL39WOFT2010007024',
  swift              = 'WOFTNL22',
  bank_address       = 'Herengract 448, Amsterdam, 1017 CA, Netherlands',
  iban               = 'NL39WOFT2010007024',
  bank_country       = 'NL',
  routing_number     = NULL,
  cnaps              = NULL,
  intermediary_bank  = NULL,
  intermediary_swift = NULL,
  notes              = 'EUR wires may route via intermediary bank. Sender''s bank may charge a fee; we receive net only.',
  updated_at         = NOW()
WHERE site_slug = 'chinarhinestone' AND currency = 'EUR';

-- 3. GBP — Agricultural Bank of China, Zhejiang Branch
UPDATE public.bank_accounts SET
  label              = 'GBP — British Pound',
  symbol             = '£',
  beneficiary        = 'YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD',
  company_address    = '2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China',
  bank_name          = 'Agricultural Bank of China, Zhejiang Branch',
  account            = '19648014040108531',
  swift              = 'ABOCCNBJ110',
  bank_address       = 'No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China',
  iban               = NULL,
  bank_country       = 'CN',
  routing_number     = NULL,
  cnaps              = NULL,
  intermediary_bank  = NULL,
  intermediary_swift = NULL,
  notes              = 'GBP wires via SWIFT; please add PI number in the wire reference.',
  updated_at         = NOW()
WHERE site_slug = 'chinarhinestone' AND currency = 'GBP';

-- 4. CNY — 中国农业银行浙江省分行
UPDATE public.bank_accounts SET
  label              = 'CNY — Chinese Yuan (RMB)',
  symbol             = '¥',
  beneficiary        = '义乌市好梦家居用品制造有限公司',
  company_address    = '浙江省义乌市安商路11号二楼',
  bank_name          = '中国农业银行浙江省分行',
  account            = '19648014040108531',
  swift              = 'ABOCCNBJ110',
  bank_address       = '浙江省金华市义乌市宾王路181号',
  iban               = NULL,
  bank_country       = 'CN',
  routing_number     = NULL,
  cnaps              = '103338671188',
  intermediary_bank  = NULL,
  intermediary_swift = NULL,
  notes              = '国内人民币电汇请使用CNAPS代码103338671188。',
  updated_at         = NOW()
WHERE site_slug = 'chinarhinestone' AND currency = 'CNY';

-- 5. Verify — these must match the BANK project exactly
SELECT currency, beneficiary, bank_name, account, swift, iban, routing_number, cnaps
FROM public.bank_accounts
WHERE site_slug = 'chinarhinestone'
ORDER BY currency;
