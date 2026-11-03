
CREATE TABLE app_user (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uq_app_user_email
    ON app_user (LOWER(email));

CREATE TABLE organization (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE organization_membership (
    organization_id UUID NOT NULL
        REFERENCES organization(id),
    user_id UUID NOT NULL
        REFERENCES app_user(id),
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (organization_id, user_id),

    CONSTRAINT chk_membership_role
        CHECK (role IN ('OWNER', 'ADMIN', 'FINANCE', 'APPROVER', 'VIEWER'))
);

CREATE INDEX idx_membership_user
    ON organization_membership(user_id);

CREATE TABLE invoice (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL
        REFERENCES organization(id),
    invoice_number VARCHAR(100) NOT NULL,
    supplier_name VARCHAR(200) NOT NULL,
    issue_date DATE,
    due_date DATE,
    total_amount NUMERIC(19, 4) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'ETB',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_by UUID NOT NULL REFERENCES app_user(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_invoice_amount
        CHECK (total_amount >= 0),

    CONSTRAINT chk_invoice_currency
        CHECK (currency ~ '^[A-Z]{3}$'),

    CONSTRAINT chk_invoice_status
        CHECK (status IN (
            'DRAFT',
            'PENDING_APPROVAL',
            'APPROVED',
            'REJECTED',
            'CANCELLED'
        )),

    CONSTRAINT chk_invoice_dates
        CHECK (due_date IS NULL OR issue_date IS NULL
               OR due_date >= issue_date)
);

CREATE INDEX idx_invoice_org_created
    ON invoice(organization_id, created_at DESC);

CREATE INDEX idx_invoice_org_status
    ON invoice(organization_id, status);
