package com.christianlm.weather.validation;

import java.util.Set;

/**
 * Enum representing the aggregation functions available for metric queries.
 * Parses from user-provided strings with case-insensitive matching.
 */
public enum StatisticType {
    MIN, MAX, SUM, AVERAGE;

    public static final Set<String> ALLOWED_VALUES = Set.of("min", "max", "sum", "average");

    /**
     * Parses a string into a StatisticType. Accepts "avg" as alias for "average".
     *
     * @param value the user-provided statistic name
     * @return the corresponding enum value
     * @throws IllegalArgumentException if the value does not match any known type
     */
    public static StatisticType fromString(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Statistic type is required");
        }
        String lower = value.toLowerCase().trim();
        return switch (lower) {
            case "min" -> MIN;
            case "max" -> MAX;
            case "sum" -> SUM;
            case "average", "avg" -> AVERAGE;
            default -> throw new IllegalArgumentException(
                    "Invalid statistic type: '" + value + "'. Allowed: " + ALLOWED_VALUES);
        };
    }
}
