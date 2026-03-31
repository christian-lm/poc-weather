/**
 * @module App
 * @description Root component that wires up client-side routing via react-router-dom.
 * All routes are nested inside the shared {@link Layout} shell which provides
 * the sidebar, top bar, and main content area.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Sensors from './pages/Sensors';
import MetricsQuery from './pages/MetricsQuery';
import Registration from './pages/Registration';
import SystemHealth from './pages/SystemHealth';

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="sensors" element={<Sensors />} />
            <Route path="metrics" element={<MetricsQuery />} />
            <Route path="registration" element={<Registration />} />
            <Route path="health" element={<SystemHealth />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
