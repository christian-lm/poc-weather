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
