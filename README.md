# PoC Weather Metrics

A proof-of-concept system for collecting and querying weather sensor metrics, built with **Spring Boot**, **React**, and **TimescaleDB**.

## Quick Start

**Prerequisites:** Docker Desktop

```bash
git clone https://github.com/christian-lm/poc-weather.git
cd poc-weather
docker-compose up --build
```

Open **http://localhost:3000** — that's it.

The database is pre-populated via Flyway: **V3** seeds **5 sensors** in Ireland (Dublin, Cork, Galway, Limerick, Waterford) with **30 days** of hourly metrics. **V4** adds a stress-test dataset with **~100 additional sensors** worldwide (tropical, arctic, desert, coastal, mountain, edge cases) and **~450K** metric rows so pagination, search, and aggregations have realistic volume. You can start querying immediately.

> First build takes ~5 minutes (Maven + npm dependency download). Subsequent builds are near-instant thanks to Docker layer caching.

---

## Architecture

```
┌──────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   Frontend   │──────▶│     Backend      │──────▶│   TimescaleDB   │
│  React SPA   │ :3000 │  Spring Boot API │ :8080 │  (PostgreSQL)   │ :5432
│  (Nginx)     │◀──────│  REST + Actuator │◀──────│  Hypertables    │
└──────────────┘       └──────────────────┘       └─────────────────┘
```

### AWS Target Mapping

| Component | Local (PoC) | Production (AWS) |
|-----------|-------------|------------------|
| Frontend | Nginx container | S3 + CloudFront |
| Backend | Docker container | ECS Fargate |
| Database | TimescaleDB container | RDS PostgreSQL + TimescaleDB |
| Load Balancer | — | Application Load Balancer |
| Observability | Actuator + JSON logs | CloudWatch Logs + Metrics |
| CI/CD | `docker-compose up` | CodePipeline |

---

## Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Backend | Java 17, Spring Boot 3.2 | Required by spec. Mature ecosystem for REST APIs |
| Frontend | React 18, Vite 5 | Fast dev server, minimal config, wide adoption |
| Database | TimescaleDB (PostgreSQL 16) | Purpose-built for time-series: hypertables, `time_bucket()`, automatic partitioning |
| Migrations | Flyway | Version-controlled SQL, supports TimescaleDB extensions |
| Observability | Micrometer, Actuator, Logstash JSON encoder | Production-ready metrics + structured logging |
| Testing | JUnit 5, Mockito, MockMvc, Vitest, Testing Library | Standard testing stacks for Spring Boot and React |

### Why TimescaleDB?

Sensor metrics are textbook time-series data: timestamped, append-only, queried by time ranges with aggregations. TimescaleDB provides:

- **Hypertables** — automatic partitioning by time, queries only scan relevant chunks
- **Built-in aggregates** — `time_bucket()`, `first()`, `last()` optimized for time-series
- **Full SQL** — works with standard JDBC/JPA, no new query language
- **Compression** — 10-20x storage savings on older data (production config)
- **PostgreSQL ecosystem** — same driver, same tooling, zero learning curve

Alternatives considered: plain PostgreSQL (no auto-partitioning), InfluxDB (no JPA support), DynamoDB (poor for range aggregations), Amazon Timestream (vendor lock-in).

---

## API Reference

Base URL: `http://localhost:8080/api/v1`

### Sensors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/sensors` | List sensors (paginated, optional `search`, `page`, `size`) |
| `GET` | `/sensors/{id}` | Get sensor by ID |
| `POST` | `/sensors` | Register new sensor |
| `PUT` | `/sensors/{id}` | Update sensor name/location |
| `DELETE` | `/sensors/{id}` | Delete sensor and all its metrics |

**POST /sensors**
```json
{ "name": "Sensor Zeta", "location": "Lisbon, Portugal" }
```

### Metrics Ingestion

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/metrics` | Ingest single reading |
| `POST` | `/metrics/batch` | Ingest batch of readings |

**POST /metrics**
```json
{
  "sensorId": 1,
  "timestamp": "2026-03-31T10:30:00Z",
  "metrics": {
    "temperature": 22.5,
    "humidity": 65.3,
    "wind_speed": 12.1
  }
}
```

Allowed metric types: `temperature`, `humidity`, `wind_speed`, `pressure`, `precipitation`

### Metrics Query

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/metrics/query` | Query aggregated metrics |
| `GET` | `/metrics/latest-all` | Latest readings per sensor (paginated) |
| `GET` | `/metrics/stream` | Recent raw readings (`limit` param) |
| `GET` | `/metrics/throughput` | Hourly ingestion counts (`hours` param) |

**Query Parameters (`/metrics/query`):**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `sensorIds` | comma-separated | No | Sensor IDs (omit for all) |
| `metrics` | comma-separated | Yes | e.g. `temperature,humidity` |
| `statistic` | string | Yes | `min`, `max`, `sum`, `average` |
| `startDate` | ISO datetime | No | Omit with endDate for latest value |
| `endDate` | ISO datetime | No | Defaults to now |

**Example:**
```
GET /api/v1/metrics/query?sensorIds=1&metrics=temperature,humidity&statistic=average&startDate=2026-03-24T00:00:00Z&endDate=2026-03-31T00:00:00Z
```

**Response:**
```json
{
  "query": {
    "sensorIds": [1],
    "metrics": ["temperature", "humidity"],
    "statistic": "average",
    "startDate": "2026-03-24T00:00:00Z",
    "endDate": "2026-03-31T00:00:00Z"
  },
  "results": [
    {
      "sensorId": 1,
      "sensorName": "Sensor Alpha",
      "location": "Dublin, Ireland",
      "data": { "temperature": 21.7, "humidity": 62.4 }
    }
  ]
}
```

### Observability (Ops Endpoints)

These endpoints are available for infrastructure monitoring tools (Prometheus, Grafana, CloudWatch) and Docker health checks. They are not exposed through the frontend UI.

| Endpoint | Description |
|----------|-------------|
| `/actuator/health` | Health check (DB connectivity) |
| `/actuator/metrics` | JVM + HTTP metrics |
| `/actuator/prometheus` | Prometheus scrape endpoint |

In production, these would be scraped by a Prometheus instance or CloudWatch agent rather than accessed directly by users.

---

## Project Structure

```
poc-weather/
├── backend/                        # Spring Boot application
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/christianlm/weather/
│       │   ├── config/             # CORS, web config
│       │   ├── controller/         # REST endpoints
│       │   ├── dto/                # Request/response objects
│       │   ├── exception/          # Global error handler
│       │   ├── model/              # JPA entities
│       │   ├── repository/         # Data access (native SQL)
│       │   ├── service/            # Business logic
│       │   └── validation/         # Metric/statistic types
│       ├── main/resources/
│       │   ├── application.yml
│       │   ├── logback-spring.xml
│       │   └── db/migration/       # Flyway SQL migrations
│       └── test/                   # Unit + controller tests
├── frontend/                       # React SPA
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── pages/                  # Dashboard, Sensors, MetricsQuery, Registration
│       ├── components/             # Reusable UI components
│       ├── layout/                 # Sidebar, TopBar, Layout shell
│       ├── services/               # API client (Axios)
│       ├── hooks/                  # Custom hooks (usePolling)
│       ├── constants/              # Metric types, labels, units
│       └── test/                   # Vitest + Testing Library tests
├── docker-compose.yml              # Full stack orchestration
└── README.md
```

---

## Development Mode

For faster iteration with hot-reload:

```bash
# Terminal 1 — Database only
docker-compose up timescaledb

# Terminal 2 — Backend (requires JDK 17 + Maven)
cd backend
mvn spring-boot:run

# Terminal 3 — Frontend (requires Node 18+)
cd frontend
npm install
npm run dev
```

Frontend dev server runs on `http://localhost:3000` with API proxy to `:8080`.

---

## Testing

### Backend

```bash
cd backend
mvn test
```

Test coverage includes:
- **Service layer**: `MetricsServiceTest` (ingestion, batch, queries, aggregations, stream, throughput), `SensorServiceTest` (CRUD, pagination, search, validation)
- **Controller layer**: `MetricsControllerTest` (all endpoints, HTTP status codes, request shapes), `SensorControllerTest` (CRUD endpoints, validation, pagination)
- **Exception handling**: `GlobalExceptionHandlerTest` (validation errors, 400/404/500 responses)

### Frontend

```bash
cd frontend
npm test
```

Test coverage includes:
- **Pages**: Dashboard, Sensors, MetricsQuery, Registration (loading states, data rendering, form submission, error handling)
- **Components**: StationCard, StatusBadge, Pagination, ThroughputChart, RealtimeStream, ErrorBoundary
- **Hooks**: usePolling (interval behavior, cleanup)
- **Services**: api.js (parameter building, endpoint calls)
- **Routing**: App routes, sidebar navigation

---

## Configuration

Ports are configurable via environment variables:

```bash
DB_PORT=5433 API_PORT=9090 UI_PORT=4000 docker-compose up --build
```

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PORT` | 5432 | TimescaleDB port |
| `API_PORT` | 8080 | Backend API port |
| `UI_PORT` | 3000 | Frontend UI port |

---

## Design Decisions

1. **TimescaleDB over plain PostgreSQL** — automatic time partitioning, no manual chunk management
2. **EAV model for metrics** — flexible schema, new metric types without ALTER TABLE
3. **Flyway over JPA auto-DDL** — explicit SQL control needed for `create_hypertable()`
4. **GET for queries** — idempotent, cacheable, fits REST semantics
5. **Seed data in Flyway migration** — Irish baseline (V3) plus global stress seed (V4); zero extra dependencies, data ready on first boot
6. **Structured JSON logging** — production-ready, includes traceId for request correlation
7. **Actuator for ops, not UI** — health/metrics endpoints are infrastructure concerns, consumed by monitoring tools (Prometheus/Grafana), not exposed to end users

## Simplifications (PoC scope)

| Concern | PoC | Production |
|---------|-----|------------|
| Authentication | None | Spring Security + JWT/OAuth2 |
| Rate limiting | None | API Gateway or Bucket4j |
| HTTPS | HTTP only | ALB + ACM certificates |
| CI/CD | Manual docker-compose | CodePipeline + ECR |
| Data retention | Unlimited | TimescaleDB compression + retention policies |
| TypeScript | Plain JSX | TypeScript for type safety |
| State management | Local useState | React Query for server state caching |
