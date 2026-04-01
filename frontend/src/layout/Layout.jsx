import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }
        .app-main {
          flex: 1;
          margin-left: 220px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .app-content {
          flex: 1;
          padding: 1.5rem;
          max-width: 1280px;
          width: 100%;
        }
        @media (max-width: 768px) {
          .app-main {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
