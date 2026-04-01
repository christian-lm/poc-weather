package com.christianlm.weather.model;

import lombok.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * Composite primary key for {@link SensorMetric}.
 * Implements {@link Serializable} as required by JPA for {@code @IdClass} types.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class SensorMetricId implements Serializable {

    private Instant time;
    private Long sensorId;
    private String metricType;
}
