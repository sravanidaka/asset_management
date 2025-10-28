// Logout Manager - Prevents multiple logout calls and manages logout state
class LogoutManager {
  constructor() {
    this.isLoggingOut = false;
  }

  // Check if logout is in progress
  isLogoutInProgress() {
    return this.isLoggingOut;
  }

  // Set logout in progress
  setLogoutInProgress() {
    this.isLoggingOut = true;
  }

  // Reset logout state
  resetLogoutState() {
    this.isLoggingOut = false;
  }

  // Safe logout - prevents multiple calls
  safeLogout(logoutFunction) {
    if (this.isLoggingOut) {
      console.log('⚠️ Logout already in progress, ignoring duplicate call');
      return;
    }

    console.log('🔒 Starting safe logout process');
    this.setLogoutInProgress();
    
    try {
      logoutFunction();
    } catch (error) {
      console.error('❌ Error during logout:', error);
    } finally {
      // Reset after a delay to allow navigation to complete
      setTimeout(() => {
        console.log('🔄 Resetting logout state');
        this.resetLogoutState();
      }, 1000);
    }
  }
}

// Create singleton instance
const logoutManager = new LogoutManager();

export default logoutManager;
