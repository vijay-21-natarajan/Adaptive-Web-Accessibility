// Background Service Worker
const API_BASE = "http://127.0.0.1:5000";

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PROFILE") {
        fetchProfile(sendResponse);
        return true; // Keep channel open for async fetch
    }

    if (request.type === "REPORT_METRICS") {
        reportMetrics(request.data, (res) => {
            if (res && res.cognitive_load_score > 0.4) {
                showStressNotification();
            }
            sendResponse(res);
        });
        return true;
    }
});

function showStressNotification() {
    chrome.notifications.create("stress-alert", {
        type: "basic",
        iconUrl: "icon.png",
        title: "AI Stress Alert",
        message: "High frustration detected. Would you like to simplify the page layout?",
        buttons: [{ title: "Yes, Simplify" }, { title: "Ignore" }],
        priority: 2
    });
}

chrome.notifications.onButtonClicked.addListener((notifId, btnIdx) => {
    if (notifId === "stress-alert" && btnIdx === 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "SIMPLIFY_PAGE" });
            }
        });
    }
});

// Periodic profile sync (every 60 seconds)
setInterval(async () => {
    const data = await chrome.storage.local.get(["token"]);
    if (data.token) {
        console.log("[AI Accessibility] Syncing profile in background...");
        fetchProfile((res) => {
            if (res && res.accessibility_profile) {
                // Background update, content scripts will pick it up on next trigger or tab reload
                chrome.storage.local.set({ last_sync: Date.now() });
            }
        });
    }
}, 60000);

async function fetchProfile(sendResponse) {
    const data = await chrome.storage.local.get(["token"]);
    if (!data.token) {
        sendResponse({ error: "No token found. Please login via popup." });
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/profile`, {
            headers: { "Authorization": `Bearer ${data.token}` }
        });
        const profile = await response.json();
        sendResponse(profile);
    } catch (err) {
        sendResponse({ error: "Failed to fetch profile: " + err.message });
    }
}

async function reportMetrics(metrics, sendResponse) {
    const data = await chrome.storage.local.get(["token"]);
    if (!data.token) {
        console.warn("[AI Accessibility] Metrics report failed: User not logged in to extension.");
        sendResponse({ error: "No token" });
        return;
    }

    try {
        console.log("[AI Accessibility] Reporting metrics to backend:", metrics);
        const response = await fetch(`${API_BASE}/cognitive/report`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${data.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(metrics)
        });
        const result = await response.json();
        console.log("[AI Accessibility] Backend result:", result);
        sendResponse(result);
    } catch (err) {
        console.error("[AI Accessibility] Fetch Error:", err);
        sendResponse({ error: err.message });
    }
}
