import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
// @ts-ignore — main-app is plain JSX
import ZeroStrikeDashboard from "./main-app/pages/ZeroStrikeDashboard";
// @ts-ignore
import Fleet from "./main-app/pages/Fleet";
// @ts-ignore
import Predictions from "./main-app/pages/Predictions";
// @ts-ignore
import { DataProvider } from "./main-app/context/DataContext";
// @ts-ignore
import ScanlineOverlay from "./main-app/components/hud/ScanlineOverlay";
// @ts-ignore
import CustomCursor from "./main-app/components/hud/CustomCursor";
// @ts-ignore
import TopNav from "./main-app/components/layout/TopNav";
// @ts-ignore
import TickerBar from "./main-app/components/layout/TickerBar";
import "./main-app/styles/globals.css";
import "@/lib/firebase";

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

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CustomCursor />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/case-study" element={<Index />} />
          <Route path="/dashboard" element={<ZeroStrikeDashboard />} />
          <Route element={<DataProvider><CommandShell /></DataProvider>}>
            <Route path="/fleet"       element={<Fleet />} />
            <Route path="/predictions" element={<Predictions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
