package com.christianlm.weather.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricStreamEntry {

    private Instant timestamp;
    private Long sensorId;
    private String sensorName;
    private String location;
    private String metricType;
    private Double value;
}
