package com.christianlm.weather.service;

import com.christianlm.weather.dto.PageResponse;
import com.christianlm.weather.dto.SensorRequest;
import com.christianlm.weather.dto.SensorResponse;
import com.christianlm.weather.model.Sensor;
import com.christianlm.weather.repository.SensorMetricRepository;
import com.christianlm.weather.repository.SensorRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing sensor registration and lookup.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SensorService {

    private final SensorRepository sensorRepository;
    private final SensorMetricRepository sensorMetricRepository;

    /**
     * Returns all registered sensors (unpaginated, used internally).
     */
    @Transactional(readOnly = true)
    public List<SensorResponse> findAll() {
        return sensorRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns a paginated, optionally filtered list of sensors.
     *
     * @param search   free-text filter matched against name or location (nullable)
     * @param pageable pagination and sort parameters
     * @return page of sensor responses
     */
    @Transactional(readOnly = true)
    public PageResponse<SensorResponse> findAll(String search, Pageable pageable) {
        Page<Sensor> page;
        if (search != null && !search.isBlank()) {
            page = sensorRepository.findByNameContainingIgnoreCaseOrLocationContainingIgnoreCase(
                    search.trim(), search.trim(), pageable);
        } else {
            page = sensorRepository.findAll(pageable);
        }
        return PageResponse.of(page.map(this::toResponse));
    }

    /**
     * Finds a sensor by its ID.
     *
     * @param id sensor primary key
     * @return sensor details
     * @throws EntityNotFoundException if the sensor does not exist
     */
    @Transactional(readOnly = true)
    public SensorResponse findById(Long id) {
        return sensorRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Sensor not found with id: " + id));
    }

    /**
     * Registers a new sensor. Name must be unique.
     *
     * @param request sensor name and optional location
     * @return the created sensor with its generated ID
     * @throws IllegalArgumentException if a sensor with the same name already exists
     */
    @Transactional
    public SensorResponse create(SensorRequest request) {
        if (sensorRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Sensor with name '" + request.getName() + "' already exists");
        }

        Sensor sensor = Sensor.builder()
                .name(request.getName())
                .location(request.getLocation())
                .build();

        Sensor saved = sensorRepository.save(sensor);
        log.info("Created sensor: id={}, name={}", saved.getId(), saved.getName());
        return toResponse(saved);
    }

    /**
     * Updates an existing sensor's name and/or location.
     */
    @Transactional
    public SensorResponse update(Long id, SensorRequest request) {
        Sensor sensor = sensorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sensor not found with id: " + id));

        if (!sensor.getName().equals(request.getName()) && sensorRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Sensor with name '" + request.getName() + "' already exists");
        }

        sensor.setName(request.getName());
        sensor.setLocation(request.getLocation());
        Sensor saved = sensorRepository.save(sensor);
        log.info("Updated sensor: id={}, name={}", saved.getId(), saved.getName());
        return toResponse(saved);
    }

    /**
     * Deletes a sensor and all its associated metric data.
     */
    @Transactional
    public void delete(Long id) {
        Sensor sensor = sensorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sensor not found with id: " + id));
        sensorMetricRepository.deleteBySensorId(id);
        sensorRepository.delete(sensor);
        log.info("Deleted sensor: id={}, name={}", sensor.getId(), sensor.getName());
    }

    private SensorResponse toResponse(Sensor sensor) {
        return SensorResponse.builder()
                .id(sensor.getId())
                .name(sensor.getName())
                .location(sensor.getLocation())
                .createdAt(sensor.getCreatedAt())
                .build();
    }
}
