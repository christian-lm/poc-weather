package com.christianlm.weather.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * A single time bucket in the throughput chart, representing
 * the count of metric readings ingested during that hour.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThroughputEntry {

    private Instant time;
    private long count;
}
