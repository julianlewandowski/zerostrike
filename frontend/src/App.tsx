import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
// @ts-ignore — main-app is plain JSX
import MainAppShell from "./main-app/MainAppShell";
import "@/lib/firebase";

type Tab = "casestudy" | "product";

const App = () => {
  const [tab, setTab] = useState<Tab>("product");

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />

      {/* ── Global tab switcher ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          gap: "2px",
          background: "rgba(0,0,0,0.85)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          padding: "4px 6px",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => setTab("product")}
          style={{
            padding: "4px 16px",
            fontSize: "9px",
            fontFamily: "monospace",
            fontWeight: "bold",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            background: tab === "product" ? "rgba(0,200,120,0.2)" : "transparent",
            color: tab === "product" ? "#00e67a" : "rgba(255,255,255,0.4)",
            outline: tab === "product" ? "1px solid rgba(0,200,120,0.4)" : "none",
          }}
        >
          Product Demo
        </button>
        <button
          onClick={() => setTab("casestudy")}
          style={{
            padding: "4px 16px",
            fontSize: "9px",
            fontFamily: "monospace",
            fontWeight: "bold",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
            background: tab === "casestudy" ? "rgba(255,100,50,0.25)" : "transparent",
            color: tab === "casestudy" ? "#ff6a35" : "rgba(255,255,255,0.4)",
            outline: tab === "casestudy" ? "1px solid rgba(255,100,50,0.5)" : "none",
          }}
        >
          Case Study
        </button>
      </div>

      {/* ── Tab content ── */}
      <div style={{ display: tab === "casestudy" ? "block" : "none" }}>
        <Index />
      </div>
      <div style={{ display: tab === "product" ? "block" : "none" }}>
        <MainAppShell isActive={tab === "product"} />
      </div>

    </TooltipProvider>
  );
};

export default App;
