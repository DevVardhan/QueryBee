import React, { useState, useEffect } from 'react';
import '../sidebar.css';

const WrenchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.782 5.34315L18.6568 1.46838C19.2426 0.882594 20.1924 0.882594 20.7782 1.46838V1.46838C21.364 2.05417 21.364 3.00391 20.7782 3.5897L18.6569 5.71107M14.782 5.34315L12.6606 7.46452M14.782 5.34315L18.435 9.00004M9.34315 10.782L5.46838 14.6569C4.88259 15.2426 4.88259 16.1924 5.46838 16.7782V16.7782C6.05417 17.364 7.00391 17.364 7.5897 16.7782L11.3431 13.0248M9.34315 10.782L13.0248 7.09141C13.8242 6.29201 15.093 6.42582 15.7171 7.2798L16.7201 8.6596C17.3443 9.51358 17.2105 10.7824 16.4111 11.5818L12.7202 15.2727C11.9208 16.0721 10.652 15.9383 10.0279 15.0843L9.02492 13.7045C8.39493 12.8425 8.54303 11.5833 9.34315 10.782Z" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const loadingStates = [
  "Interpreting your request",
  "Understanding the intent",
  "Generating SQL",
  "Query generated"
];

export const LoadingIndicator: React.FC = () => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentState(prev => {
        if (prev < loadingStates.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000); // Change state every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-indicator">
      <WrenchIcon />
      <span className="loading-text">{loadingStates[currentState]}</span>
    </div>
  );
}; 