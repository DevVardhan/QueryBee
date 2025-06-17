import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPopup } from './components/LoginPopup';
import './sidebar.css';
import './styles/auth.css';
import { Card } from './components/Card';
import { TextPopup } from './components/TextPopup';
import { SqlFeedbackPopup } from './components/SqlFeedbackPopup';
import { ErrorCard } from './components/ErrorCard';
import { saveFeedback } from './firebase';
import { LoadingIndicator } from './components/LoadingIndicator';
// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
// @ts-ignore
import 'prismjs/themes/prism.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5 11.5L14.5 14.5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="7" r="5.25" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ThumbsUpIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.97l-2.714 4.264M7 20h2.886a2 2 0 001.914-1.415l2.257-6.772a2 2 0 00-1.914-2.585H5.5" />
  </svg>
);

const ThumbsDownIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085a2 2 0 001.736-.97l2.714-4.264M17 4h-2.886a2 2 0 00-1.914 1.415l-2.257 6.772a2 2 0 001.914 2.585H18.5" />
  </svg>
);

interface AnalysisResult {
  tables?: string[];
  query?: string;
  loading: boolean;
  error?: boolean;
  message?: string;
}

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  result?: AnalysisResult;
}

interface UpdatedSqlCardProps {
  query: string;
  onRegenerate: (reasons: string[]) => void;
}

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3.75 6.75h16.5" />
    <path d="M3.75 12h16.5" />
    <path d="M3.75 17.25h16.5" />
  </svg>
);

const NewChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 5.75A2.75 2.75 0 0 1 6.75 3h10.5A2.75 2.75 0 0 1 20 5.75v7.5A2.75 2.75 0 0 1 17.25 16H8.5L4 19.25V5.75z" />
    <path d="M12 8.5v4" />
    <path d="M14 10.5h-4" />
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

const UpdatedSqlCard: React.FC<UpdatedSqlCardProps> = ({ query, onRegenerate }) => {
  const [tab, setTab] = useState<'english' | 'sql'>('english');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const { currentUser } = useAuth();
  const codeRef = useRef<HTMLPreElement>(null);

  const englishText = "I am fetching the product names from the product table and ordering them by price to get the most expensive item.";

  const handleThumbsUp = () => {
    saveFeedback({
      userId: currentUser?.uid ?? null,
      relatedQuery: query,
      isCorrect: true,
    });
  };

  const handleFeedbackSubmit = (reasons: string[]) => {
    saveFeedback({
      userId: currentUser?.uid ?? null,
      relatedQuery: query,
      isCorrect: false,
      reasons,
    });
    onRegenerate(reasons);
  };

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [query, tab]);

  return (
    <>
      <Card icon={<DatabaseIcon />} title="Updated SQL Query" cost="€0 3.5s">
        <div className="tab-strip">
          <div className={`tab ${tab === 'english' ? 'active' : ''}`} onClick={() => setTab('english')}>English</div>
          <div className={`tab ${tab === 'sql' ? 'active' : ''}`} onClick={() => setTab('sql')}>SQL</div>
        </div>
        <div style={{ position: 'relative' }}>
          {tab === 'english' ? (
            <div style={{position: 'relative'}}>
              <div style={{background:'#f8f9ff',padding:'12px',borderRadius:'8px',fontSize:'14px',color:'#333'}}>
                {englishText}
              </div>
              <button 
                style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setIsPopupOpen(true)}
                title="View in popup"
              >
                <SearchIcon />
              </button>
            </div>
          ) : (
            <pre ref={codeRef} className="language-sql" style={{marginTop:'8px'}}>{query}</pre>
          )}
        </div>
        {/* Feedback section */}
        <div style={{marginTop: 12, display: 'flex', alignItems: 'center', gap: 8}}>
          <span style={{color: '#64748b', fontSize: 14}}>Is this SQL correct?</span>
          <button onClick={handleThumbsUp} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 2}} title="Thumbs up">
            <ThumbsUpIcon />
          </button>
          <button onClick={() => setIsFeedbackOpen(true)} style={{background: 'none', border: 'none', cursor: 'pointer', padding: 2}} title="Thumbs down">
            <ThumbsDownIcon />
          </button>
        </div>
      </Card>
      <TextPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        text={tab === 'english' ? englishText : query}
        language={tab}
      />
      <SqlFeedbackPopup
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
};

const SidebarContent = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { currentUser, logout } = useAuth();

  const handleQuestionSubmit = async () => {
    // Check if user is authenticated before allowing questions
    if (!currentUser) {
      setIsLoginPopupOpen(true);
      return;
    }

    if (!question.trim() || loading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setQuestion('');
    setLoading(true);

    // Check if the question contains "error"
    if (question.toLowerCase().includes('error')) {
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMessage.id 
              ? { ...msg, result: { error: true, message: 'Failed to fetch query results', loading: false } }
              : msg
          )
        );
        setLoading(false);
      }, 1000);
      return;
    }

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
    }, 4000);
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
      setMessages([]); // Clear chat history on logout
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleRegenerate = (reasons: string[]) => {
    if (!currentUser) {
      setIsLoginPopupOpen(true);
      return;
    }

    const newId = Date.now().toString();
    const placeholder: Message = {
      id: newId,
      text: '(regenerated)',
      timestamp: new Date(),
      result: { loading: true }
    };

    // Append placeholder message
    setMessages(prev => [...prev, placeholder]);

    // Simulate API call influenced by reasons
    setTimeout(() => {
      const newResult: AnalysisResult = {
        tables: ['Products'],
        query: `-- regenerated due to: ${reasons.join(', ')}\nSELECT * FROM Products ORDER BY price DESC LIMIT 1`,
        loading: false,
      };

      setMessages(prev => prev.map(msg =>
        msg.id === newId ? { ...msg, result: newResult } : msg
      ));
    }, 4000);
  };

  return (
    <div className="sidebar-container">
      <div className="header">
        <button className="header-icon" title="Menu">
          <MenuIcon />
        </button>
        <button className="header-icon" title="New chat" onClick={() => setMessages([])}>
          <NewChatIcon />
        </button>
        <div className="header-auth">
          {currentUser ? (
            <div className="user-info">
              <span className="user-email">{currentUser.email}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <button onClick={() => setIsLoginPopupOpen(true)} className="login-btn">
              Login
            </button>
          )}
        </div>
      </div>

      <div className="main-content" ref={mainContentRef}>
        {!currentUser && messages.length === 0 && (
          <div className="welcome-message">
            <h3>Welcome to QueryBee</h3>
            <p>Please log in to start chatting and generating SQL queries.</p>
            <button onClick={() => setIsLoginPopupOpen(true)} className="welcome-login-btn">
              Get Started - Login
            </button>
          </div>
        )}
        
        <div className="conversation">
          {messages.map((message) => (
            <div key={message.id} className="message">
              <div className="user-bubble">{message.text}</div>
              {message.result && (
                <>
                  {message.result.loading ? (
                    <LoadingIndicator />
                  ) : message.result.error ? (
                    <ErrorCard message={message.result.message || 'An error occurred'} />
                  ) : (
                    <>
                      {/* Analyzed tables card */}
                      <Card icon={<TableIcon />} title="Analysed tables" cost="€0 3.5s">
                        <div className="tables-list">
                          {message.result.tables?.map((table, idx) => (
                            <div key={idx} className="table-item">{table}</div>
                          ))}
                        </div>
                      </Card>

                      {/* Updated SQL card with tabs */}
                      <UpdatedSqlCard query={message.result.query || ''} onRegenerate={handleRegenerate} />
                    </>
                  )}
                </>
              )}
            </div>
          ))}
          {loading && <LoadingIndicator />}
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
            placeholder={currentUser ? "What would you like to know?" : "Login to start asking questions..."}
            className="question-input"
            rows={1}
          />
          <button 
            className="send-button" 
            onClick={handleQuestionSubmit}
            disabled={!question.trim() || loading}
            title={!currentUser ? "Login required" : "Send message"}
          >
            <SendIcon />
          </button>
        </div>
      </div>

      <LoginPopup 
        isOpen={isLoginPopupOpen} 
        onClose={() => setIsLoginPopupOpen(false)} 
      />
    </div>
  );
};

const App = () => {
  return (
    <div className="sidebar-container">
      <SidebarContent />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
); 