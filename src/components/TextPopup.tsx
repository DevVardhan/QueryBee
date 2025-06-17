import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
// @ts-ignore
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
// @ts-ignore
import 'prismjs/themes/prism.css';

interface TextPopupProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  language: 'english' | 'sql';
}

export const TextPopup: React.FC<TextPopupProps> = ({ isOpen, onClose, text, language }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(text);
  const codeRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (language === 'sql' && !isEditing && codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [language, isEditing, editValue, text]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editValue : text);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValue(text);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Optionally: call a prop to save the edited value
  };

  return createPortal(
    <div className="text-popup-overlay" onClick={onClose}>
      <div className="text-popup-content" onClick={e => e.stopPropagation()}>
        <div className="text-popup-header">
          <h3>{language === 'english' ? 'English Query' : 'SQL Query'}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCopy} title="Copy" className="text-popup-icon-btn">📋</button>
            {!isEditing && (
              <button onClick={handleEdit} title="Edit" className="text-popup-icon-btn">✏️</button>
            )}
            {isEditing && (
              <button onClick={handleSave} title="Save" className="text-popup-icon-btn">💾</button>
            )}
            <button className="text-popup-close" onClick={onClose}>×</button>
          </div>
        </div>
        <div className={`text-popup-body ${language}`}>
          {isEditing ? (
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              style={{ width: '100%', minHeight: 100 }}
            />
          ) : (
            language === 'sql' ? (
              <pre style={{ margin: 0 }}>
                <code ref={codeRef} className="language-sql">
                  {text}
                </code>
              </pre>
            ) : (
              text
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}; 