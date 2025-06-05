import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  cost?: string;
  children: React.ReactNode;
  onExpand?: () => void;
}

export const Card: React.FC<CardProps> = ({ icon, title, cost, children, onExpand }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="left">
          <div className="card-icon">{icon}</div>
          <span className="card-title">{title}</span>
        </div>
        <div className="right">
          {cost && <span className="card-cost">{cost}</span>}
          {onExpand && (
            <button className="card-expand" onClick={onExpand} title="Expand">
              ➔
            </button>
          )}
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}; 