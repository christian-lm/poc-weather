package com.christianlm.weather.exception;

import com.christianlm.weather.dto.SensorRequest;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @RestController
    static class TestController {

        @GetMapping("/test/illegal-argument")
        void throwIllegalArgument() {
            throw new IllegalArgumentException("Bad input");
        }

        @GetMapping("/test/not-found")
        void throwNotFound() {
            throw new EntityNotFoundException("Sensor not found");
        }

        @GetMapping("/test/generic")
        void throwGeneric() {
            throw new RuntimeException("Unexpected");
        }

        @GetMapping("/test/missing-param")
        void missingParam(@RequestParam String required) {
        }

        @PostMapping("/test/validation")
        void validate(@Valid @RequestBody SensorRequest request) {
        }
    }

    @BeforeEach
    void setUp() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    @DisplayName("IllegalArgumentException returns 400 with exception message in body")
    void illegalArgumentReturns400WithMessage() throws Exception {
        mockMvc.perform(get("/test/illegal-argument"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Bad input"))
                .andExpect(jsonPath("$.path").value("/test/illegal-argument"));
    }

    @Test
    @DisplayName("EntityNotFoundException returns 404 with exception message in body")
    void entityNotFoundReturns404WithMessage() throws Exception {
        mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Sensor not found"))
                .andExpect(jsonPath("$.path").value("/test/not-found"));
    }

    @Test
    @DisplayName("MissingServletRequestParameterException returns 400 and names the missing parameter")
    void missingParameterReturns400() throws Exception {
        mockMvc.perform(get("/test/missing-param"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Missing required parameter: required"))
                .andExpect(jsonPath("$.path").value("/test/missing-param"));
    }

    @Test
    @DisplayName("MethodArgumentNotValidException returns 400 with validationErrors map")
    void validationFailureReturns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.message").value("Request body contains invalid fields"))
                .andExpect(jsonPath("$.validationErrors.name").value("Sensor name is required"))
                .andExpect(jsonPath("$.path").value("/test/validation"));
    }

    @Test
    @DisplayName("Unhandled exception returns 500 with generic message")
    void genericExceptionReturns500() throws Exception {
        mockMvc.perform(get("/test/generic"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.error").value("Internal Server Error"))
                .andExpect(jsonPath("$.message").value("An unexpected error occurred"))
                .andExpect(jsonPath("$.path").value("/test/generic"));
    }
}
