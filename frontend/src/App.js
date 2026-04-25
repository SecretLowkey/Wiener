import React from "react";
import "./App.css";
import "./styles/landing.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import GlizzyEffects from "./components/GlizzyEffects";

function App() {
  return (
    <div className="App">
      <GlizzyEffects />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
