package com.christianlm.weather.service;

import com.christianlm.weather.dto.PageResponse;
import com.christianlm.weather.dto.SensorRequest;
import com.christianlm.weather.dto.SensorResponse;
import com.christianlm.weather.model.Sensor;
import com.christianlm.weather.repository.SensorMetricRepository;
import com.christianlm.weather.repository.SensorRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SensorServiceTest {

    @Mock
    private SensorRepository sensorRepository;

    @Mock
    private SensorMetricRepository sensorMetricRepository;

    @InjectMocks
    private SensorService sensorService;

    @Nested
    @DisplayName("findAll (unpaginated)")
    class FindAllUnpaginatedTests {

        @Test
        @DisplayName("returns all sensors mapped to responses")
        void returnsAllSensorsMappedToResponses() {
            Instant createdAt = Instant.parse("2026-01-15T10:00:00Z");
            Sensor s1 = Sensor.builder()
                    .id(1L)
                    .name("Alpha")
                    .location("North")
                    .createdAt(createdAt)
                    .build();
            Sensor s2 = Sensor.builder()
                    .id(2L)
                    .name("Beta")
                    .location("South")
                    .createdAt(createdAt)
                    .build();
            when(sensorRepository.findAll()).thenReturn(List.of(s1, s2));

            List<SensorResponse> result = sensorService.findAll();

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getId()).isEqualTo(1L);
            assertThat(result.get(0).getName()).isEqualTo("Alpha");
            assertThat(result.get(0).getLocation()).isEqualTo("North");
            assertThat(result.get(0).getCreatedAt()).isEqualTo(createdAt);
            assertThat(result.get(1).getId()).isEqualTo(2L);
            assertThat(result.get(1).getName()).isEqualTo("Beta");
        }
    }

    @Nested
    @DisplayName("findAll (paginated)")
    class FindAllPaginatedTests {

        @Test
        @DisplayName("returns page without search filter")
        void returnsPageWithoutSearchFilter() {
            Pageable pageable = PageRequest.of(0, 10);
            Instant createdAt = Instant.now();
            Sensor sensor = Sensor.builder()
                    .id(1L)
                    .name("Alpha")
                    .location("North")
                    .createdAt(createdAt)
                    .build();
            Page<Sensor> page = new PageImpl<>(List.of(sensor), pageable, 1);
            when(sensorRepository.findAll(pageable)).thenReturn(page);

            PageResponse<SensorResponse> result = sensorService.findAll(null, pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("Alpha");
            assertThat(result.getPage()).isZero();
            assertThat(result.getSize()).isEqualTo(10);
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getTotalPages()).isEqualTo(1);
            verify(sensorRepository).findAll(pageable);
            verify(sensorRepository, never()).findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(
                    anyString(), anyString(), any(Pageable.class));
        }

        @Test
        @DisplayName("returns page with search filter")
        void returnsPageWithSearchFilter() {
            Pageable pageable = PageRequest.of(1, 5);
            Instant createdAt = Instant.now();
            Sensor sensor = Sensor.builder()
                    .id(3L)
                    .name("Gamma")
                    .location("East")
                    .createdAt(createdAt)
                    .build();
            Page<Sensor> springPage = new PageImpl<>(List.of(sensor), pageable, 11);
            when(sensorRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(
                    eq("roof"), eq("roof"), eq(pageable)))
                    .thenReturn(springPage);

            PageResponse<SensorResponse> result = sensorService.findAll("  roof  ", pageable);

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("Gamma");
            assertThat(result.getPage()).isEqualTo(1);
            assertThat(result.getSize()).isEqualTo(5);
            assertThat(result.getTotalElements()).isEqualTo(11);
            verify(sensorRepository).findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(
                    "roof", "roof", pageable);
            verify(sensorRepository, never()).findAll(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("findById")
    class FindByIdTests {

        @Test
        @DisplayName("returns sensor when found")
        void returnsSensorWhenFound() {
            Instant createdAt = Instant.parse("2026-03-01T12:00:00Z");
            Sensor sensor = Sensor.builder()
                    .id(5L)
                    .name("Delta")
                    .location("West")
                    .createdAt(createdAt)
                    .build();
            when(sensorRepository.findById(5L)).thenReturn(Optional.of(sensor));

            SensorResponse result = sensorService.findById(5L);

            assertThat(result.getId()).isEqualTo(5L);
            assertThat(result.getName()).isEqualTo("Delta");
            assertThat(result.getLocation()).isEqualTo("West");
            assertThat(result.getCreatedAt()).isEqualTo(createdAt);
        }

        @Test
        @DisplayName("throws EntityNotFoundException when not found")
        void throwsWhenNotFound() {
            when(sensorRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> sensorService.findById(99L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("99");
        }
    }

    @Nested
    @DisplayName("create")
    class CreateTests {

        @Test
        @DisplayName("creates sensor successfully")
        void createsSensorSuccessfully() {
            Instant createdAt = Instant.parse("2026-04-01T08:30:00Z");
            when(sensorRepository.existsByName("NewSensor")).thenReturn(false);
            when(sensorRepository.save(any(Sensor.class))).thenAnswer(inv -> {
                Sensor in = inv.getArgument(0);
                return Sensor.builder()
                        .id(7L)
                        .name(in.getName())
                        .location(in.getLocation())
                        .createdAt(createdAt)
                        .build();
            });

            SensorRequest request = SensorRequest.builder()
                    .name("NewSensor")
                    .location("Lab")
                    .build();

            SensorResponse result = sensorService.create(request);

            assertThat(result.getId()).isEqualTo(7L);
            assertThat(result.getName()).isEqualTo("NewSensor");
            assertThat(result.getLocation()).isEqualTo("Lab");
            assertThat(result.getCreatedAt()).isEqualTo(createdAt);
            verify(sensorRepository).save(any(Sensor.class));
        }

        @Test
        @DisplayName("throws IllegalArgumentException for duplicate name")
        void throwsForDuplicateName() {
            when(sensorRepository.existsByName("Taken")).thenReturn(true);

            SensorRequest request = SensorRequest.builder()
                    .name("Taken")
                    .location("Any")
                    .build();

            assertThatThrownBy(() -> sensorService.create(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Taken");
            verify(sensorRepository, never()).save(any(Sensor.class));
        }
    }

    @Nested
    @DisplayName("update")
    class UpdateTests {

        @Test
        @DisplayName("updates sensor successfully")
        void updatesSensorSuccessfully() {
            Instant createdAt = Instant.parse("2026-02-01T00:00:00Z");
            Sensor existing = Sensor.builder()
                    .id(10L)
                    .name("OldName")
                    .location("OldLoc")
                    .createdAt(createdAt)
                    .build();
            when(sensorRepository.findById(10L)).thenReturn(Optional.of(existing));
            when(sensorRepository.existsByName("NewName")).thenReturn(false);
            when(sensorRepository.save(any(Sensor.class))).thenAnswer(inv -> inv.getArgument(0));

            SensorRequest request = SensorRequest.builder()
                    .name("NewName")
                    .location("NewLoc")
                    .build();

            SensorResponse result = sensorService.update(10L, request);

            assertThat(result.getId()).isEqualTo(10L);
            assertThat(result.getName()).isEqualTo("NewName");
            assertThat(result.getLocation()).isEqualTo("NewLoc");
            assertThat(result.getCreatedAt()).isEqualTo(createdAt);
        }

        @Test
        @DisplayName("throws EntityNotFoundException when sensor not found")
        void throwsWhenSensorNotFound() {
            when(sensorRepository.findById(404L)).thenReturn(Optional.empty());

            SensorRequest request = SensorRequest.builder().name("X").location("Y").build();

            assertThatThrownBy(() -> sensorService.update(404L, request))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("404");
        }

        @Test
        @DisplayName("throws IllegalArgumentException for duplicate name when name changes")
        void throwsForDuplicateNameWhenNameChanges() {
            Sensor existing = Sensor.builder()
                    .id(2L)
                    .name("Original")
                    .location("L")
                    .createdAt(Instant.now())
                    .build();
            when(sensorRepository.findById(2L)).thenReturn(Optional.of(existing));
            when(sensorRepository.existsByName("Other")).thenReturn(true);

            SensorRequest request = SensorRequest.builder()
                    .name("Other")
                    .location("L")
                    .build();

            assertThatThrownBy(() -> sensorService.update(2L, request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Other");
            verify(sensorRepository, never()).save(any(Sensor.class));
        }
    }

    @Nested
    @DisplayName("delete")
    class DeleteTests {

        @Test
        @DisplayName("deletes sensor and metrics successfully")
        void deletesSensorAndMetricsSuccessfully() {
            Sensor sensor = Sensor.builder()
                    .id(8L)
                    .name("ToDelete")
                    .location("Here")
                    .createdAt(Instant.now())
                    .build();
            when(sensorRepository.findById(8L)).thenReturn(Optional.of(sensor));

            sensorService.delete(8L);

            InOrder inOrder = inOrder(sensorMetricRepository, sensorRepository);
            inOrder.verify(sensorMetricRepository).deleteBySensorId(8L);
            inOrder.verify(sensorRepository).delete(sensor);
        }

        @Test
        @DisplayName("throws EntityNotFoundException when sensor not found")
        void throwsWhenSensorNotFound() {
            when(sensorRepository.findById(77L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> sensorService.delete(77L))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("77");
            verify(sensorMetricRepository, never()).deleteBySensorId(anyLong());
            verify(sensorRepository, never()).delete(any(Sensor.class));
        }
    }
}
