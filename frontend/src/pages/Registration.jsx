/**
 * @module pages/Registration
 * @description Sensor management page with two centered cards:
 * 1) Register New Sensor — name + location inputs with a clean centered layout.
 * 2) Send Metrics — select an existing sensor and push metric readings.
 *
 * The page auto-refreshes the sensor list after each successful operation
 * so the dropdown immediately reflects newly created sensors.
 */
import { useState, useEffect, useRef } from 'react';
import { PlusCircle, Send, MapPin, Radio } from 'lucide-react';
import { fetchSensors, createSensor, ingestMetrics } from '../services/api';

export default function Registration() {
  const [sensors, setSensors] = useState([]);
  const [toast, setToast] = useState(null);

  const [newSensorName, setNewSensorName] = useState('');
  const [newSensorLocation, setNewSensorLocation] = useState('');
  const [creating, setCreating] = useState(false);

  const [sensorId, setSensorId] = useState('');
  const [temperature, setTemperature] = useState('22.5');
  const [humidity, setHumidity] = useState('65.0');
  const [windSpeed, setWindSpeed] = useState('12.0');
  const [pressure, setPressure] = useState('1013.0');
  const [ingesting, setIngesting] = useState(false);

  const loadSensors = async () => {
    try {
      const data = await fetchSensors();
      setSensors(data);
    } catch {
      showToast('Failed to load sensors', 'error');
    }
  };

  const toastTimer = useRef(null);

  useEffect(() => { loadSensors(); }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const handleCreateSensor = async (e) => {
    e.preventDefault();
    if (!newSensorName.trim()) { showToast('Sensor name is required', 'error'); return; }
    setCreating(true);
    try {
      await createSensor({ name: newSensorName.trim(), location: newSensorLocation.trim() || null });
      showToast(`Sensor "${newSensorName}" registered successfully`);
      setNewSensorName('');
      setNewSensorLocation('');
      loadSensors();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create sensor', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!sensorId) { showToast('Select a sensor', 'error'); return; }
    const metrics = {};
    if (temperature) metrics.temperature = parseFloat(temperature);
    if (humidity) metrics.humidity = parseFloat(humidity);
    if (windSpeed) metrics.wind_speed = parseFloat(windSpeed);
    if (pressure) metrics.pressure = parseFloat(pressure);
    if (!Object.keys(metrics).length) { showToast('Fill at least one metric', 'error'); return; }
    setIngesting(true);
    try {
      const res = await ingestMetrics({ sensorId: parseInt(sensorId), metrics });
      showToast(`Ingested ${res.recordsInserted} metric(s) successfully`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Ingest failed', 'error');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="reg-page">
      <div className="reg-header">
        <h1 className="page-title">Registration</h1>
        <p className="page-desc">Register new sensors and record metric readings into the weather network.</p>
      </div>

      <div className="reg-grid">
        <form className="reg-card card" onSubmit={handleCreateSensor}>
          <div className="reg-card-header">
            <PlusCircle size={18} className="reg-card-icon" />
            <h2 className="reg-card-title">Register Sensor</h2>
          </div>
          <p className="reg-desc">Add a new weather station to the network.</p>

          <div className="reg-field">
            <label className="reg-label">Sensor Name</label>
            <div className="reg-input-wrap">
              <input
                value={newSensorName}
                onChange={e => setNewSensorName(e.target.value)}
                placeholder="e.g., Sensor Zeta"
                className="reg-input"
              />
              <Radio size={16} className="reg-input-icon" />
            </div>
            <span className="reg-hint">Unique name to identify this station</span>
          </div>

          <div className="reg-field">
            <label className="reg-label">Location</label>
            <div className="reg-input-wrap">
              <input
                value={newSensorLocation}
                onChange={e => setNewSensorLocation(e.target.value)}
                placeholder="e.g., Lisbon, Portugal"
                className="reg-input"
              />
              <MapPin size={16} className="reg-input-icon" />
            </div>
          </div>

          <div className="reg-actions">
            <button type="submit" className="primary reg-submit" disabled={creating}>
              <PlusCircle size={16} />
              {creating ? 'Registering...' : 'Register Sensor'}
            </button>
            <button
              type="button"
              className="reg-cancel"
              onClick={() => { setNewSensorName(''); setNewSensorLocation(''); }}
            >
              Clear
            </button>
          </div>
        </form>

        <form className="reg-card card" onSubmit={handleIngest}>
          <div className="reg-card-header">
            <Send size={18} className="reg-card-icon" />
            <h2 className="reg-card-title">Register Metrics</h2>
          </div>
          <p className="reg-desc">Record a new reading for an existing sensor.</p>

          <div className="reg-field">
            <label className="reg-label">Sensor</label>
            <select value={sensorId} onChange={e => setSensorId(e.target.value)} style={{ width: '100%' }}>
              <option value="">-- Select sensor --</option>
              {sensors.map(s => (
                <option key={s.id} value={s.id}>{s.name}{s.location ? ` (${s.location})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="reg-metric-grid">
            <div className="reg-field">
              <label className="reg-label">Temperature (°C)</label>
              <input type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div className="reg-field">
              <label className="reg-label">Humidity (%)</label>
              <input type="number" step="0.1" value={humidity} onChange={e => setHumidity(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div className="reg-field">
              <label className="reg-label">Wind Speed (km/h)</label>
              <input type="number" step="0.1" value={windSpeed} onChange={e => setWindSpeed(e.target.value)} style={{ width: '100%' }} />
            </div>
            <div className="reg-field">
              <label className="reg-label">Pressure (hPa)</label>
              <input type="number" step="0.1" value={pressure} onChange={e => setPressure(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          <button type="submit" className="primary reg-submit" disabled={ingesting} style={{ width: '100%' }}>
            <Send size={14} />
            {ingesting ? 'Registering...' : 'Register Reading'}
          </button>
        </form>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <style>{`
        .reg-page {
          max-width: 960px;
          margin: 0 auto;
        }
        .reg-header {
          margin-bottom: 1.5rem;
        }
        .reg-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        .reg-card {
          padding: 1.75rem;
        }
        .reg-card-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.35rem;
        }
        .reg-card-icon {
          color: var(--primary);
        }
        .reg-card-title {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .reg-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
        }
        .reg-field {
          text-align: left;
          margin-bottom: 1rem;
        }
        .reg-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text);
          margin-bottom: 0.35rem;
        }
        .reg-input-wrap {
          position: relative;
        }
        .reg-input {
          width: 100%;
          padding-right: 2.5rem;
        }
        .reg-input-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
          pointer-events: none;
        }
        .reg-hint {
          font-size: 0.72rem;
          color: var(--text-light);
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .reg-hint::before {
          content: '\\2139';
          font-size: 0.7rem;
          width: 14px;
          height: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--surface-alt);
          color: var(--text-light);
          flex-shrink: 0;
        }
        .reg-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.25rem;
        }
        .reg-submit {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          font-size: 0.9rem;
        }
        .reg-cancel {
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
        }
        .reg-cancel:hover {
          border-color: var(--text-muted);
          color: var(--text);
        }
        .reg-metric-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
          text-align: left;
        }
        @media (max-width: 768px) {
          .reg-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
