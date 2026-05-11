CREATE TABLE IF NOT EXISTS payment_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    provider VARCHAR(40) NOT NULL,
    event_id VARCHAR(160) NOT NULL,
    external_reference VARCHAR(160),
    transaction_id VARCHAR(120),
    payload_hash VARCHAR(128),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_webhook_events_provider_event
    ON payment_webhook_events(provider, event_id);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_created_at
    ON payment_webhook_events(created_at);

