import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import AccessibilityMiddleware from "./components/AccessibilityMiddleware";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AccessibilityForm from "./components/AccessibilityForm";
import CognitiveTracker from "./components/CognitiveTracker";
import Dashboard from "./components/Dashboard";
import "./App.css";

const Navbar = () => {
  const location = useLocation();
  const hideNav = location.pathname === "/" || location.pathname === "/signup";

  if (hideNav) return null;

  return (
    <nav className="dashboard-nav">
      <h1>Adaptive Web</h1>
      <div className="nav-links">
        <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>Accessibility</Link>
        <Link to="/monitoring" className={location.pathname === "/monitoring" ? "active" : ""}>Insights</Link>
        <Link to="/">Logout</Link>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <CognitiveTracker>
            <AccessibilityMiddleware />
            <div className="app-container">
              <Navbar />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<AccessibilityForm />} />
                <Route path="/monitoring" element={<Dashboard />} />
              </Routes>
            </div>
          </CognitiveTracker>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}
