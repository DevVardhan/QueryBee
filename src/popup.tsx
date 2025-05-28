import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ClerkProvider,
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
  useSession,
  useClerk,
} from "@clerk/chrome-extension";
import "./popup.css";

const PUB_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
console.log("pub key", PUB_KEY);
const EXTENSION_URL = chrome.runtime.getURL(".");
console.log("extension url", EXTENSION_URL);

const PopupContent: React.FC = () => {
  const { session, isLoaded, isSignedIn } = useSession();
  const { session: activeSession } = useClerk();
  const [domain, setDomain] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePopup = async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const url = tab?.url;

        if (url) {
          const urlObj = new URL(url);
          setDomain(urlObj.hostname);

          chrome.runtime.sendMessage(
            { type: "GET_SESSION", url },
            (response) => {
              if (response?.sessionId) {
                setSessionId(response.sessionId);
              } else {
                setSessionId("Not found");
              }
              setIsLoading(false);
            }
          );
        }
      } catch (error) {
        console.error("Error initializing popup:", error);
        setDomain("Error loading domain");
        setSessionId("Error loading session");
        setIsLoading(false);
      }
    };

    initializePopup();
  }, []);

  if (!isLoaded || isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="popup-container">
      <h1>Metabase Extension</h1>

      <div className="info">
        <span className="label">Current Domain</span>
        <div>{domain || "No domain detected"}</div>
      </div>

      <div className="info">
        <span className="label">Session Status</span>
        <div>{sessionId || "No active session"}</div>
      </div>

      <SignedIn>
        <div className="user-info">
          <UserButton afterSignOutUrl={`${EXTENSION_URL}/popup.html`} />
        </div>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
    </div>
  );
};

const Popup: React.FC = () => {
  return (
    <ClerkProvider
      publishableKey={PUB_KEY}
      afterSignOutUrl={`${EXTENSION_URL}/popup.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}/popup.html`}
    >
      <PopupContent />
    </ClerkProvider>
  );
};

// Create root element and render
const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Popup />);
