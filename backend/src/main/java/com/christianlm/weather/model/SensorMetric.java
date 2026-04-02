package com.christianlm.weather.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * JPA entity for a single metric reading in the TimescaleDB hypertable.
 * Uses a composite key (time + sensorId + metricType) via {@link SensorMetricId}.
 *
 * <p>Uses @Getter/@Setter instead of @Data to avoid Hibernate proxy issues
 * with auto-generated equals/hashCode from @Data.</p>
 */
@Entity
@Table(name = "sensor_metrics")
@IdClass(SensorMetricId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorMetric {

    @Id
    @Column(nullable = false)
    private Instant time;

    @Id
    @Column(name = "sensor_id", nullable = false)
    private Long sensorId;

    @Id
    @Column(name = "metric_type", nullable = false, length = 50)
    private String metricType;

    @Column(nullable = false)
    private Double value;

    /** Data-quality flag: "valid" or "suspect" (out-of-range but persisted). */
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String quality = "valid";
}
