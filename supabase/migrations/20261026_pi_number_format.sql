-- 20261026_pi_number_format.sql
--
-- PI numbers become CR + YYYYMMDD + NNNN with no separators
-- (e.g. CR202610260001) — the same shape the factory uses on its other
-- sites (SA202610020002). They used to be CH-YYYYMMDD-NNNN.
--
-- Run this in the chinarhinestone Supabase SQL editor (project
-- zxobbdaqzkbfaoyahggz). It only redefines the generator; rows already
-- stored keep the number they were issued.

CREATE OR REPLACE FUNCTION public.next_pi_number(prefix TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  today_str TEXT := to_char(today, 'YYYYMMDD');
  seq INT;
BEGIN
  -- Only numbers in the exact CRYYYYMMDDNNNN shape take part in the
  -- sequence scan, so a row in any other format can never break the CAST.
  SELECT COALESCE(MAX(
    CAST(right(pi_number, 4) AS INT)
  ), 0) + 1
  INTO seq
  FROM public.proforma_invoices
  WHERE pi_number LIKE prefix || today_str || '%'
    AND pi_number ~ ('^' || prefix || today_str || '[0-9]{4}$')
    AND site_slug = 'chinarhinestone';

  RETURN prefix || today_str || lpad(seq::text, 4, '0');
END;
$$;

-- 2. Re-number rows that were issued under the old CH-YYYYMMDD-NNNN format.
--    Skipped for any row whose target number is already taken, so it can
--    never violate UNIQUE (site_slug, pi_number).
UPDATE public.proforma_invoices p
SET pi_number = regexp_replace(p.pi_number, '^CH-([0-9]{8})-([0-9]{4})$', 'CR\1\2')
WHERE p.site_slug = 'chinarhinestone'
  AND p.pi_number ~ '^CH-[0-9]{8}-[0-9]{4}$'
  AND NOT EXISTS (
    SELECT 1 FROM public.proforma_invoices q
    WHERE q.site_slug = p.site_slug
      AND q.pi_number = regexp_replace(p.pi_number, '^CH-([0-9]{8})-([0-9]{4})$', 'CR\1\2')
  );

-- What the generator produces right now:
--   SELECT public.next_pi_number('CR');
