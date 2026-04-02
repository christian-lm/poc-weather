package com.christianlm.weather.integration;

import com.christianlm.weather.dto.MetricIngestRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * End-to-end integration test using a real PostgreSQL (TimescaleDB) container.
 * Flyway migrations run automatically, seeding the database.
 * Tests exercise the full request path: controller -> service -> repository -> DB.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class MetricsIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            "timescale/timescaledb:latest-pg16")
            .withDatabaseName("weatherdb_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Full flow: create sensor, ingest metric, query it back")
    void fullSensorLifecycle() throws Exception {
        String sensorBody = objectMapper.writeValueAsString(
                Map.of("name", "Integration Test Sensor", "location", "Lab"));

        String sensorResponse = mockMvc.perform(post("/api/v1/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andReturn().getResponse().getContentAsString();

        long sensorId = objectMapper.readTree(sensorResponse).get("id").asLong();

        MetricIngestRequest ingestRequest = MetricIngestRequest.builder()
                .sensorId(sensorId)
                .metrics(Map.of("temperature", 22.5, "humidity", 65.0))
                .build();

        mockMvc.perform(post("/api/v1/metrics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ingestRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.recordsInserted").value(2));

        mockMvc.perform(get("/api/v1/metrics/query")
                        .param("sensorIds", String.valueOf(sensorId))
                        .param("metrics", "temperature,humidity")
                        .param("statistic", "average"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isArray())
                .andExpect(jsonPath("$.results[0].sensorId").value(sensorId));
    }

    @Test
    @DisplayName("Duplicate ingestion: same sensor+metric+timestamp inserts separate rows")
    void duplicateIngestionCreatesMultipleRows() throws Exception {
        String sensorBody = objectMapper.writeValueAsString(
                Map.of("name", "Dup Test Sensor", "location", "Lab"));

        String sensorResponse = mockMvc.perform(post("/api/v1/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long sensorId = objectMapper.readTree(sensorResponse).get("id").asLong();

        String timestamp = "2026-01-15T12:00:00Z";
        MetricIngestRequest request = MetricIngestRequest.builder()
                .sensorId(sensorId)
                .timestamp(java.time.Instant.parse(timestamp))
                .metrics(Map.of("temperature", 20.0))
                .build();

        mockMvc.perform(post("/api/v1/metrics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        MetricIngestRequest duplicate = MetricIngestRequest.builder()
                .sensorId(sensorId)
                .timestamp(java.time.Instant.parse(timestamp))
                .metrics(Map.of("temperature", 25.0))
                .build();

        mockMvc.perform(post("/api/v1/metrics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Batch ingestion respects max batch size limit")
    void batchSizeLimitShouldReject() throws Exception {
        String sensorBody = objectMapper.writeValueAsString(
                Map.of("name", "Batch Limit Sensor", "location", "Lab"));

        String sensorResponse = mockMvc.perform(post("/api/v1/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long sensorId = objectMapper.readTree(sensorResponse).get("id").asLong();

        List<MetricIngestRequest> oversizedBatch = java.util.stream.IntStream.range(0, 101)
                .mapToObj(i -> MetricIngestRequest.builder()
                        .sensorId(sensorId)
                        .metrics(Map.of("temperature", 20.0 + i * 0.1))
                        .build())
                .toList();

        mockMvc.perform(post("/api/v1/metrics/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oversizedBatch)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("exceeds maximum")));
    }

    @Test
    @DisplayName("Query for non-existent sensor ID returns empty results")
    void queryNonExistentSensorReturnsEmpty() throws Exception {
        mockMvc.perform(get("/api/v1/metrics/query")
                        .param("sensorIds", "99999")
                        .param("metrics", "temperature")
                        .param("statistic", "average"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isEmpty());
    }

    @Test
    @DisplayName("Ingest with unknown sensor ID returns 404")
    void ingestUnknownSensorReturns404() throws Exception {
        MetricIngestRequest request = MetricIngestRequest.builder()
                .sensorId(99999L)
                .metrics(Map.of("temperature", 20.0))
                .build();

        mockMvc.perform(post("/api/v1/metrics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Ingest with invalid metric type returns 400")
    void ingestInvalidMetricTypeReturns400() throws Exception {
        String sensorBody = objectMapper.writeValueAsString(
                Map.of("name", "Invalid Metric Sensor", "location", "Lab"));

        String sensorResponse = mockMvc.perform(post("/api/v1/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sensorBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        long sensorId = objectMapper.readTree(sensorResponse).get("id").asLong();

        MetricIngestRequest request = MetricIngestRequest.builder()
                .sensorId(sensorId)
                .metrics(Map.of("unicorn_speed", 42.0))
                .build();

        mockMvc.perform(post("/api/v1/metrics")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
