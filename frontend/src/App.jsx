import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScanlineOverlay from './components/hud/ScanlineOverlay';
import TopNav from './components/layout/TopNav';
import TickerBar from './components/layout/TickerBar';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Predictions from './pages/Predictions';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <ScanlineOverlay />
        <TopNav />
        <TickerBar />
        <Routes>
          <Route path="/"      element={<Dashboard />} />
          <Route path="/fleet"        element={<Fleet />} />
          <Route path="/predictions" element={<Predictions />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
