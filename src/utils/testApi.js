// Test file to debug API token issues
import authInterceptor from './authInterceptor';
import { api } from '../config/api';

// Test function to check token and make API call
export const testApiCall = async () => {
  console.log('=== API Test Debug ===');
  
  // Check token in session storage
  const token = sessionStorage.getItem('token');
  console.log('Token from sessionStorage:', token);
  
  // Check authentication status
  const isAuth = authInterceptor.isAuthenticated();
  console.log('Is authenticated:', isAuth);
  
  // Test direct API call
  try {
    console.log('Making test API call...');
    const result = await api.getAssets();
    console.log('API call result:', result);
    return result;
  } catch (error) {
    console.error('API call error:', error);
    return { success: false, error: error.message };
  }
};

// Test function to check what headers are being sent
export const testHeaders = () => {
  console.log('=== Headers Test ===');
  
  const token = sessionStorage.getItem('token');
  console.log('Current token:', token);
  
  // Simulate what the interceptor should do
  const testEndpoint = '/assets';
  const isExcluded = authInterceptor.isExcludedEndpoint(testEndpoint);
  console.log('Is endpoint excluded:', isExcluded);
  
  if (!isExcluded) {
    const headers = {
      'Content-Type': 'application/json',
      'x-access-token': token
    };
    console.log('Headers that should be sent:', headers);
  }
};

export default { testApiCall, testHeaders };
