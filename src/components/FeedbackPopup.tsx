import React, { useState } from 'react';
import '../sidebar.css';

const HandHeartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 14V12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12V14" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.8643 17.0624C12.3481 17.3456 11.6519 17.3456 11.1357 17.0624L8.79999 15.7499C8.28379 15.4667 7.93569 14.9207 7.93569 14.3166V10.8166C7.93569 10.2125 8.28379 9.66656 8.79999 9.38338L11.1357 8.0709C11.6519 7.78772 12.3481 7.78772 12.8643 8.0709L15.2 9.38338C15.7162 9.66656 16.0643 10.2125 16.0643 10.8166V14.3166C16.0643 14.9207 15.7162 15.4667 15.2 15.7499L12.8643 17.0624Z" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: { reasons: string[], text: string }) => void;
}

const feedbackOptions = [
  "Wrong data — incorrect values or logic",
  "Incorrect filters — wrong date, location",
  "Incomplete — missing parts"
];

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState('');

  if (!isOpen) return null;

  const handleReasonChange = (reason: string) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    onSubmit({ reasons: selectedReasons, text: feedbackText });
    onClose();
  };

  return (
    <div className="text-popup-overlay">
      <div className="feedback-popup-content">
        <div className="feedback-popup-header">
          <div className="feedback-icon-bg">
            <HandHeartIcon />
          </div>
          <h3>Help us improve your results</h3>
        </div>

        <div className="feedback-popup-body">
          {feedbackOptions.map(option => (
            <label key={option} className="feedback-option">
              <input
                type="checkbox"
                checked={selectedReasons.includes(option)}
                onChange={() => handleReasonChange(option)}
              />
              <span className="feedback-checkbox"></span>
              {option}
            </label>
          ))}
          <div className="feedback-input-wrapper">
            <textarea
              placeholder="Write feedback"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <button onClick={handleSubmit} className="feedback-send-button">
                <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 