"use strict";
/**
 * FocusTube Extension Popup Script
 * Handles login UI, channel detection, and category selection
 */
(function () {
    const APP_URL = "https://focustube-phi.vercel.app";
    // DOM Elements
    const loadingView = document.getElementById("loading-view");
    const loginView = document.getElementById("login-view");
    const loggedInView = document.getElementById("logged-in-view");
    const loginForm = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginBtn = document.getElementById("login-btn");
    const loginError = document.getElementById("login-error");
    const logoutBtn = document.getElementById("logout-btn");
    const userEmailEl = document.getElementById("user-email");
    const openDashboardLink = document.getElementById("open-dashboard-link");
    const signupLink = document.getElementById("signup-link");
    // Channel section elements
    const channelSection = document.getElementById("channel-section");
    const noChannelSection = document.getElementById("no-channel-section");
    const channelNameEl = document.getElementById("channel-name");
    const channelUrlEl = document.getElementById("channel-url");
    const categoriesList = document.getElementById("categories-list");
    const addChannelBtn = document.getElementById("add-channel-btn");
    const addResult = document.getElementById("add-result");
    let currentChannel = null;
    let categories = [];
    let selectedCategoryIds = [];
    // View management
    function showView(view) {
        [loadingView, loginView, loggedInView].forEach((v) => {
            v.classList.add("hidden");
        });
        view.classList.remove("hidden");
    }
    // Check auth status
    async function checkAuthStatus() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "GET_AUTH_STATUS" }, (response) => {
                resolve(response || { authenticated: false });
            });
        });
    }
    // Get categories
    async function loadCategories() {
        categoriesList.innerHTML = '<div class="loading-categories">Loading categories...</div>';
        const result = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "GET_CATEGORIES" }, resolve);
        });
        categories = result.categories || [];
        renderCategories();
    }
    // Render category chips
    function renderCategories() {
        if (categories.length === 0) {
            categoriesList.innerHTML = '<div class="no-categories">No categories yet. Create them in your dashboard.</div>';
            return;
        }
        categoriesList.innerHTML = categories.map((cat) => `
    <div class="category-chip" data-id="${cat.id}">
      <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      ${escapeHtml(cat.name)}
    </div>
  `).join('');
        // Add click handlers
        categoriesList.querySelectorAll('.category-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                const id = chip.dataset.id;
                toggleCategory(id, chip);
            });
        });
    }
    function toggleCategory(id, chipEl) {
        if (selectedCategoryIds.includes(id)) {
            selectedCategoryIds = selectedCategoryIds.filter((cid) => cid !== id);
            chipEl.classList.remove('selected');
        }
        else {
            selectedCategoryIds.push(id);
            chipEl.classList.add('selected');
        }
    }
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    // Get current channel from the active tab
    async function getCurrentChannel() {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                const tab = tabs[0];
                if (!tab?.url || !tab.url.includes('youtube.com')) {
                    resolve(null);
                    return;
                }
                const url = tab.url;
                // Channel page patterns
                const handleMatch = url.match(/youtube\.com\/@([^/?]+)/);
                if (handleMatch) {
                    resolve({ url: `@${handleMatch[1]}`, name: handleMatch[1] });
                    return;
                }
                const channelIdMatch = url.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/);
                if (channelIdMatch) {
                    resolve({ url: url, name: `Channel ${channelIdMatch[1].slice(0, 8)}...` });
                    return;
                }
                const customUrlMatch = url.match(/youtube\.com\/c\/([^/?]+)/);
                if (customUrlMatch) {
                    resolve({ url: url, name: customUrlMatch[1] });
                    return;
                }
                const userMatch = url.match(/youtube\.com\/user\/([^/?]+)/);
                if (userMatch) {
                    resolve({ url: url, name: userMatch[1] });
                    return;
                }
                // Watch page - try to get channel from content script
                if (url.includes('youtube.com/watch')) {
                    try {
                        const results = await chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: () => {
                                const selectors = [
                                    'ytd-video-owner-renderer a.yt-simple-endpoint[href*="/@"]',
                                    '#owner a[href*="/@"]',
                                    'a.yt-simple-endpoint[href*="/@"]',
                                ];
                                for (const selector of selectors) {
                                    const el = document.querySelector(selector);
                                    if (el?.href) {
                                        const match = el.href.match(/@([^/?]+)/);
                                        if (match) {
                                            return { url: `@${match[1]}`, name: el.textContent?.trim() || match[1] };
                                        }
                                    }
                                }
                                return null;
                            },
                        });
                        if (results?.[0]?.result) {
                            resolve(results[0].result);
                            return;
                        }
                    }
                    catch (e) {
                        console.error('Failed to get channel from watch page:', e);
                    }
                }
                resolve(null);
            });
        });
    }
    // Show add result message
    function showAddResult(message, type) {
        addResult.textContent = message;
        addResult.className = `add-result ${type}`;
        if (type === 'success') {
            setTimeout(() => {
                addResult.classList.add('hidden');
            }, 3000);
        }
    }
    // Initialize popup
    async function init() {
        showView(loadingView);
        // Set up links
        openDashboardLink.href = `${APP_URL}/dashboard`;
        openDashboardLink.addEventListener("click", (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: `${APP_URL}/dashboard` });
        });
        signupLink.addEventListener("click", (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: `${APP_URL}/signup` });
        });
        // Check auth
        const authStatus = await checkAuthStatus();
        if (authStatus.authenticated && authStatus.user) {
            userEmailEl.textContent = authStatus.user.email;
            showView(loggedInView);
            // Check for current channel
            currentChannel = await getCurrentChannel();
            if (currentChannel) {
                channelNameEl.textContent = currentChannel.name || 'YouTube Channel';
                channelUrlEl.textContent = currentChannel.url;
                channelSection.classList.remove('hidden');
                noChannelSection.classList.add('hidden');
                // Load categories
                await loadCategories();
            }
            else {
                channelSection.classList.add('hidden');
                noChannelSection.classList.remove('hidden');
            }
        }
        else {
            showView(loginView);
        }
    }
    // Login form handler
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        if (!email || !password)
            return;
        loginBtn.classList.add("loading");
        loginBtn.disabled = true;
        loginError.classList.add("hidden");
        try {
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ type: "SIGN_IN", email, password }, resolve);
            });
            if (response.success && response.user) {
                userEmailEl.textContent = response.user.email;
                showView(loggedInView);
                // Check for current channel after login
                currentChannel = await getCurrentChannel();
                if (currentChannel) {
                    channelNameEl.textContent = currentChannel.name || 'YouTube Channel';
                    channelUrlEl.textContent = currentChannel.url;
                    channelSection.classList.remove('hidden');
                    noChannelSection.classList.add('hidden');
                    await loadCategories();
                }
                else {
                    channelSection.classList.add('hidden');
                    noChannelSection.classList.remove('hidden');
                }
            }
            else {
                loginError.textContent = response.error || "Sign in failed";
                loginError.classList.remove("hidden");
            }
        }
        catch (error) {
            loginError.textContent = "An unexpected error occurred";
            loginError.classList.remove("hidden");
        }
        finally {
            loginBtn.classList.remove("loading");
            loginBtn.disabled = false;
        }
    });
    // Add channel handler
    addChannelBtn.addEventListener("click", async () => {
        if (!currentChannel)
            return;
        addChannelBtn.classList.add("loading");
        addChannelBtn.disabled = true;
        addResult.classList.add("hidden");
        try {
            const result = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    type: "ADD_CHANNEL",
                    channelUrl: currentChannel.url,
                    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
                }, resolve);
            });
            if (result.success) {
                const channelName = result.channel?.title || currentChannel.name || "Channel";
                showAddResult(`Added ${channelName} to FocusTube!`, "success");
                addChannelBtn.disabled = true;
                // Update button text
                const btnText = addChannelBtn.querySelector('.btn-text');
                if (btnText) {
                    btnText.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Added!
        `;
                }
            }
            else {
                showAddResult(result.error || "Failed to add channel", "error");
                addChannelBtn.disabled = false;
            }
        }
        catch (error) {
            showAddResult("Failed to add channel", "error");
            addChannelBtn.disabled = false;
        }
        finally {
            addChannelBtn.classList.remove("loading");
        }
    });
    // Logout handler
    logoutBtn.addEventListener("click", async () => {
        await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "SIGN_OUT" }, () => resolve());
        });
        emailInput.value = "";
        passwordInput.value = "";
        loginError.classList.add("hidden");
        selectedCategoryIds = [];
        currentChannel = null;
        showView(loginView);
    });
    // Initialize on load
    document.addEventListener("DOMContentLoaded", init);
})();
