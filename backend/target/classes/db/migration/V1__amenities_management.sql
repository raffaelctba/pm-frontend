CREATE TABLE IF NOT EXISTS amenity_maintenance_blocks (
    id BIGSERIAL PRIMARY KEY,
    amenity_id BIGINT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_day_of_week INTEGER,
    recurrence_start_date DATE,
    recurrence_end_date DATE,
    recurrence_start_time TIME,
    recurrence_end_time TIME,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_amenity_maintenance_blocks_amenity_id
    ON amenity_maintenance_blocks(amenity_id);

CREATE TABLE IF NOT EXISTS amenity_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    amenity_id BIGINT REFERENCES amenities(id) ON DELETE SET NULL,
    booking_id BIGINT REFERENCES amenity_bookings(id) ON DELETE SET NULL,
    event_type VARCHAR(80) NOT NULL,
    message TEXT,
    metadata TEXT,
    actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_amenity_audit_logs_amenity_id
    ON amenity_audit_logs(amenity_id);

CREATE INDEX IF NOT EXISTS idx_amenity_audit_logs_booking_id
    ON amenity_audit_logs(booking_id);

ALTER TABLE amenities
    ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
    ADD COLUMN IF NOT EXISTS max_reservations_per_tenant_per_week INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS min_reservation_duration_minutes INTEGER DEFAULT 30,
    ADD COLUMN IF NOT EXISTS max_reservation_duration_minutes INTEGER DEFAULT 240,
    ADD COLUMN IF NOT EXISTS blackout_dates TEXT,
    ADD COLUMN IF NOT EXISTS approval_threshold_amount NUMERIC(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) DEFAULT 'MANUAL';

ALTER TABLE amenity_bookings
    ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20),
    ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(120),
    ADD COLUMN IF NOT EXISTS admin_override BOOLEAN DEFAULT FALSE;

