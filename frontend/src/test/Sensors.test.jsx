import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sensors from '../pages/Sensors';

vi.mock('../services/api', () => ({
  fetchSensors: vi.fn(),
  updateSensor: vi.fn(),
  deleteSensor: vi.fn(),
}));

import { fetchSensors } from '../services/api';

const sensorsPageMock = {
  content: [
    {
      id: 1,
      name: 'Alpha',
      location: 'Dublin',
      createdAt: '2026-01-01T00:00:00Z',
      status: 'online',
    },
  ],
  totalPages: 1,
  totalElements: 1,
  page: 0,
  size: 20,
};

function renderSensors() {
  return render(
    <MemoryRouter>
      <Sensors />
    </MemoryRouter>,
  );
}

describe('Sensors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sensor table after loading', async () => {
    fetchSensors.mockResolvedValue(sensorsPageMock);
    renderSensors();
    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
    });
  });

  it('renders search input', async () => {
    fetchSensors.mockResolvedValue(sensorsPageMock);
    renderSensors();
    expect(screen.getByPlaceholderText('Search by name or location...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Loading sensors...')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no sensors', async () => {
    fetchSensors.mockResolvedValue({
      content: [],
      totalPages: 0,
      totalElements: 0,
      page: 0,
      size: 20,
    });
    renderSensors();
    await waitFor(() => {
      expect(screen.getByText(/No sensors registered yet/)).toBeInTheDocument();
    });
  });

  it('shows error state on fetch failure', async () => {
    fetchSensors.mockRejectedValue(new Error('fail'));
    renderSensors();
    await waitFor(() => {
      expect(
        screen.getByText('Failed to load sensors. Please try again later.'),
      ).toBeInTheDocument();
    });
  });
});
