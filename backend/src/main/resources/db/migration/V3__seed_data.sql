-- Seed sensors with Irish locations
INSERT INTO sensors (name, location) VALUES
    ('Sensor Alpha', 'Dublin, Ireland'),
    ('Sensor Beta', 'Cork, Ireland'),
    ('Sensor Gamma', 'Galway, Ireland'),
    ('Sensor Delta', 'Limerick, Ireland'),
    ('Sensor Epsilon', 'Waterford, Ireland');

-- Generate 30 days of hourly metrics for each sensor.
-- Uses generate_series for realistic time-series data with slight random variation.
-- Temperature range is adjusted for typical Irish climate (cooler, more humid).
INSERT INTO sensor_metrics (time, sensor_id, metric_type, value)
SELECT
    ts,
    s.id,
    mt.metric_type,
    CASE mt.metric_type
        WHEN 'temperature' THEN 8.0  + 5.0  * sin(extract(hour from ts) * pi() / 12.0) + (random() * 3.0 - 1.5) + (s.id * 0.3)
        WHEN 'humidity'    THEN 72.0 + 10.0  * cos(extract(hour from ts) * pi() / 12.0) + (random() * 6.0 - 3.0)
        WHEN 'wind_speed'  THEN 15.0 + 8.0  * sin(extract(hour from ts) * pi() /  8.0) + (random() * 4.0 - 2.0)
        WHEN 'pressure'    THEN 1010.0 + 6.0 * sin(extract(doy from ts) * pi() / 180.0) + (random() * 3.0 - 1.5)
    END
FROM generate_series(
    NOW() - INTERVAL '30 days',
    NOW(),
    INTERVAL '1 hour'
) AS ts
CROSS JOIN sensors s
CROSS JOIN (
    VALUES ('temperature'), ('humidity'), ('wind_speed'), ('pressure')
) AS mt(metric_type);
