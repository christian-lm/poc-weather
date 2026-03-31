package com.christianlm.weather.controller;

import com.christianlm.weather.dto.SensorRequest;
import com.christianlm.weather.dto.SensorResponse;
import com.christianlm.weather.service.SensorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for sensor registration and lookup.
 */
@RestController
@RequestMapping("/api/v1/sensors")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;

    /** Lists all registered sensors. */
    @GetMapping
    public ResponseEntity<List<SensorResponse>> listAll() {
        return ResponseEntity.ok(sensorService.findAll());
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
}
