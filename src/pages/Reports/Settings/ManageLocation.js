import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { Drawer, Form, Input, InputNumber, Select, Button, Space, Table, message, Modal } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "../../../App.css";
import CustomBreadcrumb from '../../../components/Breadcrumb';
import BackNavigation from '../../../components/BackNavigation';
import { getLocationTypes, getStatusNames } from '../../../services/settingsService';


export default function ManageLocation({ onNavigate }) {
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
  const [locationTypes, setLocationTypes] = useState([]);
  const [statusNames, setStatusNames] = useState([]);

  // 🔹 Fetch locations from API
  const fetchLocations = async () => {
    setLoading(true);
    try {
      console.log('Fetching locations from API...');
      const response = await fetch("http://202.53.92.35:5004/api/settings/getSettingLocationsList", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
           "x-access-token":  sessionStorage.getItem("token"),
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result); // Debug log
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.locations && Array.isArray(result.locations)) {
        data = result.locations;
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
      message.success(`Locations loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching locations:", error);
      message.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [locationTypesData, statusNamesData] = await Promise.all([
        getLocationTypes(),
        getStatusNames()
      ]);
      
      setLocationTypes(locationTypesData);
      setStatusNames(statusNamesData);
      
      console.log("Dropdown data loaded:", {
        locationTypes: locationTypesData.length,
        statusNames: statusNamesData.length
      });
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  // 🔹 Fetch data on component mount
  useEffect(() => {
    fetchLocations();
    fetchDropdownData();
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
      'name', 'code', 'type', 'active_status'
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
      name: { 
        title: "Name", 
        sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.name?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search name"
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
        filteredValue: filteredInfo.name || null,
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
      type: { 
        title: "Location Type", 
        sorter: (a, b) => (a.type || "").localeCompare(b.type || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.type?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search location type"
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
        filteredValue: filteredInfo.type || null,
      },
      active_status: { 
        title: "Location Status", 
        sorter: (a, b) => (a.active_status || "").localeCompare(b.active_status || ""),
        render: (text) => text ? <span style={{ color: text === 'Active' ? '#28a745' : '#dc3545' }}>{text}</span> : '-',
        onFilter: (value, record) => record.active_status?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search Loaction status"
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
        filteredValue: filteredInfo.active_status || null,
      }
    };
    
    // Create columns for all possible fields first, then add any additional fields
    const columns = [];
    
    // Add Serial Number column
    columns.push({
      title: "S.No",
      key: "serial",
      width: 80,
      render: (text, record, index) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    });
    
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
          {/* <Button type="primary" danger size="small" icon={<FaTrash />} onClick={() => handleDelete(record)} /> */}
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
      type: cleanValue(record.type),
      name: cleanValue(record.name),
      code: cleanValue(record.code),
      parent_id: cleanValue(record.parent_id),
      region_id: cleanValue(record.region_id),
      active_status: cleanValue(record.active_status),
      address: cleanValue(record.address),
      notes: cleanValue(record.notes),
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
      content: "Are you sure you want to delete this location?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deleteSettingLocation", {
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
            message.success("Location deleted successfully!");
            await fetchLocations();
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete location: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting location:", error);
          message.error(`Failed to delete location: ${error.message}`);
        }
      },
    });
  };

  // 🔹 Save Location
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingIndex !== null;
      
      // Call API directly - use the same pattern as ManageVendor.js
      const mainUrl = isEditing 
        ? "http://202.53.92.35:5004/api/settings/updateSettingLocation"
        : "http://202.53.92.35:5004/api/settings/createSettingLocation";
      
      const method = isEditing ? "PUT" : "POST";
      
      // Prepare API data with proper ID for updates
      const apiData = isEditing 
        ? { id: editingRecord?.id || editingIndex, ...values }
        : values;

      const response = await fetch(mainUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": sessionStorage.getItem("token"),
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
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} location: ${errorData.message || errorText}`);
      }

      const result = await response.json();
      message.success(`Location ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchLocations();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} location:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} location: ${error.message}`);
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
          
          <h2 className="mb-1">Manage Locations</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Regions</button>
          <button className="btn btn-success px-4">All Sites</button>
          <button className="btn btn-success px-4" onClick={handleCreate}>
            <PlusOutlined /> Create Location
          </button>
        </div>
      </div>

      {/* 🔹 Directory Table */}
      
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
     

      {/* 🔹 Drawer with Create/Edit Location Form */}
      <Drawer
        title={editingIndex !== null ? "Edit Location" : "Add Location"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Location Type"
                name="type"
            rules={[{ required: true, message: "Please select location type" }]}
          >
            <Select placeholder="Select Location Type" loading={locationTypes.length === 0}>
              {locationTypes.map((locationType) => (
                <Select.Option key={locationType.id} value={locationType.value || locationType.label}>
                  {locationType.label || locationType.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Name"
                name="name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="e.g., Central Storage Depot" />
          </Form.Item>

          <Form.Item
            label="Code"
                name="code"
            rules={[{ required: true, message: "Please enter code" }]}
          >
            <Input placeholder="e.g., WH002" />
          </Form.Item>

          <Form.Item
            label="Parent ID"
            name="parent_id"
            rules={[{ required: true, message: "Please enter parent ID" }]}
          >
            <InputNumber min={1} className="w-100" placeholder="1" />
          </Form.Item>

          <Form.Item
            label="Region ID"
            name="region_id"
            rules={[{ required: true, message: "Please enter region ID" }]}
          >
            <InputNumber min={1} className="w-100" placeholder="2" />
          </Form.Item>

          <Form.Item
            label="Active Status"
            name="active_status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select Status" loading={statusNames.length === 0}>
              {statusNames.map((status) => (
                <Select.Option key={status.id} value={status.value || status.label}>
                  {status.label || status.value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Address"
                name="address"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <Input.TextArea rows={3} placeholder="Full address..." />
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
                {editingIndex !== null ? 'Update Location' : 'Add Location'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}