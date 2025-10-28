import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import { FaSearch, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaCheck, FaTimes } from "react-icons/fa";
import { Button, Col, Drawer, Form, Input, Row, Space, message, Table, Popconfirm, Select, Checkbox } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { api } from '../../config/api';
import ExportButton from '../../components/ExportButton';
import { safeStringCompare } from '../../utils/tableUtils';
import CustomBreadcrumb from '../../components/Breadcrumb';

const { Option } = Select;

const Module = () => {
  const [open, setOpen] = useState(false);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [form] = Form.useForm();
  const [editingModule, setEditingModule] = useState(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  
  // Actions management state
  const [selectedActions, setSelectedActions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState({});
  const [selectAllModules, setSelectAllModules] = useState(false);
  
  // Available actions based on the image
  const availableActions = [
    { name: 'All', code: 'ALL' },
    { name: 'Add', code: 'ADD' },
    { name: 'Edit', code: 'EDIT' },
    { name: 'View', code: 'VIEW' },
    { name: 'Export', code: 'EXPORT' },
    { name: 'Delete', code: 'DELETE' },
    { name: 'Approve', code: 'APPROVE' },
    { name: 'Reject', code: 'REJECT' }
  ];

  // Fetch modules list
  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://202.53.92.35:5004/api/roles/ListModules', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-access-token": sessionStorage.getItem("token"),
        }
      });
      
      console.log('Modules API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Modules API Response:', result);
      
      let modulesData = [];
      if (Array.isArray(result)) {
        modulesData = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        modulesData = result.data;
        console.log("Using result.data");
      } else if (result.modules && Array.isArray(result.modules)) {
        modulesData = result.modules;
        console.log("Using result.modules");
      } else if (result.result && Array.isArray(result.result)) {
        modulesData = result.result;
        console.log("Using result.result");
      } else {
        console.error("Unexpected modules API response structure:", result);
        message.error("Unexpected modules data format from server");
        setModules([]);
        return;
      }
      
      console.log('Raw modules data:', modulesData);
      if (modulesData.length > 0) {
        console.log('First module object:', modulesData[0]);
        console.log('First module keys:', Object.keys(modulesData[0] || {}));
      }
      
      // Handle empty API response
      if (modulesData.length === 0) {
        setModules([]);
        message.info("No modules found");
        return;
      }
      
      // Transform data to match table column expectations
      const dataWithKeys = modulesData.map((item, index) => {
        console.log('Processing module item:', item);
        console.log('Available fields:', Object.keys(item));
        
        const transformedItem = {
          key: item.module_id || item.id || index.toString(),
          module_id: item.module_id || item.id,
          module_code: item.module_code || item.code || item.moduleCode,
          module_name: item.module_name || item.name || item.moduleName,
          module_status: item.module_status || item.status || item.is_active || item.active,
          // Keep original data for reference
          ...item
        };
        
        console.log('Transformed module item:', transformedItem);
        return transformedItem;
      });
      
      console.log('Final processed modules data:', dataWithKeys);
      setModules(dataWithKeys);
    } catch (error) {
      console.error("Error fetching modules:", error);
      console.error("Error details:", error.message);
      message.error(`Failed to fetch modules: ${error.message}`);
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Toggle module status
  const toggleModuleStatus = async (moduleId) => {
    try {
      const response = await fetch('http://202.53.92.35:5004/api/roles/toggleModuleStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify({ module_id: moduleId })
      });
      
      console.log('Toggle module status API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Toggle module status API Response:', result);
      
      if (result.success || result.module_id) {
        message.success("Module status updated successfully!");
        // Refresh modules list
        await fetchModules();
      } else {
        message.error("Failed to update module status");
      }
    } catch (error) {
      console.error("Error toggling module status:", error);
      message.error(`Failed to update module status: ${error.message}`);
    }
  };

  // Delete module
  const deleteModule = async (moduleId) => {
    try {
      const response = await fetch('http://202.53.92.35:5004/api/roles/deleteModule', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify({ module_id: moduleId })
      });
      
      console.log('Delete module API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Delete module API Response:', result);
      
      if (result.success || result.deleted) {
        message.success("Module deleted successfully!");
        // Refresh modules list
        await fetchModules();
      } else {
        message.error("Failed to delete module");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      message.error(`Failed to delete module: ${error.message}`);
    }
  };

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
            icon={<FaSearch />}
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
      <FaSearch style={{ color: filtered ? '#1890ff' : undefined }} />
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
    {
      title: "Module Code",
      dataIndex: "module_code",
      key: "module_code",
      sorter: (a, b) => safeStringCompare(a.module_code, b.module_code),
      ...getColumnSearchProps('module_code'),
    },
    {
      title: "Module Name",
      dataIndex: "module_name",
      key: "module_name",
      sorter: (a, b) => safeStringCompare(a.module_name, b.module_name),
      ...getColumnSearchProps('module_name'),
    },
    {
      title: "Status",
      dataIndex: "module_status",
      key: "module_status",
      sorter: (a, b) => safeStringCompare(a.module_status, b.module_status),
      render: (status) => {
        const isActive = status === 'Active' || status === 1 || status === '1' || status === true;
        return (
          <span 
            style={{ 
              color: isActive ? '#52c41a' : '#ff4d4f',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isActive ? <FaCheck /> : <FaTimes />}
            {isActive ? 'Active' : 'Inactive'}
          </span>
        );
      },
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (value, record) => {
        const isActive = record.module_status === 'Active' || record.module_status === 1 || record.module_status === '1' || record.module_status === true;
        return value === 'Active' ? isActive : !isActive;
      },
      filteredValue: filteredInfo.module_status || null,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => {
        const isActive = record.module_status === 'Active' || record.module_status === 1 || record.module_status === '1' || record.module_status === true;
        return (
          <Space>
            <Button 
              type="default" 
              size="small" 
              icon={<FaEdit />}
              onClick={() => showEditDrawer(record)}
              title="Edit Module"
            />
            <Button 
              type={isActive ? 'default' : 'primary'}
              size="small"
              icon={isActive ? <FaToggleOff /> : <FaToggleOn />}
              onClick={() => toggleModuleStatus(record.module_id)}
              title={isActive ? 'Deactivate Module' : 'Activate Module'}
            />
            <Popconfirm
              title="Are you sure to delete this module?"
              onConfirm={() => deleteModule(record.module_id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="primary" 
                danger 
                size="small" 
                icon={<FaTrash />}
                title="Delete Module"
              />
            </Popconfirm>
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

  // Action management functions
  const handleActionChange = (actionName, checked) => {
    if (actionName === 'All') {
      if (checked) {
        setSelectedActions(availableActions.map(action => action.name));
        setSelectAll(true);
      } else {
        setSelectedActions([]);
        setSelectAll(false);
      }
    } else {
      let newSelectedActions;
      if (checked) {
        newSelectedActions = [...selectedActions, actionName];
      } else {
        newSelectedActions = selectedActions.filter(action => action !== actionName);
      }
      setSelectedActions(newSelectedActions);
      setSelectAll(newSelectedActions.length === availableActions.length - 1); // -1 because 'All' is not counted
    }
  };

  // Permission management functions
  const handleSelectAll = (checked) => {
    if (checked) {
      const allPermissions = {};
      modules.forEach(module => {
        allPermissions[module.module_id] = availableActions.map(action => action.name);
      });
      setSelectedPermissions(allPermissions);
      setSelectAllModules(true);
    } else {
      setSelectedPermissions({});
      setSelectAllModules(false);
    }
  };

  const handleModuleChange = (moduleId, checked) => {
    if (checked) {
      setSelectedPermissions(prev => ({
        ...prev,
        [moduleId]: availableActions.map(action => action.name)
      }));
    } else {
      setSelectedPermissions(prev => {
        const newPermissions = { ...prev };
        delete newPermissions[moduleId];
        return newPermissions;
      });
    }
  };

  const handlePermissionChange = (moduleId, actionName, checked) => {
    setSelectedPermissions(prev => {
      const currentPermissions = prev[moduleId] || [];
      let newPermissions;
      
      if (checked) {
        newPermissions = [...currentPermissions, actionName];
      } else {
        newPermissions = currentPermissions.filter(action => action !== actionName);
      }
      
      return {
        ...prev,
        [moduleId]: newPermissions
      };
    });
  };


  // Drawer handlers
  const showDrawer = () => {
    setEditingModule(null);
    setOpen(true);
    form.resetFields();
    setSelectedActions([]);
    setSelectAll(false);
    setSelectedPermissions({});
    setSelectAllModules(false);
    // Set default status for new modules
    form.setFieldsValue({ status: 'Active' });
  };

  const showEditDrawer = (module) => {
    setEditingModule(module);
    setOpen(true);
    
    // Set form values
    form.setFieldsValue({
      code: module.module_code,
      name: module.module_name,
      status: module.module_status || 'Active',
    });
    
    // Reset actions for edit
    setSelectedActions([]);
    setSelectAll(false);
    setSelectedPermissions({});
    setSelectAllModules(false);
  };

  const onClose = () => {
    setOpen(false);
    setEditingModule(null);
  };

  // Submit module
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Prepare actions array from selected permissions
      const actionsArray = [];
      
      // Collect all selected actions from all modules
      Object.values(selectedPermissions).forEach(moduleActions => {
        moduleActions.forEach(actionName => {
          if (actionName !== 'All') {
            const action = availableActions.find(a => a.name === actionName);
            if (action && !actionsArray.find(a => a.action_name === action.name)) {
              actionsArray.push({
                action_name: action.name,
                action_code: action.code,
                action_status: 1
              });
            }
          }
        });
      });
      
      if (editingModule) {
        // Update existing module - using the new API structure
        const updateData = {
          module_id: editingModule.module_id,
          module_name: values.name,
          module_code: values.code,
          module_status: values.status === 'Active' ? 1 : 0
        };
        
        console.log('Update module data being sent:', updateData);
        
        const response = await fetch('http://202.53.92.35:5004/api/roles/updateModules', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            "x-access-token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify(updateData)
        });
        
        const result = await response.json();
        console.log('Update module response:', result);
        
        if (result.success || result.module_id) {
          message.success("Module updated successfully");
        } else {
          throw new Error(result.message || "Failed to update module");
        }
      } else {
        // Create new module using the new API structure
        const createData = {
          module: {
            module_name: values.name,
            module_code: values.code,
            module_status: values.status === 'Active' ? 1 : 0,
          },
          actions: actionsArray
        };
        
        console.log('Create module data being sent:', createData);
        console.log('Expected payload structure:', {
          module: {
            module_name: "Test Module",
            module_code: "TEST_MODULE",
            module_status: 1
          },
          actions: [
            {
              action_name: "Test Action",
              action_code: "TEST_ACTION",
              action_status: 1
            }
          ]
        });
        
        const response = await fetch('http://202.53.92.35:5004/api/roles/InsertModules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "x-access-token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify(createData)
        });
        
        const result = await response.json();
        console.log('Create module response:', result);
        
        if (result.success || result.module_id) {
          message.success("Module added successfully");
        } else {
          throw new Error(result.message || "Failed to create module");
        }
      }
      fetchModules();
      onClose();
    } catch (error) {
      console.error("Error saving module:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save module";
      message.error(errorMessage);
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
          <h2 className="mb-1">Modules</h2>
          <p className="mt-0">Manage system modules and their configurations.</p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <ExportButton
            data={modules}
            columns={columns}
            filename="Module_Management_Report"
            title="Module Management Report"
            reportType="module-management"
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
            Add New Module
          </Button>
        </div>
      </div>

     
        <Table
          columns={columns}
          dataSource={modules}
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
        title={editingModule ? "Update Module Details" : "Add Module Details"}
        width={600}
        onClose={onClose}
        open={open}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
            >
              {editingModule ? "Update" : "Submit"}
            </Button>
          </Space>
        }
      >
        <Form
          layout="vertical"
          hideRequiredMark
          form={form}
          onFinish={onSubmit}
        >
          {/* Module Information Section */}
          <div style={{ marginBottom: '24px' }}>
            <h5 style={{ marginBottom: '16px', color: '#333', fontWeight: '600' }}>Module Information</h5>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="code"
                  label={<span style={{ color: '#333' }}>* Code</span>}
                  rules={[
                    { required: true, message: "Please enter module code" },
                    {
                      pattern: /^[A-Za-z0-9_]+$/,
                      message: "Module code must contain only letters, numbers, and underscores",
                    },
                  ]}
                >
                  <Input placeholder="Enter your code" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label={<span style={{ color: '#333' }}>* Name</span>}
                  rules={[
                    { required: true, message: "Please enter module name" },
                  ]}
                >
                  <Input placeholder="Enter name" />
                </Form.Item>
              </Col>
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
          {modules.map((module) => {
            const isModuleFullySelected = selectedPermissions[module.module_id]?.length === availableActions.length;
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
                  {availableActions.map((action) => (
                    <Col span={4} key={action.name}>
                      <Checkbox
                        checked={selectedPermissions[module.module_id]?.includes(action.name)}
                        onChange={(e) =>
                          handlePermissionChange(module.module_id, action.name, e.target.checked)
                        }
                        style={{ fontSize: '14px' }}
                      >
                        {action.name}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </div>
            );
          })}

          {/* Status Section */}
          <div style={{ marginBottom: '24px' }}>
            <h5 style={{ marginBottom: '16px', color: '#333', fontWeight: '600' }}>Status</h5>
            <Form.Item
              name="status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status" style={{ width: '200px' }}>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default Module;