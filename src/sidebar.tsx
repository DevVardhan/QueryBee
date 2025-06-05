import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import './sidebar.css';
import './styles/auth.css';

interface AnalysisResult {
  tables: string[];
  query: string;
  loading: boolean;
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  result?: AnalysisResult;
}

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

const HelpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
  </svg>
);

const SidebarContent = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentUser, logout } = useAuth();

  const handleQuestionSubmit = async () => {
    if (!question.trim() || loading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setQuestion('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const result: AnalysisResult = {
        tables: ['Products'],
        query: 'SELECT * FROM Products ORDER BY price DESC LIMIT 1',
        loading: false
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, result }
            : msg
        )
      );
      setLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuestionSubmit();
    }
  };

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = mainContentRef.current.scrollHeight;
    }
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="sidebar-container">
      <div className="header">
        <button className="header-icon" title="Help">
          <HelpIcon />
        </button>
        <button className="header-icon" title="Settings" onClick={handleLogout}>
          <SettingsIcon />
        </button>
      </div>

      <div className="main-content" ref={mainContentRef}>
        <div className="conversation">
          {messages.map((message) => (
            <div key={message.id} className="message">
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
              <div>{message.text}</div>
              {message.result && (
                <div className="analysis-section">
                  <div className="analyzed-tables">
                    <h3>Analyzed tables</h3>
                    <div className="tables-list">
                      {message.result.tables.map((table, index) => (
                        <div key={index} className="table-item">
                          {table}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="query-section">
                    <h3>Updated SQL Query</h3>
                    <div className="query-display">
                      <div className="language-indicator">
                        <span>English</span>
                        <span>SQL</span>
                      </div>
                      <pre className="sql-query">{message.result.query}</pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && <div className="loading">Analyzing...</div>}
        </div>
      </div>

      <div className="input-section">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyPress}
            placeholder="What would you like to know?"
            className="question-input"
            rows={1}
          />
          <button 
            className="send-button" 
            onClick={handleQuestionSubmit}
            disabled={!question.trim() || loading}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const { currentUser } = useAuth();

  return currentUser ? (
    <SidebarContent />
  ) : (
    <Login onSuccess={() => {}} />
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
); 