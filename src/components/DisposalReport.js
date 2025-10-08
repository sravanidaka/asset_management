import React, { useState, useEffect } from "react";
import { FaSearch, FaDownload, FaEye, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { Table, Input, Button, Space, Drawer, Form, Select, DatePicker, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { formatDateForAPI, isValidDate } from '../utils/dateUtils';
import dayjs from 'dayjs';

const DisposalReport = () => {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form] = Form.useForm();

  // Monitor form values for date validation
  useEffect(() => {
    const handleFormChange = (changedValues, allValues) => {
      // Check if disposal_date is being set and validate it
      if (changedValues.disposal_date !== undefined) {
        const dateValue = changedValues.disposal_date;
        if (dateValue && typeof dateValue === 'string') {
          const dateObj = new Date(dateValue);
          if (isNaN(dateObj.getTime())) {
            console.warn("Invalid date detected, clearing field");
            form.setFieldValue('disposal_date', null);
          }
        }
      }
    };

    // Add form change listener
    const unsubscribe = form.getFieldsValue();
    return () => {
      // Cleanup if needed
    };
  }, [form]);

  // Fetch disposal records from API
  const fetchDisposalRecords = async () => {
    setLoading(true);
    try {
      console.log('Fetching disposal records from API...');
      const response = await fetch("http://202.53.92.35:5004/api/disposal", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch disposal records: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result); // Debug log
      console.log("API Response type:", typeof result);
      console.log("API Response isArray:", Array.isArray(result));
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array:", data);
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
        console.log("Using result.data:", data);
      } else if (result.disposal_records && Array.isArray(result.disposal_records)) {
        data = result.disposal_records;
        console.log("Using result.disposal_records:", data);
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
        console.log("Using result.result:", data);
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
        console.log("Using result.items:", data);
      } else if (result.success && result.data && Array.isArray(result.data)) {
        data = result.data;
        console.log("Using result.success.data:", data);
      } else if (result.disposal && Array.isArray(result.disposal)) {
        data = result.disposal;
        console.log("Using result.disposal:", data);
      } else {
        console.log("Unexpected API response structure:", result);
        console.log("Available keys:", Object.keys(result));
        console.log("Response structure:", JSON.stringify(result, null, 2));
        
        // Try to find any array in the response
        for (const key in result) {
          if (Array.isArray(result[key])) {
            console.log(`Found array in key '${key}':`, result[key]);
            data = result[key];
            break;
          }
        }
      }
      
      console.log("Processed data:", data); // Debug log
      console.log("Data length:", data.length); // Debug log
      
      // Add key property for each item (required by Ant Design Table)
      const dataWithKeys = data.map((item, index) => ({
        ...item,
        key: item.id || item._id || index.toString(),
      }));
      console.log("Data with keys:", dataWithKeys); // Debug log
      
      // Set the data from API
      setDataSource(dataWithKeys);
      setPagination(prev => ({ ...prev, total: dataWithKeys.length }));
      
      if (dataWithKeys.length > 0) {
        message.success(`Disposal records loaded successfully (${dataWithKeys.length} items)`);
      } else {
        message.info("No disposal records found");
      }
    } catch (error) {
      console.error("Error fetching disposal records:", error);
      message.error("Failed to load disposal records");
      
      // Fallback: Set empty data to show "No data" state
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisposalRecords();
  }, []);

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Handle form submission
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingIndex !== null;
      
      // Client-side validation for required fields
      const requiredFields = ['asset_id', 'asset_name', 'disposal_date', 'reason', 'method', 'status'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        return;
      }

      // Call API directly
      const mainUrl = "http://202.53.92.35:5004/api/disposal";
      const method = isEditing ? "PUT" : "POST";
      
      // Prepare API data with proper ID for updates and format dates
      const formattedValues = { ...values };
      
      // Format dates to YYYY-MM-DD format for database
      if (formattedValues.disposal_date) {
        console.log("Original disposal_date:", formattedValues.disposal_date, typeof formattedValues.disposal_date);
        
        // Use the utility function to format the date
        const formattedDate = formatDateForAPI(formattedValues.disposal_date);
        if (formattedDate && isValidDate(formattedValues.disposal_date)) {
          formattedValues.disposal_date = formattedDate;
          console.log("Formatted disposal_date:", formattedValues.disposal_date);
        } else {
          console.error("Invalid date:", formattedValues.disposal_date);
          // Remove invalid date
          delete formattedValues.disposal_date;
        }
      }
      
      // Ensure all string fields are properly formatted
      const stringFields = ['asset_id', 'asset_name', 'reason', 'method', 'status', 'remarks'];
      stringFields.forEach(field => {
        if (formattedValues[field] !== undefined && formattedValues[field] !== null) {
          formattedValues[field] = String(formattedValues[field]).trim();
        }
      });
      
      // Generate a unique numeric ID - use a smaller number to avoid database range issues
      const recordId = isEditing ? editingIndex : Math.floor(Math.random() * 1000000) + 1000;
      
      const apiData = { 
        id: recordId, 
        ...formattedValues 
      };

      console.log("Sending API data:", apiData);
      console.log("Formatted disposal_date:", apiData.disposal_date);

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
        console.error("Request data that caused error:", JSON.stringify(apiData, null, 2));
        
        // Try to parse error response
        let errorData;
        try {
          errorData = JSON.parse(errorText);
          console.error("Parsed error data:", errorData);
        } catch (parseError) {
          console.error("Could not parse error response:", parseError);
          errorData = { message: errorText };
        }
        
        // Show detailed error message
        const errorMessage = errorData.message || errorData.details || errorText;
        console.error("Full error details:", {
          status: response.status,
          error: errorMessage,
          requestData: apiData,
          responseText: errorText
        });
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} disposal record: ${errorMessage}`);
      }

      const result = await response.json();
      message.success(`Disposal record ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchDisposalRecords();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} disposal record:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} disposal record: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to safely convert date strings to dayjs objects
  const safeDateConversion = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      // Use dayjs for consistent date handling
      const dayjsDate = dayjs(dateValue);
      return dayjsDate.isValid() ? dayjsDate : null;
    } catch (error) {
      console.error('Error converting date:', error);
      return null;
    }
  };

  // Handle edit
  const handleEdit = (record) => {
    console.log("Editing record:", record);
    
    // Prepare form values with proper date formatting
    const formValues = { ...record };
    
    // Safely convert date strings to Date objects for DatePicker
    if (formValues.disposal_date) {
      const convertedDate = safeDateConversion(formValues.disposal_date);
      if (convertedDate) {
        formValues.disposal_date = convertedDate;
      } else {
        console.warn("Invalid date string, removing from form:", formValues.disposal_date);
        delete formValues.disposal_date;
      }
    }
    
    console.log("Form values for editing:", formValues);
    
    // Clear form first to avoid validation issues
    form.resetFields();
    
    try {
      form.setFieldsValue(formValues);
      setEditingIndex(record.key);
      setDrawerVisible(true);
    } catch (error) {
      console.error("Error setting form values:", error);
      // Fallback: set form values without date fields
      const safeFormValues = { ...formValues };
      delete safeFormValues.disposal_date;
      form.setFieldsValue(safeFormValues);
      setEditingIndex(record.key);
      setDrawerVisible(true);
    }
  };

  // Handle delete
  const handleDelete = async (record) => {
    try {
      const deleteId = record.id || record.key;
      
      // Call API directly
      const response = await fetch("http://202.53.92.35:5004/api/disposal", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deleteId }),
      });
      
      if (response.ok) {
        message.success("Disposal record deleted successfully!");
        await fetchDisposalRecords();
      } else {
        throw new Error("Failed to delete disposal record");
      }
    } catch (error) {
      console.error("Error deleting disposal record:", error);
      message.error("Failed to delete disposal record");
    }
  };

  // Handle create new
  const handleCreate = () => {
    form.resetFields(); // Clear form to prevent stale date values
    setEditingIndex(null);
    setDrawerVisible(true);
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
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
  });

  // Define table columns
  const columns = [
    {
      title: 'Asset Name',
      dataIndex: 'asset_name',
      key: 'asset_name',
      sorter: (a, b) => a.asset_name.localeCompare(b.asset_name),
      ...getColumnSearchProps('asset_name'),
    },
    {
      title: 'Asset ID',
      dataIndex: 'asset_id',
      key: 'asset_id',
      sorter: (a, b) => a.asset_id.localeCompare(b.asset_id),
      ...getColumnSearchProps('asset_id'),
    },
    {
      title: 'Disposal Date',
      dataIndex: 'disposal_date',
      key: 'disposal_date',
      sorter: (a, b) => new Date(a.disposal_date) - new Date(b.disposal_date),
      ...getColumnSearchProps('disposal_date'),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      sorter: (a, b) => a.reason.localeCompare(b.reason),
      filters: [
        { text: 'Obsolete', value: 'Obsolete' },
        { text: 'Damaged', value: 'Damaged' },
        { text: 'Beyond Repair', value: 'Beyond Repair' },
        { text: 'Upgrade', value: 'Upgrade' },
      ],
      onFilter: (value, record) => record.reason === value,
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      sorter: (a, b) => a.method.localeCompare(b.method),
      filters: [
        { text: 'Recycling', value: 'Recycling' },
        { text: 'Scrap', value: 'Scrap' },
        { text: 'Donation', value: 'Donation' },
        { text: 'Sale', value: 'Sale' },
        { text: 'Destruction', value: 'Destruction' },
      ],
      onFilter: (value, record) => record.method === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      filters: [
        { text: 'Completed', value: 'Completed' },
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Cancelled', value: 'Cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <span className="status-badge">{status}</span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<FaEye />}
            onClick={() => console.log('View', record)}
          />
          <Button
            type="link"
            icon={<FaEdit />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this disposal record?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<FaTrash />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid p-1 position-relative" style={{ minHeight: "100vh" }}>
      
      {/* Title and Description */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Disposal Report</h2>
          <p className="mt-0 text-muted">Track and manage asset disposal records.</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div></div>
        <div className="d-flex gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            loading={loading}
          >
            Add Disposal Record
          </Button>
          <Button icon={<FaDownload />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Ant Design Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        </div>
      </div>

      {/* Drawer for Form */}
      <Drawer
        title={editingIndex ? "Edit Disposal Record" : "Create Disposal Record"}
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={() => form.submit()} type="primary" loading={loading}>
              {editingIndex ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            status: 'Completed',
            method: 'Recycling',
          }}
        >
          <Form.Item
            name="asset_name"
            label="Asset Name"
            rules={[{ required: true, message: 'Please enter asset name' }]}
          >
            <Input placeholder="Enter asset name" />
          </Form.Item>

          <Form.Item
            name="asset_id"
            label="Asset ID"
            rules={[{ required: true, message: 'Please enter asset ID' }]}
          >
            <Input placeholder="Enter asset ID" />
          </Form.Item>

          <Form.Item
            name="disposal_date"
            label="Disposal Date"
            rules={[{ required: true, message: 'Please select disposal date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              placeholder="Select disposal date"
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Please enter disposal reason' }]}
          >
            <Input placeholder="Enter disposal reason" />
          </Form.Item>

          <Form.Item
            name="method"
            label="Method"
            rules={[{ required: true, message: 'Please select disposal method' }]}
          >
            <Select placeholder="Select disposal method">
              <Select.Option value="Recycling">Recycling</Select.Option>
              <Select.Option value="Scrap">Scrap</Select.Option>
              <Select.Option value="Donation">Donation</Select.Option>
              <Select.Option value="Sale">Sale</Select.Option>
              <Select.Option value="Destruction">Destruction</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="In Progress">In Progress</Select.Option>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="remarks"
            label="Remarks"
          >
            <Input.TextArea rows={3} placeholder="Enter remarks (optional)" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default DisposalReport;