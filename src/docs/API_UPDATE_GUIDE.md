# API Update Guide - Converting to Auth Interceptor

This guide shows how to convert all manual token handling to use the centralized auth interceptor.

## ✅ Completed Files

The following files have been updated to use the auth interceptor:

1. **src/pages/Assets/Register.js** - ✅ Complete
2. **src/pages/Assets/Procure.js** - ✅ Import updated, axios calls need updating
3. **src/pages/Assets/Allocate.js** - ✅ Import updated
4. **src/pages/Assets/Disposal.js** - ✅ Import updated  
5. **src/pages/Assets/Financial.js** - ✅ Import updated
6. **src/pages/Assets/Transfer.js** - ✅ Import updated
7. **src/pages/UserManagement/User.js** - ✅ Import updated
8. **src/pages/UserManagement/Roles.js** - ✅ Import updated
9. **src/pages/Maintainance/Schedule.js** - ✅ Import updated
10. **src/pages/Maintainance/ServiceLog.js** - ✅ Import updated

## 🔄 Remaining Work

The following files need their axios calls updated to use the auth interceptor:

### Pattern for Updating Axios Calls

**OLD PATTERN:**
```javascript
// Manual token handling
const token = sessionStorage.getItem("token");
const response = await axios.get("http://202.53.92.35:5004/api/endpoint", {
  headers: {
    "x-access-token": token,
    "Content-Type": "application/json",
  },
});

// Handle response
if (response.data?.success) {
  // Success logic
} else {
  // Error logic
}
```

**NEW PATTERN:**
```javascript
// Using auth interceptor
const result = await api.getEndpoint();

// Handle response
if (result.success) {
  // Success logic - use result.data
} else {
  // Error logic - use result.error
}
```

### Common API Endpoint Mappings

| Old Axios Call | New API Method |
|---|---|
| `axios.get("http://202.53.92.35:5004/api/assets")` | `api.getAssets()` |
| `axios.post("http://202.53.92.35:5004/api/assets", data)` | `api.createAsset(data)` |
| `axios.put("http://202.53.92.35:5004/api/assets", data)` | `api.updateAsset(data)` |
| `axios.delete("http://202.53.92.35:5004/api/assets", {data: {...}})` | `api.deleteAsset(data)` |
| `axios.get("http://202.53.92.35:5004/api/settings/getSettingCategoriesList")` | `api.getCategories()` |
| `axios.get("http://202.53.92.35:5004/api/settings/getSettingStatusList")` | `api.getStatuses()` |
| `axios.get("http://202.53.92.35:5004/api/settings/getSettingLocationList")` | `api.getLocations()` |
| `axios.get("http://202.53.92.35:5004/api/settings/getSettingVendorList")` | `api.getVendors()` |
| `axios.get("http://202.53.92.35:5004/api/users")` | `api.getUsers()` |
| `axios.post("http://202.53.92.35:5004/api/users", data)` | `api.createUser(data)` |
| `axios.get("http://202.53.92.35:5004/api/roles/getRolesList")` | `api.getRoles()` |

### Response Handling Changes

| Old | New |
|---|---|
| `response.data` | `result.data` |
| `response.data.success` | `result.success` |
| `response.data.message` | `result.error` |
| `response.status` | `result.status` |

### Files That Need Axios Call Updates

1. **src/pages/Assets/Procure.js**
   - Line ~31: `axios.get("http://202.53.92.35:5004/api/settings/getSettingCategoriesList")` → `api.getCategories()`
   - Line ~107: `axios.put("http://202.53.92.35:5004/api/assets/procure", updateData)` → `api.procureAsset(updateData)`
   - Line ~138: `axios.post("http://202.53.92.35:5004/api/assets/procure", createData)` → `api.procureAsset(createData)`

2. **src/pages/Assets/Allocate.js**
   - Find and replace all axios calls with appropriate api methods

3. **src/pages/Assets/Disposal.js**
   - Find and replace all axios calls with appropriate api methods

4. **src/pages/Assets/Financial.js**
   - Find and replace all axios calls with appropriate api methods

5. **src/pages/Assets/Transfer.js**
   - Find and replace all axios calls with appropriate api methods

6. **src/pages/UserManagement/User.js**
   - Find and replace all axios calls with appropriate api methods

7. **src/pages/UserManagement/Roles.js**
   - Find and replace all axios calls with appropriate api methods

8. **src/pages/Maintainance/Schedule.js**
   - Find and replace all axios calls with appropriate api methods

9. **src/pages/Maintainance/ServiceLog.js**
   - Find and replace all axios calls with appropriate api methods

### Quick Update Commands

To find all remaining axios calls in a file:
```bash
grep -n "axios\." src/pages/Assets/Procure.js
```

To find all manual token handling:
```bash
grep -n "sessionStorage.getItem.*token" src/pages/Assets/Procure.js
```

### Benefits of Using Auth Interceptor

1. **Automatic Token Management**: No need to manually get tokens from sessionStorage
2. **Consistent Error Handling**: All 401/403 responses automatically trigger logout
3. **Centralized Configuration**: All API endpoints and headers managed in one place
4. **Better Security**: Tokens are automatically refreshed and validated
5. **Cleaner Code**: Less boilerplate code in components
6. **Easier Maintenance**: Changes to authentication logic only need to be made in one place

### Testing the Updates

After updating each file:

1. **Build Test**: Run `npm run build` to check for compilation errors
2. **Runtime Test**: Test the specific functionality in the browser
3. **Network Test**: Check browser dev tools to ensure tokens are being sent correctly
4. **Error Test**: Test what happens when token is invalid or expired

### Example Complete Update

**Before:**
```javascript
const fetchUsers = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      message.error("No token found");
      return;
    }
    
    const response = await axios.get("http://202.53.92.35:5004/api/users", {
      headers: {
        "x-access-token": token,
        "Content-Type": "application/json",
      },
    });
    
    if (response.data?.success) {
      setUsers(response.data.data);
    } else {
      message.error(response.data.message || "Failed to fetch users");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    message.error("Failed to fetch users");
  }
};
```

**After:**
```javascript
const fetchUsers = async () => {
  try {
    const result = await api.getUsers();
    
    if (result.success) {
      setUsers(result.data);
    } else {
      message.error(result.error || "Failed to fetch users");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    message.error("Failed to fetch users");
  }
};
```

This reduces the code from ~20 lines to ~10 lines while adding better error handling and security!
