import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
    },
  };
});

let api;
let mockInstance;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  const mod = await import('../services/api.js');
  api = mod;
  mockInstance = axios.create();
});

describe('fetchSensors', () => {
  it('builds query params correctly', async () => {
    mockInstance.get.mockResolvedValue({ data: { content: [] } });
    await api.fetchSensors({ page: 2, size: 10, search: 'dublin' });
    expect(mockInstance.get).toHaveBeenCalledWith(expect.stringContaining('page=2'));
    expect(mockInstance.get).toHaveBeenCalledWith(expect.stringContaining('size=10'));
    expect(mockInstance.get).toHaveBeenCalledWith(expect.stringContaining('search=dublin'));
  });

  it('omits search when not provided', async () => {
    mockInstance.get.mockResolvedValue({ data: { content: [] } });
    await api.fetchSensors({ page: 0, size: 20 });
    const url = mockInstance.get.mock.calls[0][0];
    expect(url).not.toContain('search');
  });
});

describe('createSensor', () => {
  it('posts to /sensors', async () => {
    mockInstance.post.mockResolvedValue({ data: { id: 1, name: 'S1' } });
    const result = await api.createSensor({ name: 'S1', location: 'L1' });
    expect(mockInstance.post).toHaveBeenCalledWith('/sensors', { name: 'S1', location: 'L1' });
    expect(result.id).toBe(1);
  });
});

describe('updateSensor', () => {
  it('puts to /sensors/:id', async () => {
    mockInstance.put.mockResolvedValue({ data: { id: 5, name: 'Updated' } });
    const result = await api.updateSensor(5, { name: 'Updated' });
    expect(mockInstance.put).toHaveBeenCalledWith('/sensors/5', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });
});

describe('deleteSensor', () => {
  it('deletes /sensors/:id', async () => {
    mockInstance.delete.mockResolvedValue({});
    await api.deleteSensor(3);
    expect(mockInstance.delete).toHaveBeenCalledWith('/sensors/3');
  });
});

describe('ingestMetrics', () => {
  it('posts to /metrics', async () => {
    mockInstance.post.mockResolvedValue({ data: { recordsInserted: 2 } });
    const result = await api.ingestMetrics({ sensorId: 1, metrics: { temperature: 22.5 } });
    expect(mockInstance.post).toHaveBeenCalledWith('/metrics', { sensorId: 1, metrics: { temperature: 22.5 } });
    expect(result.recordsInserted).toBe(2);
  });
});

describe('queryMetrics', () => {
  it('builds query string with sensorIds', async () => {
    mockInstance.get.mockResolvedValue({ data: { results: [] } });
    await api.queryMetrics({
      sensorIds: [1, 2],
      metrics: ['temperature', 'humidity'],
      statistic: 'average',
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2026-01-07T00:00:00Z',
    });
    const url = mockInstance.get.mock.calls[0][0];
    expect(url).toContain('sensorIds=1%2C2');
    expect(url).toContain('metrics=temperature%2Chumidity');
    expect(url).toContain('statistic=average');
    expect(url).toContain('startDate=');
    expect(url).toContain('endDate=');
  });

  it('omits sensorIds when empty', async () => {
    mockInstance.get.mockResolvedValue({ data: { results: [] } });
    await api.queryMetrics({ sensorIds: [], metrics: ['temperature'], statistic: 'average' });
    const url = mockInstance.get.mock.calls[0][0];
    expect(url).not.toContain('sensorIds');
  });
});

describe('fetchLatestAll', () => {
  it('includes page and size params', async () => {
    mockInstance.get.mockResolvedValue({ data: { content: [] } });
    await api.fetchLatestAll({ page: 1, size: 5 });
    expect(mockInstance.get).toHaveBeenCalledWith('/metrics/latest-all?page=1&size=5');
  });
});

describe('fetchStream', () => {
  it('passes limit parameter', async () => {
    mockInstance.get.mockResolvedValue({ data: [] });
    await api.fetchStream(10);
    expect(mockInstance.get).toHaveBeenCalledWith('/metrics/stream?limit=10');
  });
});

describe('fetchThroughput', () => {
  it('passes hours parameter', async () => {
    mockInstance.get.mockResolvedValue({ data: [] });
    await api.fetchThroughput(48);
    expect(mockInstance.get).toHaveBeenCalledWith('/metrics/throughput?hours=48');
  });
});
