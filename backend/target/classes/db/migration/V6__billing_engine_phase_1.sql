-- ============================================================
-- Flyway Migration: V6__billing_engine_phase_1.sql
-- Advanced Billing & Charge Engine - Core Tables
-- ============================================================

-- ============================================================
-- 1. CHARGE TYPES TABLE
-- Defines templates for different types of charges
-- ============================================================
CREATE TABLE IF NOT EXISTS charge_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    charge_frequency VARCHAR(50) NOT NULL,
    base_amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
    is_taxable BOOLEAN NOT NULL DEFAULT FALSE,
    is_discountable BOOLEAN NOT NULL DEFAULT TRUE,
    requires_approval BOOLEAN NOT NULL DEFAULT FALSE,
    allow_multiple_assignments BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_charge_types_active ON charge_types(is_active);
CREATE INDEX IF NOT EXISTS idx_charge_types_category ON charge_types(category);

-- ============================================================
-- 2. CHARGES TABLE
-- Individual charge instances applied to tenants/units
-- ============================================================
CREATE TABLE IF NOT EXISTS charges (
    id BIGSERIAL PRIMARY KEY,
    charge_type_id BIGINT NOT NULL REFERENCES charge_types(id),
    property_id BIGINT NOT NULL REFERENCES properties(id),
    tenant_id BIGINT REFERENCES users(id),
    unit_id BIGINT,
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
    start_date DATE NOT NULL,
    end_date DATE,
    charge_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    approved_by_id BIGINT REFERENCES users(id),
    approval_notes VARCHAR(500),
    description VARCHAR(500),
    metadata JSONB,
    created_by_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_charges_property ON charges(property_id);
CREATE INDEX IF NOT EXISTS idx_charges_tenant ON charges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_charges_unit ON charges(unit_id);
CREATE INDEX IF NOT EXISTS idx_charges_status ON charges(charge_status);
CREATE INDEX IF NOT EXISTS idx_charges_approval_status ON charges(approval_status);
CREATE INDEX IF NOT EXISTS idx_charges_start_date ON charges(start_date);
CREATE INDEX IF NOT EXISTS idx_charges_type ON charges(charge_type_id);

-- ============================================================
-- 3. CHARGE RULES TABLE
-- Business logic rules for charge calculations
-- ============================================================
CREATE TABLE IF NOT EXISTS charge_rules (
    id BIGSERIAL PRIMARY KEY,
    charge_type_id BIGINT NOT NULL REFERENCES charge_types(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    rule_definition JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 100,
    created_by_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_charge_rules_type ON charge_rules(charge_type_id);
CREATE INDEX IF NOT EXISTS idx_charge_rules_type_rule ON charge_rules(charge_type_id, rule_type);

-- ============================================================
-- 4. BILLING STATEMENTS TABLE
-- Consolidated monthly billing statements
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_statements (
    id BIGSERIAL PRIMARY KEY,
    billing_period VARCHAR(7) NOT NULL,  -- Format: YYYY-MM
    property_id BIGINT NOT NULL REFERENCES properties(id),
    tenant_id BIGINT NOT NULL REFERENCES users(id),
    unit_id BIGINT,
    statement_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_charges NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_taxes NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_discounts NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_due NUMERIC(10, 2) NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
    balance_due NUMERIC(10, 2) NOT NULL,
    statement_status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
    notes VARCHAR(500),
    pdf_path VARCHAR(500),
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issued_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(billing_period, property_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_billing_statements_property ON billing_statements(property_id);
CREATE INDEX IF NOT EXISTS idx_billing_statements_tenant ON billing_statements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_statements_period ON billing_statements(billing_period);
CREATE INDEX IF NOT EXISTS idx_billing_statements_status ON billing_statements(statement_status);
CREATE INDEX IF NOT EXISTS idx_billing_statements_due_date ON billing_statements(due_date);

-- ============================================================
-- 5. STATEMENT LINE ITEMS TABLE
-- Itemized charges on a billing statement
-- ============================================================
CREATE TABLE IF NOT EXISTS statement_line_items (
    id BIGSERIAL PRIMARY KEY,
    billing_statement_id BIGINT NOT NULL REFERENCES billing_statements(id) ON DELETE CASCADE,
    charge_id BIGINT NOT NULL,
    description VARCHAR(200) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    is_prorated BOOLEAN NOT NULL DEFAULT FALSE,
    tax_amount NUMERIC(10, 2),
    discount_amount NUMERIC(10, 2),
    line_total NUMERIC(10, 2) NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_line_items_statement ON statement_line_items(billing_statement_id);
CREATE INDEX IF NOT EXISTS idx_line_items_charge ON statement_line_items(charge_id);

-- ============================================================
-- 6. PAYMENTS TABLE
-- Payment records with allocation tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
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

CREATE INDEX IF NOT EXISTS idx_payments_property ON payments(property_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference_number);

-- ============================================================
-- 7. PAYMENT ALLOCATIONS TABLE
-- Maps payments to specific charges (oldest-first algorithm)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_allocations (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    charge_id BIGINT REFERENCES charges(id),
    billing_statement_id BIGINT REFERENCES billing_statements(id),
    amount NUMERIC(10, 2) NOT NULL,
    allocation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    allocation_order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_charge ON payment_allocations(charge_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_statement ON payment_allocations(billing_statement_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_order ON payment_allocations(allocation_order);

-- ============================================================
-- 8. CHARGE AUDIT LOGS TABLE
-- Complete audit trail for all charge operations
-- ============================================================
CREATE TABLE IF NOT EXISTS charge_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    charge_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details VARCHAR(500),
    previous_values JSONB,
    new_values JSONB,
    actor_id BIGINT REFERENCES users(id),
    ip_address VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_charge ON charge_audit_logs(charge_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON charge_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON charge_audit_logs(created_at);

-- ============================================================
-- 9. GRANT PERMISSIONS (if using role-based access)
-- ============================================================
-- Uncomment and adjust as needed for your security model
-- GRANT SELECT, INSERT, UPDATE, DELETE ON charge_types TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON charges TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON billing_statements TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO app_user;

-- ============================================================
-- Migration completed
-- ============================================================

