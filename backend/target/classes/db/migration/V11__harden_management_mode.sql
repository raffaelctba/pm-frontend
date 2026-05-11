ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS management_mode VARCHAR(255);

UPDATE properties
SET management_mode = 'SINGLE_UNIT'
WHERE management_mode IS NULL OR btrim(management_mode) = '';

ALTER TABLE properties
    ALTER COLUMN management_mode SET DEFAULT 'SINGLE_UNIT';

ALTER TABLE properties
    ALTER COLUMN management_mode SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_properties_management_mode'
    ) THEN
        ALTER TABLE properties
            ADD CONSTRAINT chk_properties_management_mode
                CHECK (management_mode IN ('SINGLE_UNIT', 'BUILDING'));
    END IF;
END
$$;

