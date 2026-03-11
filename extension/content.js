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
            console.log("[AI Accessibility] Profile loaded successfully.");
        } else {
            console.warn("[AI Accessibility] EXTENSION INACTIVE: No profile found. You MUST login inside the STIRS extension popup (click the icon in your toolbar) to enable tracking on this site.");
            // Retry every 30 seconds until logged in
            setTimeout(applyPreferences, 30000);
        }
    });
}

function injectStyles(profile) {
    const { font_size, contrast, smart_highlighting, focus_mode } = profile;
    console.log(`[AI Accessibility] Applying Settings: Font=${font_size}, Highlighting=${smart_highlighting}, Focus=${focus_mode}, Contrast=${contrast}`);

    let styleTag = document.getElementById("ai-accessibility-styles");
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = "ai-accessibility-styles";
        document.head.appendChild(styleTag);
    }

    let css = "";

    // Comprehensive Font Scaling
    const sizeMap = {
        'small': '0.9rem',
        'medium': '1.1rem',
        'large': '1.4rem'
    };
    const targetSize = sizeMap[font_size] || '1.1rem';

    css += `html, body, p, div, span, li, a, h1, h2, h3, h4, h5, h6, button, input, label { 
        font-size: ${targetSize} !important; 
        line-height: 1.5 !important; 
    }\n`;

    // Contrast Logic
    if (contrast === "high") {
        css += "html { filter: contrast(1.3) brightness(1.05) !important; }\nbody { background-color: #ffffff !important; color: #000000 !important; }\n";
    } else if (contrast === "low") {
        css += "html { filter: contrast(0.8) brightness(1.1) !important; }\n";
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
let jitter = 0;
let lastPos = { x: 0, y: 0 };
let startTime = Date.now();

document.addEventListener('click', () => {
    clicks++;
});

document.addEventListener('mousemove', (e) => {
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 30) {
        jitter += 0.1;
        if (jitter % 1 < 0.2) console.log("[AI Accessibility] Jitter detected:", jitter.toFixed(1));
    }
    lastPos = { x: e.clientX, y: e.clientY };
});

// Keyboard debug trigger (Alt + Shift + S)
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.key === 'S') {
        console.log("[AI Accessibility] Manual debug trigger (Alt+Shift+S) detected!");
        showStressAlert("DEBUG ALERT: The Stress UI is working on this Page!");
    }
});

console.log("[AI Accessibility] Tracking active. Shake mouse or press Alt+Shift+S to test.");

// Report metrics every 10 seconds if logged in (Heartbeat added)
setInterval(() => {
    if (!currentProfile) {
        console.log("[AI Accessibility] Heartbeat: Waiting for profile/login...");
        return;
    }

    const duration = (Date.now() - startTime) / 1000;
    console.log(`[AI Accessibility] Heartbeat: Reporting Clicks=${clicks}, Jitter=${jitter.toFixed(1)}`);

    const metrics = {
        click_count: clicks,
        time_spent: duration,
        scroll_depth: getScrollPercent(),
        mouse_jitter: jitter,
        error_count: 0
    };

    chrome.runtime.sendMessage({ type: "REPORT_METRICS", data: metrics }, (res) => {
        console.log("[AI Accessibility] Backend Response:", res);
        if (res && res.cognitive_load_score > 0.4) {
            console.log("[AI Accessibility] !!! TRIGGERING STRESS ALERT !!! Score:", res.cognitive_load_score);
            showStressAlert("AI detected frustration. Would you like to simplify the page layout?");
        }
    });

    // Reset jitter after report
    jitter = 0;
}, 10000);


function getScrollPercent() {
    const h = document.documentElement,
        b = document.body,
        st = 'scrollTop',
        sh = 'scrollHeight';
    return (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100 || 0;
}
