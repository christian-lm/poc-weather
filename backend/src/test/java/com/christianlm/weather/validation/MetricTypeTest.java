package com.christianlm.weather.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("MetricType")
class MetricTypeTest {

    @ParameterizedTest
    @ValueSource(strings = {"temperature", "humidity", "wind_speed", "pressure", "precipitation"})
    @DisplayName("should accept all known metric types")
    void shouldAcceptKnownTypes(String type) {
        assertThat(MetricType.isValid(type)).isTrue();
    }

    @Test
    @DisplayName("should accept case-insensitive metric types")
    void shouldAcceptCaseInsensitive() {
        assertThat(MetricType.isValid("TEMPERATURE")).isTrue();
        assertThat(MetricType.isValid("Humidity")).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"unknown", "voltage", "unicorn_speed", ""})
    @DisplayName("should reject unknown metric types")
    void shouldRejectUnknownTypes(String type) {
        assertThat(MetricType.isValid(type)).isFalse();
    }

    @Test
    @DisplayName("should reject null metric type")
    void shouldRejectNull() {
        assertThat(MetricType.isValid(null)).isFalse();
    }
}
