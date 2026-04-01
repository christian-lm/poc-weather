package com.christianlm.weather.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.christianlm.weather.dto.PageResponse;
import com.christianlm.weather.dto.SensorRequest;
import com.christianlm.weather.dto.SensorResponse;
import com.christianlm.weather.exception.GlobalExceptionHandler;
import com.christianlm.weather.service.SensorService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SensorController.class)
@Import(GlobalExceptionHandler.class)
class SensorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SensorService sensorService;

    @Test
    @DisplayName("GET /api/v1/sensors - returns paginated sensor list")
    void listReturnsPaginatedSensors() throws Exception {
        Instant created = Instant.parse("2024-06-01T12:00:00Z");
        SensorResponse s1 = SensorResponse.builder()
                .id(1L)
                .name("Alpha")
                .location("North")
                .createdAt(created)
                .build();

        PageResponse<SensorResponse> page = PageResponse.<SensorResponse>builder()
                .content(List.of(s1))
                .page(0)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .build();

        when(sensorService.findAll(any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/sensors").param("page", "0").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].name").value("Alpha"))
                .andExpect(jsonPath("$.content[0].location").value("North"))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    @DisplayName("GET /api/v1/sensors - applies search parameter")
    void listAppliesSearchParameter() throws Exception {
        PageResponse<SensorResponse> page = PageResponse.<SensorResponse>builder()
                .content(Collections.emptyList())
                .page(0)
                .size(20)
                .totalElements(0)
                .totalPages(0)
                .build();

        when(sensorService.findAll(eq("roof"), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/sensors").param("search", "roof"))
                .andExpect(status().isOk());

        verify(sensorService).findAll(eq("roof"), any(Pageable.class));
    }

    @Test
    @DisplayName("GET /api/v1/sensors - uses default pagination when params omitted")
    void listUsesDefaultPagination() throws Exception {
        PageResponse<SensorResponse> page = PageResponse.<SensorResponse>builder()
                .content(Collections.emptyList())
                .page(0)
                .size(20)
                .totalElements(0)
                .totalPages(0)
                .build();

        when(sensorService.findAll(isNull(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/sensors"))
                .andExpect(status().isOk());

        verify(sensorService).findAll(isNull(), argThat(p ->
                p.getPageNumber() == 0 && p.getPageSize() == 20));
    }

    @Test
    @DisplayName("GET /api/v1/sensors/{id} - returns sensor when found")
    void getByIdReturnsSensor() throws Exception {
        Instant created = Instant.parse("2024-06-01T12:00:00Z");
        SensorResponse response = SensorResponse.builder()
                .id(5L)
                .name("Beta")
                .location("South")
                .createdAt(created)
                .build();

        when(sensorService.findById(5L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/sensors/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.name").value("Beta"))
                .andExpect(jsonPath("$.location").value("South"));
    }

    @Test
    @DisplayName("GET /api/v1/sensors/{id} - returns 404 when not found")
    void getByIdReturns404WhenNotFound() throws Exception {
        doThrow(new EntityNotFoundException("Sensor not found with id: 99"))
                .when(sensorService).findById(99L);

        mockMvc.perform(get("/api/v1/sensors/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("POST /api/v1/sensors - creates sensor and returns 201")
    void createReturns201() throws Exception {
        Instant created = Instant.parse("2024-06-01T12:00:00Z");
        SensorResponse createdBody = SensorResponse.builder()
                .id(3L)
                .name("Gamma")
                .location("East")
                .createdAt(created)
                .build();

        when(sensorService.create(any(SensorRequest.class))).thenReturn(createdBody);

        SensorRequest request = SensorRequest.builder()
                .name("Gamma")
                .location("East")
                .build();

        mockMvc.perform(post("/api/v1/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.name").value("Gamma"))
                .andExpect(jsonPath("$.location").value("East"));
    }

    @Test
    @DisplayName("POST /api/v1/sensors - returns 400 for blank name")
    void createRejectsBlankName() throws Exception {
        String body = "{\"name\": \"   \", \"location\": \"Here\"}";

        mockMvc.perform(post("/api/v1/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.name").exists());
    }

    @Test
    @DisplayName("POST /api/v1/sensors - returns 400 for name exceeding 100 chars")
    void createRejectsLongName() throws Exception {
        String longName = "a".repeat(101);
        String body = String.format("{\"name\": \"%s\", \"location\": \"Here\"}", longName);

        mockMvc.perform(post("/api/v1/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.name").exists());
    }

    @Test
    @DisplayName("PUT /api/v1/sensors/{id} - updates sensor successfully")
    void updateSucceeds() throws Exception {
        Instant created = Instant.parse("2024-06-01T12:00:00Z");
        SensorResponse updated = SensorResponse.builder()
                .id(7L)
                .name("Delta")
                .location("West")
                .createdAt(created)
                .build();

        when(sensorService.update(eq(7L), any(SensorRequest.class))).thenReturn(updated);

        SensorRequest request = SensorRequest.builder()
                .name("Delta")
                .location("West")
                .build();

        mockMvc.perform(put("/api/v1/sensors/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.name").value("Delta"));
    }

    @Test
    @DisplayName("PUT /api/v1/sensors/{id} - returns 404 when sensor not found")
    void updateReturns404WhenNotFound() throws Exception {
        doThrow(new EntityNotFoundException("Sensor not found with id: 42"))
                .when(sensorService).update(eq(42L), any(SensorRequest.class));

        SensorRequest request = SensorRequest.builder()
                .name("X")
                .location("Y")
                .build();

        mockMvc.perform(put("/api/v1/sensors/42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/v1/sensors/{id} - returns 400 for validation errors")
    void updateRejectsInvalidBody() throws Exception {
        String body = "{\"name\": \"\", \"location\": \"Here\"}";

        mockMvc.perform(put("/api/v1/sensors/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.name").exists());
    }

    @Test
    @DisplayName("DELETE /api/v1/sensors/{id} - deletes sensor and returns 204")
    void deleteReturns204() throws Exception {
        doNothing().when(sensorService).delete(8L);

        mockMvc.perform(delete("/api/v1/sensors/8"))
                .andExpect(status().isNoContent());

        verify(sensorService).delete(8L);
    }

    @Test
    @DisplayName("DELETE /api/v1/sensors/{id} - returns 404 when sensor not found")
    void deleteReturns404WhenNotFound() throws Exception {
        doThrow(new EntityNotFoundException("Sensor not found with id: 55"))
                .when(sensorService).delete(55L);

        mockMvc.perform(delete("/api/v1/sensors/55"))
                .andExpect(status().isNotFound());
    }
}
