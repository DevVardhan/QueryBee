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

// Debug logging
const PUB_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const EXTENSION_URL = chrome.runtime.getURL(".");
console.log("=== DEBUG INFO ===");
console.log("Extension URL:", EXTENSION_URL);
console.log("Publishable Key:", PUB_KEY ? "Present" : "Missing");
console.log("Full Pub Key:", PUB_KEY);
console.log("==================");

const PopupContent: React.FC = () => {
  const { session, isLoaded, isSignedIn } = useSession();
  const [domain, setDomain] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const initializePopup = async () => {
      try {
        console.log("Initializing popup...");
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const url = tab?.url;

        if (url) {
          const urlObj = new URL(url);
          setDomain(urlObj.hostname);
          console.log("Current domain:", urlObj.hostname);

          chrome.runtime.sendMessage(
            { type: "GET_SESSION", url },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error("Runtime error:", chrome.runtime.lastError);
                setError(`Runtime error: ${chrome.runtime.lastError.message}`);
                setSessionId("Error communicating with background");
              } else if (response?.sessionId) {
                setSessionId(response.sessionId);
                console.log("Session ID:", response.sessionId);
              } else {
                setSessionId("Not found");
                console.log("No session found");
              }
              setIsLoading(false);
            }
          );
        } else {
          setDomain("No active tab");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing popup:", error);
        setError(`Initialization error: ${error}`);
        setDomain("Error loading domain");
        setSessionId("Error loading session");
        setIsLoading(false);
      }
    };

    if (isLoaded) {
      console.log("Clerk is loaded, initializing popup");
      initializePopup();
    } else {
      console.log("Waiting for Clerk to load...");
    }
  }, [isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="loading">
        <p>Loading...</p>
        {error && <p style={{ color: "red", fontSize: "12px" }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="popup-container">
      <h1>Metabase Extension</h1>

      {/* Debug info */}
      <div style={{ fontSize: "10px", color: "#666", marginBottom: "10px" }}>
        <div>Extension URK: {EXTENSION_URL}</div>
        <div>Clerk Key: {PUB_KEY ? "Present" : "Missing"}</div>
        <div>Is Signed In: {isSignedIn ? "Yes" : "No"}</div>
      </div>

      <div className="info">
        <span className="label">Current Domain:</span>
        <div>{domain || "No domain detected"}</div>
      </div>

      <div className="info">
        <span className="label">Session Status:</span>
        <div>{sessionId || "No active session"}</div>
      </div>

      {error && (
        <div style={{ color: "red", fontSize: "12px", margin: "10px 0" }}>
          Error: {error}
        </div>
      )}

      <SignedIn>
        <div className="user-info">
          <p>✅ Signed in successfully!</p>
          <UserButton
            afterSignOutUrl={`${EXTENSION_URL}/dist/popup.html`}
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </SignedIn>

      <SignedOut>
        <div className="sign-in-container">
          <p>Please sign in to continue</p>
          <button
            onClick={() => {
              console.log("Sign in button clicked");
              console.log(
                "Redirect URL will be:",
                `${EXTENSION_URL}/dist/popup.html`
              );
            }}
            style={{ marginBottom: "10px", padding: "5px 10px" }}
          >
            Debug Click
          </button>
          <br />
          <SignInButton mode="modal" />
        </div>
      </SignedOut>
    </div>
  );
};

const Popup: React.FC = () => {
  return (
    <ClerkProvider
      publishableKey={PUB_KEY}
      afterSignOutUrl={`${EXTENSION_URL}/dist/popup.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}/dist/popup.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}/dist/popup.html`}
    >
      <PopupContent />
    </ClerkProvider>
  );
};

// Initialize app
function initializeApp() {
  console.log("Initializing React app...");
  const container = document.createElement("div");
  container.id = "popup-root";
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<Popup />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}

export default Popup;
