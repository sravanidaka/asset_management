import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { Drawer, Form, Input, InputNumber, Select, Button, Space, Table, message, Modal } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "../../../App.css";
import CustomBreadcrumb from '../../../components/Breadcrumb';
import BackNavigation from '../../../components/BackNavigation';

export default function ManageCategory({ onNavigate }) {
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

  // 🔹 Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      console.log('Fetching categories from API...');
      const response = await fetch(`http://202.53.92.35:5004/api/settings/getSettingCategoriesList`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-access-token":  sessionStorage.getItem("token"),
        }
      });
      
      console.log('API Response status:', response.status);
      
      const result = await response.json();
    
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.categories && Array.isArray(result.categories)) {
        data = result.categories;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      } else {
        console.error("Unexpected API response structure:", result);
        data = [];
      }
    
      // Add key property for each item (required by Ant Design Table)
      const dataWithKeys = data.map((item, index) => ({
        ...item,
        key: item.id || item._id || index.toString(),
      }));
      
      setDataSource(dataWithKeys);
      message.success(`Categories loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error(`Failed to load categories: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  // 🔹 Fetch data on component mount
  useEffect(() => {
    fetchCategories();
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
      'category_name', 'parent_category', 'useful_life', 'capex_opex'
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
      category_name: { 
        title: "Name", 
        sorter: (a, b) => (a.category_name || "").localeCompare(b.category_name || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.category_name?.toString().toLowerCase().includes(value.toLowerCase()),
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
        filteredValue: filteredInfo.category_name || null,
      },
      parent_category: { 
        title: "Parent Category", 
        sorter: (a, b) => (a.parent_category || "").localeCompare(b.parent_category || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.parent_category?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search parent category"
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
        filteredValue: filteredInfo.parent_category || null,
      },
      useful_life: { 
        title: "Useful Life (years)", 
        sorter: (a, b) => (a.useful_life || 0) - (b.useful_life || 0),
        render: (text) => text && text !== 'N/A' ? `${text} years` : '-',
        onFilter: (value, record) => record.useful_life?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search useful life"
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
        filteredValue: filteredInfo.useful_life || null,
      },
      capex_opex: { 
        title: "Type", 
        sorter: (a, b) => (a.capex_opex || "").localeCompare(b.capex_opex || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.capex_opex?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search type"
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
        filteredValue: filteredInfo.capex_opex || null,
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
    console.log("=== EDIT RECORD DEBUG ===");
    console.log("Edit record:", record);
    console.log("Record ID:", record.id);
    console.log("Record _id:", record._id);
    console.log("Record key:", record.key);
    
    // Helper function to clean values (remove N/A, null, undefined)
    const cleanValue = (value) => {
      if (value === 'N/A' || value === null || value === undefined || value === '') {
        return undefined; // Return undefined so form field shows as empty
      }
      return value;
    };
    
    // Set form values with cleaned data
    const formValues = {
      category_name: cleanValue(record.category_name),
      parent_category: cleanValue(record.parent_category),
      useful_life: cleanValue(record.useful_life),
      description: cleanValue(record.description),
      default_depreciation: cleanValue(record.default_depreciation),
      capex_opex: cleanValue(record.capex_opex),
      track_warranty: cleanValue(record.track_warranty),
    };
    
    console.log("Form values being set:", formValues);
    
    form.setFieldsValue(formValues);
    
    const recordId = record.id || record._id || record.key;
    console.log("Setting editing index to:", recordId);
    
    setEditingIndex(recordId);
    setEditingRecord(record); // Store the original record for updates
    setDrawerVisible(true);
  };

  // 🔹 Handle delete
  const handleDelete = (record) => {
    console.log("Delete record:", record);
    console.log("Record ID:", record.id || record.key);
    
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this category?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deleteSettingCategory", {
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
            message.success("Category deleted successfully!");
            await fetchCategories(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete category: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          message.error(`Failed to delete category: ${error.message}`);
        }
      },
    });
  };

  // 🔹 Save Category
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingIndex !== null;
      
      console.log("=== SAVE CATEGORY DEBUG ===");
      console.log("Is Editing:", isEditing);
      console.log("Editing Index:", editingIndex);
      console.log("Editing Record:", editingRecord);
      console.log("Form Values:", values);
      
      // Client-side validation for required fields
      const requiredFields = ['category_name', 'parent_category', 'useful_life', 'description', 'default_depreciation', 'capex_opex', 'track_warranty'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        setLoading(false);
        return;
      }

      // Call API directly - use the correct endpoint structure
      let mainUrl;
      let apiData;
      
      if (isEditing) {
        // For updates, use the working approach: ID in request body
        const recordId = editingRecord?.id || editingRecord?._id || editingIndex;
        
        if (!recordId) {
          console.error("ERROR: No record ID found for update operation!");
          message.error("Error: Cannot update - no record ID found!");
          setLoading(false);
          return;
        }
        
        // Use the working approach: ID in request body
        mainUrl = "http://202.53.92.35:5004/api/settings/updatesettingCategory";
        apiData = { 
          id: recordId,
          ...values 
        };
        
        console.log("=== UPDATE OPERATION ===");
        console.log("Using update endpoint with ID in request body");
        console.log("Update Record ID:", recordId);
        console.log("Update API Data:", apiData);
        console.log("Original Record:", editingRecord);
      } else {
        // For create operations - ensure no ID is included
        mainUrl = "http://202.53.92.35:5004/api/settings/createSettingCategory";
        apiData = { ...values };
        
        // Remove any ID field to ensure it's a create operation
        delete apiData.id;
        
        console.log("=== CREATE OPERATION ===");
        console.log("Create API Data:", apiData);
        console.log("No ID in request body:", !apiData.id);
      }
      
      const method = isEditing ? "PUT" : "POST";  // Use PUT for updates, POST for creates

      console.log("API URL:", mainUrl);
      console.log("API Method:", method);
      console.log("Request Headers:", {
        "Content-Type": "application/json",
        "x-access-token": sessionStorage.getItem("token") ? "Present" : "Missing"
      });
      console.log("Request Body:", JSON.stringify(apiData, null, 2));

      const response = await fetch(mainUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify(apiData),
      });

      console.log("Response Status:", response.status);
      console.log("Response OK:", response.ok);

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
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} category: ${errorData.message || errorText}`);
      }

      const result = await response.json();
      console.log("API Success Response:", result);
      console.log("Response Status Code:", response.status);
      console.log("Response Headers:", Object.fromEntries(response.headers.entries()));
      
      // Check if the response indicates a delete operation
      if (result.message && result.message.toLowerCase().includes('delete')) {
        console.error("WARNING: Backend response suggests delete operation!");
        message.error("Backend returned delete response for update operation!");
        return;
      }
      
      // Check if the response indicates success
      if (result.success === false) {
        console.error("Backend returned success: false");
        message.error(`Operation failed: ${result.message || 'Unknown error'}`);
        return;
      }
      
      // Additional validation for update operations
      if (isEditing) {
        // Check if the response contains the updated data
        if (result.data && result.data.id) {
          console.log("✅ Update successful - received updated data with ID:", result.data.id);
        } else if (result.id) {
          console.log("✅ Update successful - received ID in response:", result.id);
        } else {
          console.warn("⚠️ Update response doesn't contain expected ID field");
        }
        
        // Validate that we're not accidentally creating a new record
        if (result.message && result.message.toLowerCase().includes('created')) {
          console.error("WARNING: Update operation resulted in creation!");
          message.error("Update operation created new record instead of updating existing one!");
          return;
        }
      }
      
      // Log the operation type for debugging
      console.log(`✅ ${isEditing ? 'UPDATE' : 'CREATE'} operation completed successfully`);
      console.log("Response data:", result);
      
      message.success(`Category ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchCategories();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} category:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} category: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container-fluid p-1 position-relative" style={{ minHeight: "100vh" }}>
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
         
          <h2 className="mb-1">Asset Categories</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Types</button>
          <button 
            className="btn btn-success px-4"
            onClick={() => onNavigate("all-departments")}
          >
            All Departments
          </button>
          <button
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Category
          </button>
        </div>
      </div>

      {/* 🔹 Categories Table */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fs-4 mb-0">Categories</h5>
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
        title={editingIndex !== null ? "Edit Category" : "Add Category"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Category Name"
            name="category_name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="e.g., Laptops" />
          </Form.Item>

          <Form.Item
            label="Parent Category"
            name="parent_category"
            rules={[{ required: true, message: "Please enter parent category" }]}
          >
            <Input placeholder="e.g., IT Equipment" />
          </Form.Item>

          <Form.Item
            label="Useful Life (years)"
            name="useful_life"
            rules={[{ required: true, message: "Please enter useful life" }]}
          >
            <InputNumber min={1} className="w-100" placeholder="5" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={3} placeholder="Short description..." />
          </Form.Item>

          <Form.Item
            label="Default Depreciation"
            name="default_depreciation"
            rules={[{ required: true, message: "Please enter depreciation method" }]}
          >
            <Input placeholder="Straight Line" />
          </Form.Item>

          <Form.Item
            label="CapEx/OpEx"
            name="capex_opex"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="CapEx">CapEx</Select.Option>
              <Select.Option value="OpEx">OpEx</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Track Warranty"
            name="track_warranty"
            rules={[{ required: true, message: "Please select option" }]}
          >
            <Select placeholder="Select option">
              <Select.Option value="Yes">Yes</Select.Option>
              <Select.Option value="No">No</Select.Option>
            </Select>
          </Form.Item>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={() => form.resetFields()} disabled={loading}>Reset</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingIndex !== null ? 'Update Category' : 'Add Category'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}