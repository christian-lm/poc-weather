package com.christianlm.weather.validation;

import java.util.Map;

/**
 * Centralized physically plausible bounds for each metric type.
 * Used by both the custom Bean Validation annotation and the service layer.
 * Frontend mirrors these ranges in METRIC_BOUNDS (Registration.jsx).
 */
public final class MetricBounds {

    public record Range(double min, double max) {
        public boolean contains(double value) {
            return value >= min && value <= max;
        }
    }

    public static final Map<String, Range> BOUNDS = Map.of(
            MetricType.TEMPERATURE,   new Range(-90, 60),
            MetricType.HUMIDITY,      new Range(0, 100),
            MetricType.WIND_SPEED,    new Range(0, 500),
            MetricType.PRESSURE,      new Range(300, 1100),
            MetricType.PRECIPITATION, new Range(0, 500)
    );

    public static final int MAX_BATCH_SIZE = 100;

    private MetricBounds() {}

    public static boolean isInRange(String metricType, double value) {
        Range range = BOUNDS.get(metricType.toLowerCase());
        return range == null || range.contains(value);
    }
}
