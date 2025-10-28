// Token Expiration Warning Component
import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { getToken } from '../utils/authUtils';
import tokenExpirationChecker from '../utils/tokenExpirationChecker';

const TokenExpirationWarning = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  useEffect(() => {
    const checkTokenStatus = () => {
      const token = getToken();
      if (!token) return;

      // Check if token is expiring soon (within 5 minutes)
      const isSoon = tokenExpirationChecker.isTokenExpiringSoon(token);
      const timeUntilExpiry = tokenExpirationChecker.getTimeUntilExpiration(token);

      setIsExpiringSoon(isSoon);
      setTimeRemaining(timeUntilExpiry);

      if (isSoon && timeUntilExpiry > 0) {
        setIsVisible(true);
      }
    };

    // Check immediately
    checkTokenStatus();

    // Check every 30 seconds
    const interval = setInterval(checkTokenStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    // Refresh the page to potentially get a new token
    window.location.reload();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || !isExpiringSoon) {
    return null;
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          Session Expiring Soon
        </div>
      }
      open={isVisible}
      onCancel={handleDismiss}
      footer={[
        <Button key="dismiss" onClick={handleDismiss}>
          Dismiss
        </Button>,
        <Button key="refresh" type="primary" onClick={handleRefresh}>
          Refresh Session
        </Button>
      ]}
      centered
      closable={true}
    >
      <Alert
        message="Your session is about to expire"
        description={
          <div>
            <p>
              Your session will expire in approximately <strong>{timeRemaining} minutes</strong>.
            </p>
            <p>
              To continue working, please refresh the page or save your work and log in again.
            </p>
          </div>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
    </Modal>
  );
};

export default TokenExpirationWarning;
