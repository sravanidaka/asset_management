// Auth Interceptor for managing global token authentication
import { API_CONFIG } from '../config/api';

class AuthInterceptor {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.excludedEndpoints = [
      '/auth/login',
      '/auth/forgot-password',
      '/auth/register',
      'auth/login',
      'auth/forgot-password',
      'auth/register'
    ];
  }

  // Get token from session storage
  getToken() {
    try {
      return sessionStorage.getItem('token');
    } catch (error) {
      console.error('Error getting token from session storage:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const isAuth = sessionStorage.getItem('isAuthenticated') === 'true';
    return !!(token && isAuth);
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if token is expired (with 5 minute buffer)
      const bufferTime = 5 * 60; // 5 minutes in seconds
      return payload.exp < (currentTime + bufferTime);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If we can't parse the token, consider it expired
    }
  }

  // Check if endpoint should be excluded from token requirement
  isExcludedEndpoint(endpoint) {
    // If endpoint is a full URL, extract the path
    let path = endpoint;
    if (endpoint.startsWith('http')) {
      try {
        const url = new URL(endpoint);
        path = url.pathname;
      } catch (e) {
        // If URL parsing fails, use the endpoint as is
        path = endpoint;
      }
    }
    
    return this.excludedEndpoints.some(excluded => path.includes(excluded));
  }

  // Handle authentication errors
  handleAuthError() {
    console.log('Authentication failed, redirecting to login');
    
    // Clear session storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('user');
    
    // Redirect to login using window.location as fallback
    // This is used by the interceptor when no navigate function is available
    window.location.href = '/login';
  }

  // Intercept request and add token
  interceptRequest(url, options = {}) {
    const { headers = {}, ...restOptions } = options;
    
    console.log('🔍 Intercepting request for:', url);
    
    // Check if this endpoint needs authentication
    const isExcluded = this.isExcludedEndpoint(url);
    console.log('🔍 Is endpoint excluded:', isExcluded);
    
    if (!isExcluded) {
      const token = this.getToken();
      console.log('🔍 Token found:', token ? 'YES' : 'NO');
      
      if (!token) {
        console.warn('❌ No token found for authenticated endpoint:', url);
        this.handleAuthError();
        return null;
      }

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        console.warn('❌ Token is expired for endpoint:', url);
        this.handleAuthError();
        return null;
      }
      
      // Add token to headers
      headers['x-access-token'] = token;
      console.log('✅ Token added to headers:', { 'x-access-token': token });
    } else {
      console.log('ℹ️ Endpoint excluded from authentication');
    }
    
    const finalHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    
    console.log('🔍 Final headers:', finalHeaders);
    
    return {
      ...restOptions,
      headers: finalHeaders
    };
  }

  // Intercept response and handle auth errors
  async interceptResponse(response) {
    // Check for authentication errors
    if (response.status === 401 || response.status === 403) {
      console.log('Authentication error detected:', response.status);
      this.handleAuthError();
      throw new Error('Authentication failed');
    }
    
    return response;
  }

  // Main API call method with interceptors
  async apiCall(endpoint, options = {}) {
    const { method = 'GET', data = null, ...restOptions } = options;
    
    // Build full URL
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    // Intercept request
    const interceptedOptions = this.interceptRequest(url, {
      method,
      ...restOptions
    });
    
    if (!interceptedOptions) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      };
    }
    
    // Add body for non-GET requests
    if (data && method !== 'GET') {
      interceptedOptions.body = JSON.stringify(data);
    }
    
    try {
      console.log(`API Call: ${method} ${url}`);
      console.log('Request options:', interceptedOptions);
      if (data) console.log('Request data:', data);
      
      const response = await fetch(url, interceptedOptions);
      
      console.log(`Response status: ${response.status}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Intercept response
      await this.interceptResponse(response);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Response data:', responseData);
      
      return {
        success: true,
        data: responseData,
        status: response.status
      };
    } catch (error) {
      console.error(`API call failed for ${url}:`, error);
      return {
        success: false,
        error: error.message,
        status: error.status || 'Network Error'
      };
    }
  }

  // Convenience methods for different HTTP methods
  async get(endpoint, options = {}) {
    return this.apiCall(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.apiCall(endpoint, { method: 'POST', data, ...options });
  }

  async put(endpoint, data, options = {}) {
    return this.apiCall(endpoint, { method: 'PUT', data, ...options });
  }

  async delete(endpoint, data, options = {}) {
    return this.apiCall(endpoint, { method: 'DELETE', data, ...options });
  }

  async patch(endpoint, data, options = {}) {
    return this.apiCall(endpoint, { method: 'PATCH', data, ...options });
  }
}

// Create singleton instance
const authInterceptor = new AuthInterceptor();

export default authInterceptor;
