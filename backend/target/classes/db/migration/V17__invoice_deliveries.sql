-- Migration V17: Create invoice delivery table
-- This migration adds support for tracking invoice deliveries

CREATE TABLE IF NOT EXISTS invoice_deliveries (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    delivery_method VARCHAR(50),
    recipient_email VARCHAR(255),
    delivery_notes TEXT,
    delivered_at TIMESTAMP,
    viewed_at TIMESTAMP,
    failed_reason TEXT,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    created_by BIGINT,
    CONSTRAINT fk_invoice_deliveries_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_deliveries_user
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_invoice
    ON invoice_deliveries (invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_status
    ON invoice_deliveries (status);

CREATE INDEX IF NOT EXISTS idx_invoice_deliveries_created_at
    ON invoice_deliveries (created_at DESC);

