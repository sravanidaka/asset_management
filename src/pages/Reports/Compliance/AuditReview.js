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

const AuditReview = ({ setActiveScreen }) => {
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

  // Fetch audit reviews from API
  const fetchAuditReviews = async () => {
    try {
      setLoading(true);
      
      console.log('=== FETCHING AUDIT REVIEWS ===');
      const result = await api.getComplianceAuditReview();
      
      console.log("Audit Reviews API Response:", result);
      console.log("Response type:", typeof result);
      console.log("Response keys:", Object.keys(result || {}));
      
      let auditReviewsData = [];
      
      // Handle different response formats
      if (result.success && Array.isArray(result.data)) {
        auditReviewsData = result.data;
        console.log("Using success.data format, found", auditReviewsData.length, "audit reviews");
      } else if (Array.isArray(result.data)) {
        auditReviewsData = result.data;
        console.log("Using direct array format, found", auditReviewsData.length, "audit reviews");
      } else if (result.data?.data && Array.isArray(result.data.data)) {
        auditReviewsData = result.data.data;
        console.log("Using data.data format, found", auditReviewsData.length, "audit reviews");
      } else {
        console.warn("Unexpected API response format:", result.data);
        const arrayProperties = Object.values(result.data || {}).filter(Array.isArray);
        if (arrayProperties.length > 0) {
          auditReviewsData = arrayProperties[0];
        } else {
          setDataSource([]);
          return;
        }
      }
      
      // Map data with keys and rename fields
      const dataWithKeys = auditReviewsData.map((item, index) => ({
        ...item,
        key: item.id || index.toString(),
        overall_progress: item.overall_progress || '',
        open_findings: item.open_findings || '',
        evidence_summary: item.evidence_summary || '',
        finding_1_title: item.finding_1_title || '',
        finding_1_owner: item.finding_1_owner || '',
        finding_1_due: item.finding_1_due || '',
        finding_1_severity: item.finding_1_severity || '',
        finding_1_status: item.finding_1_status || '',
        finding_1_notes: item.finding_1_notes || '',
        finding_2_title: item.finding_2_title || '',
        finding_2_owner: item.finding_2_owner || '',
        finding_2_due: item.finding_2_due || '',
        finding_2_severity: item.finding_2_severity || '',
        finding_2_status: item.finding_2_status || '',
        finding_2_notes: item.finding_2_notes || '',
        finding_3_title: item.finding_3_title || '',
        finding_3_owner: item.finding_3_owner || '',
        finding_3_due: item.finding_3_due || '',
        finding_3_severity: item.finding_3_severity || '',
        finding_3_status: item.finding_3_status || '',
        finding_3_notes: item.finding_3_notes || '',
        execution_summary: item.execution_summary || '',
        evidence_file: item.evidence_file || '',
        approver: item.approver || '',
        co_approver: item.co_approver || '',
        effective_date: item.effective_date || '',
        require_evidence: item.require_evidence || '',
        reviewer_notes: item.reviewer_notes || '',
        report_type: item.report_type || '',
        include_findings: item.include_findings || '',
        distribution: item.distribution || '',
      }));
      
      console.log("Final processed audit reviews:", dataWithKeys);
      setDataSource(dataWithKeys);
      
    } catch (error) {
      console.error("Error fetching audit reviews:", error);
      
      if (error.response?.status === 401) {
        message.error("Unauthorized: Token expired or invalid. Please log in again.");
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.warning("⚠️ API server is not running. Please check backend connectivity.");
      } else {
        message.error("Failed to fetch audit reviews: " + (error.message || "Unknown error"));
      }
      
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditReviews();
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
      title: "Overall Progress",
      dataIndex: "overall_progress",
      key: "overall_progress",
      sorter: (a, b) => safeStringCompare(a.overall_progress, b.overall_progress),
      ...getColumnSearchProps('overall_progress'),
    },
    {
      title: "Open Findings",
      dataIndex: "open_findings",
      key: "open_findings",
      sorter: (a, b) => safeStringCompare(a.open_findings, b.open_findings),
      ...getColumnSearchProps('open_findings'),
    },
    {
      title: "Evidence Summary",
      dataIndex: "evidence_summary",
      key: "evidence_summary",
      sorter: (a, b) => safeStringCompare(a.evidence_summary, b.evidence_summary),
      ...getColumnSearchProps('evidence_summary'),
    },
    {
      title: "Finding 1 Title",
      dataIndex: "finding_1_title",
      key: "finding_1_title",
      sorter: (a, b) => safeStringCompare(a.finding_1_title, b.finding_1_title),
      ...getColumnSearchProps('finding_1_title'),
    },
    {
      title: "Finding 1 Owner",
      dataIndex: "finding_1_owner",
      key: "finding_1_owner",
      sorter: (a, b) => safeStringCompare(a.finding_1_owner, b.finding_1_owner),
      ...getColumnSearchProps('finding_1_owner'),
    },
    {
      title: "Finding 1 Status",
      dataIndex: "finding_1_status",
      key: "finding_1_status",
      sorter: (a, b) => safeStringCompare(a.finding_1_status, b.finding_1_status),
      filters: [
        { text: 'Changes Requested', value: 'Changes Requested' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
        { text: 'Pending', value: 'Pending' },
      ],
      onFilter: (value, record) => record.finding_1_status === value,
      render: (status) => {
        const statusMap = {
          'Approved': { color: 'success' },
          'Changes Requested': { color: 'warning' },
          'Rejected': { color: 'danger' },
          'Pending': { color: 'secondary' },
        };
        const statusInfo = statusMap[status] || { color: 'secondary' };
        return (
          <span className={`badge bg-${statusInfo.color} ${statusInfo.color === 'warning' ? 'text-dark' : ''}`}>
            {status}
          </span>
        );
      },
    },
    {
      title: "Approver",
      dataIndex: "approver",
      key: "approver",
      sorter: (a, b) => safeStringCompare(a.approver, b.approver),
      ...getColumnSearchProps('approver'),
    },
    {
      title: "Effective Date",
      dataIndex: "effective_date",
      key: "effective_date",
      sorter: (a, b) => safeDateCompare(a.effective_date, b.effective_date),
      ...getColumnSearchProps('effective_date'),
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
            title="Are you sure to delete this audit review?"
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
    console.log("Opening drawer for audit review:", record);
    setEditingRecord(record);
    if (record) {
      const formData = {
        overall_progress: record.overall_progress,
        open_findings: record.open_findings,
        evidence_summary: record.evidence_summary,
        finding_1_title: record.finding_1_title,
        finding_1_owner: record.finding_1_owner,
        finding_1_due: record.finding_1_due,
        finding_1_severity: record.finding_1_severity,
        finding_1_status: record.finding_1_status,
        finding_1_notes: record.finding_1_notes,
        finding_2_title: record.finding_2_title,
        finding_2_owner: record.finding_2_owner,
        finding_2_due: record.finding_2_due,
        finding_2_severity: record.finding_2_severity,
        finding_2_status: record.finding_2_status,
        finding_2_notes: record.finding_2_notes,
        finding_3_title: record.finding_3_title,
        finding_3_owner: record.finding_3_owner,
        finding_3_due: record.finding_3_due,
        finding_3_severity: record.finding_3_severity,
        finding_3_status: record.finding_3_status,
        finding_3_notes: record.finding_3_notes,
        execution_summary: record.execution_summary,
        evidence_file: record.evidence_file,
        approver: record.approver,
        co_approver: record.co_approver,
        effective_date: record.effective_date,
        require_evidence: record.require_evidence,
        reviewer_notes: record.reviewer_notes,
        report_type: record.report_type,
        include_findings: record.include_findings,
        distribution: record.distribution,
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

  const handleDelete = async (auditReviewId) => {
    try {
      const result = await api.deleteComplianceAuditReview({ id: auditReviewId });
      
      if (result.success) {
        message.success("Audit review deleted successfully");
        fetchAuditReviews(); // Refresh the list
      } else {
        message.error(`Failed to delete audit review: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting audit review:", error);
      message.error("Failed to delete audit review. Please check your connection and try again.");
    }
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    console.log("Form validation passed, proceeding with submission");
    setSubmitting(true);
    message.loading("Saving audit review...", 0);
    
    // Validate required fields
    const requiredFields = ['overall_progress', 'open_findings', 'evidence_summary', 'approver'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
      setSubmitting(false);
      return;
    }
    
    try {
      if (editingRecord) {
        // Update existing audit review
        console.log("Updating audit review:", editingRecord);
        
        const updateData = {
          id: editingRecord.id,
          overall_progress: values.overall_progress?.toString() || '',
          open_findings: values.open_findings?.toString() || '',
          evidence_summary: values.evidence_summary?.toString() || '',
          finding_1_title: values.finding_1_title?.toString() || '',
          finding_1_owner: values.finding_1_owner?.toString() || '',
          finding_1_due: values.finding_1_due ? formatDateForDB(values.finding_1_due) : '',
          finding_1_severity: values.finding_1_severity?.toString() || '',
          finding_1_status: values.finding_1_status?.toString() || '',
          finding_1_notes: values.finding_1_notes?.toString() || '',
          finding_2_title: values.finding_2_title?.toString() || '',
          finding_2_owner: values.finding_2_owner?.toString() || '',
          finding_2_due: values.finding_2_due ? formatDateForDB(values.finding_2_due) : '',
          finding_2_severity: values.finding_2_severity?.toString() || '',
          finding_2_status: values.finding_2_status?.toString() || '',
          finding_2_notes: values.finding_2_notes?.toString() || '',
          finding_3_title: values.finding_3_title?.toString() || '',
          finding_3_owner: values.finding_3_owner?.toString() || '',
          finding_3_due: values.finding_3_due ? formatDateForDB(values.finding_3_due) : '',
          finding_3_severity: values.finding_3_severity?.toString() || '',
          finding_3_status: values.finding_3_status?.toString() || '',
          finding_3_notes: values.finding_3_notes?.toString() || '',
          execution_summary: values.execution_summary?.toString() || '',
          evidence_file: values.evidence_file?.toString() || '',
          approver: values.approver?.toString() || '',
          co_approver: values.co_approver?.toString() || '',
          effective_date: values.effective_date ? formatDateForDB(values.effective_date) : '',
          require_evidence: values.require_evidence?.toString() || '',
          reviewer_notes: values.reviewer_notes?.toString() || '',
          report_type: values.report_type?.toString() || '',
          include_findings: values.include_findings?.toString() || '',
          distribution: values.distribution?.toString() || '',
        };
        
        console.log("Update data being sent:", updateData);
        
        const result = await api.updateComplianceAuditReview(updateData);
        
        console.log("Update response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Audit review updated successfully!");
        fetchAuditReviews(); // Refresh the list
      } else {
        // Add new audit review
        console.log("Creating new audit review");
        
        const createData = {
          overall_progress: values.overall_progress?.toString() || '',
          open_findings: values.open_findings?.toString() || '',
          evidence_summary: values.evidence_summary?.toString() || '',
          finding_1_title: values.finding_1_title?.toString() || '',
          finding_1_owner: values.finding_1_owner?.toString() || '',
          finding_1_due: values.finding_1_due ? formatDateForDB(values.finding_1_due) : '',
          finding_1_severity: values.finding_1_severity?.toString() || '',
          finding_1_status: values.finding_1_status?.toString() || '',
          finding_1_notes: values.finding_1_notes?.toString() || '',
          finding_2_title: values.finding_2_title?.toString() || '',
          finding_2_owner: values.finding_2_owner?.toString() || '',
          finding_2_due: values.finding_2_due ? formatDateForDB(values.finding_2_due) : '',
          finding_2_severity: values.finding_2_severity?.toString() || '',
          finding_2_status: values.finding_2_status?.toString() || '',
          finding_2_notes: values.finding_2_notes?.toString() || '',
          finding_3_title: values.finding_3_title?.toString() || '',
          finding_3_owner: values.finding_3_owner?.toString() || '',
          finding_3_due: values.finding_3_due ? formatDateForDB(values.finding_3_due) : '',
          finding_3_severity: values.finding_3_severity?.toString() || '',
          finding_3_status: values.finding_3_status?.toString() || '',
          finding_3_notes: values.finding_3_notes?.toString() || '',
          execution_summary: values.execution_summary?.toString() || '',
          evidence_file: values.evidence_file?.toString() || '',
          approver: values.approver?.toString() || '',
          co_approver: values.co_approver?.toString() || '',
          effective_date: values.effective_date ? formatDateForDB(values.effective_date) : '',
          require_evidence: values.require_evidence?.toString() || '',
          reviewer_notes: values.reviewer_notes?.toString() || '',
          report_type: values.report_type?.toString() || '',
          include_findings: values.include_findings?.toString() || '',
          distribution: values.distribution?.toString() || '',
        };
        
        console.log("Create data being sent:", createData);
        
        const result = await api.createComplianceAuditReview(createData);
        
        console.log("Create response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Audit review added successfully!");
        fetchAuditReviews(); // Refresh the list
      }
      onClose();
    } catch (error) {
      console.error("Error saving audit review:", error);
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
        message.error(`❌ Failed to save audit review: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save audit review. Please check your connection and try again.");
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
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px', marginRight: '8px'}}>
                  <i className="fas fa-eye" style={{fontSize: '14px'}}></i>
          </div>
                <span className="text-success" style={{fontSize: '14px', fontWeight: '600'}}>Review</span>
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
          <h2 className="mb-1 fw-bold">Audit Review Management</h2>
          <p className="mt-0 text-muted">Review and approve audit findings and evidence.</p>
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="Audit_Reviews_Report"
            title="Audit Reviews Report"
            reportType="audit-reviews"
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
            Add Review Record
          </Button>
        </div>
      </div>

      <div className="card af-card mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Audit Reviews</h5>
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
        title={editingRecord ? "Update Audit Review" : "Add Audit Review"}
        width={900}
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
          {/* Overall Progress & Summary */}
          <h5>Overall Progress & Summary</h5>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="overall_progress"
                label="Overall Progress"
                rules={[
                  { required: true, message: "Please enter overall progress" },
                  { max: 50, message: "Overall progress cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., 78% +12% since execute" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="open_findings"
                label="Open Findings"
                rules={[
                  { required: true, message: "Please enter open findings" },
                  { max: 50, message: "Open findings cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., 5 open (2 High)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="evidence_summary"
                label="Evidence Summary"
                rules={[
                  { required: true, message: "Please enter evidence summary" },
                  { max: 50, message: "Evidence summary cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., 15 total, 4 pending" />
              </Form.Item>
            </Col>
          </Row>

          {/* Finding 1 */}
          <h5>Finding 1</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="finding_1_title"
                label="Finding 1 Title"
                rules={[
                  { max: 100, message: "Finding title cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., Asset Tagging Gaps" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="finding_1_owner"
                label="Finding 1 Owner"
                rules={[
                  { max: 50, message: "Owner name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Cody Fisher" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="finding_1_due"
                label="Finding 1 Due Date"
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
            <Col span={8}>
              <Form.Item
                name="finding_1_severity"
                label="Finding 1 Severity"
                rules={[
                  { max: 20, message: "Severity cannot exceed 20 characters" }
                ]}
              >
                <Select placeholder="Select severity">
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="finding_1_status"
                label="Finding 1 Status"
                rules={[
                  { max: 30, message: "Status cannot exceed 30 characters" }
                ]}
              >
                <Select placeholder="Select status">
                  <Option value="Changes Requested">Changes Requested</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Rejected">Rejected</Option>
                  <Option value="Pending">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="finding_1_notes"
                label="Finding 1 Notes"
                rules={[
                  { max: 200, message: "Notes cannot exceed 200 characters" }
                ]}
              >
                <Input.TextArea 
                  rows={2}
                  placeholder="e.g., Add serial capture for 12 devices and re-upload evidence."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Finding 2 */}
          <h5>Finding 2</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="finding_2_title"
                label="Finding 2 Title"
                rules={[
                  { max: 100, message: "Finding title cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., Access Review Coverage" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="finding_2_owner"
                label="Finding 2 Owner"
                rules={[
                  { max: 50, message: "Owner name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Courtney Henry" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="finding_2_due"
                label="Finding 2 Due Date"
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
            <Col span={8}>
              <Form.Item
                name="finding_2_severity"
                label="Finding 2 Severity"
                rules={[
                  { max: 20, message: "Severity cannot exceed 20 characters" }
                ]}
              >
                <Select placeholder="Select severity">
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="finding_2_status"
                label="Finding 2 Status"
                rules={[
                  { max: 30, message: "Status cannot exceed 30 characters" }
                ]}
              >
                <Select placeholder="Select status">
                  <Option value="Changes Requested">Changes Requested</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Rejected">Rejected</Option>
                  <Option value="Pending">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="finding_2_notes"
                label="Finding 2 Notes"
                rules={[
                  { max: 200, message: "Notes cannot exceed 200 characters" }
                ]}
              >
                <Input.TextArea 
                  rows={2}
                  placeholder="e.g., Coverage meets policy threshold."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Finding 3 */}
          <h5>Finding 3</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="finding_3_title"
                label="Finding 3 Title"
                rules={[
                  { max: 100, message: "Finding title cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., License True-up Evidence" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="finding_3_owner"
                label="Finding 3 Owner"
                rules={[
                  { max: 50, message: "Owner name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Darrell Steward" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="finding_3_due"
                label="Finding 3 Due Date"
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
            <Col span={8}>
              <Form.Item
                name="finding_3_severity"
                label="Finding 3 Severity"
                rules={[
                  { max: 20, message: "Severity cannot exceed 20 characters" }
                ]}
              >
                <Select placeholder="Select severity">
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="finding_3_status"
                label="Finding 3 Status"
                rules={[
                  { max: 30, message: "Status cannot exceed 30 characters" }
                ]}
              >
                <Select placeholder="Select status">
                  <Option value="Changes Requested">Changes Requested</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Rejected">Rejected</Option>
                  <Option value="Pending">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="finding_3_notes"
                label="Finding 3 Notes"
                rules={[
                  { max: 200, message: "Notes cannot exceed 200 characters" }
                ]}
              >
                <Input.TextArea 
                  rows={2}
                  placeholder="e.g., Provide vendor confirmation for seat counts."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Attachments & Approvals */}
          <h5>Attachments & Approvals</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="execution_summary"
                label="Execution Summary"
                rules={[
                  { max: 100, message: "Execution summary cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., audit_exec_summary.pdf" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="evidence_file"
                label="Evidence File"
                rules={[
                  { max: 100, message: "Evidence file cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., evidence_summary.pdf" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="approver"
                label="Approver"
                rules={[
                  { required: true, message: "Please enter approver" },
                  { max: 50, message: "Approver name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Compliance Lead" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="co_approver"
                label="Co-Approver"
                rules={[
                  { max: 50, message: "Co-approver name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., IT Manager" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="effective_date"
                label="Effective Date"
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
            <Col span={8}>
              <Form.Item
                name="require_evidence"
                label="Require Evidence"
                rules={[
                  { max: 10, message: "Require evidence cannot exceed 10 characters" }
                ]}
              >
                <Select placeholder="Select option">
                  <Option value="Yes">Yes</Option>
                  <Option value="No">No</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="report_type"
                label="Report Type"
                rules={[
                  { max: 50, message: "Report type cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Review Summary" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="include_findings"
                label="Include Findings"
                rules={[
                  { max: 50, message: "Include findings cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., All (Open + Closed)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="distribution"
                label="Distribution"
                rules={[
                  { max: 50, message: "Distribution cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Stakeholders" />
              </Form.Item>
            </Col>
          </Row>

          {/* Reviewer Notes */}
          <h5>Reviewer Notes</h5>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="reviewer_notes"
                label="Reviewer Notes"
                rules={[
                  { max: 500, message: "Reviewer notes cannot exceed 500 characters" }
                ]}
              >
                <Input.TextArea 
                  rows={4}
                  placeholder="e.g., Summarize decisions, policy references, and remediation guidance."
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
                {editingRecord ? "Update Review" : "Add Review"}
              </Button>
            </Space>
      </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default AuditReview;