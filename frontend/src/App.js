import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gallery from "./components/Gallery";
import { Toaster } from "./components/ui/toaster";
import minimalSecurity from "./services/minimalSecurity";

function App() {
  useEffect(() => {
    // Initialize minimal security (screenshot and devtools prevention only)
    console.log('🔒 VaultSecure: Initializing minimal security protection');
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