/**
 * FocusTube Chrome Extension - Background Service Worker
 * Handles authentication, API calls, and message passing
 */

// ============================================
// CONFIGURATION - Hardcoded for production
// ============================================
const CONFIG = {
  APP_URL: "https://focustube-phi.vercel.app",
  SUPABASE_URL: "https://ztpnqpxaqdiomymhrkhs.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp0cG5xcHhhcWRpb215bWhya2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MjY1MDcsImV4cCI6MjA4MjIwMjUwN30.RvummMlfesf4YUxxTeTrHEVdpSIvxyXb7uf03PYe1VU",
};

interface StorageData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: {
    id: string;
    email: string;
  };
}

interface AuthResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
  };
}

interface AddChannelResult {
  success: boolean;
  error?: string;
  channel?: {
    channelId: string;
    title: string;
    thumbnailUrl: string;
  };
}

interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

// Get stored auth data
async function getStoredAuth(): Promise<StorageData> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["accessToken", "refreshToken", "expiresAt", "user"],
      (result) => {
        resolve(result as StorageData);
      }
    );
  });
}

// Save authentication tokens
async function saveAuth(data: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: { id: string; email: string };
}): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
}

// Clear authentication
async function clearAuth(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(["accessToken", "refreshToken", "expiresAt", "user"], resolve);
  });
}

// Check if token is expired (with 5 minute buffer)
function isTokenExpired(expiresAt?: number): boolean {
  if (!expiresAt) return true;
  return Date.now() >= (expiresAt - 5 * 60 * 1000);
}

// Refresh the access token
async function refreshAccessToken(): Promise<AuthResult> {
  const stored = await getStoredAuth();
  
  if (!stored.refreshToken) {
    return { success: false, error: "No refresh token available" };
  }

  try {
    const response = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": CONFIG.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        refresh_token: stored.refreshToken,
      }),
    });

    if (!response.ok) {
      await clearAuth();
      return { success: false, error: "Session expired. Please sign in again." };
    }

    const data = await response.json();
    
    await saveAuth({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });

    return { success: true, user: { id: data.user.id, email: data.user.email } };
  } catch (error) {
    console.error("Token refresh error:", error);
    return { success: false, error: "Failed to refresh session" };
  }
}

// Get a valid access token (refresh if needed)
async function getValidAccessToken(): Promise<string | null> {
  const stored = await getStoredAuth();
  
  if (!stored.accessToken) {
    return null;
  }

  if (isTokenExpired(stored.expiresAt)) {
    const result = await refreshAccessToken();
    if (!result.success) {
      return null;
    }
    const newStored = await getStoredAuth();
    return newStored.accessToken || null;
  }

  return stored.accessToken;
}

// Sign in with email/password
async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": CONFIG.SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error_description || error.message || "Invalid credentials" };
    }

    const data = await response.json();
    
    await saveAuth({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });

    return { success: true, user: { id: data.user.id, email: data.user.email } };
  } catch (error) {
    console.error("Sign in error:", error);
    return { success: false, error: "Failed to connect to authentication service" };
  }
}

// Sign out
async function signOut(): Promise<void> {
  await clearAuth();
}

// Get current auth status
async function getAuthStatus(): Promise<{ authenticated: boolean; user?: { id: string; email: string } }> {
  const stored = await getStoredAuth();
  
  if (!stored.accessToken) {
    return { authenticated: false };
  }

  // Try to refresh if expired
  if (isTokenExpired(stored.expiresAt)) {
    const result = await refreshAccessToken();
    if (!result.success) {
      return { authenticated: false };
    }
    return { authenticated: true, user: result.user };
  }

  return { authenticated: true, user: stored.user };
}

// Get user's categories
async function getCategories(): Promise<{ categories: Category[]; error?: string }> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { categories: [], error: "Not authenticated" };
  }

  try {
    const response = await fetch(`${CONFIG.APP_URL}/api/extension/categories`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok || data.error) {
      return { categories: [], error: data.error || "Failed to fetch categories" };
    }

    return { categories: data.categories || [] };
  } catch (error) {
    console.error("Get categories error:", error);
    return { categories: [], error: "Failed to connect to FocusTube" };
  }
}

// Add a channel to FocusTube
async function addChannel(channelUrl: string, categoryIds?: string[]): Promise<AddChannelResult> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { success: false, error: "Not authenticated. Please sign in." };
  }

  try {
    const response = await fetch(`${CONFIG.APP_URL}/api/extension/add-channel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        input: channelUrl,
        categoryIds,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || data.error) {
      return { success: false, error: data.error || "Failed to add channel" };
    }

    return { success: true, channel: data.channel };
  } catch (error) {
    console.error("Add channel error:", error);
    return { success: false, error: "Failed to connect to FocusTube" };
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handleMessage = async () => {
    switch (message.type) {
      case "SIGN_IN": {
        const result = await signIn(message.email, message.password);
        return result;
      }
      case "SIGN_OUT": {
        await signOut();
        return { success: true };
      }
      case "GET_AUTH_STATUS": {
        const status = await getAuthStatus();
        return status;
      }
      case "GET_CATEGORIES": {
        const result = await getCategories();
        return result;
      }
      case "ADD_CHANNEL": {
        const result = await addChannel(message.channelUrl, message.categoryIds);
        return result;
      }
      case "GET_CONFIG": {
        return {
          appUrl: CONFIG.APP_URL,
        };
      }
      default:
        return { error: "Unknown message type" };
    }
  };

  handleMessage().then(sendResponse);
  return true; // Keep the message channel open for async response
});

// Export for TypeScript module
export {};
