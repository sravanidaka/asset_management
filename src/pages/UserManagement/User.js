import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
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
  Upload,
} from "antd";
import { SearchOutlined, PlusOutlined, DownloadOutlined, CloudDownloadOutlined, CloudUploadOutlined, FileTextOutlined, CheckCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { FaUpload } from "react-icons/fa";
import { api } from '../../config/api';
import ExportButton from '../../components/ExportButton';
import { safeStringCompare } from '../../utils/tableUtils';

const { Option } = Select;

const User = () => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [bulkUploadDrawerVisible, setBulkUploadDrawerVisible] = useState(false);

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Try the API with different query parameters to get phone data
      const baseUrl = 'http://202.53.92.35:5004/api/users';
      const queryParams = [
        '',  // Original endpoint
        '?include=phone',
        '?fields=id,name,email,phone,roles,status',
        '?include_phone=true',
        '?with_phone=true'
      ];
      
      let response;
      let lastError;
      
      // Try each query parameter until one works
      for (const param of queryParams) {
        try {
          const url = baseUrl + param;
          console.log(`Trying URL: ${url}`);
          response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              "x-access-token": sessionStorage.getItem("token"),
            }
          });
          
          if (response.ok) {
            console.log(`Successfully connected to: ${url}`);
            break;
          }
        } catch (error) {
          console.log(`Failed to connect to ${baseUrl + param}:`, error.message);
          lastError = error;
        }
      }
      
      if (!response || !response.ok) {
        throw lastError || new Error('All endpoints failed');
      }
      
      console.log('Users API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Users API Response:', result);
      
      let usersData = [];
      if (Array.isArray(result)) {
        usersData = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        usersData = result.data;
        console.log("Using result.data");
      } else if (result.users && Array.isArray(result.users)) {
        usersData = result.users;
        console.log("Using result.users");
      } else if (result.success && Array.isArray(result.data)) {
        usersData = result.data;
        console.log("Using result.success.data");
      } else {
        console.error("Unexpected API response structure:", result);
        message.error("Unexpected users data format from server");
        setUsers([]);
        return;
      }
      
      console.log('Raw users data:', usersData);
      if (usersData.length > 0) {
        console.log('First user object:', usersData[0]);
        console.log('First user keys:', Object.keys(usersData[0] || {}));
        console.log('All field values in first user:', usersData[0]);
        console.log('Phone field specifically:', usersData[0].phone);
        console.log('Type of phone field:', typeof usersData[0].phone);
        console.log('Is phone field empty?', usersData[0].phone === '' || usersData[0].phone === null || usersData[0].phone === undefined);
        
        // Check if any user has phone data
        const usersWithPhone = usersData.filter(user => user.phone && user.phone !== '');
        console.log(`Users with phone data: ${usersWithPhone.length} out of ${usersData.length}`);
        if (usersWithPhone.length > 0) {
          console.log('Sample user with phone:', usersWithPhone[0]);
        }
      }
      
      // Handle empty API response
      if (usersData.length === 0) {
        setUsers([]);
        message.info("No users found");
        return;
      }
      
      // Transform data to match table column expectations
      const dataWithKeys = usersData.map((item, index) => {
        console.log('Processing item:', item);
        console.log('Available fields:', Object.keys(item));
        
        console.log('Processing user item:', item);
        console.log('Available fields:', Object.keys(item));
        
        // Check if phone field exists in any form
        const phoneValue = item.phone || item.phone_number || item.mobile || item.contact || item.contact_number || item.telephone || item.phone_no || '';
        console.log('Phone value found:', phoneValue);
        
        const transformedItem = {
          key: item.id || item.user_id || index.toString(),
          id: item.id || item.user_id,
          name: item.name,
          email: item.email,
          phone: phoneValue,
          role_name: item.roles,
          role_id: item.role_id,
          status: item.status,
          // Keep original data for reference
          ...item
        };
        
        console.log('Transformed item:', transformedItem);
        console.log('Transformed phone value:', transformedItem.phone);
        console.log('Transformed phone type:', typeof transformedItem.phone);
        console.log('Role field value:', transformedItem.role_name);
        return transformedItem;
      });
      
      console.log('Final processed data:', dataWithKeys);
      
      // Check if any user has phone data
      const hasPhoneData = dataWithKeys.some(user => user.phone && user.phone !== '');
      if (!hasPhoneData) {
        console.warn('No phone data found in API response. Available fields:', dataWithKeys.length > 0 ? Object.keys(dataWithKeys[0]) : 'No data');
        message.warning('Phone data is not available in the current API response. Please check if the API includes phone field.');
      }
      
      setUsers(dataWithKeys);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.message);
      message.error(`Failed to fetch users: ${error.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const response = await fetch('http://202.53.92.35:5004/api/roles/getRolesList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-access-token": sessionStorage.getItem("token"),
        }
      });
      
      console.log('Roles API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Roles API Response:', result);
      
      let rolesData = [];
      if (Array.isArray(result)) {
        rolesData = result;
        console.log("Using direct array from roles API");
      } else if (result.data && Array.isArray(result.data)) {
        rolesData = result.data;
        console.log("Using result.data from roles API");
      } else if (result.roles && Array.isArray(result.roles)) {
        rolesData = result.roles;
        console.log("Using result.roles from roles API");
      } else if (result.success && Array.isArray(result.data)) {
        rolesData = result.data;
        console.log("Using result.success.data from roles API");
      } else {
        console.error("Unexpected roles API response structure:", result);
        message.error("Unexpected roles data format from server");
        setRoles([]);
        return;
      }
      
      // Handle empty API response
      if (rolesData.length === 0) {
        console.log('API returned empty roles data');
        setRoles([]);
        message.info("No roles found");
        return;
      }
      
      setRoles(rolesData);
      
      if (rolesData.length > 0) {
        console.log(`Roles loaded successfully (${rolesData.length} items)`);
        console.log('First role object:', rolesData[0]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      message.error(`Failed to fetch roles: ${error.message}`);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);



  // Column search props
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
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
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
  });

  // Table columns with sorting and search
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
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   sorter: (a, b) => a.id - b.id,
    //   ...getColumnSearchProps('id'),
    // },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => safeStringCompare(a.name, b.name),
      ...getColumnSearchProps('name'),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => safeStringCompare(a.email, b.email),
      ...getColumnSearchProps('email'),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      sorter: (a, b) => safeStringCompare(a.phone, b.phone),
      ...getColumnSearchProps('phone'),
      render: (phone) => {
        console.log('Rendering phone in table:', phone, 'Type:', typeof phone);
        if (!phone || phone === '') {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>Not Available</span>;
        }
        return phone;
      },
    },
    {
      title: "Role",
      dataIndex: "role_name",
      key: "role_name",
      sorter: (a, b) => safeStringCompare(a.role_name, b.role_name),
      ...getColumnSearchProps('role_name'),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => safeStringCompare(a.status, b.status),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <span className={`badge ${status === "Active" ? "bg-success" : status === "Pending" ? "bg-warning" : "bg-danger"}`}>
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            type="default" 
            size="small" 
            icon={<FaEdit />} 
            onClick={(e) => {
              e.stopPropagation();
              showDrawer(record);
            }}
          />
          {/* <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={async (e) => {
              e?.stopPropagation();
              try {
                const deleteResult = await api.deleteUser({ id: record.id });
                message.success("User deleted successfully");
                fetchUsers();
              } catch (error) {
                console.error("Error deleting user:", error);
                message.error("Failed to delete user");
              }
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<FaTrash />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  // Handle pagination change
  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const showDrawer = (user = null) => {
    setEditingUser(user);
    if (user) {
      // Find the role_id that matches the role_name
      const matchingRole = roles.find(role => role.role_name === user.role_name);
      
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: matchingRole ? matchingRole.role_id : user.role_id,
        status: user.status,
      });
      
      console.log('Form values set:', {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: matchingRole ? matchingRole.role_id : user.role_id,
        status: user.status,
        user_role_name: user.role_name,
        matching_role: matchingRole
      });
    } else {
      form.resetFields();
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setEditingUser(null);
  };

  // Submit form
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Find the role name for the selected role_id
      const selectedRole = roles.find(role => role.role_id === values.role_id);
      const roleName = selectedRole ? selectedRole.role_name : values.role_id;
      
      if (editingUser) {
        // For updates, send all fields
        const updateData = {
          id: editingUser.id,
          name: values.name,
          email: values.email,
          phone: values.phone,
          roles: roleName, // Use 'roles' field as per your payload structure
          status: values.status,
        };
        
        // Only include password if it's provided
        if (values.password) {
          updateData.password = values.password;
        }
        
        console.log('Update data being sent:', updateData);
        
        const response = await fetch('http://202.53.92.35:5004/api/users', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            "x-access-token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        console.log('Update response:', result);
        
        if (result.success || result.id) {
          message.success("User updated successfully");
        } else {
          throw new Error(result.message || "Failed to update user");
        }
      } else {
        // For new users, send all required fields
        const createData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          roles: roleName, // Use 'roles' field as per your payload structure
          status: values.status,
        };
        
        console.log('Create data being sent:', createData);
        
        const response = await fetch('http://202.53.92.35:5004/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "x-access-token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify(createData)
        });
        
        const result = await response.json();
        console.log('Create response:', result);
        
        if (result.success || result.id) {
          message.success("User added successfully");
        } else {
          throw new Error(result.message || "Failed to create user");
        }
      }
      fetchUsers();
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save user";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
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
      
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      const response = await fetch("http://202.53.92.35:5004/api/users/bulk-upload", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({
          excelFile: base64,
          fileName: file.name
        })
      });
      
      const result = await response.json();
      message.destroy();
      
      if (result.success) {
        message.success(`✅ Bulk upload successful! ${result.imported || 0} users imported.`);
        await fetchUsers(); // Refresh the table
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
      'Username',
      'Email',
      'Phone',
      'Password',
      'Role',
      'Status'
    ];

    // Create CSV content with headers only
    const csvContent = fieldNames.join(',') + '\n';

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_bulk_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('✅ Excel template downloaded!');
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
            <h2 className="mb-1">Users</h2>
            <p className="mt-0">Control access to asset screens and actions.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              type="default"
              icon={<FaUpload />}
              onClick={() => setBulkUploadDrawerVisible(true)}
              style={{ fontWeight: '500' }}
            >
              Bulk Upload
            </Button>
            <ExportButton
              data={users}
              columns={columns}
              filename="User_Management_Report"
              title="User Management Report"
              reportType="user-management"
              filters={{}}
              sorter={{}}
              message={message}
              includeAllFields={true}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showDrawer()}
            >
              Add New User
            </Button>
          </div>
        </div>

   
        <Table
          columns={columns}
          dataSource={users}
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
        title={editingUser ? "Update User" : "Add New User"}
        width={480}
        onClose={onClose}
        open={open}
        destroyOnClose
      >
        <Form
          layout="vertical"
          hideRequiredMark
          form={form}
          onFinish={onFinish}
        >
          {/* Username */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label={<span>Username <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please enter username" },
                  {
                    pattern: /^[A-Za-z]+$/,
                    message: "Username must contain only alphabets (no spaces or special chars)",
                  },
                ]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
          </Row>


          {/* Email */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="email"
                label={<span>Email <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please enter email" },
                  {
                    type: "email",
                    message: "Enter a valid email",
                  },
                ]}
              >
                <Input type="email" placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>

          {/* Phone */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="phone"
                label={<span>Phone <span style={{ color: 'red' }}>*</span></span>}
                rules={[
                  { required: true, message: "Please enter phone" },
                  {
                    pattern: /^[0-9]+$/,
                    message: "Phone must contain only numbers",
                  },
                ]}
              >
                <Input placeholder="Enter phone" />
              </Form.Item>
            </Col>
          </Row>

          {/* Password - Required for new users, optional for editing */}


          {/* Role */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="role_id"
                label={<span>Role <span style={{ color: 'red' }}>*</span></span>}
                rules={[{ required: true, message: "Please select role" }]}
              >
                <Select placeholder="Select role">
                  {roles.map((role) => (
                    <Option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Status */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="status"
                label={<span>Status <span style={{ color: 'red' }}>*</span></span>}
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          {/* Footer buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button size="small" onClick={onClose}>Close</Button>
              <Button size="small" type="primary" htmlType="submit">
                {editingUser ? "Update" : "Submit"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Bulk Upload Drawer */}
      <Drawer
        title="Bulk Upload Users"
        width={600}
        onClose={() => setBulkUploadDrawerVisible(false)}
        open={bulkUploadDrawerVisible}
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={() => setBulkUploadDrawerVisible(false)}>
              Cancel
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
              <li><strong>Username</strong> - User's username (alphabets only, no spaces)</li>
              <li><strong>Email</strong> - Valid email address (must be unique)</li>
              <li><strong>Phone</strong> - Phone number (numbers only, must be unique)</li>
              <li><strong>Password</strong> - User's password</li>
              <li><strong>Role</strong> - User's role (must match existing roles)</li>
              <li><strong>Status</strong> - User status (Active, Pending, or Inactive)</li>
            </ul>
          </div>
          
          <div style={{ 
            background: '#fff7e6', 
            border: '1px solid #ffd591', 
            borderRadius: '6px', 
            padding: '16px',
            marginBottom: '20px'
          }}>
            <h5 style={{ color: '#fa8c16', marginBottom: '12px' }}>
              ⚠️ Important Notes:
            </h5>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Username must contain only alphabets (no spaces or special characters)</li>
              <li>Email addresses must be unique across all users</li>
              <li>Phone numbers must be unique across all users</li>
              <li>Role must match existing roles in the system</li>
              <li>Status must be one of: Active, Pending, or Inactive</li>
              <li>Password will be encrypted automatically</li>
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
            Select your Excel or CSV file to upload. The system will validate the data and import the users.
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

export default User;
