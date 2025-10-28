import React, { useState, useEffect } from 'react';
import CustomBreadcrumb from '../../components/Breadcrumb';
import BackNavigation from '../../components/BackNavigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  message,
  InputNumber,
  Table,
  Drawer,
  Space,
  Modal,
  DatePicker,
} from 'antd';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

const Schedule = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  // Fetch schedules from API
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      console.log('Fetching schedules from API...');
      const response = await fetch('http://202.53.92.35:5004/api/maintenance/schedule', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-access-token": sessionStorage.getItem("token"),
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
      } else if (result.schedules && Array.isArray(result.schedules)) {
        data = result.schedules;
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
      
      setSchedules(dataWithKeys);
      message.success(`Schedules loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      message.error(`Failed to load schedules: ${error.message}`);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Handle table change for filters and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Handle create/update schedule
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingIndex !== null;
      
      console.log("=== SAVE SCHEDULE DEBUG ===");
      console.log("Is Editing:", isEditing);
      console.log("Editing Index:", editingIndex);
      console.log("Editing Record:", editingRecord);
      console.log("Form Values:", values);
      
      // Client-side validation for required fields
      const requiredFields = ['asset_id', 'maintenance_type', 'description', 'scheduled_date', 'due_date', 'priority', 'assigned_to', 'location', 'estimated_cost', 'vendor', 'notification'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        setLoading(false);
        return;
      }

      const scheduleData = {
        asset_id: values.asset_id,
        maintenance_type: values.maintenance_type,
        description: values.description,
        scheduled_date: values.scheduled_date ? dayjs(values.scheduled_date).format('YYYY-MM-DD') : '',
        due_date: values.due_date ? dayjs(values.due_date).format('YYYY-MM-DD') : '',
        priority: values.priority,
        assigned_to: values.assigned_to,
        location: values.location,
        estimated_cost: values.estimated_cost,
        vendor: values.vendor,
        notification: values.notification,
        attachment: values.attachment || ''
      };

      // Call API directly
      let mainUrl;
      let apiData;
      
      if (isEditing) {
        const recordId = editingRecord?.id || editingRecord?.key || editingIndex;
        
        if (!recordId) {
          console.error("ERROR: No record ID found for update operation!");
          message.error("Error: Cannot update - no record ID found!");
          setLoading(false);
          return;
        }
        
        mainUrl = "http://202.53.92.35:5004/api/maintenance/schedule";
        apiData = { 
          id: recordId,
          ...scheduleData 
        };
        
        console.log("=== UPDATE OPERATION ===");
        console.log("Update Record ID:", recordId);
        console.log("Update API Data:", apiData);
      } else {
        mainUrl = "http://202.53.92.35:5004/api/maintenance/schedule";
        apiData = { ...scheduleData };
        
        console.log("=== CREATE OPERATION ===");
        console.log("Create API Data:", apiData);
      }
      
      const method = isEditing ? "PUT" : "POST";

      console.log("API URL:", mainUrl);
      console.log("API Method:", method);

      const response = await fetch(mainUrl, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify(apiData),
      });

      console.log("Response Status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          errorData = { message: errorText };
        }
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} schedule: ${errorData.message || errorText}`);
      }

      const result = await response.json();
      console.log("API Success Response:", result);
      
      if (result.success === false) {
        console.error("Backend returned success: false");
        message.error(`Operation failed: ${result.message || 'Unknown error'}`);
        return;
      }
      
      console.log(`✅ ${isEditing ? 'UPDATE' : 'CREATE'} operation completed successfully`);
      
      message.success(`Schedule ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchSchedules();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} schedule:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} schedule: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open drawer for create
  const handleCreate = () => {
    form.resetFields();
    setEditingIndex(null);
    setEditingRecord(null);
    setDrawerVisible(true);
  };

  // Handle edit method
  const handleEdit = (record) => {
    console.log("=== EDIT RECORD DEBUG ===");
    console.log("Edit record:", record);
    
    // Helper function to clean values (remove N/A, null, undefined)
    const cleanValue = (value) => {
      if (value === 'N/A' || value === null || value === undefined || value === '') {
        return undefined; // Return undefined so form field shows as empty
      }
      return value;
    };
    
    // Set form values with cleaned data
    const formValues = {
      asset_id: cleanValue(record.asset_id),
      maintenance_type: cleanValue(record.maintenance_type),
      description: cleanValue(record.description),
      scheduled_date: record.scheduled_date ? dayjs(record.scheduled_date) : undefined,
      due_date: record.due_date ? dayjs(record.due_date) : undefined,
      priority: cleanValue(record.priority),
      assigned_to: cleanValue(record.assigned_to),
      location: cleanValue(record.location),
      estimated_cost: cleanValue(record.estimated_cost),
      vendor: cleanValue(record.vendor),
      notification: cleanValue(record.notification),
      attachment: cleanValue(record.attachment)
    };
    
    console.log("Form values being set:", formValues);
    
    form.setFieldsValue(formValues);
    
    const recordId = record.id || record.key;
    console.log("Setting editing index to:", recordId);
    
    setEditingIndex(recordId);
    setEditingRecord(record); // Store the original record for updates
    setDrawerVisible(true);
  };

  // Handle delete method
  const handleDelete = (record) => {
    console.log("Delete record:", record);
    console.log("Record ID:", record.id || record.key);
    
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this schedule?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/maintenance/schedule", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": sessionStorage.getItem("token"),
            },
            body: JSON.stringify({ id: deleteId }),
          });
          
          console.log("Delete response status:", response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log("Delete response data:", result);
            message.success("Schedule deleted successfully!");
            await fetchSchedules(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete schedule: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting schedule:", error);
          message.error(`Failed to delete schedule: ${error.message}`);
        }
      },
    });
  };

  // Export functionality
  const exportSchedules = () => {
    const csvContent = [
      ['S.No', 'Asset ID', 'Maintenance Type', 'Description', 'Scheduled Date', 'Due Date', 'Priority', 'Assigned To', 'Location', 'Estimated Cost', 'Vendor', 'Notification', 'Attachment'],
      ...schedules.map((schedule, index) => [
        index + 1,
        schedule.asset_id || '',
        schedule.maintenance_type || '',
        schedule.description || '',
        schedule.scheduled_date || '',
        schedule.due_date || '',
        schedule.priority || '',
        schedule.assigned_to || '',
        schedule.location || '',
        schedule.estimated_cost || '',
        schedule.vendor || '',
        schedule.notification || '',
        schedule.attachment || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `schedules_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table columns
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
      title: 'Asset ID',
      dataIndex: 'asset_id',
      key: 'asset_id',
      sorter: (a, b) => (a.asset_id || '').localeCompare(b.asset_id || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search asset ID"
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.asset_id?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Maintenance Type',
      dataIndex: 'maintenance_type',
      key: 'maintenance_type',
      sorter: (a, b) => (a.maintenance_type || '').localeCompare(b.maintenance_type || ''),
      filters: [
        { text: 'Preventive', value: 'Preventive' },
        { text: 'Corrective', value: 'Corrective' },
        { text: 'Calibration', value: 'Calibration' },
        { text: 'AMC', value: 'AMC' },
        { text: 'Repair', value: 'Repair' },
      ],
      onFilter: (value, record) => record.maintenance_type === value,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
      ellipsis: true,
    },
    {
      title: 'Scheduled Date',
      dataIndex: 'scheduled_date',
      key: 'scheduled_date',
      sorter: (a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date),
      render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : '-',
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      sorter: (a, b) => new Date(a.due_date) - new Date(b.due_date),
      render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : '-',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => (a.priority || '').localeCompare(b.priority || ''),
      render: (priority) => (
        <span className={`badge ${
          priority === 'High' ? 'bg-danger' : 
          priority === 'Medium' ? 'bg-warning text-dark' : 
          'bg-success'
        }`}>
          {priority}
        </span>
      ),
      filters: [
        { text: 'High', value: 'High' },
        { text: 'Medium', value: 'Medium' },
        { text: 'Low', value: 'Low' },
      ],
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to',
      key: 'assigned_to',
      sorter: (a, b) => (a.assigned_to || '').localeCompare(b.assigned_to || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search assigned to"
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.assigned_to?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Estimated Cost',
      dataIndex: 'estimated_cost',
      key: 'estimated_cost',
      sorter: (a, b) => (a.estimated_cost || 0) - (b.estimated_cost || 0),
      render: (cost) => cost ? `₹${cost}` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="default" size="small" icon={<FaEdit />} onClick={() => handleEdit(record)} />
          {/* <Button type="primary" danger size="small" icon={<FaTrash />} onClick={() => handleDelete(record)} /> */}
        </Space>
      ),
    },
  ];

  const onReset = () => {
    form.resetFields();
    setEditingIndex(null);
    setEditingRecord(null);
    setDrawerVisible(false);
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
      
      {/* Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <h2 className="mb-1">Schedule</h2>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Schedule
          </button>
          <button 
            className="btn btn-success px-4"
            onClick={exportSchedules}
          >
            <FaDownload /> Export Schedules
          </button>
        </div>
      </div>

      {/* Schedules Table */}
    
          <Table
            columns={columns}
            dataSource={schedules}
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
            rowKey="id"
          />
       

      {/* Drawer Form */}
      <Drawer
        title={editingIndex !== null ? "Edit Schedule" : "Add Schedule"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          {/* Asset Information */}
          <h5 className="mb-2">Asset Information</h5>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="asset_id"
                label="Asset ID"
                rules={[{ required: true, message: "Please select asset ID" }]}
              >
                <Select placeholder="Select asset ID">
                  <Option value="AST-001">AST-001</Option>
                  <Option value="AST-002">AST-002</Option>
                  <Option value="AST-003">AST-003</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Maintenance Details */}
          <h5 className="mb-2">Maintenance Details</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maintenance_type"
                label="Maintenance Type"
                rules={[{ required: true, message: "Please select maintenance type" }]}
              >
                <Select placeholder="Select maintenance type">
                  <Option value="Preventive">Preventive</Option>
                  <Option value="Corrective">Corrective</Option>
                  <Option value="Calibration">Calibration</Option>
                  <Option value="AMC">AMC</Option>
                  <Option value="Repair">Repair</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: "Please select priority" }]}
              >
                <Select placeholder="Select priority">
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: "Please enter description" }]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Enter maintenance description"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="scheduled_date"
                label="Scheduled Date"
                rules={[{ required: true, message: "Please select scheduled date" }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD-MM-YYYY"
                  placeholder="Select date (DD-MM-YYYY)"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="due_date"
                label="Due Date"
                rules={[{ required: true, message: "Please select due date" }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD-MM-YYYY"
                  placeholder="Select date (DD-MM-YYYY)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assigned_to"
                label="Assigned To"
                rules={[{ required: true, message: "Please enter assigned to" }]}
              >
                <Input placeholder="Enter assigned to" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input placeholder="Enter location" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="estimated_cost"
                label="Estimated Cost"
                rules={[{ required: true, message: "Please enter estimated cost" }]}
              >
                <InputNumber 
                  placeholder="Enter estimated cost (e.g., 7500.00)" 
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vendor"
                label="Vendor"
                rules={[{ required: true, message: "Please enter vendor" }]}
              >
                <Input placeholder="Enter vendor name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="notification"
                label="Notification"
                rules={[{ required: true, message: "Please select notification" }]}
              >
                <Select placeholder="Select notification method">
                  <Option value="Email">Email</Option>
                  <Option value="SMS">SMS</Option>
                  <Option value="Email + In-app">Email + In-app</Option>
                  <Option value="SMS + Email">SMS + Email</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="attachment"
                label="Attachment"
              >
                <Input placeholder="Enter attachment filename (e.g., mnt_sched_001.pdf)" />
              </Form.Item>
            </Col>
          </Row>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={onReset} disabled={loading}>Reset</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingIndex !== null ? 'Update Schedule' : 'Add Schedule'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Schedule;