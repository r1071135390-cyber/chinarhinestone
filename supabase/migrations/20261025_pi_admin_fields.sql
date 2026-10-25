-- supabase/migrations/20261025_pi_admin_fields.sql
--
-- Adds the extra Proforma Invoice metadata the admin "New PI" form collects
-- (issue date, lead time, shipping label / method / qty).
--
-- Why: the 20261014 schema was copied from sublimapparel's table, which did
-- not have these fields. The admin form has always had them, so they were
-- being dropped on save.
--
-- Run this in the Supabase SQL Editor (project zxobbdaqzkbfaoyahggz).
-- The create endpoint degrades gracefully if it has not been run yet.

-- 0. Free tier workaround — prevents statement_timeout from killing DDL.
ALTER ROLE service_role SET statement_timeout = 0;

-- 1. Extra PI columns
ALTER TABLE public.proforma_invoices
  ADD COLUMN IF NOT EXISTS issue_date      DATE,
  ADD COLUMN IF NOT EXISTS lead_time_text  TEXT,
  ADD COLUMN IF NOT EXISTS shipping_label  TEXT,
  ADD COLUMN IF NOT EXISTS shipping_method TEXT,
  ADD COLUMN IF NOT EXISTS shipping_qty     NUMERIC;

-- 2. PI number generator — widen the sequence scan so it only looks at
--    numbers in the CH-YYYYMMDD-NNNN shape. Older rows used CRYYYYMMDDNNNN,
--    whose 3rd dash-segment is not numeric and would break the CAST.
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
    AND pi_number ~ ('^' || prefix || '-' || today_str || '-[0-9]+$')
    AND site_slug = 'chinarhinestone';

  RETURN prefix || '-' || today_str || '-' || lpad(seq::text, 4, '0');
END;
$$;
