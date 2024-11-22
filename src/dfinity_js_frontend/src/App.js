import React from "react";
import "./App.css";
import HomeLandingpagePage from "./pages/HomeLandingpage";
import "./styles/tailwind.css";
import "./styles/index.css";
import "./styles/font.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Driver from "./pages/Driver";
import Farmer from "./pages/Farmer";
import Processor from "./pages/Processor";
import Distributor from "./pages/Distributor";

const App = function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeLandingpagePage />} />
        <Route path="/drivers" element={<Driver />} />
        <Route path="/processors" element={<Processor />} />
        <Route path="/distributors" element={<Distributor />} />
        <Route path="/farmers" element={<Farmer />} />
      </Routes>
    </Router>
  );
};

export default App;
