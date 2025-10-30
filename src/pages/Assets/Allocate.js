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
  message,
  Table,
  Drawer,
  Modal,
  Space
} from "antd";
import { FaEdit, FaTrash } from "react-icons/fa";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { formatDateForAPI, parseDateFromDB } from "../../utils/dateUtils";
import { safeStringCompare } from '../../utils/tableUtils';
import { 
  StatusNamesDropdown,
  CategoriesDropdown,
  LocationsDropdown
} from '../../components/SettingsDropdown';

const { Option } = Select;

const Allocate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Date helpers
  const todayISO = new Date();
  todayISO.setHours(0, 0, 0, 0);
  const todayStr = new Date().toISOString().split('T')[0];

  const validateNotPast = (_, value) => {
    if (!value) return Promise.resolve();
    try {
      const d = new Date(value);
      d.setHours(0, 0, 0, 0);
      if (isNaN(d.getTime())) return Promise.reject(new Error('Invalid date'));
      if (d < todayISO) {
        return Promise.reject(new Error('Date cannot be in the past'));
      }
      return Promise.resolve();
    } catch {
      return Promise.reject(new Error('Invalid date'));
    }
  };

  // Fetch generated asset codes data from API
  const fetchAllocations = async () => {
    setLoading(true);
    try {
      console.log('Fetching generated asset codes from API...');
      const response = await fetch(`http://202.53.92.35:5004/api/assets/generated-codes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-access-token": sessionStorage.getItem("token"),
        }
      });
      
      console.log('API Response status:', response.status);
      
      const result = await response.json();
    
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.codes && Array.isArray(result.codes)) {
        data = result.codes;
      } else if (result.generated_codes && Array.isArray(result.generated_codes)) {
        data = result.generated_codes;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      } else {
        console.error("Unexpected API response structure:", result);
        data = [];
      }
    
      // Add key property for each item (required by Ant Design Table)
      const dataWithKeys = data.map((item, index) => ({
        ...item,
        key: item.allocation_id || item.id || item.generated_asset_id || index.toString(),
      }));
      
      setDataSource(dataWithKeys);
      message.success(`Generated asset codes loaded (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching generated asset codes:", error);
      message.error(`Failed to load generated codes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getCompaniesList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        }
      });

      const result = await response.json();
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.companies && Array.isArray(result.companies)) {
        data = result.companies;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      }
      
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getProductsList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        }
      });

      const result = await response.json();
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.products && Array.isArray(result.products)) {
        data = result.products;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      }
      
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch asset ids for Asset ID dropdown (label = asset_code)
  const fetchAssetIdsDropdown = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/assets/dropdown/asset-ids', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        }
      });

      if (!response.ok) {
        console.warn('Asset IDs dropdown API failed with status:', response.status);
        setAssetOptions([]);
        return;
      }

      const result = await response.json();
      const data = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);
      const options = data
        .map(item => ({ value: item.asset_id || item.id, label: item.asset_code || item.asset_id || item.asset_name || '' }))
        .filter(opt => opt.value && String(opt.value).trim() !== '' && opt.label && String(opt.label).trim() !== '');
      setAssetOptions(options);
    } catch (error) {
      console.error('Error fetching asset ids dropdown:', error);
      setAssetOptions([]);
    }
  };

  // Fetch generated codes for asset IDs (now handled by AssetIdsDropdown component)
  const fetchGeneratedCodes = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/assets/generated-codes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        }
      });

      const result = await response.json();
      console.log('Generated codes API response:', result);
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.codes && Array.isArray(result.codes)) {
        data = result.codes;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      }
      
      console.log('Generated codes loaded:', data.length, 'items');
      return data;
    } catch (error) {
      console.error('Error fetching generated codes:', error);
      return [];
    }
  };

  // Fetch employee list for "Assigned To" dropdown (value: emp_id, label: full name)
  const fetchEmployees = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getEmployeesList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        }
      });

      const result = await response.json();
      let data = [];
      if (Array.isArray(result)) data = result;
      else if (Array.isArray(result.data)) data = result.data;
      else if (Array.isArray(result.employees)) data = result.employees;
      else if (Array.isArray(result.items)) data = result.items;

      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  };

  // Get username from sessionStorage for Assigned By
  const getSessionUsername = () => {
    try {
      const direct = sessionStorage.getItem('username');
      if (direct) return direct;
      const tokenUser = sessionStorage.getItem('user');
      if (tokenUser) return JSON.parse(tokenUser).username || JSON.parse(tokenUser).name;
      const login = sessionStorage.getItem('login');
      if (login) return JSON.parse(login).username || JSON.parse(login).name;
    } catch (e) {
      // ignore
    }
    return 'Admin';
  };

  useEffect(() => {
    fetchAllocations();
    fetchCompanies();
    fetchProducts();
    fetchAssetIdsDropdown();
    fetchEmployees();
    // Prefill assigned_by from session
    form.setFieldsValue({ assigned_by: getSessionUsername() });
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
    
    // Define only the fields that should be shown for generated codes list
    const allPossibleFields = [
      'generated_asset_id', 'asset_id', 'assignment_date', 'assignment_type', 'assigned_to', 'assigned_by',
      'company', 'location', 'product', 'assignment_notes', 'condition_at_issue', 'transfer', 'created_at',
      'asset_name', 'category', 'manufacturer_brand', 'model_number', 'serial_number'
    ];
    // Preferred column widths
    const columnWidths = {
      generated_asset_id: 240,
      asset_id: 130,
      assignment_date: 160,
      assignment_type: 170,
      assigned_to: 150,
      assigned_by: 170,
      company: 220,
      location: 170,
      product: 220,
      assignment_notes: 240,
      condition_at_issue: 220,
      transfer: 130,
      created_at: 220,
      asset_name: 220,
      category: 170,
      manufacturer_brand: 180,
      model_number: 170,
      serial_number: 190,
    };

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
      generated_asset_id: {
        title: "Generated Asset ID",
        sorter: (a, b) => safeStringCompare(a.generated_asset_id, b.generated_asset_id),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.generated_asset_id?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search generated asset ID"
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
        filteredValue: filteredInfo.generated_asset_id || null,
      },
      asset_id: { 
        title: "Asset ID", 
        sorter: (a, b) => safeStringCompare(a.asset_id, b.asset_id),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.asset_id?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search asset ID"
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
        filteredValue: filteredInfo.asset_id || null,
      },
      assignment_date: {
        title: "Assignment Date",
        sorter: (a, b) => safeStringCompare(a.assignment_date, b.assignment_date),
        render: (text) => {
          if (!text) return '-';
          try { const d = new Date(text); return d.toLocaleDateString('en-GB'); } catch { return text; }
        },
        onFilter: (value, record) => (record.assignment_date || '').toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.assignment_date || null,
      },
      assignment_type: { 
        title: "Assignment Type", 
        sorter: (a, b) => safeStringCompare(a.assignment_type, b.assignment_type),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.assignment_type?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input placeholder="Search assignment type" value={selectedKeys[0]} onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])} onPressEnter={() => confirm()} style={{ width: 188, marginBottom: 8, display: 'block' }} />
            <Space>
              <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Search</Button>
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.assignment_type || null,
      },
      assigned_to: { 
        title: "Assigned To", 
        sorter: (a, b) => safeStringCompare(a.assigned_to, b.assigned_to),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.assigned_to?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input placeholder="Search assigned to" value={selectedKeys[0]} onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])} onPressEnter={() => confirm()} style={{ width: 188, marginBottom: 8, display: 'block' }} />
            <Space>
              <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Search</Button>
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.assigned_to || null,
      },
      assigned_by: { 
        title: "Assigned By", 
        sorter: (a, b) => safeStringCompare(a.assigned_by, b.assigned_by),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.assigned_by?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input placeholder="Search assigned by" value={selectedKeys[0]} onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])} onPressEnter={() => confirm()} style={{ width: 188, marginBottom: 8, display: 'block' }} />
            <Space>
              <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Search</Button>
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.assigned_by || null,
      },
      company: {
        title: "Company",
        sorter: (a, b) => safeStringCompare(a.company, b.company),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.company?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search company"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
              onPressEnter={() => confirm()}
              style={{ width: 188, marginBottom: 8, display: 'block' }}
            />
            <Space>
              <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Search</Button>
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.company || null,
      },
      location: {
        title: "Location",
        sorter: (a, b) => safeStringCompare(a.location, b.location),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.location?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input placeholder="Search location" value={selectedKeys[0]} onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])} onPressEnter={() => confirm()} style={{ width: 188, marginBottom: 8, display: 'block' }} />
            <Space>
              <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Search</Button>
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.location || null,
      },
      product: {
        title: "Product",
        sorter: (a, b) => safeStringCompare(a.product, b.product),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.product?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input placeholder="Search product" value={selectedKeys[0]} onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])} onPressEnter={() => confirm()} style={{ width: 188, marginBottom: 8, display: 'block' }} />
            <Space>
              <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>Search</Button>
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
            </Space>
          </div>
        ),
        filteredValue: filteredInfo.product || null,
      },
      assignment_notes: {
        title: "Assignment Notes",
        sorter: (a, b) => safeStringCompare(a.assignment_notes, b.assignment_notes),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.assignment_notes?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.assignment_notes || null,
      },
      condition_at_issue: {
        title: "Condition at Issue",
        sorter: (a, b) => safeStringCompare(a.condition_at_issue, b.condition_at_issue),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.condition_at_issue?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.condition_at_issue || null,
      },
      transfer: {
        title: "Transfer",
        sorter: (a, b) => safeStringCompare(a.transfer, b.transfer),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.transfer?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.transfer || null,
      },
      created_at: {
        title: "Created At",
        sorter: (a, b) => safeStringCompare(a.created_at, b.created_at),
        render: (text) => {
          if (!text) return '-';
          try { const d = new Date(text); return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-GB'); } catch { return text; }
        },
        onFilter: (value, record) => (record.created_at || '').toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.created_at || null,
      },
      asset_name: {
        title: "Asset Name",
        sorter: (a, b) => safeStringCompare(a.asset_name, b.asset_name),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.asset_name?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.asset_name || null,
      },
      category: {
        title: "Category",
        sorter: (a, b) => safeStringCompare(a.category, b.category),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.category?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.category || null,
      },
      manufacturer_brand: {
        title: "Brand",
        sorter: (a, b) => safeStringCompare(a.manufacturer_brand, b.manufacturer_brand),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.manufacturer_brand?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.manufacturer_brand || null,
      },
      model_number: {
        title: "Model",
        sorter: (a, b) => safeStringCompare(a.model_number, b.model_number),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.model_number?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.model_number || null,
      },
      serial_number: {
        title: "Serial Number",
        sorter: (a, b) => safeStringCompare(a.serial_number, b.serial_number),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.serial_number?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.serial_number || null,
      },
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
          width: columnWidths[field] || 180,
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
          width: columnWidths[field] || 180,
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
    setEditingAllocation(null);
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

    // Helper function to format dates for HTML date inputs
    const formatDateForInput = (dateValue) => {
      if (!dateValue) return undefined;
      
      try {
        // If it's already in YYYY-MM-DD format, return as is
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        
        // If it's an ISO date string, convert to YYYY-MM-DD
        if (typeof dateValue === 'string' && dateValue.includes('T')) {
          return dateValue.split('T')[0];
        }
        
        // If it's a Date object, convert to YYYY-MM-DD
        if (dateValue instanceof Date) {
          return dateValue.toISOString().split('T')[0];
        }
        
        // Try to parse as date and convert
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
        
        return undefined;
      } catch (error) {
        console.warn('Error formatting date:', dateValue, error);
        return undefined;
      }
    };
    
    // Set form values with cleaned data
    form.setFieldsValue({
      asset_id: cleanValue(record.asset_id),
      company_id: cleanValue(record.company_id),
      location_id: cleanValue(record.location_id),
      product_id: cleanValue(record.product_id),
      assignment_type: cleanValue(record.assignment_type),
      transfer: cleanValue(record.transfer),
      assigned_to: cleanValue(record.assigned_to),
      assignment_date: formatDateForInput(record.assignment_date),
      return_date: formatDateForInput(record.return_date),
      assigned_by: cleanValue(record.assigned_by),
      assignment_notes: cleanValue(record.assignment_notes),
      condition_at_issue: cleanValue(record.condition_at_issue),
    });
    
    setEditingAllocation(record);
    setDrawerVisible(true);
  };

  // Handle delete
  const handleDelete = (record) => {
    console.log("Delete record:", record);
    console.log("Record ID:", record.id || record.key);
    
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this allocation?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/assets/allocate", {
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
            message.success("Allocation deleted successfully!");
            await fetchAllocations(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete allocation: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting allocation:", error);
          message.error(`Failed to delete allocation: ${error.message}`);
        }
      },
    });
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Allocation form submitted with values:", values);
    message.loading("Saving allocation...", 0);
    
    try {
      setLoading(true);
      
      // Helper function to get company name from ID
      const getCompanyName = (companyId) => {
        const company = companies.find(c => c.company_id === companyId);
        return company ? company.company_name : null;
      };
      
      // Helper function to get location name from ID
      const getLocationName = async (locationId) => {
        if (!locationId) return null;
        
        try {
          // Fetch location data to get the name
          const response = await fetch('http://202.53.92.35:5004/api/settings/getLocationsDropdown', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': sessionStorage.getItem("token"),
            }
          });
          
          const result = await response.json();
          const location = result.find(loc => 
            (loc.id || loc.location_id) === locationId || 
            (loc.value || loc.id) === locationId
          );
          
          return location ? (location.location_name || location.name || location.label) : `Location-${locationId}`;
        } catch (error) {
          console.error('Error fetching location name:', error);
          return `Location-${locationId}`;
        }
      };
      
      // Helper function to get product name from ID
      const getProductName = (productId) => {
        const product = products.find(p => p.product_id === productId);
        return product ? product.product_name : null;
      };
      
      if (editingAllocation) {
        // Update existing allocation
        console.log("Updating allocation:", editingAllocation);
        
        // Get location name asynchronously
        const locationName = await getLocationName(values.location_id);
        
        const updateData = {
          id: editingAllocation.id,
          asset_id: values.asset_id,
          assignment_date: values.assignment_date || null,
          assignment_type: values.assignment_type,
          transfer: values.transfer || null,
          return_date: values.return_date || null,
          assigned_to: values.assigned_to,
          assigned_by: values.assigned_by,
          assignment_notes: values.assignment_notes,
          condition_at_issue: values.condition_at_issue,
          // Add the string values for company, location, product
          company: getCompanyName(values.company_id),
          location: locationName,
          product: getProductName(values.product_id)
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        console.log("Company mapping:", { company_id: values.company_id, company_name: getCompanyName(values.company_id) });
        console.log("Location mapping:", { location_id: values.location_id, location_name: locationName });
        console.log("Product mapping:", { product_id: values.product_id, product_name: getProductName(values.product_id) });
        
        const token = sessionStorage.getItem("token") || '';
        console.log("Using token for update:", token);

        const response = await axios.put("http://202.53.92.35:5004/api/assets/allocate", updateData, {
          headers: {
            "x-access-token": token,
            "Content-Type": "application/json"
          }
        });
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Allocation updated successfully!");
      } else {
        // Create new allocation
        console.log("Creating new allocation");
        
        // Get location name asynchronously
        const locationName = await getLocationName(values.location_id);
        
        const createData = {
          asset_id: values.asset_id,
          assignment_date: values.assignment_date || null,
          assignment_type: values.assignment_type,
          transfer: values.transfer || null,
          return_date: values.return_date || null,
          assigned_to: values.assigned_to,
          assigned_by: values.assigned_by,
          assignment_notes: values.assignment_notes,
          condition_at_issue: values.condition_at_issue,
          // Add the string values for company, location, product
          company: getCompanyName(values.company_id),
          location: locationName,
          product: getProductName(values.product_id)
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        console.log("Company mapping:", { company_id: values.company_id, company_name: getCompanyName(values.company_id) });
        console.log("Location mapping:", { location_id: values.location_id, location_name: locationName });
        console.log("Product mapping:", { product_id: values.product_id, product_name: getProductName(values.product_id) });


        const token = sessionStorage.getItem("token") || '';
        console.log("Using token for create:", token);

        const response = await axios.post(
          "http://202.53.92.35:5004/api/assets/allocate",
          createData,
          {
            headers: {
              "x-access-token": token,
              "Content-Type": "application/json"
            }
          }
        );


        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Asset allocated successfully!");
      }
      
      // Refresh the table data immediately
      await fetchAllocations();
      
      form.resetFields();
      setEditingAllocation(null);
      setDrawerVisible(false);
    } catch (error) {
      console.error("Error saving allocation:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      message.destroy(); // Clear loading message
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Bad Request - Invalid data format";
        console.error("400 Bad Request details:", error.response?.data);
        message.error(`❌ Invalid data: ${errorMessage}`);
      } else if (error.response?.status === 500) {
        console.error("500 Internal Server Error details:", error.response?.data);
        const serverError = error.response?.data?.message || error.response?.data?.error || "Internal server error";
        message.error(`❌ Server Error (500): ${serverError}`);
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please start the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save allocation: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save allocation. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingAllocation(null);
    setDrawerVisible(false);
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
          <h2 className="mb-1">Generated Asset Codes</h2>
          <span className="text-muted">List of generated asset IDs available for allocation.</span>
        </div>
        <div className="d-flex gap-2">
         
          <ExportButton
            data={dataSource}
            columns={null}
            filename="Generated_Asset_Codes"
            title="Generated Asset Codes"
            reportType="generated-asset-codes"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
            includeAllFields={true}
          />
          <button
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Allocation
          </button>
        </div>
      </div>

      {/* Allocations Table */}
      
          
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
            scroll={{ x: 2400 }}
          />
       

      {/* Drawer Form */}
      <Drawer
        title={editingAllocation !== null ? "Edit Allocation" : "Add Allocation"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          {/* Assignment Details */}
          <h5 className="mb-3">Assignment Details</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="asset_id"
                label="Asset ID"
                rules={[
                  { required: true, message: "Please select asset ID" }
                ]}
              >
                <Select 
                  placeholder="Select asset (by code)"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const raw = option?.label ?? option?.children ?? '';
                    const text = typeof raw === 'string' ? raw : String(raw);
                    return text.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {assetOptions.map(opt => (
                    <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignment_type"
                label="Assignment Type"
                rules={[{ required: true, message: "Please select assignment type" }]}
              >
                <Select 
                  placeholder="Select assignment type"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const raw = option?.label ?? option?.children ?? '';
                    const text = typeof raw === 'string' ? raw : String(raw);
                    return text.toLowerCase().includes(input.toLowerCase());
                  }}
                  style={{ width: '100%' }}
                >
                  <Option value="Permanent">Permanent</Option>
                  <Option value="Temporary">Temporary</Option>
                  <Option value="Project">Project</Option>
                  <Option value="Department">Department</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="transfer"
                label="Transfer Details"
              >
                <Input 
                  placeholder="Enter transfer details (e.g., Transfer to Delhi Office)"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Company, Location, and Product Details */}
          <h5 className="mb-3">Asset Information</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="company_id"
                label="Company"
              >
                <Select 
                  placeholder="Select company" 
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const raw = option?.label ?? option?.children ?? '';
                    const text = typeof raw === 'string' ? raw : String(raw);
                    return text.toLowerCase().includes(input.toLowerCase());
                  }}
                  style={{ width: '100%' }}
                >
                  {companies
                    .filter(c => c && c.company_id && c.company_name && String(c.company_name).trim() !== '')
                    .map(company => (
                      <Option key={company.company_id} value={company.company_id}>
                        {company.company_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="location_id"
                label="Location"
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
                name="product_id"
                label="Product"
              >
                <Select 
                  placeholder="Select product" 
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const raw = option?.label ?? option?.children ?? '';
                    const text = typeof raw === 'string' ? raw : String(raw);
                    return text.toLowerCase().includes(input.toLowerCase());
                  }}
                  style={{ width: '100%' }}
                >
                  {products
                    .filter(p => p && p.product_id && p.product_name && String(p.product_name).trim() !== '')
                    .map(product => (
                      <Option key={product.product_id} value={product.product_id}>
                        {product.product_name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assigned_to"
                label="Assigned To (User ID)"
                rules={[{ required: true, message: "Please select employee" }]}
              >
                <Select
                  placeholder="Select employee"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  filterOption={(input, option) => {
                    const raw = option?.label ?? option?.children ?? '';
                    const text = typeof raw === 'string' ? raw : String(raw);
                    return text.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {employees
                    .map(emp => {
                      const value = emp?.emp_id || emp?.employee_id || emp?.id || emp?.value;
                      const label = [emp?.emp_first_name, emp?.emp_last_name].filter(Boolean).join(' ') || emp?.emp_email || emp?.employee_name || emp?.name || emp?.label;
                      return { value, label };
                    })
                    .filter(opt => opt.value && String(opt.value).trim() !== '' && opt.label && String(opt.label).trim() !== '')
                    .map(opt => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignment_date"
                label="Assignment Date"
                rules={[
                  { required: true, message: "Please select assignment date" },
                  { validator: validateNotPast }
                ]}
              >
                <Input type="date" min={todayStr} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="return_date"
                label="Return Date (if applicable)"
                rules={[{ validator: validateNotPast }]}
              >
                <Input type="date" min={todayStr} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assigned_by"
                label="Assigned By"
                rules={[]}
              >
                <Input placeholder="Assigned by username" disabled />
              </Form.Item>
            </Col>
          </Row>

          {/* Additional Information */}
          <h5 className="mb-3">Additional Information</h5>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="assignment_notes"
                label="Assignment Notes / Purpose"
                rules={[{ required: true, message: "Please enter assignment notes" }]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Enter assignment notes and purpose"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="condition_at_issue"
                label="Condition at Time of Issue (Optional)"
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Describe the condition of the asset at the time of issue"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={() => setDrawerVisible(false)} disabled={loading}>Close</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingAllocation !== null ? 'Update Allocation' : 'Add Allocation'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Allocate;