import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gallery from "./components/Gallery";
import { Toaster } from "./components/ui/toaster";
import maximumSecurity from "./services/minimalSecurity";

function App() {
  useEffect(() => {
    // Initialize MAXIMUM AGGRESSIVE security protection
    console.log('🔒 VaultSecure: Initializing MAXIMUM AGGRESSIVE security protection');
    // Security service is already initialized automatically
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