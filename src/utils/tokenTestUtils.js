// Token Test Utilities - For testing token expiration functionality
import { getToken } from './authUtils';
import tokenExpirationChecker from './tokenExpirationChecker';

// Test token expiration functionality
export const testTokenExpiration = () => {
  const token = getToken();
  
  if (!token) {
    console.log('❌ No token found');
    return;
  }

  console.log('🔍 Testing token expiration...');
  console.log('Token:', token.substring(0, 50) + '...');
  
  // Check if token is expired
  const isExpired = tokenExpirationChecker.isTokenExpired(token);
  console.log('Is expired:', isExpired);
  
  // Check if token is expiring soon
  const isExpiringSoon = tokenExpirationChecker.isTokenExpiringSoon(token);
  console.log('Is expiring soon:', isExpiringSoon);
  
  // Get time until expiration
  const timeUntilExpiry = tokenExpirationChecker.getTimeUntilExpiration(token);
  console.log('Time until expiry (minutes):', timeUntilExpiry);
  
  // Decode token to see expiration time
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expDate = new Date(payload.exp * 1000);
    console.log('Token expires at:', expDate.toLocaleString());
    console.log('Current time:', new Date().toLocaleString());
  } catch (error) {
    console.error('Error decoding token:', error);
  }
};

// Simulate token expiration (for testing)
export const simulateTokenExpiration = () => {
  console.log('🧪 Simulating token expiration...');
  
  // Create a fake expired token
  const expiredPayload = {
    exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    iat: Math.floor(Date.now() / 1000) - 7200, // Issued 2 hours ago
    sub: 'test-user'
  };
  
  const expiredToken = 'header.' + btoa(JSON.stringify(expiredPayload)) + '.signature';
  
  // Temporarily replace the token
  const originalToken = sessionStorage.getItem('token');
  sessionStorage.setItem('token', expiredToken);
  
  console.log('Set expired token, checking expiration...');
  const isExpired = tokenExpirationChecker.isTokenExpired(expiredToken);
  console.log('Is expired:', isExpired);
  
  // Restore original token
  if (originalToken) {
    sessionStorage.setItem('token', originalToken);
  } else {
    sessionStorage.removeItem('token');
  }
  
  console.log('Restored original token');
};

// Test the token expiration checker
export const testTokenExpirationChecker = () => {
  console.log('🧪 Testing token expiration checker...');
  
  // Start the checker
  tokenExpirationChecker.start();
  
  // Stop after 5 seconds
  setTimeout(() => {
    console.log('Stopping token expiration checker...');
    tokenExpirationChecker.stop();
  }, 5000);
};

// Make functions available in console for testing
if (typeof window !== 'undefined') {
  window.testTokenExpiration = testTokenExpiration;
  window.simulateTokenExpiration = simulateTokenExpiration;
  window.testTokenExpirationChecker = testTokenExpirationChecker;
  
  console.log('🔧 Token test utilities loaded. Available functions:');
  console.log('- testTokenExpiration() - Test current token status');
  console.log('- simulateTokenExpiration() - Simulate expired token');
  console.log('- testTokenExpirationChecker() - Test the expiration checker');
}

export default {
  testTokenExpiration,
  simulateTokenExpiration,
  testTokenExpirationChecker
};
