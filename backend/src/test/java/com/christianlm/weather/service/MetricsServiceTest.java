package com.christianlm.weather.service;

import com.christianlm.weather.dto.MetricIngestRequest;
import com.christianlm.weather.dto.MetricIngestResponse;
import com.christianlm.weather.dto.MetricQueryResponse;
import com.christianlm.weather.dto.MetricStreamEntry;
import com.christianlm.weather.dto.PageResponse;
import com.christianlm.weather.dto.SensorLatestResponse;
import com.christianlm.weather.dto.ThroughputEntry;
import com.christianlm.weather.model.Sensor;
import com.christianlm.weather.repository.MetricAggregationResult;
import com.christianlm.weather.repository.RecentMetricResult;
import com.christianlm.weather.repository.SensorMetricRepository;
import com.christianlm.weather.repository.SensorRepository;
import com.christianlm.weather.repository.ThroughputBucket;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

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

    @Nested
    @DisplayName("IngestBatch")
    class IngestBatchTests {

        @Test
        @DisplayName("should ingest batch of metrics successfully")
        void shouldIngestBatchOfMetricsSuccessfully() {
            when(sensorRepository.existsById(1L)).thenReturn(true);
            when(sensorRepository.existsById(2L)).thenReturn(true);
            when(metricRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

            List<MetricIngestRequest> requests = List.of(
                    MetricIngestRequest.builder()
                            .sensorId(1L)
                            .metrics(Map.of("temperature", 22.5))
                            .build(),
                    MetricIngestRequest.builder()
                            .sensorId(2L)
                            .metrics(Map.of("humidity", 65.0))
                            .build());

            List<MetricIngestResponse> responses = metricsService.ingestBatch(requests);

            assertThat(responses).hasSize(2);
            assertThat(responses).extracting(MetricIngestResponse::getStatus).containsOnly("accepted");
        }
    }

    @Nested
    @DisplayName("GetLatestAllPaged")
    class GetLatestAllPagedTests {

        @Test
        @DisplayName("should return paginated latest metrics")
        void shouldReturnPaginatedLatestMetrics() {
            Sensor sensor = Sensor.builder().id(1L).name("Sensor Alpha").location("North").build();
            Pageable pageable = PageRequest.of(0, 10,
                    Sort.by("location").ascending().and(Sort.by("name").ascending()));
            Page<Sensor> sensorPage = new PageImpl<>(List.of(sensor), pageable, 1);
            when(sensorRepository.findAll(any(Pageable.class))).thenReturn(sensorPage);

            MetricAggregationResult row = mockResult(1L, "temperature", 22.5);
            when(metricRepository.findLatestBySensorIds(List.of(1L))).thenReturn(List.of(row));

            PageResponse<SensorLatestResponse> response = metricsService.getLatestAllPaged(0, 10);

            assertThat(response.getContent()).hasSize(1);
            assertThat(response.getContent().get(0).getSensorName()).isEqualTo("Sensor Alpha");
            assertThat(response.getContent().get(0).getLatestMetrics()).containsEntry("temperature", 22.5);
        }
    }

    @Nested
    @DisplayName("GetRecentStream")
    class GetRecentStreamTests {

        @Test
        @DisplayName("should return recent stream entries")
        void shouldReturnRecentStreamEntries() {
            Instant t1 = Instant.now();
            Instant t2 = t1.minusSeconds(1);

            RecentMetricResult result1 = mock(RecentMetricResult.class);
            when(result1.getTime()).thenReturn(t1);
            when(result1.getSensorId()).thenReturn(1L);
            when(result1.getMetricType()).thenReturn("temperature");
            when(result1.getValue()).thenReturn(22.0);

            RecentMetricResult result2 = mock(RecentMetricResult.class);
            when(result2.getTime()).thenReturn(t2);
            when(result2.getSensorId()).thenReturn(2L);
            when(result2.getMetricType()).thenReturn("humidity");
            when(result2.getValue()).thenReturn(55.0);

            when(metricRepository.findRecentMetrics(5)).thenReturn(List.of(result1, result2));

            Sensor s1 = Sensor.builder().id(1L).name("Alpha").build();
            Sensor s2 = Sensor.builder().id(2L).name("Beta").build();
            when(sensorRepository.findAll()).thenReturn(List.of(s1, s2));

            List<MetricStreamEntry> entries = metricsService.getRecentStream(5);

            assertThat(entries).hasSize(2);
            assertThat(entries.get(0).getSensorName()).isEqualTo("Alpha");
            assertThat(entries.get(1).getSensorName()).isEqualTo("Beta");
        }
    }

    @Nested
    @DisplayName("GetThroughput")
    class GetThroughputTests {

        @Test
        @DisplayName("should return throughput buckets")
        void shouldReturnThroughputBuckets() {
            ThroughputBucket bucket1 = mock(ThroughputBucket.class);
            when(bucket1.getBucketTime()).thenReturn(Instant.now());
            when(bucket1.getCount()).thenReturn(10L);

            ThroughputBucket bucket2 = mock(ThroughputBucket.class);
            when(bucket2.getBucketTime()).thenReturn(Instant.now().minusSeconds(3600));
            when(bucket2.getCount()).thenReturn(20L);

            ThroughputBucket bucket3 = mock(ThroughputBucket.class);
            when(bucket3.getBucketTime()).thenReturn(Instant.now().minusSeconds(7200));
            when(bucket3.getCount()).thenReturn(30L);

            when(metricRepository.findThroughputBuckets(any(Instant.class)))
                    .thenReturn(List.of(bucket1, bucket2, bucket3));

            List<ThroughputEntry> entries = metricsService.getThroughput(24);

            assertThat(entries).hasSize(3);
        }
    }
}
