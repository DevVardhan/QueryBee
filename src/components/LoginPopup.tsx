import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginPopup: React.FC<LoginPopupProps> = ({ isOpen, onClose }) => {
  const { login, signup, currentUser } = useAuth();
  const [error, setError] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Close popup when user successfully logs in
  useEffect(() => {
    if (currentUser) {
      onClose();
    }
  }, [currentUser, onClose]);

  if (!isOpen) return null;

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
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>Login to QueryBee</h2>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          {error && <div className="error-message">{error}</div>}
          <form>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                disabled={isLoading}
              />
            </div>
            <div className="auth-buttons">
              <button onClick={handleLogin} className="auth-button" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <button onClick={handleSignup} className="auth-button" disabled={isLoading}>
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 