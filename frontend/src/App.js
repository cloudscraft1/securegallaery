import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gallery from "./components/Gallery";
import { Toaster } from "./components/ui/toaster";
import simpleDevToolsDetection from "./services/simpleDevToolsDetection";
import minimalSecurity from "./services/minimalSecurity";

function App() {
  useEffect(() => {
    // Initialize simple DevTools detection
    console.log('🔒 VaultSecure: Initializing simple DevTools protection');
    
    // The simple detection service is already initialized automatically
    // You can check its status with: window.simpleDevToolsDetection.getStatus()
    
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