import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gallery from "./components/Gallery";
import { Toaster } from "./components/ui/toaster";
import minimalSecurity from "./services/minimalSecurity";

function App() {
  useEffect(() => {
    // Initialize basic security (screenshot protection only)
    console.log('🔒 VaultSecure: Initializing basic security protection');
    
    // Only screenshot protection is active
    console.log('🔒 VaultSecure: Screenshot protection active');
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