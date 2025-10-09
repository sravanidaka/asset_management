import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Drawer, Modal, Form, Input, InputNumber, Select, Button, Space, Table, message } from "antd";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "../App.css";
import CustomBreadcrumb from './common/Breadcrumb';
import BackNavigation from './common/BackNavigation';

export default function ApprovalHierarchies({ onNavigate }) {
  // 🔹 Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  // 🔹 Fetch hierarchies from API
  const fetchHierarchies = async () => {
    setLoading(true);
    try {
      console.log('Fetching hierarchies from API...');
      const response = await fetch("http://202.53.92.35:5004/api/settings/getApprovalHierarchiesList", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch hierarchies: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result); // Debug log
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.hierarchies && Array.isArray(result.hierarchies)) {
        data = result.hierarchies;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      } else {
        console.log("Unexpected API response structure:", result);
        console.log("Available keys:", Object.keys(result));
        data = [];
      }
      
      console.log("Processed data:", data); // Debug log
      console.log("Data length:", data.length); // Debug log
      
      // Add key property for each item (required by Ant Design Table)
      const dataWithKeys = data.map((item, index) => ({
        ...item,
        key: item.id || item._id || index.toString(),
      }));
      console.log("Data with keys:", dataWithKeys); // Debug log
      setDataSource(dataWithKeys);
      message.success(`Hierarchies loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching hierarchies:", error);
      message.error("Failed to load hierarchies");
      
      // Fallback: Set empty data to show "No data" state
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch data on component mount
  useEffect(() => {
    fetchHierarchies();
  }, []);

  // 🔹 Handle table change for filters and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // 🔹 Dynamic table columns based on available data
  const getDynamicColumns = () => {
    if (dataSource.length === 0) return [];
    
    // Define only the fields that should be shown
    const allPossibleFields = [
      'hierarchy_name', 'code', 'status', 'applicable_modules'
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
      hierarchy_name: { 
        title: "Hierarchy Name", 
        sorter: (a, b) => (a.hierarchy_name || "").localeCompare(b.hierarchy_name || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.hierarchy_name?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search hierarchy name"
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
        filteredValue: filteredInfo.hierarchy_name || null,
      },
      code: { 
        title: "Code", 
        sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.code?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search code"
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
        filteredValue: filteredInfo.code || null,
      },
      status: { 
        title: "Status", 
        sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
        render: (text) => text ? <span style={{ color: text === 'Active' ? '#28a745' : '#dc3545' }}>{text}</span> : '-',
        onFilter: (value, record) => record.status?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search status"
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
        filteredValue: filteredInfo.status || null,
      },
      applicable_modules: { 
        title: "Applicable Modules", 
        sorter: (a, b) => (a.applicable_modules || "").localeCompare(b.applicable_modules || ""),
        render: (text) => text && text !== 'N/A' ? (text.length > 30 ? `${text.substring(0, 30)}...` : text) : '-',
        onFilter: (value, record) => record.applicable_modules?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search modules"
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
        filteredValue: filteredInfo.applicable_modules || null,
      }
    };
    
    // Create columns for all possible fields first, then add any additional fields
    const columns = [];
    
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
          <Button type="primary" danger size="small" icon={<FaTrash />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    });
    
    return columns;
  };

  const columns = getDynamicColumns();


  // 🔹 Track editing index and record
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  // 🔹 Open drawer for create
  const handleCreate = () => {
    form.resetFields();
    setEditingIndex(null);
    setEditingRecord(null);
    setDrawerVisible(true);
  };

  // 🔹 Open drawer for edit
  const handleEdit = (record) => {
    console.log("Edit record:", record); // Debug log
    
    // Helper function to clean values (remove N/A, null, undefined)
    const cleanValue = (value) => {
      if (value === 'N/A' || value === null || value === undefined || value === '') {
        return undefined; // Return undefined so form field shows as empty
      }
      return value;
    };
    
    // Set form values with cleaned data
    form.setFieldsValue({
      hierarchy_name: cleanValue(record.hierarchy_name),
      code: cleanValue(record.code),
      status: cleanValue(record.status),
      applicable_modules: cleanValue(record.applicable_modules),
      department_location: cleanValue(record.department_location),
      threshold_amount: cleanValue(record.threshold_amount),
      escalation_days: cleanValue(record.escalation_days),
      auto_assign_approvers: cleanValue(record.auto_assign_approvers),
      skip_on_leave: cleanValue(record.skip_on_leave),
      description: cleanValue(record.description),
      notes: cleanValue(record.notes),
    });
    
    setEditingIndex(record.id || record._id);
    setEditingRecord(record); // Store the original record for updates
    setDrawerVisible(true);
  };

  // 🔹 Save Hierarchy
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingIndex !== null;
      
      // Client-side validation for required fields
      const requiredFields = ['hierarchy_name', 'code', 'status', 'applicable_modules', 'department_location', 'threshold_amount', 'escalation_days', 'auto_assign_approvers', 'skip_on_leave', 'description'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        return;
      }

      // Call API directly
      const mainUrl = isEditing 
        ? "http://202.53.92.35:5004/api/settings/updateApprovalHierarchy"
        : "http://202.53.92.35:5004/api/settings/createApprovalHierarchy";
      
      const method = isEditing ? "PUT" : "POST";
      
      // Prepare API data with proper ID for updates
      const apiData = isEditing 
        ? { id: editingRecord?.id || editingIndex, ...values }
        : values;

      const response = await fetch(mainUrl, {
            method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      });

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
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} hierarchy: ${errorData.message || errorText}`);
      }

      const result = await response.json();
      message.success(`Hierarchy ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchHierarchies();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} hierarchy:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} hierarchy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete hierarchy
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this hierarchy?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deleteApprovalHierarchy", {
            method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: deleteId }),
              });
          
          if (response.ok) {
            message.success("Hierarchy deleted successfully!");
            await fetchHierarchies();
          } else {
            throw new Error("Failed to delete hierarchy");
          }
        } catch (error) {
          console.error("Error deleting hierarchy:", error);
          message.error("Failed to delete hierarchy");
        }
      },
    });
  };

  return (
    <div className="container-fluid p-1">
      {/* Top Navigation Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Back Navigation */}
        <BackNavigation />
        
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
         
          <h2 className="mb-1">Approval Hierarchies</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Hierarchies</button>
          <button className="btn btn-success px-4">All Modules</button>
          <button className="btn btn-success px-4" onClick={handleCreate}>
            <PlusOutlined /> Create Hierarchy
          </button>
        </div>
      </div>

      {/* 🔹 Table */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fs-4 mb-0">Hierarchies</h5>
          </div>
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
        </div>
      </div>

      {/* 🔹 Drawer Form */}
      <Drawer
        title={editingIndex !== null ? "Edit Approval Hierarchy" : "Add Approval Hierarchy"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Hierarchy Name"
            name="hierarchy_name"
            rules={[{ required: true, message: "Please enter hierarchy name" }]}
          >
            <Input placeholder="e.g., IT Service Request Flow" />
          </Form.Item>

          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: "Please enter code" }]}
          >
            <Input placeholder="e.g., AH002" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select Status">
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Archived">Archived</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Applicable Modules"
            name="applicable_modules"
            rules={[{ required: true, message: "Please enter applicable modules" }]}
          >
            <Input placeholder="e.g., Service Desk, IT Operations" />
          </Form.Item>

          <Form.Item
            label="Department/Location"
            name="department_location"
            rules={[{ required: true, message: "Please enter department/location" }]}
          >
            <Input placeholder="e.g., IT - Hyderabad" />
          </Form.Item>

          <Form.Item
            label="Threshold Amount"
            name="threshold_amount"
            rules={[{ required: true, message: "Please enter threshold amount" }]}
          >
            <Input placeholder="e.g., 10000.00" />
          </Form.Item>

          <Form.Item
            label="Escalation Days"
            name="escalation_days"
            rules={[{ required: true, message: "Please enter escalation days" }]}
          >
            <InputNumber min={1} className="w-100" placeholder="2" />
          </Form.Item>

          <Form.Item
            label="Auto-Assign Approvers"
            name="auto_assign_approvers"
            rules={[{ required: true, message: "Please select option" }]}
          >
            <Select placeholder="Select Option">
              <Select.Option value="Yes">Yes</Select.Option>
              <Select.Option value="No">No</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Skip on Leave"
            name="skip_on_leave"
            rules={[{ required: true, message: "Please select option" }]}
          >
            <Select placeholder="Select Option">
              <Select.Option value="Yes">Yes</Select.Option>
              <Select.Option value="No">No</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={3} placeholder="Workflow description..." />
          </Form.Item>

          <Form.Item
            label="Notes"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Optional notes..." />
          </Form.Item>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={() => form.resetFields()} disabled={loading}>Reset</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingIndex !== null ? 'Update Hierarchy' : 'Add Hierarchy'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}