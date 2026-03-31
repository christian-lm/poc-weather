package com.christianlm.weather.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorLatestResponse {

    private Long sensorId;
    private String sensorName;
    private String location;
    private Map<String, Double> latestMetrics;
    private Instant lastUpdated;
    private String status;
}
