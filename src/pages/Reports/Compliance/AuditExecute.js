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
  InputNumber,
} from "antd";
import { SearchOutlined, PlusOutlined, DownloadOutlined } from "@ant-design/icons";
import { api } from '../../../config/api';
import { isValidDate, isDateInFuture, isDateInPast, isDateBefore, formatDateForDisplay } from '../../../utils/dateUtils';
import { formatDateForDB, parseDateFromDB } from "../../../utils/dateUtils";
import ExportButton from '../../../components/ExportButton';
import { safeStringCompare, safeDateCompare, safeNumericCompare } from '../../../utils/tableUtils';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AuditExecute = ({ setActiveScreen }) => {
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

  // Fetch audit executions from API
  const fetchAuditExecutions = async () => {
    try {
      setLoading(true);
      
      console.log('=== FETCHING AUDIT EXECUTIONS ===');
      const result = await api.getComplianceAuditExecution();
      
      console.log("Audit Executions API Response:", result);
      console.log("Response type:", typeof result);
      console.log("Response keys:", Object.keys(result || {}));
      
      let auditExecutionsData = [];
      
      // Handle different response formats
      if (result.success && Array.isArray(result.data)) {
        auditExecutionsData = result.data;
        console.log("Using success.data format, found", auditExecutionsData.length, "audit executions");
      } else if (Array.isArray(result.data)) {
        auditExecutionsData = result.data;
        console.log("Using direct array format, found", auditExecutionsData.length, "audit executions");
      } else if (result.data?.data && Array.isArray(result.data.data)) {
        auditExecutionsData = result.data.data;
        console.log("Using data.data format, found", auditExecutionsData.length, "audit executions");
      } else {
        console.warn("Unexpected API response format:", result.data);
        const arrayProperties = Object.values(result.data || {}).filter(Array.isArray);
        if (arrayProperties.length > 0) {
          auditExecutionsData = arrayProperties[0];
        } else {
          setDataSource([]);
          return;
        }
      }
      
      // Map data with keys and rename fields
      const dataWithKeys = auditExecutionsData.map((item, index) => ({
        ...item,
        key: item.id || index.toString(),
        progress: item.progress || 0,
        open_findings: item.open_findings || 0,
        high_findings: item.high_findings || 0,
        evidence_collected: item.evidence_collected || 0,
        pending_evidence: item.pending_evidence || 0,
        checklist_item: item.checklist_item || '',
        owner: item.owner || '',
        due_date: item.due_date || '',
        severity: item.severity || '',
        status: item.status || '',
        log_time: item.log_time || '',
        log_user: item.log_user || '',
        log_action: item.log_action || '',
        evidence_name: item.evidence_name || '',
        file_name: item.file_name || '',
        evidence_status: item.evidence_status || '',
        added_by: item.added_by || '',
        added_date: item.added_date || '',
        execution_notes: item.execution_notes || '',
        report_name: item.report_name || '',
        share_with: item.share_with || '',
        include_evidence: item.include_evidence || '',
      }));
      
      console.log("Final processed audit executions:", dataWithKeys);
      setDataSource(dataWithKeys);
      
    } catch (error) {
      console.error("Error fetching audit executions:", error);
      
      if (error.response?.status === 401) {
        message.error("Unauthorized: Token expired or invalid. Please log in again.");
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.warning("⚠️ API server is not running. Please check backend connectivity.");
      } else {
        message.error("Failed to fetch audit executions: " + (error.message || "Unknown error"));
      }
      
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditExecutions();
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
      title: "Progress (%)",
      dataIndex: "progress",
      key: "progress",
      sorter: (a, b) => safeNumericCompare(a.progress, b.progress),
      render: (progress) => (
        <span className={`badge ${progress >= 80 ? 'bg-success' : progress >= 50 ? 'bg-warning text-dark' : 'bg-danger'}`}>
          {progress}%
        </span>
      ),
    },
    {
      title: "Open Findings",
      dataIndex: "open_findings",
      key: "open_findings",
      sorter: (a, b) => safeNumericCompare(a.open_findings, b.open_findings),
    },
    {
      title: "High Findings",
      dataIndex: "high_findings",
      key: "high_findings",
      sorter: (a, b) => safeNumericCompare(a.high_findings, b.high_findings),
      render: (highFindings) => (
        <span className={`badge ${highFindings > 0 ? 'bg-danger' : 'bg-success'}`}>
          {highFindings}
        </span>
      ),
    },
    {
      title: "Evidence Collected",
      dataIndex: "evidence_collected",
      key: "evidence_collected",
      sorter: (a, b) => safeNumericCompare(a.evidence_collected, b.evidence_collected),
    },
    {
      title: "Pending Evidence",
      dataIndex: "pending_evidence",
      key: "pending_evidence",
      sorter: (a, b) => safeNumericCompare(a.pending_evidence, b.pending_evidence),
      render: (pendingEvidence) => (
        <span className={`badge ${pendingEvidence > 0 ? 'bg-warning text-dark' : 'bg-success'}`}>
          {pendingEvidence}
        </span>
      ),
    },
    {
      title: "Checklist Item",
      dataIndex: "checklist_item",
      key: "checklist_item",
      sorter: (a, b) => safeStringCompare(a.checklist_item, b.checklist_item),
      ...getColumnSearchProps('checklist_item'),
    },
    {
      title: "Owner",
      dataIndex: "owner",
      key: "owner",
      sorter: (a, b) => safeStringCompare(a.owner, b.owner),
      ...getColumnSearchProps('owner'),
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
      title: "Severity",
      dataIndex: "severity",
      key: "severity",
      sorter: (a, b) => safeStringCompare(a.severity, b.severity),
      filters: [
        { text: 'High', value: 'High' },
        { text: 'Medium', value: 'Medium' },
        { text: 'Low', value: 'Low' },
      ],
      onFilter: (value, record) => record.severity === value,
      render: (severity) => {
        const severityMap = {
          'High': { color: 'danger' },
          'Medium': { color: 'warning' },
          'Low': { color: 'success' },
        };
        const severityInfo = severityMap[severity] || { color: 'secondary' };
        return (
          <span className={`badge bg-${severityInfo.color} ${severityInfo.color === 'warning' ? 'text-dark' : ''}`}>
            {severity}
          </span>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => safeStringCompare(a.status, b.status),
      filters: [
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Pending', value: 'Pending' },
        { text: 'Blocked', value: 'Blocked' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusMap = {
          'Completed': { color: 'success' },
          'In Progress': { color: 'info' },
          'Pending': { color: 'secondary' },
          'Blocked': { color: 'danger' },
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
            title="Are you sure to delete this audit execution?"
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
    console.log("Opening drawer for audit execution:", record);
    setEditingRecord(record);
    if (record) {
      const formData = {
        progress: record.progress,
        open_findings: record.open_findings,
        high_findings: record.high_findings,
        evidence_collected: record.evidence_collected,
        pending_evidence: record.pending_evidence,
        checklist_item: record.checklist_item,
        owner: record.owner,
        due_date: record.due_date,
        severity: record.severity,
        status: record.status,
        log_time: record.log_time,
        log_user: record.log_user,
        log_action: record.log_action,
        evidence_name: record.evidence_name,
        file_name: record.file_name,
        evidence_status: record.evidence_status,
        added_by: record.added_by,
        added_date: record.added_date,
        execution_notes: record.execution_notes,
        report_name: record.report_name,
        share_with: record.share_with,
        include_evidence: record.include_evidence,
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

  const handleDelete = async (auditExecutionId) => {
    try {
      const result = await api.deleteComplianceAuditExecution({ id: auditExecutionId });
      
      if (result.success) {
        message.success("Audit execution deleted successfully");
        fetchAuditExecutions(); // Refresh the list
      } else {
        message.error(`Failed to delete audit execution: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting audit execution:", error);
      message.error("Failed to delete audit execution. Please check your connection and try again.");
    }
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    console.log("Form validation passed, proceeding with submission");
    setSubmitting(true);
    message.loading("Saving audit execution...", 0);
    
    // Validate required fields
    const requiredFields = ['checklist_item', 'owner', 'severity', 'status'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
      setSubmitting(false);
      return;
    }
    
    try {
      if (editingRecord) {
        // Update existing audit execution
        console.log("Updating audit execution:", editingRecord);
        
        const updateData = {
          id: editingRecord.id,
          progress: parseInt(values.progress) || 0,
          open_findings: parseInt(values.open_findings) || 0,
          high_findings: parseInt(values.high_findings) || 0,
          evidence_collected: parseInt(values.evidence_collected) || 0,
          pending_evidence: parseInt(values.pending_evidence) || 0,
          checklist_item: values.checklist_item?.toString() || '',
          owner: values.owner?.toString() || '',
          due_date: values.due_date ? formatDateForDB(values.due_date) : '',
          severity: values.severity?.toString() || '',
          status: values.status?.toString() || '',
          log_time: values.log_time?.toString() || '',
          log_user: values.log_user?.toString() || '',
          log_action: values.log_action?.toString() || '',
          evidence_name: values.evidence_name?.toString() || '',
          file_name: values.file_name?.toString() || '',
          evidence_status: values.evidence_status?.toString() || '',
          added_by: values.added_by?.toString() || '',
          added_date: values.added_date ? formatDateForDB(values.added_date) : '',
          execution_notes: values.execution_notes?.toString() || '',
          report_name: values.report_name?.toString() || '',
          share_with: values.share_with?.toString() || '',
          include_evidence: values.include_evidence?.toString() || '',
        };
        
        console.log("Update data being sent:", updateData);
        
        const result = await api.updateComplianceAuditExecution(updateData);
        
        console.log("Update response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Audit execution updated successfully!");
        fetchAuditExecutions(); // Refresh the list
      } else {
        // Add new audit execution
        console.log("Creating new audit execution");
        
        const createData = {
          progress: parseInt(values.progress) || 0,
          open_findings: parseInt(values.open_findings) || 0,
          high_findings: parseInt(values.high_findings) || 0,
          evidence_collected: parseInt(values.evidence_collected) || 0,
          pending_evidence: parseInt(values.pending_evidence) || 0,
          checklist_item: values.checklist_item?.toString() || '',
          owner: values.owner?.toString() || '',
          due_date: values.due_date ? formatDateForDB(values.due_date) : '',
          severity: values.severity?.toString() || '',
          status: values.status?.toString() || '',
          log_time: values.log_time?.toString() || '',
          log_user: values.log_user?.toString() || '',
          log_action: values.log_action?.toString() || '',
          evidence_name: values.evidence_name?.toString() || '',
          file_name: values.file_name?.toString() || '',
          evidence_status: values.evidence_status?.toString() || '',
          added_by: values.added_by?.toString() || '',
          added_date: values.added_date ? formatDateForDB(values.added_date) : '',
          execution_notes: values.execution_notes?.toString() || '',
          report_name: values.report_name?.toString() || '',
          share_with: values.share_with?.toString() || '',
          include_evidence: values.include_evidence?.toString() || '',
        };
        
        console.log("Create data being sent:", createData);
        
        const result = await api.createComplianceAuditExecution(createData);
        
        console.log("Create response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Audit execution added successfully!");
        fetchAuditExecutions(); // Refresh the list
      }
      onClose();
    } catch (error) {
      console.error("Error saving audit execution:", error);
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
        message.error(`❌ Failed to save audit execution: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save audit execution. Please check your connection and try again.");
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
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', marginRight: '8px'}}>
                  <i className="fas fa-users" style={{fontSize: '14px'}}></i>
            </div>
                <span className="text-success" style={{fontSize: '14px', fontWeight: '600'}}>Assign</span>
                </div>
              <div className="d-flex align-items-center" style={{cursor: 'pointer'}} onClick={() => navigate('/audit-execute')}>
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', marginRight: '8px'}}>
                  <i className="fas fa-play" style={{fontSize: '14px'}}></i>
              </div>
                <span className="text-success" style={{fontSize: '14px', fontWeight: '600'}}>Execute</span>
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
          <h2 className="mb-1 fw-bold">Audit Execution Management</h2>
          <p className="mt-0 text-muted">Track and manage audit execution progress and evidence collection.</p>
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="Audit_Executions_Report"
            title="Audit Executions Report"
            reportType="audit-executions"
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
            Add Execution Record
          </Button>
            </div>
          </div>

      <div className="card af-card mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Audit Executions</h5>
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
        title={editingRecord ? "Update Audit Execution" : "Add Audit Execution"}
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
          {/* Progress & Metrics */}
          <h5>Progress & Metrics</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="progress"
                label="Progress (%)"
                rules={[
                  { required: true, message: "Please enter progress percentage" },
                  { type: 'number', min: 0, max: 100, message: "Progress must be between 0 and 100" }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0-100"
                  min={0}
                  max={100}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="open_findings"
                label="Open Findings"
                rules={[
                  { required: true, message: "Please enter number of open findings" },
                  { type: 'number', min: 0, message: "Open findings cannot be negative" }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="high_findings"
                label="High Findings"
                rules={[
                  { required: true, message: "Please enter number of high findings" },
                  { type: 'number', min: 0, message: "High findings cannot be negative" }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="evidence_collected"
                label="Evidence Collected"
                rules={[
                  { required: true, message: "Please enter number of evidence collected" },
                  { type: 'number', min: 0, message: "Evidence collected cannot be negative" }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pending_evidence"
                label="Pending Evidence"
                rules={[
                  { required: true, message: "Please enter number of pending evidence" },
                  { type: 'number', min: 0, message: "Pending evidence cannot be negative" }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Checklist & Assignment */}
          <h5>Checklist & Assignment</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="checklist_item"
                label="Checklist Item"
                rules={[
                  { required: true, message: "Please enter checklist item" },
                  { max: 100, message: "Checklist item cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., Asset Tagging" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="owner"
                label="Owner"
                rules={[
                  { required: true, message: "Please enter owner" },
                  { max: 50, message: "Owner name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Cody Fisher" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="due_date"
                label="Due Date"
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
            <Col span={12}>
              <Form.Item
                name="severity"
                label="Severity"
                rules={[
                  { required: true, message: "Please select severity" }
                ]}
              >
                <Select placeholder="Select severity">
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[
                  { required: true, message: "Please select status" }
                ]}
              >
                <Select placeholder="Select status">
                  <Option value="In Progress">In Progress</Option>
                  <Option value="Completed">Completed</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Blocked">Blocked</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Activity Log */}
          <h5>Activity Log</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="log_time"
                label="Log Time"
                rules={[
                  { max: 10, message: "Log time cannot exceed 10 characters" }
                ]}
              >
                <Input placeholder="e.g., 10:22:00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="log_user"
                label="Log User"
                rules={[
                  { max: 50, message: "Log user cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Cody" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="log_action"
                label="Log Action"
                rules={[
                  { max: 200, message: "Log action cannot exceed 200 characters" }
                ]}
              >
                <Input placeholder="e.g., Uploaded evidence for Asset Tagging" />
              </Form.Item>
            </Col>
          </Row>

          {/* Evidence Details */}
          <h5>Evidence Details</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="evidence_name"
                label="Evidence Name"
                rules={[
                  { max: 100, message: "Evidence name cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., Inventory Export" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="file_name"
                label="File Name"
                rules={[
                  { max: 100, message: "File name cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., inventory_q3.csv" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="evidence_status"
                label="Evidence Status"
                rules={[
                  { max: 20, message: "Evidence status cannot exceed 20 characters" }
                ]}
              >
                <Select placeholder="Select evidence status">
                  <Option value="Verified">Verified</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Rejected">Rejected</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="added_by"
                label="Added By"
                rules={[
                  { max: 50, message: "Added by cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Cody" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="added_date"
                label="Added Date"
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

          {/* Execution Notes */}
          <h5>Execution Notes</h5>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="execution_notes"
                label="Execution Notes"
                rules={[
                  { max: 500, message: "Execution notes cannot exceed 500 characters" }
                ]}
              >
                <Input.TextArea 
                  rows={4}
                  placeholder="e.g., Execution in progress for asset tagging compliance."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Report & Sharing */}
          <h5>Report & Sharing</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="report_name"
                label="Report Name"
                rules={[
                  { max: 100, message: "Report name cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., Execution Summary" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="share_with"
                label="Share With"
                rules={[
                  { max: 100, message: "Share with cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., Audit Team" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="include_evidence"
                label="Include Evidence"
                rules={[
                  { max: 10, message: "Include evidence cannot exceed 10 characters" }
                ]}
              >
                <Select placeholder="Select option">
                  <Option value="Yes">Yes</Option>
                  <Option value="No">No</Option>
                </Select>
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
                {editingRecord ? "Update Execution" : "Add Execution"}
              </Button>
            </Space>
        </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default AuditExecute;