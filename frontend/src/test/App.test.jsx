import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Layout from '../layout/Layout';

vi.mock('../services/api', () => ({
  fetchSensors: vi.fn().mockResolvedValue({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 20 }),
  fetchLatestAll: vi.fn().mockResolvedValue({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 10 }),
  fetchStream: vi.fn().mockResolvedValue([]),
  fetchThroughput: vi.fn().mockResolvedValue([]),
  createSensor: vi.fn().mockResolvedValue({}),
  ingestMetrics: vi.fn().mockResolvedValue({}),
  queryMetrics: vi.fn().mockResolvedValue({ results: [] }),
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

  it('renders sidebar navigation', () => {
    renderWithRoute('/');
    expect(screen.getByText('Weather Data')).toBeInTheDocument();
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    const sensorsLink = screen.getByText('Sensors');
    expect(sensorsLink).toBeInTheDocument();
    expect(sensorsLink.closest('a')).toHaveAttribute('href', '/sensors');
  });

  it('does not render health page route', () => {
    renderWithRoute('/health');
    expect(screen.queryByTestId('health-page')).not.toBeInTheDocument();
  });
});
