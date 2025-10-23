// API Test utility to check connectivity and response formats
export const testAPIEndpoint = async (url, method = 'GET', data = null) => {
  try {
    console.log(`Testing ${method} request to: ${url}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    return {
      success: true,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error(`API test failed for ${url}:`, error);
    return {
      success: false,
      error: error.message,
      status: error.status || 'Network Error'
    };
  }
};

// Test multiple endpoints
export const testAllEndpoints = async () => {
  const endpoints = [
    'http://202.53.92.35:5004/api/assets',
    'http://202.53.92.35:5004/api/users',
    'http://202.53.92.35:5004/api/settings/getSettingCategoriesList',
    'http://202.53.92.35:5004/api/financials',
    'http://202.53.92.35:5004/api/maintenance',
    'http://202.53.92.35:5004/api/compliance-policies'
  ];
  
  console.log('Testing all API endpoints...');
  
  for (const endpoint of endpoints) {
    await testAPIEndpoint(endpoint);
    console.log('---');
  }
};

