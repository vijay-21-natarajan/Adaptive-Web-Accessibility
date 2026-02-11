import React, { useContext } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';

const SmartAlert = () => {
    const { suggestion, setSuggestion, updateSettings } = useContext(AccessibilityContext);

    if (!suggestion) return null;

    const handleAccept = () => {
        if (suggestion.type === 'layout') {
            updateSettings({ layoutDensity: suggestion.action });
        }
        setSuggestion(null);
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#2d3748',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            maxWidth: '300px',
            border: '2px solid #e53e3e',
            animation: 'slideIn 0.5s ease-out'
        }}>
            <style>
                {`
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}
            </style>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#feb2b2' }}>
                ⚠️ AI Stress Alert
            </div>
            <p style={{ margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.4' }}>
                {suggestion.message}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleAccept}
                    style={{
                        flex: 1,
                        background: '#38a169',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Yes, Simplify
                </button>
                <button
                    onClick={() => setSuggestion(null)}
                    style={{
                        flex: 1,
                        background: '#718096',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}
                >
                    Ignore
                </button>
            </div>
        </div>
    );
};

export default SmartAlert;
