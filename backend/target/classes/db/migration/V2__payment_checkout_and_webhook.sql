CREATE TABLE IF NOT EXISTS payment_attempts (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    attempted_amount NUMERIC(10,2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'BRL',
    country_code VARCHAR(2),
    payment_method VARCHAR(50) NOT NULL,
    gateway_provider VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    transaction_id VARCHAR(120),
    external_reference VARCHAR(160),
    gateway_message TEXT,
    signature_valid BOOLEAN,
    request_payload TEXT,
    response_payload TEXT,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_invoice_id ON payment_attempts(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_external_reference ON payment_attempts(external_reference);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_transaction_id ON payment_attempts(transaction_id);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id_transaction_id
    ON payments(invoice_id, transaction_id);

