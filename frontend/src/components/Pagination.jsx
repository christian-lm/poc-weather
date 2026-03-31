/**
 * @module components/Pagination
 * @description Reusable pagination control with previous/next buttons and
 * a compact page-number strip. Hides itself when totalPages <= 1.
 *
 * @param {Object}   props
 * @param {number}   props.page         - Current zero-based page index
 * @param {number}   props.totalPages   - Total number of pages
 * @param {Function} props.onPageChange - Called with the new page index
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';

function getVisiblePages(current, total) {
  const delta = 1;
  const pages = [];
  const left = Math.max(0, current - delta);
  const right = Math.min(total - 1, current + delta);

  if (left > 0) pages.push(0);
  if (left > 1) pages.push('...');

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < total - 2) pages.push('...');
  if (right < total - 1) pages.push(total - 1);

  return pages;
}

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(page, totalPages);

  return (
    <nav className="pg-nav" aria-label="Pagination">
      <button
        className="pg-btn"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="pg-dots">&hellip;</span>
        ) : (
          <button
            key={p}
            className={`pg-btn pg-num ${p === page ? 'pg-active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p + 1}
          </button>
        ),
      )}

      <button
        className="pg-btn"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>

      <style>{`
        .pg-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 1.25rem;
        }
        .pg-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 6px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition);
        }
        .pg-btn:hover:not(:disabled) {
          background: var(--surface-alt);
          border-color: var(--primary);
          color: var(--primary);
        }
        .pg-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .pg-active {
          background: var(--primary) !important;
          border-color: var(--primary) !important;
          color: #fff !important;
        }
        .pg-dots {
          width: 24px;
          text-align: center;
          color: var(--text-light);
          font-size: 0.8rem;
          user-select: none;
        }
      `}</style>
    </nav>
  );
}
