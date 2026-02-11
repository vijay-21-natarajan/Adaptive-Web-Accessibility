const API_BASE = "http://127.0.0.1:5000";

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const profileView = document.getElementById('profile-view');
    const userDisplay = document.getElementById('user-display');
    const msg = document.getElementById('message');

    // Check if logged in
    const stored = await chrome.storage.local.get(["token", "username"]);
    if (stored.token) {
        showProfile(stored.username);
    }

    document.getElementById('login-btn').addEventListener('click', async () => {
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            });
            const data = await response.json();

            if (data.access_token) {
                await chrome.storage.local.set({
                    token: data.access_token,
                    username: u
                });
                showProfile(u);
                msg.textContent = "Logged in and synced!";

                // Refresh current tab to apply styles
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab) chrome.tabs.reload(tab.id);
            } else {
                msg.textContent = "Login failed: " + (data.error || "Invalid creds");
            }
        } catch (err) {
            msg.textContent = "Error: " + err.message;
        }
    });

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await chrome.storage.local.remove(["token", "username"]);
        loginForm.classList.remove('hidden');
        profileView.classList.add('hidden');
        msg.textContent = "Logged out.";
    });

    function showProfile(username) {
        loginForm.classList.add('hidden');
        profileView.classList.remove('hidden');
        userDisplay.textContent = username;
        loadSmartToggles();
    }

    async function loadSmartToggles() {
        const response = await new Promise(resolve => {
            chrome.runtime.sendMessage({ type: "GET_PROFILE" }, resolve);
        });

        if (response && response.accessibility_profile) {
            const prof = response.accessibility_profile;
            document.getElementById('smart-highlighting-toggle').checked = prof.smart_highlighting;
            document.getElementById('focus-mode-toggle').checked = prof.focus_mode;
        }
    }

    async function updateSmartFeature(feature, enabled) {
        const stored = await chrome.storage.local.get(["token"]);
        if (!stored.token) return;

        try {
            await fetch(`${API_BASE}/profile/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${stored.token}`
                },
                body: JSON.stringify({ [feature]: enabled })
            });
            // Refresh current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) chrome.tabs.reload(tab.id);
        } catch (err) {
            console.error("Failed to update smart feature", err);
        }
    }

    document.getElementById('smart-highlighting-toggle').addEventListener('change', (e) => {
        updateSmartFeature('smart_highlighting', e.target.checked);
    });

    document.getElementById('focus-mode-toggle').addEventListener('change', (e) => {
        updateSmartFeature('focus_mode', e.target.checked);
    });
});
