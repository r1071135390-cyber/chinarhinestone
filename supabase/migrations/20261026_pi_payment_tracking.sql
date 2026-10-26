-- supabase/migrations/20261026_pi_payment_tracking.sql
--
-- Payment ledger for duplicate-payment detection.
--
-- Why a ledger: proforma_invoices only stores the LAST payment intent id
-- (stripe_payment_intent_id), so a second successful charge is invisible —
-- the invoice simply looks "paid" and the extra money is never seen. The
-- ledger records every Stripe payment that reaches us and gives us two
-- things at once:
--
--   1. Idempotency — Stripe delivers the same webhook event more than
--      once. The UNIQUE key on (site_slug, payment_intent_id) turns a
--      redelivery into a no-op instead of a second recorded payment.
--   2. Detection — an invoice with more than one ledger row was paid more
--      than once. The PI row is flagged (duplicate_payment_at) and the admin
--      PI list shows the warning.
--
-- Run this in the Supabase SQL editor of the chinarhinestone project
-- (https://zxobbdaqzkbfaoyahggz.supabase.co).
--
-- The code degrades gracefully: until this migration runs, the webhook
-- still flips the invoice to "paid", it just cannot count duplicates.

-- 1. Flag column on the invoice row
ALTER TABLE public.proforma_invoices
  ADD COLUMN IF NOT EXISTS duplicate_payment_at TIMESTAMPTZ;

-- 2. Payment ledger — one row per successful Stripe payment
CREATE TABLE IF NOT EXISTS public.pi_payments (
  id                BIGSERIAL PRIMARY KEY,
  site_slug         TEXT      NOT NULL DEFAULT 'chinarhinestone'
                                    CHECK (site_slug IN ('sublimapparel', 'chinarhinestone')),
  pi_number         TEXT      NOT NULL,
  payment_intent_id TEXT      NOT NULL,
  amount_cents      BIGINT    NOT NULL DEFAULT 0,
  currency          TEXT      NOT NULL DEFAULT 'usd',
  is_duplicate      BOOLEAN   NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (site_slug, payment_intent_id)
);

CREATE INDEX IF NOT EXISTS idx_pi_payments_pi
  ON public.pi_payments (site_slug, pi_number);

-- Only service_role (server-side functions) may read or write the ledger.
ALTER TABLE public.pi_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pi_payments_no_read" ON public.pi_payments;
CREATE POLICY "pi_payments_no_read" ON public.pi_payments
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
