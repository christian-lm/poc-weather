-- Adds a data-quality flag to every metric reading.
-- 'valid'   = value passed plausibility checks at ingestion time.
-- 'suspect' = value was outside expected physical bounds but still persisted
--             for audit / troubleshooting purposes.
ALTER TABLE sensor_metrics
    ADD COLUMN quality VARCHAR(10) NOT NULL DEFAULT 'valid';

CREATE INDEX idx_metrics_quality ON sensor_metrics (quality);
