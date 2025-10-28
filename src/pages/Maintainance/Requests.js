import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSearch, FaDownload, FaEye, FaEdit, FaArrowLeft } from "react-icons/fa";
import { Table, Input, Button, Space, Drawer, Form, Select, DatePicker, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { parseDateForDatePicker, formatDateForAPI, formatDateForDisplay } from '../../utils/dateUtils';
import '../../App.css';
import CustomBreadcrumb from '../../components/Breadcrumb';
import BackNavigation from '../../components/BackNavigation';
import ExportButton from '../../components/ExportButton';
import { safeStringCompare, safeDateCompare } from '../../utils/tableUtils';

const Requests = () => {
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
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Fetch maintenance requests from API
  const fetchMaintenanceRequests = async () => {
    setLoading(true);
    try {
      console.log('Fetching maintenance requests from API...');
      const response = await fetch('http://202.53.92.35:5004/api/maintenance',{
        headers: {
            "x-access-token":  sessionStorage.getItem("token"),
          }
      });
      console.log('API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        
        // Handle different response formats
        let maintenanceData = [];
        if (data.success && Array.isArray(data.maintenance_requests)) {
          maintenanceData = data.maintenance_requests;
          console.log('Using maintenance_requests array:', maintenanceData.length, 'items');
        } else if (Array.isArray(data)) {
          maintenanceData = data;
          console.log('Using direct array format:', maintenanceData.length, 'items');
        } else {
          console.log('Unexpected API response format:', data);
          maintenanceData = [];
        }
        
        const dataWithKeys = maintenanceData.map((item, index) => ({
          ...item,
          key: item.maintenance_id || index,
        }));
        setDataSource(dataWithKeys);
        setPagination(prev => ({ ...prev, total: dataWithKeys.length }));
        console.log('Data loaded successfully:', dataWithKeys.length, 'items');
      } else {
        console.log('API failed, no data available');
        setDataSource([]);
        setPagination(prev => ({ ...prev, total: 0 }));
        message.info("No maintenance requests found");
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      message.error("Failed to load maintenance requests");
      setDataSource([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Handle form submission
  const handleSave = async (values) => {
    try {
      setLoading(true);
      
      // Use the centralized date formatting utility

      // Use the original field names that the API expects
      const apiData = {
        maintenance_id: editingIndex !== null ? editingRecord?.maintenance_id : values.id,
        asset: values.asset, // API expects 'asset', not 'asset_id'
        type: values.type, // API expects 'type', not 'maintenance_type'
        scheduled_date: formatDateForAPI(values.scheduled),
        due_date: formatDateForAPI(values.due),
        status: values.status,
        priority: values.priority,
        assigned_to: values.assigned
      };
      

      // Validate required fields
      const requiredFields = ['id', 'asset', 'type', 'scheduled', 'due', 'status', 'priority', 'assigned'];
      const missingFields = requiredFields.filter(field => !values[field] || values[field] === '');
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        message.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      console.log('Submitting maintenance request:', apiData);
      console.log('Form values:', values);
      console.log('Is editing:', editingIndex !== null);
      console.log('Maintenance ID being sent:', apiData.maintenance_id);
      console.log('Editing index value:', editingIndex);
      console.log('Original record being edited:', editingRecord);
      console.log('Full API data structure:', JSON.stringify(apiData, null, 2));
      
      // Additional debugging for date fields
      console.log('Date field details:');
      console.log('- scheduled_date:', apiData.scheduled_date, typeof apiData.scheduled_date);
      console.log('- due_date:', apiData.due_date, typeof apiData.due_date);
      console.log('- Original scheduled value:', values.scheduled, typeof values.scheduled);
      console.log('- Original due value:', values.due, typeof values.due);
      console.log('- Formatted scheduled_date should be YYYY-MM-DD format');
      console.log('- Formatted due_date should be YYYY-MM-DD format');
      console.log('- Full API data being sent:', JSON.stringify(apiData, null, 2));

      // Test API connectivity first
      console.log('Testing API connectivity...');
      try {
        const testResponse = await fetch('http://202.53.92.35:5004/api/maintenance', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "x-access-token":  sessionStorage.getItem("token"),
          },
        });
        console.log('API connectivity test result:', testResponse.status, testResponse.statusText);
      } catch (testError) {
        console.error('API connectivity test failed:', testError);
      }

      let response;
      if (editingIndex !== null) {
        // Update existing maintenance request
        console.log('Sending PUT request to update maintenance request...');
        console.log('Update data being sent:', apiData);
        console.log('Editing index:', editingIndex);
        
        try {
          response = await fetch('http://202.53.92.35:5004/api/maintenance', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              "x-access-token":  sessionStorage.getItem("token"),
            },
            body: JSON.stringify(apiData),
          });
          console.log('PUT request completed with status:', response.status);
        } catch (putError) {
          console.error('PUT request failed, trying POST for update:', putError);
          // Fallback: Try POST for update if PUT fails
          response = await fetch('http://202.53.92.35:5004/api/maintenance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              "x-access-token":  sessionStorage.getItem("token"),
            },
            body: JSON.stringify(apiData),
          });
          console.log('POST fallback completed with status:', response.status);
        }
      } else {
        // Create new maintenance request
        console.log('Sending POST request to create maintenance request...');
        response = await fetch('http://202.53.92.35:5004/api/maintenance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            "x-access-token":  sessionStorage.getItem("token"),
          },
          body: JSON.stringify(apiData),
        });
      }
      
      console.log('Response received:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        message.success(editingIndex !== null ? 'Maintenance request updated successfully' : 'Maintenance request created successfully');
        setDrawerVisible(false);
        form.resetFields();
        setEditingIndex(null);
        setEditingRecord(null); // Clear editing record
        fetchMaintenanceRequests();
      } else {
        console.error('Response Status:', response.status);
        console.error('Response Headers:', response.headers);
        
        // Try to parse JSON response, but handle non-JSON responses
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          console.error('API Error Response:', errorData);
          errorMessage = errorData.message || errorData.error || 'Database error';
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          // Try to get text response
          try {
            const textResponse = await response.text();
            console.error('Non-JSON response:', textResponse);
            errorMessage = `Server returned ${response.status}: ${textResponse.substring(0, 100)}...`;
          } catch (textError) {
            console.error('Failed to get text response:', textError);
            errorMessage = `Server returned ${response.status}: Unable to parse response`;
          }
        }
        
        message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} maintenance request: ${errorMessage}`);
        
        // Log the data that caused the error
        console.error('Data that caused the error:', apiData);
      }
    } catch (error) {
      console.error('Error saving maintenance request:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response.data);
        message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} maintenance request: ${error.response.data?.message || error.response.data?.error || 'Database error'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        message.error('Network error: Unable to connect to the server');
      } else {
        console.error('Error message:', error.message);
        message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} maintenance request: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (record) => {
    console.log('Editing record:', record);
    
    // Map API field names to form field names and parse dates properly
    const formValues = {
      id: record.maintenance_id,
      asset: record.asset,
      type: record.type,
      scheduled: parseDateForDatePicker(record.scheduled_date),
      due: parseDateForDatePicker(record.due_date),
      status: record.status,
      priority: record.priority,
      assigned: record.assigned_to
    };
    
    console.log('Setting form values:', formValues);
    
    // Set form values with proper moment objects for DatePicker
    form.setFieldsValue(formValues);
    setEditingIndex(record.key);
    setEditingRecord(record); // Store the original record for update
    setDrawerVisible(true);
  };

  // Handle delete
  const handleDelete = async (record) => {
    try {
      const response = await fetch('http://202.53.92.35:5004/api/maintenance', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "x-access-token":  sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          maintenance_id: record.maintenance_id
        }),
      });

      if (response.ok) {
        message.success('Maintenance request deleted successfully');
        fetchMaintenanceRequests();
      } else {
        message.error('Failed to delete maintenance request');
      }
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      message.error('Failed to delete maintenance request');
    }
  };

  // Handle create new
  const handleCreate = () => {
    console.log('Creating new maintenance request');
    form.resetFields();
    setEditingIndex(null);
    setEditingRecord(null); // Clear editing record
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
      title: 'S.No',
      key: 'serial',
      width: 80,
      render: (text, record, index) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: 'Maintenance ID',
      dataIndex: 'maintenance_id',
      key: 'maintenance_id',
      sorter: (a, b) => safeStringCompare(a.maintenance_id, b.maintenance_id),
      ...getColumnSearchProps('maintenance_id'),
    },
    {
      title: 'Asset',
      dataIndex: 'asset',
      key: 'asset',
      sorter: (a, b) => safeStringCompare(a.asset, b.asset),
      ...getColumnSearchProps('asset'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => safeStringCompare(a.type, b.type),
      filters: [
        { text: 'Preventive', value: 'Preventive' },
        { text: 'Repair', value: 'Repair' },
        { text: 'Maintenance', value: 'Maintenance' },
        { text: 'Scheduled Inspection', value: 'Scheduled Inspection' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'scheduled_date',
      key: 'scheduled_date',
      sorter: (a, b) => safeDateCompare(a.scheduled_date, b.scheduled_date),
      ...getColumnSearchProps('scheduled_date'),
      render: (date) => formatDateForDisplay(date) || '-',
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      sorter: (a, b) => safeDateCompare(a.due_date, b.due_date),
      ...getColumnSearchProps('due_date'),
      render: (date) => formatDateForDisplay(date) || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => safeStringCompare(a.status, b.status),
      filters: [
        { text: 'Scheduled', value: 'Scheduled' },
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Cancelled', value: 'Cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <span className={`badge ${status === 'In Progress' ? 'bg-warning' : status === 'Completed' ? 'bg-success' : 'bg-info'}`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => safeStringCompare(a.priority, b.priority),
      filters: [
        { text: 'Low', value: 'Low' },
        { text: 'Medium', value: 'Medium' },
        { text: 'High', value: 'High' },
      ],
      onFilter: (value, record) => record.priority === value,
      render: (priority) => (
        <span className={`badge ${priority === 'High' ? 'bg-danger' : priority === 'Medium' ? 'bg-warning' : 'bg-secondary'}`}>
          {priority}
        </span>
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      sorter: (a, b) => safeStringCompare(a.assigned_to, b.assigned_to),
      ...getColumnSearchProps('assigned_to'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {/* <Button
            type="link"
            icon={<FaEye />}
            onClick={(e) => {
              e.stopPropagation();
              console.log('View', record);
            }}
          /> */}
          <Button
            type="link"
            icon={<FaEdit />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          />
          {/* <Popconfirm
            title="Are you sure you want to delete this maintenance request?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger
              onClick={(e) => e.stopPropagation()}
            >
              Delete
            </Button>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid p-1 position-relative" style={{ minHeight: "100vh" }}>
      {/* Top Navigation Bar - Breadcrumb Only */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>

      {/* Title and Description */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h2 className="mb-1">Maintenance/Requests</h2>
          <p className="mt-0 text-muted">Log and track maintenance requests.</p>
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="Maintenance_Requests_Report"
            title="Maintenance Requests Report"
            reportType="maintenance-requests"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            loading={loading}
          >
            Schedule New Maintenance
          </Button>
        </div>
      </div>

      {/* Ant Design Table */}
   
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
            rowKey="key"
          />
      

      {/* Drawer for Form */}
      <Drawer
        title={editingIndex ? "Edit Maintenance Request" : "Create Maintenance Request"}
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            status: 'Scheduled',
            priority: 'Medium',
          }}
        >
          <Form.Item
            name="id"
            label="Maintenance ID"
            rules={[{ required: true, message: 'Please enter maintenance ID' }]}
          >
            <Input placeholder="Enter maintenance ID (e.g., MNT-20250103-001)" />
          </Form.Item>

          <Form.Item
            name="asset"
            label="Asset"
            rules={[{ required: true, message: 'Please enter asset' }]}
          >
            <Input placeholder="Enter asset name (e.g., Company Van (AST-003))" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="Preventive">Preventive</Select.Option>
              <Select.Option value="Repair">Repair</Select.Option>
              <Select.Option value="Maintenance">Maintenance</Select.Option>
              <Select.Option value="Scheduled Inspection">Scheduled Inspection</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="scheduled"
            label="Scheduled Date"
            rules={[{ required: true, message: 'Please select scheduled date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD-MM-YYYY"
              placeholder="Select date (DD-MM-YYYY)"
            />
          </Form.Item>

          <Form.Item
            name="due"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD-MM-YYYY"
              placeholder="Select date (DD-MM-YYYY)"
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Select.Option value="Scheduled">Scheduled</Select.Option>
              <Select.Option value="In Progress">In Progress</Select.Option>
              <Select.Option value="Completed">Completed</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select placeholder="Select priority">
              <Select.Option value="Low">Low</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="High">High</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="assigned"
            label="Assigned To"
            rules={[{ required: true, message: 'Please enter assigned person/team' }]}
          >
            <Input placeholder="Enter assigned person/team (e.g., Mechanic Team)" />
          </Form.Item>

          {/* Submit Buttons */}
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              loading={loading}
              htmlType="submit"
            >
              {editingIndex ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default Requests;