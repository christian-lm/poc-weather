import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="nf-page">
      <div className="card nf-card">
        <AlertTriangle size={40} className="nf-icon" />
        <h1 className="nf-title">404</h1>
        <p className="nf-text">The page you requested does not exist or has been moved.</p>
        <Link to="/" className="primary nf-link">
          <Home size={16} />
          Back to Dashboard
        </Link>
      </div>

      <style>{`
        .nf-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }
        .nf-card {
          max-width: 420px;
          text-align: center;
          padding: 3rem 2rem;
        }
        .nf-icon {
          color: var(--warning);
          margin-bottom: 1rem;
        }
        .nf-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.5rem;
        }
        .nf-text {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .nf-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.5rem;
          font-size: 0.9rem;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
