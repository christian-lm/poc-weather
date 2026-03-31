/**
 * @module components/StatusBadge
 * @description Colour-coded pill badge that maps a status string (e.g. "online",
 * "timeout", "up") to a human label and semantic colour variant.
 * Falls back to an "info" style for unknown statuses.
 *
 * @param {Object} props
 * @param {string} props.status - Machine-readable status key
 * @param {string} [props.label] - Optional override for the displayed text
 */
import clsx from 'clsx';

const STATUS_CONFIG = {
  online: { label: 'Online', variant: 'success' },
  valid: { label: 'Valid', variant: 'success' },
  offline: { label: 'Offline', variant: 'error' },
  timeout: { label: 'Timeout', variant: 'warning' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
  error: { label: 'Error', variant: 'error' },
  up: { label: 'UP', variant: 'success' },
  down: { label: 'DOWN', variant: 'error' },
};

export default function StatusBadge({ status, label }) {
  const key = (status || '').toLowerCase();
  const config = STATUS_CONFIG[key] || { label: status, variant: 'info' };

  return (
    <span className={clsx('badge', config.variant)}>
      <span className="status-dot" style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        marginRight: 5,
        display: 'inline-block',
        background: 'currentColor',
      }} />
      {label || config.label}
    </span>
  );
}
