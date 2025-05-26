console.log("ServiceNode")
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if(msg.type === "PAGE_RELOAD"){
    chrome.storage.local.get("metabaseSession", () => {
      chrome.cookies.get({
        url: "https://metabase.minusx.ai",
        name: "metabase.SESSION",
      }, (cookie) => {
        console.log(cookie);
        if(cookie?.value){
          sendResponse({ sessionId: cookie.value });
          console.log("✅ Session ID:", cookie.value);
        } else {
          sendResponse({ sessionId: "null" });
          console.error("❌ Session cookie not found. User may not be logged in.");
        }
      });
    });
  }
  else if (msg.type === "GET_SESSION") {
    const domainUrl = msg.url ; 
    console.log("get session request");
    chrome.storage.local.get("metabaseSession", (result) => {
      if (result.metabaseSession) {
        sendResponse({ sessionId: result.metabaseSession });
        console.log("✅ Session ID:", result.metabaseSession); // <-- fixed here
      } else {
        chrome.cookies.get({
          url: domainUrl,
          name: "metabase.SESSION"
        }, (cookie) => {
          if (cookie?.value) {
            // Optionally store cookie in local storage for next time
            // chrome.storage.local.set({ metabaseSession: cookie.value });
            sendResponse({ sessionId: cookie.value });
            console.log("✅ Session ID:", cookie.value);
          } else {
            sendResponse({ sessionId: "null" });
            console.error("❌ Session cookie not found. User may not be logged in.");
          }
        });
      }
    });

    return true; // keep message channel open for async response
  }
});
