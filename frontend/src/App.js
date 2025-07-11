import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gallery from "./components/Gallery";
import { Toaster } from "./components/ui/toaster";
import advancedDevToolsDetection from "./services/advancedDevToolsDetection";
import minimalSecurity from "./services/minimalSecurity";
import DevToolsTestUtils from "./utils/devToolsTestUtils";

function App() {
  useEffect(() => {
    // Initialize advanced DevTools detection with enhanced blur effects
    console.log('🔒 VaultSecure: Initializing advanced DevTools protection');
    
    // The advanced detection service is already initialized automatically
    // You can check its status with: window.advancedDevToolsDebug.getStatus()
    
    // Also keep the minimal security for screenshot protection
    console.log('🔒 VaultSecure: Screenshot protection also active');
  }, []);

  return (
    <div className="App">
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Gallery />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;