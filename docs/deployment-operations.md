# Deployment, Infrastructure & Operations Guide

**Project:** FlowLedger  
**Target Environments:** Local Development, Docker Compose, Staging, Production  
**Status:** Operational  

---

## 1. Environments Overview

| Environment | Purpose | Database | Base URLs |
|---|---|---|---|
| **Local Dev** | Rapid iteration & debugging | PostgreSQL 16 (Docker port 5435) | Frontend: `http://localhost:3000`<br>Backend: `http://localhost:8082` |
| **CI / Testing** | Automated pull-request verification | Ephemeral PostgreSQL (Testcontainers) | Dynamic random ports |
| **Staging** | Pre-release testing & acceptance | Managed PostgreSQL (Cloud RDS / Dedicated) | Frontend: `https://staging.flowledger.et`<br>Backend: `https://api-staging.flowledger.et` |
| **Production** | Live Ethiopian SME operational platform | High-availability PostgreSQL with WAL replication | Frontend: `https://app.flowledger.et`<br>Backend: `https://api.flowledger.et` |

---

## 2. Containerization

FlowLedger provides multi-stage, minimized container builds for both backend and frontend tiers.

### 2.1 Backend Dockerfile (`flowLedger_backend/Dockerfile`)

```dockerfile
# Stage 1: Build & Package
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /workspace

# Cache Maven wrapper and dependencies
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B

# Copy source and build jar
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal Distroless Runtime
FROM gcr.io/distroless/java25-debian12:nonroot
WORKDIR /app

COPY --from=builder /workspace/target/*.jar app.jar

USER nonroot:nonroot
EXPOSE 8082

ENTRYPOINT ["java", "-XX:+UseZGC", "-XX:+ZGenerational", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
```

### 2.2 Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## 3. Production Orchestration (`docker-compose.prod.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: flowledger-postgres
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-flowledger_prod}
      POSTGRES_USER: ${POSTGRES_USER:-flowledger_app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-flowledger_app} -d ${POSTGRES_DB:-flowledger_prod}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - flowledger-internal

  backend:
    build:
      context: ./flowLedger_backend
      dockerfile: Dockerfile
    container_name: flowledger-backend
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB:-flowledger_prod}
      SPRING_DATASOURCE_USERNAME: ${POSTGRES_USER:-flowledger_app}
      SPRING_DATASOURCE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      SERVER_PORT: 8082
    networks:
      - flowledger-internal
      - flowledger-public

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: flowledger-frontend
    restart: always
    depends_on:
      - backend
    environment:
      BACKEND_INTERNAL_URL: http://backend:8082
      PORT: 3000
    ports:
      - "80:3000"
    networks:
      - flowledger-public

networks:
  flowledger-internal:
    internal: true
  flowledger-public:

volumes:
  postgres_data:
```

---

## 4. Environment Variables & Secret Configuration

### Backend (`flowLedger_backend`)

| Variable Name | Required | Default / Example | Purpose |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | Yes | `jdbc:postgresql://localhost:5435/flowledger_db` | JDBC database connection string. |
| `SPRING_DATASOURCE_USERNAME` | Yes | `flowledger_app` | Database username. |
| `SPRING_DATASOURCE_PASSWORD` | Yes | `flowledger_secret` | Database user password. |
| `JWT_SECRET` | Yes | *(Must be 256-bit cryptographically secure string)* | HMAC-SHA256 signature key for JWTs. |
| `SERVER_PORT` | No | `8082` | HTTP listen port for Spring Boot. |
| `SPRING_PROFILES_ACTIVE` | No | `prod` | Spring profile (`prod`, `staging`, `test`). |

### Frontend (`frontend`)

| Variable Name | Required | Default / Example | Purpose |
|---|---|---|---|
| `BACKEND_INTERNAL_URL` | Yes (in Docker) | `http://localhost:8082` | Destination for Next.js `/api/:path*` proxy rewrite. |
| `NODE_ENV` | No | `production` | Node.js runtime environment mode. |

---

## 5. Observability & Monitoring

### 5.1 Health Actuator Endpoint
The backend includes Spring Boot Actuator configured for health inspections:
```bash
curl -i http://localhost:8082/actuator/health
```
**Response:**
```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "diskSpace": {
      "status": "UP"
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

### 5.2 Structured Logging
The application uses Logback with SLF4J. In production, logs are formatted as JSON lines for ingestion into logging aggregators (Elasticsearch, Fluentd, Grafana Loki, or CloudWatch).

---

## 6. Backup & Disaster Recovery

### 6.1 Database Automated Backup
To perform an online, non-blocking backup of the PostgreSQL database:
```bash
docker exec -t flowledger-postgres pg_dump -U flowledger_app -F c -b -v -f /tmp/backup_$(date +%Y%m%d_%H%M%S).dump flowledger_prod
```

### 6.2 Database Restore
```bash
docker exec -i flowledger-postgres pg_restore -U flowledger_app -d flowledger_prod -v /tmp/backup_file.dump
```

---

## 7. Operational Runbooks

### Runbook 1: Rotating the JWT Secret
**Objective:** Replace the JWT HMAC secret key without service outage.

1. Generate a new 256-bit secure secret:
   ```bash
   openssl rand -hex 32
   ```
2. Update the `JWT_SECRET` environment variable in the secret vault (e.g. AWS Secrets Manager, HashiCorp Vault, or `.env.prod`).
3. Trigger a rolling restart of the backend service containers:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --no-deps backend
   ```
   > [!NOTE]
   > Active sessions will expire upon secret rotation, prompting users to re-authenticate at `/sign-in`.

---

### Runbook 2: Investigating Database Connection Exhaustion
**Objective:** Resolve high latency or `HikariPool-1 - Connection is not available` errors.

1. Inspect active PostgreSQL connection counts:
   ```sql
   SELECT count(*), state FROM pg_stat_activity GROUP BY state;
   ```
2. Identify long-running queries:
   ```sql
   SELECT pid, now() - query_start AS duration, query 
   FROM pg_stat_activity 
   WHERE state = 'active' 
   ORDER BY duration DESC;
   ```
3. Terminate an unresponsive connection if necessary:
   ```sql
   SELECT pg_terminate_backend(<pid>);
   ```
4. Adjust `spring.datasource.hikari.maximum-pool-size` in `application.properties` if legitimate peak concurrent traffic exceeds the pool limit.

---

### Runbook 3: Schema Migration Failure Recovery
**Objective:** Handle a failed Flyway database migration safely.

1. Check Flyway schema history table:
   ```sql
   SELECT installed_rank, version, description, type, script, success 
   FROM flyway_schema_history 
   ORDER BY installed_rank DESC LIMIT 5;
   ```
2. If `success` is `false`, inspect the database error in the container logs.
3. Fix the underlying DDL issue in the SQL script.
4. Repair the migration table record:
   ```bash
   ./mvnw flyway:repair
   ```
5. Restart the backend service to re-apply the corrected migration.
