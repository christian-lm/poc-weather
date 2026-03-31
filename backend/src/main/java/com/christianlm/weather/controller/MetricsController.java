package com.christianlm.weather.controller;

import com.christianlm.weather.dto.MetricIngestRequest;
import com.christianlm.weather.dto.MetricIngestResponse;
import com.christianlm.weather.dto.MetricQueryResponse;
import com.christianlm.weather.dto.MetricStreamEntry;
import com.christianlm.weather.dto.PageResponse;
import com.christianlm.weather.dto.SensorLatestResponse;
import com.christianlm.weather.dto.ThroughputEntry;
import com.christianlm.weather.service.MetricsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

/**
 * REST controller for metric ingestion and aggregated queries.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/metrics")
@RequiredArgsConstructor
public class MetricsController {

    private final MetricsService metricsService;

    /**
     * Ingests a single metric reading for a sensor.
     * The request body contains the sensor ID, optional timestamp, and metric key-value pairs.
     */
    @PostMapping
    public ResponseEntity<MetricIngestResponse> ingest(@Valid @RequestBody MetricIngestRequest request) {
        MetricIngestResponse response = metricsService.ingest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Ingests a batch of metric readings in a single request.
     * Each item in the array follows the same schema as the single-ingest endpoint.
     */
    @PostMapping("/batch")
    public ResponseEntity<List<MetricIngestResponse>> ingestBatch(
            @Valid @RequestBody List<MetricIngestRequest> requests) {
        List<MetricIngestResponse> responses = metricsService.ingestBatch(requests);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    /**
     * Returns the latest reading per sensor and metric type, paginated.
     * Used by the dashboard to populate station cards.
     */
    @GetMapping("/latest-all")
    public ResponseEntity<PageResponse<SensorLatestResponse>> getLatestAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(metricsService.getLatestAllPaged(page, size));
    }

    /**
     * Returns the N most recent individual metric readings.
     * Used by the dashboard real-time stream table.
     */
    @GetMapping("/stream")
    public ResponseEntity<List<MetricStreamEntry>> getRecentStream(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(metricsService.getRecentStream(limit));
    }

    /**
     * Returns hourly metric ingestion counts for the throughput chart.
     * Backed by TimescaleDB time_bucket('1 hour', time).
     *
     * @param hours how many hours of history to return (default 24, max 168)
     */
    @GetMapping("/throughput")
    public ResponseEntity<List<ThroughputEntry>> getThroughput(
            @RequestParam(defaultValue = "24") int hours) {
        return ResponseEntity.ok(metricsService.getThroughput(hours));
    }

    /**
     * Queries aggregated metrics for sensors over a time range.
     *
     * @param sensorIds comma-separated sensor IDs (optional, omit for all)
     * @param metrics   comma-separated metric types (required)
     * @param statistic aggregation: min, max, sum, average (required)
     * @param startDate ISO-8601 range start (optional)
     * @param endDate   ISO-8601 range end (optional)
     */
    @GetMapping("/query")
    public ResponseEntity<MetricQueryResponse> query(
            @RequestParam(required = false) String sensorIds,
            @RequestParam String metrics,
            @RequestParam String statistic,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate) {

        List<Long> parsedSensorIds = parseSensorIds(sensorIds);
        List<String> parsedMetrics = parseCommaSeparated(metrics);

        if (parsedMetrics.isEmpty()) {
            throw new IllegalArgumentException("At least one metric is required");
        }

        MetricQueryResponse response = metricsService.query(
                parsedSensorIds, parsedMetrics, statistic, startDate, endDate);

        return ResponseEntity.ok(response);
    }

    private List<Long> parseSensorIds(String sensorIds) {
        if (sensorIds == null || sensorIds.isBlank()) {
            return List.of();
        }
        try {
            return Arrays.stream(sensorIds.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .toList();
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid sensorIds format. Expected comma-separated numbers.");
        }
    }

    private List<String> parseCommaSeparated(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
