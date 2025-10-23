import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Drawer, Form, Input, Select, message, Modal, InputNumber, DatePicker, Upload } from 'antd';
import { FaEdit, FaTrash, FaDownload, FaUpload } from 'react-icons/fa';
import { PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '../../../components/Breadcrumb';
import BackNavigation from '../../../components/BackNavigation';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

const AssetSpecification = () => {
  const navigate = useNavigate();
  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSpecification, setEditingSpecification] = useState(null);
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [bulkUploadVisible, setBulkUploadVisible] = useState(false);

  // Fetch asset specifications from API
  const fetchSpecifications = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      console.log('Fetching asset specifications from API...');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getAssetDetailsList', {
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

      console.log('Asset Specifications API Response:', result);
    
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.specifications && Array.isArray(result.specifications)) {
        data = result.specifications;
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
        key: item.id || item.specification_id || index.toString(),
      }));
      
      setSpecifications(dataWithKeys);
      message.success(`Asset specifications loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching asset specifications:", error);
      message.error(`Failed to load asset specifications: ${error.message}`);
      setSpecifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecifications();
  }, []);

  // Handle create/update specification
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingSpecification !== null;
      
      console.log("=== SAVE ASSET SPECIFICATION DEBUG ===");
      console.log("Is Editing:", isEditing);
      console.log("Editing Specification:", editingSpecification);
      console.log("Form Values:", values);
      
      // Client-side validation for required fields
      const requiredFields = ['asset_tag', 'status'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        setLoading(false);
        return;
      }

      // Call API directly - use the correct endpoint structure
      let mainUrl;
      let apiData;
      
      if (isEditing) {
        // For updates, use the working approach: ID in request body
        const recordId = editingSpecification?.id || editingSpecification?.specification_id;
        
        if (!recordId) {
          console.error("ERROR: No record ID found for update operation!");
          message.error("Error: Cannot update - no record ID found!");
          setLoading(false);
          return;
        }
        
        // Use the working approach: ID in request body
        mainUrl = "http://202.53.92.35:5004/api/settings/updateAssetDetail";
        apiData = { 
          id: recordId,
          asset_id: values.asset_tag, // Using asset_tag as asset_id
          asset_tag: values.asset_tag,
          status: values.status,
          serial: values.serial,
          manufacturer: values.manufacturer,
          category: values.category,
          model: values.model,
          model_no: values.model_no,
          byod: values.byod ? "Yes" : "No",
          requestable: values.requestable ? "Yes" : "No",
          purchase_date: values.purchase_date ? dayjs(values.purchase_date).format('YYYY-MM-DD') : null,
          purchase_cost: values.purchase_cost,
          current_value: values.current_value,
          order_number: values.order_number,
          supplier: values.supplier,
          depreciation: values.depreciation,
          fully_depreciated: values.fully_depreciated ? "Yes" : "No",
          eol_rate: values.eol_rate,
          eol_date: values.eol_date ? dayjs(values.eol_date).format('YYYY-MM-DD') : null,
          notes: values.notes,
          location: values.location,
          default_location: values.default_location,
          checkouts: values.checkouts || 0,
          checkins: values.checkins || 0,
          requests: values.requests || 0
        };
        
        console.log("=== UPDATE OPERATION ===");
        console.log("Using update endpoint with ID in request body");
        console.log("Update Record ID:", recordId);
        console.log("Update API Data:", apiData);
        console.log("Original Record:", editingSpecification);
      } else {
        // For create operations - ensure no ID is included
        mainUrl = "http://202.53.92.35:5004/api/settings/createAssetDetail";
        apiData = {
          asset_id: values.asset_tag, // Using asset_tag as asset_id
          asset_tag: values.asset_tag,
          status: values.status,
          serial: values.serial,
          manufacturer: values.manufacturer,
          category: values.category,
          model: values.model,
          model_no: values.model_no,
          byod: values.byod ? "Yes" : "No",
          requestable: values.requestable ? "Yes" : "No",
          purchase_date: values.purchase_date ? dayjs(values.purchase_date).format('YYYY-MM-DD') : null,
          purchase_cost: values.purchase_cost,
          current_value: values.current_value,
          order_number: values.order_number,
          supplier: values.supplier,
          depreciation: values.depreciation,
          fully_depreciated: values.fully_depreciated ? "Yes" : "No",
          eol_rate: values.eol_rate,
          eol_date: values.eol_date ? dayjs(values.eol_date).format('YYYY-MM-DD') : null,
          notes: values.notes,
          location: values.location,
          default_location: values.default_location,
          checkouts: values.checkouts || 0,
          checkins: values.checkins || 0,
          requests: values.requests || 0
        };
        
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
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} asset specification: ${errorData.message || errorText}`);
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
      
      message.success(`Asset specification ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchSpecifications();
      
      form.resetFields();
      setDrawerOpen(false);
      setEditingSpecification(null);
    } catch (error) {
      console.error(`Error ${editingSpecification !== null ? 'updating' : 'creating'} asset specification:`, error);
      message.error(`Failed to ${editingSpecification !== null ? 'update' : 'create'} asset specification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit specification
  const handleEdit = (record) => {
    console.log("=== EDIT RECORD DEBUG ===");
    console.log("Edit record:", record);
    console.log("Record ID:", record.specification_id);
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
      asset_tag: cleanValue(record.asset_tag),
      status: cleanValue(record.status),
      serial: cleanValue(record.serial),
      manufacturer: cleanValue(record.manufacturer),
      category: cleanValue(record.category),
      model: cleanValue(record.model),
      model_no: cleanValue(record.model_no),
      byod: record.byod === "Yes" ? true : false,
      requestable: record.requestable === "Yes" ? true : false,
      purchase_date: record.purchase_date ? dayjs(record.purchase_date) : null,
      purchase_cost: cleanValue(record.purchase_cost),
      current_value: cleanValue(record.current_value),
      order_number: cleanValue(record.order_number),
      supplier: cleanValue(record.supplier),
      depreciation: cleanValue(record.depreciation),
      fully_depreciated: record.fully_depreciated === "Yes" ? true : false,
      eol_rate: cleanValue(record.eol_rate),
      eol_date: record.eol_date ? dayjs(record.eol_date) : null,
      notes: cleanValue(record.notes),
      location: cleanValue(record.location),
      default_location: cleanValue(record.default_location),
      checkouts: cleanValue(record.checkouts),
      checkins: cleanValue(record.checkins),
      requests: cleanValue(record.requests)
    };
    
    console.log("Form values being set:", formValues);
    
    form.setFieldsValue(formValues);
    
    const recordId = record.specification_id || record.id || record.key;
    console.log("Setting editing specification to:", recordId);
    
    setEditingSpecification(record); // Store the original record for updates
    setDrawerOpen(true);
  };

  // Handle delete specification
  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this asset specification?',
      content: `This will permanently delete ${record.asset_tag || record.asset_id}.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const deleteId = record.id || record.specification_id;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deleteAssetDetail", {
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
            message.success("Asset specification deleted successfully!");
            await fetchSpecifications(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete asset specification: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting asset specification:", error);
          message.error(`Failed to delete asset specification: ${error.message}`);
        }
      }
    });
  };

  // Bulk upload functionality
  const handleBulkUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      message.loading("Uploading file...", 0);
      
      const response = await fetch("http://202.53.92.35:5004/api/settings/bulk-upload-specifications", {
        method: 'POST',
        headers: {
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: formData
      });
      
      const result = await response.json();
      message.destroy();
      
      if (result.success) {
        message.success(`✅ Bulk upload successful! ${result.imported || 0} specifications imported.`);
        await fetchSpecifications(); // Refresh the table
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

  // Export functionality
  const exportSpecifications = () => {
    const csvContent = [
      ['S.No', 'Asset Tag', 'Status', 'Serial', 'Manufacturer', 'Category', 'Model', 'Model No.', 'BYOD', 'Requestable', 'Purchase Date', 'Purchase Cost', 'Current Value', 'Order Number', 'Supplier', 'Depreciation', 'Fully Depreciated', 'EOL Rate', 'EOL Date', 'Notes', 'Location', 'Default Location', 'Checkouts', 'Checkins', 'Requests'],
      ...filteredSpecifications.map((spec, index) => [
        index + 1,
        spec.asset_tag || '',
        spec.status || '',
        spec.serial || '',
        spec.manufacturer || '',
        spec.category || '',
        spec.model || '',
        spec.model_no || '',
        spec.byod ? 'Yes' : 'No',
        spec.requestable ? 'Yes' : 'No',
        spec.purchase_date || '',
        spec.purchase_cost || '',
        spec.current_value || '',
        spec.order_number || '',
        spec.supplier || '',
        spec.depreciation || '',
        spec.fully_depreciated ? 'Yes' : 'No',
        spec.eol_rate || '',
        spec.eol_date || '',
        spec.notes || '',
        spec.location || '',
        spec.default_location || '',
        spec.checkouts || 0,
        spec.checkins || 0,
        spec.requests || 0
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `asset_specifications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter specifications
  const filteredSpecifications = specifications.filter(spec => {
    const matchesStatus = selectedStatus === '' || spec.status === selectedStatus;
    return matchesStatus;
  });

  // Table columns
  const columns = [
    {
      title: 'S.No',
      key: 'serial',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      sorter: (a, b) => (a.asset_tag || '').localeCompare(b.asset_tag || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search asset tag"
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
        record.asset_tag?.toLowerCase().includes(value.toLowerCase()),
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
        { text: 'Maintenance', value: 'Maintenance' },
        { text: 'Retired', value: 'Retired' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Manufacturer',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      sorter: (a, b) => (a.manufacturer || '').localeCompare(b.manufacturer || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search manufacturer"
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
        record.manufacturer?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => (a.category || '').localeCompare(b.category || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search category"
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
        record.category?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
      sorter: (a, b) => (a.model || '').localeCompare(b.model || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search model"
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
        record.model?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Purchase Cost',
      dataIndex: 'purchase_cost',
      key: 'purchase_cost',
      sorter: (a, b) => (a.purchase_cost || 0) - (b.purchase_cost || 0),
      render: (cost) => cost ? `₹${parseFloat(cost).toLocaleString()}` : '-',
    },
    {
      title: 'Current Value',
      dataIndex: 'current_value',
      key: 'current_value',
      sorter: (a, b) => (a.current_value || 0) - (b.current_value || 0),
      render: (value) => value ? `₹${parseFloat(value).toLocaleString()}` : '-',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      sorter: (a, b) => (a.location || '').localeCompare(b.location || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search location"
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
        record.location?.toLowerCase().includes(value.toLowerCase()),
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
    <div className="container-fluid p-1">
      {/* Top Navigation Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Back Navigation */}
        <BackNavigation />
        
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      <h2 className="mb-1">Asset Specifications</h2>
     
      <p className="mt-0">Manage detailed specifications for all your assets.</p>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div></div>
        <div className="d-flex gap-2">
          <Upload {...uploadProps}>
            <Button 
              type="default"
              icon={<FaUpload />}
              style={{ 
                backgroundColor: '#fa8c16',
                borderColor: '#fa8c16',
                color: 'white',
                fontWeight: '500'
              }}
            >
              Bulk Upload
            </Button>
          </Upload>
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSpecification(null);
              form.resetFields();
              setDrawerOpen(true);
            }}
            style={{ fontWeight: '500' }}
          >
            Add Specification
          </Button>
          <Button 
            type="default"
            icon={<FaDownload />}
            onClick={exportSpecifications}
            style={{ 
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              color: 'white',
              fontWeight: '500'
            }}
          >
            Export Specifications
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="card custom-shadow">
        <div className="card-body">
          <Table
            columns={columns}
            dataSource={filteredSpecifications}
            loading={loading}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['5', '10', '20', '50', '100'],
            }}
            scroll={{ x: 1500 }}
          />
        </div>
      </div>

       {/* Drawer for Add/Edit Specification */}
       <Drawer
         title={editingSpecification ? 'Edit Asset Specification' : 'Add Asset Specification'}
         placement="right"
         onClose={() => setDrawerOpen(false)}
         open={drawerOpen}
         width={500}
       >
         <Form layout="vertical" form={form} onFinish={handleSave}>
           <Form.Item
             label="Asset Tag"
             name="asset_tag"
             rules={[{ required: true, message: "Please enter asset tag" }]}
           >
             <Input placeholder="e.g., ASSET-001" />
           </Form.Item>

           <Form.Item
             label="Status"
             name="status"
             rules={[{ required: true, message: "Please select status" }]}
           >
             <Select placeholder="Select status">
               <Select.Option value="Active">Active</Select.Option>
               <Select.Option value="Inactive">Inactive</Select.Option>
               <Select.Option value="Maintenance">Maintenance</Select.Option>
               <Select.Option value="Retired">Retired</Select.Option>
             </Select>
           </Form.Item>

           <Form.Item
             label="Serial Number"
             name="serial"
           >
             <Input placeholder="Enter serial number" />
           </Form.Item>

           <Form.Item
             label="Manufacturer"
             name="manufacturer"
           >
             <Input placeholder="Enter manufacturer" />
           </Form.Item>

           <Form.Item
             label="Category"
             name="category"
           >
             <Input placeholder="Enter category" />
           </Form.Item>

           <Form.Item
             label="Model"
             name="model"
           >
             <Input placeholder="Enter model" />
           </Form.Item>

           <Form.Item
             label="Model Number"
             name="model_no"
           >
             <Input placeholder="Enter model number" />
           </Form.Item>

           <Form.Item
             label="Location"
             name="location"
           >
             <Input placeholder="Enter location" />
           </Form.Item>

           <Form.Item
             label="Purchase Date"
             name="purchase_date"
           >
             <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
           </Form.Item>

           <Form.Item
             label="Purchase Cost"
             name="purchase_cost"
           >
             <InputNumber
               style={{ width: '100%' }}
               placeholder="Enter purchase cost"
               formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
               parser={value => value.replace(/₹\s?|(,*)/g, '')}
             />
           </Form.Item>

           <Form.Item
             label="Current Value"
             name="current_value"
           >
             <InputNumber
               style={{ width: '100%' }}
               placeholder="Enter current value"
               formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ', ')}
               parser={value => value.replace(/₹\s?|(,*)/g, '')}
             />
           </Form.Item>

           <Form.Item
             label="Order Number"
             name="order_number"
           >
             <Input placeholder="Enter order number" />
           </Form.Item>

           <Form.Item
             label="Supplier"
             name="supplier"
           >
             <Input placeholder="Enter supplier" />
           </Form.Item>

           <Form.Item
             label="Depreciation"
             name="depreciation"
           >
             <Input placeholder="Enter depreciation" />
           </Form.Item>

           <Form.Item
             label="EOL Rate (%)"
             name="eol_rate"
           >
             <InputNumber
               style={{ width: '100%' }}
               placeholder="Enter EOL rate"
               min={0}
               max={100}
               formatter={value => `${value}%`}
               parser={value => value.replace('%', '')}
             />
           </Form.Item>

           <Form.Item
             label="EOL Date"
             name="eol_date"
           >
             <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
           </Form.Item>

           <Form.Item
             label="Default Location"
             name="default_location"
           >
             <Input placeholder="Enter default location" />
           </Form.Item>

           <Form.Item
             label="Notes"
             name="notes"
           >
             <Input.TextArea rows={3} placeholder="Enter notes" />
           </Form.Item>

           <Form.Item
             label="Checkouts"
             name="checkouts"
           >
             <InputNumber
               style={{ width: '100%' }}
               placeholder="Enter checkouts count"
               min={0}
             />
           </Form.Item>

           <Form.Item
             label="Checkins"
             name="checkins"
           >
             <InputNumber
               style={{ width: '100%' }}
               placeholder="Enter checkins count"
               min={0}
             />
           </Form.Item>

           <Form.Item
             label="Requests"
             name="requests"
           >
             <InputNumber
               style={{ width: '100%' }}
               placeholder="Enter requests count"
               min={0}
             />
           </Form.Item>

           <Form.Item
             label="BYOD"
             name="byod"
           >
             <Select placeholder="Select option">
               <Select.Option value={true}>Yes</Select.Option>
               <Select.Option value={false}>No</Select.Option>
             </Select>
           </Form.Item>

           <Form.Item
             label="Requestable"
             name="requestable"
           >
             <Select placeholder="Select option">
               <Select.Option value={true}>Yes</Select.Option>
               <Select.Option value={false}>No</Select.Option>
             </Select>
           </Form.Item>

           <Form.Item
             label="Fully Depreciated"
             name="fully_depreciated"
           >
             <Select placeholder="Select option">
               <Select.Option value={true}>Yes</Select.Option>
               <Select.Option value={false}>No</Select.Option>
             </Select>
           </Form.Item>

           {/* Buttons */}
           <Form.Item>
             <Space className="d-flex justify-content-end w-100">
               <Button onClick={() => form.resetFields()} disabled={loading}>Reset</Button>
               <Button className="btn btn-success" htmlType="submit" loading={loading}>
                 {editingSpecification ? 'Update Specification' : 'Add Specification'}
               </Button>
             </Space>
           </Form.Item>
         </Form>
      </Drawer>
    </div>
  );
};

export default AssetSpecification;
