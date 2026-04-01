import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Registration from '../pages/Registration';
import { fetchSensors, createSensor, ingestMetrics } from '../services/api';

vi.mock('../services/api', () => ({
  fetchSensors: vi.fn(),
  createSensor: vi.fn(),
  ingestMetrics: vi.fn(),
}));

const SENSORS_PAGE = {
  content: [{ id: 1, name: 'Alpha', location: 'Dublin' }],
  totalPages: 1,
  totalElements: 1,
  page: 0,
  size: 500,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <Registration />
    </MemoryRouter>,
  );
}

describe('Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchSensors).mockResolvedValue(SENSORS_PAGE);
    vi.mocked(createSensor).mockResolvedValue({});
    vi.mocked(ingestMetrics).mockResolvedValue({ recordsInserted: 4 });
  });

  it('renders registration form with both cards', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Search sensors...')).toBeInTheDocument(),
    );
    expect(screen.getByRole('heading', { name: 'Register Sensor' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Register Metrics' })).toBeInTheDocument();
  });

  it('creates sensor successfully', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('e.g., Sensor Zeta'), {
      target: { value: 'New Station' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Register Sensor/i }));
    await waitFor(() => {
      expect(
        screen.getByText('Sensor "New Station" registered successfully'),
      ).toBeInTheDocument();
    });
    expect(createSensor).toHaveBeenCalledWith({
      name: 'New Station',
      location: null,
    });
  });

  it('shows error for blank sensor name', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Register Sensor/i }));
    await waitFor(() => {
      expect(screen.getByText('Sensor name is required')).toBeInTheDocument();
    });
    expect(createSensor).not.toHaveBeenCalled();
  });

  it('ingests metrics for selected sensor', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Search sensors...')).toBeInTheDocument(),
    );
    const search = screen.getByPlaceholderText('Search sensors...');
    fireEvent.focus(search);
    fireEvent.change(search, { target: { value: 'Alpha' } });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Alpha/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Alpha/i }));
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Register Reading/i }));
    await waitFor(() => {
      expect(screen.getByText('Ingested 4 metric(s) successfully')).toBeInTheDocument();
    });
    expect(ingestMetrics).toHaveBeenCalledWith({
      sensorId: 1,
      metrics: {
        temperature: 22.5,
        humidity: 65,
        wind_speed: 12,
        pressure: 1013,
      },
    });
  });

  it('shows error when no sensor selected for metrics', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByPlaceholderText('Search sensors...')).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole('button', { name: /Register Reading/i }));
    await waitFor(() => {
      expect(screen.getByText('Select a sensor')).toBeInTheDocument();
    });
    expect(ingestMetrics).not.toHaveBeenCalled();
  });
});
