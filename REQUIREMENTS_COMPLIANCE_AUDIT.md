# Requirements Compliance Audit

> Generated: 2026-04-02
> Scope: poc-weather application (Spring Boot + React + TimescaleDB)

---

## 1. Application Requirements

### 1.1 Receive new metric values via API call

| Aspect | Status | Evidence |
|--------|--------|----------|
| REST endpoint for ingestion | DONE | `POST /api/v1/metrics` in `MetricsController.java` |
| Batch ingestion | DONE | `POST /api/v1/metrics/batch` in `MetricsController.java` |
| UI to call the ingest API | DONE | `Registration.jsx` with sensor picker and metric form |

**How it works:**
The `MetricsController.ingest()` endpoint accepts a JSON body with `sensorId`, optional `timestamp`, and a `metrics` map (key = metric type, value = numeric reading). Each entry in the map becomes a separate row in the `sensor_metrics` hypertable. If `timestamp` is omitted, `Instant.now()` is used. Batch ingestion wraps multiple single-ingest calls in a single `@Transactional`.

The React Registration page provides a form with sensor picker (searchable combo box), numeric inputs for temperature, humidity, wind speed, and pressure, with client-side range validation against `METRIC_BOUNDS`.

---

### 1.2 Query sensor data

| Aspect | Status | Evidence |
|--------|--------|----------|
| UI for querying | DONE | `MetricsQuery.jsx` |
| API for querying | DONE | `GET /api/v1/metrics/query` |
| One or more (or all) sensors | DONE | `sensorIds` param; empty/null resolves to all via `resolveSensorIds()` |
| Select metrics (temperature, humidity, etc.) | DONE | `metrics` param, validated against `MetricType.ALLOWED` |
| Statistics: min, max, sum, average | DONE | `StatisticType` enum + 4 native SQL queries |
| Date range (1 day to 1 month) | DONE | Validated: max 31 days, min 1 day when single bound is missing |
| Default to latest data when no range | DONE | `isLatestQuery` branch returns latest per sensor/metric |

**How it works:**
`MetricsService.query()` normalizes metric names to lowercase, validates them against `MetricType.ALLOWED`, parses the statistic via `StatisticType.fromString()`, and resolves sensor IDs (empty = all). If both dates are null, it enters "latest value" mode and returns the most recent reading per (sensor, metric). Otherwise, it validates the date range (start < end, max 31 days) and dispatches to the appropriate repository method (`findAverageBySensorsAndMetrics`, `findMinBySensorsAndMetrics`, etc.) which execute native SQL `GROUP BY sensor_id, metric_type`.

The React MetricsQuery page provides:
- A sensor checkbox list (max 10 sensors, with search filter)
- Metric toggle buttons from `METRIC_OPTIONS`
- A statistic dropdown (average, min, max, sum)
- Date range inputs with "Latest value only" toggle
- Results displayed in a table and Recharts bar chart

**Example query fulfilled:** "Give me the average temperature and humidity for sensor 1 in the last week" maps to:
`GET /api/v1/metrics/query?sensorIds=1&metrics=temperature,humidity&statistic=average&startDate=...&endDate=...`

---

## 2. Technical Requirements

### 2.1 REST API with front-end

| Aspect | Status | Evidence |
|--------|--------|----------|
| REST API | DONE | Spring Boot 3 REST controllers under `/api/v1/` |
| Front-end | DONE | React 18 SPA served by Nginx, proxied to backend |

### 2.2 Programming language: preferably Java

| Aspect | Status | Evidence |
|--------|--------|----------|
| Backend language | DONE | Java 17 + Spring Boot 3.2.5 |
| Frontend framework | DONE | React 18 + Vite 5 |

### 2.3 Public repository

| Aspect | Status | Evidence |
|--------|--------|----------|
| Code shared publicly | DONE | GitHub repository with randomized name |

### 2.4 Data persisted in database

| Aspect | Status | Evidence |
|--------|--------|----------|
| Database/storage | DONE | TimescaleDB (PostgreSQL 16 with time-series extension) |
| Reasons documented | DONE | README includes rationale: native time-series aggregation, `time_bucket`, automatic partitioning, SQL compatibility |

**Storage justification:**
TimescaleDB was chosen because:
1. Purpose-built for time-series data (automatic chunk-based partitioning by time)
2. Native aggregate functions like `time_bucket` for throughput queries
3. Full PostgreSQL compatibility (JPA, Flyway, standard JDBC)
4. Scales well for high-ingest workloads with hypertables
5. `DISTINCT ON` for efficient "latest per group" queries

Schema:
- `sensors`: `id BIGSERIAL PRIMARY KEY`, `name VARCHAR(100) UNIQUE`, `location`, `created_at`
- `sensor_metrics`: hypertable on `time`, with `sensor_id FK`, `metric_type`, `value`, indexed on `(sensor_id, metric_type, time DESC)`

### 2.5 Input validation and exception handling

| Aspect | Status | Details |
|--------|--------|---------|
| DTO validation (`@NotNull`, `@Size`, `@PastOrPresent`) | DONE | `MetricIngestRequest`, `SensorRequest` |
| Metric type validation | DONE | `MetricType.isValid()` checks against allowed set |
| Metric value range validation (backend) | ADDED (feature/backend-input-validation) | `@ValidMetricValues` annotation rejects NaN, Infinity, and out-of-range values |
| Date range validation | DONE | Max 31 days, start < end |
| Sensor existence check on ingest | DONE | `EntityNotFoundException` for unknown sensor |
| Sensor existence check on query | IMPROVED (feature/backend-input-validation) | `resolveSensorIds` now validates and logs unknown IDs |
| Batch size limit | ADDED (feature/backend-input-validation) | `MAX_BATCH_SIZE = 100` |
| Global exception handler | DONE | `GlobalExceptionHandler` maps to consistent JSON envelope |
| Frontend validation | DONE | `Registration.jsx` validates ranges; `MetricsQuery.jsx` validates sensor/metric selection |

**Previously missing (now addressed):**
- Metric value ranges were only validated on the frontend; backend accepted any `Double`. Now addressed by `@ValidMetricValues` custom annotation in `feature/backend-input-validation`.
- NaN/Infinity values could be ingested via direct API call. Now rejected at DTO validation level.
- Batch endpoint had no size cap. Now capped at 100.
- Non-existent sensor IDs in queries silently returned empty results. Now logged as warnings.

### 2.6 Unit/integration testing

| Aspect | Status | Details |
|--------|--------|---------|
| Backend unit tests (service layer) | DONE | `MetricsServiceTest`, `SensorServiceTest` with Mockito |
| Backend unit tests (controller layer) | DONE | `MetricsControllerTest`, `SensorControllerTest` with MockMvc |
| Backend exception handler test | DONE | `GlobalExceptionHandlerTest` |
| Backend validation tests | ADDED (feature/missing-tests) | `MetricTypeTest`, `StatisticTypeTest` |
| Backend integration tests | ADDED (feature/missing-tests) | `MetricsIntegrationTest` with Testcontainers + TimescaleDB |
| Frontend component tests | DONE | 14 test files covering all pages and components (Vitest + Testing Library) |
| Frontend test fixes | FIXED (feature/missing-tests) | `StationCard.test.jsx` ID assertion, `MetricsQuery.test.jsx` submit gating |
| E2E tests (Playwright/Cypress) | NOT IMPLEMENTED | Out of PoC scope |

### 2.7 README with run instructions

| Aspect | Status | Evidence |
|--------|--------|---------|
| Run instructions | DONE | `docker-compose up --build` with UI at :3000 and API at :8080 |
| Architecture description | DONE | Diagram, tech stack table, AWS mapping |
| API reference | DONE | All endpoints documented with example JSON |
| Dev mode instructions | DONE | DB-only compose + local mvn/npm |
| Design decisions | DONE | EAV metrics, Flyway, GET queries, JSON logging, etc. |

---

## 3. Edge Case and Data Quality Handling

### 3.1 Extreme/invalid values (the -999C problem)

| Aspect | Status | Details |
|--------|--------|---------|
| Backend rejects out-of-range values | ADDED (feature/backend-input-validation) | `MetricBounds` + `@ValidMetricValues` |
| Frontend shows data errors clearly | ADDED (feature/frontend-edge-cases) | `StationCard` + `RealtimeStream` show `--` and warning icon |
| Data quality tagging | ADDED (feature/data-quality-flag) | `quality` column in `sensor_metrics` ("valid"/"suspect") |

### 3.2 Duplicate metric ingestion

| Aspect | Status | Details |
|--------|--------|---------|
| Sensor name duplicates | DONE | `UNIQUE` constraint + `existsByName` check |
| Metric reading duplicates | KNOWN LIMITATION | No UNIQUE constraint on `(time, sensor_id, metric_type)` in hypertable; JPA `@IdClass` mismatch. Duplicate rows coexist and affect aggregations. |

**Recommendation for future:** Add `UNIQUE(sensor_id, metric_type, time)` constraint and switch to native `INSERT ... ON CONFLICT DO UPDATE` (upsert). TimescaleDB supports unique constraints that include the partitioning column.

---

## 4. Duplicate Handling Deep Dive

### 4.1 Sensors

**Approach:** Defense in depth - both DB `UNIQUE` constraint and application-level `existsByName` check.
**Assessment:** Best practice. The DB constraint is the source of truth; the service pre-check provides a user-friendly error message instead of a raw constraint violation.

### 4.2 Metrics

**Current approach:** No deduplication. Each ingest call creates new rows regardless of whether identical `(time, sensor_id, metric_type)` tuples exist.

**Impact:**
- `SUM` aggregations are inflated by duplicate rows
- `AVG` aggregations are skewed (duplicate values get extra weight)
- `MIN`/`MAX` are unaffected (duplicates don't change extremes)
- The JPA `@IdClass(SensorMetricId)` on `(time, sensorId, metricType)` contradicts the DB schema which has no PK, leading to unpredictable `merge()` behavior in edge cases

**Recommendation:** This is the most significant reliability gap in the current PoC. Address with a Flyway migration adding a `UNIQUE` constraint and switching to native upsert.

---

## 5. Observability

| Aspect | Status | Details |
|--------|--------|---------|
| Structured logging | DONE | `logback-spring.xml` with JSON profile for Docker |
| Health checks | DONE | Spring Actuator `/actuator/health` with DB check |
| Prometheus metrics | DONE | Micrometer + Prometheus registry at `/actuator/prometheus` |
| Throughput monitoring | DONE | `time_bucket` query powers the dashboard throughput chart |
| Error logging | DONE | `GlobalExceptionHandler` logs at WARN/ERROR level per exception type |
| Data quality warnings | ADDED (feature/data-quality-flag) | Quality flag on metrics + service-level logging for suspect values |

---

## 6. Summary of Feature Branches

| Branch | Purpose | Key Files |
|--------|---------|-----------|
| `feature/backend-input-validation` | Centralized metric bounds, `@ValidMetricValues` annotation, NaN/Infinity guard, batch size limit, sensor ID validation on query | `MetricBounds.java`, `ValidMetricValues.java`, `MetricValuesValidator.java`, `MetricIngestRequest.java`, `MetricsController.java`, `MetricsService.java` |
| `feature/frontend-edge-cases` | Display data errors as `--` with warning icon instead of misleading clamped values | `metrics.js`, `StationCard.jsx`, `RealtimeStream.jsx`, `StatusBadge.jsx`, `Registration.jsx` |
| `feature/data-quality-flag` | Add `quality` column to `sensor_metrics` for "valid"/"suspect" tagging | `V5__add_quality_flag.sql`, `SensorMetric.java`, `MetricStreamEntry.java`, `MetricsService.java` |
| `feature/missing-tests` | Fix drifted tests, add integration tests, add validation unit tests | `StationCard.test.jsx`, `MetricsQuery.test.jsx`, `RealtimeStream.test.jsx`, `MetricsIntegrationTest.java`, `MetricTypeTest.java`, `StatisticTypeTest.java`, `pom.xml` |
| `feature/compliance-audit` | This document | `REQUIREMENTS_COMPLIANCE_AUDIT.md` |

---

## 7. Known PoC Simplifications

These were intentional trade-offs documented in the README:
- No authentication/authorization
- No rate limiting
- No HTTPS (relies on reverse proxy in production)
- No E2E tests (Playwright/Cypress)
- CORS allows all origins (dev convenience)
- No metric deduplication (UNIQUE constraint recommended)
- Status is always "online" (no real health monitoring per sensor)
- No pagination on all query endpoints
