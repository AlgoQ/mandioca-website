-- Migration: Add payment fields to bookings table for Stripe integration
-- Run this in Supabase SQL Editor

-- Add payment-related columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20)
  CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded'))
  DEFAULT 'pending';

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Add index for payment lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON bookings(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Add updated_at column and trigger
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
