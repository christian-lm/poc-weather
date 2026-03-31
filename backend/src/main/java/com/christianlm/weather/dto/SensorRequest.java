package com.christianlm.weather.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorRequest {

    @NotBlank(message = "Sensor name is required")
    @Size(max = 100, message = "Sensor name must not exceed 100 characters")
    private String name;

    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;
}
