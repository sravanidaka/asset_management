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
  LocationsDropdown,
  AssetIdsDropdown
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

  // Fetch allocation data from API
  const fetchAllocations = async () => {
    setLoading(true);
    try {
      console.log('Fetching allocations from API...');
      const response = await fetch(`http://202.53.92.35:5004/api/assets/allocate`, {
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
      } else if (result.allocations && Array.isArray(result.allocations)) {
        data = result.allocations;
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
        key: item.id || item._id || index.toString(),
      }));
      
      setDataSource(dataWithKeys);
      message.success(`Allocations loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching allocations:", error);
      message.error(`Failed to load allocations: ${error.message}`);
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

  useEffect(() => {
    fetchAllocations();
    fetchCompanies();
    fetchProducts();
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
      'asset_id', 'assignment_type', 'transfer', 'assigned_to', 'assignment_date', 
      'return_date', 'assigned_by', 'assignment_notes', 'condition_at_issue'
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
      assignment_type: { 
        title: "Assignment Type", 
        sorter: (a, b) => safeStringCompare(a.assignment_type, b.assignment_type),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.assignment_type?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search assignment type"
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
        filteredValue: filteredInfo.assignment_type || null,
      },
      transfer: { 
        title: "Transfer Details", 
        sorter: (a, b) => safeStringCompare(a.transfer, b.transfer),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.transfer?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search transfer details"
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
        filteredValue: filteredInfo.transfer || null,
      },
      assigned_to: { 
        title: "Assigned To", 
        sorter: (a, b) => safeStringCompare(a.assigned_to, b.assigned_to),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.assigned_to?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search assigned to"
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
        filteredValue: filteredInfo.assigned_to || null,
      },
      assigned_by: { 
        title: "Assigned By", 
        sorter: (a, b) => safeStringCompare(a.assigned_by, b.assigned_by),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.assigned_by?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search assigned by"
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
        filteredValue: filteredInfo.assigned_by || null,
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
      
      if (editingAllocation) {
        // Update existing allocation
        console.log("Updating allocation:", editingAllocation);
        const updateData = {
          id: editingAllocation.id,
          asset_id: parseInt(values.asset_id),
          assignment_date: values.assignment_date || null,
          assignment_type: values.assignment_type,
          transfer: values.transfer || null,
          return_date: values.return_date || null,
          assigned_to: values.assigned_to,
          assigned_by: values.assigned_by,
          company: values.company_id ? companies.find(c => c.company_id === values.company_id)?.company_name : null,
          location: values.location_id || null,
          product: values.product_id ? products.find(p => p.product_id === values.product_id)?.product_name : null,
          assignment_notes: values.assignment_notes,
          condition_at_issue: values.condition_at_issue
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
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
        const createData = {
          asset_id: parseInt(values.asset_id),
          assignment_date: values.assignment_date || null,
          assignment_type: values.assignment_type,
          transfer: values.transfer || null,
          return_date: values.return_date || null,
          assigned_to: values.assigned_to,
          assigned_by: values.assigned_by,
          company: values.company_id ? companies.find(c => c.company_id === values.company_id)?.company_name : null,
          location: values.location_id || null,
          product: values.product_id ? products.find(p => p.product_id === values.product_id)?.product_name : null,
          assignment_notes: values.assignment_notes,
          condition_at_issue: values.condition_at_issue
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));


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
          <h2 className="mb-1">Asset Allocation</h2>
          <span className="text-muted">The core screen for managing asset allocation and assignment to users or departments.</span>
        </div>
        <div className="d-flex gap-2">
         
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="Allocation_Management_Report"
            title="Allocation Management Report"
            reportType="allocation-management"
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
                <AssetIdsDropdown 
                  placeholder="Select asset ID"
                  showSearch={true}
                  allowClear={true}
                />
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
                  filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
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
                  filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                >
                  {companies.map(company => (
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
                  filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                >
                  {products.map(product => (
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
                rules={[
                  { required: true, message: "Please enter assigned to ID" },
                  { pattern: /^\d+$/, message: "User ID must be a number" }
                ]}
              >
                <Input placeholder="Enter user ID (e.g., 2001)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assignment_date"
                label="Assignment Date"
                rules={[{ required: true, message: "Please select assignment date" }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="return_date"
                label="Return Date (if applicable)"
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assigned_by"
                label="Assigned By"
                rules={[{ required: true, message: "Please enter assigned by" }]}
              >
                <Input placeholder="Enter assigned by (e.g., Admin Team)" />
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
              <Button onClick={onReset} disabled={loading}>Reset</Button>
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