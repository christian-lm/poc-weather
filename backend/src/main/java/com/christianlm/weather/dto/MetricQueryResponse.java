package com.christianlm.weather.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MetricQueryResponse {

    private QueryParams query;
    private List<SensorResult> results;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QueryParams {
        private List<Long> sensorIds;
        private List<String> metrics;
        private String statistic;
        private Instant startDate;
        private Instant endDate;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SensorResult {
        private Long sensorId;
        private String sensorName;
        private Map<String, Double> data;
    }
}
