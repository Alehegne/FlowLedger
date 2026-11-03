-- Seed Demo Organization
INSERT INTO organization (id, name, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Acme Trading Co.',
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Seed Demo User: abebe@acme.co / password
INSERT INTO app_user (id, email, password_hash, full_name, enabled, created_at)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'abebe@acme.co',
    '{bcrypt}$2a$10$NyqKf6YX4BjuEu3w93DjAeAMUKV/if6XtwFETIWO.zUEOWGyYlZZ6',
    'Abebe Girma',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Seed Membership: OWNER
INSERT INTO organization_membership (organization_id, user_id, role, created_at)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    'OWNER',
    CURRENT_TIMESTAMP
)
ON CONFLICT (organization_id, user_id) DO NOTHING;
