import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import { Button, Col, Drawer, Form, Input, Row, Checkbox, Space, message, Table, Popconfirm } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { api } from '../../config/api';
import ExportButton from '../../components/ExportButton';
import { safeStringCompare, safeDateCompare } from '../../utils/tableUtils';
import { formatDateForDisplay } from '../../utils/dateUtils';

const Roles = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [form] = Form.useForm();
  const [modules, setModules] = useState([]); // dynamic modules
  const [selectedPermissions, setSelectedPermissions] = useState({}); // {module_id: [action_ids]}
  const [editingRole, setEditingRole] = useState(null); // Track which role is being edited

  // Fetch roles list
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const result = await api.getRoles();
        
        let rolesData = [];
        if (result.data?.success && Array.isArray(result.data.data)) {
          // API returns {success: true, data: [...]}
          rolesData = result.data.data;
        } else if (Array.isArray(result.data)) {
          // API returns array directly
          rolesData = result.data;
        } else {
          console.error("Unexpected API response:", result.data);
          message.error("Unexpected roles data format from server");
          return;
        }
        
        const dataWithKeys = rolesData.map((item, index) => ({
          ...item,
          key: item.role_id || index.toString(),
        }));
        setRoles(dataWithKeys);
      } catch (error) {
        console.error("Error fetching roles:", error);
        message.error("Failed to fetch roles");
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
        const result = await api.getModuleActions();
        if (result.success && Array.isArray(result.data)) {
          setModules(result.data);
        } else {
          console.error("Unexpected API response:", result.data);
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };
    fetchModules();
  }, []);

  // Fetch role with permissions
  const fetchRoleWithPermissions = async (roleId) => {
    try {
      const result = await api.getRoleWithPermissions({ role_id: roleId });
      if (result.data?.success) {
        return result.data.data;
      } else {
        console.error("Unexpected API response:", result.data);
        return null;
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      return null;
    }
  };

  // Search filter
  const filteredRoles = roles.filter(
    (role) =>
      role.role_name?.toLowerCase().includes(search.toLowerCase()) ||
      role.role_code?.toLowerCase().includes(search.toLowerCase())
  );

  // Table columns with sorting
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
    {
      title: "Code",
      dataIndex: "role_code",
      key: "role_code",
      sorter: (a, b) => safeStringCompare(a.role_code, b.role_code),
    },
    {
      title: "Name",
      dataIndex: "role_name",
      key: "role_name",
      sorter: (a, b) => safeStringCompare(a.role_name, b.role_name),
    },
    {
      title: "Created On",
      dataIndex: "created_on",
      key: "created_on",
      sorter: (a, b) => safeDateCompare(a.created_on, b.created_on),
      render: (date) => formatDateForDisplay(date) || "-",
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
            onClick={() => showEditDrawer(record)}
          />
          {/* <Popconfirm
            title="Are you sure to delete this role?"
            onConfirm={async () => {
              try {
                const deleteResult = await api.deleteRole({ role_id: record.role_id });
                message.success("Role deleted successfully");
                // Refresh roles list
                const refreshed = await api.getRoles();
                if (refreshed.data?.success && Array.isArray(refreshed.data.data)) {
                  const dataWithKeys = refreshed.data.data.map((item, index) => ({
                    ...item,
                    key: item.role_id || index.toString(),
                  }));
                  setRoles(dataWithKeys);
                }
              } catch (error) {
                console.error("Error deleting role:", error);
                message.error("Failed to delete role");
              }
            }}
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<FaTrash />}
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


  // Update module function
  const updateModule = async (moduleId, moduleName, moduleCode) => {
    try {
      const result = await api.updateModules({
        module_id: moduleId,
        module_name: moduleName,
        module_code: moduleCode
      });
      
      if (result.data?.success) {
        message.success("Module updated successfully");
        // Refresh modules list
        const refreshed = await api.getModules();
        if (refreshed.data?.success && Array.isArray(refreshed.data.data)) {
          setModules(refreshed.data.data);
        }
      } else {
        message.error("Failed to update module");
      }
    } catch (error) {
      console.error("Error updating module:", error);
      message.error("Failed to update module");
    }
  };

  // Drawer handlers
  const showDrawer = () => {
    setEditingRole(null);
    setOpen(true);
    form.resetFields();
    setSelectedPermissions({});
  };

  const showEditDrawer = async (role) => {
    setEditingRole(role);
    setOpen(true);
    
    // Set form values
    form.setFieldsValue({
      name: role.role_name,
      code: role.role_code,
    });

    // Fetch and set permissions for this role
    const roleWithPermissions = await fetchRoleWithPermissions(role.role_id);
    if (roleWithPermissions) {
      const permissions = {};
      roleWithPermissions.permissions?.forEach(perm => {
        permissions[perm.module_id] = perm.action_ids || [];
      });
      setSelectedPermissions(permissions);
    } else {
      setSelectedPermissions({});
    }
  };

  const onClose = () => {
    setOpen(false);
    setEditingRole(null);
  };

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
      
      if (editingRole) {
        // Update existing role
        const updatePayload = {
          role_id: editingRole.role_id,
          role_name: values.name,
          role_code: values.code,
        };

        const result = await api.updateRole(updatePayload);

        if (result.data?.success) {
          message.success("Role updated successfully!");
          setOpen(false);
          // Refresh roles list
          const refreshed = await api.getRoles();
          if (refreshed.data?.success && Array.isArray(refreshed.data.data)) {
            const dataWithKeys = refreshed.data.data.map((item, index) => ({
              ...item,
              key: item.role_id || index.toString(),
            }));
            setRoles(dataWithKeys);
          }
        } else {
          message.error("Failed to update role.");
        }
      } else {
        // Create new role
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

        const result = await api.createRolePermissions(payload);

        if (result.data?.success) {
          message.success("Role added successfully!");
          setOpen(false);
          // Refresh roles list
          const refreshed = await api.getRoles();
          if (refreshed.data?.success && Array.isArray(refreshed.data.data)) {
            const dataWithKeys = refreshed.data.data.map((item, index) => ({
              ...item,
              key: item.role_id || index.toString(),
            }));
            setRoles(dataWithKeys);
          }
        } else {
          message.error("Failed to add role.");
        }
      }
    } catch (error) {
      console.error("Error saving role:", error);
      message.error(`Error while ${editingRole ? 'updating' : 'adding'} role.`);
    }
  };

  return (
    
      <div className="container-fluid p-1">
        <h2 className="mb-1">Roles</h2>
        <p className="mt-0">
          Manage Roles by adding, editing roles, and tracking activity.
        </p>
      

      {/* Search + Add button */}
      <div className="actions-bar d-flex justify-content-between align-items-center mb-2">
        <div className="search-box d-flex align-items-center">
          <Input
            placeholder="Search Role by name or code..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={filteredRoles}
            columns={columns}
            filename="Roles_Management_Report"
            title="Roles Management Report"
            reportType="roles-management"
            filters={{}}
            sorter={{}}
            message={message}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showDrawer}
          >
            Add New Role
          </Button>
        </div>
      </div>

      {/* Roles table */}
      <div className="card af-card mt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Roles List</h5>
        </div>
        <Table
          columns={columns}
          dataSource={filteredRoles}
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

      {/* Drawer */}
      <Drawer
        title={editingRole ? "Update Role" : "Add Roles Details"}
        width={720}
        onClose={onClose}
        open={open}
        styles={{ body: { paddingBottom: 80 } }}
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={onSubmit}>
              {editingRole ? "Update" : "Submit"}
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
