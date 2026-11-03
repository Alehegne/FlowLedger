
-- Create the restricted application role.
-- FLOWLEDGER_APP_PASSWORD is provided by Docker Compose.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'flowledger_app'
    ) THEN
        CREATE ROLE flowledger_app LOGIN;
    END IF;
END
$$;

ALTER ROLE flowledger_app
    NOSUPERUSER
    NOCREATEDB
    NOCREATEROLE
    NOREPLICATION;

GRANT CONNECT ON DATABASE flowledger TO flowledger_app;
GRANT USAGE ON SCHEMA public TO flowledger_app;

GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA public TO flowledger_app;

GRANT USAGE, SELECT
    ON ALL SEQUENCES IN SCHEMA public TO flowledger_app;
