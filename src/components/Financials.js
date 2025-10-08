import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { Table, Input, Button, Space, Drawer, Form, Select, DatePicker, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { formatDateForAPI, isValidDate } from '../utils/dateUtils';
import dayjs from 'dayjs';

const Financials = () => {
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
      // Check if acquisition_date is being set and validate it
      if (changedValues.acquisition_date !== undefined) {
        const dateValue = changedValues.acquisition_date;
        if (dateValue && typeof dateValue === 'string') {
          const dateObj = new Date(dateValue);
          if (isNaN(dateObj.getTime())) {
            console.warn("Invalid date detected, clearing field");
            form.setFieldValue('acquisition_date', null);
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

  const overview = {
    totalAssets: '$1,250,000',
    totalDepreciation: '$350,000',
    netBookValue: '$900,000',
    annualBudget: '$150,000',
  };

  // Fetch financial events from API
  const fetchFinancialEvents = async () => {
    setLoading(true);
    try {
      console.log('Fetching financial events from API...');
      const response = await fetch("http://202.53.92.35:5004/api/financials", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch financial events: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result); // Debug log
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.financial_events && Array.isArray(result.financial_events)) {
        data = result.financial_events;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
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
        message.success(`Financial events loaded successfully (${dataWithKeys.length} items)`);
      } else {
        message.info("No financial events found");
      }
    } catch (error) {
      console.error("Error fetching financial events:", error);
      message.error("Failed to load financial events");
      
      // Fallback: Set empty data to show "No data" state
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialEvents();
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
      const requiredFields = ['asset_category', 'cost_center', 'location', 'acquisition_date', 'financial_year', 'amount', 'currency', 'vendor_name'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        return;
      }
      
      // Test API endpoint first
      try {
        const testResponse = await fetch("http://202.53.92.35:5004/api/financials", {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log("API endpoint test - Status:", testResponse.status);
        if (!testResponse.ok) {
          console.warn("API endpoint test failed:", testResponse.status, testResponse.statusText);
        } else {
          const testData = await testResponse.json();
          console.log("API test response:", testData);
        }
      } catch (testError) {
        console.warn("API endpoint test error:", testError);
      }

      // Call API directly
      const mainUrl = "http://202.53.92.35:5004/api/financials";
      const method = isEditing ? "PUT" : "POST";
      
      // Prepare API data with proper ID for updates and format dates
      const formattedValues = { ...values };
      
      // Format dates to YYYY-MM-DD format for database
      if (formattedValues.acquisition_date) {
        console.log("Original acquisition_date:", formattedValues.acquisition_date, typeof formattedValues.acquisition_date);
        
        // Use the utility function to format the date
        const formattedDate = formatDateForAPI(formattedValues.acquisition_date);
        if (formattedDate && isValidDate(formattedValues.acquisition_date)) {
          formattedValues.acquisition_date = formattedDate;
          console.log("Formatted acquisition_date:", formattedValues.acquisition_date);
        } else {
          console.error("Invalid date:", formattedValues.acquisition_date);
          // Remove invalid date
          delete formattedValues.acquisition_date;
        }
      }
      
      // Ensure all string fields are properly formatted
      const stringFields = ['asset_category', 'cost_center', 'location', 'financial_year', 'currency', 'vendor_name', 'remarks'];
      stringFields.forEach(field => {
        if (formattedValues[field] !== undefined && formattedValues[field] !== null) {
          formattedValues[field] = String(formattedValues[field]).trim();
        }
      });
      
      // Ensure amount is properly formatted as string
      if (formattedValues.amount !== undefined && formattedValues.amount !== null) {
        formattedValues.amount = String(formattedValues.amount).trim();
      }
      
      // Generate a unique numeric ID - use a smaller number to avoid database range issues
      const recordId = isEditing ? editingIndex : Math.floor(Math.random() * 1000000) + 1000;
      
      const apiData = { 
        id: recordId, 
        ...formattedValues 
      };

      console.log("Sending API data:", apiData);
      console.log("Formatted acquisition_date:", apiData.acquisition_date);
      console.log("All field types:", Object.keys(apiData).map(key => `${key}: ${typeof apiData[key]}`));

      // Test with minimal data first
      const testMinimalData = {
        asset_category: "Test Category",
        cost_center: "CC001",
        location: "Test Location",
        acquisition_date: "2024-01-01",
        financial_year: "2024-2025",
        amount: "1000.00",
        currency: "INR",
        vendor_name: "Test Vendor"
      };
      
      console.log("Testing with minimal data:", testMinimalData);
      
      // Try minimal data first
      try {
        const testResponse = await fetch(mainUrl, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testMinimalData),
        });
        
        console.log("Minimal data test - Status:", testResponse.status);
        if (!testResponse.ok) {
          const testErrorText = await testResponse.text();
          console.error("Minimal data test failed:", testErrorText);
        } else {
          const testResult = await testResponse.json();
          console.log("Minimal data test success:", testResult);
        }
      } catch (testError) {
        console.error("Minimal data test error:", testError);
      }

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
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} financial event: ${errorMessage}`);
      }

      const result = await response.json();
      message.success(`Financial event ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchFinancialEvents();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} financial event:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} financial event: ${error.message}`);
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
    if (formValues.acquisition_date) {
      const convertedDate = safeDateConversion(formValues.acquisition_date);
      if (convertedDate) {
        formValues.acquisition_date = convertedDate;
      } else {
        console.warn("Invalid date string, removing from form:", formValues.acquisition_date);
        delete formValues.acquisition_date;
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
      delete safeFormValues.acquisition_date;
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
      const response = await fetch("http://202.53.92.35:5004/api/financials", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deleteId }),
      });
      
      if (response.ok) {
        message.success("Financial event deleted successfully!");
        await fetchFinancialEvents();
      } else {
        throw new Error("Failed to delete financial event");
      }
    } catch (error) {
      console.error("Error deleting financial event:", error);
      message.error("Failed to delete financial event");
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
      title: 'Asset Category',
      dataIndex: 'asset_category',
      key: 'asset_category',
      sorter: (a, b) => a.asset_category.localeCompare(b.asset_category),
      ...getColumnSearchProps('asset_category'),
    },
    {
      title: 'Cost Center',
      dataIndex: 'cost_center',
      key: 'cost_center',
      sorter: (a, b) => a.cost_center.localeCompare(b.cost_center),
      ...getColumnSearchProps('cost_center'),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      sorter: (a, b) => a.location.localeCompare(b.location),
      ...getColumnSearchProps('location'),
    },
    {
      title: 'Acquisition Date',
      dataIndex: 'acquisition_date',
      key: 'acquisition_date',
      sorter: (a, b) => new Date(a.acquisition_date) - new Date(b.acquisition_date),
      ...getColumnSearchProps('acquisition_date'),
    },
    {
      title: 'Financial Year',
      dataIndex: 'financial_year',
      key: 'financial_year',
      sorter: (a, b) => a.financial_year.localeCompare(b.financial_year),
      ...getColumnSearchProps('financial_year'),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => {
        const aAmount = parseFloat(a.amount) || 0;
        const bAmount = parseFloat(b.amount) || 0;
        return aAmount - bAmount;
      },
      ...getColumnSearchProps('amount'),
    },
    {
      title: 'Currency',
      dataIndex: 'currency',
      key: 'currency',
      sorter: (a, b) => a.currency.localeCompare(b.currency),
      ...getColumnSearchProps('currency'),
    },
    {
      title: 'Vendor Name',
      dataIndex: 'vendor_name',
      key: 'vendor_name',
      sorter: (a, b) => a.vendor_name.localeCompare(b.vendor_name),
      ...getColumnSearchProps('vendor_name'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      filters: [
        { text: 'Scheduled', value: 'Scheduled' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Upcoming', value: 'Upcoming' },
        { text: 'Completed', value: 'Completed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <span className={`badge ${status === 'Pending' ? 'bg-warning text-dark' : status === 'Upcoming' ? 'bg-success' : 'bg-info text-dark'}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => console.log('View', record)}
          >
            View
          </Button>
          <Button
            type="link"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this financial event?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
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
          <h2 className="mb-1">Financials</h2>
          <p className="mt-0 text-muted">Monitor and manage asset-related financial records.</p>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="card shadow-md mb-4">
        <div className="card-body">
          <h5 className="fs-4 mb-4">Financial Overview</h5>
          <div className="row row-cols-1 mt-2 row-cols-md-4 g-4">
            {Object.entries(overview).map(([key, value]) => (
              <div className="col" key={key}>
                <div className="card h-100 shadow-sm border-0 rounded-3">
                  <div className="card-body text-center">
                    <h5 className="card-title fs-6 text-muted">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <p className="card-text fw-bold fs-5">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            Add Financial Event
          </Button>
          <Button>
            Export
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
        title={editingIndex ? "Edit Financial Event" : "Create Financial Event"}
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
            currency: 'INR',
          }}
        >
          <Form.Item
            name="asset_category"
            label="Asset Category"
            rules={[{ required: true, message: 'Please enter asset category' }]}
          >
            <Input placeholder="Enter asset category" />
          </Form.Item>

          <Form.Item
            name="cost_center"
            label="Cost Center"
            rules={[{ required: true, message: 'Please enter cost center' }]}
          >
            <Input placeholder="Enter cost center" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input placeholder="Enter location" />
          </Form.Item>

          <Form.Item
            name="acquisition_date"
            label="Acquisition Date"
            rules={[{ required: true, message: 'Please select acquisition date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              placeholder="Select acquisition date"
            />
          </Form.Item>

          <Form.Item
            name="financial_year"
            label="Financial Year"
            rules={[{ required: true, message: 'Please enter financial year' }]}
          >
            <Input placeholder="Enter financial year (e.g., 2024-2025)" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <Input placeholder="Enter amount (e.g., 45000.00)" />
          </Form.Item>

          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: 'Please select currency' }]}
          >
            <Select placeholder="Select currency">
              <Select.Option value="INR">INR</Select.Option>
              <Select.Option value="USD">USD</Select.Option>
              <Select.Option value="EUR">EUR</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="vendor_name"
            label="Vendor Name"
            rules={[{ required: true, message: 'Please enter vendor name' }]}
          >
            <Input placeholder="Enter vendor name" />
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

export default Financials;
