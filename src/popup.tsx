import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useAuth, AuthProvider } from "./contexts/AuthContext";
import "./popup.css";

const PopupContent: React.FC = () => {
  const { currentUser, login, signup, logout } = useAuth();
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Function to format error messages
  const formatError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (error && typeof error === 'object') {
      if ('message' in error) {
        return String(error.message);
      }
      if ('error' in error) {
        return String(error.error);
      }
    }
    return 'An unknown error occurred';
  };

  // Direct method to open sidebar without background message
  const openSidebarDirectly = async () => {
    try {
      console.log('Attempting to open sidebar directly from popup');
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab');

      await chrome.sidePanel.setOptions({
        enabled: true,
        path: 'sidebar.html',
        tabId: tab.id,
      });

      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

      await chrome.sidePanel.open({ tabId: tab.id });

      console.log('Sidebar opened directly, closing popup');
      window.close();
    } catch (err) {
      const msg = formatError(err);
      console.error('Direct sidebar open failed:', msg);
      setError(`Failed to open sidebar: ${msg}`);
    }
  };

  // Function to open sidebar and close popup
  const openSidebarAndClosePopup = () => {
    console.log('Attempting to open sidebar...');
    
    // Send message to background script to open sidebar
    chrome.runtime.sendMessage({ type: "OPEN_SIDEBAR" }, (response) => {
      console.log('Received response from background:', response);

      if (chrome.runtime.lastError) {
        const errorMessage = formatError(chrome.runtime.lastError);
        console.error("Chrome runtime error:", errorMessage);
        // Fallback to direct open
        openSidebarDirectly();
        return;
      }

      if (!response) {
        const errorMessage = "No response received from background script";
        console.error(errorMessage);
        // Fallback to direct open
        openSidebarDirectly();
        return;
      }

      if (response.success) {
        console.log('Successfully opened sidebar, closing popup');
        window.close();
      } else {
        const errorMessage = formatError(response.error);
        console.error("Failed to open sidebar:", errorMessage);
        setError(`Failed to open sidebar: ${errorMessage}`);
      }
    });
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    console.log('Checking user state:', currentUser);
    if (currentUser) {
      console.log('User is logged in, attempting to open sidebar');
      openSidebarAndClosePopup();
    }
  }, [currentUser]);

  const handleError = (error: unknown) => {
    const errorMessage = formatError(error);
    console.error('Error:', errorMessage);
    setError(errorMessage);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    try {
      setError("");
      setIsLoading(true);
      await login(email, password);
      // Immediately attempt to open the sidebar after successful login
      openSidebarAndClosePopup();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      setError("");
      setIsLoading(true);
      await signup(email, password);
      // Immediately attempt to open the sidebar after successful signup
      openSidebarAndClosePopup();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setError("");
      await logout();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="popup-container">
      <h1>Login to QueryBee</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {currentUser ? (
        <div className="user-info">
          <p>✅ Signed in as: {currentUser.email}</p>
          <button onClick={handleLogout} className="auth-button">
            Sign Out
          </button>
        </div>
      ) : (
        <div className="auth-container">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
            </div>
            <div className="auth-buttons">
              <button type="submit" className="auth-button" disabled={isLoading}>
                Login
              </button>
              <button
                type="button"
                onClick={handleSignup}
                className="auth-button"
                disabled={isLoading}
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.hasChildNodes()) {
  const root = createRoot(rootElement);
  root.render(
    <AuthProvider>
      <PopupContent />
    </AuthProvider>
  );
}
