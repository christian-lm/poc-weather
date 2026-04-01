import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RealtimeStream from '../components/RealtimeStream';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('RealtimeStream', () => {
  it('renders table with entries', () => {
    const entries = [
      {
        sensorName: 'North Station',
        metricType: 'temperature',
        value: 20,
        timestamp: '2026-01-01T12:00:00.000Z',
      },
    ];
    renderWithRouter(<RealtimeStream entries={entries} />);
    expect(screen.getByText('North Station')).toBeInTheDocument();
    expect(screen.getByText('Ambient Temperature')).toBeInTheDocument();
  });

  it('shows empty message when no entries', () => {
    renderWithRouter(<RealtimeStream entries={[]} />);
    expect(screen.getByText(/No recent metrics/)).toBeInTheDocument();
  });

  it('displays formatted value with unit', () => {
    const entries = [
      {
        sensorName: 'S1',
        metricType: 'temperature',
        value: 22.5,
        timestamp: '2026-01-01T12:00:00.000Z',
      },
    ];
    renderWithRouter(<RealtimeStream entries={entries} />);
    expect(screen.getByText(/22\.50/)).toBeInTheDocument();
    expect(screen.getByText(/°C/)).toBeInTheDocument();
  });
});
