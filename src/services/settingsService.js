/**
 * Settings Service - Handles all dropdown data from settings APIs
 * 
 * Settings APIs:
 * - GET /api/settings/getStatusTypesDropdown - Status Types
 * - GET /api/settings/getStatusNamesDropdown - Status Names  
 * - GET /api/settings/getCategoriesDropdown - Categories
 * - GET /api/settings/getLocationsDropdown - Locations
 * - GET /api/settings/getLocationTypesDropdown - Location Types
 * - GET /api/settings/getLocationNamesDropdown - Location Names
 * - GET /api/settings/getVendorNamesDropdown - Vendor Names
 * 
 * Asset APIs:
 * - GET /api/assets/dropdown/asset-names - Asset Names
 * - GET /api/assets/dropdown/asset-ids - Asset IDs
 * - GET /api/assets/dropdown/asset-types - Asset Types
 */

const API_BASE_URL = 'http://202.53.92.35:5004/api';

// Helper function to get auth token
const getAuthToken = () => {
  return sessionStorage.getItem('token') || '';
};

// Helper function to make API calls
const makeApiCall = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': getAuthToken(),
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`API Response for ${endpoint}:`, result);

    // Handle different response structures
    let data = [];
    if (Array.isArray(result)) {
      data = result;
    } else if (result.generated_codes && Array.isArray(result.generated_codes)) {
      data = result.generated_codes;
      console.log(`📊 Found generated_codes array with ${data.length} items`);
    } else if (result.data && Array.isArray(result.data)) {
      data = result.data;
    } else if (result.data && typeof result.data === 'object') {
      // Handle nested arrays under data
      const nested = result.data;
      if (Array.isArray(nested.items)) {
        data = nested.items;
      } else if (Array.isArray(nested.result)) {
        data = nested.result;
      } else if (Array.isArray(nested.employees)) {
        data = nested.employees;
      } else if (Array.isArray(nested.employeeList)) {
        data = nested.employeeList;
      } else if (Array.isArray(nested.employeesList)) {
        data = nested.employeesList;
      } else if (Array.isArray(nested.employee_list)) {
        data = nested.employee_list;
      } else if (Array.isArray(nested.employees_list)) {
        data = nested.employees_list;
      }
    } else if (result.success && Array.isArray(result.data)) {
      data = result.data;
    } else if (result.result && Array.isArray(result.result)) {
      data = result.result;
    } else if (result.items && Array.isArray(result.items)) {
      data = result.items;
    } else if (result.employees && Array.isArray(result.employees)) {
      // Handle employees list shape
      data = result.employees;
    } else if (result.employeesList && Array.isArray(result.employeesList)) {
      data = result.employeesList;
    } else if (result.employeeList && Array.isArray(result.employeeList)) {
      data = result.employeeList;
    } else if (result.employees_list && Array.isArray(result.employees_list)) {
      data = result.employees_list;
    } else if (result.employee_list && Array.isArray(result.employee_list)) {
      data = result.employee_list;
    } else {
      console.warn(`Unexpected response structure for ${endpoint}:`, result);
      data = [];
    }

    return data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    return [];
  }
};

// Cache for dropdown data
let dropdownCache = {
  statusTypes: null,
  statusNames: null,
  categories: null,
  locations: null,
  locationTypes: null,
  locationNames: null,
  vendorNames: null,
  assetNames: null,
  assetIds: null,
  assetIdsDropdown: null,
  assetTypes: null,
  employeeList: null,
  depreciationMethods: null,
  lastFetch: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

// Check if cache is valid
const isCacheValid = () => {
  if (!dropdownCache.lastFetch) return false;
  return Date.now() - dropdownCache.lastFetch < dropdownCache.cacheExpiry;
};

// Clear cache
const clearCache = () => {
  dropdownCache = {
    statusTypes: null,
    statusNames: null,
    categories: null,
    locations: null,
    locationTypes: null,
    locationNames: null,
    vendorNames: null,
    assetNames: null,
    assetIds: null,
    assetTypes: null,
    depreciationMethods: null,
    lastFetch: null,
    cacheExpiry: 5 * 60 * 1000,
  };
};

/**
 * Fetch Status Types
 */
export const getStatusTypes = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.statusTypes) {
    return dropdownCache.statusTypes;
  }

  const data = await makeApiCall('/settings/getStatusTypesDropdown');

  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.status_type || item.id || item.value || item.name,
    label: item.status_type || item.name || item.label || item.id,
    id: item.id || item.status_type_id,
    ...item
  }));

  if (useCache) {
    dropdownCache.statusTypes = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Status Names
 */
export const getStatusNames = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.statusNames) {
    return dropdownCache.statusNames;
  }

  const data = await makeApiCall('/settings/getStatusNamesDropdown');

  // Transform data to standard format - ID as value, name as label
  const transformedData = data.map(item => {
    // Extract ID and name from various possible field names
    const id = item.id || item.status_name_id || item.value;
    const name = item.status_name || item.name || item.label;

    return {
      value: id, // Use ID as value for form submission
      label: name, // Use name as display label
      id: id,
      name: name, // Store name for display
      ...item
    };
  });

  if (useCache) {
    dropdownCache.statusNames = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Categories
 */
export const getCategories = async (useCache = false) => { // Force fresh fetch to get updated structure
  if (useCache && isCacheValid() && dropdownCache.categories) {
    return dropdownCache.categories;
  }

  const data = await makeApiCall('/settings/getCategoriesDropdown');

  // Transform data to standard format - ID as value, name as label
  const transformedData = data.map(item => {
    // Extract ID and name from various possible field names
    const id = item.id || item.category_id || item.value;
    const name = item.category_name || item.name || item.label;

    return {
      value: id, // Use ID as value for form submission
      label: name, // Use name as display label
      id: id,
      name: name, // Store name for display
      ...item
    };
  });

  if (useCache) {
    dropdownCache.categories = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Locations
 */
export const getLocations = async (useCache = false) => { // Force fresh fetch to get updated structure
  if (useCache && isCacheValid() && dropdownCache.locations) {
    return dropdownCache.locations;
  }

  const data = await makeApiCall('/settings/getLocationsDropdown');

  // Transform data to standard format - ID as value, name as label
  const transformedData = data.map(item => {
    // Extract ID and name from various possible field names
    const id = item.id || item.location_id || item.value;
    const name = item.location_name || item.name || item.label;

    return {
      value: id, // Use ID as value for form submission
      label: name, // Use name as display label
      id: id,
      name: name, // Store name for display
      ...item
    };
  });

  if (useCache) {
    dropdownCache.locations = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Location Types
 */
export const getLocationTypes = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.locationTypes) {
    return dropdownCache.locationTypes;
  }

  const data = await makeApiCall('/settings/getLocationTypesDropdown');

  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.location_type || item.type || item.name || item.id || item.value,
    label: item.location_type || item.type || item.name || item.label || item.id,
    id: item.id || item.location_type_id,
    ...item
  }));

  if (useCache) {
    dropdownCache.locationTypes = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Location Names
 */
export const getLocationNames = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.locationNames) {
    return dropdownCache.locationNames;
  }

  const data = await makeApiCall('/settings/getLocationNamesDropdown');

  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.location_name || item.name || item.id || item.value,
    label: item.location_name || item.name || item.label || item.id,
    id: item.id || item.location_name_id,
    ...item
  }));

  if (useCache) {
    dropdownCache.locationNames = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Vendor Names
 */
export const getVendorNames = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.vendorNames) {
    return dropdownCache.vendorNames;
  }

  const data = await makeApiCall('/settings/getVendorNamesDropdown');

  // Transform data to standard format - ID as value, name as label
  const transformedData = data.map(item => {
    // Extract ID and name from various possible field names
    const id = item.id || item.vendor_id || item.value;
    const name = item.vendor_name || item.name || item.label;

    return {
      value: id, // Use ID as value for form submission
      label: name, // Use name as display label
      id: id,
      name: name, // Store name for display
      ...item
    };
  });

  if (useCache) {
    dropdownCache.vendorNames = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Asset Names
 */
export const getAssetNames = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.assetNames) {
    return dropdownCache.assetNames;
  }

  const data = await makeApiCall('/assets/dropdown/asset-names');

  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.asset_name || item.name || item.id || item.value,
    label: item.asset_name || item.name || item.label || item.id,
    id: item.id || item.asset_name_id,
    ...item
  }));

  if (useCache) {
    dropdownCache.assetNames = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Asset IDs from generated-codes API
 */
export const getAssetIds = async (useCache = false) => {
  // Force fresh fetch for debugging
  console.log('🔄 Force fetching fresh asset IDs from /assets/generated-codes API...');

  // Clear cache to ensure fresh data
  dropdownCache.assetIds = null;

  console.log('Fetching asset IDs from /assets/generated-codes API...');
  const data = await makeApiCall('/assets/generated-codes');
  console.log('📊 Processed asset IDs data:', data);

  // Transform data to standard format
  const transformedData = data.map((item, index) => {
    const assetId = item.generated_asset_id || item.asset_id || item.id;
    const displayId = assetId ? assetId.toString() : assetId;

    console.log(`🔍 Processing item ${index}:`, {
      original: item,
      assetId: assetId,
      displayId: displayId
    });

    const result = {
      value: displayId,
      label: displayId,
      id: item.allocation_id || item.id || item.asset_id, // Use allocation_id for unique keys
      ...item
    };

    console.log(`🎯 Transformed item ${index}:`, result);
    return result;
  });

  console.log('Transformed asset IDs data:', transformedData);

  if (useCache) {
    dropdownCache.assetIds = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Asset IDs from dropdown API
 */
export const getAssetIdsDropdown = async (useCache = false) => {
  // Force fresh fetch every time for debugging
  console.log('🔄 Fetching fresh asset IDs from /assets/dropdown/asset-ids API...');
  const data = await makeApiCall('/assets/dropdown/asset-ids');
  console.log('📊 Raw asset IDs dropdown data:', data);

  // Transform data to standard format - remove ASSET- prefix if it exists
  const transformedData = data.map(item => {
    const rawAssetId = item.asset_id || item.id || item.value;
    console.log('🔍 Processing item:', item);
    console.log('🔍 Raw asset ID:', rawAssetId, 'Type:', typeof rawAssetId);

    // Remove ASSET- prefix if it exists
    let displayAssetId = rawAssetId;
    if (rawAssetId && typeof rawAssetId === 'string') {
      if (rawAssetId.startsWith('ASSET-')) {
        displayAssetId = rawAssetId.substring(6); // Remove first 6 characters "ASSET-"
        console.log('✂️ Removed ASSET- prefix:', rawAssetId, '->', displayAssetId);
      } else {
        console.log('✅ No ASSET- prefix found, keeping as is:', displayAssetId);
      }
    }

    const result = {
      ...item, // Spread original item first
      value: displayAssetId, // Override with cleaned value
      label: displayAssetId, // Override with cleaned label
      id: item.id || item.asset_id
    };

    console.log('🎯 Final transformed item:', result);
    return result;
  });

  console.log('Transformed asset IDs dropdown data:', transformedData);

  if (useCache) {
    dropdownCache.assetIdsDropdown = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Get employee list for approver dropdown
 */
export const getEmployeeList = async (useCache = false) => {
  console.log('🔄 Fetching employee list from /settings/getEmployeesList API...');
  const data = await makeApiCall('/settings/getEmployeesList');
  console.log('📊 Raw employee list data:', data);

  const transformedData = (Array.isArray(data) ? data : []).map(item => {
    // Extract name with robust fallbacks
    const firstName = item.first_name || item.firstname || item.firstName || '';
    const lastName = item.last_name || item.lastname || item.lastName || '';
    const combined = `${firstName} ${lastName}`.trim();
    const employeeName = combined || item.employee_name || item.full_name || item.fullName || item.name || item.username || item.label || String(item.value || '').trim();

    // Extract ID with robust fallbacks
    const employeeId = item.employee_id || item.emp_id || item.user_id || item.id || item.value;

    const result = {
      ...item,
      value: employeeId || employeeName,
      label: employeeName || String(employeeId || ''),
      id: employeeId || employeeName
    };
    return result;
  });

  console.log('Transformed employee list data:', transformedData);

  if (useCache) {
    dropdownCache.employeeList = transformedData;
    dropdownCache.lastFetch = Date.now();
  }
  return transformedData;
};

/**
 * Get employee names dropdown (ID + Name) for approver selection
 */
export const getEmployeeNamesDropdown = async (useCache = false) => {
  console.log('🔄 Fetching employee names from /settings/getEmployeeNamesDropdown API...');
  const data = await makeApiCall('/settings/getEmployeeNamesDropdown');
  console.log('📊 Raw employee names data:', data);

  const transformedData = (Array.isArray(data) ? data : []).map(item => {
    // If API returns an array of strings, map directly
    if (typeof item === 'string') {
      const nameStr = item.trim();
      return { id: nameStr, value: nameStr, label: nameStr };
    }
    if (typeof item === 'number') {
      // Not ideal, but keep number as both id and label if no name provided
      const asString = String(item);
      return { id: asString, value: asString, label: asString };
    }
    // Prefer explicit name fields, fallback to first/last
    const firstName = item.first_name || item.firstname || item.firstName || '';
    const lastName = item.last_name || item.lastname || item.lastName || '';
    const combined = `${firstName} ${lastName}`.trim();
    const name = item.employee_name || item.full_name || item.fullName || item.name || combined || String(item.label || item.value || '').trim();

    const id = item.id || item.employee_id || item.emp_id || item.user_id || item.value;

    return {
      ...item,
      value: id,
      label: name,
      id
    };
  });

  return transformedData;
};

/**
 * Get employee IDs dropdown used for Transfer ID selection
 */
export const getEmployeeIdsDropdown = async (useCache = false) => {
  console.log('🔄 Fetching employee IDs from /settings/getEmployeeIdsDropdown API...');
  const data = await makeApiCall('/settings/getEmployeeIdsDropdown');
  console.log('📊 Raw employee IDs data:', data);

  const transformed = (Array.isArray(data) ? data : []).map((item, index) => {
    if (typeof item === 'string' || typeof item === 'number') {
      const idStr = String(item).trim();
      return { id: idStr, value: idStr, label: idStr };
    }
    const id = item.id || item.employee_id || item.emp_id || item.value || item.transfer_id || index;
    return { ...item, id, value: String(id), label: String(item.label || item.name || id) };
  });

  return transformed;
};

/**
 * Fetch Asset Types
 */
export const getAssetTypes = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.assetTypes) {
    return dropdownCache.assetTypes;
  }

  const data = await makeApiCall('/assets/dropdown/asset-types');

  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.asset_type || item.type || item.name || item.id || item.value,
    label: item.asset_type || item.type || item.name || item.label || item.id,
    id: item.id || item.asset_type_id,
    ...item
  }));

  if (useCache) {
    dropdownCache.assetTypes = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch all dropdown data at once
 */
export const getAllDropdownData = async (useCache = true) => {
  try {
    const [
      statusTypes,
      statusNames,
      categories,
      locations,
      locationTypes,
      locationNames,
      vendorNames,
      assetNames,
      assetIds,
      assetTypes
    ] = await Promise.all([
      getStatusTypes(useCache),
      getStatusNames(useCache),
      getCategories(useCache),
      getLocations(useCache),
      getLocationTypes(useCache),
      getLocationNames(useCache),
      getVendorNames(useCache),
      getAssetNames(useCache),
      getAssetIds(useCache),
      getAssetTypes(useCache)
    ]);

    return {
      statusTypes,
      statusNames,
      categories,
      locations,
      locationTypes,
      locationNames,
      vendorNames,
      assetNames,
      assetIds,
      assetTypes
    };
  } catch (error) {
    console.error('Error fetching all dropdown data:', error);
    return {
      statusTypes: [],
      statusNames: [],
      categories: [],
      locations: [],
      locationTypes: [],
      locationNames: [],
      vendorNames: [],
      assetNames: [],
      assetIds: [],
      assetTypes: []
    };
  }
};

/**
 * Refresh all dropdown data (clear cache and fetch fresh)
 */
export const refreshAllDropdownData = async () => {
  clearCache();
  return await getAllDropdownData(false);
};

/**
 * Get dropdown options for Select components
 */
export const getSelectOptions = (data, placeholder = "Select option") => {
  if (!Array.isArray(data) || data.length === 0) {
    return [{ value: '', label: placeholder, disabled: true }];
  }

  return data.map(item => ({
    value: item.value || item.id,
    label: item.label || item.name,
    ...item
  }));
};

/**
 * Get requested-by dropdown data
 */
export const getRequestedBy = async () => {
  try {
    const data = await makeApiCall('/assets/dropdown/requested-by');

    // Transform data to standard format
    const transformedData = data.map(item => ({
      value: item.id || item.name || item.value,
      label: item.name || item.label || item.value,
      key: item.id || item.name || item.value,
      ...item
    }));

    console.log('Requested-by data transformed:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching requested-by data:', error);
    // Return fallback data
    return [
      { value: 'john_doe', label: 'John Doe', key: 'john_doe' },
      { value: 'jane_smith', label: 'Jane Smith', key: 'jane_smith' },
      { value: 'mike_johnson', label: 'Mike Johnson', key: 'mike_johnson' },
      { value: 'sarah_wilson', label: 'Sarah Wilson', key: 'sarah_wilson' },
      { value: 'david_brown', label: 'David Brown', key: 'david_brown' }
    ];
  }
};

/**
 * Get depreciation methods dropdown data
 */
export const getDepreciationMethods = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.depreciationMethods) {
    return dropdownCache.depreciationMethods;
  }

  const data = await makeApiCall('/settings/getDepreciationMethodsDropdown');

  // Transform data to standard format - ID as value, name as label
  const transformedData = data.map(item => {
    // Extract ID and name from various possible field names
    const id = item.id || item.method_id || item.value;
    const name = item.method_name || item.name || item.label;

    return {
      value: id, // Use ID as value for form submission
      label: name, // Use name as display label
      id: id,
      name: name, // Store name for display
      ...item
    };
  });

  if (useCache) {
    dropdownCache.depreciationMethods = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};


/**
 * Get dropdown options for HTML select elements
 */
export const getHtmlSelectOptions = (data, placeholder = "Select option") => {
  if (!Array.isArray(data) || data.length === 0) {
    return [{ value: '', text: placeholder, disabled: true }];
  }

  return data.map(item => ({
    value: item.value || item.id,
    text: item.label || item.name,
    ...item
  }));
};

// Export cache management functions
export { clearCache, isCacheValid };

export default {
  getStatusTypes,
  getStatusNames,
  getCategories,
  getLocations,
  getLocationTypes,
  getLocationNames,
  getVendorNames,
  getAssetNames,
  getAssetIds,
  getAssetTypes,
  getRequestedBy,
  getDepreciationMethods,
  getEmployeeNamesDropdown,
  getEmployeeIdsDropdown,
  getAllDropdownData,
  refreshAllDropdownData,
  getSelectOptions,
  getHtmlSelectOptions,
  clearCache,
  isCacheValid
};
