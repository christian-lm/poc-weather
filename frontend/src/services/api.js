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
 * Lists sensors with server-side pagination and optional search.
 * @param {Object}  [opts]
 * @param {number}  [opts.page=0]   - Zero-based page index
 * @param {number}  [opts.size=20]  - Page size
 * @param {string}  [opts.search]   - Free-text filter on name/location
 * @returns {Promise<{content: Array, page: number, size: number, totalElements: number, totalPages: number}>}
 */
export async function fetchSensors({ page = 0, size = 20, search } = {}) {
  const params = new URLSearchParams({ page, size });
  if (search) params.set('search', search);
  const { data } = await api.get(`/sensors?${params.toString()}`);
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
 * Updates an existing sensor's name and/or location.
 * @param {number} id - Sensor ID
 * @param {{name: string, location?: string}} payload
 * @returns {Promise<Object>} The updated sensor
 */
export async function updateSensor(id, payload) {
  const { data } = await api.put(`/sensors/${id}`, payload);
  return data;
}

/**
 * Deletes a sensor and all its associated metrics.
 * @param {number} id - Sensor ID
 * @returns {Promise<void>}
 */
export async function deleteSensor(id) {
  await api.delete(`/sensors/${id}`);
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
 * Fetches the latest reading per sensor and metric type, paginated.
 * @param {Object} [opts]
 * @param {number} [opts.page=0]  - Zero-based page index
 * @param {number} [opts.size=20] - Page size
 * @returns {Promise<{content: Array, page: number, size: number, totalElements: number, totalPages: number}>}
 */
export async function fetchLatestAll({ page = 0, size = 20 } = {}) {
  const { data } = await api.get(`/metrics/latest-all?page=${page}&size=${size}`);
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
