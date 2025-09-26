import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { Button, Col, Drawer, Form, Input, Row, Checkbox, Space, message } from "antd";
import axios from "axios";

const Roles = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();
  const [modules, setModules] = useState([]); // dynamic modules
  const [selectedPermissions, setSelectedPermissions] = useState({}); // {module_id: [action_ids]}

  // Fetch roles list
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://202.53.92.37:5003/api/roles/getRolesList");
        if (response.data?.success && Array.isArray(response.data.data)) {
          setRoles(response.data.data);
        } else {
          console.error("Unexpected API response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Fetch modules + actions
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get("http://202.53.92.37:5003/api/roles/getModuleActions");
        if (response.data?.success && Array.isArray(response.data.data)) {
          setModules(response.data.data);
        } else {
          console.error("Unexpected API response:", response.data);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };
    fetchModules();
  }, []);

  // Search filter
  const filteredRoles = roles.filter(
    (role) =>
      role.role_name?.toLowerCase().includes(search.toLowerCase()) ||
      role.role_code?.toLowerCase().includes(search.toLowerCase())
  );

  // Drawer handlers
  const showDrawer = () => {
    setOpen(true);
    form.resetFields();
    setSelectedPermissions({});
  };
  const onClose = () => setOpen(false);

  // Checkbox handler
  const handlePermissionChange = (moduleId, actionId, checked) => {
    setSelectedPermissions((prev) => {
      const current = prev[moduleId] || [];
      if (checked) {
        return { ...prev, [moduleId]: [...current, actionId] };
      } else {
        return { ...prev, [moduleId]: current.filter((id) => id !== actionId) };
      }
    });
  };

  // Submit role
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        role_name: values.name,
        role_code: values.code,
        created_by: 1,
        updated_by: 1,
        permissions: Object.entries(selectedPermissions).map(([moduleId, actionIds]) => ({
          module_id: parseInt(moduleId, 10),
          action_ids: actionIds,
        })),
      };

      const response = await axios.post(
        "http://202.53.92.37:5003/api/roles/insertRolePermissions",
        payload
      );

      if (response.data?.success) {
        message.success("Role added successfully!");
        setOpen(false);
        // refresh roles list
        const refreshed = await axios.get("http://202.53.92.37:5003/api/roles/getRolesList");
        setRoles(refreshed.data.data || []);
      } else {
        message.error("Failed to add role.");
      }
    } catch (error) {
      console.error("Error inserting role:", error);
      message.error("Error while adding role.");
    }
  };

  return (
    <div className="container p-1">
      <div className="container-fluid p-1">
        <h2 className="mb-1">Roles</h2>
        <p className="mt-0">
          Manage Roles by adding, editing roles, and tracking activity.
        </p>
      </div>

      {/* Search + Add button */}
      <div className="actions-bar d-flex justify-content-between align-items-center mb-2">
        <div className="search-box d-flex align-items-center">
          <FaSearch className="search-icon me-2" />
          <input
            type="text"
            placeholder="Search Role by name or code..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-add d-flex align-items-center" onClick={showDrawer}>
          <FaEdit className="me-2" /> Add New Role
        </button>
      </div>

      {/* Roles table */}
      <div className="card af-card mt-3">
        <h5 className="card-title">Roles List</h5>
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Created On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center">Loading...</td>
              </tr>
            ) : filteredRoles.length > 0 ? (
              filteredRoles.map((role) => (
                <tr key={role.role_id}>
                  <td>{role.role_code}</td>
                  <td>{role.role_name}</td>
                  <td>{role.created_on ? new Date(role.created_on).toLocaleDateString() : "-"}</td>
                  <td className="actions">
                    <FaEdit className="icon edit" />
                    <FaTrash className="icon delete" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">No roles found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <Drawer
        title="Add Roles Details"
        width={720}
        onClose={onClose}
        open={open}
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onSubmit}>
              Submit
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical" hideRequiredMark>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Code"
                rules={[{ required: true, message: "Please enter code" }]}
              >
                <Input placeholder="Enter role code" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input placeholder="Enter role name" />
              </Form.Item>
            </Col>
          </Row>

          {/* Permissions */}
          {modules.map((module) => (
            <div key={module.module_id} className="mt-3 p-2 border rounded bg-light">
              <h6>{module.module_name}</h6>
              <Row gutter={16}>
                {module.actions.map((action) => (
                  <Col span={4} key={action.action_id}>
                    <Checkbox
                      checked={selectedPermissions[module.module_id]?.includes(action.action_id)}
                      onChange={(e) =>
                        handlePermissionChange(module.module_id, action.action_id, e.target.checked)
                      }
                    >
                      {action.action_name}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Form>
      </Drawer>
    </div>
  );
};

export default Roles;
