-- supabase/migrations/20261014_chinarhinestone_pi.sql
--
-- Schema for chinarhinestone.com PI + bank-accounts.
-- Reuses the same Supabase project as sublimapparel.com, isolated by
-- site_slug = 'chinarhinestone'. Each table has a CHECK constraint to
-- whitelist allowed site slugs.
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

-- 1. Site slug enum (extends if new sites are added later).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'site_slug') THEN
    CREATE TYPE site_slug AS ENUM ('sublimapparel', 'chinarhinestone');
  END IF;
END$$;

-- If the enum already exists but is missing chinarhinestone, add it.
-- (ALTER TYPE ADD VALUE cannot run inside a transaction block, hence
-- the EXCEPTION block — we don't care if it's already present.)
BEGIN;
  ALTER TYPE site_slug ADD VALUE IF NOT EXISTS 'chinarhinestone';
COMMIT;

-- 2. bank_accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id                BIGSERIAL PRIMARY KEY,
  site_slug         site_slug NOT NULL DEFAULT 'chinarhinestone',
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

-- 3. proforma_invoices table
CREATE TABLE IF NOT EXISTS public.proforma_invoices (
  id                        BIGSERIAL PRIMARY KEY,
  pi_number                 TEXT      NOT NULL,
  site_slug                 site_slug NOT NULL DEFAULT 'chinarhinestone',
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

CREATE INDEX IF NOT EXISTS idx_pi_site_status
  ON public.proforma_invoices (site_slug, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pi_stripe_intent
  ON public.proforma_invoices (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

ALTER TABLE public.proforma_invoices ENABLE ROW LEVEL SECURITY;

-- Public (anon) can read SENT + PAID invoices only — needed for /pay?pi=... page
DROP POLICY IF EXISTS "pi_public_read" ON public.proforma_invoices;
CREATE POLICY "pi_public_read" ON public.proforma_invoices
  FOR SELECT TO anon
  USING (site_slug = 'chinarhinestone' AND status IN ('sent', 'paid'));

-- Public (anon) can flip sent → awaiting_payment via /api/pi/confirm-bank
-- (we do this server-side with service_role instead, so anon has no UPDATE policy)
DROP POLICY IF EXISTS "pi_no_anon_write" ON public.proforma_invoices;
CREATE POLICY "pi_no_anon_write" ON public.proforma_invoices
  FOR INSERT TO anon WITH CHECK (false);
DROP POLICY IF EXISTS "pi_no_anon_update" ON public.proforma_invoices;
CREATE POLICY "pi_no_anon_update" ON public.proforma_invoices
  FOR UPDATE TO anon USING (false) WITH CHECK (false);

-- 4. PI number generator RPC
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
  WHERE pi_number LIKE prefix || '-' || today_str || '-%';

  RETURN prefix || '-' || today_str || '-' || lpad(seq::text, 4, '0');
END;
$$;

-- 5. Seed chinarhinestone bank accounts (4 currencies).
-- Same data as sublimapparel — owner confirmed "reuse for now".
INSERT INTO public.bank_accounts
  (site_slug, currency, label, symbol, beneficiary, company_address,
   bank_name, account, swift, bank_address, intermediary_bank, intermediary_swift)
VALUES
  ('chinarhinestone', 'USD', 'USD — US Dollar', '$',
   'Yiwu HomeDorm Commodity Manufacturing Co., Ltd.',
   'No. 168 Mid Yangdong Road, Yiwu, Zhejiang, China',
   'Bank of China, Yiwu Branch', '1234567890123456', 'BKCHCNBJ95N',
   'No. 168 Mid Yangdong Road, Yiwu, Zhejiang, China', NULL, NULL),

  ('chinarhinestone', 'EUR', 'EUR — Euro', '€',
   'Yiwu HomeDorm Commodity Manufacturing Co., Ltd.',
   'No. 168 Mid Yangdong Road, Yiwu, Zhejiang, China',
   'Bank of China, Yiwu Branch', '1234567890123457', 'BKCHCNBJ95N',
   'No. 168 Mid Yangdong Road, Yiwu, Zhejiang, China',
   'Bank of America, New York', 'BOFAUS3N'),

  ('chinarhinestone', 'GBP', 'GBP — British Pound', '£',
   'Yiwu HomeDorm Commodity Manufacturing Co., Ltd.',
   'No. 168 Mid Yangdong Road, Yiwu, Zhejiang, China',
   'Bank of China, Yiwu Branch', '1234567890123458', 'BKCHCNBJ95N',
   'No. 168 Mid Yangdong Road, Yiwu, Zhejiang, China',
   'Barclays Bank PLC, London', 'BARCGB22'),

  ('chinarhinestone', 'CNY', 'CNY — Chinese Yuan (RMB)', '¥',
   '义乌市豪多商品制造有限公司',
   '中国浙江省义乌市稠州中路168号',
   '中国银行义乌支行', '1234567890123459', 'BKCHCNBJ95N',
   '中国浙江省义乌市稠州中路168号', NULL, NULL)
ON CONFLICT (site_slug, currency) DO NOTHING;
