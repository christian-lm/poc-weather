import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Sensors from './pages/Sensors';
import MetricsQuery from './pages/MetricsQuery';
import Registration from './pages/Registration';
import NotFound from './pages/NotFound';

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
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
