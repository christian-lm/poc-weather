/**
 * @module components/RealtimeStream
 * @description Table of the most recent individual metric readings. Each row
 * shows timestamp, originating sensor, metric type, raw value, measurement
 * precision, and a quality status badge. Entries come from the
 * /metrics/stream endpoint.
 *
 * @param {Object} props
 * @param {Array<{timestamp: string, sensorId: number, sensorName: string, metricType: string, value: number}>} props.entries
 */
import { ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { METRIC_UNITS, METRIC_LABELS } from '../constants/metrics';

function formatTimestamp(ts) {
  if (!ts) return '--';
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

function getStationCode(name) {
  if (!name) return '--';
  const parts = name.split(/\s+/);
  const code = parts[0]?.substring(0, 2).toUpperCase() || '';
  const hash = Math.abs([...name].reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0));
  return `${code}-${String(hash % 1000).padStart(3, '0')}`;
}

function getPrecision(metric) {
  switch (metric) {
    case 'temperature': return '±0.02';
    case 'humidity': return '±0.11';
    case 'wind_speed': return '±0.4';
    case 'pressure': return '±0.01';
    default: return null;
  }
}

export default function RealtimeStream({ entries = [] }) {
  return (
    <div className="stream-card card">
      <div className="stream-header">
        <h3 className="stream-title">Real-time Stream</h3>
        <a href="/metrics" className="stream-view-all">
          View All Metrics <ExternalLink size={12} />
        </a>
      </div>

      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Source</th>
            <th>Metric Type</th>
            <th>Reading</th>
            <th>Precision</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
                No recent metrics available
              </td>
            </tr>
          )}
          {entries.map((entry, i) => {
            const unit = METRIC_UNITS[entry.metricType] || '';
            const precision = getPrecision(entry.metricType);
            const status = entry.value != null ? 'valid' : 'timeout';
            return (
              <tr key={i}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                  {formatTimestamp(entry.timestamp)}
                </td>
                <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {getStationCode(entry.sensorName)}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>
                  {METRIC_LABELS[entry.metricType] || entry.metricType}
                </td>
                <td style={{ fontWeight: 600 }}>
                  {entry.value != null ? `${entry.value.toFixed(2)} ${unit}` : '--'}
                </td>
                <td style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>
                  {precision || 'null'}
                </td>
                <td>
                  <StatusBadge status={status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        .stream-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .stream-title {
          font-size: 1.05rem;
          font-weight: 600;
        }
        .stream-view-all {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color var(--transition);
        }
        .stream-view-all:hover {
          color: var(--primary);
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
