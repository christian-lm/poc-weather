package com.christianlm.weather.repository;

import java.time.Instant;

/**
 * Projection interface for time-bucketed metric counts.
 * Used by the dashboard throughput chart.
 */
public interface ThroughputBucket {

    Instant getBucketTime();

    Long getCount();
}
