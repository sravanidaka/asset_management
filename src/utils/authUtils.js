// Authentication utility functions
import authInterceptor from './authInterceptor';

// Check if user is authenticated
export const isAuthenticated = () => {
  return authInterceptor.isAuthenticated();
};

// Get current user from session storage
export const getCurrentUser = () => {
  try {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get token from session storage
export const getToken = () => {
  return authInterceptor.getToken();
};

// Check if token is expired
export const isTokenExpired = (token) => {
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
};

// Check if user is authenticated and token is not expired
export const isAuthenticatedAndValid = () => {
  const token = getToken();
  if (!token) return false;
  
  const isExpired = isTokenExpired(token);
  if (isExpired) {
    console.log('Token is expired, logging out user');
    logout();
    return false;
  }
  
  return authInterceptor.isAuthenticated();
};

// Logout user and clear session
export const logout = (navigate = null) => {
  console.log('🔓 Logout function called');
  
  // Clear all authentication data
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('isAuthenticated');
  sessionStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  
  console.log('🧹 Session data cleared');
  
  // Use React Router navigation if available, otherwise fallback to window.location
  if (navigate && typeof navigate === 'function') {
    console.log('🧭 Using React Router navigation');
    navigate('/login');
  } else {
    console.log('🧭 Using window.location fallback');
    // Fallback for cases where navigate is not available
    window.location.href = '/login';
  }
};

// Check if user has specific role or permission
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  // If requiredRole is an array, check if user has any of the roles
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};

// Check if user has specific permission
export const hasPermission = (requiredPermission) => {
  const user = getCurrentUser();
  if (!user || !user.permissions) return false;
  
  // If requiredPermission is an array, check if user has any of the permissions
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(permission => user.permissions.includes(permission));
  }
  
  return user.permissions.includes(requiredPermission);
};

// Make authenticated API call
export const authenticatedApiCall = async (endpoint, options = {}) => {
  return authInterceptor.apiCall(endpoint, options);
};

// Make authenticated GET request
export const authenticatedGet = async (endpoint, options = {}) => {
  return authInterceptor.get(endpoint, options);
};

// Make authenticated POST request
export const authenticatedPost = async (endpoint, data, options = {}) => {
  return authInterceptor.post(endpoint, data, options);
};

// Make authenticated PUT request
export const authenticatedPut = async (endpoint, data, options = {}) => {
  return authInterceptor.put(endpoint, data, options);
};

// Make authenticated DELETE request
export const authenticatedDelete = async (endpoint, data, options = {}) => {
  return authInterceptor.delete(endpoint, data, options);
};

export default {
  isAuthenticated,
  getCurrentUser,
  getToken,
  logout,
  hasRole,
  hasPermission,
  authenticatedApiCall,
  authenticatedGet,
  authenticatedPost,
  authenticatedPut,
  authenticatedDelete
};
