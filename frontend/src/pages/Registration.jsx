/**
 * @module pages/Registration
 * @description Sensor management page with two centered cards:
 * 1) Register New Sensor — name + location inputs with a clean centered layout.
 * 2) Send Metrics — select an existing sensor and push metric readings.
 *
 * The page auto-refreshes the sensor list after each successful operation
 * so the dropdown immediately reflects newly created sensors.
 */
import { useState, useEffect, useRef, useMemo } from 'react';
import { PlusCircle, Send, MapPin, Radio, Search, X } from 'lucide-react';
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

  const [sensorSearch, setSensorSearch] = useState('');
  const [sensorDropdownOpen, setSensorDropdownOpen] = useState(false);
  const comboRef = useRef(null);

  const loadSensors = async () => {
    try {
      const data = await fetchSensors({ page: 0, size: 500 });
      setSensors(data.content);
    } catch {
      showToast('Failed to load sensors', 'error');
    }
  };

  const filteredSensors = useMemo(() => {
    if (!sensorSearch.trim()) return sensors;
    const q = sensorSearch.toLowerCase();
    return sensors.filter(
      s => s.name.toLowerCase().includes(q) || (s.location || '').toLowerCase().includes(q),
    );
  }, [sensors, sensorSearch]);

  const selectedSensor = sensors.find(s => String(s.id) === sensorId);

  const toastTimer = useRef(null);

  useEffect(() => { loadSensors(); }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const handler = (e) => {
      if (comboRef.current && !comboRef.current.contains(e.target)) {
        setSensorDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
            <div className="reg-combo" ref={comboRef}>
              {selectedSensor ? (
                <div className="reg-combo-selected">
                  <span className="reg-combo-chip" title={`${selectedSensor.name}${selectedSensor.location ? ` — ${selectedSensor.location}` : ''}`}>
                    {selectedSensor.name}
                  </span>
                  <button
                    type="button"
                    className="reg-combo-clear"
                    onClick={() => { setSensorId(''); setSensorSearch(''); }}
                    aria-label="Clear selection"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="reg-combo-input-wrap">
                  <Search size={13} className="reg-combo-search-icon" />
                  <input
                    type="text"
                    className="reg-combo-input"
                    placeholder="Search sensors..."
                    value={sensorSearch}
                    onChange={e => { setSensorSearch(e.target.value); setSensorDropdownOpen(true); }}
                    onFocus={() => setSensorDropdownOpen(true)}
                  />
                </div>
              )}
              {sensorDropdownOpen && !selectedSensor && (
                <div className="reg-combo-dropdown">
                  {filteredSensors.length === 0 && (
                    <div className="reg-combo-empty">No sensors found</div>
                  )}
                  {filteredSensors.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      className="reg-combo-option"
                      onClick={() => {
                        setSensorId(String(s.id));
                        setSensorSearch('');
                        setSensorDropdownOpen(false);
                      }}
                    >
                      <span className="reg-combo-option-name">{s.name}</span>
                      {s.location && <span className="reg-combo-option-loc">{s.location}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
          align-items: stretch;
        }
        .reg-card {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
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
          margin-top: auto;
          padding-top: 1.25rem;
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
          margin-top: auto;
          text-align: left;
        }
        .reg-combo {
          position: relative;
          width: 100%;
        }
        .reg-combo-selected {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 0.4rem 0.55rem;
          background: var(--surface);
          min-height: 38px;
        }
        .reg-combo-chip {
          flex: 1;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .reg-combo-clear {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: var(--surface-alt);
          color: var(--text-light);
          cursor: pointer;
          flex-shrink: 0;
        }
        .reg-combo-clear:hover {
          background: var(--error-light);
          color: var(--error);
        }
        .reg-combo-input-wrap {
          position: relative;
        }
        .reg-combo-search-icon {
          position: absolute;
          left: 0.55rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
          pointer-events: none;
        }
        .reg-combo-input {
          width: 100%;
          padding-left: 1.75rem;
          font-size: 0.85rem;
        }
        .reg-combo-dropdown {
          position: absolute;
          z-index: 50;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          max-height: 220px;
          overflow-y: auto;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow-md);
        }
        .reg-combo-option {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1px;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: none;
          border-radius: 0;
          background: none;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }
        .reg-combo-option:hover {
          background: var(--primary-light);
        }
        .reg-combo-option-name {
          font-size: 0.83rem;
          font-weight: 500;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
        .reg-combo-option-loc {
          font-size: 0.7rem;
          color: var(--text-light);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
        }
        .reg-combo-empty {
          padding: 0.75rem;
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-light);
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
