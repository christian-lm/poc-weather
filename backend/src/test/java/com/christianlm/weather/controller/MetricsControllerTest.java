package com.christianlm.weather.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.christianlm.weather.dto.MetricIngestRequest;
import com.christianlm.weather.dto.MetricIngestResponse;
import com.christianlm.weather.dto.MetricQueryResponse;
import com.christianlm.weather.dto.MetricStreamEntry;
import com.christianlm.weather.dto.PageResponse;
import com.christianlm.weather.dto.SensorLatestResponse;
import com.christianlm.weather.dto.ThroughputEntry;
import com.christianlm.weather.service.MetricsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MetricsController.class)
class MetricsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MetricsService metricsService;

    @Test
    @DisplayName("POST /api/v1/metrics - should ingest metrics and return 201")
    void shouldIngestMetrics() throws Exception {
        MetricIngestRequest request = MetricIngestRequest.builder()
                .sensorId(1L)
                .metrics(Map.of("temperature", 22.5))
                .build();

        when(metricsService.ingest(any())).thenReturn(
                MetricIngestResponse.builder().status("accepted").recordsInserted(1).build());

        mockMvc.perform(post("/api/v1/metrics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("accepted"))
                .andExpect(jsonPath("$.recordsInserted").value(1));
    }

    @Test
    @DisplayName("POST /api/v1/metrics - should return 400 for missing sensorId")
    void shouldRejectMissingSensorId() throws Exception {
        String body = "{\"metrics\": {\"temperature\": 22.5}}";

        mockMvc.perform(post("/api/v1/metrics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.sensorId").exists());
    }

    @Test
    @DisplayName("POST /api/v1/metrics - should return 400 for empty metrics map")
    void shouldRejectEmptyMetrics() throws Exception {
        String body = "{\"sensorId\": 1, \"metrics\": {}}";

        mockMvc.perform(post("/api/v1/metrics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.metrics").exists());
    }

    @Test
    @DisplayName("GET /api/v1/metrics/query - should return query results")
    void shouldQueryMetrics() throws Exception {
        Instant start = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant end = Instant.now();

        MetricQueryResponse response = MetricQueryResponse.builder()
                .query(MetricQueryResponse.QueryParams.builder()
                        .sensorIds(List.of(1L))
                        .metrics(List.of("temperature"))
                        .statistic("average")
                        .startDate(start)
                        .endDate(end)
                        .build())
                .results(List.of(MetricQueryResponse.SensorResult.builder()
                        .sensorId(1L)
                        .sensorName("Sensor Alpha")
                        .data(Map.of("temperature", 22.5))
                        .build()))
                .build();

        when(metricsService.query(any(), any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/metrics/query")
                        .param("sensorIds", "1")
                        .param("metrics", "temperature")
                        .param("statistic", "average")
                        .param("startDate", start.toString())
                        .param("endDate", end.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(jsonPath("$.results[0].sensorName").value("Sensor Alpha"))
                .andExpect(jsonPath("$.results[0].data.temperature").value(22.5));
    }

    @Test
    @DisplayName("GET /api/v1/metrics/query - should return 400 for missing metrics param")
    void shouldRejectMissingMetricsParam() throws Exception {
        mockMvc.perform(get("/api/v1/metrics/query")
                        .param("statistic", "average"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/metrics/batch - should return 201 with response array")
    void shouldIngestBatch() throws Exception {
        List<MetricIngestRequest> body = List.of(
                MetricIngestRequest.builder()
                        .sensorId(1L)
                        .metrics(Map.of("temperature", 22.5))
                        .build(),
                MetricIngestRequest.builder()
                        .sensorId(2L)
                        .metrics(Map.of("humidity", 55.0))
                        .build());

        List<MetricIngestResponse> responses = List.of(
                MetricIngestResponse.builder().status("accepted").recordsInserted(1).build(),
                MetricIngestResponse.builder().status("accepted").recordsInserted(1).build());

        when(metricsService.ingestBatch(any())).thenReturn(responses);

        mockMvc.perform(post("/api/v1/metrics/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].status").value("accepted"))
                .andExpect(jsonPath("$[1].recordsInserted").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/metrics/latest-all - should return paged latest metrics")
    void shouldGetLatestAllPaged() throws Exception {
        PageResponse<SensorLatestResponse> page = PageResponse.<SensorLatestResponse>builder()
                .content(List.of(SensorLatestResponse.builder()
                        .sensorId(1L)
                        .sensorName("North")
                        .location("Roof")
                        .latestMetrics(Map.of("temperature", 18.0))
                        .lastUpdated(Instant.parse("2024-06-01T12:00:00Z"))
                        .status("online")
                        .build()))
                .page(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .build();

        when(metricsService.getLatestAllPaged(0, 10)).thenReturn(page);

        mockMvc.perform(get("/api/v1/metrics/latest-all")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].sensorName").value("North"))
                .andExpect(jsonPath("$.content[0].latestMetrics.temperature").value(18.0));
    }

    @Test
    @DisplayName("GET /api/v1/metrics/stream - should return recent stream with limit")
    void shouldGetRecentStreamWithLimit() throws Exception {
        List<MetricStreamEntry> entries = List.of(
                MetricStreamEntry.builder()
                        .timestamp(Instant.parse("2024-06-01T10:00:00Z"))
                        .sensorId(3L)
                        .sensorName("East")
                        .metricType("temperature")
                        .value(19.5)
                        .build());

        when(metricsService.getRecentStream(5)).thenReturn(entries);

        mockMvc.perform(get("/api/v1/metrics/stream")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].metricType").value("temperature"))
                .andExpect(jsonPath("$[0].value").value(19.5));
    }

    @Test
    @DisplayName("GET /api/v1/metrics/throughput - should return hourly buckets for hours param")
    void shouldGetThroughputForHours() throws Exception {
        List<ThroughputEntry> entries = List.of(
                ThroughputEntry.builder()
                        .time(Instant.parse("2024-06-01T14:00:00Z"))
                        .count(120L)
                        .build());

        when(metricsService.getThroughput(12)).thenReturn(entries);

        mockMvc.perform(get("/api/v1/metrics/throughput")
                        .param("hours", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].count").value(120));
    }

    @Test
    @DisplayName("GET /api/v1/metrics/query - should query all sensors when sensorIds omitted")
    void shouldQueryMetricsWithoutSensorIds() throws Exception {
        Instant start = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant end = Instant.now();

        MetricQueryResponse response = MetricQueryResponse.builder()
                .query(MetricQueryResponse.QueryParams.builder()
                        .sensorIds(List.of())
                        .metrics(List.of("temperature"))
                        .statistic("average")
                        .startDate(start)
                        .endDate(end)
                        .build())
                .results(List.of())
                .build();

        when(metricsService.query(eq(List.of()), any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/metrics/query")
                        .param("metrics", "temperature")
                        .param("statistic", "average")
                        .param("startDate", start.toString())
                        .param("endDate", end.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isArray());

        verify(metricsService).query(eq(List.of()), eq(List.of("temperature")), eq("average"), eq(start), eq(end));
    }

    @Test
    @DisplayName("GET /api/v1/metrics/query - should accept comma-separated sensorIds")
    void shouldQueryMetricsWithCsvSensorIds() throws Exception {
        Instant start = Instant.now().minus(7, ChronoUnit.DAYS);
        Instant end = Instant.now();

        MetricQueryResponse response = MetricQueryResponse.builder()
                .query(MetricQueryResponse.QueryParams.builder()
                        .sensorIds(List.of(1L, 2L, 3L))
                        .metrics(List.of("temperature"))
                        .statistic("average")
                        .startDate(start)
                        .endDate(end)
                        .build())
                .results(List.of(MetricQueryResponse.SensorResult.builder()
                        .sensorId(1L)
                        .sensorName("S1")
                        .data(Map.of("temperature", 20.0))
                        .build()))
                .build();

        when(metricsService.query(eq(List.of(1L, 2L, 3L)), any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/metrics/query")
                        .param("sensorIds", "1,2,3")
                        .param("metrics", "temperature")
                        .param("statistic", "average")
                        .param("startDate", start.toString())
                        .param("endDate", end.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].sensorId").value(1));
    }
}
