import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { FaSearch, FaEdit, FaTrash, FaEye } from "react-icons/fa";
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
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { isValidDate, isDateInFuture, isDateInPast, isDateBefore } from '../utils/dateUtils';
import { formatDateForDB, parseDateFromDB } from "../utils/dateUtils";

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
  const [form] = Form.useForm();
  const [editingAsset, setEditingAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://202.53.92.35:5004/api/settings/getSettingCategoriesList");
      
      console.log("Categories API Response:", response.data);
      
      let categoriesData = [];
      
      // Handle different response formats
      if (response.data?.success && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data?.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else {
        console.warn("Unexpected categories API response format:", response.data);
        // Fallback to default categories
        categoriesData = [
          { category_name: "IT Equipment", category_id: "IT" },
          { category_name: "Office Furniture", category_id: "FURNITURE" },
          { category_name: "Vehicles", category_id: "VEHICLES" },
          { category_name: "Machinery", category_id: "MACHINERY" },
          { category_name: "Tools", category_id: "TOOLS" },
          { category_name: "Security Equipment", category_id: "SECURITY" },
          { category_name: "Medical Equipment", category_id: "MEDICAL" },
          { category_name: "Other", category_id: "OTHER" }
        ];
      }
      
      setCategories(categoriesData);
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      
      // Fallback to default categories on error
      const defaultCategories = [
        { category_name: "IT Equipment", category_id: "IT" },
        { category_name: "Office Furniture", category_id: "FURNITURE" },
        { category_name: "Vehicles", category_id: "VEHICLES" },
        { category_name: "Machinery", category_id: "MACHINERY" },
        { category_name: "Tools", category_id: "TOOLS" },
        { category_name: "Security Equipment", category_id: "SECURITY" },
        { category_name: "Medical Equipment", category_id: "MEDICAL" },
        { category_name: "Other", category_id: "OTHER" }
      ];
      setCategories(defaultCategories);
    }
  };

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get("http://202.53.92.35:5004/api/assets");
      
      console.log("Assets API Response:", response.data);
      console.log("Response type:", typeof response.data);
      console.log("Response keys:", Object.keys(response.data || {}));
      
      let assetsData = [];
      
      // Handle different response formats
      if (response.data?.success && Array.isArray(response.data.data)) {
        // Format: { success: true, data: [...] }
        assetsData = response.data.data;
        console.log("Using success.data format, found", assetsData.length, "assets");
      } else if (Array.isArray(response.data)) {
        // Format: [...] (direct array)
        assetsData = response.data;
        console.log("Using direct array format, found", assetsData.length, "assets");
      } else if (response.data?.assets && Array.isArray(response.data.assets)) {
        // Format: { assets: [...] }
        assetsData = response.data.assets;
        console.log("Using assets property format, found", assetsData.length, "assets");
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        // Format: { results: [...] }
        assetsData = response.data.results;
        console.log("Using results property format, found", assetsData.length, "assets");
      } else {
        console.warn("Unexpected API response format:", response.data);
        console.log("Available properties:", Object.keys(response.data || {}));
        
        // Try to find any array property
        const arrayProperties = Object.values(response.data || {}).filter(Array.isArray);
        if (arrayProperties.length > 0) {
          assetsData = arrayProperties[0];
          console.log("Found array in response:", arrayProperties[0].length, "items");
        } else {
          console.log("No array found in response, using empty data");
          // Fallback to empty data
          setAssets([]);
          return;
        }
      }
      
      // Process the assets data and map field names
      const dataWithKeys = assetsData.map((item, index) => ({
        ...item,
        key: item.asset_id || item.id || index.toString(),
        // Map API field names to expected field names
        type: item.type || item.asset_type || item.manufacturer_brand || '',
        location: item.location || item.asset_location || '',
        status: item.status || item.asset_status || 'Active',
      }));
      
      console.log("Final processed assets:", dataWithKeys);
      setAssets(dataWithKeys);
      
    } catch (error) {
      console.error("Error fetching assets:", error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.warning("⚠️ API server is not running. Showing sample data. Please start the backend server on 202.53.92.35:5004");
      } else {
        message.error("Failed to fetch assets: " + (error.message || "Unknown error"));
      }
      
      // Fallback to empty data
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchCategories();
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

  const columns = [
    {
      title: "Asset ID",
      dataIndex: "asset_id",
      key: "asset_id",
      sorter: (a, b) => a.asset_id?.localeCompare(b.asset_id),
      ...getColumnSearchProps('asset_id'),
    },
    {
      title: "Asset Name",
      dataIndex: "asset_name",
      key: "asset_name",
      sorter: (a, b) => a.asset_name?.localeCompare(b.asset_name),
      ...getColumnSearchProps('asset_name'),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => a.category?.localeCompare(b.category),
      ...getColumnSearchProps('category'),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type?.localeCompare(b.type),
      ...getColumnSearchProps('type'),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      sorter: (a, b) => a.location?.localeCompare(b.location),
      ...getColumnSearchProps('location'),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status?.localeCompare(b.status),
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
      ...getColumnSearchProps('purchase_date'),
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
          <Popconfirm
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
          </Popconfirm>
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
        purchase_date: asset.purchase_date,
        warranty_expiry: asset.warranty_expiry,
        amc_expiry_date: asset.amc_expiry_date,
        order_number: asset.order_number,
        supplier_details: asset.supplier_details,
        installation_date: asset.installation_date,
        warranty_period: asset.warranty_period,
        warranty_start_date: asset.warranty_start_date,
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
    } else {
      form.resetFields();
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setEditingAsset(null);
    setSubmitting(false);
    form.resetFields();
  };

  const handleDelete = async (assetId) => {
    try {
      await axios.delete("http://202.53.92.35:5004/api/assets", {
        data: { asset_id: assetId }
      });
      message.success("Asset deleted successfully");
      fetchAssets(); // Refresh the list
    } catch (error) {
      console.error("Error deleting asset:", error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please start the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`Failed to delete asset: ${error.response.data.message}`);
      } else {
        message.error("Failed to delete asset. Please check your connection and try again.");
      }
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
        
        const response = await axios.put("http://202.53.92.35:5004/api/assets", updateData);
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
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

        // Map to exact field names the server expects - include ALL required fields
        createData = {
          id: values.asset_id || Date.now(), // Generate ID if not provided
          asset_id: values.asset_id || Date.now(), // Keep both for compatibility
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
          purchase_date: formatDate(values.purchase_date),
          warranty_expiry: formatDate(values.warranty_expiry), // API expects 'warranty_expiry' not 'warranty_expiry_date'
          order_number: values.order_number?.toString() || '',
          supplier_details: values.supplier_details?.toString() || '',
          installation_date: formatDate(values.installation_date),
          warranty_period: parseInt(values.warranty_period) || 0,
          warranty_start_date: formatDate(values.warranty_start_date),
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
          const testResponse = await axios.get("http://202.53.92.35:5004/api/assets");
          console.log("API endpoint test successful:", testResponse.status);
        } catch (testError) {
          console.error("API endpoint test failed:", testError.response?.status, testError.response?.data);
        }
        
        const response = await axios.post("http://202.53.92.35:5004/api/assets", createData);
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
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
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h2 className="mb-1">Asset Register</h2>
          <p className="mt-0">The core screen where all assets are listed and searchable.</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showDrawer()}
        >
          Add Asset
        </Button>
      </div>

      <div className="card af-card mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Asset List</h5>
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
      </div>

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
                rules={[{ required: false, message: "Please enter asset ID" }]}
              >
                <Input placeholder="Enter asset ID (optional - will be auto-generated)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="asset_name"
                label="Asset Name"
                rules={[
                  { required: true, message: "Please enter asset name" },
                  { min: 2, message: "Asset name must be at least 2 characters" },
                  { max: 100, message: "Asset name cannot exceed 100 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_]+$/, message: "Asset name can only contain letters, numbers, spaces, hyphens, and underscores" }
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
                <Select placeholder="Select category" loading={categories.length === 0}>
                  {categories.map((category) => (
                    <Option key={category.category_id || category.id} value={category.category_name || category.name}>
                      {category.category_name || category.name}
                    </Option>
                  ))}
                </Select>
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
                  { required: true, message: "Please enter asset location" },
                  { max: 100, message: "Location cannot exceed 100 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_,.]+$/, message: "Location contains invalid characters" }
                ]}
              >
                <Input placeholder="Enter location" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="assigned_user"
                label="Assigned User / Employee"
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
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="In Maintenance">In Maintenance</Option>
                  <Option value="Inactive">Inactive</Option>
                  <Option value="Retired">Retired</Option>
                </Select>
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
                <Input type="date" />
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
                <Input type="date" />
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
                <Input type="date" />
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
                <Input type="date" />
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
                <Input type="date" />
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
                  { required: true, message: "Please enter vendor/supplier name" },
                  { max: 100, message: "Vendor name cannot exceed 100 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_&.,()]+$/, message: "Vendor name contains invalid characters" }
                ]}
              >
                <Input placeholder="Enter vendor name" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label="Asset Type"
                rules={[
                  { max: 50, message: "Asset type cannot exceed 50 characters" },
                  { pattern: /^[a-zA-Z0-9\s\-_]+$/, message: "Asset type contains invalid characters" }
                ]}
              >
                <Input placeholder="Enter asset type" />
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
                  <Option value="Straight Line">Straight Line</Option>
                  <Option value="Declining Balance">Declining Balance</Option>
                  <Option value="Sum of Years">Sum of Years</Option>
                  <Option value="Units of Production">Units of Production</Option>
                  <Option value="None">None</Option>
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
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple />
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
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="insurance_policy"
                label="Insurance Policy Numbers"
                rules={[
                  { required: true, message: "Please upload insurance policy documents" }
                ]}
              >
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lease_agreements"
                label="Lease Agreements (if applicable)"
              >
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple />
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