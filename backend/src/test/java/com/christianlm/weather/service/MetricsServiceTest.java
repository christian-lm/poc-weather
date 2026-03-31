package com.christianlm.weather.service;

import com.christianlm.weather.dto.MetricIngestRequest;
import com.christianlm.weather.dto.MetricIngestResponse;
import com.christianlm.weather.dto.MetricQueryResponse;
import com.christianlm.weather.model.Sensor;
import com.christianlm.weather.repository.MetricAggregationResult;
import com.christianlm.weather.repository.SensorMetricRepository;
import com.christianlm.weather.repository.SensorRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MetricsServiceTest {

    @Mock
    private SensorMetricRepository metricRepository;

    @Mock
    private SensorRepository sensorRepository;

    @InjectMocks
    private MetricsService metricsService;

    /** Helper to create a mock projection result. */
    private MetricAggregationResult mockResult(Long sensorId, String metricType, Double value) {
        MetricAggregationResult result = mock(MetricAggregationResult.class);
        when(result.getSensorId()).thenReturn(sensorId);
        when(result.getMetricType()).thenReturn(metricType);
        when(result.getStatValue()).thenReturn(value);
        return result;
    }

    @Nested
    @DisplayName("Ingest")
    class IngestTests {

        @Test
        @DisplayName("should ingest valid metrics successfully")
        void shouldIngestValidMetrics() {
            when(sensorRepository.existsById(1L)).thenReturn(true);
            when(metricRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

            MetricIngestRequest request = MetricIngestRequest.builder()
                    .sensorId(1L)
                    .metrics(Map.of("temperature", 22.5, "humidity", 65.0))
                    .build();

            MetricIngestResponse response = metricsService.ingest(request);

            assertThat(response.getStatus()).isEqualTo("accepted");
            assertThat(response.getRecordsInserted()).isEqualTo(2);
            verify(metricRepository).saveAll(argThat(list -> list.size() == 2));
        }

        @Test
        @DisplayName("should reject unknown sensor id")
        void shouldRejectUnknownSensor() {
            when(sensorRepository.existsById(999L)).thenReturn(false);

            MetricIngestRequest request = MetricIngestRequest.builder()
                    .sensorId(999L)
                    .metrics(Map.of("temperature", 22.5))
                    .build();

            assertThatThrownBy(() -> metricsService.ingest(request))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("999");
        }

        @Test
        @DisplayName("should reject invalid metric types")
        void shouldRejectInvalidMetricTypes() {
            when(sensorRepository.existsById(1L)).thenReturn(true);

            MetricIngestRequest request = MetricIngestRequest.builder()
                    .sensorId(1L)
                    .metrics(Map.of("invalid_metric", 10.0))
                    .build();

            assertThatThrownBy(() -> metricsService.ingest(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid metric types");
        }
    }

    @Nested
    @DisplayName("Query")
    class QueryTests {

        @Test
        @DisplayName("should query average metrics for date range")
        void shouldQueryAverageForDateRange() {
            Instant start = Instant.now().minus(7, ChronoUnit.DAYS);
            Instant end = Instant.now();

            Sensor sensor = Sensor.builder().id(1L).name("Sensor Alpha").build();
            when(sensorRepository.findAllById(List.of(1L))).thenReturn(List.of(sensor));

            MetricAggregationResult row = mockResult(1L, "temperature", 22.5);
            when(metricRepository.findAverageBySensorsAndMetrics(
                    eq(List.of(1L)), eq(List.of("temperature")), any(), any()))
                    .thenReturn(List.of(row));

            MetricQueryResponse response = metricsService.query(
                    List.of(1L), List.of("temperature"), "average", start, end);

            assertThat(response.getResults()).hasSize(1);
            assertThat(response.getResults().get(0).getSensorName()).isEqualTo("Sensor Alpha");
            assertThat(response.getResults().get(0).getData()).containsEntry("temperature", 22.5);
            assertThat(response.getQuery().getStatistic()).isEqualTo("average");
        }

        @Test
        @DisplayName("should reject date range exceeding 31 days")
        void shouldRejectExcessiveDateRange() {
            Instant start = Instant.now().minus(60, ChronoUnit.DAYS);
            Instant end = Instant.now();

            Sensor sensor = Sensor.builder().id(1L).name("S1").build();
            when(sensorRepository.findAllById(List.of(1L))).thenReturn(List.of(sensor));

            assertThatThrownBy(() -> metricsService.query(
                    List.of(1L), List.of("temperature"), "average", start, end))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("31 days");
        }

        @Test
        @DisplayName("should reject startDate after endDate")
        void shouldRejectInvertedDates() {
            Instant start = Instant.now();
            Instant end = Instant.now().minus(7, ChronoUnit.DAYS);

            Sensor sensor = Sensor.builder().id(1L).name("S1").build();
            when(sensorRepository.findAllById(List.of(1L))).thenReturn(List.of(sensor));

            assertThatThrownBy(() -> metricsService.query(
                    List.of(1L), List.of("temperature"), "average", start, end))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("before");
        }

        @Test
        @DisplayName("should reject invalid statistic type")
        void shouldRejectInvalidStatistic() {
            Sensor sensor = Sensor.builder().id(1L).name("S1").build();
            when(sensorRepository.findAllById(List.of(1L))).thenReturn(List.of(sensor));

            assertThatThrownBy(() -> metricsService.query(
                    List.of(1L), List.of("temperature"), "median",
                    Instant.now().minus(7, ChronoUnit.DAYS), Instant.now()))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid statistic type");
        }
    }
}
