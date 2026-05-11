CREATE TABLE IF NOT EXISTS payment_routing_rules (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    provider VARCHAR(40) NOT NULL,
    priority INTEGER NOT NULL DEFAULT 100,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_routing_rules_country_method_enabled
    ON payment_routing_rules(country_code, payment_method, enabled);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payment_routing_rules_country_method_provider_priority
    ON payment_routing_rules(country_code, payment_method, provider, priority);

INSERT INTO payment_routing_rules(country_code, payment_method, provider, priority, enabled)
VALUES
    ('BR', 'PIX', 'BRAZIL_PIX', 10, TRUE),
    ('BR', 'PIX', 'MANUAL_FALLBACK', 100, TRUE),
    ('BR', 'CREDIT_CARD', 'MERCADOPAGO', 10, TRUE),
    ('BR', 'CREDIT_CARD', 'STRIPE_CARD', 20, TRUE),
    ('BR', 'CREDIT_CARD', 'MANUAL_FALLBACK', 100, TRUE),
    ('US', 'CREDIT_CARD', 'ADYEN_CARD', 10, TRUE),
    ('US', 'CREDIT_CARD', 'STRIPE_CARD', 20, TRUE),
    ('US', 'CREDIT_CARD', 'MANUAL_FALLBACK', 100, TRUE),
    ('PT', 'CREDIT_CARD', 'ADYEN_CARD', 10, TRUE),
    ('PT', 'CREDIT_CARD', 'STRIPE_CARD', 20, TRUE),
    ('PT', 'CREDIT_CARD', 'MANUAL_FALLBACK', 100, TRUE)
ON CONFLICT DO NOTHING;

