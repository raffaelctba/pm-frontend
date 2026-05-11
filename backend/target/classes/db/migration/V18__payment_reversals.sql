-- Migration V18: Create payment reversals table
-- This migration adds support for tracking payment reversals with full audit trail

CREATE TABLE IF NOT EXISTS payment_reversals (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    invoice_id BIGINT NOT NULL,
    reversal_amount NUMERIC(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT,
    reversal_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by BIGINT,
    actor_keycloak_id VARCHAR(255),
    CONSTRAINT fk_payment_reversals_payment
        FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_reversals_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_reversals_user
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_payment_reversals_invoice
    ON payment_reversals (invoice_id);

CREATE INDEX IF NOT EXISTS idx_payment_reversals_payment
    ON payment_reversals (payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_reversals_created_at
    ON payment_reversals (created_at DESC);

