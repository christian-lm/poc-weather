package com.christianlm.weather.model;

import lombok.*;
import java.io.Serializable;
import java.time.Instant;

/**
 * Composite primary key for {@link SensorMetric}.
 *
 * <p>Implements {@link Serializable} as required by the JPA specification
 * for all {@code @IdClass} types. The EntityManager needs to serialize
 * composite keys for first-level cache identity management and detached
 * entity reattachment.</p>
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
