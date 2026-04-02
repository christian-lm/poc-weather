package com.christianlm.weather.repository;

import java.time.Instant;

public interface RecentMetricResult {

    Instant getTime();

    Long getSensorId();

    String getMetricType();

    Double getValue();

    String getQuality();
}
