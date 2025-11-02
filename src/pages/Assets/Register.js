import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import { FaSearch, FaEdit, FaTrash, FaEye, FaCalendarAlt, FaUpload } from "react-icons/fa";
import CustomBreadcrumb from '../../components/Breadcrumb';
import BackNavigation from '../../components/BackNavigation';
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  message,
  Popconfirm,
  Table,
  DatePicker,
  Upload,
  Modal,
  Spin,
  Card,
} from "antd";
import { SearchOutlined, PlusOutlined, DownloadOutlined, UploadOutlined, InboxOutlined, InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, FileTextOutlined, CloudDownloadOutlined, CloudUploadOutlined, FileTextOutlined as FileTextIcon, ToolOutlined, EnvironmentOutlined, DollarOutlined, CalendarOutlined, BarChartOutlined, FileOutlined } from "@ant-design/icons";
import { api } from '../../config/api';
import { isValidDate, isDateInFuture, isDateInPast, isDateBefore, formatDateForDisplay } from '../../utils/dateUtils';
import { formatDateForDB, parseDateFromDB } from "../../utils/dateUtils";
import ExportButton from '../../components/ExportButton';
import { safeStringCompare } from '../../utils/tableUtils';
import { autoGenerateAssetId, validateAssetId, generateAssetId } from '../../utils/assetIdUtils';
import { getCategories, getLocations, getAssetNames, getAssetIds, getVendorNames, getDepreciationMethods, getStatusNames } from '../../services/settingsService';
import { 
  StatusNamesDropdown,
  CategoriesDropdown,
  LocationsDropdown,
  LocationTypesDropdown,
  LocationNamesDropdown,
  AssetIdsDropdown,
  VendorNamesDropdown,
  DepreciationMethodsDropdown
} from '../../components/SettingsDropdown';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Register = () => {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [bulkUploadVisible, setBulkUploadVisible] = useState(false);
  const [bulkUploadDrawerVisible, setBulkUploadDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingAsset, setEditingAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [assetNames, setAssetNames] = useState([]);
  const [assetIds, setAssetIds] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [depreciationMethods, setDepreciationMethods] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [fileList, setFileList] = useState({
    invoice_receipt: [],
    ownership_proof: [],
    insurance_policy: [],
    lease_agreements: []
  });
  const [assetIdStatus, setAssetIdStatus] = useState(null);
  const [assetCodeStatus, setAssetCodeStatus] = useState(null); // 'available' | 'duplicate' | 'validating'
  const [serialNumberStatus, setSerialNumberStatus] = useState(null); // 'available', 'duplicate', 'validating'
  const [assetDetailsVisible, setAssetDetailsVisible] = useState(false);
  const [assetDetails, setAssetDetails] = useState(null);
  const [loadingAssetDetails, setLoadingAssetDetails] = useState(false);
  const [warrantyPeriodCalculated, setWarrantyPeriodCalculated] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [statusNames, setStatusNames] = useState([]);

  // Helper functions to map IDs to names for display
  const getCategoryNameById = (categoryId) => {
    console.log('🔍 getCategoryNameById called with:', categoryId, 'categories:', categories);
    if (!categoryId || !categories.length) return categoryId;
    const category = categories.find(cat => 
      cat.id === categoryId ||
      cat.value === categoryId ||
      cat.cat_id === categoryId ||
      String(cat.cat_id) === String(categoryId)
    );
    console.log('🔍 Found category:', category);
    return category ? (category.name || category.label || category.cat_name) : categoryId;
  };

  const getLocationNameById = (locationId) => {
    console.log('🔍 getLocationNameById called with:', locationId, 'locations:', locations);
    if (!locationId || !locations.length) return locationId;
    const location = locations.find(loc => 
      loc.id === locationId || 
      loc.value === locationId ||
      loc.loc_id === locationId ||
      loc.location_id === locationId ||
      String(loc.loc_id) === String(locationId) ||
      String(loc.location_id) === String(locationId)
    );
    console.log('🔍 Found location:', location);
    return location ? (location.name || location.label || location.loc_name || location.location_name) : locationId;
  };

  const getUserNameById = (userId) => {
    console.log('🔍 getUserNameById called with:', userId, 'users:', users);
    if (!userId || !users.length) return userId;
    const user = users.find(u => u.id === userId || u.value === userId);
    console.log('🔍 Found user:', user);
    return user ? user.name || user.label : userId;
  };

  // Map asset type id/code to display name
  const getAssetTypeNameById = (typeId) => {
    console.log('🔍 getAssetTypeNameById called with:', typeId, 'assetTypes:', assetTypes);
    if (typeId === undefined || typeId === null || assetTypes.length === 0) return typeId;
    const typeObj = assetTypes.find(t => t.id === typeId || t.value === typeId || t.asset_type_id === typeId);
    return typeObj ? (typeObj.name || typeObj.label || typeObj.asset_type_name) : typeId;
  };

  // Function to calculate warranty period in months
  const calculateWarrantyPeriod = (startDate, expiryDate) => {
    if (!startDate || !expiryDate) return null;
    
    try {
      const start = dayjs(startDate);
      const expiry = dayjs(expiryDate);
      
      if (expiry.isBefore(start)) {
        return null; // Invalid date range
      }
      
      const months = expiry.diff(start, 'month', true);
      return Math.round(months);
    } catch (error) {
      console.error('Error calculating warranty period:', error);
      return null;
    }
  };

  // Function to calculate warranty expiry date from start date and period
  const calculateWarrantyExpiryDate = (startDate, periodMonths) => {
    if (!startDate || !periodMonths || periodMonths <= 0) return null;
    
    try {
      const start = dayjs(startDate);
      const expiry = start.add(periodMonths, 'month');
      return expiry;
    } catch (error) {
      console.error('Error calculating warranty expiry date:', error);
      return null;
    }
  };

  // Handle warranty start date change
  const handleWarrantyStartDateChange = (date) => {
    const warrantyExpiry = form.getFieldValue('warranty_expiry');
    const warrantyPeriod = form.getFieldValue('warranty_period');
    
    if (date && warrantyExpiry) {
      // Calculate period from start and expiry dates
      const period = calculateWarrantyPeriod(date, warrantyExpiry);
      if (period !== null && period > 0) {
        form.setFieldValue('warranty_period', period);
        setWarrantyPeriodCalculated(true);
        message.success(`Warranty period automatically calculated: ${period} months`);
      } else {
        message.warning('Invalid date range: Expiry date should be after start date');
      }
    } else if (date && warrantyPeriod && warrantyPeriod > 0) {
      // Calculate expiry date from start date and period
      const expiryDate = calculateWarrantyExpiryDate(date, warrantyPeriod);
      if (expiryDate) {
        form.setFieldValue('warranty_expiry', expiryDate);
        message.success(`Warranty expiry date automatically calculated: ${expiryDate.format('DD-MM-YYYY')}`);
      }
    }
  };

  // Handle warranty expiry date change
  const handleWarrantyExpiryDateChange = (date) => {
    const warrantyStart = form.getFieldValue('warranty_start_date');
    if (date && warrantyStart) {
      const period = calculateWarrantyPeriod(warrantyStart, date);
      if (period !== null && period > 0) {
        form.setFieldValue('warranty_period', period);
        setWarrantyPeriodCalculated(true);
        message.success(`Warranty period automatically calculated: ${period} months`);
      } else {
        message.warning('Invalid date range: Expiry date should be after start date');
      }
    }
  };

  // File upload handlers
  const handleFileChange = (fileType, info) => {
    let newFileList = [...info.fileList];
    
    // Limit to 5 files per type
    newFileList = newFileList.slice(-5);
    
    // Update file list state
    setFileList(prev => ({
      ...prev,
      [fileType]: newFileList
    }));
    
    // Update form field
    form.setFieldValue(fileType, newFileList);
  };

  const handleFileRemove = (fileType, file) => {
    const newFileList = fileList[fileType].filter(item => item.uid !== file.uid);
    setFileList(prev => ({
      ...prev,
      [fileType]: newFileList
    }));
    form.setFieldValue(fileType, newFileList);
  };

  const beforeUpload = (file) => {
    const isValidType = file.type === 'image/jpeg' || 
                       file.type === 'image/png' || 
                       file.type === 'application/pdf' ||
                       file.type === 'application/msword' ||
                       file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    if (!isValidType) {
      message.error('You can only upload JPG/PNG/PDF/DOC/DOCX files!');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File must be smaller than 10MB!');
      return false;
    }
    
    return false; // Prevent auto upload
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Add progress tracking
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`File conversion progress: ${percentComplete.toFixed(2)}%`);
        }
      };
      
      reader.onload = () => {
        const result = reader.result;
        console.log(`File converted to base64: ${file.name}, Size: ${result.length} characters`);
        resolve(result);
      };
      
      reader.onerror = (error) => {
        console.error('Error converting file to base64:', error);
        reject(error);
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
    });
  };

  // Utility function to validate base64 data
  const validateBase64 = (base64String) => {
    if (!base64String || typeof base64String !== 'string') {
      return false;
    }
    
    // Check if it's a valid base64 string
    const base64Regex = /^data:([A-Za-z0-9+/]+);base64,(.+)$/;
    const match = base64String.match(base64Regex);
    
    if (!match) {
      return false;
    }
    
    const mimeType = match[1];
    const base64Data = match[2];
    
    // Validate base64 data
    try {
      atob(base64Data);
      return {
        isValid: true,
        mimeType: mimeType,
        dataSize: base64Data.length
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid base64 data'
      };
    }
  };

  // Utility function to get file size in human readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Utility function to get base64 size in human readable format
  const formatBase64Size = (base64String) => {
    if (!base64String) return '0 Bytes';
    const base64Data = base64String.split(',')[1] || base64String;
    const sizeInBytes = (base64Data.length * 3) / 4;
    return formatFileSize(sizeInBytes);
  };

  // Function to preview base64 file (for images)
  const previewBase64File = (base64String, fileName) => {
    if (!base64String) return null;
    
    const validation = validateBase64(base64String);
    if (!validation.isValid) return null;
    
    // Check if it's an image
    if (validation.mimeType.startsWith('image/')) {
      return {
        type: 'image',
        src: base64String,
        fileName: fileName,
        mimeType: validation.mimeType
      };
    }
    
    // For non-image files, return file info
    return {
      type: 'file',
      fileName: fileName,
      mimeType: validation.mimeType,
      size: formatBase64Size(base64String)
    };
  };

  const processFilesForAPI = async (fileList) => {
    const processedFiles = [];
    
    if (!fileList || fileList.length === 0) {
      console.log('No files to process');
      return processedFiles;
    }
    
    console.log(`Processing ${fileList.length} files for API submission`);
    
    for (const file of fileList) {
      if (file.originFileObj) {
        try {
          console.log(`Converting file: ${file.name} (${(file.originFileObj.size / 1024 / 1024).toFixed(2)} MB)`);
          
          const base64 = await convertFileToBase64(file.originFileObj);
          
          // Validate the base64 data
          const validation = validateBase64(base64);
          if (!validation.isValid) {
            console.error(`Invalid base64 data for file: ${file.name}`, validation.error);
            message.error(`Invalid file data: ${file.name}`);
            continue;
          }
          
          // Create the file object with proper structure
          const processedFile = {
            [file.name]: base64,
            attachment_name: file.name,
            file_size: file.originFileObj.size,
            file_type: file.originFileObj.type,
            mime_type: validation.mimeType,
            base64_size: validation.dataSize,
            upload_date: new Date().toISOString()
          };
          
          processedFiles.push(processedFile);
          console.log(`Successfully processed file: ${file.name} (Base64 size: ${validation.dataSize} chars)`);
          
        } catch (error) {
          console.error(`Error converting file ${file.name} to base64:`, error);
          message.error(`Failed to process file: ${file.name}`);
        }
      } else {
        console.warn(`File ${file.name} has no originFileObj, skipping`);
      }
    }
    
    console.log(`Successfully processed ${processedFiles.length} out of ${fileList.length} files`);
    return processedFiles;
  };

  // Fetch categories from API using settings service
  const fetchCategories = async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
      console.log("Categories loaded successfully:", categoriesData.length, "items");
    } catch (error) {
      console.error("Error fetching categories:", error);
      
      // Fallback to default categories on error
      const defaultCategories = [
        { category_name: "IT Equipment", category_id: "IT", value: "IT Equipment", label: "IT Equipment" },
        { category_name: "Office Furniture", category_id: "FURNITURE", value: "Office Furniture", label: "Office Furniture" },
        { category_name: "Vehicles", category_id: "VEHICLES", value: "Vehicles", label: "Vehicles" },
        { category_name: "Machinery", category_id: "MACHINERY", value: "Machinery", label: "Machinery" },
        { category_name: "Tools", category_id: "TOOLS", value: "Tools", label: "Tools" },
        { category_name: "Security Equipment", category_id: "SECURITY", value: "Security Equipment", label: "Security Equipment" },
        { category_name: "Medical Equipment", category_id: "MEDICAL", value: "Medical Equipment", label: "Medical Equipment" },
        { category_name: "Other", category_id: "OTHER", value: "Other", label: "Other" }
      ];
      setCategories(defaultCategories);
    }
  };

  // Fetch asset names from API
  const fetchAssetNames = async () => {
    try {
      const assetNamesData = await getAssetNames();
      setAssetNames(assetNamesData);
      console.log("Asset names loaded successfully:", assetNamesData.length, "items");
    } catch (error) {
      console.error("Error fetching asset names:", error);
      setAssetNames([]);
    }
  };

  // Fetch asset IDs from API
  const fetchAssetIds = async () => {
    try {
      const assetIdsData = await getAssetIds();
      setAssetIds(assetIdsData);
      console.log("Asset IDs loaded successfully:", assetIdsData.length, "items");
    } catch (error) {
      console.error("Error fetching asset IDs:", error);
      setAssetIds([]);
    }
  };

  // Fetch vendor names from API
  const fetchVendorNames = async () => {
    try {
      const vendorNamesData = await getVendorNames();
      setVendorNames(vendorNamesData);
      console.log("Vendor names loaded successfully:", vendorNamesData.length, "items");
    } catch (error) {
      console.error("Error fetching vendor names:", error);
      setVendorNames([]);
    }
  };

  // Fetch states from API (reusing endpoints from ManageEmployee)
  const fetchStates = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://202.53.92.35:5004/api/settings/getStatesList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token,
        }
      });
      const result = await response.json();
      let data = [];
      if (Array.isArray(result)) data = result; else if (result.data && Array.isArray(result.data)) data = result.data; else if (result.states && Array.isArray(result.states)) data = result.states; else if (result.result && Array.isArray(result.result)) data = result.result; else if (result.items && Array.isArray(result.items)) data = result.items;
      setStates(data);
    } catch (error) {
      console.error('Error fetching states:', error);
      setStates([]);
    }
  };

  // Fetch districts from API
  const fetchDistricts = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://202.53.92.35:5004/api/settings/getDistrictsList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token,
        }
      });
      const result = await response.json();
      let data = [];
      if (Array.isArray(result)) data = result; else if (result.data && Array.isArray(result.data)) data = result.data; else if (result.districts && Array.isArray(result.districts)) data = result.districts; else if (result.result && Array.isArray(result.result)) data = result.result; else if (result.items && Array.isArray(result.items)) data = result.items;
      setDistricts(data);
    } catch (error) {
      console.error('Error fetching districts:', error);
      setDistricts([]);
    }
  };

  // Fetch asset types from API using /api/assets/dropdown/asset-ids
  const fetchAssetTypes = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/assets/dropdown/asset-ids', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token || '',
        }
      });

      if (!response.ok) {
        console.warn('Asset types dropdown API failed with status:', response.status);
        setAssetTypes([]);
        return;
      }

      const result = await response.json();
      console.log('Asset types API response:', result);

      let assetTypesData = [];
      if (Array.isArray(result)) {
        assetTypesData = result;
      } else if (result.data && Array.isArray(result.data)) {
        assetTypesData = result.data;
      } else if (result.assetTypes && Array.isArray(result.assetTypes)) {
        assetTypesData = result.assetTypes;
      } else if (result.asset_ids && Array.isArray(result.asset_ids)) {
        assetTypesData = result.asset_ids;
      } else if (result.success && Array.isArray(result.data)) {
        assetTypesData = result.data;
      } else {
        const firstArray = Object.values(result || {}).find(v => Array.isArray(v));
        assetTypesData = firstArray || [];
      }

      // Transform data to standard format for dropdown
      const transformedData = assetTypesData.map((item) => ({
        value: item.id || item.asset_id || item.asset_type_id || item.value,
        label: item.asset_type || item.name || item.label || item.asset_id || item.id || '',
        id: item.id || item.asset_type_id || item.asset_id,
        asset_type: item.asset_type || item.name || item.label,
        asset_type_id: item.asset_type_id || item.id,
        ...item
      })).filter(opt => opt.value && opt.label);

      setAssetTypes(transformedData);
      console.log("Asset types loaded successfully:", transformedData.length, "items");
    } catch (error) {
      console.error("Error fetching asset types:", error);
      setAssetTypes([]);
    }
  };

  // Fetch depreciation methods from API
  const fetchDepreciationMethods = async () => {
    try {
      const depreciationMethodsData = await getDepreciationMethods();
      setDepreciationMethods(depreciationMethodsData);
      console.log("Depreciation methods loaded successfully:", depreciationMethodsData.length, "items");
    } catch (error) {
      console.error("Error fetching depreciation methods:", error);
      setDepreciationMethods([]);
    }
  };

  // Fetch status names from API
  const fetchStatusNames = async () => {
    try {
      const statusNamesData = await getStatusNames();
      setStatusNames(statusNamesData);
      console.log("Status names loaded successfully:", statusNamesData.length, "items");
    } catch (error) {
      console.error("Error fetching status names:", error);
      setStatusNames([]);
    }
  };

  // Check if asset ID is duplicate
  const checkAssetIdDuplicate = (assetId, currentEditingAsset = null) => {
    console.log('🔍 Checking duplicate for:', assetId, 'Assets count:', assets?.length);
    
    if (!assetId || !assets || assets.length === 0) {
      console.log('❌ No assets loaded or empty asset ID');
      return false;
    }
    
    const existingIds = assets.map(a => a.asset_id).filter(Boolean);
    console.log('📋 Existing asset IDs:', existingIds);
    
    const isDuplicate = assets.some(asset => {
      // Skip if this is the same asset we're editing
      if (currentEditingAsset && asset.asset_id === currentEditingAsset.asset_id) {
        return false;
      }
      
      // Check if asset_id exists and matches (case insensitive)
      const matches = asset.asset_id && 
        String(asset.asset_id).toLowerCase() === String(assetId).toLowerCase();
      
      if (matches) {
        console.log('🚨 DUPLICATE FOUND:', asset.asset_id, 'matches', assetId);
      }
      
      return matches;
    });
    
    console.log('✅ Duplicate check result:', isDuplicate);
    return isDuplicate;
  };

  // Check if serial number is duplicate
  const checkSerialNumberDuplicate = (serialNumber, currentEditingAsset = null) => {
    if (!serialNumber || !assets || assets.length === 0) return false;
    
    return assets.some(asset => {
      // Skip if this is the same asset we're editing
      if (currentEditingAsset && asset.serial_number === currentEditingAsset.serial_number) {
        return false;
      }
      
      // Check if serial_number exists and matches (case insensitive)
      return asset.serial_number && 
        String(asset.serial_number).toLowerCase() === String(serialNumber).toLowerCase();
    });
  };

  // Check if asset code is duplicate
  const checkAssetCodeDuplicate = (assetCode, currentEditingAsset = null) => {
    if (!assetCode || !assets || assets.length === 0) return false;
    
    return assets.some(asset => {
      // Skip if this is the same asset we're editing
      if (currentEditingAsset && (asset.asset_code === currentEditingAsset.asset_code)) {
        return false;
      }
      const existingCode = asset.asset_code || asset.asset_id; // fallback if server still returns asset_id
      return existingCode && String(existingCode).toLowerCase() === String(assetCode).toLowerCase();
    });
  };

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
  
      // Debug authentication
      console.log('=== DEBUGGING AUTH ===');
      const token = sessionStorage.getItem('token');
      const isAuth = sessionStorage.getItem('isAuthenticated');
      console.log('Token:', token);
      console.log('Is Authenticated:', isAuth);
      
      // Test direct API call first
      console.log('=== TESTING DIRECT API CALL ===');
      const directResponse = await fetch('http://202.53.92.35:5004/api/assets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token || ''
        }
      });
      console.log('Direct API Response Status:', directResponse.status);
      const directData = await directResponse.text();
      console.log('Direct API Response Data:', directData);
      
      // ✅ Use auth interceptor for API call
      const result = await api.getAssets();
  
      console.log("Assets API Response:", result);
      console.log("Response type:", typeof result);
      console.log("Response keys:", Object.keys(result || {}));
  
      let assetsData = [];
  
      // Handle different response formats
      if (result.success && Array.isArray(result.data)) {
        assetsData = result.data;
        console.log("Using success.data format, found", assetsData.length, "assets");
      } else if (Array.isArray(result.data)) {
        assetsData = result.data;
        console.log("Using direct array format, found", assetsData.length, "assets");
      } else if (result.data?.assets && Array.isArray(result.data.assets)) {
        assetsData = result.data.assets;
        console.log("Using assets property format, found", assetsData.length, "assets");
      } else if (result.data?.results && Array.isArray(result.data.results)) {
        assetsData = result.data.results;
        console.log("Using results property format, found", assetsData.length, "assets");
      } else {
        console.warn("Unexpected API response format:", result.data);
        const arrayProperties = Object.values(result.data || {}).filter(Array.isArray);
        if (arrayProperties.length > 0) {
          assetsData = arrayProperties[0];
        } else {
          setAssets([]);
          return;
        }
      }
  
      // ✅ Map data with keys and rename fields
      const dataWithKeys = assetsData.map((item, index) => ({
        ...item,
        key: item.asset_code || item.asset_id || item.id || index.toString(),
        asset_code: item.asset_code || item.asset_id || '',
        // Normalize purchase_date to a single field used by filters/rendering
        purchase_date: item.purchase_date || item.purchaseDate || item.purchased_on || item.date_of_purchase || item.purchase || item.purchaseDateUtc || item.purchase_date_utc || '',
        type: item.type || item.asset_type || item.manufacturer_brand || '',
        location: item.location || item.asset_location || '',
        status: item.status || item.asset_status || 'Active',
      }));
  
      console.log("Final processed assets:", dataWithKeys);
      setAssets(dataWithKeys);
  
    } catch (error) {
      console.error("Error fetching assets:", error);
  
      if (error.response?.status === 401) {
        message.error("Unauthorized: Token expired or invalid. Please log in again.");
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.warning("⚠️ API server is not running. Please check backend connectivity.");
      } else {
        message.error("Failed to fetch assets: " + (error.message || "Unknown error"));
      }
  
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };
  

  // Fetch users from /api/users for Assigned User dropdown
  const fetchUsersForDropdown = async () => {
    try {
      const response = await api.getUsers();

      if (!response || !response.success) {
        console.warn('Users dropdown API failed:', response?.error);
        setUserOptions([]);
        return;
      }

      const result = response.data || response;

      let usersData = [];
      if (Array.isArray(result)) {
        usersData = result;
      } else if (result.data && Array.isArray(result.data)) {
        usersData = result.data;
      } else if (result.users && Array.isArray(result.users)) {
        usersData = result.users;
      } else if (result.success && Array.isArray(result.data)) {
        usersData = result.data;
      } else {
        const firstArray = Object.values(result || {}).find(v => Array.isArray(v));
        usersData = firstArray || [];
      }

      const options = usersData
        .map((item) => ({
          value: item.id || item.user_id,
          label: item.name || item.username || item.full_name || item.user_name || '',
        }))
        .filter(opt => opt.value && opt.label);

      setUserOptions(options);
      console.log('Users loaded for dropdown:', options.length, 'items');
    } catch (error) {
      console.error('Error fetching users for dropdown:', error);
      setUserOptions([]);
    }
  };

  // Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [categoriesData, locationsData] = await Promise.all([
        getCategories(),
        getLocations()
      ]);
      
      console.log('📊 Raw categories data:', categoriesData);
      console.log('📊 Raw locations data:', locationsData);
      
      setCategories(categoriesData);
      setLocations(locationsData);
      
      console.log('Dropdown data loaded:', {
        categories: categoriesData.length,
        locations: locationsData.length
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      message.error('Failed to load dropdown data');
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchDropdownData();
    fetchUsersForDropdown(); // Fetch users from /api/users for Assigned User dropdown
    fetchStatusNames(); // Fetch status names for normalization
    fetchAssetNames();
    fetchAssetIds();
    fetchAssetTypes();
    fetchDepreciationMethods();
    fetchVendorNames(); // Fetch vendor names for normalization
    fetchStates();
    fetchDistricts();
  }, []);

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Table columns with sorting and filtering
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
  });

  // Date range filter props
  const getDateRangeFilterProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8, width: 300 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
            From Date (DD-MM-YYYY)
          </label>
          <DatePicker
            placeholder="From Date"
            format="DD-MM-YYYY"
            value={selectedKeys[0] && selectedKeys[0].includes('|') && selectedKeys[0].split('|')[0]
              ? dayjs(selectedKeys[0].split('|')[0], 'DD-MM-YYYY')
              : null}
            onChange={(date) => {
              const fromDate = date ? date.format('DD-MM-YYYY') : '';
              const toDate = selectedKeys[0] && selectedKeys[0].includes('|') ? selectedKeys[0].split('|')[1] : '';
              const combined = `${fromDate}|${toDate}`;
              setSelectedKeys(combined === '|' ? [] : [combined]);
            }}
            style={{ width: '100%', marginBottom: 8 }}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>
            To Date (DD-MM-YYYY)
          </label>
          <DatePicker
            placeholder="To Date"
            format="DD-MM-YYYY"
            value={selectedKeys[0] && selectedKeys[0].includes('|') && selectedKeys[0].split('|')[1]
              ? dayjs(selectedKeys[0].split('|')[1], 'DD-MM-YYYY')
              : null}
            onChange={(date) => {
              const toDate = date ? date.format('DD-MM-YYYY') : '';
              const fromDate = selectedKeys[0] && selectedKeys[0].includes('|') ? selectedKeys[0].split('|')[0] : '';
              const combined = `${fromDate}|${toDate}`;
              setSelectedKeys(combined === '|' ? [] : [combined]);
            }}
            style={{ width: '100%', marginBottom: 8 }}
          />
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Filter
          </Button>
          <Button
            onClick={() => clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    onFilter: (value, record) => {
      if (!value) return true;
      const [fromDate, toDate] = String(value).split('|');
      if (!fromDate && !toDate) return true;
      
      const recordDate = record[dataIndex];
      if (!recordDate) return false;
      
      // Convert any input to a comparable timestamp (ms)
      const toTimestamp = (val) => {
        if (!val) return NaN;
        if (val instanceof Date) return val.setHours(0,0,0,0);
        if (typeof val === 'string') {
          const s = val.trim();
          // DD-MM-YYYY -> YYYY-MM-DD for parsing
          const dmy = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
          if (dmy) {
            const iso = `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
            return new Date(iso).setHours(0,0,0,0);
          }
          // ISO or other parseable string
          return new Date(s).setHours(0,0,0,0);
        }
        // Numbers (timestamps) or dayjs objects
        if (typeof val === 'number') return new Date(val).setHours(0,0,0,0);
        if (val && typeof val === 'object' && val.$d) {
          // dayjs instance
          return val.toDate().setHours(0,0,0,0);
        }
        return NaN;
      };

      const recTs = toTimestamp(recordDate);
      const fromTs = toTimestamp(fromDate);
      const toTs = toTimestamp(toDate);

      if (Number.isNaN(recTs)) return false;

      if (!Number.isNaN(fromTs) && !Number.isNaN(toTs)) {
        return recTs >= fromTs && recTs <= toTs;
      } else if (!Number.isNaN(fromTs)) {
        return recTs >= fromTs;
      } else if (!Number.isNaN(toTs)) {
        return recTs <= toTs;
      }
      return true;
    },
    filterIcon: (filtered) => (
      <FaCalendarAlt style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
  });

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (text, record, index) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Asset Code",
      dataIndex: "asset_code",
      key: "asset_code",
      sorter: (a, b) => safeStringCompare(a.asset_code, b.asset_code),
      ...getColumnSearchProps('asset_code'),
      render: (text, record) => (
        <span 
          onClick={() => fetchAssetDetails(record.asset_id || record.asset_code)}
          style={{ 
            cursor: 'pointer',
            color: 'inherit',
            textDecoration: 'none'
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Asset Name",
      dataIndex: "asset_name",
      key: "asset_name",
      sorter: (a, b) => safeStringCompare(a.asset_name, b.asset_name),
      ...getColumnSearchProps('asset_name'),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => safeStringCompare(a.category, b.category),
      render: (text, record) => {
        console.log('🎯 Category render - text:', text, 'record.category:', record.category, 'record:', record);
        return getCategoryNameById(record.category);
      },
      ...getColumnSearchProps('category'),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => safeStringCompare(String(getAssetTypeNameById(a.type) || a.type), String(getAssetTypeNameById(b.type) || b.type)),
      render: (text, record) => getAssetTypeNameById(record.type),
      ...getColumnSearchProps('type'),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      sorter: (a, b) => safeStringCompare(a.location, b.location),
      render: (text, record) => {
        console.log('🎯 Location render - text:', text, 'record.location:', record.location, 'record:', record);
        return getLocationNameById(record.location);
      },
      ...getColumnSearchProps('location'),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => safeStringCompare(a.status, b.status),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'In Maintenance', value: 'In Maintenance' },
        { text: 'Inactive', value: 'Inactive' },
        { text: 'Retired', value: 'Retired' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <span className={`badge ${
          status === 'Active' ? 'bg-success' : 
          status === 'In Maintenance' ? 'bg-warning text-dark' : 
          'bg-secondary'
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: "Purchase Date",
      dataIndex: "purchase_date",
      key: "purchase_date",
      sorter: (a, b) => new Date(a.purchase_date) - new Date(b.purchase_date),
      ...getDateRangeFilterProps('purchase_date'),
      render: (date) => formatDateForDisplay(date) || '-',
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {/* <Button 
            type="default" 
            size="small" 
            icon={<FaEye />}
            title="View"
            onClick={(e) => {
              e.stopPropagation();
              console.log('View clicked for record:', record);
            }}
          /> */}
          <Button 
            type="default" 
            size="small" 
            icon={<FaEdit />}
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              showDrawer(record);
            }}
          />
          {/* <Popconfirm
            title="Are you sure to delete this asset?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<FaTrash />}
              title="Delete"
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm> */}
        </Space>
      ),
    },
  ];


  // Helper function to normalize dropdown values to match option values
  // This ensures dropdowns display names instead of IDs when editing
  const normalizeDropdownValue = (value, options) => {
    if (!value || !options || options.length === 0) return value;
    
    // Convert to string for comparison
    const valueStr = String(value).trim();
    
    // Try to find matching option by ID/value first (handle both string and number)
    let found = options.find(opt => {
      const optValue = opt.id || opt.value || opt.cat_id || opt.loc_id || opt.location_id || opt.state_id || opt.district_id || opt.role_id || opt.user_id || opt.asset_type_id || opt.status_id || opt.vendor_id || opt.depreciation_method_id;
      return String(optValue) === valueStr || optValue === value;
    });
    
    // If not found by ID, try to find by name/label (in case value is a name string)
    if (!found) {
      found = options.find(opt => {
        const optLabel = String(opt.label || opt.name || opt.cat_name || opt.loc_name || opt.location_name || opt.status_name || opt.asset_type_name || opt.vendor_name || opt.depreciation_method_name || '').trim().toLowerCase();
        return optLabel === valueStr.toLowerCase();
      });
    }
    
    // Return the option value (ID) in its original type, or return the value as-is if not found
    return found ? (found.id || found.value) : value;
  };

  // Helper function to extract ID from dropdown value (for API payload)
  const extractIdFromDropdownValue = (value, options) => {
    if (!value) return null;
    
    // If value is already a number, return it
    if (typeof value === 'number') return value;
    
    // Convert to string for comparison
    const valueStr = String(value).trim();
    
    // Try to find matching option by ID/value
    let found = options.find(opt => {
      const optValue = opt.id || opt.value || opt.cat_id || opt.loc_id || opt.location_id || opt.state_id || opt.district_id || opt.role_id || opt.user_id || opt.asset_type_id || opt.status_id || opt.vendor_id || opt.depreciation_method_id;
      return String(optValue) === valueStr || optValue === value;
    });
    
    // If found, return the ID
    if (found) {
      return found.id || found.value || found.cat_id || found.loc_id || found.location_id || found.status_id || found.vendor_id || found.user_id || found.asset_type_id || found.depreciation_method_id;
    }
    
    // If not found, try parsing as number
    const numValue = parseInt(valueStr, 10);
    if (!isNaN(numValue)) return numValue;
    
    return null;
  };

  // Helper function to get file name from file list or processed files
  const getFileName = (fileList) => {
    if (!fileList) return null;
    
    // If it's a string, return it
    if (typeof fileList === 'string') return fileList;
    
    // If it's an array, get the first file name
    if (Array.isArray(fileList)) {
      if (fileList.length === 0) return null;
      
      const firstFile = fileList[0];
      
      // Handle processed file objects (from processFilesForAPI)
      if (firstFile && typeof firstFile === 'object') {
        if (firstFile.attachment_name) return firstFile.attachment_name;
        if (firstFile.name) return firstFile.name;
        // Check if it's an object with a filename property
        const fileName = Object.keys(firstFile).find(key => key.includes('name') || key.includes('file'));
        if (fileName) return firstFile[fileName];
      }
      
      // Handle string arrays
      if (typeof firstFile === 'string') return firstFile;
      
      // Handle Upload file objects
      if (firstFile && firstFile.name) return firstFile.name;
    }
    
    return null;
  };

  const showDrawer = (asset = null) => {
    console.log("Opening drawer for asset:", asset);
    setEditingAsset(asset);
    setAssetIdStatus(null); // Reset asset ID status
    setSerialNumberStatus(null); // Reset serial number status
    setWarrantyPeriodCalculated(false); // Reset warranty period calculation status
    if (asset) {
      // Normalize dropdown values to ensure they match dropdown option values
      // This ensures dropdowns display names instead of IDs
      const categoryValue = asset.category ? normalizeDropdownValue(asset.category, categories) : null;
      const locationValue = asset.location ? normalizeDropdownValue(asset.location, locations) : null;
      const statusValue = (asset.status || asset.asset_status) ? normalizeDropdownValue(asset.status || asset.asset_status, statusNames) : null;
      const assignedUserValue = asset.assigned_user ? normalizeDropdownValue(asset.assigned_user, userOptions) : null;
      const vendorValue = (asset.supplier_vendor || asset.vendor_name || asset.vendor) ? normalizeDropdownValue(asset.supplier_vendor || asset.vendor_name || asset.vendor, vendorNames) : null;
      const typeValue = (asset.type || asset.asset_type) ? normalizeDropdownValue(asset.type || asset.asset_type, assetTypes) : null;
      const depreciationMethodValue = asset.depreciation_method ? normalizeDropdownValue(asset.depreciation_method, depreciationMethods) : null;

      // Map API field names to form field names with fallbacks (handles multiple backend shapes)
      const formData = {
        asset_id: asset.asset_id,
        asset_code: asset.asset_code || asset.asset_id,
        asset_name: asset.asset_name,
        category: categoryValue,
        manufacturer: asset.manufacturer_brand,
        model: asset.model_number,
        serial_number: asset.serial_number,
        location: locationValue,
        assigned_user: assignedUserValue,
        department: asset.owning_department || asset.department,
        building_facility: asset.building_facility,
        floor_room: asset.floor_room_number || asset.floor_room,
        gps_coordinates: asset.gps_coordinates,
        status: statusValue,
        // Convert date strings to dayjs objects for DatePicker components (with fallbacks)
        purchase_date: (asset.purchase_date || asset.purchaseDate) ? dayjs(asset.purchase_date || asset.purchaseDate) : null,
        warranty_expiry: (asset.warranty_expiry || asset.warranty_expiry_date) ? dayjs(asset.warranty_expiry || asset.warranty_expiry_date) : null,
        amc_expiry_date: (asset.amc_expiry || asset.amc_expiry_date) ? dayjs(asset.amc_expiry || asset.amc_expiry_date) : null,
        installation_date: asset.installation_date ? dayjs(asset.installation_date) : null,
        warranty_start_date: (asset.warranty_start_date || asset.warranty_start) ? dayjs(asset.warranty_start_date || asset.warranty_start) : null,
        order_number: asset.order_number || asset.po_number,
        supplier_details: asset.supplier_details,
        warranty_period: asset.warranty_period_months || asset.warranty_period,
        current_value: asset.current_book_value || asset.current_value || asset.asset_cost,
        original_purchase_price: asset.original_purchase_price || asset.asset_original_price,
        vendor: vendorValue,
        type: typeValue,
        depreciation_method: depreciationMethodValue,
        invoice_receipt: asset.invoice_receipt,
        ownership_proof: asset.ownership_proof,
        insurance_policy: asset.insurance_policy,
        lease_agreements: asset.lease_agreements
      };
      
      console.log("Setting form values:", formData);
      console.log("Status value being set:", formData.status);
      form.setFieldsValue(formData);
      
      // Preload existing files into Upload components for editing
      const toUploadList = (files) => {
        if (!files) return [];
        if (Array.isArray(files)) {
          return files.filter(Boolean).map((fname, idx) => ({ uid: `init-${idx}-${fname}`, name: fname, status: 'done' }));
        }
        if (typeof files === 'string' && files.trim() !== '') {
          return [{ uid: `init-0-${files}`, name: files, status: 'done' }];
        }
        return [];
      };

      const initialInvoice = toUploadList(asset.invoice_receipt_files || asset.invoice_receipt);
      const initialOwnership = toUploadList(asset.ownership_proof_files || asset.ownership_proof);
      const initialInsurance = toUploadList(asset.insurance_policy_files || asset.insurance_policy);
      const initialLease = toUploadList(asset.lease_agreement_files || asset.lease_agreements);

      setFileList({
        invoice_receipt: initialInvoice,
        ownership_proof: initialOwnership,
        insurance_policy: initialInsurance,
        lease_agreements: initialLease
      });

      // Keep form values in sync so submit/update handlers receive lists
      form.setFieldValue('invoice_receipt', initialInvoice);
      form.setFieldValue('ownership_proof', initialOwnership);
      form.setFieldValue('insurance_policy', initialInsurance);
      form.setFieldValue('lease_agreements', initialLease);
    } else {
      form.resetFields();
      // Reset file lists for new asset
      setFileList({
        invoice_receipt: [],
        ownership_proof: [],
        insurance_policy: [],
        lease_agreements: []
      });
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setEditingAsset(null);
    setSubmitting(false);
    setAssetIdStatus(null); // Reset asset ID status
    setSerialNumberStatus(null); // Reset serial number status
    setWarrantyPeriodCalculated(false); // Reset warranty period calculation status
    form.resetFields();
    // Reset file lists
    setFileList({
      invoice_receipt: [],
      ownership_proof: [],
      insurance_policy: [],
      lease_agreements: []
    });
  };

  // Bulk upload functionality
  const handleBulkUpload = async (file) => {
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv' // .csv alternative
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      message.error('❌ Only Excel (.xlsx, .xls) and CSV files are allowed');
      return false;
    }
    
    try {
      setLoading(true);
      message.loading("Uploading file...", 0);
      
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      
      const response = await fetch("http://202.53.92.35:5004/api/assets/bulk-upload", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          excelFile: base64,
          fileName: file.name
        })
      });
      
      const result = await response.json();
      message.destroy();
      
      if (result.success) {
        message.success(`✅ Bulk upload successful! ${result.imported || 0} records imported.`);
        await fetchAssets(); // Refresh the table
        setBulkUploadDrawerVisible(false);
      } else {
        message.error(`❌ Upload failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      message.destroy();
      console.error("Bulk upload error:", error);
      
      if (error.response?.status === 400) {
        message.error(`❌ Invalid file format: ${error.response.data.message || 'Please check your file format'}`);
      } else if (error.response?.status === 500) {
        message.error(`❌ Server error: ${error.response.data.message || 'Please try again later'}`);
      } else {
        message.error(`❌ Upload failed: ${error.message || 'Please check your connection'}`);
      }
    } finally {
      setLoading(false);
    }
    
    return false; // Prevent default upload behavior
  };

  const uploadProps = {
    name: 'file',
    accept: '.xlsx,.xls,.csv',
    beforeUpload: handleBulkUpload,
    showUploadList: false,
  };

  // Download sample Excel template
  const downloadSampleExcel = () => {
    // Define field names only (no sample data)
    const fieldNames = [
      'Asset ID',
      'Asset Name',
      'Category',
      'Manufacturer',
      'Model',
      'Serial Number',
      'Location',
      'Assigned User',
      'Department',
      'Building/Facility',
      'Floor/Room',
      'GPS Coordinates',
      'Status',
      'Purchase Date',
      'Installation Date',
      'Warranty Start Date',
      'Warranty Expiry Date',
      'Warranty Period (Months)',
      'AMC Expiry Date',
      'Order Number',
      'Supplier/Vendor',
      'Original Purchase Price',
      'Current Book Value',
      'Asset Type',
      'Depreciation Method'
    ];

    // Create CSV content with headers only
    const csvContent = fieldNames.join(',') + '\n';

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'asset_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('✅ Excel template downloaded!');
  };


  // Fetch asset details by asset ID
  const fetchAssetDetails = async (assetId) => {
    try {
      setLoadingAssetDetails(true);
      console.log('Fetching asset details for ID:', assetId);
      
      const response = await fetch('http://202.53.92.35:5004/api/assets/assets/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': sessionStorage.getItem('token'),
        },
        body: JSON.stringify({
          asset_id: assetId
        })
      });

      const result = await response.json();
      console.log('Asset details API response:', result);
      console.log('Response structure:', JSON.stringify(result, null, 2));
      
      // Handle different response structures
      let assetData = null;
      if (result.success && result.data) {
        assetData = result.data;
      } else if (result.data) {
        assetData = result.data;
      } else if (result) {
        assetData = result;
      }
      
      // If assetData is an array, get the first element
      if (Array.isArray(assetData) && assetData.length > 0) {
        assetData = assetData[0];
      }
      
      console.log('Processed asset data:', assetData);
      
      if (assetData) {
        setAssetDetails(assetData);
        setAssetDetailsVisible(true);
      } else {
        message.error('Failed to fetch asset details: ' + (result.message || 'No data received'));
      }
    } catch (error) {
      console.error('Error fetching asset details:', error);
      message.error('Failed to fetch asset details. Please check your connection.');
    } finally {
      setLoadingAssetDetails(false);
    }
  };


  const handleDelete = async (assetId) => {
    try {
      const result = await api.deleteAsset({ asset_id: assetId });
      
      if (result.success) {
        message.success("Asset deleted successfully");
        fetchAssets(); // Refresh the list
      } else {
        message.error(`Failed to delete asset: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      message.error("Failed to delete asset. Please check your connection and try again.");
    }
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    console.log("Form validation passed, proceeding with submission");
    setSubmitting(true);
    message.loading("Saving asset...", 0);
    
    // Validate required fields (all essential fields)
    const requiredFields = ['asset_name', 'category', 'manufacturer', 'model', 'location', 'status', 'current_value', 'vendor'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
      setSubmitting(false);
      return;
    }

    // No asset_id duplication check (asset_code used instead)

    // Check for duplicate serial number before submission
    if (values.serial_number && checkSerialNumberDuplicate(values.serial_number, editingAsset)) {
      message.error('❌ Serial number already exists. Please use a different serial number.');
      setSubmitting(false);
      return;
    }

    // Check for duplicate asset code before submission
    if (values.asset_code && checkAssetCodeDuplicate(values.asset_code, editingAsset)) {
      message.error('❌ Asset code already exists. Please use a different code.');
      setSubmitting(false);
      return;
    }
    
    // Declare variables outside try block for error handling
    let updateData = null;
    let createData = null;
    
    try {
      if (editingAsset) {
        // Update existing asset
        console.log("Updating asset:", editingAsset);
        // Helper function to format dates for update
        const formatDateForUpdate = (dateValue) => {
          if (!dateValue) return '';
          if (typeof dateValue === 'string') {
            // If it's already a string, check if it's ISO format and convert to YYYY-MM-DD
            if (dateValue.includes('T')) {
              return dateValue.split('T')[0]; // Extract just the date part
            }
            return dateValue;
          }
          if (dateValue.format) return dateValue.format('YYYY-MM-DD');
          return '';
        };

        // Process file uploads for update as well
        const processedUpdateFiles = {
          invoice_receipt_files: await processFilesForAPI(fileList.invoice_receipt),
          ownership_proof_files: await processFilesForAPI(fileList.ownership_proof),
          insurance_policy_files: await processFilesForAPI(fileList.insurance_policy),
          lease_agreement_files: await processFilesForAPI(fileList.lease_agreements)
        };

        // Extract IDs from dropdown values
        const categoryId = extractIdFromDropdownValue(values.category, categories);
        const statusId = extractIdFromDropdownValue(values.status, statusNames);
        const locationId = extractIdFromDropdownValue(values.location, locations);
        const assignedUserId = extractIdFromDropdownValue(values.assigned_user, userOptions);
        const supplierVendorId = extractIdFromDropdownValue(values.vendor, vendorNames);
        
        // Get asset type label from selected value
        const selectedAssetType = assetTypes.find(t => 
          (t.value === values.type) || (t.id === values.type) || (t.value?.toString() === values.type?.toString())
        );
        const assetTypeLabel = selectedAssetType ? (selectedAssetType.label || selectedAssetType.asset_type || selectedAssetType.value) : (values.type?.toString() || '');

        // Map to exact field names the server expects - matching API payload structure
        updateData = {
          asset_id: editingAsset.asset_id || editingAsset.id || '',
          id: editingAsset.id || editingAsset.asset_id || '',
          asset_name: values.asset_name?.toString() || '',
          manufacturer_brand: values.manufacturer?.toString() || '',
          model_number: values.model?.toString() || '',
          serial_number: values.serial_number?.toString() || '',
          asset_code: values.asset_code?.toString() || '',
          
          // IDs from dropdowns
          category_id: categoryId || null,
          status_id: statusId || null,
          location_id: locationId || null,
          assigned_user_id: assignedUserId || null,
          supplier_vendor_id: supplierVendorId || null,
          state_id: values.state_id || null,
          district_id: values.district_id || null,
          
          // Other fields
          owning_department: values.department?.toString() || '',
          building_facility: values.building_facility?.toString() || '',
          floor_room_number: values.floor_room?.toString() || '',
          gps_coordinates: values.gps_coordinates?.toString() || '',
          purchase_date: formatDateForUpdate(values.purchase_date),
          warranty_expiry: formatDateForUpdate(values.warranty_expiry),
          amc_expiry: formatDateForUpdate(values.amc_expiry_date),
          warranty_period_months: parseInt(values.warranty_period) || 0,
          warranty_start_date: formatDateForUpdate(values.warranty_start_date),
          installation_date: formatDateForUpdate(values.installation_date),
          order_number: values.order_number?.toString() || '',
          current_book_value: parseFloat(values.current_value) || 0,
          original_purchase_price: parseFloat(values.original_purchase_price) || 0,
          
          // Asset type and depreciation method (as strings based on payload example)
          asset_type: assetTypeLabel,
          depreciation_method: values.depreciation_method?.toString() || '',
          
          // File uploads - send as filename strings
          invoice_receipt_files: (fileList.invoice_receipt && fileList.invoice_receipt.length > 0 && fileList.invoice_receipt[0].name) || '',
          ownership_proof_files: (fileList.ownership_proof && fileList.ownership_proof.length > 0 && fileList.ownership_proof[0].name) || '',
          insurance_policy_files: (fileList.insurance_policy && fileList.insurance_policy.length > 0 && fileList.insurance_policy[0].name) || '',
          lease_agreement_files: (fileList.lease_agreements && fileList.lease_agreements.length > 0 && fileList.lease_agreements[0].name) || null
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        console.log("Editing asset ID:", editingAsset.asset_id);
        console.log("Form values:", values);
        console.log("Status value in form:", values.status);
        console.log("Status value in updateData:", updateData.asset_status);
        
        const result = await api.updateAsset(updateData);
        
        console.log("Update response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Asset updated successfully!");
        fetchAssets(); // Refresh the list
      } else {
        // Add new asset
        console.log("Creating new asset");
        console.log("Form values for debugging:", values);
        console.log("AMC expiry date from form:", values.amc_expiry_date, typeof values.amc_expiry_date);
        console.log("Status from form:", values.status, typeof values.status);
        
        // Helper function to format dates
        const formatDate = (dateValue) => {
          if (!dateValue) return '';
          if (typeof dateValue === 'string') {
            // If it's already a string, check if it's ISO format and convert to YYYY-MM-DD
            if (dateValue.includes('T')) {
              return dateValue.split('T')[0]; // Extract just the date part
            }
            return dateValue;
          }
          if (dateValue.format) return dateValue.format('YYYY-MM-DD');
          return '';
        };

        // No asset_id generation; using provided asset_code instead

        // Process file uploads
        const processedFiles = {
          invoice_receipt_files: await processFilesForAPI(fileList.invoice_receipt),
          ownership_proof_files: await processFilesForAPI(fileList.ownership_proof),
          insurance_policy_files: await processFilesForAPI(fileList.insurance_policy),
          lease_agreement_files: await processFilesForAPI(fileList.lease_agreements)
        };

        // Extract IDs from dropdown values
        const categoryId = extractIdFromDropdownValue(values.category, categories);
        const statusId = extractIdFromDropdownValue(values.status, statusNames);
        const locationId = extractIdFromDropdownValue(values.location, locations);
        const assignedUserId = extractIdFromDropdownValue(values.assigned_user, userOptions);
        const supplierVendorId = extractIdFromDropdownValue(values.vendor, vendorNames);
        
        // Get asset type label from selected value
        const selectedAssetType = assetTypes.find(t => 
          (t.value === values.type) || (t.id === values.type) || (t.value?.toString() === values.type?.toString())
        );
        const assetTypeLabel = selectedAssetType ? (selectedAssetType.label || selectedAssetType.asset_type || selectedAssetType.value) : (values.type?.toString() || '');

        // Map to exact field names the server expects - matching API payload structure
        createData = {
          asset_name: values.asset_name?.toString() || '',
          manufacturer_brand: values.manufacturer?.toString() || '',
          model_number: values.model?.toString() || '',
          serial_number: values.serial_number?.toString() || '',
          asset_code: values.asset_code?.toString() || '',
          
          // IDs from dropdowns
          category_id: categoryId || null,
          status_id: statusId || null,
          location_id: locationId || null,
          assigned_user_id: assignedUserId || null,
          supplier_vendor_id: supplierVendorId || null,
          state_id: values.state_id || null,
          district_id: values.district_id || null,
          
          // Other fields
          owning_department: values.department?.toString() || '',
          building_facility: values.building_facility?.toString() || '',
          floor_room_number: values.floor_room?.toString() || '',
          gps_coordinates: values.gps_coordinates?.toString() || '',
          purchase_date: formatDate(values.purchase_date),
          warranty_expiry: formatDate(values.warranty_expiry),
          amc_expiry: formatDate(values.amc_expiry_date),
          warranty_period_months: parseInt(values.warranty_period) || 0,
          installation_date: formatDate(values.installation_date),
          order_number: values.order_number?.toString() || '',
          current_book_value: parseFloat(values.current_value) || 0,
          original_purchase_price: parseFloat(values.original_purchase_price) || 0,
          
          // Asset type and depreciation method (as strings based on payload example)
          asset_type: assetTypeLabel,
          depreciation_method: values.depreciation_method?.toString() || '',
          
          // File uploads - send as filename strings
          invoice_receipt_files: (fileList.invoice_receipt && fileList.invoice_receipt.length > 0 && fileList.invoice_receipt[0].name) || '',
          ownership_proof_files: (fileList.ownership_proof && fileList.ownership_proof.length > 0 && fileList.ownership_proof[0].name) || '',
          insurance_policy_files: (fileList.insurance_policy && fileList.insurance_policy.length > 0 && fileList.insurance_policy[0].name) || '',
          lease_agreement_files: (fileList.lease_agreements && fileList.lease_agreements.length > 0 && fileList.lease_agreements[0].name) || null
        };
        
        // Validate that all required fields have non-empty values
        const requiredFields = ['asset_name', 'category_id', 'manufacturer_brand', 'model_number', 'status_id', 'location_id', 'assigned_user_id', 'current_book_value', 'original_purchase_price', 'supplier_vendor_id', 'asset_code'];
        const missingFields = requiredFields.filter(field => {
          const value = createData[field];
          return value === null || value === undefined || value === '';
        });
        
        if (missingFields.length > 0) {
          console.error("Missing required fields:", missingFields);
          message.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
          setSubmitting(false);
          return;
        }
        
        // Additional validation for data types and values
        if (createData.current_book_value && isNaN(parseFloat(createData.current_book_value))) {
          message.error("❌ Current book value must be a valid number");
          setSubmitting(false);
          return;
        }
        
        if (createData.asset_cost && isNaN(parseFloat(createData.asset_cost))) {
          message.error("❌ Asset cost must be a valid number");
          setSubmitting(false);
          return;
        }
        
        // Validate date fields if they exist
        if (createData.purchase_date && !(createData.purchase_date instanceof Date) && typeof createData.purchase_date !== 'string') {
          console.warn("Invalid purchase_date format:", createData.purchase_date);
          createData.purchase_date = null;
        }
        
        if (createData.warranty_expiry_date && !(createData.warranty_expiry_date instanceof Date) && typeof createData.warranty_expiry_date !== 'string') {
          console.warn("Invalid warranty_expiry_date format:", createData.warranty_expiry_date);
          createData.warranty_expiry_date = null;
        }
        
        if (createData.amc_expiry_date && !(createData.amc_expiry_date instanceof Date) && typeof createData.amc_expiry_date !== 'string') {
          console.warn("Invalid amc_expiry_date format:", createData.amc_expiry_date);
          createData.amc_expiry_date = null;
        }
        
        // Ensure numeric fields are not negative
        if (createData.current_book_value < 0) {
          message.error("❌ Current book value cannot be negative");
          setSubmitting(false);
          return;
        }
        
        if (createData.asset_cost < 0) {
          message.error("❌ Asset cost cannot be negative");
          setSubmitting(false);
          return;
        }
        
        console.log("Create data being sent:", createData);
        console.log("Data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        console.log("Data values:", Object.keys(createData).map(key => `${key}: ${createData[key]}`));
        console.log("JSON stringified data:", JSON.stringify(createData, null, 2));
        
        // Log any empty or null values that might cause issues
        const emptyFields = Object.keys(createData).filter(key => !createData[key] || createData[key] === '');
        if (emptyFields.length > 0) {
          console.warn("Empty fields in createData:", emptyFields);
        }
        
        // Try with minimal required fields first to isolate the issue
        const minimalData = {
          asset_name: createData.asset_name,
          category: createData.category,
          manufacturer_brand: createData.manufacturer_brand,
          model_number: createData.model_number,
          asset_location: createData.asset_location,
          status: createData.status,
          current_book_value: createData.current_book_value,
          vendor_name: createData.vendor_name
        };
        
        console.log("Trying with minimal data first:", minimalData);
        
        // Test if the API endpoint is accessible
        try {
          console.log("Testing API endpoint accessibility...");
          const testResult = await api.getAssets();
          console.log("API endpoint test successful:", testResult.status);
        } catch (testError) {
          console.error("API endpoint test failed:", testError);
        }
        
        const result = await api.createAsset(createData);
        
        console.log("Create response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Asset added successfully!");
        fetchAssets(); // Refresh the list
      }
      onClose();
    } catch (error) {
      console.error("Error saving asset:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
      
      message.destroy(); // Clear loading message
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Bad Request - Invalid data format";
        console.error("400 Bad Request details:", error.response?.data);
        message.error(`❌ Invalid data: ${errorMessage}`);
        
        // Log the exact data being sent for debugging
        if (editingAsset) {
          console.error("Update data that caused 400 error:", updateData);
        } else {
          console.error("Create data that caused 400 error:", createData);
        }
      } else if (error.response?.status === 500) {
        console.error("500 Internal Server Error details:", error.response?.data);
        console.error("Server error message:", error.response?.data?.message);
        console.error("Server error details:", error.response?.data?.error);
        console.error("Full error response:", JSON.stringify(error.response?.data, null, 2));
        
        // Log the exact data being sent for debugging
        if (editingAsset) {
          console.error("Update data that caused 500 error:", updateData);
          console.error("Update data JSON:", JSON.stringify(updateData, null, 2));
        } else {
          console.error("Create data that caused 500 error:", createData);
          console.error("Create data JSON:", JSON.stringify(createData, null, 2));
        }
        
        const serverError = error.response?.data?.message || error.response?.data?.error || "Internal server error";
        message.error(`❌ Server Error (500): ${serverError}`);
        
        // Additional debugging for database errors
        if (serverError.toLowerCase().includes('database')) {
          message.error("💡 Database Error - Check if all required fields are provided and data types are correct");
        }
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please start the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save asset: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save asset. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-1">
      {/* Top Navigation Bar - Breadcrumb Only */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h2 className="mb-1">Asset Register</h2>
          <p className="mt-0">The core screen where all assets are listed and searchable.</p>
        </div>
        <div className="d-flex gap-2">
          <Button
            type="default"
            icon={<FaUpload />}
            onClick={() => setBulkUploadDrawerVisible(true)}
          >
            Bulk Upload
          </Button>
          <ExportButton
            data={assets}
            columns={null}
            filename="Asset_Register_Report"
            title="Asset Register Report"
            reportType="asset-register"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
            includeAllFields={true}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showDrawer()}
          >
            Add Asset
          </Button>
        </div>
      </div>
      
        
        <Table
          columns={columns}
          dataSource={assets}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['5', '10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          bordered
          size="middle"
        />
      

      {/* Drawer Form */}
      <Drawer
        title={editingAsset ? "Update Asset" : "Add Asset"}
        width={720}
        onClose={onClose}
        open={open}
        destroyOnClose
      >
        <Form
          layout="vertical"
          hideRequiredMark
          form={form}
          onFinish={onFinish}
          onFinishFailed={(errorInfo) => {
            console.log("Form validation failed:", errorInfo);
            message.error("Please fill in all required fields correctly");
          }}
        >
          {/* General Information */}
          <h5>General Information</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="asset_code"
                label={<span>Asset Code <span style={{ color: '#ff4d4f' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please enter asset code" },
                  { max: 50, message: 'Asset code cannot exceed 50 characters' },
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (checkAssetCodeDuplicate(value, editingAsset)) {
                        return Promise.reject(new Error('Asset code already exists. Please use a different code.'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
                tooltip="Enter your asset code (e.g., Dell001)."
              >
                <Input 
                  placeholder="Enter asset code (e.g., Dell001)"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && assets && assets.length > 0) {
                      setAssetCodeStatus('validating');
                      setTimeout(() => {
                        if (checkAssetCodeDuplicate(value, editingAsset)) {
                          setAssetCodeStatus('duplicate');
                        } else {
                          setAssetCodeStatus('available');
                        }
                        form.validateFields(['asset_code']);
                      }, 300);
                    } else {
                      setAssetCodeStatus(null);
                    }
                  }}
                  suffix={
                    assetCodeStatus === 'validating' ? (
                      <span style={{ color: '#1890ff' }}>Checking...</span>
                    ) : assetCodeStatus === 'available' ? (
                      <span style={{ color: '#52c41a' }}>✓ Available</span>
                    ) : assetCodeStatus === 'duplicate' ? (
                      <span style={{ color: '#ff4d4f' }}>✗ Duplicate</span>
                    ) : null
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="asset_name"
                label={<span>Asset Name <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please enter asset name" }
                ]}
              >
                <Input placeholder="Enter asset name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label={<span>Category <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please select category" }
                ]}
              >
                <CategoriesDropdown 
                  placeholder="Select category"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="manufacturer"
                label={<span>Manufacturer / Brand <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please enter manufacturer/brand" },
                  { max: 50, message: "Manufacturer name cannot exceed 50 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_&.]+$/, message: "Manufacturer name contains invalid characters" }
                ]}
              >
                <Input placeholder="Enter manufacturer" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="model"
                label={<span>Model Number <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please enter model number" },
                  { max: 30, message: "Model number cannot exceed 30 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_]+$/, message: "Model number contains invalid characters" }
                ]}
              >
                <Input placeholder="Enter model number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="serial_number"
                label="Serial Number"
                rules={[
                  { max: 50, message: "Serial number cannot exceed 50 characters" },
                  { pattern: /^[a-zA-Z0-9\-_]+$/, message: "Serial number can only contain letters, numbers, hyphens, and underscores" },
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      
                      // Check for duplicate serial number using helper function
                      if (checkSerialNumberDuplicate(value, editingAsset)) {
                        return Promise.reject(new Error('Serial number already exists. Please use a different serial number.'));
                      }
                      
                      return Promise.resolve();
                    }
                  }
                ]}
                tooltip="Enter a unique serial number for this asset."
              >
                <Input 
                  placeholder="Enter serial number"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value && assets && assets.length > 0) {
                      setSerialNumberStatus('validating');
                      setTimeout(() => {
                        if (checkSerialNumberDuplicate(value, editingAsset)) {
                          setSerialNumberStatus('duplicate');
                        } else {
                          setSerialNumberStatus('available');
                        }
                        form.validateFields(['serial_number']);
                      }, 500);
                    } else {
                      setSerialNumberStatus(null);
                    }
                  }}
                  suffix={
                    serialNumberStatus === 'validating' ? (
                      <span style={{ color: '#1890ff' }}>Checking...</span>
                    ) : serialNumberStatus === 'available' ? (
                      <span style={{ color: '#52c41a' }}>✓ Available</span>
                    ) : serialNumberStatus === 'duplicate' ? (
                      <span style={{ color: '#ff4d4f' }}>✗ Duplicate</span>
                    ) : null
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <h5>Location & Assignment</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="location"
                label={<span>Asset Location <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please select asset location" }
                ]}
              >
                <LocationsDropdown 
                  placeholder="Select location"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
            {/*
            <Col span={8}>
              <Form.Item
                name="state_id"
                label="State"
                rules={[]}
              >
                <Select
                  showSearch
                  placeholder="Select state (optional)"
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  style={{ width: '100%' }}
                >
                  {states.map((state) => (
                    <Select.Option key={state.state_id || state.id} value={state.state_id || state.id}>
                      {state.state_name || state.name || state.state}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="district_id"
                label="District"
                rules={[]}
              >
                <Select
                  showSearch
                  placeholder="Select district (optional)"
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  style={{ width: '100%' }}
                >
                  {districts.map((district) => (
                    <Select.Option key={district.district_id || district.id} value={district.district_id || district.id}>
                      {district.district_name || district.name || district.district}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            */}
            <Col span={8}>
              <Form.Item
                name="assigned_user"
                label={<span>Assigned User <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please select assigned user" }
                ]}
              >
                <Select
                  placeholder="Select assigned user"
                  showSearch={true}
                  allowClear={true}
                  optionLabelProp="title"
                  filterOption={(input, option) => {
                    const label = option?.label || option?.children || '';
                    return String(label).toLowerCase().includes(String(input).toLowerCase());
                  }}
                >
                  {userOptions.map((option) => (
                    <Option key={option.value} value={option.value} title={option.label}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="department"
                label="Owning Department"
                rules={[
                  { max: 50, message: "Department name cannot exceed 50 characters" },
                  { pattern: /^[a-zA-Z\s\-&]+$/, message: "Department name contains invalid characters" }
                ]}
              >
                <Input placeholder="Enter department" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="building_facility"
                label="Building/Facility"
                rules={[
                  { max: 100, message: "Building/Facility name cannot exceed 100 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_,.()]+$/, message: "Building/Facility name contains invalid characters" }
                ]}
              >
                <Input placeholder="Enter building/facility name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="floor_room"
                label="Floor/Room Number"
                rules={[
                  { max: 50, message: "Floor/Room number cannot exceed 50 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_/]+$/, message: "Floor/Room number contains invalid characters" }
                ]}
              >
                <Input placeholder="e.g., Floor 2, Room 201" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gps_coordinates"
                label="GPS Coordinates"
                rules={[
                  { max: 100, message: "GPS coordinates cannot exceed 100 characters" },
                  { 
                    pattern: /^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?),\s*-?(1[0-7][0-9](\.[0-9]+)?|180(\.0+)?|[0-9]?[0-9](\.[0-9]+)?)$/, 
                    message: "Please enter valid GPS coordinates (latitude, longitude)" 
                  }
                ]}
              >
                <Input placeholder="e.g., 17.3850, 78.4867" />
              </Form.Item>
            </Col>
          </Row>

          <h5>Status & Dates</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label={<span>Asset Status <span style={{ color: 'red' }}>*</span></span>}
                rules={[{ required: true, message: "Please select status" }]}
              >
                <StatusNamesDropdown 
                  placeholder="Select status"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="purchase_date"
                label=" Purchase Date"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (!isValidDate(value)) {
                        return Promise.reject(new Error('Please enter a valid date'));
                      }
                      if (isDateBefore(value, '1900-01-01')) {
                        return Promise.reject(new Error('Purchase date cannot be before 1900'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD-MM-YYYY"
                  placeholder="Select date (DD-MM-YYYY)"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="installation_date"
                label=" Installation Date"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (!isValidDate(value)) {
                        return Promise.reject(new Error('Please enter a valid date'));
                      }
                      if (isDateBefore(value, '1900-01-01')) {
                        return Promise.reject(new Error('Installation date cannot be before 1900'));
                      }
                      const purchaseDate = form.getFieldValue('purchase_date');
                      if (purchaseDate && dayjs(value).isBefore(dayjs(purchaseDate), 'day')) {
                        return Promise.reject(new Error('Installation date cannot be before Purchase date'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD-MM-YYYY"
                  placeholder="Select date (DD-MM-YYYY)"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="warranty_start_date"
                label=" Warranty Start Date"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (!isValidDate(value)) {
                        return Promise.reject(new Error('Please enter a valid date'));
                      }
                      if (isDateBefore(value, '1900-01-01')) {
                        return Promise.reject(new Error('Warranty start date cannot be before 1900'));
                      }
                      const purchaseDate = form.getFieldValue('purchase_date');
                      if (purchaseDate && dayjs(value).isBefore(dayjs(purchaseDate), 'day')) {
                        return Promise.reject(new Error('Warranty Start Date cannot be before Purchase Date'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD-MM-YYYY"
                  placeholder="Select date (DD-MM-YYYY)"
                  onChange={handleWarrantyStartDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="warranty_period"
                label="Warranty Period (Months)"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const numValue = parseInt(value);
                      if (isNaN(numValue)) {
                        return Promise.reject(new Error('Please enter a valid number'));
                      }
                      if (numValue < 0) {
                        return Promise.reject(new Error('Warranty period cannot be negative'));
                      }
                      if (numValue > 1200) {
                        return Promise.reject(new Error('Warranty period cannot exceed 1200 months (100 years)'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input 
                  type="number" 
                  placeholder="Enter warranty period in months" 
                  min="0" 
                  max="1200"
                  suffix={
                    warrantyPeriodCalculated ? (
                      <span style={{ color: '#52c41a', fontSize: '12px' }}>Auto-calculated</span>
                    ) : null
                  }
                  onChange={(e) => {
                    setWarrantyPeriodCalculated(false);
                    const warrantyStart = form.getFieldValue('warranty_start_date');
                    const period = parseInt(e.target.value);
                    
                    if (warrantyStart && period && period > 0) {
                      const expiryDate = calculateWarrantyExpiryDate(warrantyStart, period);
                      if (expiryDate) {
                        form.setFieldValue('warranty_expiry', expiryDate);
                        message.success(`Warranty expiry date automatically calculated: ${expiryDate.format('DD-MM-YYYY')}`);
                      }
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="warranty_expiry"
                label=" Warranty Expiry Date"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (!isValidDate(value)) {
                        return Promise.reject(new Error('Please enter a valid date'));
                      }
                      if (isDateInPast(value)) {
                        return Promise.reject(new Error('Warranty expiry date cannot be in the past'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD-MM-YYYY"
                  placeholder="Select date (DD-MM-YYYY)"
                  onChange={handleWarrantyExpiryDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="amc_expiry_date"
                label=" AMC Expiry Date"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (!isValidDate(value)) {
                        return Promise.reject(new Error('Please enter a valid date'));
                      }
                      if (isDateInPast(value)) {
                        return Promise.reject(new Error('AMC expiry date cannot be in the past'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD-MM-YYYY"
                  placeholder="Select date (DD-MM-YYYY)"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Acquisition Information */}
          <h5>Acquisition Information</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="order_number"
                label="Order Number"
                rules={[
                  { max: 50, message: "Order number cannot exceed 50 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_/]+$/, message: "Order number contains invalid characters" }
                ]}
              >
                <Input placeholder="Enter purchase order number" />
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item
                name="supplier_details"
                label="Supplier/Vendor Details"
                rules={[
                  { max: 200, message: "Supplier details cannot exceed 200 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_,.()&@]+$/, message: "Supplier details contain invalid characters" }
                ]}
              >
                <Input placeholder="Enter supplier/vendor information" />
              </Form.Item>
            </Col> */}
          </Row>

          {/* Financial Details - COMMENTED OUT */}
          <h5>Financial Details</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="original_purchase_price"
                label=" Original Purchase Price"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const numValue = parseFloat(value);
                      if (isNaN(numValue)) {
                        return Promise.reject(new Error('Please enter a valid number'));
                      }
                      if (numValue < 0) {
                        return Promise.reject(new Error('Price cannot be negative'));
                      } 
                      if (numValue > 999999999) {
                        return Promise.reject(new Error('Price cannot exceed 999,999,999'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input type="number" placeholder="Enter original purchase price" min="0" max="999999999" step="0.01" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="current_value"
                label={<span>Current Book Value <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please enter current book value" },
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const numValue = parseFloat(value);
                      if (isNaN(numValue)) {
                        return Promise.reject(new Error('Please enter a valid number'));
                      }
                      if (numValue < 0) {
                        return Promise.reject(new Error('Value cannot be negative'));
                      }
                      if (numValue > 999999999) {
                        return Promise.reject(new Error('Value cannot exceed 999,999,999'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input type="number" placeholder="Enter current value" min="0" max="999999999" step="0.01" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="vendor"
                label={<span>Vendor / Supplier Name <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please select vendor/supplier name" }
                ]}
              >
                <VendorNamesDropdown 
                  placeholder="Select vendor name"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Asset Type"
                rules={[
                  { max: 50, message: "Asset type cannot exceed 50 characters" }
                ]}
              >
                <Select 
                  placeholder="Select asset type"
                  showSearch={true}
                  allowClear={true}
                  filterOption={(input, option) =>
                    (option?.label ?? option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {assetTypes.map((type) => (
                    <Option key={type.id || type.value} value={type.value || type.label} title={type.label}>
                      {type.label || type.value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="depreciation_method"
                label=" Depreciation Method"
              >
                <DepreciationMethodsDropdown 
                  placeholder="Select depreciation method"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Document Upload Section */}
          <h5>Required Documents</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="invoice_receipt"
                label={<span>Invoice/Receipt Copies <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please upload invoice and receipt copies" }
                ]}
              >
                <Upload.Dragger
                  name="invoice_receipt"
                  multiple
                  fileList={fileList.invoice_receipt}
                  beforeUpload={beforeUpload}
                  onChange={(info) => handleFileChange('invoice_receipt', info)}
                  onRemove={(file) => handleFileRemove('invoice_receipt', file)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                    showDownloadIcon: false
                  }}
                  onPreview={(file) => {
                    if (file.originFileObj) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = reader.result;
                        const preview = previewBase64File(base64, file.name);
                        if (preview && preview.type === 'image') {
                          // Show image preview in modal
                          Modal.info({
                            title: `Preview: ${file.name}`,
                            content: (
                              <div style={{ textAlign: 'center' }}>
                                <img 
                                  src={preview.src} 
                                  alt={preview.fileName}
                                  style={{ maxWidth: '100%', maxHeight: '500px' }}
                                />
                                <p style={{ marginTop: '10px', color: '#666' }}>
                                  File: {preview.fileName} | Type: {preview.mimeType}
                                </p>
                              </div>
                            ),
                            width: 600
                          });
                        } else {
                          message.info(`File: ${file.name} | Type: ${file.type} | Size: ${formatFileSize(file.size)}`);
                        }
                      };
                      reader.readAsDataURL(file.originFileObj);
                    }
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag files to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for PDF, JPG, PNG, DOC, DOCX files. Max 10MB per file.
                    <br />
                  
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ownership_proof"
                label={<span>Proof of Ownership Papers <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please upload proof of ownership papers" }
                ]}
              >
                <Upload.Dragger
                  name="ownership_proof"
                  multiple
                  fileList={fileList.ownership_proof}
                  beforeUpload={beforeUpload}
                  onChange={(info) => handleFileChange('ownership_proof', info)}
                  onRemove={(file) => handleFileRemove('ownership_proof', file)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                    showDownloadIcon: false
                  }}
                  onPreview={(file) => {
                    if (file.originFileObj) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = reader.result;
                        const preview = previewBase64File(base64, file.name);
                        if (preview && preview.type === 'image') {
                          Modal.info({
                            title: `Preview: ${file.name}`,
                            content: (
                              <div style={{ textAlign: 'center' }}>
                                <img 
                                  src={preview.src} 
                                  alt={preview.fileName}
                                  style={{ maxWidth: '100%', maxHeight: '500px' }}
                                />
                                <p style={{ marginTop: '10px', color: '#666' }}>
                                  File: {preview.fileName} | Type: {preview.mimeType}
                                </p>
                              </div>
                            ),
                            width: 600
                          });
                        } else {
                          message.info(`File: ${file.name} | Type: ${file.type} | Size: ${formatFileSize(file.size)}`);
                        }
                      };
                      reader.readAsDataURL(file.originFileObj);
                    }
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag files to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for PDF, JPG, PNG, DOC, DOCX files. Max 10MB per file.
                    <br />
                    
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="insurance_policy"
                label={<span>Insurance Policy Documents <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please upload insurance policy documents" }
                ]}
              >
                <Upload.Dragger
                  name="insurance_policy"
                  multiple
                  fileList={fileList.insurance_policy}
                  beforeUpload={beforeUpload}
                  onChange={(info) => handleFileChange('insurance_policy', info)}
                  onRemove={(file) => handleFileRemove('insurance_policy', file)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                    showDownloadIcon: false
                  }}
                  onPreview={(file) => {
                    if (file.originFileObj) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = reader.result;
                        const preview = previewBase64File(base64, file.name);
                        if (preview && preview.type === 'image') {
                          Modal.info({
                            title: `Preview: ${file.name}`,
                            content: (
                              <div style={{ textAlign: 'center' }}>
                                <img 
                                  src={preview.src} 
                                  alt={preview.fileName}
                                  style={{ maxWidth: '100%', maxHeight: '500px' }}
                                />
                                <p style={{ marginTop: '10px', color: '#666' }}>
                                  File: {preview.fileName} | Type: {preview.mimeType}
                                </p>
                              </div>
                            ),
                            width: 600
                          });
                        } else {
                          message.info(`File: ${file.name} | Type: ${file.type} | Size: ${formatFileSize(file.size)}`);
                        }
                      };
                      reader.readAsDataURL(file.originFileObj);
                    }
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag files to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for PDF, JPG, PNG, DOC, DOCX files. Max 10MB per file.
                    <br />
                  
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lease_agreements"
                label="Lease Agreements (if applicable)"
              >
                <Upload.Dragger
                  name="lease_agreements"
                  multiple
                  fileList={fileList.lease_agreements}
                  beforeUpload={beforeUpload}
                  onChange={(info) => handleFileChange('lease_agreements', info)}
                  onRemove={(file) => handleFileRemove('lease_agreements', file)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  showUploadList={{
                    showPreviewIcon: true,
                    showRemoveIcon: true,
                    showDownloadIcon: false
                  }}
                  onPreview={(file) => {
                    if (file.originFileObj) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = reader.result;
                        const preview = previewBase64File(base64, file.name);
                        if (preview && preview.type === 'image') {
                          Modal.info({
                            title: `Preview: ${file.name}`,
                            content: (
                              <div style={{ textAlign: 'center' }}>
                                <img 
                                  src={preview.src} 
                                  alt={preview.fileName}
                                  style={{ maxWidth: '100%', maxHeight: '500px' }}
                                />
                                <p style={{ marginTop: '10px', color: '#666' }}>
                                  File: {preview.fileName} | Type: {preview.mimeType}
                                </p>
                              </div>
                            ),
                            width: 600
                          });
                        } else {
                          message.info(`File: ${file.name} | Type: ${file.type} | Size: ${formatFileSize(file.size)}`);
                        }
                      };
                      reader.readAsDataURL(file.originFileObj);
                    }
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag files to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for PDF, JPG, PNG, DOC, DOCX files. Max 10MB per file.
                    <br />
                   
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Col>
          </Row>

          {/* Submit Buttons */}
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={onClose}>
                Close
              </Button>
              <Button
                className="btn-add"
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={submitting}
              >
                {editingAsset ? "Update Asset" : "Add Asset"}
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>

      {/* Asset Details Modal */}

      {/* Bulk Upload Drawer */}
      <Drawer
        title="Bulk Upload Assets"
        width={600}
        onClose={() => setBulkUploadDrawerVisible(false)}
        open={bulkUploadDrawerVisible}
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={() => setBulkUploadDrawerVisible(false)}>
              Close
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#1890ff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileTextOutlined /> Important Fields Instructions
          </h4>
          <div style={{ 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f', 
            borderRadius: '6px', 
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h5 style={{ color: '#52c41a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircleOutlined /> Required Fields (Must be filled):
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Asset Name</strong> - Name of the asset</li>
              <li><strong>Category</strong> - Asset category (must match existing categories)</li>
              <li><strong>Manufacturer</strong> - Manufacturer/Brand name</li>
              <li><strong>Model</strong> - Model number</li>
              <li><strong>Location</strong> - Asset location (must match existing locations)</li>
              <li><strong>Assigned User</strong> - User assigned to the asset (must match existing users)</li>
              <li><strong>Status</strong> - Asset status (Active, Inactive, etc.)</li>
              <li><strong>Current Book Value</strong> - Current value of the asset</li>
              <li><strong>Supplier/Vendor</strong> - Vendor name (must match existing vendors)</li>
            </ul>
          </div>
          
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#1890ff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CloudDownloadOutlined /> Download Sample Template
          </h4>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Download the sample Excel template to see the correct format and required fields.
          </p>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={downloadSampleExcel}
            style={{ marginBottom: '16px' }}
          >
            Download Sample Excel Template
          </Button>
        </div>

        <div>
          <h4 style={{ color: '#1890ff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CloudUploadOutlined /> Upload Your File
          </h4>
          <p style={{ color: '#666', marginBottom: '16px' }}>
            Select your Excel or CSV file to upload. The system will validate the data and import the assets.
          </p>
          <Upload.Dragger
            {...uploadProps}
            style={{ 
              background: '#fafafa',
              border: '2px dashed #d9d9d9',
              borderRadius: '6px'
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text" style={{ fontSize: '16px', fontWeight: '500' }}>
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint" style={{ color: '#666' }}>
              Support for Excel (.xlsx, .xls) and CSV files. Maximum file size: 10MB.
              <br />
              Make sure your file follows the sample template format.
            </p>
          </Upload.Dragger>
        </div>
      </Drawer>

    </div>
  );
};

export default Register;