-- ============================================================
-- Flyway Migration: V7__separate_billing_payments.sql
-- Separate billing payment persistence from legacy invoice payments
-- ============================================================

CREATE TABLE IF NOT EXISTS billing_payments (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id),
    tenant_id BIGINT NOT NULL REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
    payment_method VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    received_date DATE,
    reference_number VARCHAR(100),
    notes VARCHAR(500),
    external_transaction_id VARCHAR(100),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    processed_by_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_billing_payments_property ON billing_payments(property_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_tenant ON billing_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_payments_date ON billing_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_billing_payments_status ON billing_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_payments_reference ON billing_payments(reference_number);

DO $$
BEGIN
    -- Backfill billing rows if they were previously stored in the shared payments table.
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payments'
          AND column_name = 'property_id'
    )
    AND EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payments'
          AND column_name = 'tenant_id'
    ) THEN
        EXECUTE '
            INSERT INTO billing_payments (
                id, property_id, tenant_id, amount, currency, payment_method, payment_date,
                received_date, reference_number, notes, external_transaction_id,
                payment_status, processed_by_id, created_at, updated_at
            )
            SELECT
                p.id,
                p.property_id,
                p.tenant_id,
                p.amount,
                COALESCE(p.currency, ''CAD''),
                p.payment_method,
                p.payment_date,
                p.received_date,
                p.reference_number,
                p.notes,
                p.external_transaction_id,
                p.payment_status,
                p.processed_by_id,
                p.created_at,
                p.updated_at
            FROM payments p
            WHERE p.property_id IS NOT NULL
              AND p.tenant_id IS NOT NULL
              AND NOT EXISTS (
                    SELECT 1 FROM billing_payments bp WHERE bp.id = p.id
              )';
    END IF;
END $$;

DO $$
DECLARE
    max_id BIGINT;
BEGIN
    SELECT MAX(id) INTO max_id FROM billing_payments;
    IF max_id IS NOT NULL THEN
        PERFORM setval(pg_get_serial_sequence('billing_payments', 'id'), max_id, true);
    END IF;
END $$;

DO $$
DECLARE
    fk_name TEXT;
BEGIN
    -- Drop any existing FK on payment_allocations.payment_id so it can target billing_payments.
    FOR fk_name IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN unnest(c.conkey) AS k(attnum) ON TRUE
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
        WHERE c.contype = 'f'
          AND n.nspname = 'public'
          AND t.relname = 'payment_allocations'
          AND a.attname = 'payment_id'
    LOOP
        EXECUTE format('ALTER TABLE payment_allocations DROP CONSTRAINT %I', fk_name);
    END LOOP;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_payment_allocations_billing_payment'
    ) THEN
        ALTER TABLE payment_allocations
            ADD CONSTRAINT fk_payment_allocations_billing_payment
            FOREIGN KEY (payment_id) REFERENCES billing_payments(id) ON DELETE CASCADE;
    END IF;
END $$;

