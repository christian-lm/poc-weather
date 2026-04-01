export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">PoC Weather Metrics</span>
      </div>

      <style>{`
        .topbar {
          height: 56px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
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
      `}</style>
    </header>
  );
}
