import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Drawer, Form, Input, Select, message, Modal, InputNumber, Switch } from 'antd';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '../../../components/Breadcrumb';
import BackNavigation from '../../../components/BackNavigation';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../App.css";

const { Option } = Select;

const ManageDepreciationMethod = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [depreciationMethods, setDepreciationMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  // Fetch depreciation methods from API
  const fetchDepreciationMethods = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      console.log('Fetching depreciation methods from API...');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getDepreciationMethodsList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token,
        }
      });
      
      console.log('API Response status:', response.status);
      
      const result = await response.json();

      console.log('Depreciation Methods API Response:', result);
    
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.methods && Array.isArray(result.methods)) {
        data = result.methods;
      } else if (result.depreciation_methods && Array.isArray(result.depreciation_methods)) {
        data = result.depreciation_methods;
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
        key: item.method_id || item.id || index.toString(),
      }));
      
      setDepreciationMethods(dataWithKeys);
      message.success(`Depreciation methods loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching depreciation methods:", error);
      message.error(`Failed to load depreciation methods: ${error.message}`);
      setDepreciationMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepreciationMethods();
  }, []);

  // Handle table change for filters and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Handle create/update depreciation method
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingIndex !== null;
      
      console.log("=== SAVE DEPRECIATION METHOD DEBUG ===");
      console.log("Is Editing:", isEditing);
      console.log("Editing Index:", editingIndex);
      console.log("Editing Record:", editingRecord);
      console.log("Form Values:", values);
      
      // Client-side validation for required fields
      const requiredFields = ['method_name', 'calculation_type', 'depreciation_frequency', 'status'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        setLoading(false);
        return;
      }

      const methodData = {
        method_name: values.method_name,
        code: values.code || '',
        calculation_type: values.calculation_type,
        depreciation_rate: values.depreciation_rate || 0,
        depreciation_frequency: values.depreciation_frequency,
        asset_type_applicable: values.asset_type_applicable || '',
        useful_life_required: values.useful_life_required ? "Yes" : "No",
        salvage_value_required: values.salvage_value_required ? "Yes" : "No",
        formula_description: values.formula_description || '',
        is_default_method: values.is_default_method ? "Yes" : "No",
        status: values.status || 'Active',
        description: values.description_notes || ''
      };

      // Call API directly - use the correct endpoint structure
      let mainUrl;
      let apiData;
      
      if (isEditing) {
        // For updates, use the working approach: ID in request body
        const recordId = editingRecord?.id || editingRecord?.method_id || editingIndex;
        
        if (!recordId) {
          console.error("ERROR: No record ID found for update operation!");
          message.error("Error: Cannot update - no record ID found!");
          setLoading(false);
          return;
        }
        
        // Use the working approach: ID in request body
        mainUrl = "http://202.53.92.35:5004/api/settings/updateDepreciationMethod";
        apiData = { 
          id: recordId,
          ...methodData 
        };
        
        console.log("=== UPDATE OPERATION ===");
        console.log("Using update endpoint with ID in request body");
        console.log("Update Record ID:", recordId);
        console.log("Update API Data:", apiData);
        console.log("Original Record:", editingRecord);
      } else {
        // For create operations - ensure no ID is included
        mainUrl = "http://202.53.92.35:5004/api/settings/createDepreciationMethod";
        apiData = { ...methodData };
        
        // Remove any ID field to ensure it's a create operation
        delete apiData.id;
        
        console.log("=== CREATE OPERATION ===");
        console.log("Create API Data:", apiData);
        console.log("No ID in request body:", !apiData.id);
      }
      
      const method = isEditing ? "PUT" : "POST";  // Use PUT for updates, POST for creates

      console.log("API URL:", mainUrl);
      console.log("API Method:", method);
      console.log("Request Headers:", {
        "Content-Type": "application/json",
        "x-access-token": sessionStorage.getItem("token") ? "Present" : "Missing"
      });
      console.log("Request Body:", JSON.stringify(apiData, null, 2));

      const response = await fetch(mainUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify(apiData),
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        console.error("Response Status:", response.status);
        console.error("Response Headers:", Object.fromEntries(response.headers.entries()));
        
        // Try to parse error response
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          errorData = { message: errorText };
        }
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} depreciation method: ${errorData.message || errorText}`);
      }

      const result = await response.json();
      console.log("API Success Response:", result);
      console.log("Response Status Code:", response.status);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
      
      // Check if the response indicates success
      if (result.success === false) {
        console.error("Backend returned success: false");
        message.error(`Operation failed: ${result.message || 'Unknown error'}`);
        return;
      }
      
      // Log the operation type for debugging
      console.log(`✅ ${isEditing ? 'UPDATE' : 'CREATE'} operation completed successfully`);
      console.log("Response data:", result);
      
      message.success(`Depreciation method ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchDepreciationMethods();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} depreciation method:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} depreciation method: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open drawer for create
  const handleCreate = () => {
    form.resetFields();
    setEditingIndex(null);
    setEditingRecord(null);
    setDrawerVisible(true);
  };

  // Handle edit method
  const handleEdit = (record) => {
    console.log("=== EDIT RECORD DEBUG ===");
    console.log("Edit record:", record);
    console.log("Record ID:", record.method_id);
    console.log("Record _id:", record._id);
    console.log("Record key:", record.key);
    
    // Helper function to clean values (remove N/A, null, undefined)
    const cleanValue = (value) => {
      if (value === 'N/A' || value === null || value === undefined || value === '') {
        return undefined; // Return undefined so form field shows as empty
      }
      return value;
    };
    
    // Set form values with cleaned data
    const formValues = {
      method_name: cleanValue(record.method_name),
      code: cleanValue(record.code),
      calculation_type: cleanValue(record.calculation_type),
      depreciation_rate: cleanValue(record.depreciation_rate),
      depreciation_frequency: cleanValue(record.depreciation_frequency),
      asset_type_applicable: cleanValue(record.asset_type_applicable),
      useful_life_required: record.useful_life_required === "Yes",
      salvage_value_required: record.salvage_value_required === "Yes",
      formula_description: cleanValue(record.formula_description),
      is_default_method: record.is_default_method === "Yes",
      status: cleanValue(record.status),
      description_notes: cleanValue(record.description || record.description_notes)
    };
    
    console.log("Form values being set:", formValues);
    
    form.setFieldsValue(formValues);
    
    const recordId = record.method_id || record.id || record.key;
    console.log("Setting editing index to:", recordId);
    
    setEditingIndex(recordId);
    setEditingRecord(record); // Store the original record for updates
    setDrawerVisible(true);
  };

  // Handle delete method
  const handleDelete = (record) => {
    console.log("Delete record:", record);
    console.log("Record ID:", record.method_id || record.key);
    
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this depreciation method?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.method_id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deleteDepreciationMethod", {
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
            message.success("Depreciation method deleted successfully!");
            await fetchDepreciationMethods(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete depreciation method: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting depreciation method:", error);
          message.error(`Failed to delete depreciation method: ${error.message}`);
        }
      },
    });
  };

  // Export functionality
  const exportDepreciationMethods = () => {
    const csvContent = [
      ['S.No', 'Method Name', 'Code', 'Calculation Type', 'Depreciation Rate (%)', 'Frequency', 'Asset Type', 'Useful Life Required', 'Salvage Value Required', 'Is Default', 'Status', 'Description'],
      ...depreciationMethods.map((method, index) => [
        index + 1,
        method.method_name,
        method.code || '',
        method.calculation_type || '',
        method.depreciation_rate || '',
        method.depreciation_frequency || '',
        method.asset_type_applicable || '',
        method.useful_life_required === "Yes" ? 'Yes' : 'No',
        method.salvage_value_required === "Yes" ? 'Yes' : 'No',
        method.is_default_method === "Yes" ? 'Yes' : 'No',
        method.status || '',
        method.description || method.description_notes || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `depreciation_methods_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table columns
  const columns = [
    {
      title: 'S.No',
      key: 'serial',
      width: 80,
      render: (text, record, index) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: 'Method Name',
      dataIndex: 'method_name',
      key: 'method_name',
      sorter: (a, b) => (a.method_name || '').localeCompare(b.method_name || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search method name"
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.method_name?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => (a.code || '').localeCompare(b.code || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search code"
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.code?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Calculation Type',
      dataIndex: 'calculation_type',
      key: 'calculation_type',
      sorter: (a, b) => (a.calculation_type || '').localeCompare(b.calculation_type || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search calculation type"
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.calculation_type?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Depreciation Rate (%)',
      dataIndex: 'depreciation_rate',
      key: 'depreciation_rate',
      sorter: (a, b) => (a.depreciation_rate || 0) - (b.depreciation_rate || 0),
      render: (rate) => rate ? `${rate}%` : '-',
    },
    {
      title: 'Frequency',
      dataIndex: 'depreciation_frequency',
      key: 'depreciation_frequency',
      sorter: (a, b) => (a.depreciation_frequency || '').localeCompare(b.depreciation_frequency || ''),
      filters: [
        { text: 'Monthly', value: 'Monthly' },
        { text: 'Quarterly', value: 'Quarterly' },
        { text: 'Yearly', value: 'Yearly' },
      ],
      onFilter: (value, record) => record.depreciation_frequency === value,
    },
    {
      title: 'Asset Type',
      dataIndex: 'asset_type_applicable',
      key: 'asset_type_applicable',
      sorter: (a, b) => (a.asset_type_applicable || '').localeCompare(b.asset_type_applicable || ''),
      render: (type) => type || '-',
    },
    {
      title: 'Useful Life Required',
      dataIndex: 'useful_life_required',
      key: 'useful_life_required',
      render: (required) => (
        <span className={`badge ${required === "Yes" ? 'bg-success' : 'bg-secondary'}`}>
          {required === "Yes" ? 'Yes' : 'No'}
        </span>
      ),
      filters: [
        { text: 'Yes', value: "Yes" },
        { text: 'No', value: "No" },
      ],
      onFilter: (value, record) => record.useful_life_required === value,
    },
    {
      title: 'Salvage Value Required',
      dataIndex: 'salvage_value_required',
      key: 'salvage_value_required',
      render: (required) => (
        <span className={`badge ${required === "Yes" ? 'bg-success' : 'bg-secondary'}`}>
          {required === "Yes" ? 'Yes' : 'No'}
        </span>
      ),
      filters: [
        { text: 'Yes', value: "Yes" },
        { text: 'No', value: "No" },
      ],
      onFilter: (value, record) => record.salvage_value_required === value,
    },
    {
      title: 'Is Default',
      dataIndex: 'is_default_method',
      key: 'is_default_method',
      render: (isDefault) => (
        <span className={`badge ${isDefault === "Yes" ? 'bg-warning text-dark' : 'bg-secondary'}`}>
          {isDefault === "Yes" ? 'Yes' : 'No'}
        </span>
      ),
      filters: [
        { text: 'Yes', value: "Yes" },
        { text: 'No', value: "No" },
      ],
      onFilter: (value, record) => record.is_default_method === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`badge ${status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
          {status}
        </span>
      ),
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="default" size="small" icon={<FaEdit />} onClick={() => handleEdit(record)} />
          {/* <Button type="primary" danger size="small" icon={<FaTrash />} onClick={() => handleDelete(record)} /> */}
        </Space>
      ),
    },
  ];

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
        <div className="d-flex align-items-center gap-2">
          <h2 className="mb-1">Manage Depreciation Methods</h2>
        </div>
        <div className="d-flex gap-2">
      
          <button 
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Method
          </button>
          <button 
            className="btn btn-success px-4"
            onClick={exportDepreciationMethods}
          >
            <FaDownload /> Export Methods
          </button>
        </div>
      </div>

      {/* Depreciation Methods Table */}
     
          <Table
            columns={columns}
            dataSource={depreciationMethods}
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
            rowKey="id"
          />
       

      {/* Drawer Form */}
      <Drawer
        title={editingIndex !== null ? "Edit Depreciation Method" : "Add Depreciation Method"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Method Name"
            name="method_name"
            rules={[{ required: true, message: "Please enter method name" }]}
          >
            <Input placeholder="e.g., Straight Line Method" />
          </Form.Item>

          <Form.Item
            label="Code (Optional)"
            name="code"
          >
            <Input placeholder="e.g., SLM" />
          </Form.Item>

          <Form.Item
            label="Calculation Type"
            name="calculation_type"
            rules={[{ required: true, message: "Please select calculation type" }]}
          >
            <Select placeholder="Select calculation type">
              <Option value="Straight Line">Straight Line</Option>
              <Option value="Declining Balance">Declining Balance</Option>
              <Option value="Units of Production">Units of Production</Option>
              <Option value="Sum of Years Digits">Sum of Years Digits</Option>
              <Option value="Double Declining Balance">Double Declining Balance</Option>
              <Option value="150% Declining Balance">150% Declining Balance</Option>
              <Option value="Custom">Custom</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Depreciation Frequency"
            name="depreciation_frequency"
            rules={[{ required: true, message: "Please select frequency" }]}
          >
            <Select placeholder="Select frequency">
              <Option value="Monthly">Monthly</Option>
              <Option value="Quarterly">Quarterly</Option>
              <Option value="Yearly">Yearly</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Depreciation Rate (%)"
            name="depreciation_rate"
          >
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              placeholder="e.g., 10"
              className="w-100"
            />
          </Form.Item>

          <Form.Item
            label="Asset Type Applicable (Optional)"
            name="asset_type_applicable"
          >
            <Input placeholder="e.g., Electronics, Furniture" />
          </Form.Item>

          <Form.Item
            label="Useful Life Required?"
            name="useful_life_required"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Salvage Value Required?"
            name="salvage_value_required"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Is Default Method?"
            name="is_default_method"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            initialValue="Active"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Formula Description (Reference)"
            name="formula_description"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="e.g., (Cost - Salvage) / Useful Life" 
            />
          </Form.Item>

          <Form.Item
            label="Description/Notes"
            name="description_notes"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Additional details about this depreciation method" 
            />
          </Form.Item>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={() => form.resetFields()} disabled={loading}>Reset</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingIndex !== null ? 'Update Method' : 'Add Method'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ManageDepreciationMethod;
