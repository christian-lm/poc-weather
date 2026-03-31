package com.christianlm.weather.repository;

import com.christianlm.weather.model.SensorMetric;
import com.christianlm.weather.model.SensorMetricId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for sensor metric time-series data.
 * Uses native SQL to leverage TimescaleDB aggregate functions directly.
 */
@Repository
public interface SensorMetricRepository extends JpaRepository<SensorMetric, SensorMetricId> {

    @Query(value = """
        SELECT sm.sensor_id AS sensorId, sm.metric_type AS metricType, AVG(sm.value) AS statValue
        FROM sensor_metrics sm
        WHERE sm.sensor_id IN (:sensorIds)
          AND sm.metric_type IN (:metricTypes)
          AND sm.time >= :startDate
          AND sm.time <= :endDate
        GROUP BY sm.sensor_id, sm.metric_type
        ORDER BY sm.sensor_id, sm.metric_type
        """, nativeQuery = true)
    List<MetricAggregationResult> findAverageBySensorsAndMetrics(
            @Param("sensorIds") List<Long> sensorIds,
            @Param("metricTypes") List<String> metricTypes,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    @Query(value = """
        SELECT sm.sensor_id AS sensorId, sm.metric_type AS metricType, MIN(sm.value) AS statValue
        FROM sensor_metrics sm
        WHERE sm.sensor_id IN (:sensorIds)
          AND sm.metric_type IN (:metricTypes)
          AND sm.time >= :startDate
          AND sm.time <= :endDate
        GROUP BY sm.sensor_id, sm.metric_type
        ORDER BY sm.sensor_id, sm.metric_type
        """, nativeQuery = true)
    List<MetricAggregationResult> findMinBySensorsAndMetrics(
            @Param("sensorIds") List<Long> sensorIds,
            @Param("metricTypes") List<String> metricTypes,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    @Query(value = """
        SELECT sm.sensor_id AS sensorId, sm.metric_type AS metricType, MAX(sm.value) AS statValue
        FROM sensor_metrics sm
        WHERE sm.sensor_id IN (:sensorIds)
          AND sm.metric_type IN (:metricTypes)
          AND sm.time >= :startDate
          AND sm.time <= :endDate
        GROUP BY sm.sensor_id, sm.metric_type
        ORDER BY sm.sensor_id, sm.metric_type
        """, nativeQuery = true)
    List<MetricAggregationResult> findMaxBySensorsAndMetrics(
            @Param("sensorIds") List<Long> sensorIds,
            @Param("metricTypes") List<String> metricTypes,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    @Query(value = """
        SELECT sm.sensor_id AS sensorId, sm.metric_type AS metricType, SUM(sm.value) AS statValue
        FROM sensor_metrics sm
        WHERE sm.sensor_id IN (:sensorIds)
          AND sm.metric_type IN (:metricTypes)
          AND sm.time >= :startDate
          AND sm.time <= :endDate
        GROUP BY sm.sensor_id, sm.metric_type
        ORDER BY sm.sensor_id, sm.metric_type
        """, nativeQuery = true)
    List<MetricAggregationResult> findSumBySensorsAndMetrics(
            @Param("sensorIds") List<Long> sensorIds,
            @Param("metricTypes") List<String> metricTypes,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate);

    @Query(value = """
        SELECT sm.sensor_id AS sensorId, sm.metric_type AS metricType, sm.value AS statValue
        FROM sensor_metrics sm
        WHERE sm.sensor_id IN (:sensorIds)
          AND sm.metric_type IN (:metricTypes)
        ORDER BY sm.time DESC
        LIMIT 1
        """, nativeQuery = true)
    List<MetricAggregationResult> findLatestBySensorsAndMetrics(
            @Param("sensorIds") List<Long> sensorIds,
            @Param("metricTypes") List<String> metricTypes);

    @Query(value = """
        SELECT DISTINCT ON (sm.sensor_id, sm.metric_type)
            sm.sensor_id AS sensorId, sm.metric_type AS metricType, sm.value AS statValue
        FROM sensor_metrics sm
        ORDER BY sm.sensor_id, sm.metric_type, sm.time DESC
        """, nativeQuery = true)
    List<MetricAggregationResult> findLatestAllSensorsMetrics();

    @Query(value = """
        SELECT sm.time AS time, sm.sensor_id AS sensorId, sm.metric_type AS metricType, sm.value AS value
        FROM sensor_metrics sm
        ORDER BY sm.time DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<RecentMetricResult> findRecentMetrics(@Param("limit") int limit);

    @Query(value = """
        SELECT time_bucket('1 hour', sm.time) AS bucketTime, COUNT(*) AS count
        FROM sensor_metrics sm
        WHERE sm.time >= :since
        GROUP BY bucketTime
        ORDER BY bucketTime ASC
        """, nativeQuery = true)
    List<ThroughputBucket> findThroughputBuckets(@Param("since") Instant since);
}
