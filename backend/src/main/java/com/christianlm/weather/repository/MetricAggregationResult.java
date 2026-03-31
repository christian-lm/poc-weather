package com.christianlm.weather.repository;

/**
 * Spring Data projection interface for native query results returning
 * aggregated metric values grouped by sensor and metric type.
 */
public interface MetricAggregationResult {

    Long getSensorId();

    String getMetricType();

    Double getStatValue();
}
