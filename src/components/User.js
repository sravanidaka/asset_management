import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import CustomBreadcrumb from './common/Breadcrumb';
import BackNavigation from './common/BackNavigation';
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
} from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const User = () => {
  const [search, setSearch] = useState("");
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

  // Fetch Users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://202.53.92.35:5004/api/users");
      
      console.log('Full API Response:', res.data);
      console.log('Response keys:', Object.keys(res.data || {}));
      
      let usersData = [];
      
      // Handle different API response formats
      if (res.data?.success && Array.isArray(res.data.data)) {
        usersData = res.data.data;
        console.log('Using res.data.data format');
      } else if (res.data?.success && Array.isArray(res.data.users)) {
        usersData = res.data.users;
        console.log('Using res.data.users format');
      } else if (Array.isArray(res.data)) {
        usersData = res.data;
        console.log('Using direct array format');
      } else if (res.data?.users && Array.isArray(res.data.users)) {
        usersData = res.data.users;
        console.log('Using res.data.users format');
      } else {
        console.error("Unexpected API response format:", res.data);
        message.error("No users data received from server");
        setUsers([]);
        return;
      }
      
      console.log('Raw users data:', usersData);
      if (usersData.length > 0) {
        console.log('First user object:', usersData[0]);
        console.log('First user keys:', Object.keys(usersData[0] || {}));
      }
      
      // Handle empty API response
      if (usersData.length === 0) {
        setUsers([]);
        message.info("No users found");
        return;
      }
      
      // Transform data to match table column expectations
      const dataWithKeys = usersData.map((item, index) => {
        const transformedItem = {
          key: item.id || index.toString(),
          id: item.id || item.user_id,
          name: item.name || item.username || item.user_name,
          email: item.email || item.email_address,
          phone: item.phone || item.phone_number || item.mobile,
          role_name: item.role_name || item.role || item.role_title,
          status: item.status || item.user_status || item.active_status,
          // Keep original data for reference
          ...item
        };
        
        console.log('Transformed item:', transformedItem);
        return transformedItem;
      });
      
      console.log('Final processed data:', dataWithKeys);
      setUsers(dataWithKeys);
    } catch (error) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data);
      message.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const res = await axios.get("http://202.53.92.35:5004/api/roles/getRolesList");
      
      let rolesData = [];
      if (res.data?.success && Array.isArray(res.data.data)) {
        // API returns {success: true, data: [...]}
        rolesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        // API returns array directly
        rolesData = res.data;
      } else {
        console.error("Unexpected roles API response format:", res.data);
        message.error("No roles data received from server");
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
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      message.error("Failed to fetch roles");
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);


  // Filter data based on search
  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value?.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

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
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      ...getColumnSearchProps('id'),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name?.localeCompare(b.name),
      ...getColumnSearchProps('name'),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email?.localeCompare(b.email),
      ...getColumnSearchProps('email'),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      sorter: (a, b) => a.phone?.localeCompare(b.phone),
      ...getColumnSearchProps('phone'),
    },
    {
      title: "Role",
      dataIndex: "role_name",
      key: "role_name",
      sorter: (a, b) => a.role_name?.localeCompare(b.role_name),
      ...getColumnSearchProps('role_name'),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status?.localeCompare(b.status),
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
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={async (e) => {
              e?.stopPropagation();
              try {
                await axios.delete("http://202.53.92.35:5004/api/users", {
                  data: { id: record.id }
                });
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
          </Popconfirm>
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
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role_id: user.role_id,
        status: user.status,
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
      if (editingUser) {
        // For updates, send all fields
        const updateData = {
          id: editingUser.id,
          name: values.name,
          email: values.email,
          phone: values.phone,
          role_id: values.role_id,
          status: values.status,
        };
        
        // Only include password if it's provided
        if (values.password) {
          updateData.password = values.password;
        }
        
        const response = await axios.put("http://202.53.92.35:5004/api/users", updateData);
        
        if (response.data?.success) {
          message.success("User updated successfully");
        } else {
          throw new Error(response.data?.message || "Failed to update user");
        }
      } else {
        // For new users, send all required fields
        const createData = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role_id: values.role_id,
          status: values.status,
        };
        
        const response = await axios.post("http://202.53.92.35:5004/api/users", createData);
        
        if (response.data?.success) {
          message.success("User added successfully");
        } else {
          throw new Error(response.data?.message || "Failed to create user");
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
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Button
              onClick={fetchUsers}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showDrawer()}
            >
              Add New User
            </Button>
          </div>
        </div>

        <div className="card af-card mt-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">User List</h5>
          </div>
        <Table
          columns={columns}
          dataSource={filteredUsers}
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
        title={editingUser ? "Update User" : "Add New User"}
        width={480}
        onClose={onClose}
        open={open}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              className="btn-add"
              type="primary"
              onClick={() => form.submit()}
            >
              {editingUser ? "Update" : "Submit"}
            </Button>
          </Space>
        }
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
                label="Username"
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
                label="Email"
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
                label="Phone"
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="password"
                label={editingUser ? "New Password (optional)" : "Password"}
                rules={[
                  { required: !editingUser, message: "Please enter password" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters long",
                  },
                ]}
              >
                <Input.Password placeholder={editingUser ? "Enter new password (leave blank to keep current)" : "Enter password"} />
              </Form.Item>
            </Col>
          </Row>

          {/* Role */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="role_id"
                label="Role"
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
                label="Status"
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


        </Form>
      </Drawer>
    </div>
  );
};

export default User;
