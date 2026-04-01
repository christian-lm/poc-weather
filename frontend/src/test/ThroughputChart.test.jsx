import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ThroughputChart from '../components/ThroughputChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

describe('ThroughputChart', () => {
  it('renders chart when data is provided', () => {
    const data = [{ time: '2026-01-01T10:00:00Z', count: 42 }];
    render(<ThroughputChart data={data} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<ThroughputChart data={[]} />);
    expect(screen.getByText(/No ingestion data/)).toBeInTheDocument();
  });

  it('displays peak and average stats', () => {
    const data = [
      { time: '2026-01-01T08:00:00Z', count: 10 },
      { time: '2026-01-01T09:00:00Z', count: 30 },
    ];
    render(<ThroughputChart data={data} />);
    expect(screen.getByText('30 readings')).toBeInTheDocument();
    expect(screen.getByText('20 readings')).toBeInTheDocument();
  });
});
