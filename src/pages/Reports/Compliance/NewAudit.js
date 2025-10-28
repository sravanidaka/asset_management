import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../../App.css";
import { FaSearch, FaEdit, FaTrash, FaEye, FaArrowLeft } from "react-icons/fa";
import CustomBreadcrumb from '../../../components/Breadcrumb';
import BackNavigation from '../../../components/BackNavigation';
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  message,
  Popconfirm,
  Table,
  DatePicker,
} from "antd";
import { SearchOutlined, PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import { api } from '../../../config/api';
import { isValidDate, isDateInFuture, isDateInPast, isDateBefore, formatDateForDisplay } from '../../../utils/dateUtils';
import { formatDateForDB, parseDateFromDB } from "../../../utils/dateUtils";
import ExportButton from '../../../components/ExportButton';
import { safeStringCompare, safeDateCompare } from '../../../utils/tableUtils';

const { Option } = Select;
const { RangePicker } = DatePicker;

const NewAudit = ({ setActiveScreen }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch new audit records from API
  const fetchNewAuditRecords = async () => {
    try {
      setLoading(true);
      
      console.log('=== FETCHING NEW AUDIT RECORDS ===');
      const result = await api.getComplianceAudit();
      
      console.log("New Audit API Response:", result);
      console.log("Response type:", typeof result);
      console.log("Response keys:", Object.keys(result || {}));
      
      let newAuditData = [];
      
      // Handle different response formats
      if (result.success && Array.isArray(result.data)) {
        newAuditData = result.data;
        console.log("Using success.data format, found", newAuditData.length, "new audit records");
      } else if (Array.isArray(result.data)) {
        newAuditData = result.data;
        console.log("Using direct array format, found", newAuditData.length, "new audit records");
      } else if (result.data?.data && Array.isArray(result.data.data)) {
        newAuditData = result.data.data;
        console.log("Using data.data format, found", newAuditData.length, "new audit records");
      } else {
        console.warn("Unexpected API response format:", result.data);
        const arrayProperties = Object.values(result.data || {}).filter(Array.isArray);
        if (arrayProperties.length > 0) {
          newAuditData = arrayProperties[0];
        } else {
          setDataSource([]);
          return;
        }
      }
      
      // Map data with keys and rename fields
      const dataWithKeys = newAuditData.map((item, index) => ({
        ...item,
        key: item.id || index.toString(),
        audit_title: item.audit_title || '',
        policy: item.policy || '',
        audit_type: item.audit_type || '',
        assigned_to: item.assigned_to || '',
        due_date: item.due_date || '',
        scope: item.scope || '',
        description: item.description || '',
        status: item.status || '',
        created_by: item.created_by || '',
        created_date: item.created_date || '',
        checklist_items: item.checklist_items || '',
        linked_policies: item.linked_policies || '',
      }));
      
      console.log("Final processed new audit records:", dataWithKeys);
      setDataSource(dataWithKeys);
      
    } catch (error) {
      console.error("Error fetching new audit records:", error);
      
      if (error.response?.status === 401) {
        message.error("Unauthorized: Token expired or invalid. Please log in again.");
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.warning("⚠️ API server is not running. Please check backend connectivity.");
      } else {
        message.error("Failed to fetch new audit records: " + (error.message || "Unknown error"));
      }
      
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewAuditRecords();
  }, []);

  // Handle table change (pagination, filters, sorting)
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Table columns with sorting and filtering
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

  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (text, record, index) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Audit Title",
      dataIndex: "audit_title",
      key: "audit_title",
      sorter: (a, b) => safeStringCompare(a.audit_title, b.audit_title),
      ...getColumnSearchProps('audit_title'),
    },
    {
      title: "Policy",
      dataIndex: "policy",
      key: "policy",
      sorter: (a, b) => safeStringCompare(a.policy, b.policy),
      ...getColumnSearchProps('policy'),
    },
    {
      title: "Audit Type",
      dataIndex: "audit_type",
      key: "audit_type",
      sorter: (a, b) => safeStringCompare(a.audit_type, b.audit_type),
      filters: [
        { text: 'Internal', value: 'Internal' },
        { text: 'External', value: 'External' },
        { text: 'Regulatory', value: 'Regulatory' },
        { text: 'Compliance', value: 'Compliance' },
      ],
      onFilter: (value, record) => record.audit_type === value,
      render: (type) => {
        const typeMap = {
          'Internal': { color: 'primary' },
          'External': { color: 'info' },
          'Regulatory': { color: 'warning' },
          'Compliance': { color: 'success' },
        };
        const typeInfo = typeMap[type] || { color: 'secondary' };
        return (
          <span className={`badge bg-${typeInfo.color} ${typeInfo.color === 'warning' ? 'text-dark' : ''}`}>
            {type}
          </span>
        );
      },
    },
    {
      title: "Assigned To",
      dataIndex: "assigned_to",
      key: "assigned_to",
      sorter: (a, b) => safeStringCompare(a.assigned_to, b.assigned_to),
      ...getColumnSearchProps('assigned_to'),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      sorter: (a, b) => safeDateCompare(a.due_date, b.due_date),
      ...getColumnSearchProps('due_date'),
      render: (date) => formatDateForDisplay(date) || '-',
    },
    {
      title: "Scope",
      dataIndex: "scope",
      key: "scope",
      sorter: (a, b) => safeStringCompare(a.scope, b.scope),
      ...getColumnSearchProps('scope'),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => safeStringCompare(a.status, b.status),
      filters: [
        { text: 'Draft', value: 'Draft' },
        { text: 'Active', value: 'Active' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Cancelled', value: 'Cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusMap = {
          'Active': { color: 'success' },
          'Draft': { color: 'secondary' },
          'Completed': { color: 'info' },
          'Cancelled': { color: 'danger' },
        };
        const statusInfo = statusMap[status] || { color: 'secondary' };
        return (
          <span className={`badge bg-${statusInfo.color} ${statusInfo.color === 'info' ? 'text-dark' : ''}`}>
            {status}
          </span>
        );
      },
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      sorter: (a, b) => safeStringCompare(a.created_by, b.created_by),
      ...getColumnSearchProps('created_by'),
    },
    {
      title: "Created Date",
      dataIndex: "created_date",
      key: "created_date",
      sorter: (a, b) => safeDateCompare(a.created_date, b.created_date),
      ...getColumnSearchProps('created_date'),
      render: (date) => formatDateForDisplay(date) || '-',
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {/* <Button 
            type="default" 
            size="small" 
            icon={<FaEye />}
            title="View"
            onClick={(e) => {
              e.stopPropagation();
              console.log('View clicked for record:', record);
            }}
          /> */}
          <Button 
            type="default" 
            size="small" 
            icon={<FaEdit />}
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              showDrawer(record);
            }}
          />
          {/* <Popconfirm
            title="Are you sure to delete this audit?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              size="small" 
              icon={<FaTrash />}
              title="Delete"
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  const showDrawer = (record = null) => {
    console.log("Opening drawer for new audit:", record);
    setEditingRecord(record);
    if (record) {
      const formData = {
        audit_title: record.audit_title,
        policy: record.policy,
        audit_type: record.audit_type,
        assigned_to: record.assigned_to,
        due_date: record.due_date,
        scope: record.scope,
        description: record.description,
        status: record.status,
        created_by: record.created_by,
        created_date: record.created_date,
        checklist_items: record.checklist_items,
        linked_policies: record.linked_policies,
      };
      
      console.log("Setting form values:", formData);
      form.setFieldsValue(formData);
    } else {
      form.resetFields();
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setEditingRecord(null);
    setSubmitting(false);
    form.resetFields();
  };

  const handleDelete = async (auditId) => {
    try {
      const result = await api.deleteComplianceAudit({ id: auditId });
      
      if (result.success) {
        message.success("Audit deleted successfully");
        fetchNewAuditRecords(); // Refresh the list
      } else {
        message.error(`Failed to delete audit: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting audit:", error);
      message.error("Failed to delete audit. Please check your connection and try again.");
    }
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    console.log("Form validation passed, proceeding with submission");
    setSubmitting(true);
    message.loading("Saving audit...", 0);
    
    // Validate required fields
    const requiredFields = ['audit_title', 'policy', 'audit_type', 'assigned_to', 'due_date', 'scope'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
      setSubmitting(false);
      return;
    }
    
    try {
      if (editingRecord) {
        // Update existing audit
        console.log("Updating audit:", editingRecord);
        
        const updateData = {
          id: editingRecord.id,
          audit_title: values.audit_title?.toString() || '',
          policy: values.policy?.toString() || '',
          audit_type: values.audit_type?.toString() || '',
          assigned_to: values.assigned_to?.toString() || '',
          due_date: values.due_date ? formatDateForDB(values.due_date) : '',
          scope: values.scope?.toString() || '',
          description: values.description?.toString() || '',
          status: values.status?.toString() || '',
          created_by: values.created_by?.toString() || '',
          created_date: values.created_date ? formatDateForDB(values.created_date) : '',
          checklist_items: values.checklist_items?.toString() || '',
          linked_policies: values.linked_policies?.toString() || '',
        };
        
        console.log("Update data being sent:", updateData);
        
        const result = await api.updateComplianceAudit(updateData);
        
        console.log("Update response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Audit updated successfully!");
        fetchNewAuditRecords(); // Refresh the list
      } else {
        // Add new audit
        console.log("Creating new audit");
        
        const createData = {
          audit_title: values.audit_title?.toString() || '',
          policy: values.policy?.toString() || '',
          audit_type: values.audit_type?.toString() || '',
          assigned_to: values.assigned_to?.toString() || '',
          due_date: values.due_date ? formatDateForDB(values.due_date) : '',
          scope: values.scope?.toString() || '',
          description: values.description?.toString() || '',
          status: values.status?.toString() || 'Draft',
          created_by: values.created_by?.toString() || '',
          created_date: values.created_date ? formatDateForDB(values.created_date) : '',
          checklist_items: values.checklist_items?.toString() || '',
          linked_policies: values.linked_policies?.toString() || '',
        };
        
        console.log("Create data being sent:", createData);
        
        const result = await api.createComplianceAudit(createData);
        
        console.log("Create response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Audit created successfully!");
        fetchNewAuditRecords(); // Refresh the list
      }
      onClose();
    } catch (error) {
      console.error("Error saving audit:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      message.destroy(); // Clear loading message
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Bad Request - Invalid data format";
        console.error("400 Bad Request details:", error.response?.data);
        message.error(`❌ Invalid data: ${errorMessage}`);
      } else if (error.response?.status === 500) {
        console.error("500 Internal Server Error details:", error.response?.data);
        const serverError = error.response?.data?.message || error.response?.data?.error || "Internal server error";
        message.error(`❌ Server Error (500): ${serverError}`);
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please start the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save audit: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save audit. Please check your connection and try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle create new
  const handleCreate = () => {
    form.resetFields();
    setEditingRecord(null);
    setOpen(true);
  };

  // Handle back navigation
  const handleBack = () => {
    if (setActiveScreen) {
      setActiveScreen('compliance');
    } else {
      navigate('/compliance');
    }
  };

  return (
    <div className="container-fluid p-1">
      {/* Top Navigation Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button onClick={handleBack} type="text" icon={<FaArrowLeft />} />
        <CustomBreadcrumb />
      </div>

      {/* Multi-Step Progress Bar */}
      <div className="card mb-4" style={{boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '8px'}}>
        <div className="card-body" style={{padding: '20px'}}>
          <div className="d-flex justify-content-center align-items-center">
            <div className="d-flex align-items-center" style={{gap: '40px'}}>
              <div className="d-flex align-items-center" style={{cursor: 'pointer'}} onClick={() => navigate('/audit-plan')}>
                <div className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', marginRight: '8px'}}>
                  <i className="fas fa-clipboard-check" style={{fontSize: '14px'}}></i>
                </div>
                <span className="text-muted" style={{fontSize: '14px', fontWeight: '500'}}>Plan</span>
              </div>
              <div className="d-flex align-items-center" style={{cursor: 'pointer'}} onClick={() => navigate('/assign-team')}>
                <div className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', marginRight: '8px'}}>
                  <i className="fas fa-users" style={{fontSize: '14px'}}></i>
                </div>
                <span className="text-muted" style={{fontSize: '14px', fontWeight: '500'}}>Assign</span>
              </div>
              <div className="d-flex align-items-center" style={{cursor: 'pointer'}} onClick={() => navigate('/audit-execute')}>
                <div className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', marginRight: '8px'}}>
                  <i className="fas fa-play" style={{fontSize: '14px'}}></i>
                </div>
                <span className="text-muted" style={{fontSize: '14px', fontWeight: '500'}}>Execute</span>
              </div>
              <div className="d-flex align-items-center" style={{cursor: 'pointer'}} onClick={() => navigate('/audit-review')}>
                <div className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', marginRight: '8px'}}>
                  <i className="fas fa-eye" style={{fontSize: '14px'}}></i>
          </div>
                <span className="text-muted" style={{fontSize: '14px', fontWeight: '500'}}>Review</span>
          </div>
              <div className="d-flex align-items-center" style={{cursor: 'pointer'}} onClick={() => navigate('/compliance')}>
                <div className="rounded-circle bg-light text-muted d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', marginRight: '8px'}}>
                  <i className="fas fa-times" style={{fontSize: '14px'}}></i>
          </div>
                <span className="text-muted" style={{fontSize: '14px', fontWeight: '500'}}>Close</span>
          </div>
          </div>
          </div>
          </div>
      </div>

      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h2 className="mb-1 fw-bold">New Audit Management</h2>
          <p className="mt-0 text-muted">Create and manage new compliance audits.</p>
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="New_Audits_Report"
            title="New Audits Report"
            reportType="new-audits"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            style={{backgroundColor: '#28a745', borderColor: '#28a745'}}
          >
            Create New Audit
          </Button>
        </div>
      </div>

      <div className="card af-card mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">New Audits</h5>
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

      {/* Drawer Form */}
      <Drawer
        title={editingRecord ? "Update Audit" : "Create New Audit"}
        width={800}
        onClose={onClose}
        open={open}
        destroyOnClose
      >
        <Form
          layout="vertical"
          hideRequiredMark
          form={form}
          onFinish={onFinish}
          onFinishFailed={(errorInfo) => {
            console.log("Form validation failed:", errorInfo);
            message.error("Please fill in all required fields correctly");
          }}
        >
          {/* Audit Details */}
          <h5>Audit Details</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="audit_title"
                label="Audit Title"
                rules={[
                  { required: true, message: "Please enter audit title" },
                  { min: 2, message: "Audit title must be at least 2 characters" },
                  { max: 100, message: "Audit title cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., Q3 Compliance Audit" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="policy"
                label="Policy"
                rules={[
                  { required: true, message: "Please enter policy" },
                  { max: 100, message: "Policy cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., Data Privacy Regulation" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="audit_type"
                label="Audit Type"
                rules={[
                  { required: true, message: "Please select audit type" }
                ]}
              >
                <Select placeholder="Select audit type">
                  <Option value="Internal">Internal</Option>
                  <Option value="External">External</Option>
                  <Option value="Regulatory">Regulatory</Option>
                  <Option value="Compliance">Compliance</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="assigned_to"
                label="Assigned To"
                rules={[
                  { required: true, message: "Please enter assigned to" },
                  { max: 50, message: "Assigned to cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Compliance Team" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="due_date"
                label="Due Date"
                rules={[
                  { required: true, message: "Please select due date" },
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (!isValidDate(value)) {
                        return Promise.reject(new Error('Please enter a valid date'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
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
                name="scope"
                label="Scope"
                rules={[
                  { required: true, message: "Please enter scope" },
                  { max: 100, message: "Scope cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., All Sites" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[
                  { max: 20, message: "Status cannot exceed 20 characters" }
                ]}
              >
                <Select placeholder="Select status">
                  <Option value="Draft">Draft</Option>
                  <Option value="Active">Active</Option>
                  <Option value="Completed">Completed</Option>
                  <Option value="Cancelled">Cancelled</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { max: 500, message: "Description cannot exceed 500 characters" }
                ]}
              >
                <Input.TextArea 
                  rows={4}
                  placeholder="e.g., Brief summary of audit objectives and scope."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Additional Information */}
          <h5>Additional Information</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="created_by"
                label="Created By"
                rules={[
                  { max: 50, message: "Created by cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Admin User" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="created_date"
                label="Created Date"
                rules={[
                  { 
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      if (!isValidDate(value)) {
                        return Promise.reject(new Error('Please enter a valid date'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
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
                name="checklist_items"
                label="Checklist Items"
                rules={[
                  { max: 200, message: "Checklist items cannot exceed 200 characters" }
                ]}
              >
                <Input placeholder="e.g., Asset Tagging, Access Reviews" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="linked_policies"
                label="Linked Policies"
                rules={[
                  { max: 200, message: "Linked policies cannot exceed 200 characters" }
                ]}
              >
                <Input placeholder="e.g., Data Privacy, Security Policy" />
              </Form.Item>
            </Col>
          </Row>

          {/* Submit Buttons */}
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="btn-add"
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={submitting}
              >
                {editingRecord ? "Update Audit" : "Create Audit"}
              </Button>
            </Space>
      </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default NewAudit;