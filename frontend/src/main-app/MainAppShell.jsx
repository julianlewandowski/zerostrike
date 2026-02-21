/**
 * MainAppShell — mounts the product dashboard (main branch) inside a
 * MemoryRouter so it doesn't conflict with the outer case-study router.
 */
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import './styles/globals.css';
import ScanlineOverlay from './components/hud/ScanlineOverlay';
import CustomCursor from './components/hud/CustomCursor';
import TopNav from './components/layout/TopNav';
import TickerBar from './components/layout/TickerBar';
import Landing from './pages/Landing';
import AgripilotDashboard from './pages/AgripilotDashboard';
import Fleet from './pages/Fleet';
import Predictions from './pages/Predictions';
import { DataProvider } from './context/DataContext';

function CommandShell() {
  return (
    <div className="app-shell">
      <ScanlineOverlay />
      <TopNav />
      <TickerBar />
      <Outlet />
    </div>
  );
}

export default function MainAppShell({ isActive }) {
  return (
    <div className="product-app">
    <MemoryRouter initialEntries={['/']}>
      {isActive && <CustomCursor />}
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Dashboard is standalone — no TopNav/TickerBar overlay */}
        <Route path="/dashboard" element={<AgripilotDashboard />} />
        <Route element={<DataProvider><CommandShell /></DataProvider>}>
          <Route path="/fleet"       element={<Fleet />} />
          <Route path="/predictions" element={<Predictions />} />
        </Route>
      </Routes>
    </MemoryRouter>
    </div>
  );
}
