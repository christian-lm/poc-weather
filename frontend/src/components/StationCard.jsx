/**
 * @module components/StationCard
 * @description Dashboard card for a single weather station showing the latest
 * temperature, humidity, a weather-condition icon (derived from temp range),
 * and an operational status badge.
 *
 * @param {Object} props
 * @param {Object} props.sensor - Sensor data from the /metrics/latest-all endpoint
 * @param {string} props.sensor.sensorName
 * @param {string} props.sensor.location
 * @param {Object} props.sensor.latestMetrics - Map of metric type to latest value
 * @param {string} [props.sensor.status='online']
 */
import { Cloud, CloudRain, Sun, CloudSun, Snowflake } from 'lucide-react';
import StatusBadge from './StatusBadge';

function getWeatherIcon(temp) {
  if (temp == null) return Cloud;
  if (temp > 20) return Sun;
  if (temp > 15) return CloudSun;
  if (temp > 5) return Cloud;
  if (temp > 0) return CloudRain;
  return Snowflake;
}

function getStationId(name) {
  if (!name) return '';
  const parts = name.toLowerCase().split(/\s+/);
  const city = parts[0]?.substring(0, 2).toUpperCase() || '';
  return `${city}-${String(Math.abs(hashCode(name)) % 1000).padStart(3, '0')}`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function formatTemp(value) {
  if (value == null) return '--';
  if (value > 999) return '>999';
  if (value < -999) return '<-999';
  return value.toFixed(1);
}

function formatHumidity(value) {
  if (value == null) return '-- RH';
  if (value > 100) return '>100% RH';
  if (value < 0) return '<0% RH';
  return `${value.toFixed(0)}% RH`;
}

export default function StationCard({ sensor }) {
  const { sensorName, location, latestMetrics = {}, status = 'online' } = sensor;
  const temp = latestMetrics.temperature;
  const humidity = latestMetrics.humidity;
  const WeatherIcon = getWeatherIcon(temp);
  const stationId = getStationId(sensorName);

  return (
    <div className="station-card">
      <div className="station-header">
        <div className="station-header-text">
          <div className="station-name" title={location || sensorName}>{location || sensorName}</div>
          <div className="station-id" title={stationId}>Station: {stationId}</div>
        </div>
        <WeatherIcon size={28} className="station-weather-icon" />
      </div>

      <div className="station-temp">
        <span className="station-temp-value">
          {formatTemp(temp)}
        </span>
        <span className="station-temp-unit">°C</span>
      </div>

      <div className="station-footer">
        <span className="station-humidity">
          {formatHumidity(humidity)}
        </span>
        <StatusBadge status={status} />
      </div>

      <style>{`
        .station-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
          transition: box-shadow var(--transition), transform var(--transition);
          min-width: 0;
        }
        .station-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-1px);
        }
        .station-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .station-header-text {
          min-width: 0;
          flex: 1;
        }
        .station-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.02em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .station-id {
          font-size: 0.65rem;
          color: var(--text-light);
          margin-top: 1px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .station-weather-icon {
          color: var(--primary-muted);
          flex-shrink: 0;
        }
        .station-temp {
          margin-bottom: 0.75rem;
        }
        .station-temp-value {
          font-size: 2.2rem;
          font-weight: 300;
          color: var(--text);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .station-temp-unit {
          font-size: 1rem;
          color: var(--text-muted);
          vertical-align: super;
          margin-left: 2px;
        }
        .station-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .station-humidity {
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--text-muted);
          background: var(--surface-alt);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius);
          white-space: nowrap;
          max-width: 50%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
