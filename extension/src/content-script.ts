/**
 * FocusTube Extension Content Script
 * Runs on YouTube pages to detect channels and inject "Add to FocusTube" button
 */

(function() {
// Track the current channel info
interface ChannelInfo {
  url: string;
  handle?: string;
  channelId?: string;
  name?: string;
}

interface Category {
  id: string;
  name: string;
}

let currentChannel: ChannelInfo | null = null;
let buttonContainer: HTMLElement | null = null;
let isAdding = false;
let categories: Category[] = [];
let selectedCategoryIds: string[] = [];

// Detect channel info from the current page
function detectChannel(): ChannelInfo | null {
  const url = window.location.href;
  
  // Channel page patterns
  const channelPatterns = [
    { pattern: /youtube\.com\/@([^/?]+)/, type: "handle" },
    { pattern: /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/, type: "id" },
    { pattern: /youtube\.com\/c\/([^/?]+)/, type: "customUrl" },
    { pattern: /youtube\.com\/user\/([^/?]+)/, type: "username" },
  ];

  for (const { pattern, type } of channelPatterns) {
    const match = url.match(pattern);
    if (match) {
      const value = match[1];
      return {
        url: type === "handle" ? `@${value}` : url,
        handle: type === "handle" ? value : undefined,
        channelId: type === "id" ? value : undefined,
        name: value,
      };
    }
  }

  // Watch page - try to extract channel info from the page
  if (url.includes("youtube.com/watch")) {
    return detectChannelFromWatchPage();
  }

  return null;
}

// Extract channel info from a video watch page
function detectChannelFromWatchPage(): ChannelInfo | null {
  const selectors = [
    'ytd-video-owner-renderer a.yt-simple-endpoint[href*="/@"]',
    'ytd-video-owner-renderer a.yt-simple-endpoint[href*="/channel/"]',
    '#owner a[href*="/@"]',
    '#owner a[href*="/channel/"]',
    'a.yt-simple-endpoint[href*="/@"]',
    'a[href*="/channel/UC"]',
  ];

  for (const selector of selectors) {
    const element = document.querySelector<HTMLAnchorElement>(selector);
    if (element?.href) {
      const href = element.href;
      
      const handleMatch = href.match(/@([^/?]+)/);
      if (handleMatch) {
        return {
          url: `@${handleMatch[1]}`,
          handle: handleMatch[1],
          name: element.textContent?.trim(),
        };
      }
      
      const channelIdMatch = href.match(/\/channel\/(UC[a-zA-Z0-9_-]+)/);
      if (channelIdMatch) {
        return {
          url: href,
          channelId: channelIdMatch[1],
          name: element.textContent?.trim(),
        };
      }
    }
  }

  return null;
}

// Create the "Add to FocusTube" button with category dropdown
function createButton(): HTMLElement {
  const container = document.createElement("div");
  container.id = "focustube-add-button";
  container.innerHTML = `
    <div class="focustube-wrapper">
      <button class="focustube-btn" id="focustube-add-btn">
        <svg class="focustube-icon" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        <span class="focustube-text">Add to FocusTube</span>
        <span class="focustube-loading">
          <svg class="focustube-spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round"/>
          </svg>
        </span>
      </button>
      <button class="focustube-dropdown-btn" id="focustube-dropdown-btn" title="Select categories">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    <div class="focustube-dropdown hidden" id="focustube-dropdown">
      <div class="focustube-dropdown-header">Add to categories</div>
      <div class="focustube-categories" id="focustube-categories">
        <div class="focustube-loading-cats">Loading...</div>
      </div>
    </div>
    <div class="focustube-toast" id="focustube-toast"></div>
  `;
  
  return container;
}

// Load categories
async function loadCategories(): Promise<void> {
  const result = await new Promise<{ categories: Category[]; error?: string }>((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_CATEGORIES" }, resolve);
  });

  categories = result.categories || [];
  renderCategories();
}

// Render categories in dropdown
function renderCategories() {
  const container = document.getElementById("focustube-categories");
  if (!container) return;

  if (categories.length === 0) {
    container.innerHTML = '<div class="focustube-no-cats">No categories yet</div>';
    return;
  }

  container.innerHTML = categories.map((cat) => `
    <label class="focustube-cat-item">
      <input type="checkbox" value="${cat.id}" class="focustube-cat-checkbox">
      <span class="focustube-cat-name">${escapeHtml(cat.name)}</span>
    </label>
  `).join('');

  // Add change handlers
  container.querySelectorAll('.focustube-cat-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const input = e.target as HTMLInputElement;
      const id = input.value;
      if (input.checked) {
        if (!selectedCategoryIds.includes(id)) {
          selectedCategoryIds.push(id);
        }
      } else {
        selectedCategoryIds = selectedCategoryIds.filter((cid) => cid !== id);
      }
    });
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show toast message
function showToast(message: string, type: "success" | "error" | "info") {
  const toast = document.getElementById("focustube-toast");
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `focustube-toast focustube-toast-${type} focustube-toast-visible`;
  
  setTimeout(() => {
    toast.classList.remove("focustube-toast-visible");
  }, 3000);
}

// Handle button click
async function handleAddChannel() {
  if (isAdding || !currentChannel) return;
  
  const btn = document.getElementById("focustube-add-btn");
  if (!btn) return;

  // Check auth status first
  const authStatus = await new Promise<{ authenticated: boolean }>((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_AUTH_STATUS" }, resolve);
  });

  if (!authStatus?.authenticated) {
    showToast("Please sign in via the extension popup", "info");
    return;
  }

  isAdding = true;
  btn.classList.add("focustube-btn-loading");

  try {
    const result = await new Promise<{ success: boolean; error?: string; channel?: { title: string } }>((resolve) => {
      chrome.runtime.sendMessage({
        type: "ADD_CHANNEL",
        channelUrl: currentChannel!.url,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      }, resolve);
    });

    if (result.success) {
      const channelName = result.channel?.title || currentChannel!.name || "Channel";
      showToast(`Added ${channelName} to FocusTube!`, "success");
      btn.classList.add("focustube-btn-success");
      
      // Update button text
      const textSpan = btn.querySelector(".focustube-text");
      if (textSpan) textSpan.textContent = "Added!";
    } else {
      showToast(result.error || "Failed to add channel", "error");
    }
  } catch (error) {
    console.error("FocusTube: Error adding channel:", error);
    showToast("Failed to add channel", "error");
  } finally {
    isAdding = false;
    btn.classList.remove("focustube-btn-loading");
  }
}

// Toggle dropdown
function toggleDropdown() {
  const dropdown = document.getElementById("focustube-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
    
    // Load categories if opening
    if (!dropdown.classList.contains("hidden") && categories.length === 0) {
      loadCategories();
    }
  }
}

// Inject button into the page
function injectButton() {
  // Remove existing button if any
  const existing = document.getElementById("focustube-add-button");
  if (existing) {
    existing.remove();
  }

  // Reset state
  selectedCategoryIds = [];
  categories = [];

  currentChannel = detectChannel();
  if (!currentChannel) {
    return;
  }

  buttonContainer = createButton();
  
  // Find the best place to inject the button
  let targetContainer: Element | null = null;
  
  // On channel pages
  if (window.location.pathname.startsWith("/@") || 
      window.location.pathname.includes("/channel/") ||
      window.location.pathname.includes("/c/") ||
      window.location.pathname.includes("/user/")) {
    targetContainer = document.querySelector("#subscribe-button") ||
                     document.querySelector("ytd-subscribe-button-renderer") ||
                     document.querySelector("#channel-header-container");
  }
  
  // On watch pages
  if (window.location.pathname.includes("/watch")) {
    targetContainer = document.querySelector("#owner") ||
                     document.querySelector("ytd-video-owner-renderer") ||
                     document.querySelector("#above-the-fold");
  }

  // Fallback: attach to body with fixed positioning
  if (targetContainer) {
    buttonContainer.classList.add("focustube-inline");
    targetContainer.appendChild(buttonContainer);
  } else {
    buttonContainer.classList.add("focustube-fixed");
    document.body.appendChild(buttonContainer);
  }

  // Add click handlers
  const btn = document.getElementById("focustube-add-btn");
  btn?.addEventListener("click", handleAddChannel);

  const dropdownBtn = document.getElementById("focustube-dropdown-btn");
  dropdownBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("focustube-dropdown");
    const dropdownBtn = document.getElementById("focustube-dropdown-btn");
    if (dropdown && !dropdown.contains(e.target as Node) && e.target !== dropdownBtn) {
      dropdown.classList.add("hidden");
    }
  });

  // Preload categories
  loadCategories();
}

// Observe for page changes (YouTube is a SPA)
function observePageChanges() {
  let lastUrl = location.href;
  
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(injectButton, 1000);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  window.addEventListener("yt-navigate-finish", () => {
    setTimeout(injectButton, 500);
  });
}

// Initialize
function init() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(injectButton, 1000);
      observePageChanges();
    });
  } else {
    setTimeout(injectButton, 1000);
    observePageChanges();
  }
}

init();
})();
