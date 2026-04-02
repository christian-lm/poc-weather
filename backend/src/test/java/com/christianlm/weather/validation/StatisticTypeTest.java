package com.christianlm.weather.validation;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("StatisticType")
class StatisticTypeTest {

    @ParameterizedTest
    @CsvSource({"min,MIN", "max,MAX", "sum,SUM", "average,AVERAGE", "avg,AVERAGE"})
    @DisplayName("should parse valid statistic names")
    void shouldParseValid(String input, StatisticType expected) {
        assertThat(StatisticType.fromString(input)).isEqualTo(expected);
    }

    @Test
    @DisplayName("should be case-insensitive")
    void shouldBeCaseInsensitive() {
        assertThat(StatisticType.fromString("AVERAGE")).isEqualTo(StatisticType.AVERAGE);
        assertThat(StatisticType.fromString("Min")).isEqualTo(StatisticType.MIN);
    }

    @Test
    @DisplayName("should reject null")
    void shouldRejectNull() {
        assertThatThrownBy(() -> StatisticType.fromString(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("required");
    }

    @Test
    @DisplayName("should reject unknown statistic")
    void shouldRejectUnknown() {
        assertThatThrownBy(() -> StatisticType.fromString("median"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid statistic type");
    }
}
