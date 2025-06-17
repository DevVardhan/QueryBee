import React from 'react';
import { Card } from './Card';

interface ErrorCardProps {
  message: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ message }) => {
  return (
    <Card
      icon={<span style={{ color: '#ef4444' }}>⚠️</span>}
      title="Error"
    >
      <div style={{ 
        color: '#ef4444', 
        padding: '12px 16px',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fee2e2',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        {message}
      </div>
    </Card>
  );
}; 