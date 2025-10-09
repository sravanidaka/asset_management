import React, { useState,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

import { Drawer, Form, Input, InputNumber, Select, Button, Space, Table, message, Modal } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "../App.css";
import CustomBreadcrumb from './common/Breadcrumb';
import BackNavigation from './common/BackNavigation';

export default function ManageStatus({ onNavigate }) {
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

  // 🔹 Fetch statuses from API
  const fetchStatuses = async () => {
    setLoading(true);
    try {
      console.log('Fetching statuses from API...');
      const response = await fetch("http://202.53.92.35:5004/api/settings/getSettingStatusList", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statuses: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result); // Debug log
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.statuses && Array.isArray(result.statuses)) {
        data = result.statuses;
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
      
      // Add key property for each item (required by Ant Design Table)
      const dataWithKeys = data.map((item, index) => ({
        ...item,
        key: item.id || item._id || index.toString(),
      }));
      setDataSource(dataWithKeys);
      message.success(`Statuses loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching statuses:", error);
      message.error("Failed to load statuses");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch data on component mount
  useEffect(() => {
    fetchStatuses();
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
      'status_name', 'status_type', 'is_default'
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
      status_name: { 
        title: "Status Name", 
        sorter: (a, b) => (a.status_name || "").localeCompare(b.status_name || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.status_name?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search status name"
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
        filteredValue: filteredInfo.status_name || null,
      },
      status_type: { 
        title: "Status Type", 
        sorter: (a, b) => (a.status_type || "").localeCompare(b.status_type || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.status_type?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search status type"
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
        filteredValue: filteredInfo.status_type || null,
      },
      is_default: { 
        title: "Is Default", 
        sorter: (a, b) => (a.is_default || "").localeCompare(b.is_default || ""),
        render: (text) => text === 1 || text === '1' || text === true ? 'Yes' : 'No',
        onFilter: (value, record) => {
          const displayValue = record.is_default === 1 || record.is_default === '1' || record.is_default === true ? 'Yes' : 'No';
          return displayValue.toLowerCase().includes(value.toLowerCase());
        },
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search default status"
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
        filteredValue: filteredInfo.is_default || null,
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
      status_name: cleanValue(record.status_name),
      status_type: cleanValue(record.status_type),
      color_tag: cleanValue(record.color_tag),
      description: cleanValue(record.description),
      is_default: cleanValue(record.is_default),
      affects_availability: cleanValue(record.affects_availability),
      include_in_utilization: cleanValue(record.include_in_utilization),
    });
    
    setEditingIndex(record.id || record._id);
    setEditingRecord(record); // Store the original record for updates
    setDrawerVisible(true);
  };

  // 🔹 Handle delete
  const handleDelete = (record) => {
    console.log("Delete record:", record);
    console.log("Record ID:", record.id || record.key);
    
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this status?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deleteSettingStatus", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: deleteId }),
          });
          
          console.log("Delete response status:", response.status);
          console.log("Delete response ok:", response.ok);
          
          if (response.ok) {
            const result = await response.json();
            console.log("Delete response data:", result);
            message.success("Status deleted successfully!");
            await fetchStatuses();
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete status: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting status:", error);
          message.error(`Failed to delete status: ${error.message}`);
        }
      },
    });
  };

  // 🔹 Save Status
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingIndex !== null;
      
      // Client-side validation for required fields
      const requiredFields = ['status_name', 'status_type', 'color_tag', 'description'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      // Check for numeric fields that might be 0 (which is falsy but valid)
      if (values.is_default === undefined || values.is_default === null || values.is_default === '') {
        missingFields.push('is_default');
      }
      if (values.affects_availability === undefined || values.affects_availability === null || values.affects_availability === '') {
        missingFields.push('affects_availability');
      }
      if (values.include_in_utilization === undefined || values.include_in_utilization === null || values.include_in_utilization === '') {
        missingFields.push('include_in_utilization');
      }
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        return;
      }

      // Call API directly
      const mainUrl = isEditing 
        ? "http://202.53.92.35:5004/api/settings/updateSettingStatus"
        : "http://202.53.92.35:5004/api/settings/createSettingStatus";
      
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
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} status: ${errorData.message || errorText}`);
      }

      const result = await response.json();
      message.success(`Status ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchStatuses();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} status:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} status: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
      
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <h2 className="mb-1">Asset Statuses</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All</button>
          <button className="btn btn-success px-4">Lifecycle</button>
          <button
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Status
          </button>
        </div>
      </div>

      {/* 🔹 Statuses Table */}
      <div className="card custom-shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fs-4 mb-0">Statuses</h5>
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

      {/* 🔹 Drawer with Create/Edit Form */}
      <Drawer
        title={editingIndex !== null ? "Edit Status" : "Add Status"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Status Name"
                name="status_name"
            rules={[{ required: true, message: "Please enter status name" }]}
          >
            <Input placeholder="e.g., Available" />
          </Form.Item>

          <Form.Item
            label="Status Type"
                name="status_type"
            rules={[{ required: true, message: "Please enter status type" }]}
          >
            <Input placeholder="e.g., Operational" />
          </Form.Item>

          <Form.Item
            label="Color Tag"
                name="color_tag"
            rules={[{ required: true, message: "Please enter color tag" }]}
          >
            <Input placeholder="e.g., #28a745" />
          </Form.Item>

          <Form.Item
            label="Description"
                name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={3} placeholder="Short description..." />
          </Form.Item>

          <Form.Item
            label="Is Default"
                name="is_default"
            rules={[{ required: true, message: "Please select default status" }]}
          >
            <Select placeholder="Select option">
              <Select.Option value={1}>Yes</Select.Option>
              <Select.Option value={0}>No</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Affects Availability"
                name="affects_availability"
            rules={[{ required: true, message: "Please select option" }]}
          >
            <Select placeholder="Select option">
              <Select.Option value={1}>Yes</Select.Option>
              <Select.Option value={0}>No</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Include in Utilization"
                name="include_in_utilization"
            rules={[{ required: true, message: "Please select option" }]}
          >
            <Select placeholder="Select option">
              <Select.Option value={1}>Yes</Select.Option>
              <Select.Option value={0}>No</Select.Option>
            </Select>
          </Form.Item>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={() => form.resetFields()} disabled={loading}>Reset</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingIndex !== null ? 'Update Status' : 'Add Status'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}