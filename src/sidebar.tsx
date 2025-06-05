import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import './sidebar.css';
import './styles/auth.css';
import { Card } from './components/Card';

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

const TableIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M3 3h18v2H3V3zm0 4h18v14H3V7zm2 2v2h14V9H5zm0 4v6h14v-6H5z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 3C7.03 3 3 4.79 3 7v10c0 2.21 4.03 4 9 4s9-1.79 9-4V7c0-2.21-4.03-4-9-4zm0 2c4.42 0 7 1.36 7 2s-2.58 2-7 2-7-1.36-7-2 2.58-2 7-2zm0 14c-4.42 0-7-1.36-7-2v-2.11c1.66.96 4.28 1.45 7 1.45s5.34-.49 7-1.45V17c0 .64-2.58 2-7 2zm0-4c-4.42 0-7-1.36-7-2v-2.11c1.66.96 4.28 1.45 7 1.45s5.34-.49 7-1.45V13c0 .64-2.58 2-7 2z" />
  </svg>
);

const UpdatedSqlCard = ({ query }: { query: string }) => {
  const [tab, setTab] = useState<'english' | 'sql'>('english');
  return (
    <Card icon={<DatabaseIcon />} title="Updated SQL Query" cost="€0 3.5s">
      <div className="tab-strip">
        <div className={`tab ${tab === 'english' ? 'active' : ''}`} onClick={() => setTab('english')}>English</div>
        <div className={`tab ${tab === 'sql' ? 'active' : ''}`} onClick={() => setTab('sql')}>SQL</div>
      </div>
      {tab === 'english' ? (
        <div style={{background:'#f8f9ff',padding:'12px',borderRadius:'8px',fontSize:'14px',color:'#333'}}>
          I am fetching the product names from the product table and ordering them by price to get the most expensive item.
        </div>
      ) : (
        <pre className="sql-query" style={{marginTop:'8px'}}>{query}</pre>
      )}
    </Card>
  );
};

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
              <div className="user-bubble">{message.text}</div>
              {message.result && (
                <>
                  {/* Analyzed tables card */}
                  <Card icon={<TableIcon />} title="Analysed tables" cost="€0 3.5s">
                    <div className="tables-list">
                      {message.result.tables.map((table, idx) => (
                        <div key={idx} className="table-item">{table}</div>
                      ))}
                    </div>
                  </Card>

                  {/* Updated SQL card with tabs */}
                  <UpdatedSqlCard query={message.result.query} />
                </>
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

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.hasChildNodes()) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
} 