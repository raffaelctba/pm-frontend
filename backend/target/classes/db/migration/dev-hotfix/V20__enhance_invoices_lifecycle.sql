ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'NOT_SENT',
ADD COLUMN IF NOT EXISTS sent_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_delivery_attempt TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lock_reason TEXT,
ADD COLUMN IF NOT EXISTS void_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_invoices_delivery_status
    ON invoices(delivery_status);

CREATE INDEX IF NOT EXISTS idx_invoices_sent_date
    ON invoices(sent_date);

CREATE INDEX IF NOT EXISTS idx_invoices_is_locked
    ON invoices(is_locked);

UPDATE invoices
SET delivery_status = 'NOT_SENT'
WHERE delivery_status IS NULL AND status = 'DRAFT';

UPDATE invoices
SET delivery_status = 'SENT_EMAIL', sent_date = COALESCE(updated_at, now())
WHERE delivery_status IS NULL AND status IN ('PENDING', 'PAID', 'OVERDUE', 'PARTIALLY_PAID', 'ISSUED');

UPDATE invoices
SET delivery_status = 'SENT_EMAIL', sent_date = COALESCE(updated_at, now())
WHERE delivery_status IS NULL AND status IN ('CANCELLED', 'VOIDED');

UPDATE invoices
SET is_locked = (status != 'DRAFT')
WHERE is_locked IS NULL OR is_locked = false;

