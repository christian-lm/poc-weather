import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error(
      `[API] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      error.response?.status ?? 'NETWORK_ERROR',
      error.response?.data?.message ?? error.message,
    );
    return Promise.reject(error);
  },
);

export async function fetchSensors({ page = 0, size = 20, search } = {}) {
  const params = new URLSearchParams({ page, size });
  if (search) params.set('search', search);
  const { data } = await api.get(`/sensors?${params.toString()}`);
  return data;
}

export async function createSensor(payload) {
  const { data } = await api.post('/sensors', payload);
  return data;
}

export async function updateSensor(id, payload) {
  const { data } = await api.put(`/sensors/${id}`, payload);
  return data;
}

export async function deleteSensor(id) {
  await api.delete(`/sensors/${id}`);
}

export async function ingestMetrics(payload) {
  const { data } = await api.post('/metrics', payload);
  return data;
}

export async function queryMetrics({ sensorIds, metrics, statistic, startDate, endDate }) {
  const params = new URLSearchParams();
  if (sensorIds && sensorIds.length) params.set('sensorIds', sensorIds.join(','));
  params.set('metrics', metrics.join(','));
  params.set('statistic', statistic);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const { data } = await api.get(`/metrics/query?${params.toString()}`);
  return data;
}

export async function fetchLatestAll({ page = 0, size = 20 } = {}) {
  const { data } = await api.get(`/metrics/latest-all?page=${page}&size=${size}`);
  return data;
}

export async function fetchStream(limit = 20) {
  const { data } = await api.get(`/metrics/stream?limit=${limit}`);
  return data;
}

export async function fetchThroughput(hours = 24) {
  const { data } = await api.get(`/metrics/throughput?hours=${hours}`);
  return data;
}

export default api;
