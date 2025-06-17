import React, { useState } from 'react';

interface SqlFeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasons: string[]) => void;
}

export const SqlFeedbackPopup: React.FC<SqlFeedbackPopupProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selected, setSelected] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleReason = (reason: string) => {
    setSelected(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const handleSubmit = () => {
    onSubmit(selected);
    onClose();
    setSelected([]);
  };

  return (
    <div className="text-popup-overlay" onClick={onClose}>
      <div className="text-popup-content" onClick={e => e.stopPropagation()} style={{maxWidth: 320, minWidth: 260}}>
        <div className="text-popup-header">
          <h3 style={{fontWeight: 400, fontSize: 14, color: '#0f172a'}}>Why is this SQL wrong?</h3>
          <button className="text-popup-close" onClick={onClose}>×</button>
        </div>
        <div className="text-popup-body sql-feedback-body" style={{display:'flex',flexDirection:'column',gap:8}}>
          {['Wrong data — incorrect values or logic','SQL syntax error','Performance issue'].map((reason) => (
            <label key={reason} className="sql-feedback-option" style={{display:'flex',alignItems:'center',cursor:'pointer'}}>
              <input 
                type="checkbox" 
                checked={selected.includes(reason)} 
                onChange={() => toggleReason(reason)}
              />
              <span style={{color: '#222', fontSize: 14, marginLeft: 8}}>{reason}</span>
            </label>
          ))}
        </div>
        <div style={{marginTop:12,display:'flex',justifyContent:'flex-end'}}>
          <button onClick={handleSubmit} style={{background:'#0f172a',color:'#fff',border:'none',padding:'6px 12px',borderRadius:4,cursor:'pointer'}} disabled={selected.length===0}>Submit</button>
        </div>
      </div>
    </div>
  );
}; 