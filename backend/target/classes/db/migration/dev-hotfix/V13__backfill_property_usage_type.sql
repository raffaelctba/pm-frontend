ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS usage_type VARCHAR(40);

UPDATE properties
SET usage_type = 'RENTAL'
WHERE usage_type IS NULL
   OR btrim(usage_type) = ''
   OR usage_type NOT IN (
       'RENTAL',
       'OWNER_OCCUPIED',
       'VACATION_HOME',
       'COMMERCIAL_OWNER_USE',
       'FOR_SALE'
   );

ALTER TABLE properties
    ALTER COLUMN usage_type SET DEFAULT 'RENTAL';

ALTER TABLE properties
    ALTER COLUMN usage_type SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_properties_usage_type'
          AND conrelid = 'properties'::regclass
    ) THEN
        ALTER TABLE properties
            ADD CONSTRAINT chk_properties_usage_type
                CHECK (usage_type IN (
                    'RENTAL',
                    'OWNER_OCCUPIED',
                    'VACATION_HOME',
                    'COMMERCIAL_OWNER_USE',
                    'FOR_SALE'
                ));
    END IF;
END
$$;

