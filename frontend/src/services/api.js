/**
 * @module services/api
 * @description Centralised HTTP client built on Axios. Every backend interaction
 * goes through this module, keeping base URL and headers in one place.
 * The Axios instance targets `/api/v1` and is exported as the default for
 * ad-hoc use, while named exports wrap each endpoint with error propagation.
 */
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

/**
 * Lists all registered sensors.
 * @returns {Promise<Array<{id: number, name: string, location: string, createdAt: string}>>}
 */
export async function fetchSensors() {
  const { data } = await api.get('/sensors');
  return data;
}

/**
 * Creates a new sensor.
 * @param {{name: string, location?: string}} payload
 * @returns {Promise<Object>} The created sensor
 */
export async function createSensor(payload) {
  const { data } = await api.post('/sensors', payload);
  return data;
}

/**
 * Ingests metric readings for a given sensor.
 * @param {{sensorId: number, metrics: Object<string, number>}} payload
 * @returns {Promise<{recordsInserted: number}>}
 */
export async function ingestMetrics(payload) {
  const { data } = await api.post('/metrics', payload);
  return data;
}

/**
 * Executes an aggregation query across sensors and metrics.
 * @param {Object}   opts
 * @param {number[]} [opts.sensorIds]  - Sensor IDs (empty = all)
 * @param {string[]} opts.metrics      - Metric type keys
 * @param {string}   opts.statistic    - Aggregation function
 * @param {string}   [opts.startDate]  - ISO-8601 range start
 * @param {string}   [opts.endDate]    - ISO-8601 range end
 * @returns {Promise<{query: Object, results: Array}>}
 */
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

/**
 * Fetches the latest reading per sensor and metric type.
 * @returns {Promise<Array<{sensorId: number, sensorName: string, latestMetrics: Object, status: string}>>}
 */
export async function fetchLatestAll() {
  const { data } = await api.get('/metrics/latest-all');
  return data;
}

/**
 * Fetches the N most recent individual metric readings.
 * @param {number} [limit=20]
 * @returns {Promise<Array<{timestamp: string, sensorId: number, sensorName: string, metricType: string, value: number}>>}
 */
export async function fetchStream(limit = 20) {
  const { data } = await api.get(`/metrics/stream?limit=${limit}`);
  return data;
}

/**
 * Fetches hourly metric ingestion counts for the throughput chart.
 * Backed by TimescaleDB time_bucket.
 * @param {number} [hours=24]
 * @returns {Promise<Array<{time: string, count: number}>>}
 */
export async function fetchThroughput(hours = 24) {
  const { data } = await api.get(`/metrics/throughput?hours=${hours}`);
  return data;
}

/**
 * Fetches Spring Boot Actuator health status.
 * @returns {Promise<{status: string, components: Object}>}
 */
export async function fetchHealth() {
  const { data } = await axios.get('/actuator/health');
  return data;
}

/**
 * Lists all available Actuator metric names.
 * @returns {Promise<{names: string[]}>}
 */
export async function fetchActuatorMetrics() {
  const { data } = await axios.get('/actuator/metrics');
  return data;
}

/**
 * Fetches a specific Actuator metric by name.
 * @param {string} name - e.g. "jvm.memory.used"
 * @returns {Promise<{name: string, measurements: Array<{statistic: string, value: number}>}>}
 */
export async function fetchActuatorMetric(name) {
  const { data } = await axios.get(`/actuator/metrics/${name}`);
  return data;
}

/**
 * Fetches Prometheus-format metrics text.
 * @returns {Promise<string>}
 */
export async function fetchPrometheus() {
  const { data } = await axios.get('/actuator/prometheus');
  return data;
}

export default api;
