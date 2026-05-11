-- Defensive repair migration for dev-hotfix stream
CREATE TABLE IF NOT EXISTS invoice_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    action VARCHAR(80) NOT NULL,
    details TEXT,
    source_invoice_id BIGINT,
    target_invoice_id BIGINT,
    actor_keycloak_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT fk_invoice_audit_logs_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_invoice_audit_logs_invoice_created_at
    ON invoice_audit_logs (invoice_id, created_at DESC);

