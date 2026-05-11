CREATE TABLE IF NOT EXISTS tenant_subtenant_links (
    id BIGSERIAL PRIMARY KEY,
    building_unit_id BIGINT NOT NULL,
    tenant_manager_user_id BIGINT NOT NULL,
    subtenant_user_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant_subtenant_links_unit
        FOREIGN KEY (building_unit_id) REFERENCES building_units(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_subtenant_links_tenant_manager
        FOREIGN KEY (tenant_manager_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant_subtenant_links_subtenant
        FOREIGN KEY (subtenant_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_tenant_subtenant_links_distinct_users
        CHECK (tenant_manager_user_id <> subtenant_user_id),
    CONSTRAINT uq_tenant_subtenant_links_active
        UNIQUE (building_unit_id, tenant_manager_user_id, subtenant_user_id)
);

CREATE INDEX IF NOT EXISTS idx_tenant_subtenant_links_unit
    ON tenant_subtenant_links(building_unit_id);

CREATE INDEX IF NOT EXISTS idx_tenant_subtenant_links_tenant_manager
    ON tenant_subtenant_links(tenant_manager_user_id);

CREATE INDEX IF NOT EXISTS idx_tenant_subtenant_links_subtenant
    ON tenant_subtenant_links(subtenant_user_id);

