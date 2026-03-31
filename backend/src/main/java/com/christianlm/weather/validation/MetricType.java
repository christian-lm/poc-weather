package com.christianlm.weather.validation;

import java.util.Set;

/**
 * Defines the allowed weather metric types for ingestion and querying.
 * Adding a new metric type here is the only change needed to support it system-wide.
 */
public final class MetricType {

    public static final String TEMPERATURE = "temperature";
    public static final String HUMIDITY = "humidity";
    public static final String WIND_SPEED = "wind_speed";
    public static final String PRESSURE = "pressure";
    public static final String PRECIPITATION = "precipitation";

    /** Immutable set of all valid metric type identifiers. */
    public static final Set<String> ALLOWED = Set.of(
            TEMPERATURE, HUMIDITY, WIND_SPEED, PRESSURE, PRECIPITATION
    );

    private MetricType() {}

    /**
     * Checks if a metric type string is in the allowed set (case-insensitive).
     *
     * @param type the metric type to validate
     * @return true if the type is allowed
     */
    public static boolean isValid(String type) {
        return type != null && ALLOWED.contains(type.toLowerCase());
    }
}
