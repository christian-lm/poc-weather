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

  it('renders location name', () => {
    render(<StationCard sensor={mockSensor} />);
    expect(screen.getByText('Dublin, Ireland')).toBeInTheDocument();
  });

  it('renders database sensor id', () => {
    render(<StationCard sensor={mockSensor} />);
    expect(screen.getByText('ID: 7')).toBeInTheDocument();
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
});
