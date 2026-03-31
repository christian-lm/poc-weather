/**
 * @module pages/Sensors
 * @description Sensor registry page listing all registered weather stations
 * in a paginated table with name, location, registration date, and operational status.
 * Supports server-side search, inline editing, and deletion with confirmation.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Radio, MapPin, Clock, Search, Pencil, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { fetchSensors, updateSensor, deleteSensor } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 20;

export default function Sensors() {
  const [sensors, setSensors] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const searchTimer = useRef(null);

  useEffect(() => () => { clearTimeout(toastTimer.current); clearTimeout(searchTimer.current); }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const loadPage = useCallback(async (p, q) => {
    setLoading(true);
    try {
      const data = await fetchSensors({ page: p, size: PAGE_SIZE, search: q || undefined });
      setSensors(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setError(null);
    } catch {
      setError('Failed to load sensors. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(0, ''); }, [loadPage]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadPage(0, value), 300);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadPage(newPage, search);
  };

  const startEdit = (sensor) => {
    setEditingId(sensor.id);
    setEditName(sensor.name);
    setEditLocation(sensor.location || '');
    setDeleteTarget(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditLocation('');
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) { showToast('Name is required', 'error'); return; }
    try {
      await updateSensor(id, { name: editName.trim(), location: editLocation.trim() || null });
      showToast('Sensor updated');
      cancelEdit();
      loadPage(page, search);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSensor(deleteTarget.id);
      showToast(`Sensor "${deleteTarget.name}" and all its metrics deleted`);
      setDeleteTarget(null);
      const newTotal = totalElements - 1;
      const maxPage = Math.max(0, Math.ceil(newTotal / PAGE_SIZE) - 1);
      const targetPage = Math.min(page, maxPage);
      setPage(targetPage);
      loadPage(targetPage, search);
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-breadcrumb">
        <span style={{ color: 'var(--text-light)' }}>Global</span>
        <span style={{ color: 'var(--text-light)' }}>&rsaquo;</span>
        <span>Sensors</span>
      </div>
      <h1 className="page-title">Sensor Registry</h1>
      <p className="page-desc">All registered weather stations and their current operational status.</p>

      <div className="sensor-toolbar">
        <div className="sensor-search-wrap">
          <Search size={14} className="sensor-search-icon" />
          <input
            type="text"
            className="sensor-search-input"
            placeholder="Search by name or location..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
          />
          {search && (
            <button className="sensor-search-clear" onClick={() => handleSearchChange('')} aria-label="Clear search">
              <X size={13} />
            </button>
          )}
        </div>
        <span className="sensor-toolbar-count">{totalElements} sensors</span>
      </div>

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
          {search ? `No sensors match "${search}"` : <>No sensors registered yet. <a href="/registration">Register your first sensor</a>.</>}
        </div>
      )}

      {!loading && !error && sensors.length > 0 && (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="sensor-table">
              <thead>
                <tr>
                  <th>Sensor</th>
                  <th>Location</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sensors.map((s) => (
                  <tr key={s.id}>
                    <td>
                      {editingId === s.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="sensor-edit-input"
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') cancelEdit(); }}
                        />
                      ) : (
                        <div className="sensor-cell">
                          <div className="sensor-icon-wrap">
                            <Radio size={16} />
                          </div>
                          <div className="sensor-name-block">
                            <div className="sensor-name" title={s.name}>{s.name}</div>
                            <div className="sensor-sub">ID: {s.id}</div>
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingId === s.id ? (
                        <input
                          type="text"
                          value={editLocation}
                          onChange={e => setEditLocation(e.target.value)}
                          className="sensor-edit-input"
                          placeholder="Location..."
                          onKeyDown={e => { if (e.key === 'Enter') saveEdit(s.id); if (e.key === 'Escape') cancelEdit(); }}
                        />
                      ) : (
                        <div className="sensor-location" title={s.location || 'Not specified'}>
                          <MapPin size={13} />
                          <span>{s.location || 'Not specified'}</span>
                        </div>
                      )}
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
                    <td>
                      <div className="sensor-actions">
                        {editingId === s.id ? (
                          <>
                            <button className="sensor-action-btn save" onClick={() => saveEdit(s.id)} title="Save">
                              <Check size={14} />
                            </button>
                            <button className="sensor-action-btn cancel" onClick={cancelEdit} title="Cancel">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="sensor-action-btn edit" onClick={() => startEdit(s)} title="Edit">
                              <Pencil size={13} />
                            </button>
                            <button className="sensor-action-btn delete" onClick={() => { setDeleteTarget(s); setEditingId(null); }} title="Delete">
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sensor-pagination">
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            <span className="sensor-pagination-info">{totalElements} sensors total</span>
          </div>
        </>
      )}

      {deleteTarget && (
        <div className="del-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="del-modal card" onClick={e => e.stopPropagation()}>
            <div className="del-modal-icon">
              <AlertTriangle size={24} />
            </div>
            <h3 className="del-modal-title">Delete Sensor</h3>
            <p className="del-modal-text">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>
            <p className="del-modal-warning">
              <AlertTriangle size={13} />
              All associated metric readings will be permanently deleted. This action cannot be undone.
            </p>
            <div className="del-modal-actions">
              <button
                className="del-modal-cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="del-modal-confirm"
                onClick={confirmDelete}
                disabled={deleting}
              >
                <Trash2 size={14} />
                {deleting ? 'Deleting...' : 'Delete Sensor & Metrics'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      <style>{`
        .sensor-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .sensor-search-wrap {
          position: relative;
          flex: 1;
          max-width: 360px;
        }
        .sensor-search-icon {
          position: absolute;
          left: 0.65rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-light);
          pointer-events: none;
        }
        .sensor-search-input {
          width: 100%;
          padding-left: 2rem;
          padding-right: 2rem;
          font-size: 0.85rem;
        }
        .sensor-search-clear {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-light);
          display: flex;
          align-items: center;
          padding: 2px;
          border-radius: 50%;
        }
        .sensor-search-clear:hover {
          color: var(--text);
          background: var(--surface-alt);
        }
        .sensor-toolbar-count {
          font-size: 0.78rem;
          color: var(--text-light);
          white-space: nowrap;
        }
        .sensor-table {
          table-layout: fixed;
          width: 100%;
        }
        .sensor-table th:nth-child(1) { width: 25%; }
        .sensor-table th:nth-child(2) { width: 28%; }
        .sensor-table th:nth-child(3) { width: 15%; }
        .sensor-table th:nth-child(4) { width: 14%; }
        .sensor-table th:nth-child(5) { width: 100px; }
        .sensor-cell {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
        }
        .sensor-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--radius);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sensor-name-block {
          min-width: 0;
        }
        .sensor-name {
          font-weight: 600;
          font-size: 0.875rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sensor-sub {
          font-size: 0.72rem;
          color: var(--text-light);
        }
        .sensor-location {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--text-secondary);
          min-width: 0;
        }
        .sensor-location span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sensor-edit-input {
          width: 100%;
          font-size: 0.85rem;
          padding: 0.3rem 0.5rem;
        }
        .sensor-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
        .sensor-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--surface);
          cursor: pointer;
          transition: all var(--transition);
          color: var(--text-light);
          padding: 0;
        }
        .sensor-action-btn.edit:hover {
          color: var(--primary);
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .sensor-action-btn.delete:hover {
          color: var(--error);
          border-color: var(--error);
          background: var(--error-light);
        }
        .sensor-action-btn.save {
          color: var(--success);
          border-color: var(--success);
          background: var(--success-light);
        }
        .sensor-action-btn.save:hover {
          background: var(--success);
          color: #fff;
        }
        .sensor-action-btn.cancel:hover {
          color: var(--text);
          border-color: var(--text-muted);
        }
        .del-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.15s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .del-modal {
          width: 100%;
          max-width: 420px;
          padding: 2rem;
          text-align: center;
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .del-modal-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--error-light);
          color: var(--error);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .del-modal-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .del-modal-text {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }
        .del-modal-warning {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background: var(--warning-light);
          color: var(--warning);
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius);
          text-align: left;
          margin-bottom: 1.25rem;
          line-height: 1.45;
        }
        .del-modal-warning svg {
          flex-shrink: 0;
          margin-top: 1px;
        }
        .del-modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }
        .del-modal-cancel {
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
          font-family: inherit;
        }
        /* Overrides global button:hover background (higher specificity than .del-modal-* alone) */
        button.del-modal-cancel:hover {
          border-color: var(--text-muted);
          color: var(--text);
          background: var(--surface-hover);
        }
        .del-modal-confirm {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1.25rem;
          border-radius: var(--radius);
          border: none;
          background: var(--error);
          color: #fff;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
          font-family: inherit;
        }
        button.del-modal-confirm:hover:not(:disabled) {
          background: var(--error-hover);
          color: #fff;
        }
        .del-modal-confirm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .sensor-pagination {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.25rem;
        }
        .sensor-pagination-info {
          font-size: 0.72rem;
          color: var(--text-light);
        }
      `}</style>
    </div>
  );
}
