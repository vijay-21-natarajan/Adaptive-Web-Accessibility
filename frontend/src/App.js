import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import AccessibilityMiddleware from "./components/AccessibilityMiddleware";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AccessibilityForm from "./components/AccessibilityForm";
import CognitiveTracker from "./components/CognitiveTracker";
import Dashboard from "./components/Dashboard";
import "./App.css";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <CognitiveTracker>
            <AccessibilityMiddleware />
            <div className="app-container">
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
