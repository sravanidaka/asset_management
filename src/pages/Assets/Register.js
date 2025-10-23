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
} from "antd";
import { SearchOutlined, PlusOutlined, DownloadOutlined, UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { api } from '../../config/api';
import { isValidDate, isDateInFuture, isDateInPast, isDateBefore, formatDateForDisplay } from '../../utils/dateUtils';
import { formatDateForDB, parseDateFromDB } from "../../utils/dateUtils";
import ExportButton from '../../components/ExportButton';
import { safeStringCompare } from '../../utils/tableUtils';
import { autoGenerateAssetId, validateAssetId, generateAssetId } from '../../utils/assetIdUtils';
import { getCategories, getAssetNames, getAssetIds, getAssetTypes, getVendorNames } from '../../services/settingsService';
import { 
  StatusNamesDropdown,
  CategoriesDropdown,
  LocationsDropdown,
  LocationTypesDropdown,
  LocationNamesDropdown,
  AssetIdsDropdown,
  AssetTypesDropdown,
  VendorNamesDropdown
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
  const [form] = Form.useForm();
  const [editingAsset, setEditingAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [vendorNames, setVendorNames] = useState([]);
  const [assetNames, setAssetNames] = useState([]);
  const [assetIds, setAssetIds] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [fileList, setFileList] = useState({
    invoice_receipt: [],
    ownership_proof: [],
    insurance_policy: [],
    lease_agreements: []
  });

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

  // Fetch asset types from API
  const fetchAssetTypes = async () => {
    try {
      const assetTypesData = await getAssetTypes();
      setAssetTypes(assetTypesData);
      console.log("Asset types loaded successfully:", assetTypesData.length, "items");
    } catch (error) {
      console.error("Error fetching asset types:", error);
      setAssetTypes([]);
    }
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
        key: item.asset_id || item.id || index.toString(),
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
  

  useEffect(() => {
    fetchAssets();
    fetchCategories();
    fetchVendorNames();
    fetchAssetNames();
    fetchAssetIds();
    fetchAssetTypes();
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
            value={selectedKeys[0] ? dayjs(selectedKeys[0], 'DD-MM-YYYY') : null}
            onChange={(date) => {
              const fromDate = date ? date.format('DD-MM-YYYY') : '';
              setSelectedKeys([fromDate, selectedKeys[1] || '']);
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
            value={selectedKeys[1] ? dayjs(selectedKeys[1], 'DD-MM-YYYY') : null}
            onChange={(date) => {
              const toDate = date ? date.format('DD-MM-YYYY') : '';
              setSelectedKeys([selectedKeys[0] || '', toDate]);
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
      if (!value || value.length < 2) return true;
      
      const [fromDate, toDate] = value;
      if (!fromDate && !toDate) return true;
      
      const recordDate = record[dataIndex];
      if (!recordDate) return false;
      
      // Convert record date to DD-MM-YYYY format for comparison
      let recordDateFormatted = '';
      try {
        if (typeof recordDate === 'string') {
          // If it's already in DD-MM-YYYY format
          if (recordDate.includes('-') && recordDate.length === 10) {
            recordDateFormatted = recordDate;
          } else {
            // Convert from other formats
            const date = new Date(recordDate);
            recordDateFormatted = dayjs(date).format('DD-MM-YYYY');
          }
        } else {
          recordDateFormatted = dayjs(recordDate).format('DD-MM-YYYY');
        }
      } catch (error) {
        console.warn('Error parsing date:', recordDate, error);
        return false;
      }
      
      // Parse dates for comparison
      const recordDateObj = dayjs(recordDateFormatted, 'DD-MM-YYYY');
      const fromDateObj = fromDate ? dayjs(fromDate, 'DD-MM-YYYY') : null;
      const toDateObj = toDate ? dayjs(toDate, 'DD-MM-YYYY') : null;
      
      if (fromDateObj && toDateObj) {
        return recordDateObj.isAfter(fromDateObj.subtract(1, 'day')) && 
               recordDateObj.isBefore(toDateObj.add(1, 'day'));
      } else if (fromDateObj) {
        return recordDateObj.isAfter(fromDateObj.subtract(1, 'day'));
      } else if (toDateObj) {
        return recordDateObj.isBefore(toDateObj.add(1, 'day'));
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
      title: "Asset ID",
      dataIndex: "asset_id",
      key: "asset_id",
      sorter: (a, b) => safeStringCompare(a.asset_id, b.asset_id),
      ...getColumnSearchProps('asset_id'),
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
      ...getColumnSearchProps('category'),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => safeStringCompare(a.type, b.type),
      ...getColumnSearchProps('type'),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      sorter: (a, b) => safeStringCompare(a.location, b.location),
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
          <Button 
            type="default" 
            size="small" 
            icon={<FaEye />}
            title="View"
            onClick={(e) => {
              e.stopPropagation();
              console.log('View clicked for record:', record);
            }}
          />
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


  const showDrawer = (asset = null) => {
    console.log("Opening drawer for asset:", asset);
    setEditingAsset(asset);
    if (asset) {
      // Map API field names to form field names (all fields)
      const formData = {
        asset_id: asset.asset_id,
        asset_name: asset.asset_name,
        category: asset.category,
        manufacturer: asset.manufacturer_brand,
        model: asset.model_number,
        serial_number: asset.serial_number,
        location: asset.location,
        assigned_user: asset.assigned_user,
        department: asset.department,
        building_facility: asset.building_facility,
        floor_room: asset.floor_room,
        gps_coordinates: asset.gps_coordinates,
        status: asset.status,
        // Convert date strings to dayjs objects for DatePicker components
        purchase_date: asset.purchase_date ? dayjs(asset.purchase_date) : null,
        warranty_expiry: asset.warranty_expiry ? dayjs(asset.warranty_expiry) : null,
        amc_expiry_date: asset.amc_expiry_date ? dayjs(asset.amc_expiry_date) : null,
        installation_date: asset.installation_date ? dayjs(asset.installation_date) : null,
        warranty_start_date: asset.warranty_start_date ? dayjs(asset.warranty_start_date) : null,
        order_number: asset.order_number,
        supplier_details: asset.supplier_details,
        warranty_period: asset.warranty_period,
        current_value: asset.current_value,
        original_purchase_price: asset.original_purchase_price,
        vendor: asset.vendor,
        type: asset.type,
        depreciation_method: asset.depreciation_method,
        invoice_receipt: asset.invoice_receipt,
        ownership_proof: asset.ownership_proof,
        insurance_policy: asset.insurance_policy,
        lease_agreements: asset.lease_agreements
      };
      
      console.log("Setting form values:", formData);
      console.log("Status value being set:", formData.status);
      form.setFieldsValue(formData);
      
      // Reset file lists for editing (you might want to load existing files here)
      setFileList({
        invoice_receipt: [],
        ownership_proof: [],
        insurance_policy: [],
        lease_agreements: []
      });
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
        setBulkUploadVisible(false);
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

        // Map to exact field names the server expects - include ALL required fields
        updateData = {
          asset_id: editingAsset.asset_id,
          asset_name: values.asset_name?.toString() || '',
          category: values.category?.toString() || '',
          manufacturer_brand: values.manufacturer?.toString() || '',
          model_number: values.model?.toString() || '',
          serial_number: values.serial_number?.toString() || '',
          location: values.location?.toString() || '', // API expects 'location' not 'asset_location'
          assigned_user: values.assigned_user?.toString() || '',
          owning_department: values.department?.toString() || '',
          building_facility: values.building_facility?.toString() || '',
          floor_room: values.floor_room?.toString() || '',
          gps_coordinates: values.gps_coordinates?.toString() || '',
          status: values.status?.toString() || '',
          purchase_date: formatDateForUpdate(values.purchase_date),
          warranty_expiry: formatDateForUpdate(values.warranty_expiry), // API expects 'warranty_expiry' not 'warranty_expiry_date'
          order_number: values.order_number?.toString() || '',
          supplier_details: values.supplier_details?.toString() || '',
          installation_date: formatDateForUpdate(values.installation_date),
          warranty_period: parseInt(values.warranty_period) || 0,
          warranty_start_date: formatDateForUpdate(values.warranty_start_date),
          current_book_value: parseFloat(values.current_value) || 0,
          original_purchase_price: parseFloat(values.original_purchase_price) || 0,
          asset_cost: parseFloat(values.current_value) || 0, // Use current_value as asset_cost
          supplier_vendor: values.vendor?.toString() || '', // API expects 'supplier_vendor' not 'vendor_name'
          invoice_receipt: values.invoice_receipt || '',
          ownership_proof: values.ownership_proof || '',
          insurance_policy: values.insurance_policy || '',
          lease_agreements: values.lease_agreements || ''
        };
        
        // Add optional fields if they have values
        if (values.amc_expiry_date) {
          updateData.amc_expiry_date = values.amc_expiry_date;
        }
        if (values.type) {
          updateData.type = values.type.toString();
        }
        if (values.depreciation_method) {
          updateData.depreciation_method = values.depreciation_method.toString();
        }
        
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

        // Generate standardized asset ID if not provided
        let generatedAssetId = values.asset_id;
        if (!generatedAssetId || !validateAssetId(generatedAssetId)) {
          generatedAssetId = autoGenerateAssetId(values);
        }

        // Process file uploads
        const processedFiles = {
          invoice_receipt_files: await processFilesForAPI(fileList.invoice_receipt),
          ownership_proof_files: await processFilesForAPI(fileList.ownership_proof),
          insurance_policy_files: await processFilesForAPI(fileList.insurance_policy),
          lease_agreement_files: await processFilesForAPI(fileList.lease_agreements)
        };

        // Map to exact field names the server expects - include ALL required fields
        createData = {
          id: generatedAssetId, // Use standardized asset ID
          asset_id: generatedAssetId, // Keep both for compatibility
          asset_name: values.asset_name?.toString() || '',
          category: values.category?.toString() || '',
          manufacturer_brand: values.manufacturer?.toString() || '',
          model_number: values.model?.toString() || '',
          serial_number: values.serial_number?.toString() || '',
          location: values.location?.toString() || '', // API expects 'location' not 'asset_location'
          assigned_user: values.assigned_user?.toString() || '',
          owning_department: values.department?.toString() || '',
          building_facility: values.building_facility?.toString() || '',
          floor_room_number: values.floor_room?.toString() || '',
          gps_coordinates: values.gps_coordinates?.toString() || '',
          status: values.status?.toString() || '',
          purchase_date: formatDate(values.purchase_date),
          warranty_expiry: formatDate(values.warranty_expiry), // API expects 'warranty_expiry' not 'warranty_expiry_date'
          amc_expiry: formatDate(values.amc_expiry_date),
          warranty_period_months: parseInt(values.warranty_period) || 0,
          order_number: values.order_number?.toString() || '',
          supplier_vendor: values.vendor?.toString() || '', // API expects 'supplier_vendor' not 'vendor_name'
          current_book_value: parseFloat(values.current_value) || 0,
          original_purchase_price: parseFloat(values.original_purchase_price) || 0,
          asset_type: values.type?.toString() || '',
          depreciation_method: values.depreciation_method?.toString() || '',
          installation_date: formatDate(values.installation_date),
          // File uploads
          invoice_receipt_files: processedFiles.invoice_receipt_files.length > 0 ? processedFiles.invoice_receipt_files[0].attachment_name : '',
          ownership_proof_files: processedFiles.ownership_proof_files.length > 0 ? processedFiles.ownership_proof_files[0].attachment_name : '',
          insurance_policy_files: processedFiles.insurance_policy_files.length > 0 ? processedFiles.insurance_policy_files[0].attachment_name : '',
          lease_agreement_files: processedFiles.lease_agreement_files.length > 0 ? processedFiles.lease_agreement_files[0].attachment_name : null,
          images: [
            ...processedFiles.invoice_receipt_files,
            ...processedFiles.ownership_proof_files,
            ...processedFiles.insurance_policy_files,
            ...processedFiles.lease_agreement_files
          ]
        };
        
        // Add optional fields if they have values
        if (values.amc_expiry_date) {
          createData.amc_expiry_date = formatDate(values.amc_expiry_date);
        }
        if (values.type) {
          createData.type = values.type.toString();
        }
        if (values.depreciation_method) {
          createData.depreciation_method = values.depreciation_method.toString();
        }
        
        // Validate that all required fields have non-empty values (all essential fields)
        const requiredFields = ['asset_id', 'asset_name', 'category', 'manufacturer_brand', 'model_number', 'serial_number', 'location', 'assigned_user', 'owning_department', 'status', 'purchase_date', 'warranty_expiry', 'current_book_value', 'original_purchase_price', 'supplier_vendor'];
        const missingFields = requiredFields.filter(field => !createData[field] || createData[field] === '');
        
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
          <Upload {...uploadProps}>
            <button className="btn btn-warning px-4">
              <FaUpload /> Bulk Upload
            </button>
          </Upload>
          <ExportButton
            data={assets}
            columns={columns}
            filename="Asset_Register_Report"
            title="Asset Register Report"
            reportType="asset-register"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
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
                name="asset_id"
                label="Asset ID"
                rules={[
                  { required: false, message: "Please enter asset ID" },
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (validateAssetId(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Asset ID must follow format: BLR-IT-LTP-2025-0012'));
                    }
                  }
                ]}
                tooltip="Format: BLR-IT-LTP-2025-0012 (Location-Department-Type-Year-Number). Leave empty for auto-generation."
              >
                <Input placeholder="e.g., BLR-IT-LTP-2025-0012 (auto-generated if empty)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="asset_name"
                label="Asset Name"
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
                label="Category"
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
                label="Manufacturer / Brand"
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
                label="Model Number"
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
                  { pattern: /^[a-zA-Z0-9\-_]+$/, message: "Serial number can only contain letters, numbers, hyphens, and underscores" }
                ]}
              >
                <Input placeholder="Enter serial number" />
              </Form.Item>
            </Col>
          </Row>

          <h5>Location & Assignment</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="location"
                label="Asset Location"
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
            <Col span={8}>
              <Form.Item
                name="assigned_user"
                label="Assigned User"
                rules={[
                  { max: 50, message: "Assigned user name cannot exceed 50 characters" },
                  { pattern: /^[a-zA-Z\s]+$/, message: "Assigned user name can only contain letters and spaces" }
                ]}
              >
                <Input placeholder="Enter assigned user" />
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
                label="Asset Status"
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
                      if (isDateInFuture(value)) {
                        return Promise.reject(new Error('Purchase date cannot be in the future'));
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
                      if (isDateInFuture(value)) {
                        return Promise.reject(new Error('Installation date cannot be in the future'));
                      }
                      if (isDateBefore(value, '1900-01-01')) {
                        return Promise.reject(new Error('Installation date cannot be before 1900'));
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
                      if (isDateInFuture(value)) {
                        return Promise.reject(new Error('Warranty start date cannot be in the future'));
                      }
                      if (isDateBefore(value, '1900-01-01')) {
                        return Promise.reject(new Error('Warranty start date cannot be before 1900'));
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
                <Input type="number" placeholder="Enter warranty period in months" min="0" max="1200" />
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
            <Col span={12}>
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
            </Col>
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
                label=" Current Book Value"
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
                label="Vendor / Supplier Name"
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
                <AssetTypesDropdown 
                  placeholder="Select asset type"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                name="depreciation_method"
                label=" Depreciation Method"
                rules={[
                  { max: 50, message: "Depreciation method cannot exceed 50 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_]+$/, message: "Depreciation method contains invalid characters" }
                ]}
              >
                <Select placeholder="Select depreciation method">
                  <Option value="Straight Line Method (SLM)">Straight Line Method (SLM)</Option>
                  <Option value="Written Down Value (WDV)">Written Down Value (WDV)</Option>
                  <Option value="Double Declining Balance (DDB)">Double Declining Balance (DDB)</Option>
                  <Option value="Sum of the Years' Digits (SYD)">Sum of the Years' Digits (SYD)</Option>
                  <Option value="Units of Production">Units of Production</Option>
                  <Option value="No Depreciation">No Depreciation</Option>
                  <Option value="Accelerated Depreciation">Accelerated Depreciation</Option>
                  <Option value="Declining Balance Method">Declining Balance Method</Option>
                  <Option value="150% Declining Balance">150% Declining Balance</Option>
                  <Option value="Compound Interest Method">Compound Interest Method</Option>
                  <Option value="Annuity Method">Annuity Method</Option>
                  <Option value="Revaluation Method">Revaluation Method</Option>
                  <Option value="Group or Composite Method">Group or Composite Method</Option>
                  <Option value="Depletion Method">Depletion Method</Option>
                  <Option value="Machine Hour Rate Method">Machine Hour Rate Method</Option>
                  <Option value="Sinking Fund Method">Sinking Fund Method</Option>
                  <Option value="Insurance Policy Method">Insurance Policy Method</Option>
                  <Option value="Activity-Based Depreciation">Activity-Based Depreciation</Option>
                  <Option value="Usage-Based Depreciation">Usage-Based Depreciation</Option>
                  <Option value="Custom Schedule">Custom Schedule</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Document Upload Section */}
          <h5>Required Documents</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="invoice_receipt"
                label="Invoice/Receipt Copies"
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
                label="Proof of Ownership Papers"
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
                label="Insurance Policy Documents"
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
                Cancel
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
    </div>
  );
};

export default Register;