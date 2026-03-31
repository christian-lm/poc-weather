package com.christianlm.weather.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
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
public class MetricIngestRequest {

    @NotNull(message = "sensorId is required")
    private Long sensorId;

    @PastOrPresent(message = "timestamp must not be in the future")
    private Instant timestamp;

    @NotNull(message = "metrics map is required")
    @Size(min = 1, message = "At least one metric is required")
    private Map<String, Double> metrics;
}
