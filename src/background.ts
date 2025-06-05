console.log("ServiceNode");

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

// Function to open sidebar
async function openSidebar() {
  try {
    console.log('Starting openSidebar function');
    
    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log('Current tab:', tab);
    
    if (!tab?.id) {
      throw new Error('No active tab found');
    }

    if (!tab.windowId) {
      throw new Error('No window ID found');
    }

    // First enable the sidebar
    console.log('Enabling sidebar for tab:', tab.id);
    await chrome.sidePanel.setOptions({
      enabled: true,
      path: 'sidebar.html',
      tabId: tab.id
    });

    // Set panel behavior
    console.log('Setting panel behavior');
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

    // Try to open the sidebar for the current tab
    console.log('Opening sidebar for tab:', tab.id);
    await chrome.sidePanel.open({ tabId: tab.id });

    console.log('Sidebar opened successfully');
    return { success: true, message: 'Sidebar opened successfully' };
  } catch (error) {
    const errorMessage = formatError(error);
    console.error('Error opening sidebar:', errorMessage);
    return { 
      success: false, 
      error: errorMessage
    };
  }
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
  else if (msg.type === "OPEN_SIDEBAR") {
    console.log('Processing OPEN_SIDEBAR message');
    openSidebar()
      .then(response => {
        console.log('openSidebar response:', response);
        sendResponse(response);
      })
      .catch(error => {
        const errorMessage = formatError(error);
        console.error('Error in openSidebar:', errorMessage);
        sendResponse({ 
          success: false, 
          error: errorMessage
        });
      });
    return true; // Keep the message channel open for async response
  }
});

// Enable sidebar for all http and https URLs
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (!tab.url) return;

  if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
    chrome.sidePanel.setOptions({
      tabId,
      path: 'sidebar.html',
      enabled: true
    });
  }
});
