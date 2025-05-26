console.log("popup.js started");
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url ;
  const domainElement = document.getElementById("domain");
  const sessionElement = document.getElementById("session");

  if (url && domainElement) {
    const domain = new URL(url).hostname;
    domainElement.textContent = `Domain: ${domain}`;
  }
  

  if (!sessionElement){
     console.log("no session ele");
    return; 
    } // stop if session element missing

  chrome.runtime.sendMessage({ type: "GET_SESSION", url}, (response) => {
    console.log("session request sent ");
    if (response?.sessionId) {
      sessionElement.textContent = `Session ID: ${response.sessionId}`;
    } else {
      sessionElement.textContent = "Session not found.";
    }
  });
});
  
