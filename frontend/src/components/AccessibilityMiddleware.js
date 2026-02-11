import React, { useContext, useEffect } from 'react';
import { AccessibilityContext } from '../context/AccessibilityContext';
import SmartAlert from './SmartAlert';

const AccessibilityMiddleware = () => {
    const { settings } = useContext(AccessibilityContext);

    useEffect(() => {
        if (!settings.narrator) return;

        const handleMouseOver = (e) => {
            const target = e.target;
            // Speak text content of specific elements
            if (['P', 'H1', 'H2', 'H3', 'BUTTON', 'A', 'LABEL', 'INPUT'].includes(target.tagName)) {
                if (target.innerText || target.alt || target.placeholder) {
                    cancelSpeech();
                    speak(target.innerText || target.alt || target.placeholder);
                }
            }
        };

        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            document.removeEventListener('mouseover', handleMouseOver);
            cancelSpeech();
        };
    }, [settings.narrator]);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    const cancelSpeech = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    return <SmartAlert />;
};

export default AccessibilityMiddleware;
