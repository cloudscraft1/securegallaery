import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gallery from "./components/Gallery";
import { Toaster } from "./components/ui/toaster";
import securityService from "./services/security";

function App() {
  useEffect(() => {
    // Initialize global security protection
    console.log('🔒 VaultSecure: Initializing global security protection');
    // Security service is already initialized automatically
  }, []);

  return (
    <div className="App protected-content">
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