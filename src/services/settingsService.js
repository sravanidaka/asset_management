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
    } else if (result.data && Array.isArray(result.data)) {
      data = result.data;
    } else if (result.success && Array.isArray(result.data)) {
      data = result.data;
    } else if (result.result && Array.isArray(result.result)) {
      data = result.result;
    } else if (result.items && Array.isArray(result.items)) {
      data = result.items;
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
  assetTypes: null,
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
  
  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.status_name || item.id || item.value || item.name,
    label: item.status_name || item.name || item.label || item.id,
    id: item.id || item.status_name_id,
    ...item
  }));

  if (useCache) {
    dropdownCache.statusNames = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Categories
 */
export const getCategories = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.categories) {
    return dropdownCache.categories;
  }

  const data = await makeApiCall('/settings/getCategoriesDropdown');
  
  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.category_name || item.name || item.id || item.value,
    label: item.category_name || item.name || item.label || item.id,
    id: item.id || item.category_id,
    ...item
  }));

  if (useCache) {
    dropdownCache.categories = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
};

/**
 * Fetch Locations
 */
export const getLocations = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.locations) {
    return dropdownCache.locations;
  }

  const data = await makeApiCall('/settings/getLocationsDropdown');
  
  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.location_name || item.name || item.id || item.value,
    label: item.location_name || item.name || item.label || item.id,
    id: item.id || item.location_id,
    ...item
  }));

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
  
  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.vendor_name || item.name || item.id || item.value,
    label: item.vendor_name || item.name || item.label || item.id,
    id: item.id || item.vendor_id,
    ...item
  }));

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
 * Fetch Asset IDs
 */
export const getAssetIds = async (useCache = true) => {
  if (useCache && isCacheValid() && dropdownCache.assetIds) {
    return dropdownCache.assetIds;
  }

  const data = await makeApiCall('/assets/dropdown/asset-ids');
  
  // Transform data to standard format
  const transformedData = data.map(item => ({
    value: item.asset_id || item.id || item.value,
    label: item.asset_id || item.name || item.label || item.id,
    id: item.id || item.asset_id,
    ...item
  }));

  if (useCache) {
    dropdownCache.assetIds = transformedData;
    dropdownCache.lastFetch = Date.now();
  }

  return transformedData;
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
  getAllDropdownData,
  refreshAllDropdownData,
  getSelectOptions,
  getHtmlSelectOptions,
  clearCache,
  isCacheValid
};
