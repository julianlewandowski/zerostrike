import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import ScanlineOverlay from './components/hud/ScanlineOverlay';
import CustomCursor from './components/hud/CustomCursor';
import TopNav from './components/layout/TopNav';
import TickerBar from './components/layout/TickerBar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Predictions from './pages/Predictions';
import { DataProvider } from './context/DataContext';

/** Shared chrome for all command-center screens */
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

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<DataProvider><CommandShell /></DataProvider>}>
          <Route path="/dashboard"   element={<Dashboard />} />
          <Route path="/fleet"       element={<Fleet />} />
          <Route path="/predictions" element={<Predictions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
