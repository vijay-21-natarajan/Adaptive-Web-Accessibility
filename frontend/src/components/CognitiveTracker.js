import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AccessibilityContext } from '../context/AccessibilityContext';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000'
});

const CognitiveTracker = ({ children }) => {
    const { token } = useContext(AuthContext);
    const { settings, setSuggestion } = useContext(AccessibilityContext);
    const [metrics, setMetrics] = useState({
        click_count: 0,
        time_spent: 0,
        scroll_depth: 0,
        error_count: 0
    });
    const [jitter, setJitter] = useState(0);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const [startTime] = useState(Date.now());

    // Track clicks
    useEffect(() => {
        const handleClick = () => {
            setMetrics(prev => ({ ...prev, click_count: prev.click_count + 1 }));
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Track mouse jitter (Frustration Signature)
    useEffect(() => {
        const handleMouseMove = (e) => {
            const dx = e.clientX - lastPos.x;
            const dy = e.clientY - lastPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // If movement is very fast and erratic
            if (dist > 50) {
                setJitter(prev => prev + 0.1);
            }
            setLastPos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [lastPos]);

    // Track scroll
    useEffect(() => {
        const handleScroll = () => {
            const h = document.documentElement,
                b = document.body,
                st = 'scrollTop',
                sh = 'scrollHeight';
            const percent = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;
            setMetrics(prev => ({ ...prev, scroll_depth: Math.max(prev.scroll_depth, percent) }));
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Report metrics periodically
    const reportMetrics = useCallback(async () => {
        if (!token) return;

        const timeNow = Date.now();
        const duration = (timeNow - startTime) / 1000; // in seconds

        try {
            const res = await api.post('/cognitive/report', {
                ...metrics,
                time_spent: duration,
                mouse_jitter: jitter
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Proactive Smart Suggestion (Module 6)
            if (res.data.cognitive_load_score > 0.7 && settings.layoutDensity !== 'minimal') {
                setSuggestion({
                    message: "High frustration detected. Would you like to simplify the dashboard layout?",
                    action: "minimal",
                    type: "layout"
                });
            }

            // Reset jitter after report
            setJitter(0);
        } catch (err) {
            console.error("Failed to report cognitive metrics", err);
        }
    }, [metrics, jitter, token, startTime, settings.layoutDensity, setSuggestion]);

    useEffect(() => {
        const interval = setInterval(reportMetrics, 20000); // Improved feedback cycle: 20s
        return () => clearInterval(interval);
    }, [reportMetrics]);

    return children;
};

export default CognitiveTracker;
