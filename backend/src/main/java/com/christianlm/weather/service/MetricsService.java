package com.christianlm.weather.service;

import com.christianlm.weather.dto.MetricIngestRequest;
import com.christianlm.weather.dto.MetricIngestResponse;
import com.christianlm.weather.dto.MetricQueryResponse;
import com.christianlm.weather.dto.PageResponse;
import com.christianlm.weather.model.Sensor;
import com.christianlm.weather.model.SensorMetric;
import com.christianlm.weather.repository.MetricAggregationResult;
import com.christianlm.weather.repository.SensorMetricRepository;
import com.christianlm.weather.repository.SensorRepository;
import com.christianlm.weather.validation.MetricType;
import com.christianlm.weather.validation.StatisticType;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.christianlm.weather.dto.MetricStreamEntry;
import com.christianlm.weather.dto.SensorLatestResponse;
import com.christianlm.weather.dto.ThroughputEntry;
import com.christianlm.weather.repository.RecentMetricResult;
import com.christianlm.weather.repository.ThroughputBucket;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Core service handling metric ingestion and aggregated queries.
 * Delegates time-series aggregations to TimescaleDB via native SQL.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MetricsService {

    private static final Duration MAX_RANGE = Duration.ofDays(31);
    private static final Duration MIN_RANGE = Duration.ofDays(1);

    private final SensorMetricRepository metricRepository;
    private final SensorRepository sensorRepository;

    /**
     * Ingests a set of metric readings for a single sensor.
     * Each key in the metrics map becomes a separate row in the hypertable.
     *
     * @param request contains sensorId, optional timestamp, and a map of metric_type -> value
     * @return summary with the number of records inserted
     * @throws EntityNotFoundException if the sensor does not exist
     * @throws IllegalArgumentException if any metric type is not in the allowed set
     */
    @Transactional
    public MetricIngestResponse ingest(MetricIngestRequest request) {
        validateSensorExists(request.getSensorId());
        validateMetricTypes(request.getMetrics().keySet());

        Instant timestamp = request.getTimestamp() != null ? request.getTimestamp() : Instant.now();

        List<SensorMetric> entities = request.getMetrics().entrySet().stream()
                .map(entry -> SensorMetric.builder()
                        .time(timestamp)
                        .sensorId(request.getSensorId())
                        .metricType(entry.getKey().toLowerCase())
                        .value(entry.getValue())
                        .build())
                .toList();

        metricRepository.saveAll(entities);
        log.info("Ingested {} metrics for sensor {}", entities.size(), request.getSensorId());

        return MetricIngestResponse.builder()
                .status("accepted")
                .recordsInserted(entities.size())
                .build();
    }

    /**
     * Ingests multiple metric readings in a single transactional batch.
     *
     * @param requests list of ingest payloads
     * @return list of individual ingest responses
     */
    @Transactional
    public List<MetricIngestResponse> ingestBatch(List<MetricIngestRequest> requests) {
        return requests.stream()
                .map(this::ingest)
                .toList();
    }

    /**
     * Queries aggregated metrics for one or more sensors over a time range.
     * If no date range is provided, returns the latest recorded value per sensor/metric.
     *
     * @param sensorIds   sensor IDs to include (empty/null = all sensors)
     * @param metricTypes metric types to query (e.g. "temperature", "humidity")
     * @param statistic   aggregation function: min, max, sum, average
     * @param startDate   range start (null = latest-value mode)
     * @param endDate     range end (null = now)
     * @return structured response with query echo and per-sensor results
     * @throws IllegalArgumentException if date range exceeds 31 days or metric types are invalid
     */
    @Transactional(readOnly = true)
    public MetricQueryResponse query(
            List<Long> sensorIds,
            List<String> metricTypes,
            String statistic,
            Instant startDate,
            Instant endDate) {

        List<String> normalizedMetrics = metricTypes.stream()
                .map(String::toLowerCase)
                .toList();
        validateMetricTypes(normalizedMetrics);

        StatisticType stat = StatisticType.fromString(statistic);

        List<Long> resolvedSensorIds = resolveSensorIds(sensorIds);
        if (resolvedSensorIds.isEmpty()) {
            throw new IllegalArgumentException("No sensors found");
        }

        boolean isLatestQuery = (startDate == null && endDate == null);

        if (!isLatestQuery) {
            if (endDate == null) endDate = Instant.now();
            if (startDate == null) startDate = endDate.minus(MIN_RANGE);
            validateDateRange(startDate, endDate);
        }

        List<MetricAggregationResult> rawResults;
        if (isLatestQuery) {
            rawResults = fetchLatestPerSensorAndMetric(resolvedSensorIds, normalizedMetrics);
        } else {
            rawResults = fetchAggregated(resolvedSensorIds, normalizedMetrics, stat, startDate, endDate);
        }

        Map<Long, Sensor> sensorMap = sensorRepository.findAllById(resolvedSensorIds).stream()
                .collect(Collectors.toMap(Sensor::getId, s -> s));

        List<MetricQueryResponse.SensorResult> results = buildResults(rawResults, sensorMap);

        return MetricQueryResponse.builder()
                .query(MetricQueryResponse.QueryParams.builder()
                        .sensorIds(resolvedSensorIds)
                        .metrics(normalizedMetrics)
                        .statistic(stat.name().toLowerCase())
                        .startDate(isLatestQuery ? null : startDate)
                        .endDate(isLatestQuery ? null : endDate)
                        .build())
                .results(results)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SensorLatestResponse> getLatestAll() {
        List<MetricAggregationResult> rawResults = metricRepository.findLatestAllSensorsMetrics();

        Map<Long, Map<String, Double>> grouped = new LinkedHashMap<>();
        for (MetricAggregationResult row : rawResults) {
            grouped.computeIfAbsent(row.getSensorId(), k -> new LinkedHashMap<>())
                    .put(row.getMetricType(), row.getStatValue());
        }

        Map<Long, Sensor> sensorMap = sensorRepository.findAll().stream()
                .collect(Collectors.toMap(Sensor::getId, s -> s));

        return grouped.entrySet().stream()
                .map(entry -> {
                    Sensor sensor = sensorMap.get(entry.getKey());
                    return SensorLatestResponse.builder()
                            .sensorId(entry.getKey())
                            .sensorName(sensor != null ? sensor.getName() : "Unknown")
                            .location(sensor != null ? sensor.getLocation() : null)
                            .latestMetrics(entry.getValue())
                            .lastUpdated(Instant.now())
                            .status("online")
                            .build();
                })
                .toList();
    }

    /**
     * Paginated variant: fetches a page of sensors first, then loads only
     * the latest metrics for those sensors. Avoids full-table scans on
     * the hypertable when only a small page is needed.
     */
    @Transactional(readOnly = true)
    public PageResponse<SensorLatestResponse> getLatestAllPaged(int page, int size) {
        PageRequest pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by("location").ascending().and(Sort.by("name").ascending()));
        Page<Sensor> sensorPage = sensorRepository.findAll(pageable);

        List<Long> sensorIds = sensorPage.getContent().stream()
                .map(Sensor::getId)
                .toList();

        Map<Long, Map<String, Double>> grouped = new LinkedHashMap<>();
        if (!sensorIds.isEmpty()) {
            List<MetricAggregationResult> rawResults = metricRepository.findLatestBySensorIds(sensorIds);
            for (MetricAggregationResult row : rawResults) {
                grouped.computeIfAbsent(row.getSensorId(), k -> new LinkedHashMap<>())
                        .put(row.getMetricType(), row.getStatValue());
            }
        }

        List<SensorLatestResponse> content = sensorPage.getContent().stream()
                .map(sensor -> SensorLatestResponse.builder()
                        .sensorId(sensor.getId())
                        .sensorName(sensor.getName())
                        .location(sensor.getLocation())
                        .latestMetrics(grouped.getOrDefault(sensor.getId(), Map.of()))
                        .lastUpdated(Instant.now())
                        .status("online")
                        .build())
                .toList();

        Page<SensorLatestResponse> resultPage = new PageImpl<>(content, pageable, sensorPage.getTotalElements());
        return PageResponse.of(resultPage);
    }

    @Transactional(readOnly = true)
    public List<MetricStreamEntry> getRecentStream(int limit) {
        List<RecentMetricResult> raw = metricRepository.findRecentMetrics(Math.min(limit, 100));

        Map<Long, Sensor> sensorMap = sensorRepository.findAll().stream()
                .collect(Collectors.toMap(Sensor::getId, s -> s));

        return raw.stream()
                .map(r -> {
                    Sensor sensor = sensorMap.get(r.getSensorId());
                    return MetricStreamEntry.builder()
                            .timestamp(r.getTime())
                            .sensorId(r.getSensorId())
                            .sensorName(sensor != null ? sensor.getName() : "Unknown")
                            .location(sensor != null ? sensor.getLocation() : null)
                            .metricType(r.getMetricType())
                            .value(r.getValue())
                            .build();
                })
                .toList();
    }

    /**
     * Returns hourly metric counts for the last N hours, used by the throughput chart.
     */
    @Transactional(readOnly = true)
    public List<ThroughputEntry> getThroughput(int hours) {
        Instant since = Instant.now().minus(Duration.ofHours(Math.min(hours, 168)));
        List<ThroughputBucket> buckets = metricRepository.findThroughputBuckets(since);

        return buckets.stream()
                .map(b -> ThroughputEntry.builder()
                        .time(b.getBucketTime())
                        .count(b.getCount())
                        .build())
                .toList();
    }

    private List<MetricAggregationResult> fetchLatestPerSensorAndMetric(
            List<Long> sensorIds, List<String> metricTypes) {
        List<MetricAggregationResult> allResults = new ArrayList<>();
        for (Long sensorId : sensorIds) {
            for (String metricType : metricTypes) {
                List<MetricAggregationResult> latest = metricRepository.findLatestBySensorsAndMetrics(
                        List.of(sensorId), List.of(metricType));
                allResults.addAll(latest);
            }
        }
        return allResults;
    }

    private List<MetricAggregationResult> fetchAggregated(
            List<Long> sensorIds, List<String> metricTypes,
            StatisticType stat, Instant start, Instant end) {

        return switch (stat) {
            case AVERAGE -> metricRepository.findAverageBySensorsAndMetrics(sensorIds, metricTypes, start, end);
            case MIN -> metricRepository.findMinBySensorsAndMetrics(sensorIds, metricTypes, start, end);
            case MAX -> metricRepository.findMaxBySensorsAndMetrics(sensorIds, metricTypes, start, end);
            case SUM -> metricRepository.findSumBySensorsAndMetrics(sensorIds, metricTypes, start, end);
        };
    }

    /**
     * Groups raw projection results by sensor ID and builds the response DTOs.
     */
    private List<MetricQueryResponse.SensorResult> buildResults(
            List<MetricAggregationResult> rawResults, Map<Long, Sensor> sensorMap) {

        Map<Long, Map<String, Double>> grouped = new LinkedHashMap<>();

        for (MetricAggregationResult row : rawResults) {
            grouped.computeIfAbsent(row.getSensorId(), k -> new LinkedHashMap<>())
                    .put(row.getMetricType(), row.getStatValue());
        }

        return grouped.entrySet().stream()
                .map(entry -> {
                    Sensor sensor = sensorMap.get(entry.getKey());
                    return MetricQueryResponse.SensorResult.builder()
                            .sensorId(entry.getKey())
                            .sensorName(sensor != null ? sensor.getName() : "Unknown")
                            .location(sensor != null ? sensor.getLocation() : null)
                            .data(entry.getValue())
                            .build();
                })
                .toList();
    }

    /**
     * Resolves sensor IDs: returns all sensor IDs if input is empty/null.
     */
    private List<Long> resolveSensorIds(List<Long> sensorIds) {
        if (sensorIds == null || sensorIds.isEmpty()) {
            return sensorRepository.findAll().stream().map(Sensor::getId).toList();
        }
        return sensorIds;
    }

    private void validateSensorExists(Long sensorId) {
        if (!sensorRepository.existsById(sensorId)) {
            throw new EntityNotFoundException("Sensor not found with id: " + sensorId);
        }
    }

    private void validateMetricTypes(Collection<String> types) {
        List<String> invalid = types.stream()
                .filter(t -> !MetricType.isValid(t))
                .toList();
        if (!invalid.isEmpty()) {
            throw new IllegalArgumentException(
                    "Invalid metric types: " + invalid + ". Allowed: " + MetricType.ALLOWED);
        }
    }

    private void validateDateRange(Instant start, Instant end) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("startDate must be before endDate");
        }
        Duration range = Duration.between(start, end);
        if (range.compareTo(MAX_RANGE) > 0) {
            throw new IllegalArgumentException("Date range must not exceed 31 days");
        }
    }
}
