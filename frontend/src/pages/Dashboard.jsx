import { useState, useCallback, useRef } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { fetchLatestAll, fetchStream, fetchThroughput } from '../services/api';
import usePolling from '../hooks/usePolling';
import StationCard from '../components/StationCard';
import ThroughputChart from '../components/ThroughputChart';
import RealtimeStream from '../components/RealtimeStream';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

export default function Dashboard() {
  const [stations, setStations] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [streamEntries, setStreamEntries] = useState([]);
  const [throughputData, setThroughputData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const pageRef = useRef(page);
  pageRef.current = page;

  const refresh = useCallback(async () => {
    try {
      const [latestData, streamData, throughput] = await Promise.all([
        fetchLatestAll({ page: pageRef.current, size: PAGE_SIZE }),
        fetchStream(10),
        fetchThroughput(24),
      ]);
      setStations(latestData.content);
      setTotalPages(latestData.totalPages);
      setTotalElements(latestData.totalElements);
      setStreamEntries(streamData);
      setThroughputData(throughput);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
    }
  }, []);

  usePolling(refresh, 30000);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    pageRef.current = newPage;
    refresh();
  };

  const allNominal = stations.length > 0 && stations.every(s => s.status !== 'maintenance' && s.status !== 'offline');

  return (
    <div className="dashboard">
      <div className="dashboard-breadcrumb">
        <span className="breadcrumb-muted">Global</span>
        <span className="breadcrumb-sep">&rsaquo;</span>
        <span>Dashboard</span>
      </div>

      <div className="dashboard-title-row">
        <h1 className="dashboard-title">Atmospheric Overview</h1>
        <div className="dashboard-title-meta">
          {allNominal ? (
            <span className="system-status nominal">
              <CheckCircle size={14} />
              All Systems Nominal
            </span>
          ) : (
            <span className="system-status degraded">
              <AlertTriangle size={14} />
              Degraded
            </span>
          )}
          {lastUpdate && (
            <span className="dashboard-update-time">
              Update: {lastUpdate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })} UTC
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--warning)', background: 'var(--warning-light)', marginBottom: '1rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--warning)' }}>
          {error} &mdash; retrying automatically...
        </div>
      )}

      <div className="station-grid">
        {stations.map((s) => (
          <StationCard key={s.sensorId} sensor={s} />
        ))}
        {stations.length === 0 && !error && (
          <>
            {[1,2,3,4].map(i => (
              <div key={i} className="station-card-skeleton card" />
            ))}
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="dashboard-pagination">
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          <span className="pagination-info">{totalElements} sensors total</span>
        </div>
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <ThroughputChart data={throughputData} />
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <RealtimeStream entries={streamEntries} />
      </div>

      <footer className="dashboard-footer">
        <span className="footer-version">PoC Weather Metrics &middot; christianlm 2026</span>
      </footer>

      <style>{`
        .dashboard-breadcrumb {
          font-size: 0.72rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-bottom: 0.35rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .breadcrumb-muted { color: var(--text-light); }
        .breadcrumb-sep { color: var(--text-light); }

        .dashboard-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .dashboard-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text);
        }
        .dashboard-title-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .system-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .system-status.nominal {
          background: var(--success-light);
          color: var(--success);
        }
        .system-status.degraded {
          background: var(--warning-light);
          color: var(--warning);
        }
        .dashboard-update-time {
          font-size: 0.75rem;
          color: var(--text-light);
          font-weight: 500;
        }

        .station-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }
        .station-card-skeleton {
          height: 160px;
          background: var(--surface-alt);
          border: 1px dashed var(--border);
          border-radius: var(--radius-lg);
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }

        .dashboard-pagination {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.25rem;
        }
        .pagination-info {
          font-size: 0.72rem;
          color: var(--text-light);
        }

        .dashboard-footer {
          margin-top: 2.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-version {
          font-size: 0.7rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
      `}</style>
    </div>
  );
}
