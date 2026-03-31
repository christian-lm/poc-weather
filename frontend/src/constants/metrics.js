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
