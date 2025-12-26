"use strict";
/**
 * FocusTube Extension Options Page Script
 * Handles configuration of app URL and Supabase credentials
 */
(function () {
    // DOM Elements
    const optionsForm = document.getElementById("options-form");
    const appUrlInput = document.getElementById("app-url");
    const supabaseUrlInput = document.getElementById("supabase-url");
    const supabaseAnonKeyInput = document.getElementById("supabase-anon-key");
    const saveBtn = document.getElementById("save-btn");
    const saveStatus = document.getElementById("save-status");
    // Load saved settings
    async function loadSettings() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "GET_CONFIG" }, (response) => {
                if (response) {
                    appUrlInput.value = response.appUrl || "http://localhost:3000";
                    supabaseUrlInput.value = response.supabaseUrl || "";
                    supabaseAnonKeyInput.value = response.supabaseAnonKey || "";
                }
                resolve();
            });
        });
    }
    // Show save status
    function showStatus(message, type) {
        saveStatus.textContent = message;
        saveStatus.className = `save-status ${type}`;
        // Hide after 3 seconds
        setTimeout(() => {
            saveStatus.classList.add("hidden");
        }, 3000);
    }
    // Save settings
    optionsForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const appUrl = appUrlInput.value.trim().replace(/\/$/, ""); // Remove trailing slash
        const supabaseUrl = supabaseUrlInput.value.trim().replace(/\/$/, "");
        const supabaseAnonKey = supabaseAnonKeyInput.value.trim();
        // Validate
        if (!supabaseUrl) {
            showStatus("Supabase URL is required", "error");
            supabaseUrlInput.focus();
            return;
        }
        if (!supabaseAnonKey) {
            showStatus("Supabase Anon Key is required", "error");
            supabaseAnonKeyInput.focus();
            return;
        }
        // Validate URL format
        try {
            new URL(supabaseUrl);
        }
        catch {
            showStatus("Invalid Supabase URL format", "error");
            supabaseUrlInput.focus();
            return;
        }
        // Show loading
        saveBtn.classList.add("loading");
        saveBtn.disabled = true;
        try {
            await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    type: "SAVE_CONFIG",
                    appUrl,
                    supabaseUrl,
                    supabaseAnonKey,
                }, (response) => {
                    if (response?.success) {
                        resolve();
                    }
                    else {
                        reject(new Error(response?.error || "Failed to save"));
                    }
                });
            });
            showStatus("Settings saved successfully!", "success");
        }
        catch (error) {
            showStatus(error instanceof Error ? error.message : "Failed to save settings", "error");
        }
        finally {
            saveBtn.classList.remove("loading");
            saveBtn.disabled = false;
        }
    });
    // Initialize
    document.addEventListener("DOMContentLoaded", loadSettings);
})();
