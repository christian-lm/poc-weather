/**
 * @module pages/MetricsQuery
 * @description Two-panel query interface: left sidebar with the Query Builder form
 * (sensor checkboxes, metric multi-select, aggregation, date range) and right
 * content area displaying a bar chart visualization + raw telemetry table.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { Filter, Zap, Search, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchSensors, queryMetrics } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { METRIC_OPTIONS, METRIC_UNITS, METRIC_LABELS, STAT_OPTIONS } from '../constants/metrics';

function getToday() {
  return new Date().toISOString().slice(0, 10);
}
function getLast7Days() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

function truncateLabel(name, max = 18) {
  if (!name || name.length <= max) return name;
  return name.substring(0, max) + '…';
}

export default function MetricsQueryPage() {
  const [sensors, setSensors] = useState([]);
  const [sensorsLoaded, setSensorsLoaded] = useState(false);
  const [sensorSearch, setSensorSearch] = useState('');
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState(['temperature']);
  const [statistic, setStatistic] = useState('average');
  const [useLatest, setUseLatest] = useState(false);
  const [startDate, setStartDate] = useState(getLast7Days());
  const [endDate, setEndDate] = useState(getToday());
  const [queryResults, setQueryResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    fetchSensors({ page: 0, size: 500 })
      .then(res => setSensors(res.content))
      .catch(() => setSensors([]))
      .finally(() => setSensorsLoaded(true));
  }, []);

  const filteredSensors = useMemo(() => {
    if (!sensorSearch.trim()) return sensors;
    const q = sensorSearch.toLowerCase();
    return sensors.filter(
      s => s.name.toLowerCase().includes(q) || (s.location || '').toLowerCase().includes(q),
    );
  }, [sensors, sensorSearch]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const MAX_SENSORS = 20;

  const toggleSensor = (id) => {
    setSelectedSensors(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_SENSORS) {
        showToast(`Maximum ${MAX_SENSORS} sensors per query for readable results`, 'error');
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleMetric = (key) => {
    setSelectedMetrics(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    );
  };

  const clearAllSensors = () => {
    setSelectedSensors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMetrics.length) {
      showToast('Select at least one metric', 'error');
      return;
    }
    if (selectedSensors.length === 0) {
      showToast('Select at least one sensor to get meaningful results', 'error');
      return;
    }
    if (!useLatest && new Date(startDate) > new Date(endDate)) {
      showToast('Start date must be before end date', 'error');
      return;
    }
    setLoading(true);
    try {
      const params = {
        sensorIds: selectedSensors,
        metrics: selectedMetrics,
        statistic,
      };
      if (!useLatest) {
        params.startDate = new Date(startDate + 'T00:00:00').toISOString();
        params.endDate = new Date(endDate + 'T23:59:59').toISOString();
      }
      const data = await queryMetrics(params);
      setQueryResults(data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Query failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const chartData = queryResults?.results?.map(r => {
    const rounded = {};
    for (const [k, v] of Object.entries(r.data)) {
      rounded[k] = v != null ? Math.round(v * 100) / 100 : null;
    }
    return {
      name: r.sensorName,
      shortName: truncateLabel(r.sensorName),
      ...rounded,
    };
  }) || [];

  const resultCount = queryResults?.results?.length || 0;

  return (
    <div className="mq-layout">
      <form className="mq-sidebar card" onSubmit={handleSubmit}>
        <div className="mq-sidebar-title">
          <Filter size={16} />
          <span>Query Builder</span>
        </div>

        <div className="mq-sidebar-scroll">
          <div className="mq-section">
            <div className="mq-section-header">
              <label>Sensors{selectedSensors.length > 0 && ` (${selectedSensors.length}/${MAX_SENSORS})`}</label>
              {selectedSensors.length > 0 && (
                <button type="button" className="mq-sensor-action-link" onClick={clearAllSensors}>Clear</button>
              )}
            </div>
            <div className="mq-sensor-search-wrap">
              <Search size={13} className="mq-sensor-search-icon" />
              <input
                type="text"
                className="mq-sensor-search"
                placeholder="Filter sensors..."
                value={sensorSearch}
                onChange={e => setSensorSearch(e.target.value)}
              />
            </div>
            <div className="mq-checkboxes">
              {filteredSensors.map(s => (
                <label key={s.id} className="mq-checkbox-label" title={`${s.name}${s.location ? ` — ${s.location}` : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedSensors.includes(s.id)}
                    onChange={() => toggleSensor(s.id)}
                  />
                  <span className="mq-checkbox-text">{s.name}</span>
                </label>
              ))}
              {!sensorsLoaded && (
                <span className="mq-hint">Loading sensors...</span>
              )}
              {sensorsLoaded && sensors.length === 0 && (
                <span className="mq-hint">No sensors registered</span>
              )}
              {sensorsLoaded && sensors.length > 0 && filteredSensors.length === 0 && (
                <span className="mq-hint">No sensors match &ldquo;{sensorSearch}&rdquo;</span>
              )}
            </div>
          </div>

          <div className="mq-section">
            <label>Metrics</label>
            <div className="mq-metric-list">
              {METRIC_OPTIONS.map(m => (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={selectedMetrics.includes(m.key)}
                  className={`mq-metric-item ${selectedMetrics.includes(m.key) ? 'selected' : ''}`}
                  onClick={() => toggleMetric(m.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mq-section">
            <label>Aggregation</label>
            <select value={statistic} onChange={e => setStatistic(e.target.value)} style={{ width: '100%' }}>
              {STAT_OPTIONS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="mq-section">
            <label className="mq-checkbox-label" style={{ marginTop: '0.25rem' }}>
              <input
                type="checkbox"
                checked={useLatest}
                onChange={e => setUseLatest(e.target.checked)}
              />
              <span>Latest value only</span>
            </label>
          </div>

          {!useLatest && (
            <>
              <div className="mq-section">
                <label>Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div className="mq-section">
                <label>End Date</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%' }} />
              </div>
            </>
          )}
        </div>

        <button type="submit" className="primary mq-submit-btn" disabled={loading}>
          <Filter size={14} />
          {loading ? 'Querying...' : 'Run Query'}
        </button>
      </form>

      <div className="mq-content">
        {!queryResults && (
          <div className="mq-empty card">
            <Filter size={32} style={{ color: 'var(--text-light)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Temporal Analysis</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
              Select sensors and metrics, then click "Run Query" to visualize your data.
            </p>
          </div>
        )}

        {queryResults && (
          <>
            <div className="mq-chart-header">
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>Temporal Analysis</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {useLatest ? 'Latest' : statistic.charAt(0).toUpperCase() + statistic.slice(1)} data for {selectedMetrics.join(', ').replace(/_/g, ' ')}
                  {resultCount > 0 ? ` — ${resultCount} sensor${resultCount !== 1 ? 's' : ''}` : ''}
                </p>
              </div>
              <span className="badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Zap size={10} /> Live Feedback
              </span>
            </div>

            {queryResults.results.length === 0 && (
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem', background: 'var(--warning-light)', borderColor: 'var(--warning)' }}>
                <AlertCircle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>No results for the selected sensors and time range.</span>
              </div>
            )}

            {chartData.length > 0 && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="shortName"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                        interval={0}
                        angle={chartData.length > 6 ? -30 : 0}
                        textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                        height={chartData.length > 6 ? 70 : 30}
                      />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                        labelStyle={{ color: '#64748b', fontWeight: 600 }}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
                        formatter={(value, name) => [`${Number(value).toFixed(2)} ${METRIC_UNITS[name] || ''}`, METRIC_LABELS[name] || name.replace(/_/g, ' ')]}
                      />
                      {selectedMetrics.map((m, i) => (
                        <Bar key={m} dataKey={m} fill={['#93bbfd', '#7dd3fc', '#a5b4fc', '#c4b5fd', '#f9a8d4'][i % 5]} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {queryResults.results.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Raw Telemetry Response</h3>
                  <span className="badge success">{useLatest ? 'LATEST' : statistic.toUpperCase()}</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Sensor</th>
                        {selectedMetrics.map(m => (
                          <th key={m}>{m.replace(/_/g, ' ')} ({METRIC_UNITS[m] || '—'})</th>
                        ))}
                        <th>Quality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.results.map(r => (
                        <tr key={r.sensorId}>
                          <td>
                            <strong style={{ color: 'var(--text)' }} title={r.sensorName}>{truncateLabel(r.sensorName, 30)}</strong>
                            <br />
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>ID: {r.sensorId}</span>
                          </td>
                          {selectedMetrics.map(m => (
                            <td key={m} style={{ fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                              {r.data[m] != null ? `${r.data[m].toFixed(2)} ${METRIC_UNITS[m] || ''}` : '—'}
                            </td>
                          ))}
                          <td>
                            {(() => {
                              const missingKeys = selectedMetrics.filter(m => r.data[m] == null);
                              const missing = missingKeys.length > 0;
                              return (
                                <span title={missing
                                  ? `Missing data for: ${missingKeys.map(m => m.replace(/_/g, ' ')).join(', ')}`
                                  : 'All queried metrics have data for this sensor'}>
                                  <StatusBadge status={missing ? 'timeout' : 'valid'} label={missing ? 'Partial' : 'Optimal'} />
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <style>{`
        .mq-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        .mq-sidebar {
          position: sticky;
          top: 72px;
          display: flex;
          flex-direction: column;
          max-height: calc(100vh - 90px);
          overflow: hidden;
        }
        .mq-sidebar-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text);
          flex-shrink: 0;
        }
        .mq-sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          min-height: 0;
          padding-right: 0.25rem;
        }
        .mq-section {
          margin-bottom: 1rem;
        }
        .mq-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .mq-sensor-action-link {
          background: none;
          border: none;
          font-size: 0.72rem;
          color: var(--primary);
          cursor: pointer;
          padding: 0;
          font-weight: 500;
          font-family: inherit;
        }
        .mq-sensor-action-link:hover {
          text-decoration: underline;
        }
        .mq-sensor-search-wrap {
          position: relative;
          margin-top: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .mq-sensor-search-icon {
          position: absolute;
          left: 0.55rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
          pointer-events: none;
        }
        .mq-sensor-search {
          width: 100%;
          padding-left: 1.75rem;
          font-size: 0.8rem;
        }
        .mq-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid var(--border-light);
          border-radius: var(--radius);
          padding: 0.4rem;
        }
        .mq-checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 400;
          color: var(--text);
          cursor: pointer;
          text-transform: none;
          letter-spacing: 0;
          min-width: 0;
        }
        .mq-checkbox-label input {
          width: auto;
          flex-shrink: 0;
          accent-color: var(--primary);
        }
        .mq-checkbox-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: block;
          min-width: 0;
        }
        .mq-hint {
          font-size: 0.8rem;
          color: var(--text-light);
        }
        .mq-metric-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 0.25rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .mq-metric-item {
          padding: 0.45rem 0.65rem;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all var(--transition);
          color: var(--text-secondary);
          user-select: none;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
        }
        .mq-metric-item:hover {
          background: var(--surface-alt);
        }
        .mq-metric-item.selected {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }
        .mq-submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding: 0.7rem;
          font-size: 0.9rem;
          flex-shrink: 0;
        }
        .mq-content {
          min-height: 400px;
        }
        .mq-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
        }
        .mq-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        @media (max-width: 768px) {
          .mq-layout {
            grid-template-columns: 1fr;
          }
          .mq-sidebar {
            position: static;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
}
