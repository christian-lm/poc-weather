import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StationCard from '../components/StationCard';

describe('StationCard', () => {
  const mockSensor = {
    sensorId: 7,
    sensorName: 'Dublin Central',
    location: 'Dublin, Ireland',
    latestMetrics: {
      temperature: 14.2,
      humidity: 68.0,
    },
    status: 'online',
  };

  it('renders temperature value', () => {
    render(<StationCard sensor={mockSensor} />);
    expect(screen.getByText('14.2')).toBeInTheDocument();
  });

  it('renders location as primary label and sensor name as secondary', () => {
    render(<StationCard sensor={mockSensor} />);
    expect(screen.getByText('Dublin, Ireland')).toBeInTheDocument();
    expect(screen.getByText('Dublin Central')).toBeInTheDocument();
  });

  it('renders humidity value', () => {
    render(<StationCard sensor={mockSensor} />);
    expect(screen.getByText('68% RH')).toBeInTheDocument();
  });

  it('renders online status badge', () => {
    render(<StationCard sensor={mockSensor} />);
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('handles missing metrics gracefully', () => {
    const emptyMetrics = { ...mockSensor, latestMetrics: {} };
    render(<StationCard sensor={emptyMetrics} />);
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('-- RH')).toBeInTheDocument();
  });

  it('shows dashes and Suspect badge for out-of-range temperature', () => {
    const extreme = { ...mockSensor, latestMetrics: { temperature: 1500, humidity: 50 } };
    render(<StationCard sensor={extreme} />);
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Suspect')).toBeInTheDocument();
  });

  it('shows dashes and Suspect badge for extreme negative temperature', () => {
    const extreme = { ...mockSensor, latestMetrics: { temperature: -1500, humidity: 50 } };
    render(<StationCard sensor={extreme} />);
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Suspect')).toBeInTheDocument();
  });

  it('shows dashes for out-of-range humidity', () => {
    const extreme = { ...mockSensor, latestMetrics: { temperature: 20, humidity: 150 } };
    render(<StationCard sensor={extreme} />);
    expect(screen.getByText('-- RH')).toBeInTheDocument();
    expect(screen.getByText('Suspect')).toBeInTheDocument();
  });
});
