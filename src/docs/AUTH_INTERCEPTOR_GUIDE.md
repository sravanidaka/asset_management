# Global Auth Interceptor Guide

This guide explains how to use the global authentication interceptor system that automatically manages tokens for API requests.

## Overview

The auth interceptor system provides:
- Automatic token injection into API headers
- Authentication state management
- Automatic logout on authentication errors
- Centralized API configuration
- Easy-to-use utility functions

## Files Created

1. **`src/utils/authInterceptor.js`** - Main interceptor class
2. **`src/utils/authUtils.js`** - Utility functions for authentication
3. **`src/config/api.js`** - Updated API configuration
4. **`src/examples/ApiUsageExample.js`** - Usage examples

## How It Works

### 1. Token Storage
- Tokens are stored in `sessionStorage` as `token`
- Authentication status is stored as `isAuthenticated` in both `localStorage` and `sessionStorage`
- User data is stored in `sessionStorage` as `user`

### 2. Automatic Token Injection
- All API requests automatically include the token in the `x-access-token` header
- Login and forgot password endpoints are excluded from token requirements
- If no token is found for protected endpoints, user is automatically logged out

### 3. Authentication Error Handling
- 401/403 responses automatically trigger logout
- Session storage is cleared on authentication errors
- User is redirected to login page

## Usage Examples

### Basic API Calls

```javascript
import { api } from '../config/api';

// GET request with automatic token
const result = await api.getAssets();
if (result.success) {
  console.log(result.data);
}

// POST request with automatic token
const newAsset = { name: 'New Asset', category: 'IT' };
const result = await api.createAsset(newAsset);
```

### Using Auth Utils Directly

```javascript
import { authenticatedGet, authenticatedPost, getCurrentUser } from '../utils/authUtils';

// Direct API calls
const result = await authenticatedGet('/assets');
const result2 = await authenticatedPost('/assets', { name: 'New Asset' });

// Get current user
const user = getCurrentUser();
console.log(user.name, user.role);
```

### Authentication Checks

```javascript
import { isAuthenticated, hasRole, hasPermission } from '../utils/authUtils';

// Check if user is authenticated
if (isAuthenticated()) {
  // User is logged in
}

// Check user role
if (hasRole('admin')) {
  // User has admin role
}

// Check multiple roles
if (hasRole(['admin', 'manager'])) {
  // User has admin or manager role
}

// Check permissions
if (hasPermission('create_asset')) {
  // User can create assets
}
```

### Component Example

```javascript
import React, { useState, useEffect } from 'react';
import { api } from '../config/api';
import { getCurrentUser, logout } from '../utils/authUtils';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Fetch data
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.getAssets();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(); // This will clear session and redirect to login
  };

  return (
    <div>
      {user && <p>Welcome, {user.name}!</p>}
      {loading ? <p>Loading...</p> : <p>Data: {JSON.stringify(data)}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};
```

## API Endpoints

All API calls automatically include the token except for:
- `/auth/login`
- `/auth/forgot-password`
- `/auth/register`

## Available API Methods

### Assets
- `api.getAssets()`
- `api.createAsset(data)`
- `api.updateAsset(data)`
- `api.deleteAsset(data)`
- `api.procureAsset(data)`
- `api.allocateAsset(data)`
- `api.transferAsset(data)`
- `api.financialAsset(data)`
- `api.disposeAsset(data)`

### Users & Roles
- `api.getUsers()`
- `api.createUser(data)`
- `api.updateUser(data)`
- `api.deleteUser(data)`
- `api.getRoles()`
- `api.createRole(data)`
- `api.updateRole(data)`
- `api.deleteRole(data)`

### Settings
- `api.getCategories()`
- `api.createCategory(data)`
- `api.updateCategory(data)`
- `api.deleteCategory(data)`
- `api.getStatuses()`
- `api.getLocations()`
- `api.getVendors()`
- `api.getPaymentMethods()`
- `api.getServiceTypes()`
- `api.getApprovalHierarchies()`

### Maintenance
- `api.getMaintenance()`
- `api.createMaintenance(data)`
- `api.updateMaintenance(data)`
- `api.deleteMaintenance(data)`
- `api.getMaintenanceHistory()`
- `api.getMaintenanceSchedule()`
- `api.getMaintenanceServiceLog()`

### Financials & Disposal
- `api.getFinancials()`
- `api.createFinancial(data)`
- `api.getDisposal()`
- `api.createDisposal(data)`

### Compliance
- `api.getCompliance()`
- `api.createCompliance(data)`
- `api.updateCompliance(data)`
- `api.deleteCompliance(data)`

## Error Handling

The interceptor automatically handles:
- Network errors
- Authentication errors (401/403)
- Server errors
- Token expiration

All API calls return a consistent response format:

```javascript
{
  success: boolean,
  data: any,           // Response data on success
  error: string,       // Error message on failure
  status: number       // HTTP status code
}
```

## Security Features

1. **Automatic Token Injection**: Tokens are automatically added to all protected requests
2. **Session Management**: Tokens are stored securely in sessionStorage
3. **Automatic Logout**: Users are logged out on authentication errors
4. **Cross-tab Synchronization**: Authentication state is synchronized across browser tabs
5. **Role-based Access**: Built-in support for role and permission checking

## Best Practices

1. **Always check `result.success`** before using response data
2. **Use the `api` object** for standard CRUD operations
3. **Use auth utils** for custom authentication logic
4. **Handle loading states** in your components
5. **Implement error boundaries** for better error handling
6. **Use role/permission checks** for UI elements

## Troubleshooting

### Common Issues

1. **Token not being sent**: Check if the endpoint is in the excluded list
2. **Automatic logout**: Check if the token is valid and not expired
3. **CORS errors**: Ensure your API server allows the frontend domain
4. **Network errors**: Check your API base URL configuration

### Debug Mode

Enable debug logging by checking the browser console. The interceptor logs:
- All API requests and responses
- Authentication status changes
- Token validation results
- Error details

## Migration from Old API Calls

If you have existing API calls, replace them:

```javascript
// Old way
const response = await fetch('/api/assets', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// New way
const result = await api.getAssets();
```

This system provides a robust, secure, and easy-to-use authentication layer for your React application.
