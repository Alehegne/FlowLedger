-- Enhance invoice table with description, rejection_reason, and adjust currency to VARCHAR(3)
ALTER TABLE invoice
    ADD COLUMN description VARCHAR(500),
    ADD COLUMN rejection_reason VARCHAR(500),
    ALTER COLUMN currency TYPE VARCHAR(3);

-- Create invoice_activity table for audit trail
CREATE TABLE invoice_activity (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoice(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    actor_name VARCHAR(150),
    actor_id UUID REFERENCES app_user(id),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_invoice
    ON invoice_activity(invoice_id, occurred_at DESC);

CREATE INDEX idx_invoice_org_num
    ON invoice(organization_id, LOWER(invoice_number));
