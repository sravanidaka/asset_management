# 🔍 Debugging Guide - Token Authentication Issues

## 🚨 **Current Issue: 258 Error & Token Not Passing**

You're experiencing a 258 error and tokens not being passed to APIs. Here's how to debug and fix this:

## 🔧 **Debugging Steps**

### 1. **Check Browser Console**
Open your browser's Developer Tools (F12) and look for these debug messages:

#### **Login Debug Messages:**
```
=== LOGIN RESPONSE DEBUG ===
Full response data: {...}
User data: {...}
Token from response: ...
Final token to store: ...
```

#### **API Call Debug Messages:**
```
=== DEBUGGING AUTH ===
Token: ...
Is Authenticated: ...

=== TESTING DIRECT API CALL ===
Direct API Response Status: ...
Direct API Response Data: ...

🔍 Intercepting request for: ...
🔍 Is endpoint excluded: ...
🔍 Token found: ...
✅ Token added to headers: ...
```

### 2. **Check Session Storage**
In browser console, run:
```javascript
console.log('Token:', sessionStorage.getItem('token'));
console.log('Is Auth:', sessionStorage.getItem('isAuthenticated'));
console.log('User:', sessionStorage.getItem('user'));
```

### 3. **Test Direct API Call**
In browser console, run:
```javascript
// Test direct API call
fetch('http://202.53.92.35:5004/api/assets', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'x-access-token': sessionStorage.getItem('token')
  }
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();
})
.then(data => console.log('Data:', data))
.catch(error => console.error('Error:', error));
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: Token Not Stored After Login**
**Symptoms:** Token is null/undefined in sessionStorage
**Solutions:**
1. Check login response structure in console
2. Verify token path in response (data.user.token vs data.token)
3. Check if login endpoint returns token

### **Issue 2: Token Not Added to Headers**
**Symptoms:** API calls don't include x-access-token header
**Solutions:**
1. Check if endpoint is excluded from authentication
2. Verify auth interceptor is working
3. Check token format and validity

### **Issue 3: 258 Error**
**Symptoms:** HTTP 258 status code
**Solutions:**
1. Check if backend expects different header name
2. Verify token format (JWT vs simple string)
3. Check if backend is running and accessible

### **Issue 4: CORS Issues**
**Symptoms:** Network errors, CORS policy errors
**Solutions:**
1. Check if backend has CORS configured
2. Verify API base URL is correct
3. Check if backend is running on correct port

## 🔧 **Quick Fixes**

### **Fix 1: Update Token Header Name**
If backend expects different header name, update auth interceptor:
```javascript
// In src/utils/authInterceptor.js, line 82
headers['Authorization'] = `Bearer ${token}`; // Instead of x-access-token
```

### **Fix 2: Update Login Response Handling**
If token is in different location, update login:
```javascript
// In src/pages/Login.js, line 82
const token = data.token || data.access_token || data.user?.token;
```

### **Fix 3: Add More Debugging**
Add this to any component to debug:
```javascript
import { debugAuth, testApiCall } from '../utils/debugAuth';

// In component
useEffect(() => {
  debugAuth();
  testApiCall();
}, []);
```

## 📋 **Testing Checklist**

### **Login Test:**
- [ ] Login successful
- [ ] Token stored in sessionStorage
- [ ] User data stored
- [ ] Redirect to dashboard works

### **API Test:**
- [ ] Token retrieved from sessionStorage
- [ ] Token added to request headers
- [ ] API call successful (200 status)
- [ ] Data returned correctly

### **Error Handling Test:**
- [ ] Invalid token triggers logout
- [ ] 401/403 responses handled
- [ ] Network errors handled gracefully

## 🚀 **Next Steps**

1. **Run the application** and check browser console
2. **Login** and verify token is stored
3. **Navigate to Assets page** and check API calls
4. **Look for debug messages** in console
5. **Test direct API call** if needed

## 📞 **If Still Having Issues**

Please share:
1. **Browser console logs** (all debug messages)
2. **Network tab** in DevTools (API request/response)
3. **Session storage contents**
4. **Backend API documentation** (expected headers, response format)

The debugging code is now in place - run the app and check the console for detailed information about what's happening with authentication!
