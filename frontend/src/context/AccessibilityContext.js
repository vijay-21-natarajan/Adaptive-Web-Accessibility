import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { voiceService } from '../services/VoiceService';

export const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Default settings
    const [settings, setSettings] = useState({
        fontSize: 'medium', // small, medium, large
        contrast: 'medium', // low, medium, high
        narrator: false,    // true, false
        layoutDensity: 'standard', // standard, spacious, minimal
        voiceAssistantEnabled: false,
    });

    const [suggestion, setSuggestion] = useState(null); // { message, type, action }

    // Handle Voice Commands
    const handleCommand = (command) => {
        const text = command.toLowerCase();
        console.log("[Voice Assistant] Processing command:", text);

        if (text.includes("dashboard") || text.includes("monitoring")) {
            voiceService.speak("Opening monitoring dashboard");
            navigate("/monitoring");
        } else if (text.includes("settings") || text.includes("recommend") || text.includes("profile")) {
            voiceService.speak("Going to accessibility dashboard");
            navigate("/dashboard");
        } else if (text.includes("save")) {
            voiceService.speak("Ready to save. Please confirm manually.");
        } else if (text.includes("home") || text.includes("login")) {
            voiceService.speak("Going to login page");
            navigate("/");
        }
    };

    // Initialize Voice Assistant
    useEffect(() => {
        if (settings.voiceAssistantEnabled) {
            voiceService.startListening(handleCommand);
        } else {
            voiceService.stopListening();
        }
    }, [settings.voiceAssistantEnabled]);

    // Load settings from user profile when user logs in
    useEffect(() => {
        if (user && user.accessibility_profile) {
            setSettings({
                fontSize: user.accessibility_profile.font_size || 'medium',
                contrast: user.accessibility_profile.contrast || 'medium',
                narrator: user.accessibility_profile.voice_narration || false,
                layoutDensity: user.accessibility_profile.layout_preference || 'standard',
                voiceAssistantEnabled: user.accessibility_profile.voice_assistant_enabled || false,
            });
        }
    }, [user]);

    // Apply CSS Variables and Classes whenever settings change
    useEffect(() => {
        const root = document.documentElement;

        // Font Size Logic
        const fontSizes = {
            small: '14px',
            medium: '18px',
            large: '24px'
        };
        root.style.setProperty('--app-font-size', fontSizes[settings.fontSize] || '18px');

        // Contrast Logic
        const contrastFilters = {
            low: 'contrast(80%) brightness(110%)',
            medium: 'contrast(100%)',
            high: 'contrast(150%) brightness(90%)'
        };
        root.style.setProperty('--app-contrast-filter', contrastFilters[settings.contrast] || 'none');

        // Layout Density Logic (Module 4)
        const spacingGaps = {
            standard: '15px',
            spacious: '30px',
            minimal: '5px'
        };
        const spacingPadding = {
            standard: '10px 20px',
            spacious: '20px 40px',
            minimal: '5px 10px'
        };
        root.style.setProperty('--app-gap', spacingGaps[settings.layoutDensity] || '15px');
        root.style.setProperty('--app-padding', spacingPadding[settings.layoutDensity] || '10px 20px');

        // Apply contrast class to body
        document.body.className = `theme-${settings.contrast} density-${settings.layoutDensity}`;

    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <AccessibilityContext.Provider value={{ settings, updateSettings, suggestion, setSuggestion }}>
            {children}
        </AccessibilityContext.Provider>
    );
};
