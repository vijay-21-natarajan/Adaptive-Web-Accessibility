// Global Accessibility Content Script
console.log("[AI Accessibility] Extension loaded on " + window.location.host);

let currentProfile = null;

// Initial apply
applyPreferences();

async function applyPreferences() {
    chrome.runtime.sendMessage({ type: "GET_PROFILE" }, (response) => {
        if (response && response.accessibility_profile) {
            currentProfile = response.accessibility_profile;
            injectStyles(currentProfile);
        } else {
            console.log("[AI Accessibility] No profile found. Login in popup.");
        }
    });
}

function injectStyles(profile) {
    const { font_size, contrast, smart_highlighting, focus_mode } = profile;
    console.log(`[AI Accessibility] Applying Settings: Font=${font_size}, Highlighting=${smart_highlighting}, Focus=${focus_mode}`);

    let styleTag = document.getElementById("ai-accessibility-styles");
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "ai-accessibility-styles";
        document.head.appendChild(styleTag);
    }

    let css = "";

    // Original Accessibility Styles
    if (font_size === "large") {
        css += "html, body, p, div, span, li, a { font-size: 1.25rem !important; line-height: 1.6 !important; }\n";
    } else if (font_size === "small") {
        css += "html, body, p, div, span, li, a { font-size: 0.875rem !important; }\n";
    }

    if (contrast === "high") {
        css += "html { filter: contrast(1.2) brightness(1.05) !important; }\nbody { background-color: #ffffff !important; color: #000000 !important; }\n";
    }

    // Smart Highlighting Animation
    if (smart_highlighting) {
        css += `
            @keyframes ai-pulse {
                0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
                100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
            }
            .ai-smart-highlight {
                animation: ai-pulse 2s infinite;
                border-radius: 4px;
                background-color: rgba(40, 167, 69, 0.1) !important;
            }
        `;
    }

    // Focus Mode dimming
    if (focus_mode) {
        css += `
            aside, nav, .ads, .sidebar, [role="complementary"] {
                opacity: 0.3;
                transition: opacity 0.5s;
            }
            aside:hover, nav:hover { opacity: 1; }
        `;
    }

    styleTag.innerHTML = css;
}

function applySmartFeatures(liveLoad) {
    if (!currentProfile) return;

    // Smart Highlighting logic
    if (currentProfile.smart_highlighting) {
        const threshold = currentProfile.cognitive_load_threshold || 0.7;
        const links = document.querySelectorAll('a, button');

        if (liveLoad > threshold) {
            links.forEach(el => el.classList.add('ai-smart-highlight'));
        } else {
            links.forEach(el => el.classList.remove('ai-smart-highlight'));
        }
    }
}

// Cognitive Tracking Port
let clicks = 0;
let startTime = Date.now();

document.addEventListener('click', () => {
    clicks++;
});

// Report metrics every 10 seconds if logged in for real-time response
setInterval(() => {
    if (!currentProfile) return;

    const duration = (Date.now() - startTime) / 1000;

    // Simple load score calculation for extension (frontend version)
    const loadScore = Math.min((clicks * 0.05) + (duration * 0.001), 1.0);

    const metrics = {
        click_count: clicks,
        time_spent: duration,
        scroll_depth: getScrollPercent(),
        error_count: 0
    };

    chrome.runtime.sendMessage({ type: "REPORT_METRICS", data: metrics });

    // Activate Smart Highlighting if threshold met
    applySmartFeatures(loadScore);
}, 10000);

function getScrollPercent() {
    const h = document.documentElement,
        b = document.body,
        st = 'scrollTop',
        sh = 'scrollHeight';
    return (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100 || 0;
}
