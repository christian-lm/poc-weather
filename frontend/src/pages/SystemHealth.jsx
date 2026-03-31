/**
 * @module pages/SystemHealth
 * @description System health dashboard backed by Spring Boot Actuator endpoints.
 * Shows application, database, and disk-space health checks alongside JVM
 * metrics (memory, uptime, CPU, threads). Polls every 15 seconds.
 */
import { useState, useCallback } from 'react';
import { Activity, Database, Server, Cpu, HardDrive } from 'lucide-react';
import { fetchHealth, fetchActuatorMetric } from '../services/api';
import usePolling from '../hooks/usePolling';
import StatusBadge from '../components/StatusBadge';

const JVM_METRICS = [
  { key: 'jvm.memory.used', label: 'JVM Memory Used', icon: Cpu, format: (v) => `${(v / 1048576).toFixed(1)} MB` },
  { key: 'process.uptime', label: 'Process Uptime', icon: Server, format: (v) => `${(v / 3600).toFixed(1)} hours` },
  { key: 'system.cpu.usage', label: 'System CPU', icon: Activity, format: (v) => `${(v * 100).toFixed(1)}%` },
  { key: 'jvm.threads.live', label: 'Live Threads', icon: HardDrive, format: (v) => String(v) },
];

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const healthData = await fetchHealth();
      setHealth(healthData);

      const metricResults = {};
      for (const m of JVM_METRICS) {
        try {
          const data = await fetchActuatorMetric(m.key);
          metricResults[m.key] = data.measurements?.[0]?.value ?? null;
        } catch {
          metricResults[m.key] = null;
        }
      }
      setMetrics(metricResults);
      setLastUpdate(new Date());
      setError(null);
    } catch {
      setError('Unable to reach backend health endpoint');
    }
  }, []);

  usePolling(refresh, 15000);

  const dbHealth = health?.components?.db;
  const diskHealth = health?.components?.diskSpace;

  return (
    <div>
      <div className="page-breadcrumb">
        <span style={{ color: 'var(--text-light)' }}>Global</span>
        <span style={{ color: 'var(--text-light)' }}>&rsaquo;</span>
        <span>System Health</span>
      </div>
      <h1 className="page-title">System Health</h1>
      <p className="page-desc">
        Real-time health checks and JVM metrics from Spring Boot Actuator.
        {lastUpdate && (
          <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
            Last check: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </p>

      {error && (
        <div className="card" style={{ borderColor: 'var(--error)', background: 'var(--error-light)', marginBottom: '1rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: health?.status === 'UP' ? 'var(--success-light)' : 'var(--error-light)', color: health?.status === 'UP' ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Application</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Spring Boot Backend</div>
            </div>
          </div>
          <StatusBadge status={health?.status || 'unknown'} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: dbHealth?.status === 'UP' ? 'var(--success-light)' : 'var(--error-light)', color: dbHealth?.status === 'UP' ? 'var(--success)' : 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Database</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                {dbHealth?.details?.database || 'TimescaleDB'}
              </div>
            </div>
          </div>
          <StatusBadge status={dbHealth?.status || 'unknown'} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius)', background: diskHealth?.status === 'UP' ? 'var(--success-light)' : 'var(--warning-light)', color: diskHealth?.status === 'UP' ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Disk Space</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                {diskHealth?.details?.total ? `${(diskHealth.details.total / 1073741824).toFixed(0)} GB total` : 'Checking...'}
              </div>
            </div>
          </div>
          <StatusBadge status={diskHealth?.status || 'unknown'} />
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>JVM Metrics</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {JVM_METRICS.map(({ key, label, icon: Icon, format }) => (
              <tr key={key}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={15} style={{ color: 'var(--primary)' }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>{key}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {metrics[key] != null ? format(metrics[key]) : '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
