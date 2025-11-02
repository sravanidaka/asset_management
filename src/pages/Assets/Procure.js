import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import CustomBreadcrumb from '../../components/Breadcrumb';
import BackNavigation from '../../components/BackNavigation';
import ExportButton from '../../components/ExportButton';
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  message,
  InputNumber,
  Table,
  Drawer,
  Modal,
  Upload
} from "antd";
import { FaEdit, FaTrash, FaArrowLeft, FaUpload } from "react-icons/fa";
import { PlusOutlined, SearchOutlined, UploadOutlined, DownloadOutlined, InboxOutlined, FileTextOutlined, CheckCircleOutlined, CloudDownloadOutlined, CloudUploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { formatDateForAPI, parseDateFromDB } from "../../utils/dateUtils";
import { safeStringCompare } from '../../utils/tableUtils';
import { 
  StatusNamesDropdown,
  CategoriesDropdown,
  LocationsDropdown,
  VendorNamesDropdown,
  AssetIdsDropdownNew
} from '../../components/SettingsDropdown';

const { Option } = Select;

const Procure = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingProcurement, setEditingProcurement] = useState(null);
  const [categories, setCategories] = useState([]);
  const [requestedByOptions, setRequestedByOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [bulkUploadVisible, setBulkUploadVisible] = useState(false);
  const [bulkUploadDrawerVisible, setBulkUploadDrawerVisible] = useState(false);
  const [assetOptions, setAssetOptions] = useState([]);
  const [assetNameOptions, setAssetNameOptions] = useState([]);

  // Fetch employees from API for "Requested By" dropdown
  const fetchEmployeesForDropdown = async () => {
    try {
      const token = sessionStorage.getItem('token');
      console.log('🔍 Fetching employees from API...');
      
      const response = await fetch('http://202.53.92.35:5004/api/settings/getEmployeesList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token || ''
        }
      });

      if (!response.ok) {
        console.warn('Employees dropdown API failed with status:', response.status);
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        setEmployeeOptions([]);
        setRequestedByOptions([]);
        return;
      }

      const result = await response.json();
      console.log('📊 Raw API Response:', result);
      console.log('📊 Response type:', typeof result);
      console.log('📊 Response keys:', Object.keys(result || {}));

      let employeesData = [];
      if (Array.isArray(result)) {
        employeesData = result;
        console.log('✅ Using direct array, length:', employeesData.length);
      } else if (result.data && Array.isArray(result.data)) {
        employeesData = result.data;
        console.log('✅ Using result.data, length:', employeesData.length);
      } else if (result.employees && Array.isArray(result.employees)) {
        employeesData = result.employees;
        console.log('✅ Using result.employees, length:', employeesData.length);
      } else if (result.employeesList && Array.isArray(result.employeesList)) {
        employeesData = result.employeesList;
        console.log('✅ Using result.employeesList, length:', employeesData.length);
      } else if (result.employeeList && Array.isArray(result.employeeList)) {
        employeesData = result.employeeList;
        console.log('✅ Using result.employeeList, length:', employeesData.length);
      } else if (result.success && Array.isArray(result.data)) {
        employeesData = result.data;
        console.log('✅ Using result.success.data, length:', employeesData.length);
      } else if (result.result && Array.isArray(result.result)) {
        employeesData = result.result;
        console.log('✅ Using result.result, length:', employeesData.length);
      } else if (result.items && Array.isArray(result.items)) {
        employeesData = result.items;
        console.log('✅ Using result.items, length:', employeesData.length);
      } else {
        // Try to find any array in the result
        const firstArray = Object.values(result || {}).find(v => Array.isArray(v));
        if (firstArray) {
          employeesData = firstArray;
          console.log('✅ Using first array found in result, length:', employeesData.length);
        } else {
          console.error('❌ No array found in response. Full result:', result);
          console.log('Available keys:', Object.keys(result || {}));
        }
      }

      if (employeesData.length > 0) {
        console.log('📋 First employee item:', employeesData[0]);
        console.log('📋 First employee keys:', Object.keys(employeesData[0] || {}));
      }

      // Transform to dropdown options format with more robust field detection
      const options = employeesData.map((item, index) => {
        // PRIORITY 1: Try to get full name directly (most reliable)
        const fullNameDirect = item.full_name || 
                              item.fullName || 
                              item.employee_name || 
                              item.employeeName ||
                              item.name || 
                              item.display_name ||
                              item.displayName ||
                              item.employee_name_full ||
                              '';
        
        // PRIORITY 2: If no full name, try to construct from first + last name
        const firstName = item.first_name || item.firstname || item.firstName || item.fname || '';
        const lastName = item.last_name || item.lastname || item.lastName || item.lname || item.surname || '';
        const combined = `${firstName} ${lastName}`.trim();
        
        // Use full name if available, otherwise use combined first+last, otherwise fallback
        const employeeName = fullNameDirect || 
                            combined || 
                            firstName || 
                            lastName ||
                            item.username || 
                            item.email ||
                            '';
        
        // Try multiple ways to get employee ID (for form value - we store ID but display name)
        const employeeId = item.employee_id || 
                          item.emp_id || 
                          item.id || 
                          item.user_id || 
                          item.employeeId ||
                          item.empId ||
                          item.userId ||
                          item.value ||
                          (index + 1); // Fallback to index if no ID found
        
        // Ensure we always have a label (full name), use ID as fallback only if name is missing
        const displayLabel = employeeName || `Employee ${employeeId}` || `Employee ${index + 1}`;
        
        const option = {
          value: employeeId, // Store ID as value (for API submission)
          label: displayLabel, // Display full name in dropdown
          id: employeeId,
          name: employeeName || displayLabel,
          fullName: employeeName,
          ...item
        };
        
        console.log(`📋 Employee ${index + 1}:`, {
          original: item,
          firstName,
          lastName,
          combined,
          fullNameDirect,
          employeeName,
          employeeId,
          displayLabel,
          transformed: option
        });
        
        return option;
      });

      // Less strict filtering - only filter out if both value and label are missing
      const validOptions = options.filter(opt => {
        const isValid = (opt.value !== null && opt.value !== undefined && opt.value !== '') || 
                       (opt.label !== null && opt.label !== undefined && opt.label !== '');
        
        if (!isValid) {
          console.warn('⚠️ Filtered out invalid option:', opt);
        }
        
        return isValid;
      });

      console.log(`✅ Transformed ${validOptions.length} valid options out of ${options.length} total`);
      console.log('📊 Final options sample:', validOptions.slice(0, 3));

      setEmployeeOptions(validOptions);
      setRequestedByOptions(validOptions); // Keep for backward compatibility
      
      if (validOptions.length === 0) {
        console.warn('⚠️ No valid employee options found after transformation');
        message.warning('No employees found in dropdown. Please check API response.');
      } else {
        console.log('✅ Employees loaded for Requested By dropdown:', validOptions.length, 'items');
      }
    } catch (error) {
      console.error('❌ Error fetching employees for dropdown:', error);
      console.error('Error details:', error.message, error.stack);
      setEmployeeOptions([]);
      setRequestedByOptions([]);
      message.error('Failed to load employees. Please check console for details.');
    }
  };

  // Fetch assets for Asset ID dropdown (showing Asset Code labels)
  const fetchAssetsForDropdown = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/assets/dropdown/asset-ids', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token || ''
        }
      });

      if (!response.ok) {
        console.warn('Assets dropdown API failed with status:', response.status);
        setAssetOptions([]);
        return;
      }

      const result = await response.json();

      // Expected shape: { success: true, data: [ { asset_id, asset_code }, ... ] }
      const assetsData = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      const options = assetsData
        .map((item) => ({
          value: item.asset_id || item.id,
          label: item.asset_code || item.asset_id || item.asset_name || '',
        }))
        .filter(opt => opt.value && String(opt.value).trim() !== '' && opt.label && String(opt.label).trim() !== '');

      setAssetOptions(options);
    } catch (error) {
      console.error('Error fetching assets for dropdown:', error);
      setAssetOptions([]);
    }
  };

  // Fetch asset names from /api/assets/dropdown/asset-ids for Asset Name dropdown
  const fetchAssetNamesForDropdown = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/assets/dropdown/asset-ids', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token || ''
        }
      });

      if (!response.ok) {
        console.warn('Asset names dropdown API failed with status:', response.status);
        setAssetNameOptions([]);
        return;
      }

      const result = await response.json();
      console.log('Asset names API response:', result);

      let assetsData = [];
      if (Array.isArray(result)) {
        assetsData = result;
      } else if (result.data && Array.isArray(result.data)) {
        assetsData = result.data;
      } else if (result.asset_ids && Array.isArray(result.asset_ids)) {
        assetsData = result.asset_ids;
      } else if (result.success && Array.isArray(result.data)) {
        assetsData = result.data;
      } else {
        const firstArray = Object.values(result || {}).find(v => Array.isArray(v));
        assetsData = firstArray || [];
      }

      // Transform data to show asset names for the dropdown
      const options = assetsData
        .map((item) => ({
          value: item.asset_name || item.name || item.asset_id || item.id || '',
          label: item.asset_name || item.name || item.label || item.asset_id || item.id || '',
          id: item.asset_id || item.id,
          asset_id: item.asset_id || item.id,
          asset_name: item.asset_name || item.name,
          ...item
        }))
        .filter(opt => opt.value && opt.label);

      setAssetNameOptions(options);
      console.log('Asset names loaded for dropdown:', options.length, 'items');
    } catch (error) {
      console.error('Error fetching asset names for dropdown:', error);
      setAssetNameOptions([]);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getSettingCategoriesList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token || ''
        }
      });
      
      console.log("Categories API Response Status:", response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log("Categories API Response Data:", result);
        
        let categoriesData = [];
        
        // Handle different response formats
        if (result.success && Array.isArray(result.data)) {
          categoriesData = result.data;
        } else if (Array.isArray(result.data)) {
          categoriesData = result.data;
        } else if (result.data?.categories && Array.isArray(result.data.categories)) {
          categoriesData = result.data.categories;
        } else if (Array.isArray(result)) {
          categoriesData = result;
        } else {
          console.warn("Unexpected categories API response format:", result);
          // Fallback to default categories
          categoriesData = [
            { category_name: "IT Equipment", category_id: "IT" },
            { category_name: "Office Furniture", category_id: "FURNITURE" },
            { category_name: "Vehicles", category_id: "VEHICLES" },
            { category_name: "Machinery", category_id: "MACHINERY" },
            { category_name: "Electronics", category_id: "ELECTRONICS" }
          ];
        }
        
        setCategories(categoriesData);
        console.log("Categories loaded successfully:", categoriesData.length, "items");
        
      } else {
        console.warn("Categories API failed with status:", response.status);
        // Fallback to default categories
        const defaultCategories = [
          { category_name: "IT Equipment", category_id: "IT" },
          { category_name: "Office Furniture", category_id: "FURNITURE" },
          { category_name: "Vehicles", category_id: "VEHICLES" },
          { category_name: "Machinery", category_id: "MACHINERY" },
          { category_name: "Electronics", category_id: "ELECTRONICS" }
        ];
        setCategories(defaultCategories);
      }
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      
      // Fallback to default categories on error
      const defaultCategories = [
        { category_name: "IT Equipment", category_id: "IT" },
        { category_name: "Office Furniture", category_id: "FURNITURE" },
        { category_name: "Vehicles", category_id: "VEHICLES" },
        { category_name: "Machinery", category_id: "MACHINERY" },
        { category_name: "Electronics", category_id: "ELECTRONICS" }
      ];
      setCategories(defaultCategories);
    }
  };

  // Fetch procurement data from API
  const fetchProcurements = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      console.log('Fetching procurements from API...');
      
      if (!token) {
        throw new Error("No authentication token found. Please login first.");
      }
      
      const apiUrl = `http://202.53.92.35:5004/api/assets/procure`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-access-token": token,
        }
      });
      
      if (!response || !response.ok) {
        const errorText = response ? await response.text() : 'No response received';
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response?.status || 'No response'}, message: ${errorText}`);
      }
      
      const result = await response.json();
    
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API, length:", data.length);
      } else if (result.indents && Array.isArray(result.indents)) {
        data = result.indents;
        console.log("Using result.indents, length:", data.length);
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
        console.log("Using result.data, length:", data.length);
      } else if (result.procurements && Array.isArray(result.procurements)) {
        data = result.procurements;
        console.log("Using result.procurements, length:", data.length);
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
        console.log("Using result.result, length:", data.length);
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
        console.log("Using result.items, length:", data.length);
      } else {
        console.error("Unexpected API response structure:", result);
        console.log("Available keys in result:", Object.keys(result));
        data = [];
      }
    
      // Add key property for each item (required by Ant Design Table)
      const dataWithKeys = data.map((item, index) => ({
        ...item,
        key: item.id || item._id || index.toString(),
      }));
      
      setDataSource(dataWithKeys);
      
      if (dataWithKeys.length > 0) {
        message.success(`Procurements loaded successfully (${dataWithKeys.length} items)`);
      } else {
        message.warning("No procurement data found. The table is empty.");
      }
    } catch (error) {
      console.error("Error fetching procurements:", error);
      console.error("Error details:", error.message);
      message.error(`Failed to load procurements: ${error.message}`);
      
      // Set empty data source on error
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get employee name by ID (for table display)
  const getEmployeeNameById = (employeeId) => {
    if (!employeeId) return employeeId;
    const employee = employeeOptions.find(emp => 
      emp.id == employeeId || 
      emp.value == employeeId || 
      String(emp.id) === String(employeeId) || 
      String(emp.value) === String(employeeId)
    );
    return employee ? (employee.label || employee.name) : employeeId;
  };

  useEffect(() => {
    fetchCategories();
    fetchEmployeesForDropdown(); // Use employees API for Requested By dropdown
    fetchProcurements();
    fetchAssetsForDropdown();
    fetchAssetNamesForDropdown(); // Fetch asset names for Asset Name dropdown
  }, []);

  // Handle table change for filters and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Dynamic table columns based on available data
  const getDynamicColumns = () => {
    if (dataSource.length === 0) return [];
    
    // Define only the fields that should be shown
    const allPossibleFields = [
      'indent_number', 'requested_by', 'requested_date', 'category', 'asset_id', 
      'asset_name', 'quantity', 'po_number', 'supplier_vendor', 'received_date'
    ];
    
    // Get fields that have actual data (not N/A, null, undefined, empty)
    const getFieldsWithData = () => {
      const fieldsWithData = new Set();
      
      // First, add all possible fields that exist in the data
      allPossibleFields.forEach(field => {
        if (dataSource.some(item => item[field] !== undefined && item[field] !== null)) {
          fieldsWithData.add(field);
        }
      });
      
      // Then add any other fields that have data
      dataSource.forEach(item => {
        Object.keys(item).forEach(key => {
          if (key !== 'key' && 
              item[key] !== 'N/A' && 
              item[key] !== null && 
              item[key] !== undefined && 
              item[key] !== '' &&
              item[key] !== 'null' &&
              item[key] !== 'undefined') {
            fieldsWithData.add(key);
          }
        });
      });
      
      return Array.from(fieldsWithData);
    };
    
    const availableFields = getFieldsWithData();
    
    // Define field mappings with display names, render functions, and filters
    const fieldMappings = {
      indent_number: { 
        title: "Indent Number", 
        sorter: (a, b) => safeStringCompare(a.indent_number, b.indent_number),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.indent_number?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search indent number"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.indent_number || null,
      },
      requested_by: { 
        title: "Requested By", 
        sorter: (a, b) => {
          const nameA = getEmployeeNameById(a.requested_by);
          const nameB = getEmployeeNameById(b.requested_by);
          return safeStringCompare(nameA, nameB);
        },
        render: (text, record) => {
          if (!text || text === 'N/A') return '-';
          // Display employee name instead of ID
          const employeeName = getEmployeeNameById(record.requested_by || text);
          return employeeName !== (record.requested_by || text) ? employeeName : text;
        },
        onFilter: (value, record) => {
          const employeeName = getEmployeeNameById(record.requested_by);
          return employeeName?.toString().toLowerCase().includes(value.toLowerCase()) ||
                 record.requested_by?.toString().toLowerCase().includes(value.toLowerCase());
        },
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search requested by"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.requested_by || null,
      },
      asset_name: { 
        title: "Asset Name", 
        sorter: (a, b) => safeStringCompare(a.asset_name, b.asset_name),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.asset_name?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search asset name"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.asset_name || null,
      },
      supplier_vendor: { 
        title: "Supplier/Vendor", 
        sorter: (a, b) => safeStringCompare(a.supplier_vendor, b.supplier_vendor),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.supplier_vendor?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search supplier/vendor"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.supplier_vendor || null,
      }
    };
    
    // Create columns for all possible fields first, then add any additional fields
    const columns = [];
    
    // Add Serial Number column
    columns.push({
      title: "S.No",
      key: "serial",
      width: 80,
      render: (text, record, index) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    });
    
    // Add all standard fields
    allPossibleFields.forEach(field => {
      if (fieldMappings[field]) {
        columns.push({
          title: fieldMappings[field].title,
          dataIndex: field,
          key: field,
          sorter: fieldMappings[field].sorter,
          render: fieldMappings[field].render,
          onFilter: fieldMappings[field].onFilter,
          filterDropdown: fieldMappings[field].filterDropdown,
          filteredValue: fieldMappings[field].filteredValue,
          ellipsis: true,
        });
      }
    });
    
    // Add any additional fields that aren't in the standard list
    availableFields
      .filter(field => !allPossibleFields.includes(field) && fieldMappings[field])
      .forEach(field => {
        columns.push({
          title: fieldMappings[field].title,
          dataIndex: field,
          key: field,
          sorter: fieldMappings[field].sorter,
          render: fieldMappings[field].render,
          onFilter: fieldMappings[field].onFilter,
          filterDropdown: fieldMappings[field].filterDropdown,
          filteredValue: fieldMappings[field].filteredValue,
          ellipsis: true,
        });
      });
    
    // Add Actions column
    columns.push({
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="default" size="small" icon={<FaEdit />} onClick={() => handleEdit(record)} />
          {/* <Button type="primary" danger size="small" icon={<FaTrash />} onClick={() => handleDelete(record)} /> */}
        </Space>
      ),
    });
    
    return columns;
  };

  const columns = getDynamicColumns();

  // Open drawer for create
  const handleCreate = () => {
    form.resetFields();
    setEditingProcurement(null);
    setDrawerVisible(true);
  };

  // Open drawer for edit
  const handleEdit = (record) => {
    console.log("Edit record:", record);
    
    // Helper function to clean values (remove N/A, null, undefined)
    const cleanValue = (value) => {
      if (value === 'N/A' || value === null || value === undefined || value === '') {
        return undefined; // Return undefined so form field shows as empty
      }
      return value;
    };
    
    // Helper function to convert ISO date to YYYY-MM-DD format
    const formatDateForInput = (dateString) => {
      if (!dateString || dateString === 'N/A') return undefined;
      try {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD
      } catch (error) {
        console.log('Date conversion error:', error);
        return undefined;
      }
    };
    
    // Helper function to normalize dropdown value (ID) from stored name or ID
    const normalizeRequestedByValue = (value) => {
      if (!value) return undefined;
      
      // First try to find by ID (most common case)
      let match = employeeOptions.find(opt => 
        opt.id == value || 
        opt.value == value ||
        String(opt.id) === String(value) || 
        String(opt.value) === String(value)
      );
      
      // If not found by ID, try to find by name/label (in case value is a name string)
      if (!match) {
        match = employeeOptions.find(opt => {
          const optLabel = String(opt.label || opt.fullName || opt.name || '').trim().toLowerCase();
          const optValue = String(value).trim().toLowerCase();
          return optLabel === optValue || 
                 optLabel.includes(optValue) || 
                 optValue.includes(optLabel);
        });
      }
      
      // Return the option's value (ID) if found, otherwise return value as-is
      return match ? match.value : value;
    };

    // Set form values with cleaned data
    form.setFieldsValue({
      indent_number: cleanValue(record.indent_number),
      requested_by: normalizeRequestedByValue(cleanValue(record.requested_by)),
      requested_date: formatDateForInput(record.requested_date),
      category: cleanValue(record.category),
      asset_id: cleanValue(record.asset_id),
      asset_name: cleanValue(record.asset_name),
      quantity: cleanValue(record.quantity),
      po_number: cleanValue(record.po_number),
      supplier_vendor: cleanValue(record.supplier_vendor),
      received_date: formatDateForInput(record.received_date),
      invoice_details: cleanValue(record.invoice_details),
      justification: cleanValue(record.justification),
    });
    
    setEditingProcurement(record);
    setDrawerVisible(true);
  };

  // Handle delete
  const handleDelete = (record) => {
    console.log("Delete record:", record);
    console.log("Record ID:", record.id || record.key);
    
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this procurement?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/assets/procure", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": sessionStorage.getItem("token"),
            },
            body: JSON.stringify({ id: deleteId }),
          });
          
          console.log("Delete response status:", response.status);
          console.log("Delete response ok:", response.ok);
          
          if (response.ok) {
            const result = await response.json();
            console.log("Delete response data:", result);
            message.success("Procurement deleted successfully!");
            await fetchProcurements(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete procurement: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting procurement:", error);
          message.error(`Failed to delete procurement: ${error.message}`);
        }
      },
    });
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Procurement form submitted with values:", values);
    message.loading("Saving procurement...", 0);
    
    // Validate required fields
    const requiredFields = ['indent_number', 'requested_by', 'requested_date', 'category', 'asset_id', 'asset_name', 'quantity'];
    const missingFields = requiredFields.filter(field => !values[field] || values[field] === '');
    
    if (missingFields.length > 0) {
      message.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
      message.destroy();
      return;
    }
    
    try {
      setLoading(true);
      
      if (editingProcurement) {
        // Update existing procurement
        console.log("Updating procurement:", editingProcurement);
        const updateData = {
          id: editingProcurement.id,
          indent_number: values.indent_number || '',
          requested_by: values.requested_by || '',
          requested_date: values.requested_date ? formatDateForAPI(values.requested_date) : null,
          status: values.status || 'Pending',
          category: values.category || '',
          asset_id: values.asset_id || '',
          asset_name: values.asset_name || '',
          quantity: parseInt(values.quantity) || 1,
          po_number: values.po_number || '',
          supplier_vendor: values.supplier_vendor || '',
          received_date: values.received_date ? formatDateForAPI(values.received_date) : null,
          invoice_details: values.invoice_details || '',
          justification: values.justification || ''
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
        const token = sessionStorage.getItem("token") || '';
        console.log("Using token for update:", token);

        // Try different update endpoints
        let response;
        try {
          response = await axios.put(
            "http://202.53.92.35:5004/api/assets/procure",
            updateData,
            {
              headers: {
                "x-access-token": token,
                "Content-Type": "application/json"
              }
            }
          );
        } catch (putError) {
          console.log("PUT failed, trying PATCH...");
          try {
            response = await axios.patch(
              "http://202.53.92.35:5004/api/assets/procure",
              updateData,
              {
                headers: {
                  "x-access-token": token,
                  "Content-Type": "application/json"
                }
              }
            );
          } catch (patchError) {
            console.log("PATCH failed, trying POST with update...");
            response = await axios.post(
              "http://202.53.92.35:5004/api/assets/procure/update",
              updateData,
              {
                headers: {
                  "x-access-token": token,
                  "Content-Type": "application/json"
                }
              }
            );
          }
        }
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Procurement updated successfully!");
      } else {
        // Create new procurement
        console.log("Creating new procurement");
        const createData = {
          indent_number: values.indent_number || '',
          requested_by: values.requested_by || '',
          requested_date: values.requested_date ? formatDateForAPI(values.requested_date) : null,
          status: values.status || 'Pending',
          category: values.category || '',
          asset_id: values.asset_id || '',
          asset_name: values.asset_name || '',
          quantity: parseInt(values.quantity) || 1,
          po_number: values.po_number || '',
          supplier_vendor: values.supplier_vendor || '',
          received_date: values.received_date ? formatDateForAPI(values.received_date) : null,
          invoice_details: values.invoice_details || '',
          justification: values.justification || ''
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        
        const token = sessionStorage.getItem("token") || '';
        console.log("Using token for create:", token);

        const response = await axios.post("http://202.53.92.35:5004/api/assets/procure", createData, {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json"
          }
        });
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Procurement created successfully!");
      }
      
      // Refresh the table data immediately
      await fetchProcurements();
      
      form.resetFields();
      setEditingProcurement(null);
      setDrawerVisible(false);
    } catch (error) {
      console.error("Error saving procurement:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      message.destroy(); // Clear loading message
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Bad Request - Invalid data format";
        console.error("400 Bad Request details:", error.response?.data);
        // console.error("Request data that caused 400:", editingProcurement ? updateData : createData);
        message.error(`❌ Invalid data: ${errorMessage}`);
      } else if (error.response?.status === 500) {
        console.error("500 Internal Server Error details:", error.response?.data);
        const serverError = error.response?.data?.message || error.response?.data?.error || "Internal server error";
        message.error(`❌ Server Error (500): ${serverError}`);
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please start the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save procurement: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save procurement. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingProcurement(null);
    setDrawerVisible(false);
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
      
      const response = await fetch("http://202.53.92.35:5004/api/assets/procure/bulk-upload", {
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
        await fetchProcurements(); // Refresh the table
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

  // CSV headers for procurement template
  const csvHeaders = [
    'S.No',
    'Indent Number',
    'Requested By',
    'Requested Date',
    'Category',
    'Asset ID',
    'Asset Name',
    'Quantity',
    'PO Number',
    'Supplier/Vendor',
    'Received Date',
    'Invoice Details',
    'Justification',
    'Status'
  ];

  // Download sample Excel template
  const downloadSampleExcel = () => {
    // Define field names only (no sample data)
    const fieldNames = [
      'Indent Number',
      'Requested By',
      'Requested Date',
      'Category',
      'Asset ID',
      'Asset Name',
      'Quantity',
      'PO Number',
      'Supplier/Vendor',
      'Received Date',
      'Invoice Details',
      'Justification',
      'Status'
    ];

    // Create CSV content with headers only
    const csvContent = fieldNames.join(',') + '\n';

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'procurement_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('✅ Excel template downloaded!');
  };

  return (
    <div className="container-fluid p-1 position-relative" style={{ minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Back Navigation */}
        <BackNavigation />
        
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      {/* Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Asset Procurement & Indent</h2>
          <span className="text-muted">The core screen for managing asset procurement requests and indent processing.</span>
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
            data={dataSource}
            columns={null}
            filename="Procurement_Management_Report"
            title="Procurement Management Report"
            reportType="procurement-management"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
            includeAllFields={true}
          />
          <button
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Procurement
          </button>
        </div>
      </div>

      {/* Procurements Table */}
      
         
          <Table
            columns={columns}
            dataSource={dataSource}
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
        title={editingProcurement !== null ? "Edit Procurement" : "Add Procurement"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          {/* Indent Request Details */}
          <h5 className="mb-3">Indent Request Details</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="requested_by"
                label="Requested By"
                rules={[{ required: true, message: "Please select requester" }]}
              >
                <Select
                  placeholder="Select requester"
                  showSearch={true}
                  allowClear={true}
                  optionLabelProp="title"
                  filterOption={(input, option) => {
                    const label = option?.label || option?.children || '';
                    return String(label).toLowerCase().includes(String(input).toLowerCase());
                  }}
                >
                  {employeeOptions.map((option) => (
                    <Option 
                      key={option.id || option.value} 
                      value={option.value} 
                      title={option.label || option.fullName || option.name}
                    >
                      {option.label || option.fullName || option.name || option.value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requested_date"
                label="Requested Date"
                rules={[{ required: true, message: "Please select requested date" }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <CategoriesDropdown 
                  placeholder="Select category"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="asset_id"
                label="Asset ID"
                rules={[{ required: true, message: "Please select asset" }]}
              >
                <Select
                  showSearch
                  placeholder="Select asset (shows Asset Code)"
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                  allowClear
                >
                  {assetOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="asset_name"
                label="Asset Name"
                rules={[{ required: true, message: "Please select asset name" }]}
              >
                <Select 
                  placeholder="Select asset name"
                  showSearch={true}
                  allowClear={true}
                  optionLabelProp="title"
                  filterOption={(input, option) => {
                    const label = option?.label || option?.children || '';
                    return String(label).toLowerCase().includes(String(input).toLowerCase());
                  }}
                >
                  {assetNameOptions.map((option) => (
                    <Option key={option.id || option.value} value={option.value} title={option.label}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: "Please enter quantity" }]}
              >
                <InputNumber 
                  placeholder="Enter quantity" 
                  min={1}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Procurement Information */}
          <h5 className="mb-3">Procurement Information</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="indent_number"
                label="Indent Number"
                rules={[{ required: true, message: "Please enter indent number" }]}
              >
                <Input placeholder="Enter indent number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="po_number"
                label="PO Number"
                rules={[{ required: true, message: "Please enter PO number" }]}
              >
                <Input placeholder="Enter PO number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="supplier_vendor"
                label="Supplier / Vendor"
                rules={[{ required: true, message: "Please select supplier/vendor" }]}
              >
                <VendorNamesDropdown 
                  placeholder="Select supplier/vendor"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="received_date"
                label="Received Date"
                rules={[
                  {
                    validator: (_, value) => {
                      const requested = form.getFieldValue('requested_date');
                      if (!value || !requested) return Promise.resolve();
                      try {
                        const recTs = new Date(value).setHours(0,0,0,0);
                        const reqTs = new Date(requested).setHours(0,0,0,0);
                        if (recTs < reqTs) {
                          return Promise.reject(new Error('Received Date cannot be before Requested Date'));
                        }
                        return Promise.resolve();
                      } catch (e) {
                        return Promise.resolve();
                      }
                    }
                  }
                ]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="invoice_details"
                label="Invoice Details"
              >
                <Input placeholder="Enter invoice details (e.g., INV-123456, ₹250,000)" />
              </Form.Item>
            </Col>
          </Row>

          {/* Justification */}
          <h5 className="mb-3">Justification</h5>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="justification"
                label="Justification / Remarks"
                rules={[{ required: true, message: "Please enter justification" }]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Enter justification for procurement"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={() => setDrawerVisible(false)} disabled={loading}>Close</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingProcurement !== null ? 'Update Procurement' : 'Add Procurement'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Bulk Upload Drawer */}
      <Drawer
        title="Bulk Upload Procurement"
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
              <li><strong>Indent Number</strong> - Unique indent number for the procurement request</li>
              <li><strong>Requested By</strong> - Name of the person requesting the procurement</li>
              <li><strong>Requested Date</strong> - Date when the request was made (YYYY-MM-DD format)</li>
              <li><strong>Category</strong> - Asset category (must match existing categories)</li>
              <li><strong>Asset ID</strong> - Asset identifier (must match existing asset IDs)</li>
              <li><strong>Asset Name</strong> - Name of the asset to be procured (must match existing asset names)</li>
              <li><strong>Quantity</strong> - Number of items to be procured</li>
              <li><strong>PO Number</strong> - Purchase Order number</li>
              <li><strong>Supplier/Vendor</strong> - Vendor name (must match existing vendors)</li>
              <li><strong>Justification</strong> - Reason for procurement</li>
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
            Select your Excel or CSV file to upload. The system will validate the data and import the procurement records.
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

export default Procure;