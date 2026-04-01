import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function formatHour(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function ThroughputChart({ data = [] }) {
  const chartData = data.map(d => ({
    time: formatHour(d.time),
    value: d.count,
  }));

  const hasData = chartData.length > 0;
  const peak = hasData ? Math.max(...chartData.map(d => d.value)) : 0;
  const avg = hasData ? Math.round(chartData.reduce((s, d) => s + d.value, 0) / chartData.length) : 0;

  return (
    <div className="throughput-card card">
      <div className="throughput-header">
        <div>
          <h3 className="throughput-title">Sensor Ingestion Activity</h3>
          <span className="throughput-subtitle">Metric readings per hour (last 24h)</span>
        </div>
        <div className="throughput-stats">
          <div className="throughput-stat">
            <span className="throughput-stat-label">Peak</span>
            <span className="throughput-stat-value">{peak.toLocaleString()} readings</span>
          </div>
          <div className="throughput-stat">
            <span className="throughput-stat-label">Avg</span>
            <span className="throughput-stat-value">{avg.toLocaleString()} readings</span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 180, marginTop: '1rem' }}>
        {hasData ? (
          <ResponsiveContainer>
            <BarChart data={chartData} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                interval={Math.max(0, Math.floor(chartData.length / 6) - 1)}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                }}
                labelStyle={{ color: '#64748b', fontWeight: 600 }}
                formatter={(val) => [`${val} readings`, 'Ingested']}
              />
              <Bar dataKey="value" fill="#93bbfd" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-light)', fontSize: '0.85rem' }}>
            No ingestion data available yet
          </div>
        )}
      </div>

      <style>{`
        .throughput-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .throughput-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text);
        }
        .throughput-subtitle {
          font-size: 0.7rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .throughput-stats {
          display: flex;
          gap: 1.5rem;
          text-align: right;
        }
        .throughput-stat-label {
          display: block;
          font-size: 0.65rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .throughput-stat-value {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text);
        }
      `}</style>
    </div>
  );
}
