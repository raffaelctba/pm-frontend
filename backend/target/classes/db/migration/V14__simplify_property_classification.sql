-- Property classification simplification:
-- 1) remove management_mode (now inferred from property_type)
-- 2) allow optional usage_type
-- 3) normalize property_type to new values

ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS property_type VARCHAR(40);

UPDATE properties
SET property_type = CASE
    WHEN property_type = 'COMMERCIAL' THEN 'COMMERCIAL_UNIT'
    WHEN property_type = 'LAND' THEN 'HOUSE'
    WHEN property_type IS NULL OR btrim(property_type) = '' THEN 'APARTMENT'
    ELSE property_type
END;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_properties_property_type'
          AND conrelid = 'properties'::regclass
    ) THEN
        ALTER TABLE properties DROP CONSTRAINT chk_properties_property_type;
    END IF;
END
$$;

ALTER TABLE properties
    ALTER COLUMN property_type SET NOT NULL;

ALTER TABLE properties
    ADD CONSTRAINT chk_properties_property_type
        CHECK (property_type IN (
            'APARTMENT',
            'HOUSE',
            'BUILDING',
            'COMMERCIAL_UNIT',
            'COMMERCIAL_BUILDING'
        ));

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_properties_management_mode'
          AND conrelid = 'properties'::regclass
    ) THEN
        ALTER TABLE properties DROP CONSTRAINT chk_properties_management_mode;
    END IF;
END
$$;

ALTER TABLE properties
    DROP COLUMN IF EXISTS management_mode;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'chk_properties_usage_type'
          AND conrelid = 'properties'::regclass
    ) THEN
        ALTER TABLE properties DROP CONSTRAINT chk_properties_usage_type;
    END IF;
END
$$;

ALTER TABLE properties
    ALTER COLUMN usage_type DROP NOT NULL;

ALTER TABLE properties
    ALTER COLUMN usage_type DROP DEFAULT;

ALTER TABLE properties
    ADD CONSTRAINT chk_properties_usage_type
        CHECK (
            usage_type IS NULL OR usage_type IN (
                'RENTAL',
                'OWNER_OCCUPIED',
                'VACATION_HOME',
                'COMMERCIAL_OWNER_USE',
                'FOR_SALE'
            )
        );

