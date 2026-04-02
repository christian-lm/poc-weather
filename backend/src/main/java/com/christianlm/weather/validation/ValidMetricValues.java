package com.christianlm.weather.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Bean Validation constraint that rejects metric maps containing
 * NaN, Infinity, or values outside the physically plausible bounds
 * defined in {@link MetricBounds}.
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = MetricValuesValidator.class)
@Documented
public @interface ValidMetricValues {
    String message() default "Metric values contain invalid entries";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
