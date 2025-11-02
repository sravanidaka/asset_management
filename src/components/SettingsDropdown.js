/**
 * Reusable Settings Dropdown Component
 * Handles all settings dropdowns with loading states and error handling
 */

import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
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
  getAssetIdsDropdown,
  getAssetTypes,
  getRequestedBy,
  getEmployeeList,
  getDepreciationMethods
} from '../services/settingsService';

const { Option } = Select;

const SettingsDropdown = ({
  type, // 'statusTypes', 'statusNames', 'categories', 'locations', 'locationTypes', 'locationNames', 'vendorNames', 'assetNames', 'assetIds', 'assetTypes'
  placeholder = "Select option",
  loading = false,
  disabled = false,
  allowClear = true,
  showSearch = true,
  value,
  onChange,
  onBlur,
  style,
  className,
  size = "middle",
  mode, // 'multiple' for multi-select
  maxTagCount,
  ...props
}) => {
  const [options, setOptions] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState(null);

  // Map dropdown types to their respective fetch functions
  const fetchFunctions = {
    statusTypes: getStatusTypes,
    statusNames: getStatusNames,
    categories: getCategories,
    locations: getLocations,
    locationTypes: getLocationTypes,
    locationNames: getLocationNames,
    vendorNames: getVendorNames,
    assetNames: getAssetNames,
    assetIds: getAssetIds,
    assetIdsDropdown: getAssetIdsDropdown,
    assetTypes: getAssetTypes,
    requestedBy: getRequestedBy,
    employeeList: getEmployeeList,
    depreciationMethods: getDepreciationMethods
  };

  // Fetch dropdown data
  const fetchData = async () => {
    const fetchFunction = fetchFunctions[type];
    if (!fetchFunction) {
      console.error(`Invalid dropdown type: ${type}`);
      return;
    }

    setLoadingState(true);
    setError(null);

    try {
      const data = await fetchFunction();
      console.log(`📊 ${type} dropdown data received:`, data);
      console.log(`📊 ${type} dropdown data length:`, data?.length || 0);
      setOptions(data);
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(err.message);
      setOptions([]);
    } finally {
      setLoadingState(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [type]);

  // Handle option selection
  const handleChange = (selectedValue, option) => {
    if (onChange) {
      onChange(selectedValue, option);
    }
  };

  // Handle blur event
  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e);
    }
  };

  // Render loading state
  if (loadingState || loading) {
    return (
      <Select
        placeholder={placeholder}
        loading={true}
        disabled={disabled}
        style={style}
        className={className}
        size={size}
        mode={mode}
        maxTagCount={maxTagCount}
        {...props}
      >
        <Option value="" disabled>
          <Spin size="small" /> Loading...
        </Option>
      </Select>
    );
  }

  // Render error state
  if (error) {
    return (
      <Select
        placeholder={`Error loading ${type}`}
        disabled={true}
        style={style}
        className={className}
        size={size}
        mode={mode}
        maxTagCount={maxTagCount}
        {...props}
      >
        <Option value="" disabled>
          Error: {error}
        </Option>
      </Select>
    );
  }

  // Render normal dropdown
  return (
    <Select
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      loading={loadingState || loading}
      disabled={disabled}
      allowClear={allowClear}
      showSearch={showSearch}
      optionLabelProp="title"
      style={style}
      className={className}
      size={size}
      mode={mode}
      maxTagCount={maxTagCount}
      filterOption={(input, option) => {
        const child = option?.children;
        let textToSearch = '';
        if (typeof child === 'string') {
          textToSearch = child;
        } else if (Array.isArray(child)) {
          textToSearch = child.join(' ');
        } else if (child && typeof child === 'object' && 'props' in child) {
          // Attempt to extract nested text from React node
          const nested = child.props?.children;
          textToSearch = typeof nested === 'string' ? nested : '';
        }
        if (!textToSearch) {
          textToSearch = option?.title || option?.label || option?.value || '';
        }
        return String(textToSearch).toLowerCase().includes(String(input).toLowerCase());
      }}
      {...props}
    >
      {options.map((option, index) => {
        console.log(`🎯 Rendering option ${index}:`, option);
        // Use a combination of id and index to ensure unique keys
        const optionValue = option.id || option.value || option.cat_id || option.loc_id || option.location_id || option.state_id || option.district_id || option.role_id || option.user_id || option.asset_type_id;
        const optionLabel = option.label || option.name || option.value || option.cat_name || option.loc_name || option.location_name || option.state_name || option.district_name || option.role_name || option.user_name || option.asset_type_name;
        const uniqueKey = `${optionValue || index}_${index}`;
        return (
          <Option 
            key={uniqueKey} 
            value={optionValue} // Use ID as value
            title={optionLabel}
          >
            {optionLabel} {/* Display name as label */}
          </Option>
        );
      })}
    </Select>
  );
};

// Convenience components for each dropdown type
export const StatusTypesDropdown = (props) => (
  <SettingsDropdown type="statusTypes" placeholder="Select Status Type" {...props} />
);

export const StatusNamesDropdown = (props) => (
  <SettingsDropdown type="statusNames" placeholder="Select Status" {...props} />
);

export const CategoriesDropdown = (props) => (
  <SettingsDropdown type="categories" placeholder="Select Category" {...props} />
);

export const LocationsDropdown = (props) => (
  <SettingsDropdown type="locations" placeholder="Select Location" {...props} />
);

export const LocationTypesDropdown = (props) => (
  <SettingsDropdown type="locationTypes" placeholder="Select Location Type" {...props} />
);

export const LocationNamesDropdown = (props) => (
  <SettingsDropdown type="locationNames" placeholder="Select Location Name" {...props} />
);

export const VendorNamesDropdown = (props) => (
  <SettingsDropdown type="vendorNames" placeholder="Select Vendor Name" {...props} />
);

export const AssetNamesDropdown = (props) => (
  <SettingsDropdown type="assetNames" placeholder="Select Asset Name" {...props} />
);

export const AssetIdsDropdown = (props) => (
  <SettingsDropdown type="assetIds" placeholder="Select Asset ID" {...props} />
);

export const AssetIdsDropdownNew = (props) => (
  <SettingsDropdown type="assetIdsDropdown" placeholder="Select Asset ID" {...props} />
);

export const AssetTypesDropdown = (props) => (
  <SettingsDropdown type="assetTypes" placeholder="Select Asset Type" {...props} />
);

export const RequestedByDropdown = (props) => (
  <SettingsDropdown type="requestedBy" placeholder="Select Requested By" {...props} />
);

// UserNamesDropdown removed - use /api/users endpoint directly instead of /api/users/dropdown/user-names

export const EmployeeListDropdown = (props) => (
  <SettingsDropdown type="employeeList" placeholder="Select Employee" {...props} />
);

export const DepreciationMethodsDropdown = (props) => (
  <SettingsDropdown type="depreciationMethods" placeholder="Select Depreciation Method" {...props} />
);

export default SettingsDropdown;
