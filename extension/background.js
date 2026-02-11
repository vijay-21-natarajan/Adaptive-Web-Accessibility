// Background Service Worker
const API_BASE = "http://127.0.0.1:5000";

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_PROFILE") {
        fetchProfile(sendResponse);
        return true; // Keep channel open for async fetch
    }

    if (request.type === "REPORT_METRICS") {
        reportMetrics(request.data, sendResponse);
        return true;
    }
});

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
    if (!data.token) return;

    try {
        const response = await fetch(`${API_BASE}/cognitive/report`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${data.token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(metrics)
        });
        const result = await response.json();
        sendResponse(result);
    } catch (err) {
        console.error("Failed to report metrics", err);
    }
}
