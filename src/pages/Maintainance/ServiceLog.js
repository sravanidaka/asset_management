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

const ServiceLog = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingServiceLog, setEditingServiceLog] = useState(null);
  const [serviceLogs, setServiceLogs] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  // Fetch service logs from API
  const fetchServiceLogs = async () => {
    setLoading(true);
    try {
      console.log('Fetching service logs from API...');
      const response = await fetch('http://202.53.92.35:5004/api/maintenance/service-log', {
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
      } else if (result.service_logs && Array.isArray(result.service_logs)) {
        data = result.service_logs;
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
      
      setServiceLogs(dataWithKeys);
      message.success(`Service logs loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching service logs:", error);
      message.error(`Failed to load service logs: ${error.message}`);
      setServiceLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceLogs();
  }, []);

  // Handle table change for filters and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Handle create/update service log
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEditing = editingIndex !== null;
      
      console.log("=== SAVE SERVICE LOG DEBUG ===");
      console.log("Is Editing:", isEditing);
      console.log("Editing Index:", editingIndex);
      console.log("Editing Record:", editingRecord);
      console.log("Form Values:", values);
      
      // Client-side validation for required fields
      const requiredFields = ['asset_id', 'maintenance_type', 'service_date', 'vendor_technician', 'cost_incurred', 'downtime_hours', 'service_notes'];
      const missingFields = requiredFields.filter(field => !values[field]);
      
      if (missingFields.length > 0) {
        message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
        setLoading(false);
        return;
      }

      const serviceLogData = {
        asset_id: values.asset_id,
        maintenance_type: values.maintenance_type,
        service_date: values.service_date ? dayjs(values.service_date).format('YYYY-MM-DD') : '',
        next_scheduled_date: values.next_scheduled_date ? dayjs(values.next_scheduled_date).format('YYYY-MM-DD') : '',
        vendor_technician: values.vendor_technician,
        cost_incurred: values.cost_incurred,
        downtime_hours: values.downtime_hours,
        service_notes: values.service_notes,
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
        
        mainUrl = "http://202.53.92.35:5004/api/maintenance/service-log";
        apiData = { 
          id: recordId,
          ...serviceLogData 
        };
        
        console.log("=== UPDATE OPERATION ===");
        console.log("Update Record ID:", recordId);
        console.log("Update API Data:", apiData);
      } else {
        mainUrl = "http://202.53.92.35:5004/api/maintenance/service-log";
        apiData = { ...serviceLogData };
        
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
        
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} service log: ${errorData.message || errorText}`);
      }

      const result = await response.json();
      console.log("API Success Response:", result);
      
      if (result.success === false) {
        console.error("Backend returned success: false");
        message.error(`Operation failed: ${result.message || 'Unknown error'}`);
        return;
      }
      
      console.log(`✅ ${isEditing ? 'UPDATE' : 'CREATE'} operation completed successfully`);
      
      message.success(`Service log ${isEditing ? 'updated' : 'created'} successfully!`);
      
      // Refresh the table data immediately
      await fetchServiceLogs();
      
      form.resetFields();
      setDrawerVisible(false);
      setEditingIndex(null);
      setEditingRecord(null);
    } catch (error) {
      console.error(`Error ${editingIndex !== null ? 'updating' : 'creating'} service log:`, error);
      message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} service log: ${error.message}`);
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
      service_date: record.service_date ? dayjs(record.service_date) : undefined,
      next_scheduled_date: record.next_scheduled_date ? dayjs(record.next_scheduled_date) : undefined,
      vendor_technician: cleanValue(record.vendor_technician),
      cost_incurred: cleanValue(record.cost_incurred),
      downtime_hours: cleanValue(record.downtime_hours),
      service_notes: cleanValue(record.service_notes),
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
      content: "Are you sure you want to delete this service log?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/maintenance/service-log", {
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
            message.success("Service log deleted successfully!");
            await fetchServiceLogs(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete service log: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting service log:", error);
          message.error(`Failed to delete service log: ${error.message}`);
        }
      },
    });
  };

  // Export functionality
  const exportServiceLogs = () => {
    const csvContent = [
      ['S.No', 'Asset ID', 'Maintenance Type', 'Service Date', 'Next Scheduled Date', 'Vendor/Technician', 'Cost Incurred', 'Downtime Hours', 'Service Notes', 'Attachment'],
      ...serviceLogs.map((log, index) => [
        index + 1,
        log.asset_id || '',
        log.maintenance_type || '',
        log.service_date || '',
        log.next_scheduled_date || '',
        log.vendor_technician || '',
        log.cost_incurred || '',
        log.downtime_hours || '',
        log.service_notes || '',
        log.attachment || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `service_logs_${new Date().toISOString().split('T')[0]}.csv`);
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
      title: 'Service Date',
      dataIndex: 'service_date',
      key: 'service_date',
      sorter: (a, b) => new Date(a.service_date) - new Date(b.service_date),
      render: (date) => date ? dayjs(date).format('DD-MM-YYYY') : '-',
    },
    {
      title: 'Vendor/Technician',
      dataIndex: 'vendor_technician',
      key: 'vendor_technician',
      sorter: (a, b) => (a.vendor_technician || '').localeCompare(b.vendor_technician || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search vendor/technician"
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
        record.vendor_technician?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Cost Incurred',
      dataIndex: 'cost_incurred',
      key: 'cost_incurred',
      sorter: (a, b) => (a.cost_incurred || 0) - (b.cost_incurred || 0),
      render: (cost) => cost ? `₹${cost}` : '-',
    },
    {
      title: 'Downtime Hours',
      dataIndex: 'downtime_hours',
      key: 'downtime_hours',
      sorter: (a, b) => (a.downtime_hours || 0) - (b.downtime_hours || 0),
      render: (hours) => hours ? `${hours}h` : '-',
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
          <h2 className="mb-1">Maintenance/Service Call Log</h2>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Service Log
          </button>
          <button 
            className="btn btn-success px-4"
            onClick={exportServiceLogs}
          >
            <FaDownload /> Export Logs
          </button>
        </div>
      </div>

      {/* Service Logs Table */}
    
          <Table
            columns={columns}
            dataSource={serviceLogs}
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
        title={editingIndex !== null ? "Edit Service Log" : "Add Service Log"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
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
                name="service_date"
                label="Service Date"
                rules={[{ required: true, message: "Please select service date" }]}
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
                name="next_scheduled_date"
                label="Next Scheduled Date"
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
                name="vendor_technician"
                label="Vendor/Technician"
                rules={[{ required: true, message: "Please enter vendor/technician" }]}
              >
                <Input placeholder="Enter vendor/technician name" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cost_incurred"
                label="Cost Incurred"
                rules={[{ required: true, message: "Please enter cost incurred" }]}
              >
                <InputNumber 
                  placeholder="Enter cost incurred (e.g., 5000.00)" 
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="downtime_hours"
                label="Downtime Hours"
                rules={[{ required: true, message: "Please enter downtime hours" }]}
              >
                <InputNumber 
                  placeholder="Enter downtime hours (e.g., 4)" 
                  style={{ width: '100%' }}
                  min={0}
                  step={0.1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="attachment"
                label="Attachment"
              >
                <Input placeholder="Enter attachment filename (e.g., report_mnt001.pdf)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="service_notes"
                label="Service Notes"
                rules={[{ required: true, message: "Please enter service notes" }]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Enter detailed service notes"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={onReset} disabled={loading}>Reset</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingIndex !== null ? 'Update Service Log' : 'Add Service Log'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default ServiceLog;