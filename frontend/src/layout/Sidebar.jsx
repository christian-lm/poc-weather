import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  BarChart3,
  PlusCircle,
  BookOpen,
} from 'lucide-react';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sensors', icon: Radio, label: 'Sensors' },
  { to: '/metrics', icon: BarChart3, label: 'Metrics Query' },
  { to: '/registration', icon: PlusCircle, label: 'Registration' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1 className="sidebar-title">Weather Data</h1>
        <span className="sidebar-subtitle">Precision Metrics</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active')
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="sidebar-divider" />

        <a
          href="https://github.com/christian-lm/poc-weather"
          target="_blank"
          rel="noreferrer"
          className="sidebar-link"
        >
          <BookOpen size={18} />
          <span>Documentation</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">
          PoC Weather Metrics v0.1.0
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 220px;
          min-height: 100vh;
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 50;
        }
        .sidebar-brand {
          padding: 1.5rem 1.25rem 1.25rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .sidebar-subtitle {
          font-size: 0.65rem;
          color: var(--sidebar-text);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .sidebar-nav {
          flex: 1;
          padding: 0.75rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius);
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--sidebar-text);
          text-decoration: none;
          transition: all var(--transition);
        }
        .sidebar-link:hover {
          background: var(--sidebar-surface);
          color: #e2e8f0;
          text-decoration: none;
        }
        .sidebar-link.active {
          background: rgba(59,130,246,0.12);
          color: var(--sidebar-accent);
        }
        .sidebar-divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 0.5rem 0;
        }
        .sidebar-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-version {
          font-size: 0.65rem;
          color: var(--sidebar-text);
          letter-spacing: 0.02em;
        }
        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            min-height: auto;
            position: static;
            flex-direction: row;
            align-items: center;
            overflow-x: auto;
          }
          .sidebar-brand {
            padding: 0.75rem 1rem;
            border-bottom: none;
            border-right: 1px solid rgba(255,255,255,0.06);
            white-space: nowrap;
          }
          .sidebar-nav {
            flex-direction: row;
            padding: 0.5rem;
            gap: 2px;
            overflow-x: auto;
          }
          .sidebar-link span {
            display: none;
          }
          .sidebar-divider {
            width: 1px;
            height: 24px;
            margin: 0 0.25rem;
          }
          .sidebar-footer {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
