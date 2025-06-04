//  Get current page URL and notify background script
const url = window.location.href;
chrome.runtime.sendMessage({ type: "PAGE_RELOAD", url });

// Detect cookie consent button and notify background script when clicked
const waitForUserConsent = () => {
  return new Promise<void>((resolve) => {
    const acceptButton = document.querySelector("button.accept-cookies");
    if (acceptButton) {
      // If the button is already present
      acceptButton.addEventListener("click", () => {
        resolve();
      });
      return; // No need to observe
    }

    // Otherwise, observe DOM mutations
    const observer = new MutationObserver(() => {
      const dynamicButton = document.querySelector("button.accept-cookies");
      if (dynamicButton) {
        dynamicButton.addEventListener("click", () => {
          resolve();
        });
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// Start waiting for consent
waitForUserConsent().then(() => {
  console.log("✅ Cookie consent accepted");
  chrome.runtime.sendMessage({ type: "COOKIE_ACCEPTED" });
});

// Listen for messages from the sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_PAGE') {
    // Here we can add logic to analyze the current page's database tables
    // For now, we'll just send a mock response
    sendResponse({
      success: true,
      tables: ['Products', 'Orders', 'Customers']
    });
  }
  return true;
});
