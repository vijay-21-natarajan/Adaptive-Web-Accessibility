import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { AccessibilityContext } from "../context/AccessibilityContext";

export default function AccessibilityForm() {
  const { user, token } = useContext(AuthContext);
  const { settings, updateSettings } = useContext(AccessibilityContext);

  // Inputs for Prediction
  const [formData, setFormData] = useState({
    age_group: "adult", // Default to avoid empty string
    vision_score: 0.8,
    device_type: "desktop",
    lighting_condition: "medium",
    preferred_mode: "light",
  });

  // Init local state with global settings
  useEffect(() => {
    setFormData(prev => ({ ...prev })); // Just to trigger re-render if needed
  }, [settings]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", formData);
      if (res.data.error) {
        alert(`Error: ${res.data.error} `);
        return;
      }

      const newPrefs = {
        fontSize: res.data.predicted_font_size,
        contrast: res.data.predicted_contrast,
        narrator: false // Default to false for now, or predict this too
      };

      // Update Context -> Instant UI Change
      updateSettings(newPrefs);

      alert(`AI Recommendations Applied: ${newPrefs.fontSize}, ${newPrefs.contrast} `);

    } catch (err) {
      alert("Prediction failed.");
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      // Map context settings back to DB schema
      const profileData = {
        font_size: settings.fontSize,
        contrast: settings.contrast,
        voice_narration: settings.narrator,
        layout_preference: settings.layoutDensity,
        voice_assistant_enabled: settings.voiceAssistantEnabled
      };
      console.log("Saving profile. Token present:", !!token);
      await axios.put("http://127.0.0.1:5000/profile/update", profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Profile updated successfully!");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      alert(`Failed to save profile: ${errorMsg}`);
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2>Accessibility Dashboard</h2>
      {user && <p>Welcome, {user.username}!</p>}

      <h3>1. Get AI Recommendations</h3>
      <form onSubmit={handlePredict}>
        {/* Age group */}
        <label>Age Group:</label>
        <select name="age_group" onChange={handleChange} required>
          <option value="">Select Age Group</option>
          <option value="child">Child</option>
          <option value="teen">Teen</option>
          <option value="adult">Adult</option>
          <option value="senior">Senior</option>
        </select>

        <label>Vision Score (0-1):</label>
        <input type="number" name="vision_score" min="0" max="1" step="0.1" onChange={handleChange} required />

        <label>Device Type:</label>
        <select name="device_type" onChange={handleChange} required>
          <option value="">Select Device</option>
          <option value="mobile">Mobile</option>
          <option value="laptop">Laptop</option>
          <option value="desktop">Desktop</option>
        </select>

        <label>Lighting:</label>
        <select name="lighting_condition" onChange={handleChange} required>
          <option value="">Select Lighting</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="bright">Bright</option>
        </select>

        <label>Preferred Mode:</label>
        <select name="preferred_mode" onChange={handleChange} required>
          <option value="">Select Mode</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>

        <button type="submit">Get Recommendations</button>
      </form>

      <div className="result" style={{ marginTop: "30px" }}>
        <h3>2. Current Settings (Live Preview)</h3>

        <label>Font Size:</label>
        <select value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: e.target.value })}>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>

        <label>Contrast:</label>
        <select value={settings.contrast} onChange={(e) => updateSettings({ contrast: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label>Layout Density (AI Adaptive):</label>
        <select value={settings.layoutDensity} onChange={(e) => updateSettings({ layoutDensity: e.target.value })}>
          <option value="standard">Standard</option>
          <option value="spacious">Spacious (Anti-Misclick)</option>
          <option value="minimal">Minimal (High Focus)</option>
        </select>

        <label style={{ display: 'block', marginTop: '10px' }}>
          <input
            type="checkbox"
            checked={settings.narrator}
            onChange={(e) => updateSettings({ narrator: e.target.checked })}
          />
          Enable Voice Narration
        </label>

        <label style={{ display: 'block', marginTop: '10px' }}>
          <input
            type="checkbox"
            checked={settings.voiceAssistantEnabled}
            onChange={(e) => updateSettings({ voiceAssistantEnabled: e.target.checked })}
          />
          Enable Smart Voice Assistant (Commands: "Go to Dashboard", "Save profile")
        </label>

        <button onClick={handleSave} style={{ backgroundColor: "#28a745", marginTop: "15px" }}>Save Profile</button>
      </div>

      <div style={{ marginTop: "40px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
        <h3>3. Advanced Insights</h3>
        <p>Monitor your cognitive load and interaction trends.</p>
        <Link to="/monitoring">
          <button style={{ backgroundColor: "#4a5568" }}>View Monitoring Dashboard</button>
        </Link>
      </div>

    </div>
  );
}
