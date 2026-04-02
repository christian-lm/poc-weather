package com.christianlm.weather.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Map;

/**
 * Validates that every value in a {@code Map<String, Double>} is
 * finite and within the physically plausible bounds for its metric type.
 */
public class MetricValuesValidator implements ConstraintValidator<ValidMetricValues, Map<String, Double>> {

    @Override
    public boolean isValid(Map<String, Double> metrics, ConstraintValidatorContext ctx) {
        if (metrics == null || metrics.isEmpty()) {
            return true;
        }

        ctx.disableDefaultConstraintViolation();
        boolean valid = true;

        for (Map.Entry<String, Double> entry : metrics.entrySet()) {
            String key = entry.getKey().toLowerCase();
            Double value = entry.getValue();

            if (value == null || value.isNaN() || value.isInfinite()) {
                ctx.buildConstraintViolationWithTemplate(
                        "Metric '" + key + "' has an invalid numeric value (null, NaN, or Infinity)")
                        .addConstraintViolation();
                valid = false;
                continue;
            }

            MetricBounds.Range range = MetricBounds.BOUNDS.get(key);
            if (range != null && !range.contains(value)) {
                ctx.buildConstraintViolationWithTemplate(
                        "Metric '" + key + "' value " + value
                                + " is out of plausible range [" + range.min() + ", " + range.max() + "]")
                        .addConstraintViolation();
                valid = false;
            }
        }

        return valid;
    }
}
