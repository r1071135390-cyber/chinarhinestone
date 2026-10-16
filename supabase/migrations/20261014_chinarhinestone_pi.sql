-- supabase/migrations/20261014_chinarhinestone_pi.sql
--
-- Schema for chinarhinestone.com PI + bank-accounts.
-- Designed for an INDEPENDENT Supabase project (project ref: zxobbdaqzkbfaoyahggz),
-- not shared with sublimapparel.com. Each table is chinarhinestone-scoped.
--
-- Why no enum type:
--   The Supabase SQL Editor has a parser bug that fails on any DDL referencing
--   enum-typed columns (SELECT/ALTER/CREATE INDEX all throw "column
--   site_slug does not exist" — a misleading error). We use TEXT + CHECK
--   constraint instead. Functionally equivalent.
--
-- Run order in Supabase SQL Editor:
--   1) statement_timeout fix  (run once per project, per restore)
--   2) this file
--
-- Why these specific columns: see sublimapparel-proforma_invoices schema;
-- we keep the field set identical so the React PI components are
-- drop-in compatible.

-- 0. Free tier workaround — prevents statement_timeout from killing INSERTs.
ALTER ROLE service_role SET statement_timeout = 0;

-- 1. bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id                BIGSERIAL PRIMARY KEY,
  site_slug         TEXT      NOT NULL DEFAULT 'chinarhinestone'
                                     CHECK (site_slug IN ('sublimapparel', 'chinarhinestone')),
  currency          TEXT      NOT NULL,
  label             TEXT      NOT NULL,
  symbol            TEXT      NOT NULL DEFAULT '$',
  beneficiary       TEXT      NOT NULL,
  company_address   TEXT      NOT NULL DEFAULT '',
  bank_name         TEXT      NOT NULL,
  account           TEXT      NOT NULL,
  swift             TEXT      NOT NULL,
  bank_address      TEXT      NOT NULL DEFAULT '',
  iban              TEXT,
  bank_country      TEXT,
  routing_number    TEXT,
  cnaps             TEXT,
  intermediary_bank TEXT,
  intermediary_swift TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_slug, currency)
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Deny all from anon/authenticated; only service_role (server-side) reads/writes.
DROP POLICY IF EXISTS "bank_accounts_no_read" ON public.bank_accounts;
CREATE POLICY "bank_accounts_no_read" ON public.bank_accounts
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

-- 2. proforma_invoices table
CREATE TABLE IF NOT EXISTS public.proforma_invoices (
  id                        BIGSERIAL PRIMARY KEY,
  pi_number                 TEXT      NOT NULL,
  site_slug                 TEXT      NOT NULL DEFAULT 'chinarhinestone'
                                              CHECK (site_slug IN ('sublimapparel', 'chinarhinestone')),
  status                    TEXT      NOT NULL DEFAULT 'draft'
                                              CHECK (status IN ('draft', 'sent', 'awaiting_payment', 'paid', 'cancelled', 'refunded')),
  customer_name             TEXT,
  customer_email            TEXT,
  customer_phone            TEXT,
  customer_company          TEXT,
  customer_address          TEXT,
  customer_country          TEXT,
  currency                  TEXT      NOT NULL,
  line_items                JSONB     NOT NULL DEFAULT '[]'::jsonb,
  subtotal_cents            BIGINT,
  shipping_cents            BIGINT,
  total_cents               BIGINT,
  bank_account_currency     TEXT,
  payment_method            TEXT,
  notes                     TEXT,
  valid_until               TIMESTAMPTZ,
  paid_at                   TIMESTAMPTZ,
  refunded_at               TIMESTAMPTZ,
  stripe_payment_intent_id  TEXT,
  bank_transfer_reference   TEXT,
  bank_transfer_sender      TEXT,
  bank_transfer_marked_at   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_slug, pi_number)
);

CREATE INDEX IF NOT EXISTS idx_pi_site
  ON public.proforma_invoices (site_slug);

CREATE INDEX IF NOT EXISTS idx_pi_stripe_intent
  ON public.proforma_invoices (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

ALTER TABLE public.proforma_invoices ENABLE ROW LEVEL SECURITY;

-- Public (anon) can read SENT + PAID invoices only — needed for /pay?pi=... page
DROP POLICY IF EXISTS "pi_public_read" ON public.proforma_invoices;
CREATE POLICY "pi_public_read" ON public.proforma_invoices
  FOR SELECT TO anon
  USING (site_slug = 'chinarhinestone' AND status IN ('sent', 'paid'));

-- Public (anon) cannot insert or update — all writes go through service_role.
DROP POLICY IF EXISTS "pi_no_anon_write" ON public.proforma_invoices;
CREATE POLICY "pi_no_anon_write" ON public.proforma_invoices
  FOR INSERT TO anon WITH CHECK (false);
DROP POLICY IF EXISTS "pi_no_anon_update" ON public.proforma_invoices;
CREATE POLICY "pi_no_anon_update" ON public.proforma_invoices
  FOR UPDATE TO anon USING (false) WITH CHECK (false);

-- 3. PI number generator RPC
CREATE OR REPLACE FUNCTION public.next_pi_number(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  today_str TEXT := to_char(today, 'YYYYMMDD');
  seq INT;
BEGIN
  SELECT COALESCE(MAX(
    CAST(split_part(pi_number, '-', 3) AS INT)
  ), 0) + 1
  INTO seq
  FROM public.proforma_invoices
  WHERE pi_number LIKE prefix || '-' || today_str || '-%'
    AND site_slug = 'chinarhinestone';

  RETURN prefix || '-' || today_str || '-' || lpad(seq::text, 4, '0');
END;
$$;

-- 4. Seed chinarhinestone bank accounts (4 currencies).
-- Identical to sublimapparel.com's factory accounts (owner confirmed same factory).
INSERT INTO public.bank_accounts
  (site_slug, currency, label, symbol, beneficiary, company_address,
   bank_name, account, swift, bank_address, intermediary_bank, intermediary_swift, notes)
VALUES
  ('chinarhinestone', 'USD', 'USD — US Dollar', '$',
   'YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD',
   '2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China',
   'Agricultural Bank of China, Zhejiang Branch', '19648014040108531', 'ABOCCNBJ110',
   'No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China',
   NULL, NULL, 'Add reference: PI number (e.g. CR202610020002).'),

  ('chinarhinestone', 'EUR', 'EUR — Euro', '€',
   'YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD',
   '2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China',
   'Agricultural Bank of China, Zhejiang Branch', '19648014040108531', 'ABOCCNBJ110',
   'No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China',
   NULL, NULL, 'EUR wires may route via intermediary bank. Sender''s bank may charge a fee; we receive net only.'),

  ('chinarhinestone', 'GBP', 'GBP — British Pound', '£',
   'YIWU HOMEDORM COMMODITY MANUFACTURING CO.,LTD',
   '2nd Floor, No.11 Anshang Road, Yiwu City, Jinhua, Zhejiang Province, China',
   'Agricultural Bank of China, Zhejiang Branch', '19648014040108531', 'ABOCCNBJ110',
   'No. 181 Binwang Road, Yiwu City, Jinhua, Zhejiang Province, China',
   NULL, NULL, 'GBP wires via SWIFT; please add PI number in the wire reference.'),

  ('chinarhinestone', 'CNY', 'CNY — Chinese Yuan (RMB)', '¥',
   '义乌市好梦家居用品制造有限公司',
   '浙江省义乌市安商路11号二楼',
   '中国农业银行浙江省分行', '19648014040108531', 'ABOCCNBJ110',
   '浙江省金华市义乌市宾王路181号',
   NULL, NULL, '国内人民币电汇请使用CNAPS代码103338671188。')
ON CONFLICT (site_slug, currency) DO NOTHING;
