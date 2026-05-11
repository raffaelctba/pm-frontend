CREATE TABLE IF NOT EXISTS building_unit_tenants (
    building_unit_id BIGINT NOT NULL,
    tenant_user_id BIGINT NOT NULL,
    PRIMARY KEY (building_unit_id, tenant_user_id),
    CONSTRAINT fk_building_unit_tenants_unit
        FOREIGN KEY (building_unit_id) REFERENCES building_units(id) ON DELETE CASCADE,
    CONSTRAINT fk_building_unit_tenants_user
        FOREIGN KEY (tenant_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_building_unit_tenants_tenant_user_id
    ON building_unit_tenants (tenant_user_id);

INSERT INTO building_unit_tenants (building_unit_id, tenant_user_id)
SELECT bu.id, bu.tenant_user_id
FROM building_units bu
WHERE bu.tenant_user_id IS NOT NULL
ON CONFLICT (building_unit_id, tenant_user_id) DO NOTHING;

