// Logout Test Utility - For testing logout functionality
import logoutManager from './logoutManager';

// Test logout functionality
export const testLogout = () => {
  console.log('🧪 Testing logout functionality...');
  
  // Test 1: Normal logout
  console.log('Test 1: Normal logout');
  logoutManager.safeLogout(() => {
    console.log('✅ Normal logout executed');
  });
  
  // Test 2: Duplicate logout prevention
  console.log('Test 2: Duplicate logout prevention');
  setTimeout(() => {
    logoutManager.safeLogout(() => {
      console.log('❌ This should not execute (duplicate call)');
    });
  }, 100);
  
  // Test 3: Reset after delay
  console.log('Test 3: Reset after delay');
  setTimeout(() => {
    logoutManager.safeLogout(() => {
      console.log('✅ Logout after reset should work');
    });
  }, 2000);
};

// Make functions available in console for testing
if (typeof window !== 'undefined') {
  window.testLogout = testLogout;
  
  console.log('🔧 Logout test utilities loaded. Available functions:');
  console.log('- testLogout() - Test logout functionality');
}

export default {
  testLogout
};
