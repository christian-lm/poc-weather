import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge', () => {
  it('renders online status with success styling', () => {
    render(<StatusBadge status="online" />);
    const badge = screen.getByText('Online');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('.badge')).toHaveClass('success');
  });

  it('renders timeout status with warning styling', () => {
    render(<StatusBadge status="timeout" />);
    const badge = screen.getByText('Timeout');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('.badge')).toHaveClass('warning');
  });

  it('renders error status with error styling', () => {
    render(<StatusBadge status="error" />);
    const badge = screen.getByText('Error');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('.badge')).toHaveClass('error');
  });

  it('renders custom label when provided', () => {
    render(<StatusBadge status="online" label="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('handles unknown status gracefully', () => {
    render(<StatusBadge status="unknown-state" />);
    expect(screen.getByText('unknown-state')).toBeInTheDocument();
  });
});
