package com.christianlm.weather.controller;

import com.christianlm.weather.dto.PageResponse;
import com.christianlm.weather.dto.SensorRequest;
import com.christianlm.weather.dto.SensorResponse;
import com.christianlm.weather.service.SensorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for sensor registration and lookup.
 */
@RestController
@RequestMapping("/api/v1/sensors")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;

    /** Lists sensors with server-side pagination and optional text search. */
    @GetMapping
    public ResponseEntity<PageResponse<SensorResponse>> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        PageRequest pageable = PageRequest.of(page, Math.min(size, 500), Sort.by("name").ascending());
        return ResponseEntity.ok(sensorService.findAll(search, pageable));
    }

    /** Retrieves a single sensor by its ID. */
    @GetMapping("/{id}")
    public ResponseEntity<SensorResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sensorService.findById(id));
    }

    /** Registers a new sensor. Returns 201 on success. */
    @PostMapping
    public ResponseEntity<SensorResponse> create(@Valid @RequestBody SensorRequest request) {
        SensorResponse created = sensorService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** Updates an existing sensor's name and/or location. */
    @PutMapping("/{id}")
    public ResponseEntity<SensorResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody SensorRequest request) {
        return ResponseEntity.ok(sensorService.update(id, request));
    }

    /** Deletes a sensor and all its associated metric data. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sensorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
