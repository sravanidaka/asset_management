import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { Table, Input, Button, Space, Drawer, Form, Select, DatePicker, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { formatDateForAPI, parseDateForDatePicker, formatDateForDisplay } from '../../utils/dateUtils';
import CustomBreadcrumb from '../../components/Breadcrumb';
import BackNavigation from '../../components/BackNavigation';
import ExportButton from '../../components/ExportButton';
import { safeStringCompare, safeDateCompare } from '../../utils/tableUtils';

const History = () => {
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

  // Fetch maintenance records from API
  const fetchMaintenanceRecords = async () => {
    setLoading(true);
    try {
      console.log('Fetching maintenance history from API...');
      const response = await fetch('http://202.53.92.35:5004/api/maintenance/history',{
         headers: {
            "x-access-token":  sessionStorage.getItem("token"),
          }
      });
      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        
        // Handle different response formats
        let records = [];
        if (Array.isArray(data)) {
          records = data;
        } else if (data && Array.isArray(data.history)) {
          records = data.history;
        } else if (data && Array.isArray(data.data)) {
          records = data.data;
        } else if (data && Array.isArray(data.records)) {
          records = data.records;
        } else if (data && Array.isArray(data.results)) {
          records = data.results;
        } else {
          console.warn('Unexpected data format:', data);
          console.warn('Data structure:', JSON.stringify(data, null, 2));
          records = [];
        }
        
        const dataWithKeys = records.map((item, index) => ({
          ...item,
          key: item.id || item.key || index,
        }));
        setDataSource(dataWithKeys);
        setPagination(prev => ({ ...prev, total: dataWithKeys.length }));
        console.log('Data loaded successfully:', dataWithKeys.length, 'items');
      } else {
        console.log('API failed, no data available');
        setDataSource([]);
        setPagination(prev => ({ ...prev, total: 0 }));
        message.info("No maintenance history found");
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      message.error("Failed to load maintenance history");
      setDataSource([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRecords();
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

      const apiData = {
        id: editingIndex !== null ? editingRecord?.id : values.id,
        asset_id: values.asset_id,
        type: values.type,
        status: values.status,
        date_from: formatDateForAPI(values.date_from),
        date_to: formatDateForAPI(values.date_to)
      };

      // Validate required fields
      const requiredFields = ['asset_id', 'type', 'status', 'date_from', 'date_to'];
      const missingFields = requiredFields.filter(field => !values[field] || values[field] === '');
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        message.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      console.log('Submitting maintenance history:', apiData);
      console.log('Form values:', values);
      console.log('Is editing:', editingIndex !== null);
      console.log('History ID being sent:', apiData.id);
      console.log('Editing index value:', editingIndex);
      console.log('Original record being edited:', editingRecord);

      let response;
      if (editingIndex !== null) {
        // Update existing maintenance history
        console.log('Sending PUT request to update maintenance history...');
        console.log('Update data being sent:', apiData);
        
        try {
          response = await fetch('http://202.53.92.35:5004/api/maintenance/history', {
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
          response = await fetch('http://202.53.92.35:5004/api/maintenance/history', {
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
        // Create new maintenance history
        console.log('Sending POST request to create maintenance history...');
        response = await fetch('http://202.53.92.35:5004/api/maintenance/history', {
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
        message.success(editingIndex !== null ? 'Maintenance history updated successfully' : 'Maintenance history created successfully');
        setDrawerVisible(false);
        form.resetFields();
        setEditingIndex(null);
        setEditingRecord(null);
        
        // Force refresh the data
        console.log('Refreshing maintenance records after successful operation...');
        await fetchMaintenanceRecords();
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
        
        message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} maintenance history: ${errorMessage}`);
        
        // Log the data that caused the error
        console.error('Data that caused the error:', apiData);
      }
    } catch (error) {
      console.error('Error saving maintenance history:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response.data);
        message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} maintenance history: ${error.response.data?.message || error.response.data?.error || 'Database error'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        message.error('Network error: Unable to connect to the server');
      } else {
        console.error('Error message:', error.message);
        message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} maintenance history: ${error.message}`);
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
      id: record.id,
      asset_id: record.asset_id,
      type: record.type,
      status: record.status,
      date_from: parseDateForDatePicker(record.date_from),
      date_to: parseDateForDatePicker(record.date_to)
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
      const response = await fetch('http://202.53.92.35:5004/api/maintenance/history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "x-access-token":  sessionStorage.getItem("token"),
        },
        body: JSON.stringify({
          id: record.id
        }),
      });

      if (response.ok) {
        message.success('Maintenance record deleted successfully');
        console.log('Refreshing maintenance records after successful deletion...');
        await fetchMaintenanceRecords();
      } else {
        message.error('Failed to delete maintenance record');
      }
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      message.error('Failed to delete maintenance record');
    }
  };

  // Handle create new
  const handleCreate = () => {
    console.log('Creating new maintenance history');
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
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => safeStringCompare(a.id, b.id),
      ...getColumnSearchProps('id'),
    },
    {
      title: 'Asset ID',
      dataIndex: 'asset_id',
      key: 'asset_id',
      sorter: (a, b) => safeStringCompare(a.asset_id, b.asset_id),
      ...getColumnSearchProps('asset_id'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => safeStringCompare(a.type, b.type),
      filters: [
        { text: 'Preventive', value: 'Preventive' },
        { text: 'Corrective', value: 'Corrective' },
        { text: 'Scheduled', value: 'Scheduled' },
        { text: 'Emergency', value: 'Emergency' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Date From',
      dataIndex: 'date_from',
      key: 'date_from',
      sorter: (a, b) => safeDateCompare(a.date_from, b.date_from),
      ...getColumnSearchProps('date_from'),
      render: (date) => formatDateForDisplay(date) || '-',
    },
    {
      title: 'Date To',
      dataIndex: 'date_to',
      key: 'date_to',
      sorter: (a, b) => safeDateCompare(a.date_to, b.date_to),
      ...getColumnSearchProps('date_to'),
      render: (date) => formatDateForDisplay(date) || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => safeStringCompare(a.status, b.status),
      filters: [
        { text: 'Completed', value: 'Completed' },
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Scheduled', value: 'Scheduled' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Cancelled', value: 'Cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <span className={`badge ${status === 'Completed' ? 'bg-success' : status === 'In Progress' ? 'bg-warning' : 'bg-info'}`}>
          {status}
        </span>
      ),
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
            title="Are you sure you want to delete this maintenance record?"
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
              icon={<FaTrash />}
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
          <h2 className="mb-1">History</h2>
          <p className="mt-0 text-muted">View the complete history of assets.</p>
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="Maintenance_History_Report"
            title="Maintenance History Report"
            reportType="maintenance-history"
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
            Add History Record
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
        title={editingIndex ? "Edit Maintenance History" : "Create Maintenance History"}
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
            type: 'Preventive',
          }}
        >
          <Form.Item
            name="asset_id"
            label="Asset ID"
            rules={[{ required: true, message: 'Please enter asset ID' }]}
          >
            <Input placeholder="Enter asset ID (e.g., A001)" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="Preventive">Preventive</Select.Option>
              <Select.Option value="Corrective">Corrective</Select.Option>
              <Select.Option value="Scheduled">Scheduled</Select.Option>
              <Select.Option value="Emergency">Emergency</Select.Option>
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
              <Select.Option value="Scheduled">Scheduled</Select.Option>
              <Select.Option value="Pending">Pending</Select.Option>
              <Select.Option value="Cancelled">Cancelled</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date_from"
            label="Date From"
            rules={[{ required: true, message: 'Please select date from' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD-MM-YYYY"
              placeholder="Select date (DD-MM-YYYY)"
            />
          </Form.Item>

          <Form.Item
            name="date_to"
            label="Date To"
            rules={[{ required: true, message: 'Please select date to' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD-MM-YYYY"
              placeholder="Select date (DD-MM-YYYY)"
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default History;