# Token Debug Guide

## How to Test Token Passing

### Step 1: Start the Application
```bash
npm start
```

### Step 2: Login to Get Token
1. Go to `http://202.53.92.35:5004`
2. Login with your credentials
3. Check browser console for login success
4. Verify token is stored in sessionStorage

### Step 3: Test API Calls
1. Navigate to **Development > API Test** in the sidebar
2. Click "Test API Call (via interceptor)" button
3. Check browser console for debug logs

### Step 4: Check Console Logs
Look for these debug messages in the browser console:

```
🔍 Intercepting request for: http://202.53.92.35:5004/api/assets
🔍 Is endpoint excluded: false
🔍 Token found: YES
✅ Token added to headers: {x-access-token: "your-token-here"}
🔍 Final headers: {Content-Type: "application/json", x-access-token: "your-token-here"}
```

### Step 5: Verify Network Tab
1. Open browser DevTools
2. Go to Network tab
3. Make an API call
4. Check the request headers for `x-access-token`

## Common Issues & Solutions

### Issue 1: "No token found"
**Solution:** Make sure you're logged in and token is in sessionStorage
```javascript
// Check in browser console
console.log('Token:', sessionStorage.getItem('token'));
```

### Issue 2: "Endpoint excluded from authentication"
**Solution:** Check if the endpoint is in the excluded list
```javascript
// Check excluded endpoints
console.log('Excluded endpoints:', ['/auth/login', '/auth/forgot-password', '/auth/register']);
```

### Issue 3: Token not being sent
**Solution:** Check the interceptor logs and network tab

### Issue 4: API returning 401/403
**Solution:** 
1. Verify token is valid
2. Check if token format is correct
3. Ensure server expects `x-access-token` header

## Manual Testing

### Test 1: Check Token Storage
```javascript
// In browser console
console.log('Token:', sessionStorage.getItem('token'));
console.log('User:', sessionStorage.getItem('user'));
console.log('Is Authenticated:', sessionStorage.getItem('isAuthenticated'));
```

### Test 2: Test Direct API Call
```javascript
// In browser console
const token = sessionStorage.getItem('token');
fetch('http://202.53.92.35:5004/api/assets', {
  headers: {
    'Content-Type': 'application/json',
    'x-access-token': token
  }
})
.then(response => response.json())
.then(data => console.log('Direct API Response:', data));
```

### Test 3: Test Interceptor
```javascript
// In browser console
import { api } from './config/api';
api.getAssets().then(result => console.log('API Result:', result));
```

## Debug Commands

### Check Authentication Status
```javascript
import { isAuthenticated, getCurrentUser } from './utils/authUtils';
console.log('Is Authenticated:', isAuthenticated());
console.log('Current User:', getCurrentUser());
```

### Test Specific API Endpoint
```javascript
import { api } from './config/api';
api.getAssets().then(result => console.log('Assets:', result));
api.getUsers().then(result => console.log('Users:', result));
api.getCategories().then(result => console.log('Categories:', result));
```

## Expected Behavior

1. **Login**: Token should be stored in sessionStorage
2. **API Calls**: Token should be automatically added to headers
3. **Console Logs**: Should show interceptor debug messages
4. **Network Tab**: Should show `x-access-token` header in requests
5. **API Responses**: Should return data instead of 401/403 errors

## Troubleshooting

If token is still not being passed:

1. **Check the interceptor logs** - Look for 🔍 emojis in console
2. **Verify token format** - Make sure it's a valid JWT or string
3. **Check endpoint exclusion** - Ensure your API endpoint is not excluded
4. **Test with direct fetch** - Use the "Test Direct API Call" button
5. **Check server logs** - Verify server is receiving the token

## Files to Check

- `src/utils/authInterceptor.js` - Main interceptor logic
- `src/config/api.js` - API configuration
- `src/components/ApiTestComponent.js` - Test component
- Browser console - Debug logs
- Network tab - Request headers
