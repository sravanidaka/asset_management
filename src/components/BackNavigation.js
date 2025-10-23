import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BackNavigation = ({ fallbackPath = '/dashboard' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to dashboard or specified path
      navigate(fallbackPath);
    }
  };

  return (
    <div 
      className="back-navigation-icon"
      onClick={handleBack}
      title="Go back"
      style={{
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px',
        borderRadius: '50%',
        transition: 'all 0.2s ease',
        color: '#6c757d',
        fontSize: '18px'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#f8f9fa';
        e.target.style.color = '#28a745';
        e.target.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
        e.target.style.color = '#6c757d';
        e.target.style.transform = 'scale(1)';
      }}
    >
      <FaArrowLeft />
    </div>
  );
};

export default BackNavigation;
