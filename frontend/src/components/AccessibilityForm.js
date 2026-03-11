import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { AccessibilityContext } from "../context/AccessibilityContext";
import "./Dashboard.css";

export default function AccessibilityForm() {
  const { user, token } = useContext(AuthContext);
  const { settings, updateSettings } = useContext(AccessibilityContext);

  const [formData, setFormData] = useState({
    age_group: "adult",
    vision_score: 0.8,
    device_type: "desktop",
    lighting_condition: "medium",
    preferred_mode: "light",
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev }));
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
        narrator: false
      };

      updateSettings(newPrefs);
      alert(`AI Recommendations Applied: ${newPrefs.fontSize}, ${newPrefs.contrast} `);

    } catch (err) {
      alert("Prediction failed.");
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const profileData = {
        font_size: settings.fontSize,
        contrast: settings.contrast,
        voice_narration: settings.narrator,
        layout_preference: settings.layoutDensity,
        voice_assistant_enabled: settings.voiceAssistantEnabled
      };
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
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="card">
          <h3>AI Recommendations</h3>
          <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Fill in your details to get personalized accessibility settings.
          </p>
          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label>Age Group</label>
              <select name="age_group" onChange={handleChange} required>
                <option value="">Select Age Group</option>
                <option value="child">Child</option>
                <option value="teen">Teen</option>
                <option value="adult">Adult</option>
                <option value="senior">Senior</option>
              </select>
            </div>

            <div className="form-group">
              <label>Vision Score (0.0 - 1.0)</label>
              <input type="number" name="vision_score" min="0" max="1" step="0.1" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Device Type</label>
              <select name="device_type" onChange={handleChange} required>
                <option value="">Select Device</option>
                <option value="mobile">Mobile</option>
                <option value="laptop">Laptop</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>

            <div className="form-group">
              <label>Lighting Condition</label>
              <select name="lighting_condition" onChange={handleChange} required>
                <option value="">Select Lighting</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="bright">Bright</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Mode</label>
              <select name="preferred_mode" onChange={handleChange} required>
                <option value="">Select Mode</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <button className="primary-button" type="submit">Get Recommendations</button>
          </form>
        </div>

        <div className="card">
          <h3>Current Settings</h3>
          <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Adjust your experience in real-time. Changes are applied instantly.
          </p>

          <div className="form-group">
            <label>Font Size</label>
            <select value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: e.target.value })}>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="form-group">
            <label>Contrast</label>
            <select value={settings.contrast} onChange={(e) => updateSettings({ contrast: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
{/*
          <div className="form-group">
            <label>Layout Density (AI Adaptive)</label>
            <select value={settings.layoutDensity} onChange={(e) => updateSettings({ layoutDensity: e.target.value })}>
              <option value="standard">Standard</option>
              <option value="spacious">Spacious (Anti-Misclick)</option>
              <option value="minimal">Minimal (High Focus)</option>
            </select>
          </div>
*/}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="narrator"
              style={{ width: 'auto' }}
              checked={settings.narrator}
              onChange={(e) => updateSettings({ narrator: e.target.checked })}
            />
            <label htmlFor="narrator" style={{ marginBottom: 0 }}>Enable Voice Narration</label>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="voiceAssistant"
              style={{ width: 'auto' }}
              checked={settings.voiceAssistantEnabled}
              onChange={(e) => updateSettings({ voiceAssistantEnabled: e.target.checked })}
            />
            <label htmlFor="voiceAssistant" style={{ marginBottom: 0 }}>Smart Voice Assistant</label>
          </div>

          <button className="primary-button" onClick={handleSave} style={{ marginTop: '1rem' }}>Save Profile Settings</button>
        </div>
      </div>
    </div>
  );
}
