-- Document Automation and Templates Module
-- Flyway Migration V5

-- Document Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL,
    country_code VARCHAR(2),
    template_version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PUBLISHED, ARCHIVED
    content TEXT NOT NULL, -- Freemarker template content
    language VARCHAR(5) NOT NULL DEFAULT 'EN', -- EN, PT, ES, FR
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_templates_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Template Variables Table
CREATE TABLE IF NOT EXISTS template_variables (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL,
    variable_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    data_type VARCHAR(30) NOT NULL, -- STRING, NUMBER, DATE, BOOLEAN, ENUM
    required BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    validation_pattern VARCHAR(500),
    enum_values TEXT, -- JSON array of values
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_template_variables_template FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE CASCADE
);

-- Generated Documents Table
CREATE TABLE IF NOT EXISTS generated_documents (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL,
    template_version INTEGER NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    property_id BIGINT,
    lease_id BIGINT,
    generated_by BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'GENERATED', -- GENERATED, SENT, SIGNED, ARCHIVED
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    mime_type VARCHAR(100),
    file_size BIGINT,
    language VARCHAR(5) NOT NULL DEFAULT 'EN',
    variables_json TEXT, -- JSON containing all variables used
    metadata_json TEXT, -- Additional metadata
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP,
    signed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_generated_documents_template FOREIGN KEY (template_id) REFERENCES document_templates(id),
    CONSTRAINT fk_generated_documents_property FOREIGN KEY (property_id) REFERENCES properties(id),
    CONSTRAINT fk_generated_documents_lease FOREIGN KEY (lease_id) REFERENCES leases(id),
    CONSTRAINT fk_generated_documents_generated_by FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- Document Audit Logs Table
CREATE TABLE IF NOT EXISTS document_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    generated_document_id BIGINT,
    template_id BIGINT,
    action VARCHAR(50) NOT NULL, -- CREATED, UPDATED, VIEWED, SENT, SIGNED, DELETED
    actor_id BIGINT,
    actor_role VARCHAR(50),
    action_details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_document FOREIGN KEY (generated_document_id) REFERENCES generated_documents(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_logs_template FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE SET NULL,
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- Template Internationalization Table
CREATE TABLE IF NOT EXISTS template_i18n (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL,
    language VARCHAR(5) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_template_i18n_template FOREIGN KEY (template_id) REFERENCES document_templates(id) ON DELETE CASCADE,
    CONSTRAINT uq_template_i18n UNIQUE(template_id, language)
);

-- Document Signatures Table (for future DocuSign/Adobe Sign integration)
CREATE TABLE IF NOT EXISTS document_signatures (
    id BIGSERIAL PRIMARY KEY,
    generated_document_id BIGINT NOT NULL,
    signer_user_id BIGINT,
    signer_email VARCHAR(255),
    signer_name VARCHAR(255),
    signature_status VARCHAR(50), -- PENDING, SIGNED, DECLINED
    signature_date TIMESTAMP,
    signature_provider VARCHAR(50), -- DOCUSIGN, ADOBE_SIGN, MANUAL
    provider_signature_id VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_signatures_document FOREIGN KEY (generated_document_id) REFERENCES generated_documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_document_signatures_user FOREIGN KEY (signer_user_id) REFERENCES users(id)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_document_templates_type_status ON document_templates(document_type, status);
CREATE INDEX IF NOT EXISTS idx_document_templates_language ON document_templates(language);
CREATE INDEX IF NOT EXISTS idx_template_variables_template ON template_variables(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_template ON generated_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_property ON generated_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_lease ON generated_documents(lease_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_status ON generated_documents(status);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created ON generated_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_document_audit_logs_document ON document_audit_logs(generated_document_id);
CREATE INDEX IF NOT EXISTS idx_document_audit_logs_template ON document_audit_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_document_audit_logs_action ON document_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_document_signatures_document ON document_signatures(generated_document_id);

