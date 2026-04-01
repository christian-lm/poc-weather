import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MetricsQueryPage from '../pages/MetricsQuery';
import { fetchSensors, queryMetrics } from '../services/api';

vi.mock('../services/api', () => ({
  fetchSensors: vi.fn(),
  queryMetrics: vi.fn(),
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  BarChart: ({ children }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

const SENSORS_PAGE = {
  content: [
    { id: 1, name: 'S1', location: 'L1' },
    { id: 2, name: 'S2', location: 'L2' },
  ],
  totalPages: 1,
  totalElements: 2,
  page: 0,
  size: 500,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <MetricsQueryPage />
    </MemoryRouter>,
  );
}

describe('MetricsQuery', () => {
  beforeEach(() => {
    vi.mocked(fetchSensors).mockResolvedValue(SENSORS_PAGE);
    vi.mocked(queryMetrics).mockResolvedValue({ results: [] });
  });

  it('renders query builder form', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /S1/i })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /S2/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Run Query/i })).toBeInTheDocument();
  });

  it('allows selecting metrics', async () => {
    renderPage();
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /S1/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Temperature (°C)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Humidity (%)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wind Speed (km/h)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pressure (hPa)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Precipitation (mm)' })).toBeInTheDocument();
  });

  it('submits query and shows results', async () => {
    vi.mocked(queryMetrics).mockResolvedValue({
      query: {
        sensorIds: [1],
        metrics: ['temperature'],
        statistic: 'average',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-01-08T23:59:59.000Z',
      },
      results: [
        { sensorId: 1, sensorName: 'S1', data: { temperature: 22.5 } },
      ],
    });
    renderPage();
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /S1/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('checkbox', { name: /S1/i }));
    fireEvent.click(screen.getByRole('button', { name: /Run Query/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Raw Telemetry Response' })).toBeInTheDocument();
    });
    const table = screen.getByRole('table');
    expect(within(table).getByText('S1')).toBeInTheDocument();
  });

  it('shows empty results message', async () => {
    vi.mocked(queryMetrics).mockResolvedValue({ results: [] });
    renderPage();
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /S1/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Run Query/i }));
    await waitFor(() => {
      expect(
        screen.getByText('No results for the selected sensors and time range.'),
      ).toBeInTheDocument();
    });
  });

  it('allows querying all sensors when none selected', async () => {
    vi.mocked(queryMetrics).mockResolvedValue({ results: [] });
    renderPage();
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /S1/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Run Query/i }));
    await waitFor(() => {
      expect(queryMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          sensorIds: [],
          metrics: expect.arrayContaining(['temperature']),
        }),
      );
    });
  });
});
