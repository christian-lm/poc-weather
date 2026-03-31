CREATE TABLE sensor_metrics (
    time        TIMESTAMPTZ NOT NULL,
    sensor_id   BIGINT      NOT NULL REFERENCES sensors(id),
    metric_type VARCHAR(50) NOT NULL,
    value       DOUBLE PRECISION NOT NULL
);

SELECT create_hypertable('sensor_metrics', 'time');

CREATE INDEX idx_metrics_sensor_type ON sensor_metrics (sensor_id, metric_type, time DESC);
