import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Drawer, Form, Input, Select, Button, Space, Table, message, Modal } from "antd";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "../../../App.css";
import CustomBreadcrumb from '../../../components/Breadcrumb';
import BackNavigation from '../../../components/BackNavigation';

export default function PaymentMethods({ onNavigate }) {
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

  // 🔹 Fetch payment methods from API
  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      console.log('Fetching payment methods from API...');
      const response = await fetch("http://202.53.92.35:5004/api/settings/getPaymentMethodsList", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "x-access-token":  sessionStorage.getItem("token"),
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      console.log("API Response:", result); // Debug log
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.payment_methods && Array.isArray(result.payment_methods)) {
        data = result.payment_methods;
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
      message.success(`Payment methods loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      message.error("Failed to load payment methods");
      
      // Fallback: Set empty data to show "No data" state
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch data on component mount
  useEffect(() => {
    fetchPaymentMethods();
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
      'method_name', 'code', 'status', 'type'
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
      method_name: { 
        title: "Method Name", 
        sorter: (a, b) => (a.method_name || "").localeCompare(b.method_name || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.method_name?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search method name"
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
        filteredValue: filteredInfo.method_name || null,
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
      type: { 
        title: "Type", 
        sorter: (a, b) => (a.type || "").localeCompare(b.type || ""),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.type?.toString().toLowerCase().includes(value.toLowerCase()),
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
        filteredValue: filteredInfo.type || null,
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
      method_name: cleanValue(record.method_name),
      code: cleanValue(record.code),
      status: cleanValue(record.status),
      type: cleanValue(record.type),
      default_for: cleanValue(record.default_for),
      gl_account: cleanValue(record.gl_account),
      processing_fee: cleanValue(record.processing_fee),
      currency: cleanValue(record.currency),
      approval_required: cleanValue(record.approval_required),
      instructions: cleanValue(record.instructions),
      notes: cleanValue(record.notes),
    });
    
    setEditingIndex(record.id || record._id);
    setEditingRecord(record); // Store the original record for updates
    setDrawerVisible(true);
  };

  // 🔹 Handle delete
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this payment method?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deletePaymentMethod", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  "x-access-token":  sessionStorage.getItem("token"),
                },
                body: JSON.stringify({ id: deleteId }),
              });
          
          if (response.ok) {
            message.success("Payment method deleted successfully!");
            await fetchPaymentMethods();
          } else {
            throw new Error("Failed to delete payment method");
          }
        } catch (error) {
          console.error("Error deleting payment method:", error);
          message.error("Failed to delete payment method");
        }
      },
    });
  };

  // 🔹 Save Payment Method
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingIndex !== null;
      
      // Client-side validation for required fields
      const requiredFields = ['method_name', 'code', 'status', 'type', 'default_for', 'gl_account', 'processing_fee', 'currency', 'approval_required', 'instructions'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        return;
      }

      // Call API directly
      const mainUrl = isEditing 
        ? "http://202.53.92.35:5004/api/settings/updatePaymentMethod"
        : "http://202.53.92.35:5004/api/settings/createPaymentMethod";
      
      const method = isEditing ? "PUT" : "POST";
      
      // Prepare API data with proper ID for updates
      const apiData = isEditing 
        ? { id: editingRecord?.id || editingIndex, ...values }
        : values;

      const response = await fetch(mainUrl, {
          method: method,
          headers: {
            "Content-Type": "application/json",
            "x-access-token":  sessionStorage.getItem("token"),
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
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} payment method: ${errorData.message || errorText}`);
      }

      const result = await response.json();
      message.success(`Payment method ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchPaymentMethods();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} payment method:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} payment method: ${error.message}`);
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
          
          <h2 className="mb-1">Payment Methods</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Methods</button>
          <button className="btn btn-success px-4">All Currencies</button>
          <button className="btn btn-success px-4" onClick={handleCreate}>
            <PlusOutlined /> Create Method
          </button>
        </div>
      </div>

      {/* 🔹 Directory Table */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fs-4 mb-0">Payment Methods</h5>
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

      {/* 🔹 Drawer with Create/Edit Payment Method Form */}
      <Drawer
        title={editingIndex !== null ? "Edit Payment Method" : "Add Payment Method"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Method Name"
            name="method_name"
            rules={[{ required: true, message: "Please enter method name" }]}
          >
            <Input placeholder="e.g., Bank Transfer" />
          </Form.Item>

          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: "Please enter code" }]}
          >
            <Input placeholder="e.g., PM001" />
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
            label="Type"
            name="type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select placeholder="Select Type">
              <Select.Option value="Electronic">Electronic</Select.Option>
              <Select.Option value="Online">Online</Select.Option>
              <Select.Option value="Offline">Offline</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Default For"
            name="default_for"
            rules={[{ required: true, message: "Please select default for" }]}
          >
            <Select placeholder="Select Default">
              <Select.Option value="Vendor Payments">Vendor Payments</Select.Option>
              <Select.Option value="Internal Purchases">Internal Purchases</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="GL Account"
            name="gl_account"
            rules={[{ required: true, message: "Please enter GL account" }]}
          >
            <Input placeholder="e.g., GL1001" />
          </Form.Item>

          <Form.Item
            label="Processing Fee (%)"
            name="processing_fee"
            rules={[{ required: true, message: "Please enter processing fee" }]}
          >
            <Input placeholder="e.g., 0.00" />
          </Form.Item>

          <Form.Item
            label="Currency"
            name="currency"
            rules={[{ required: true, message: "Please select currency" }]}
          >
            <Select placeholder="Select Currency">
              <Select.Option value="INR">INR</Select.Option>
              <Select.Option value="USD">USD</Select.Option>
              <Select.Option value="EUR">EUR</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Approval Required"
            name="approval_required"
            rules={[{ required: true, message: "Please select option" }]}
          >
            <Select placeholder="Select Option">
              <Select.Option value="Yes">Yes</Select.Option>
              <Select.Option value="No">No</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Instructions"
            name="instructions"
            rules={[{ required: true, message: "Please enter instructions" }]}
          >
            <Input.TextArea rows={3} placeholder="Payment instructions..." />
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
                {editingIndex !== null ? 'Update Method' : 'Add Method'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}