import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';

vi.mock('../services/api', () => ({
  fetchSensors: vi.fn().mockResolvedValue([]),
  fetchLatestAll: vi.fn().mockResolvedValue([]),
  fetchStream: vi.fn().mockResolvedValue([]),
  fetchHealth: vi.fn().mockResolvedValue({ status: 'UP', components: {} }),
  fetchActuatorMetric: vi.fn().mockResolvedValue({ measurements: [] }),
  default: { get: vi.fn(), post: vi.fn() },
}));

function renderWithRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<div data-testid="dashboard-page">Dashboard</div>} />
          <Route path="sensors" element={<div data-testid="sensors-page">Sensors</div>} />
          <Route path="metrics" element={<div data-testid="metrics-page">Metrics</div>} />
          <Route path="registration" element={<div data-testid="registration-page">Registration</div>} />
          <Route path="health" element={<div data-testid="health-page">Health</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('App Routing', () => {
  it('renders dashboard at root', () => {
    renderWithRoute('/');
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('renders sensors page', () => {
    renderWithRoute('/sensors');
    expect(screen.getByTestId('sensors-page')).toBeInTheDocument();
  });

  it('renders metrics page', () => {
    renderWithRoute('/metrics');
    expect(screen.getByTestId('metrics-page')).toBeInTheDocument();
  });

  it('renders registration page', () => {
    renderWithRoute('/registration');
    expect(screen.getByTestId('registration-page')).toBeInTheDocument();
  });

  it('renders health page', () => {
    renderWithRoute('/health');
    expect(screen.getByTestId('health-page')).toBeInTheDocument();
  });

  it('renders sidebar navigation', () => {
    renderWithRoute('/');
    expect(screen.getByText('Weather Data')).toBeInTheDocument();
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    const sensorsLink = screen.getByText('Sensors');
    expect(sensorsLink).toBeInTheDocument();
    expect(sensorsLink.closest('a')).toHaveAttribute('href', '/sensors');
  });
});
