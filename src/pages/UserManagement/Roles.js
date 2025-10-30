import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import { FaSearch, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCheck, FaTimes } from "react-icons/fa";
import { Button, Col, Drawer, Form, Input, Row, Checkbox, Space, message, Table, Popconfirm, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { api } from '../../config/api';
import ExportButton from '../../components/ExportButton';
import { safeStringCompare, safeDateCompare } from '../../utils/tableUtils';
import { formatDateForDisplay } from '../../utils/dateUtils';

const Roles = () => {
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
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [selectAllModules, setSelectAllModules] = useState(false);

  // Fetch roles list
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
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
        } else if (result.data && Array.isArray(result.data)) {
          rolesData = result.data;
        } else if (result.roles && Array.isArray(result.roles)) {
          rolesData = result.roles;
        } else if (result.result && Array.isArray(result.result)) {
          rolesData = result.result;
        } else {
          console.error("Unexpected roles API response structure:", result);
          message.error("Unexpected roles data format from server");
          return;
        }
        
        const dataWithKeys = rolesData.map((item, index) => ({
          ...item,
          key: item.role_id || index.toString(),
        }));
        setRoles(dataWithKeys);
        console.log(`Roles loaded successfully (${dataWithKeys.length} items)`);
      } catch (error) {
        console.error("Error fetching roles:", error);
        message.error(`Failed to fetch roles: ${error.message}`);
        setRoles([]);
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
        console.log('Fetching modules from API...');
        const response = await fetch('http://202.53.92.35:5004/api/roles/ListModules', {
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
        console.log('Modules API Response:', result);
    
        // Handle different response structures
        let data = [];
        if (Array.isArray(result)) {
          data = result;
          console.log("Using direct array from API");
        } else if (result.data && Array.isArray(result.data)) {
          data = result.data;
        } else if (result.modules && Array.isArray(result.modules)) {
          data = result.modules;
        } else if (result.module_actions && Array.isArray(result.module_actions)) {
          data = result.module_actions;
        } else if (result.result && Array.isArray(result.result)) {
          data = result.result;
        } else if (result.items && Array.isArray(result.items)) {
          data = result.items;
        } else {
          console.error("Unexpected API response structure:", result);
          data = [];
        }
        
        setModules(data);
        console.log(`Modules loaded successfully (${data.length} items)`);
      } catch (error) {
        console.error("Error fetching modules:", error);
        message.error(`Failed to load modules: ${error.message}`);
        setModules([]);
      }
    };
    fetchModules();
  }, []);

  // Fetch role with permissions
  const fetchRoleWithPermissions = async (roleId) => {
    try {
      const response = await fetch('http://202.53.92.35:5004/api/roles/getRoleWithPermissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify({ role_id: roleId })
      });
      
      console.log('Role permissions API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Role permissions API Response:', result);
      
      if (result.success) {
        return result.data;
      } else if (result.role_id) {
        // Handle case where API returns role data directly without success flag
        console.log("API returned role data directly:", result);
        return result;
      } else {
        console.error("API returned success: false:", result);
        return null;
      }
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      return null;
    }
  };


  // Toggle role status
  const toggleRoleStatus = async (roleId) => {
    try {
      const response = await fetch('http://202.53.92.35:5004/api/roles/toggle-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify({ role_id: roleId })
      });
      
      console.log('Toggle status API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Toggle status API Response:', result);
      
      if (result.success || result.role_id) {
        message.success("Role status updated successfully!");
        // Refresh roles list
        await refreshRolesList();
      } else {
        message.error("Failed to update role status");
      }
    } catch (error) {
      console.error("Error toggling role status:", error);
      message.error(`Failed to update role status: ${error.message}`);
    }
  };

  // Table columns with sorting
  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 60,
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
      width: 100,
      sorter: (a, b) => safeStringCompare(a.role_code, b.role_code),
    },
    {
      title: "Name",
      dataIndex: "role_name",
      key: "role_name",
      width: 150,
      sorter: (a, b) => safeStringCompare(a.role_name, b.role_name),
    },
    // {
    //   title: "Status",
    //   dataIndex: "role_status",
    //   key: "role_status",
    //   width: 100,
    //   sorter: (a, b) => safeStringCompare(a.role_status, b.role_status),
    //   render: (status) => {
    //     const isActive = status === 'Active' || status === 1 || status === '1';
    //     return (
    //       <span 
    //         style={{ 
    //           color: isActive ? '#52c41a' : '#ff4d4f',
    //           fontWeight: '500',
    //           display: 'flex',
    //           alignItems: 'center',
    //           gap: '6px'
    //         }}
    //       >
    //         {isActive ? <FaCheck /> : <FaTimes />}
    //         {isActive ? 'Active' : 'Inactive'}
    //       </span>
    //     );
    //   },
    //   filters: [
    //     { text: 'Active', value: 'Active' },
    //     { text: 'Inactive', value: 'Inactive' },
    //   ],
    //   onFilter: (value, record) => {
    //     const isActive = record.role_status === 'Active' || record.role_status === 1 || record.role_status === '1';
    //     return value === 'Active' ? isActive : !isActive;
    //   },
    //   filteredValue: filteredInfo.role_status || null,
    // },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => {
        const isActive = record.role_status === 'Active' || record.role_status === 1 || record.role_status === '1';
        return (
          <Space>
            <Button 
              type="default" 
              size="small" 
              icon={<FaEdit />}
              onClick={() => showEditDrawer(record)}
              title="Edit Role"
            />
            <Button 
              type={isActive ? 'default' : 'primary'}
              size="small"
              icon={isActive ? <FaToggleOff /> : <FaToggleOn />}
              onClick={() => toggleRoleStatus(record.role_id)}
              title={isActive ? 'Deactivate Role' : 'Activate Role'}
            />
          </Space>
        );
      },
    },
  ];

  // Handle table change for pagination, filters, and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };


  // Update module function
  const updateModule = async (moduleId, moduleName, moduleCode) => {
    try {
      const response = await fetch('http://202.53.92.35:5004/api/roles/updateModule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          module_id: moduleId,
          module_name: moduleName,
          module_code: moduleCode
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        message.success("Module updated successfully");
        // Refresh modules list
        const refreshResponse = await fetch('http://202.53.92.35:5004/api/roles/getModuleActions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "x-access-token": sessionStorage.getItem("token"),
          }
        });
        
        const refreshResult = await refreshResponse.json();
        let data = [];
        if (Array.isArray(refreshResult)) {
          data = refreshResult;
        } else if (refreshResult.data && Array.isArray(refreshResult.data)) {
          data = refreshResult.data;
        } else if (refreshResult.modules && Array.isArray(refreshResult.modules)) {
          data = refreshResult.modules;
        } else if (refreshResult.module_actions && Array.isArray(refreshResult.module_actions)) {
          data = refreshResult.module_actions;
        }
        setModules(data);
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
    setSelectAllModules(false);
    // Set default status for new roles
    form.setFieldsValue({ status: 'Active' });
  };

  const showEditDrawer = async (role) => {
    setEditingRole(role);
    setOpen(true);
    
    // Set form values
    form.setFieldsValue({
      name: role.role_name,
      code: role.role_code,
      status: role.role_status || 'Active',
    });

    // Fetch and set permissions for this role
    const roleWithPermissions = await fetchRoleWithPermissions(role.role_id);
    if (roleWithPermissions) {
      const permissions = {};
      roleWithPermissions.permissions?.forEach(perm => {
        permissions[perm.module_id] = perm.action_ids || [];
      });
      setSelectedPermissions(permissions);
      
      // Check if all modules are selected
      const standardActions = [
        { action_id: 1, action_name: 'Add' },
        { action_id: 2, action_name: 'Edit' },
        { action_id: 3, action_name: 'View' },
        { action_id: 4, action_name: 'Delete' },
        { action_id: 5, action_name: 'Export' },
        { action_id: 6, action_name: 'List' }
      ];
      
      const allModulesSelected = modules.every(module => 
        permissions[module.module_id]?.length === standardActions.length
      );
      setSelectAllModules(allModulesSelected);
    } else {
      setSelectedPermissions({});
      setSelectAllModules(false);
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

  // Handle select all modules and actions
  const handleSelectAll = (checked) => {
    setSelectAllModules(checked);
    if (checked) {
      const allPermissions = {};
      if (modules && Array.isArray(modules)) {
        // Define standard actions with numeric IDs (same as in the render function)
        const standardActions = [
          { action_id: 1, action_name: 'Add' },
          { action_id: 2, action_name: 'Edit' },
          { action_id: 3, action_name: 'View' },
          { action_id: 4, action_name: 'Delete' },
          { action_id: 5, action_name: 'Export' },
          { action_id: 6, action_name: 'List' }
        ];
        
        modules.forEach(module => {
          allPermissions[module.module_id] = standardActions.map(action => action.action_id);
        });
      }
      setSelectedPermissions(allPermissions);
    } else {
      setSelectedPermissions({});
    }
  };

  // Handle module selection
  const handleModuleChange = (moduleId, checked) => {
    if (checked) {
      // Define standard actions with numeric IDs (same as in the render function)
      const standardActions = [
        { action_id: 1, action_name: 'Add' },
        { action_id: 2, action_name: 'Edit' },
        { action_id: 3, action_name: 'View' },
        { action_id: 4, action_name: 'Delete' },
        { action_id: 5, action_name: 'Export' },
        { action_id: 6, action_name: 'List' }
      ];
      
      setSelectedPermissions(prev => ({
        ...prev,
        [moduleId]: standardActions.map(action => action.action_id)
      }));
    } else {
      setSelectedPermissions(prev => ({
        ...prev,
        [moduleId]: []
      }));
    }
  };

  // Submit role
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRole) {
        // Check if name or code has changed
        const nameChanged = values.name !== editingRole.role_name;
        const codeChanged = values.code !== editingRole.role_code;
        
        // If name or code changed, check for duplicates
        if (nameChanged || codeChanged) {
          const duplicateName = roles.find(role => 
            role.role_id !== editingRole.role_id && 
            role.role_name === values.name
          );
          const duplicateCode = roles.find(role => 
            role.role_id !== editingRole.role_id && 
            role.role_code === values.code
          );
          
          if (duplicateName) {
            message.error("Role name already exists. Please choose a different name.");
            return;
          }
          if (duplicateCode) {
            message.error("Role code already exists. Please choose a different code.");
            return;
          }
        }
        
        // Update existing role - using update-permissions API
        const updatePayload = {
          role_id: editingRole.role_id,
          role_name: values.name,
          role_code: values.code,
          role_status: values.status || 'Active',
          permissions: Object.entries(selectedPermissions).map(([moduleId, actionIds]) => ({
            module_id: parseInt(moduleId, 10),
            action_ids: actionIds,
          })),
        };

        const response = await fetch('http://202.53.92.35:5004/api/roles/update-permissions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            "x-access-token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify(updatePayload)
        });

        const result = await response.json();
        console.log('Update permissions API Response:', result);

        if (result.success) {
          message.success("Role updated successfully!");
          setOpen(false);
          // Refresh roles list
          await refreshRolesList();
        } else {
          // Show specific error message from API
          const errorMessage = result.message || "Failed to update role.";
          message.error(errorMessage);
        }
      } else {
        // Create new role - check for duplicates first
        const duplicateName = roles.find(role => role.role_name === values.name);
        const duplicateCode = roles.find(role => role.role_code === values.code);
        
        if (duplicateName) {
          message.error("Role name already exists. Please choose a different name.");
          return;
        }
        if (duplicateCode) {
          message.error("Role code already exists. Please choose a different code.");
          return;
        }
        
        const payload = {
          role_name: values.name,
          role_code: values.code,
          role_status: values.status || 'Active',
          permissions: Object.entries(selectedPermissions).map(([moduleId, actionIds]) => ({
            module_id: parseInt(moduleId, 10),
            action_ids: actionIds,
          })),
        };

        const response = await fetch('http://202.53.92.35:5004/api/roles/insertRolePermissions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "x-access-token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        console.log('Create role API Response:', result);

        if (result.success) {
          message.success("Role added successfully!");
          setOpen(false);
          // Refresh roles list
          await refreshRolesList();
        } else {
          // Show specific error message from API
          const errorMessage = result.message || "Failed to add role.";
          message.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error saving role:", error);
      message.error(`Error while ${editingRole ? 'updating' : 'adding'} role.`);
    }
  };

  // Helper function to refresh roles list
  const refreshRolesList = async () => {
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
      
      const result = await response.json();
      let rolesData = [];
      if (Array.isArray(result)) {
        rolesData = result;
      } else if (result.data && Array.isArray(result.data)) {
        rolesData = result.data;
      } else if (result.roles && Array.isArray(result.roles)) {
        rolesData = result.roles;
      }
      
      const dataWithKeys = rolesData.map((item, index) => ({
        ...item,
        key: item.role_id || index.toString(),
      }));
      setRoles(dataWithKeys);
    } catch (error) {
      console.error("Error refreshing roles list:", error);
    }
  };

  return (
    
      <div className="container-fluid p-1">
        <h2 className="mb-1">Roles</h2>
        <p className="mt-0">
          Manage Roles by adding, editing roles, and tracking activity.
        </p>
      

      {/* Action buttons */}
      <div className="actions-bar d-flex justify-content-end align-items-center mb-2">
        <div className="d-flex gap-2">
          <ExportButton
            data={roles}
            columns={columns}
            filename="Roles_Management_Report"
            title="Roles Management Report"
            reportType="roles-management"
            filters={{}}
            sorter={{}}
            message={message}
            includeAllFields={true}
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
      
        <Table
          columns={columns}
          dataSource={roles}
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
          scroll={{ x: 800 }}
        />
      

      {/* Drawer */}
      <Drawer
        title={editingRole ? "Update Role" : "Add Role Details"}
        width={800}
        onClose={onClose}
        open={open}
        styles={{ body: { paddingBottom: 80 } }}
      >
        <Form form={form} layout="vertical" hideRequiredMark>
          {/* Role Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h5 style={{ marginBottom: '16px', color: '#333', fontWeight: '600' }}>Role Information</h5>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="code"
                  label={<span style={{ color: '#333' }}>* Code</span>}
                  rules={[{ required: true, message: "Please enter role code" }]}
                >
                  <Input placeholder="Enter your code" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="name"
                  label={<span style={{ color: '#333' }}>* Name</span>}
                  rules={[{ required: true, message: "Please enter role name" }]}
                >
                  <Input placeholder="Enter name" />
                </Form.Item>
              </Col>
              {/* <Col span={8}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select status">
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col> */}
            </Row>
          </div>

          {/* Global Select All */}
          <div style={{ marginBottom: '24px' }}>
            <Checkbox
              checked={selectAllModules}
              onChange={(e) => handleSelectAll(e.target.checked)}
              style={{ fontSize: '16px', fontWeight: '500' }}
            >
              Select All Modules & Actions
            </Checkbox>
          </div>

          {/* Modules and Actions Sections */}
          {modules && Array.isArray(modules) && modules.map((module) => {
            // Define standard actions for each module
            const standardActions = [
              { action_id: 1, action_name: 'Add' },
              { action_id: 2, action_name: 'Edit' },
              { action_id: 3, action_name: 'View' },
              // { action_id: 4, action_name: 'Delete' },
              { action_id: 5, action_name: 'Export' },
              { action_id: 6, action_name: 'List' }
            ];
            
            const isModuleFullySelected = selectedPermissions[module.module_id]?.length === standardActions.length;
            const isModulePartiallySelected = selectedPermissions[module.module_id]?.length > 0 && !isModuleFullySelected;
            
            return (
              <div key={module.module_id} style={{ 
                marginBottom: '16px', 
                padding: '16px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <Checkbox
                    checked={isModuleFullySelected}
                    indeterminate={isModulePartiallySelected}
                    onChange={(e) => handleModuleChange(module.module_id, e.target.checked)}
                    style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}
                  >
                    {module.module_name}
                  </Checkbox>
                </div>
                <Row gutter={[8, 8]}>
                  {standardActions.map((action) => (
                    <Col span={4} key={action.action_id}>
                      <Checkbox
                        checked={selectedPermissions[module.module_id]?.includes(action.action_id)}
                        onChange={(e) =>
                          handlePermissionChange(module.module_id, action.action_id, e.target.checked)
                        }
                        style={{ fontSize: '14px' }}
                      >
                        {action.action_name}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </div>
            );
          })}
          {/* Footer buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button size="small" onClick={onClose}>Close</Button>
              <Button size="small" type="primary" onClick={onSubmit}>
                {editingRole ? "Update" : "Submit"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Roles;
