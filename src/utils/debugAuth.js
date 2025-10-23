// Debug utility for authentication issues
export const debugAuth = () => {
  console.log('=== AUTH DEBUG INFO ===');
  
  // Check session storage
  const token = sessionStorage.getItem('token');
  const isAuth = sessionStorage.getItem('isAuthenticated');
  const user = sessionStorage.getItem('user');
  
  console.log('Token:', token);
  console.log('Is Authenticated:', isAuth);
  console.log('User:', user);
  
  // Check localStorage
  const localAuth = localStorage.getItem('isAuthenticated');
  console.log('LocalStorage Auth:', localAuth);
  
  // Test API call
  console.log('=== TESTING API CALL ===');
  
  return {
    token,
    isAuthenticated: isAuth === 'true',
    user: user ? JSON.parse(user) : null,
    hasToken: !!token
  };
};

// Test function to make a simple API call
export const testApiCall = async () => {
  console.log('=== TESTING API CALL ===');
  
  const token = sessionStorage.getItem('token');
  console.log('Using token:', token);
  
  try {
    const response = await fetch('http://202.53.92.35:5004/api/assets', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token || ''
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response data:', data);
    
    return {
      status: response.status,
      data: data,
      success: response.ok
    };
  } catch (error) {
    console.error('API call error:', error);
    return {
      error: error.message,
      success: false
    };
  }
};
