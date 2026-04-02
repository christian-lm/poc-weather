export const METRIC_OPTIONS = [
  { key: 'temperature', label: 'Temperature (°C)' },
  { key: 'humidity', label: 'Humidity (%)' },
  { key: 'wind_speed', label: 'Wind Speed (km/h)' },
  { key: 'pressure', label: 'Pressure (hPa)' },
  { key: 'precipitation', label: 'Precipitation (mm)' },
];

export const METRIC_UNITS = {
  temperature: '°C',
  humidity: '%',
  wind_speed: 'km/h',
  pressure: 'hPa',
  precipitation: 'mm',
};

export const METRIC_LABELS = {
  temperature: 'Ambient Temperature',
  humidity: 'Relative Humidity',
  wind_speed: 'Wind Velocity',
  pressure: 'Barometric Pressure',
  precipitation: 'Precipitation',
};

export const STAT_OPTIONS = ['average', 'min', 'max', 'sum'];

/**
 * Physically plausible bounds for each metric type.
 * Values outside these ranges indicate sensor errors or corrupt data.
 * Must stay in sync with backend MetricBounds.java.
 */
export const METRIC_BOUNDS = {
  temperature:   { min: -90,  max: 60 },
  humidity:      { min: 0,    max: 100 },
  wind_speed:    { min: 0,    max: 500 },
  pressure:      { min: 300,  max: 1100 },
  precipitation: { min: 0,    max: 500 },
};

export function isPlausibleValue(metricType, value) {
  if (value == null || !Number.isFinite(value)) return false;
  const bounds = METRIC_BOUNDS[metricType];
  if (!bounds) return true;
  return value >= bounds.min && value <= bounds.max;
}
