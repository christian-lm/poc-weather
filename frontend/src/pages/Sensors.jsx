/**
 * @module pages/Sensors
 * @description Sensor registry page listing all registered weather stations
 * in a table with name, location, registration date, and operational status.
 */
import { useState, useEffect } from 'react';
import { Radio, MapPin, Clock } from 'lucide-react';
import { fetchSensors } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function Sensors() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSensors()
      .then(setSensors)
      .catch(() => setError('Failed to load sensors. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-breadcrumb">
        <span style={{ color: 'var(--text-light)' }}>Global</span>
        <span style={{ color: 'var(--text-light)' }}>&rsaquo;</span>
        <span>Sensors</span>
      </div>
      <h1 className="page-title">Sensor Registry</h1>
      <p className="page-desc">All registered weather stations and their current operational status.</p>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
          Loading sensors...
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ borderColor: 'var(--error)', background: 'var(--error-light)', padding: '1rem 1.25rem', fontSize: '0.85rem', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      {!loading && !error && sensors.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
          No sensors registered yet. <a href="/registration">Register your first sensor</a>.
        </div>
      )}

      {!loading && !error && sensors.length > 0 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Location</th>
                <th>Registered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 'var(--radius)',
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Radio size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>ID: {s.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                      <MapPin size={13} />
                      {s.location || 'Not specified'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-light)', fontSize: '0.8rem' }}>
                      <Clock size={13} />
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '--'}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={s.status || 'online'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
