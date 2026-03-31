package com.christianlm.weather.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.christianlm.weather.dto.MetricIngestRequest;
import com.christianlm.weather.dto.MetricIngestResponse;
import com.christianlm.weather.dto.MetricQueryResponse;
import com.christianlm.weather.service.MetricsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.bean.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
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
}
