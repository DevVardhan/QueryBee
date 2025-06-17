console.log("ServiceNode - Background script loaded");

// Helper function to format error messages
function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

// Listen for messages
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log('Received message:', msg);
  
  if (msg.type === "PAGE_RELOAD") {
    const domainUrl = msg.url;
    chrome.storage.local.get("metabaseSession", () => {
      chrome.cookies.get({
        url: domainUrl,
        name: "metabase.SESSION",
      }, (cookie) => {
        if (cookie?.value) {
          sendResponse({ sessionId: cookie.value });
          console.log("✅ Session ID:", cookie.value);
        } else {
          sendResponse({ sessionId: "null" });
          console.error("❌ Session cookie not found. User may not be logged in.");
        }
      });
    });
    return true;
  }
  else if (msg.type === "GET_SESSION") {
    const domainUrl = msg.url;
    console.log("get session request");
    chrome.storage.local.get("metabaseSession", (result) => {
      if (result.metabaseSession) {
        sendResponse({ sessionId: result.metabaseSession });
        console.log("✅ Session ID:", result.metabaseSession);
      } else {
        chrome.cookies.get({
          url: domainUrl,
          name: "metabase.SESSION"
        }, (cookie) => {
          if (cookie?.value) {
            sendResponse({ sessionId: cookie.value });
            console.log("✅ Session ID:", cookie.value);
          } else {
            sendResponse({ sessionId: "null" });
            console.error("❌ Session cookie not found. User may not be logged in.");
          }
        });
      }
    });
    return true;
  }
});

// Enable sidebar for all http and https URLs
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (!tab.url) return;

  if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
    console.log(`Enabling sidebar for tab ${tabId}: ${tab.url}`);
    chrome.sidePanel.setOptions({
      tabId,
      path: 'sidebar.html',
      enabled: true
    }).catch((error) => {
      console.error('Failed to enable sidebar:', formatError(error));
    });
  }
});

// Initialize extension on install/startup
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
});

// Handle extension icon click - open side panel manually
chrome.action.onClicked.addListener(async (tab) => {
  console.log('Extension icon clicked', tab);
  
  if (!tab.id || !tab.windowId) {
    console.error('Invalid tab data:', tab);
    return;
  }
  
  try {
    console.log(`Attempting to open sidebar for tab ${tab.id} in window ${tab.windowId}`);
    
    // Enable the side panel for this tab if not already enabled
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      path: 'sidebar.html',
      enabled: true
    });
    console.log('Sidebar enabled successfully');
    
    // Open the side panel
    await chrome.sidePanel.open({windowId: tab.windowId});
    console.log('✅ Side panel opened successfully');
    
  } catch (error) {
    console.error('❌ Failed to open side panel:', formatError(error));
    
    // Try alternative approach - set global sidebar
    try {
      console.log('Trying global sidebar approach...');
      await chrome.sidePanel.setOptions({
        path: 'sidebar.html',
        enabled: true
      });
      await chrome.sidePanel.open({windowId: tab.windowId});
      console.log('✅ Global sidebar opened successfully');
    } catch (fallbackError) {
      console.error('❌ Fallback approach also failed:', formatError(fallbackError));
    }
  }
});
