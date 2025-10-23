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

const AuditPlan = ({ setActiveScreen }) => {
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

  // Fetch audit plans from API
  const fetchAuditPlans = async () => {
    try {
      setLoading(true);
      
      console.log('=== FETCHING AUDIT PLANS ===');
      const result = await api.getComplianceAuditPlan();
      
      console.log("Audit Plans API Response:", result);
      console.log("Response type:", typeof result);
      console.log("Response keys:", Object.keys(result || {}));
      
      let auditPlansData = [];
      
      // Handle different response formats
      if (result.success && Array.isArray(result.data)) {
        auditPlansData = result.data;
        console.log("Using success.data format, found", auditPlansData.length, "audit plans");
      } else if (Array.isArray(result.data)) {
        auditPlansData = result.data;
        console.log("Using direct array format, found", auditPlansData.length, "audit plans");
      } else if (result.data?.data && Array.isArray(result.data.data)) {
        auditPlansData = result.data.data;
        console.log("Using data.data format, found", auditPlansData.length, "audit plans");
      } else {
        console.warn("Unexpected API response format:", result.data);
        const arrayProperties = Object.values(result.data || {}).filter(Array.isArray);
        if (arrayProperties.length > 0) {
          auditPlansData = arrayProperties[0];
        } else {
          setDataSource([]);
          return;
        }
      }
      
      // Map data with keys and rename fields
      const dataWithKeys = auditPlansData.map((item, index) => ({
        ...item,
        key: item.id || index.toString(),
        audit_title: item.audit_title || item.title || '',
        policy_id: item.policy_id || '',
        audit_type: item.audit_type || item.type || '',
        scope: item.scope || '',
        start_date: item.start_date || '',
        due_date: item.due_date || '',
        description: item.description || '',
      }));
      
      console.log("Final processed audit plans:", dataWithKeys);
      setDataSource(dataWithKeys);
      
    } catch (error) {
      console.error("Error fetching audit plans:", error);
      
      if (error.response?.status === 401) {
        message.error("Unauthorized: Token expired or invalid. Please log in again.");
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.warning("⚠️ API server is not running. Please check backend connectivity.");
      } else {
        message.error("Failed to fetch audit plans: " + (error.message || "Unknown error"));
      }
      
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditPlans();
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
      title: "Policy ID",
      dataIndex: "policy_id",
      key: "policy_id",
      sorter: (a, b) => safeStringCompare(a.policy_id, b.policy_id),
      ...getColumnSearchProps('policy_id'),
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
      ],
      onFilter: (value, record) => record.audit_type === value,
    },
    {
      title: "Scope",
      dataIndex: "scope",
      key: "scope",
      sorter: (a, b) => safeStringCompare(a.scope, b.scope),
      ...getColumnSearchProps('scope'),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      sorter: (a, b) => safeDateCompare(a.start_date, b.start_date),
      ...getColumnSearchProps('start_date'),
      render: (date) => formatDateForDisplay(date) || '-',
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            type="default" 
            size="small" 
            icon={<FaEye />}
            title="View"
            onClick={(e) => {
              e.stopPropagation();
              console.log('View clicked for record:', record);
            }}
          />
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
            title="Are you sure to delete this audit plan?"
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
    console.log("Opening drawer for audit plan:", record);
    setEditingRecord(record);
    if (record) {
      const formData = {
        audit_title: record.audit_title,
        policy_id: record.policy_id,
        audit_type: record.audit_type,
        scope: record.scope,
        start_date: record.start_date,
        due_date: record.due_date,
        description: record.description,
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

  const handleDelete = async (auditPlanId) => {
    try {
      const result = await api.deleteComplianceAuditPlan({ id: auditPlanId });
      
      if (result.success) {
        message.success("Audit plan deleted successfully");
        fetchAuditPlans(); // Refresh the list
      } else {
        message.error(`Failed to delete audit plan: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting audit plan:", error);
      message.error("Failed to delete audit plan. Please check your connection and try again.");
    }
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    console.log("Form validation passed, proceeding with submission");
    setSubmitting(true);
    message.loading("Saving audit plan...", 0);
    
    // Validate required fields
    const requiredFields = ['audit_title', 'policy_id', 'audit_type', 'scope', 'start_date', 'due_date'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
      setSubmitting(false);
      return;
    }
    
    try {
      if (editingRecord) {
        // Update existing audit plan
        console.log("Updating audit plan:", editingRecord);
        
        const updateData = {
          id: editingRecord.id,
          audit_title: values.audit_title?.toString() || '',
          policy_id: values.policy_id?.toString() || '',
          audit_type: values.audit_type?.toString() || '',
          scope: values.scope?.toString() || '',
          start_date: values.start_date ? formatDateForDB(values.start_date) : '',
          due_date: values.due_date ? formatDateForDB(values.due_date) : '',
          description: values.description?.toString() || '',
        };
        
        console.log("Update data being sent:", updateData);
        
        const result = await api.updateComplianceAuditPlan(updateData);
        
        console.log("Update response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Audit plan updated successfully!");
        fetchAuditPlans(); // Refresh the list
      } else {
        // Add new audit plan
        console.log("Creating new audit plan");
        
        const createData = {
          audit_title: values.audit_title?.toString() || '',
          policy_id: values.policy_id?.toString() || '',
          audit_type: values.audit_type?.toString() || '',
          scope: values.scope?.toString() || '',
          start_date: values.start_date ? formatDateForDB(values.start_date) : '',
          due_date: values.due_date ? formatDateForDB(values.due_date) : '',
          description: values.description?.toString() || '',
        };
        
        console.log("Create data being sent:", createData);
        
        const result = await api.createComplianceAuditPlan(createData);
        
        console.log("Create response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Audit plan added successfully!");
        fetchAuditPlans(); // Refresh the list
      }
      onClose();
    } catch (error) {
      console.error("Error saving audit plan:", error);
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
        message.error(`❌ Failed to save audit plan: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save audit plan. Please check your connection and try again.");
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
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', marginRight: '8px'}}>
                  <i className="fas fa-clipboard-check" style={{fontSize: '14px'}}></i>
          </div>
                <span className="text-success" style={{fontSize: '14px', fontWeight: '600'}}>Plan</span>
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
          <h2 className="mb-1 fw-bold">Audit Plan Management</h2>
          <p className="mt-0 text-muted">Create and manage compliance audit plans.</p>
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="Audit_Plans_Report"
            title="Audit Plans Report"
            reportType="audit-plans"
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
            Add Audit Plan
          </Button>
        </div>
      </div>

      <div className="card af-card mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Audit Plans</h5>
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
        title={editingRecord ? "Update Audit Plan" : "Add Audit Plan"}
        width={720}
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
          {/* Audit Plan Information */}
          <h5>Audit Plan Information</h5>
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
                <Input placeholder="e.g., Q4 Compliance Audit Plan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="policy_id"
                label="Policy ID"
                rules={[
                  { required: true, message: "Please enter policy ID" },
                  { max: 50, message: "Policy ID cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., POL-002" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="scope"
                label="Scope"
                rules={[
                  { required: true, message: "Please enter scope" },
                  { max: 100, message: "Scope cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., All Departments" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Start Date"
                rules={[
                  { required: true, message: "Please select start date" },
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
            <Col span={12}>
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
                  placeholder="e.g., Annual external audit plan covering all compliance areas"
                />
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
                {editingRecord ? "Update Plan" : "Add Plan"}
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default AuditPlan;