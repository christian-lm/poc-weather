import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

vi.mock('../services/api', () => ({
  fetchLatestAll: vi.fn(),
  fetchStream: vi.fn(),
  fetchThroughput: vi.fn(),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

import { fetchLatestAll, fetchStream, fetchThroughput } from '../services/api';

const latestMock = {
  content: [
    {
      sensorId: 1,
      sensorName: 'Alpha',
      location: 'North',
      latestMetrics: { temperature: 20.5, humidity: 60 },
      lastUpdated: '2026-03-01T00:00:00Z',
      status: 'online',
    },
  ],
  totalPages: 1,
  totalElements: 1,
  page: 0,
  size: 10,
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton when data is loading', () => {
    fetchLatestAll.mockReturnValue(new Promise(() => {}));
    fetchStream.mockResolvedValue([]);
    fetchThroughput.mockResolvedValue([]);
    renderDashboard();
    expect(document.querySelectorAll('.station-card-skeleton')).toHaveLength(4);
  });

  it('renders station cards after data loads', async () => {
    fetchLatestAll.mockResolvedValue(latestMock);
    fetchStream.mockResolvedValue([]);
    fetchThroughput.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('North')).toBeInTheDocument();
    });
    expect(screen.getByText('20.5')).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    fetchLatestAll.mockRejectedValue(new Error('network'));
    fetchStream.mockResolvedValue([]);
    fetchThroughput.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/)).toBeInTheDocument();
    });
  });

  it('renders pagination when multiple pages exist', async () => {
    fetchLatestAll.mockResolvedValue({
      ...latestMock,
      totalPages: 3,
      totalElements: 25,
    });
    fetchStream.mockResolvedValue([]);
    fetchThroughput.mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
    });
  });
});
