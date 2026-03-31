/**
 * @module layout/TopBar
 * @description Top navigation bar with project branding and sensor search.
 * Kept intentionally minimal — no settings/profile icons since the PoC
 * has no authentication or role-based access control.
 */
import { Activity } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">PoC Weather Metrics</span>
      </div>

      <div className="topbar-status">
        <Activity size={13} style={{ color: 'var(--success)' }} />
        <span className="topbar-status-text">System Online</span>
      </div>

      <style>{`
        .topbar {
          height: 56px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .topbar-logo {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text);
          letter-spacing: 0.02em;
        }
        .topbar-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .topbar-status-text {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
        }
      `}</style>
    </header>
  );
}
