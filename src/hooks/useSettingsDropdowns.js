/**
 * Custom Hook for Settings Dropdowns
 * Provides easy access to all settings dropdown data with loading states
 */

import { useState, useEffect, useCallback } from 'react';
import { 
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
  refreshAllDropdownData
} from '../services/settingsService';

export const useSettingsDropdowns = (autoFetch = true) => {
  const [dropdowns, setDropdowns] = useState({
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
  });

  const [loading, setLoading] = useState({
    statusTypes: false,
    statusNames: false,
    categories: false,
    locations: false,
    locationTypes: false,
    locationNames: false,
    vendorNames: false,
    assetNames: false,
    assetIds: false,
    assetTypes: false,
    all: false
  });

  const [errors, setErrors] = useState({});

  // Fetch individual dropdown
  const fetchDropdown = useCallback(async (type, fetchFunction) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: null }));

    try {
      const data = await fetchFunction();
      setDropdowns(prev => ({ ...prev, [type]: data }));
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setErrors(prev => ({ ...prev, [type]: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  // Fetch all dropdowns
  const fetchAllDropdowns = useCallback(async (useCache = true) => {
    setLoading(prev => ({ ...prev, all: true }));
    setErrors({});

    try {
      const data = await getAllDropdownData(useCache);
      setDropdowns(data);
    } catch (error) {
      console.error('Error fetching all dropdowns:', error);
      setErrors({ all: error.message });
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  }, []);

  // Refresh all dropdowns (clear cache)
  const refreshDropdowns = useCallback(async () => {
    await fetchAllDropdowns(false);
  }, [fetchAllDropdowns]);

  // Individual fetch functions
  const fetchStatusTypes = useCallback(() => 
    fetchDropdown('statusTypes', getStatusTypes), [fetchDropdown]);
  
  const fetchStatusNames = useCallback(() => 
    fetchDropdown('statusNames', getStatusNames), [fetchDropdown]);
  
  const fetchCategories = useCallback(() => 
    fetchDropdown('categories', getCategories), [fetchDropdown]);
  
  const fetchLocations = useCallback(() => 
    fetchDropdown('locations', getLocations), [fetchDropdown]);
  
  const fetchLocationTypes = useCallback(() => 
    fetchDropdown('locationTypes', getLocationTypes), [fetchDropdown]);
  
  const fetchLocationNames = useCallback(() => 
    fetchDropdown('locationNames', getLocationNames), [fetchDropdown]);
  
  const fetchVendorNames = useCallback(() => 
    fetchDropdown('vendorNames', getVendorNames), [fetchDropdown]);
  
  const fetchAssetNames = useCallback(() => 
    fetchDropdown('assetNames', getAssetNames), [fetchDropdown]);
  
  const fetchAssetIds = useCallback(() => 
    fetchDropdown('assetIds', getAssetIds), [fetchDropdown]);
  
  const fetchAssetTypes = useCallback(() => 
    fetchDropdown('assetTypes', getAssetTypes), [fetchDropdown]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchAllDropdowns();
    }
  }, [autoFetch, fetchAllDropdowns]);

  // Check if any dropdown is loading
  const isLoading = Object.values(loading).some(loadingState => loadingState);

  // Check if any dropdown has errors
  const hasErrors = Object.keys(errors).length > 0;

  return {
    // Data
    dropdowns,
    
    // Loading states
    loading,
    isLoading,
    
    // Errors
    errors,
    hasErrors,
    
    // Fetch functions
    fetchAllDropdowns,
    refreshDropdowns,
    fetchStatusTypes,
    fetchStatusNames,
    fetchCategories,
    fetchLocations,
    fetchLocationTypes,
    fetchLocationNames,
    fetchVendorNames,
    fetchAssetNames,
    fetchAssetIds,
    fetchAssetTypes,
    
    // Individual data access
    statusTypes: dropdowns.statusTypes,
    statusNames: dropdowns.statusNames,
    categories: dropdowns.categories,
    locations: dropdowns.locations,
    locationTypes: dropdowns.locationTypes,
    locationNames: dropdowns.locationNames,
    vendorNames: dropdowns.vendorNames,
    assetNames: dropdowns.assetNames,
    assetIds: dropdowns.assetIds,
    assetTypes: dropdowns.assetTypes,
    
    // Individual loading states
    loadingStatusTypes: loading.statusTypes,
    loadingStatusNames: loading.statusNames,
    loadingCategories: loading.categories,
    loadingLocations: loading.locations,
    loadingLocationTypes: loading.locationTypes,
    loadingLocationNames: loading.locationNames,
    loadingVendorNames: loading.vendorNames,
    loadingAssetNames: loading.assetNames,
    loadingAssetIds: loading.assetIds,
    loadingAssetTypes: loading.assetTypes,
    loadingAll: loading.all
  };
};

export default useSettingsDropdowns;
