-- supabase/migrations/20261026_pi_shipping_term.sql
--
-- Adds the shipping term (DDP / FOB / EXW / ...) as its own column.
--
-- Why: the PI form has a "Shipping Term" select next to "Shipping Method"
-- ("DDP by AIR"), but 20261014 + 20261025 only had a shipping_method column,
-- so the term was lost on save.
--
-- Run this in the Supabase SQL Editor (project zxobbdaqzkbfaoyahggz) after
-- 20261025_pi_admin_fields.sql. Idempotent — safe to run twice.

ALTER ROLE service_role SET statement_timeout = 0;

ALTER TABLE public.proforma_invoices
  ADD COLUMN IF NOT EXISTS shipping_term TEXT;
