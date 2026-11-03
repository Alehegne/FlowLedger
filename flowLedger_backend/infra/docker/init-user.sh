
#!/bin/bash
set -e

: "${FLOWLEDGER_APP_PASSWORD:?FLOWLEDGER_APP_PASSWORD is required}"

psql \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=app_password="$FLOWLEDGER_APP_PASSWORD" \
  --set=ON_ERROR_STOP=1 <<'SQL'
ALTER ROLE flowledger_app PASSWORD :'app_password';

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO flowledger_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO flowledger_app;
SQL
