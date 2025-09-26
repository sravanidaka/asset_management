import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
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
} from "antd";
import axios from "axios";

const { Option } = Select;

const User = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState(null);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://202.53.92.37:5003/api/users");
      setUsers(res.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const res = await axios.get(
        "http://202.53.92.37:5003/api/roles/getRolesList"
      );
      if (Array.isArray(res.data)) {
        setRoles(res.data);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      message.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase())
  );

  const showDrawer = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        ...user,
        role_id: user.role_id,
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
    try {
      if (editingUser) {
        await axios.put("http://202.53.92.37:5003/api/users/update", {
          id: editingUser.id,
          ...values,
        });
        message.success("User updated successfully");
      } else {
        await axios.post("http://202.53.92.37:5003/api/users", values);
        message.success("User added successfully");
      }
      fetchUsers();
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Failed to save user");
    }
  };

  return (
    <div className="container p-1">
      <div className="container-fluid p-1">
        <h2 className="mb-1">Users</h2>
        <p className="mt-0">Control access to asset screens and actions.</p>
      </div>

      <div className="actions-bar d-flex justify-content-between align-items-center mb-2">
        <div className="search-box d-flex align-items-center">
          <FaSearch className="search-icon me-2" />
          <input
            type="text"
            placeholder="Search users..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="btn-add d-flex align-items-center"
          onClick={() => showDrawer()}
        >
          <FaEdit className="me-2" /> Add New User
        </button>
      </div>

      <div className="card af-card mt-3">
        <h5 className="card-title">User List</h5>
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>{user.role_name}</td>
                <td>
                  <span className="status-badge">{user.status}</span>
                </td>
                <td className="actions">
                  <FaEdit
                    className="icon edit"
                    onClick={() => showDrawer(user)}
                  />
                  <Popconfirm
                    title="Are you sure to delete this user?"
                    onConfirm={() => message.info("Delete API not implemented")}
                  >
                    <FaTrash className="icon delete" />
                  </Popconfirm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                name="username"
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

          {/* Password */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter password" },
                  {
                    pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                    message:
                      "Password must have 1 uppercase, 1 digit, 1 special character and min 6 chars",
                  },
                ]}
              >
                <Input.Password placeholder="Enter password" />
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
