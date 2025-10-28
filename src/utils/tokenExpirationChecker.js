// Token Expiration Checker - Monitors token expiration and handles automatic logout

class TokenExpirationChecker {
  constructor() {
    this.checkInterval = null;
    this.checkIntervalMs = 60000; // Check every minute
    this.isRunning = false;
  }

  // Start monitoring token expiration
  start() {
    if (this.isRunning) {
      console.log('Token expiration checker is already running');
      return;
    }

    console.log('Starting token expiration checker');
    this.isRunning = true;
    
    // Check immediately
    this.checkTokenExpiration();
    
    // Set up periodic checking
    this.checkInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, this.checkIntervalMs);
  }

  // Stop monitoring token expiration
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Stopped token expiration checker');
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (with 2 minute buffer)
      const bufferTime = 2 * 60; // 2 minutes in seconds
      return payload.exp < (currentTime + bufferTime);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If we can't parse the token, consider it expired
    }
  }

  // Check token expiration and handle logout if needed
  checkTokenExpiration() {
    const token = sessionStorage.getItem('token');
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    
    // Only check if user is authenticated
    if (!isAuthenticated || !token) {
      return;
    }

    console.log('Checking token expiration...');
    
    if (this.isTokenExpired(token)) {
      console.log('Token is expired, logging out user automatically');
      
      // Show user-friendly message
      if (window.confirm) {
        // For browsers that support confirm
        alert('Your session has expired. You will be redirected to the login page.');
      }
      
      // Clear session data and redirect
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      // Redirect to login
      window.location.href = '/login';
    } else {
      console.log('Token is still valid');
    }
  }

  // Get time until token expires (in minutes)
  getTimeUntilExpiration(token) {
    if (!token) return 0;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      return Math.max(0, Math.floor(timeUntilExpiry / 60)); // Return minutes
    } catch (error) {
      console.error('Error calculating token expiration time:', error);
      return 0;
    }
  }

  // Check if token will expire soon (within 5 minutes)
  isTokenExpiringSoon(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = payload.exp - currentTime;
      return timeUntilExpiry < (5 * 60); // 5 minutes
    } catch (error) {
      console.error('Error checking if token is expiring soon:', error);
      return true;
    }
  }
}

// Create singleton instance
const tokenExpirationChecker = new TokenExpirationChecker();

export default tokenExpirationChecker;
