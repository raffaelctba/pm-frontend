ALTER TABLE addresses
    ALTER COLUMN latitude TYPE NUMERIC(10,7) USING latitude::NUMERIC(10,7);

ALTER TABLE addresses
    ALTER COLUMN longitude TYPE NUMERIC(10,7) USING longitude::NUMERIC(10,7);

