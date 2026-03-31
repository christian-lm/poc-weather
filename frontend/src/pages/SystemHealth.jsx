/**
 * @module pages/SystemHealth
 * @description Comprehensive system health dashboard powered by Spring Boot Actuator.
 * Showcases deep observability: health checks, JVM memory (heap/non-heap),
 * HikariCP connection pool, GC metrics, HTTP throughput, and disk space.
 * Polls every 15 seconds.
 */
import { useState, useCallback } from 'react';
import { Activity, Database, Server, Cpu, HardDrive, Wifi, Layers, Clock, Zap, BarChart3, GitBranch } from 'lucide-react';
import { fetchHealth, fetchActuatorMetric } from '../services/api';
import usePolling from '../hooks/usePolling';
import StatusBadge from '../components/StatusBadge';

const METRIC_KEYS = [
  'jvm.memory.used',
  'jvm.memory.max',
  'jvm.memory.committed',
  'jvm.buffer.memory.used',
  'process.uptime',
  'system.cpu.usage',
  'process.cpu.usage',
  'jvm.threads.live',
  'jvm.threads.peak',
  'jvm.threads.daemon',
  'jvm.gc.pause',
  'jvm.gc.memory.allocated',
  'jvm.classes.loaded',
  'hikaricp.connections.active',
  'hikaricp.connections.idle',
  'hikaricp.connections.max',
  'hikaricp.connections.pending',
  'http.server.requests',
];

function fmt(bytes) {
  if (bytes == null) return '--';
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function fmtGb(bytes) {
  if (bytes == null) return '--';
  return `${(bytes / 1073741824).toFixed(1)} GB`;
}

function pct(used, total) {
  if (!used || !total) return 0;
  return Math.min(100, (used / total) * 100);
}

function barColor(percent) {
  if (percent > 85) return 'var(--error)';
  if (percent > 65) return 'var(--warning)';
  return 'var(--success)';
}

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const healthData = await fetchHealth();
      setHealth(healthData);

      const results = {};
      await Promise.allSettled(
        METRIC_KEYS.map(async (key) => {
          try {
            const data = await fetchActuatorMetric(key);
            const total = data.measurements?.find(m => m.statistic === 'TOTAL_TIME');
            const count = data.measurements?.find(m => m.statistic === 'COUNT');
            results[key] = data.measurements?.[0]?.value ?? null;
            if (total) results[key + '.totalTime'] = total.value;
            if (count) results[key + '.count'] = count.value;
          } catch {
            results[key] = null;
          }
        })
      );
      setMetrics(results);
      setLastUpdate(new Date());
      setError(null);
    } catch {
      setError('Unable to reach backend health endpoint');
    }
  }, []);

  usePolling(refresh, 15000);

  const dbHealth = health?.components?.db;
  const diskHealth = health?.components?.diskSpace;

  const heapUsed = metrics['jvm.memory.used'];
  const heapMax = metrics['jvm.memory.max'];
  const heapCommitted = metrics['jvm.memory.committed'];
  const heapPct = pct(heapUsed, heapMax);
  const uptime = metrics['process.uptime'];
  const cpuSystem = metrics['system.cpu.usage'];
  const cpuProcess = metrics['process.cpu.usage'];
  const threadsLive = metrics['jvm.threads.live'];
  const threadsPeak = metrics['jvm.threads.peak'];
  const threadsDaemon = metrics['jvm.threads.daemon'];
  const connActive = metrics['hikaricp.connections.active'];
  const connIdle = metrics['hikaricp.connections.idle'];
  const connMax = metrics['hikaricp.connections.max'];
  const connPending = metrics['hikaricp.connections.pending'];
  const gcCount = metrics['jvm.gc.pause.count'];
  const gcTotalTime = metrics['jvm.gc.pause.totalTime'];
  const classesLoaded = metrics['jvm.classes.loaded'];
  const httpCount = metrics['http.server.requests.count'];
  const httpTotalTime = metrics['http.server.requests.totalTime'];

  const diskFree = diskHealth?.details?.free;
  const diskTotal = diskHealth?.details?.total;
  const diskUsed = diskTotal && diskFree ? diskTotal - diskFree : null;
  const diskPct = pct(diskUsed, diskTotal);

  const poolPct = pct(connActive, connMax);

  const uptimeStr = uptime != null
    ? uptime >= 86400
      ? `${(uptime / 86400).toFixed(1)} days`
      : uptime >= 3600
        ? `${(uptime / 3600).toFixed(1)} hours`
        : `${(uptime / 60).toFixed(0)} min`
    : '--';

  return (
    <div>
      <div className="page-breadcrumb">
        <span style={{ color: 'var(--text-light)' }}>Global</span>
        <span style={{ color: 'var(--text-light)' }}>&rsaquo;</span>
        <span>System Health</span>
      </div>
      <h1 className="page-title">System Health</h1>
      <p className="page-desc">
        Real-time observability powered by Spring Boot Actuator, Micrometer, and Prometheus.
        {lastUpdate && (
          <span className="sh-last-update">
            Last check: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </p>

      {error && (
        <div className="card" style={{ borderColor: 'var(--error)', background: 'var(--error-light)', marginBottom: '1rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {/* Health Check Cards */}
      <div className="sh-cards-row">
        <div className="card sh-health-card">
          <div className="sh-health-header">
            <div className={`sh-icon-box ${health?.status === 'UP' ? 'ok' : 'err'}`}>
              <Server size={18} />
            </div>
            <div>
              <div className="sh-health-label">Application</div>
              <div className="sh-health-sub">Spring Boot Backend</div>
            </div>
          </div>
          <div className="sh-health-footer">
            <StatusBadge status={health?.status || 'unknown'} />
            <span className="sh-uptime-tag"><Clock size={11} /> {uptimeStr}</span>
          </div>
        </div>

        <div className="card sh-health-card">
          <div className="sh-health-header">
            <div className={`sh-icon-box ${dbHealth?.status === 'UP' ? 'ok' : 'err'}`}>
              <Database size={18} />
            </div>
            <div>
              <div className="sh-health-label">Database</div>
              <div className="sh-health-sub">{dbHealth?.details?.database || 'TimescaleDB / PostgreSQL'}</div>
            </div>
          </div>
          <div className="sh-health-footer">
            <StatusBadge status={dbHealth?.status || 'unknown'} />
            {dbHealth?.details?.validationQuery && (
              <span className="sh-detail-tag">Validation: OK</span>
            )}
          </div>
        </div>

        <div className="card sh-health-card">
          <div className="sh-health-header">
            <div className={`sh-icon-box ${diskHealth?.status === 'UP' ? 'ok' : 'warn'}`}>
              <HardDrive size={18} />
            </div>
            <div>
              <div className="sh-health-label">Disk Space</div>
              <div className="sh-health-sub">{diskTotal ? `${fmtGb(diskTotal)} total` : 'Checking...'}</div>
            </div>
          </div>
          <div className="sh-health-footer">
            <StatusBadge status={diskHealth?.status || 'unknown'} />
            {diskFree != null && <span className="sh-detail-tag">{fmtGb(diskFree)} free</span>}
          </div>
        </div>
      </div>

      {/* Gauges Row */}
      <div className="sh-gauges-row">
        <div className="card sh-gauge-card">
          <div className="sh-gauge-title"><Cpu size={14} /> JVM Heap Memory</div>
          <div className="sh-bar-outer">
            <div className="sh-bar-inner" style={{ width: `${heapPct}%`, background: barColor(heapPct) }} />
          </div>
          <div className="sh-bar-meta">
            <span>{fmt(heapUsed)} / {fmt(heapMax)}</span>
            <span className="sh-bar-pct" style={{ color: barColor(heapPct) }}>{heapPct.toFixed(0)}%</span>
          </div>
          {heapCommitted != null && (
            <div className="sh-gauge-detail">Committed: {fmt(heapCommitted)}</div>
          )}
        </div>

        <div className="card sh-gauge-card">
          <div className="sh-gauge-title"><HardDrive size={14} /> Disk Usage</div>
          <div className="sh-bar-outer">
            <div className="sh-bar-inner" style={{ width: `${diskPct}%`, background: barColor(diskPct) }} />
          </div>
          <div className="sh-bar-meta">
            <span>{fmtGb(diskUsed)} / {fmtGb(diskTotal)}</span>
            <span className="sh-bar-pct" style={{ color: barColor(diskPct) }}>{diskPct.toFixed(0)}%</span>
          </div>
          <div className="sh-gauge-detail">Threshold: {diskHealth?.details?.threshold ? fmtGb(diskHealth.details.threshold) : '--'}</div>
        </div>

        <div className="card sh-gauge-card">
          <div className="sh-gauge-title"><Database size={14} /> HikariCP Pool</div>
          <div className="sh-bar-outer">
            <div className="sh-bar-inner" style={{ width: `${poolPct}%`, background: barColor(poolPct) }} />
          </div>
          <div className="sh-bar-meta">
            <span>{connActive ?? '--'} active / {connMax ?? '--'} max</span>
            <span className="sh-bar-pct" style={{ color: barColor(poolPct) }}>{poolPct.toFixed(0)}%</span>
          </div>
          <div className="sh-gauge-detail">
            Idle: {connIdle ?? '--'} &middot; Pending: {connPending ?? '0'}
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <h2 className="sh-section-title">Runtime Metrics</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="sh-metrics-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="sh-metric-cell">
                  <Activity size={14} className="sh-metric-icon" />
                  <div>
                    <div className="sh-metric-label">System CPU Usage</div>
                    <div className="sh-metric-key">system.cpu.usage</div>
                  </div>
                </div>
              </td>
              <td className="sh-metric-val">{cpuSystem != null ? `${(cpuSystem * 100).toFixed(1)}%` : '--'}</td>
              <td className="sh-metric-detail">Across all cores</td>
            </tr>
            <tr>
              <td>
                <div className="sh-metric-cell">
                  <Zap size={14} className="sh-metric-icon" />
                  <div>
                    <div className="sh-metric-label">Process CPU Usage</div>
                    <div className="sh-metric-key">process.cpu.usage</div>
                  </div>
                </div>
              </td>
              <td className="sh-metric-val">{cpuProcess != null ? `${(cpuProcess * 100).toFixed(1)}%` : '--'}</td>
              <td className="sh-metric-detail">JVM process only</td>
            </tr>
            <tr>
              <td>
                <div className="sh-metric-cell">
                  <Layers size={14} className="sh-metric-icon" />
                  <div>
                    <div className="sh-metric-label">Live Threads</div>
                    <div className="sh-metric-key">jvm.threads.live</div>
                  </div>
                </div>
              </td>
              <td className="sh-metric-val">{threadsLive ?? '--'}</td>
              <td className="sh-metric-detail">Peak: {threadsPeak ?? '--'} &middot; Daemon: {threadsDaemon ?? '--'}</td>
            </tr>
            <tr>
              <td>
                <div className="sh-metric-cell">
                  <GitBranch size={14} className="sh-metric-icon" />
                  <div>
                    <div className="sh-metric-label">GC Pauses</div>
                    <div className="sh-metric-key">jvm.gc.pause</div>
                  </div>
                </div>
              </td>
              <td className="sh-metric-val">{gcCount != null ? `${gcCount} cycles` : '--'}</td>
              <td className="sh-metric-detail">Total time: {gcTotalTime != null ? `${(gcTotalTime * 1000).toFixed(0)} ms` : '--'}</td>
            </tr>
            <tr>
              <td>
                <div className="sh-metric-cell">
                  <BarChart3 size={14} className="sh-metric-icon" />
                  <div>
                    <div className="sh-metric-label">Loaded Classes</div>
                    <div className="sh-metric-key">jvm.classes.loaded</div>
                  </div>
                </div>
              </td>
              <td className="sh-metric-val">{classesLoaded != null ? classesLoaded.toLocaleString() : '--'}</td>
              <td className="sh-metric-detail">Currently loaded in JVM</td>
            </tr>
            <tr>
              <td>
                <div className="sh-metric-cell">
                  <Wifi size={14} className="sh-metric-icon" />
                  <div>
                    <div className="sh-metric-label">HTTP Requests Served</div>
                    <div className="sh-metric-key">http.server.requests</div>
                  </div>
                </div>
              </td>
              <td className="sh-metric-val">{httpCount != null ? httpCount.toLocaleString() : '--'}</td>
              <td className="sh-metric-detail">
                Avg latency: {httpCount && httpTotalTime ? `${((httpTotalTime / httpCount) * 1000).toFixed(1)} ms` : '--'}
              </td>
            </tr>
            <tr>
              <td>
                <div className="sh-metric-cell">
                  <Clock size={14} className="sh-metric-icon" />
                  <div>
                    <div className="sh-metric-label">Process Uptime</div>
                    <div className="sh-metric-key">process.uptime</div>
                  </div>
                </div>
              </td>
              <td className="sh-metric-val">{uptimeStr}</td>
              <td className="sh-metric-detail">{uptime != null ? `${uptime.toFixed(0)} seconds` : '--'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <style>{`
        .sh-last-update {
          margin-left: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-light);
        }
        .sh-cards-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .sh-health-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .sh-health-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .sh-icon-box {
          width: 36px;
          height: 36px;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sh-icon-box.ok {
          background: var(--success-light);
          color: var(--success);
        }
        .sh-icon-box.err {
          background: var(--error-light);
          color: var(--error);
        }
        .sh-icon-box.warn {
          background: var(--warning-light);
          color: var(--warning);
        }
        .sh-health-label {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .sh-health-sub {
          font-size: 0.72rem;
          color: var(--text-light);
        }
        .sh-health-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sh-uptime-tag, .sh-detail-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          color: var(--text-light);
          background: var(--surface-alt);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius);
        }

        .sh-gauges-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .sh-gauge-card {
          min-width: 0;
        }
        .sh-gauge-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text);
        }
        .sh-bar-outer {
          height: 10px;
          background: var(--surface-alt);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        .sh-bar-inner {
          height: 100%;
          border-radius: 5px;
          transition: width 0.6s ease;
        }
        .sh-bar-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          color: var(--text-muted);
          font-variant-numeric: tabular-nums;
        }
        .sh-bar-pct {
          font-weight: 700;
        }
        .sh-gauge-detail {
          font-size: 0.7rem;
          color: var(--text-light);
          margin-top: 0.25rem;
        }

        .sh-section-title {
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .sh-metrics-table {
          width: 100%;
        }
        .sh-metrics-table th:nth-child(1) { width: 40%; }
        .sh-metrics-table th:nth-child(2) { width: 25%; }
        .sh-metrics-table th:nth-child(3) { width: 35%; }
        .sh-metric-cell {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .sh-metric-icon {
          color: var(--primary);
          flex-shrink: 0;
        }
        .sh-metric-label {
          font-weight: 500;
          font-size: 0.85rem;
        }
        .sh-metric-key {
          font-size: 0.7rem;
          color: var(--text-light);
          font-family: var(--font-mono);
        }
        .sh-metric-val {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 600;
        }
        .sh-metric-detail {
          font-size: 0.78rem;
          color: var(--text-light);
        }
      `}</style>
    </div>
  );
}
