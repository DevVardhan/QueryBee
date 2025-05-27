import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./popup.css";

const Popup: React.FC = () => {
  const [domain, setDomain] = useState<string>("(loading...)");
  const [sessionId, setSessionId] = useState<string>("(loading...)");

  useEffect(() => {
    const initializePopup = async () => {
      try {
        // Get current tab information
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const url = tab?.url;

        if (url) {
          const urlObj = new URL(url);
          setDomain(urlObj.hostname);

          // Get session information
          chrome.runtime.sendMessage(
            { type: "GET_SESSION", url },
            (response) => {
              if (response?.sessionId) {
                setSessionId(response.sessionId);
              } else {
                setSessionId("Session not found.");
              }
            }
          );
        }
      } catch (error) {
        console.error("Error initializing popup:", error);
        setDomain("Error loading domain");
        setSessionId("Error loading session");
      }
    };

    initializePopup();
  }, []);

  return (
    <div className="popup-container">
      <h1>Metabase Extension</h1>
      <div className="info">
        <span className="label">Domain:</span> {domain}
      </div>
      <div className="info">
        <span className="label">Session ID:</span> {sessionId}
      </div>
    </div>
  );
};

// Create root element and render
const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Popup />);
