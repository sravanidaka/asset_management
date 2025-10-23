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

// Logout user and clear session
export const logout = () => {
  // Clear all authentication data
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('isAuthenticated');
  sessionStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  
  // Redirect to login
  window.location.href = '/login';
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
