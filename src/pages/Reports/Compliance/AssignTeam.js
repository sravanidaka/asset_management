import React, { useState, useEffect } from "react";
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
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { RangePicker } = DatePicker;

const AssignTeam = ({ setActiveScreen }) => {
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

  // Fetch assign team records from API
  const fetchAssignTeamRecords = async () => {
    try {
      setLoading(true);
      
      console.log('=== FETCHING ASSIGN TEAM RECORDS ===');
      const result = await api.getComplianceAssignTeam();
      
      console.log("Assign Team API Response:", result);
      console.log("Response type:", typeof result);
      console.log("Response keys:", Object.keys(result || {}));
      
      let assignTeamData = [];
      
      // Handle different response formats
      if (result.success && Array.isArray(result.data)) {
        assignTeamData = result.data;
        console.log("Using success.data format, found", assignTeamData.length, "assign team records");
      } else if (Array.isArray(result.data)) {
        assignTeamData = result.data;
        console.log("Using direct array format, found", assignTeamData.length, "assign team records");
      } else if (result.data?.data && Array.isArray(result.data.data)) {
        assignTeamData = result.data.data;
        console.log("Using data.data format, found", assignTeamData.length, "assign team records");
      } else {
        console.warn("Unexpected API response format:", result.data);
        const arrayProperties = Object.values(result.data || {}).filter(Array.isArray);
        if (arrayProperties.length > 0) {
          assignTeamData = arrayProperties[0];
        } else {
          setDataSource([]);
          return;
        }
      }
      
      // Map data with keys and rename fields
      const dataWithKeys = assignTeamData.map((item, index) => ({
        ...item,
        key: item.id || index.toString(),
        audit_title: item.audit_title || '',
        policy_manager: item.policy_manager || '',
        scope_members: item.scope_members || '',
        lead_auditor: item.lead_auditor || '',
        reviewer: item.reviewer || '',
        evidence_approver: item.evidence_approver || '',
        site_coordinators: item.site_coordinators || '',
        observers: item.observers || '',
        due_reminder: item.due_reminder || '',
        assignment_notes: item.assignment_notes || '',
      }));
      
      console.log("Final processed assign team records:", dataWithKeys);
      setDataSource(dataWithKeys);
      
    } catch (error) {
      console.error("Error fetching assign team records:", error);
      
      if (error.response?.status === 401) {
        message.error("Unauthorized: Token expired or invalid. Please log in again.");
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.warning("⚠️ API server is not running. Please check backend connectivity.");
      } else {
        message.error("Failed to fetch assign team records: " + (error.message || "Unknown error"));
      }
      
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignTeamRecords();
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
      title: "Policy Manager",
      dataIndex: "policy_manager",
      key: "policy_manager",
      sorter: (a, b) => safeStringCompare(a.policy_manager, b.policy_manager),
      ...getColumnSearchProps('policy_manager'),
    },
    {
      title: "Scope Members",
      dataIndex: "scope_members",
      key: "scope_members",
      sorter: (a, b) => safeStringCompare(a.scope_members, b.scope_members),
      ...getColumnSearchProps('scope_members'),
      render: (members) => (
        <span title={members}>
          {members && members.length > 30 ? `${members.substring(0, 30)}...` : members}
        </span>
      ),
    },
    {
      title: "Lead Auditor",
      dataIndex: "lead_auditor",
      key: "lead_auditor",
      sorter: (a, b) => safeStringCompare(a.lead_auditor, b.lead_auditor),
      ...getColumnSearchProps('lead_auditor'),
    },
    {
      title: "Reviewer",
      dataIndex: "reviewer",
      key: "reviewer",
      sorter: (a, b) => safeStringCompare(a.reviewer, b.reviewer),
      ...getColumnSearchProps('reviewer'),
    },
    {
      title: "Evidence Approver",
      dataIndex: "evidence_approver",
      key: "evidence_approver",
      sorter: (a, b) => safeStringCompare(a.evidence_approver, b.evidence_approver),
      ...getColumnSearchProps('evidence_approver'),
    },
    {
      title: "Site Coordinators",
      dataIndex: "site_coordinators",
      key: "site_coordinators",
      sorter: (a, b) => safeStringCompare(a.site_coordinators, b.site_coordinators),
      ...getColumnSearchProps('site_coordinators'),
    },
    {
      title: "Observers",
      dataIndex: "observers",
      key: "observers",
      sorter: (a, b) => safeStringCompare(a.observers, b.observers),
      ...getColumnSearchProps('observers'),
      render: (observers) => (
        <span title={observers}>
          {observers && observers.length > 30 ? `${observers.substring(0, 30)}...` : observers}
        </span>
      ),
    },
    {
      title: "Due Reminder",
      dataIndex: "due_reminder",
      key: "due_reminder",
      sorter: (a, b) => safeStringCompare(a.due_reminder, b.due_reminder),
      filters: [
        { text: '1 day before', value: '1 day before' },
        { text: '3 days before', value: '3 days before' },
        { text: '5 days before', value: '5 days before' },
        { text: '1 week before', value: '1 week before' },
      ],
      onFilter: (value, record) => record.due_reminder === value,
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
            title="Are you sure to delete this team assignment?"
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
    console.log("Opening drawer for team assignment:", record);
    setEditingRecord(record);
    if (record) {
      const formData = {
        audit_title: record.audit_title,
        policy_manager: record.policy_manager,
        scope_members: record.scope_members,
        lead_auditor: record.lead_auditor,
        reviewer: record.reviewer,
        evidence_approver: record.evidence_approver,
        site_coordinators: record.site_coordinators,
        observers: record.observers,
        due_reminder: record.due_reminder,
        assignment_notes: record.assignment_notes,
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

  const handleDelete = async (assignTeamId) => {
    try {
      const result = await api.deleteComplianceAssignTeam({ id: assignTeamId });
      
      if (result.success) {
        message.success("Team assignment deleted successfully");
        fetchAssignTeamRecords(); // Refresh the list
      } else {
        message.error(`Failed to delete team assignment: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting team assignment:", error);
      message.error("Failed to delete team assignment. Please check your connection and try again.");
    }
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    console.log("Form validation passed, proceeding with submission");
    setSubmitting(true);
    message.loading("Saving team assignment...", 0);
    
    // Validate required fields
    const requiredFields = ['audit_title', 'policy_manager', 'lead_auditor', 'reviewer'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
      setSubmitting(false);
      return;
    }
    
    try {
      if (editingRecord) {
        // Update existing team assignment
        console.log("Updating team assignment:", editingRecord);
        
        const updateData = {
          id: editingRecord.id,
          audit_title: values.audit_title?.toString() || '',
          policy_manager: values.policy_manager?.toString() || '',
          scope_members: values.scope_members?.toString() || '',
          lead_auditor: values.lead_auditor?.toString() || '',
          reviewer: values.reviewer?.toString() || '',
          evidence_approver: values.evidence_approver?.toString() || '',
          site_coordinators: values.site_coordinators?.toString() || '',
          observers: values.observers?.toString() || '',
          due_reminder: values.due_reminder?.toString() || '',
          assignment_notes: values.assignment_notes?.toString() || '',
        };
        
        console.log("Update data being sent:", updateData);
        
        const result = await api.updateComplianceAssignTeam(updateData);
        
        console.log("Update response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Team assignment updated successfully!");
        fetchAssignTeamRecords(); // Refresh the list
      } else {
        // Add new team assignment
        console.log("Creating new team assignment");
        
        const createData = {
          audit_title: values.audit_title?.toString() || '',
          policy_manager: values.policy_manager?.toString() || '',
          scope_members: values.scope_members?.toString() || '',
          lead_auditor: values.lead_auditor?.toString() || '',
          reviewer: values.reviewer?.toString() || '',
          evidence_approver: values.evidence_approver?.toString() || '',
          site_coordinators: values.site_coordinators?.toString() || '',
          observers: values.observers?.toString() || '',
          due_reminder: values.due_reminder?.toString() || '',
          assignment_notes: values.assignment_notes?.toString() || '',
        };
        
        console.log("Create data being sent:", createData);
        
        const result = await api.createComplianceAssignTeam(createData);
        
        console.log("Create response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Team assignment added successfully!");
        fetchAssignTeamRecords(); // Refresh the list
      }
      onClose();
    } catch (error) {
      console.error("Error saving team assignment:", error);
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
        message.error(`❌ Failed to save team assignment: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save team assignment. Please check your connection and try again.");
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
          <h2 className="mb-1 fw-bold">Team Assignment Management</h2>
          <p className="mt-0 text-muted">Assign teams and roles for audit execution.</p>
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="Team_Assignments_Report"
            title="Team Assignments Report"
            reportType="team-assignments"
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
            Assign Team
          </Button>
        </div>
      </div>

      <div className="card af-card mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Team Assignments</h5>
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
        title={editingRecord ? "Update Team Assignment" : "Add Team Assignment"}
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
          {/* Audit Context */}
          <h5>Audit Context</h5>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="audit_title"
                label="Audit Title"
                rules={[
                  { required: true, message: "Please enter audit title" },
                  { min: 2, message: "Audit title must be at least 2 characters" },
                  { max: 100, message: "Audit title cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., IT Security Compliance" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="policy_manager"
                label="Policy Manager"
                rules={[
                  { required: true, message: "Please enter policy manager" },
                  { max: 50, message: "Policy manager name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Rajiv Malhotra" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="scope_members"
                label="Scope Members"
                rules={[
                  { max: 200, message: "Scope members cannot exceed 200 characters" }
                ]}
              >
                <Input placeholder="e.g., Amit Verma, Sneha Reddy" />
              </Form.Item>
            </Col>
          </Row>

          {/* Role Requirements */}
          <h5>Role Requirements</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lead_auditor"
                label="Lead Auditor"
                rules={[
                  { required: true, message: "Please enter lead auditor" },
                  { max: 50, message: "Lead auditor name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Neha Kapoor" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reviewer"
                label="Reviewer"
                rules={[
                  { required: true, message: "Please enter reviewer" },
                  { max: 50, message: "Reviewer name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Manoj Das" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="evidence_approver"
                label="Evidence Approver"
                rules={[
                  { max: 50, message: "Evidence approver name cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., Ritika Mehra" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="site_coordinators"
                label="Site Coordinators"
                rules={[
                  { max: 100, message: "Site coordinators cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., Sanjay Kulkarni" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="observers"
                label="Observers"
                rules={[
                  { max: 200, message: "Observers cannot exceed 200 characters" }
                ]}
              >
                <Input placeholder="e.g., Tina Dsouza, Harish Babu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="due_reminder"
                label="Due Reminder"
                rules={[
                  { max: 50, message: "Due reminder cannot exceed 50 characters" }
                ]}
              >
                <Select placeholder="Select reminder">
                  <Option value="1 day before">1 day before</Option>
                  <Option value="3 days before">3 days before</Option>
                  <Option value="5 days before">5 days before</Option>
                  <Option value="1 week before">1 week before</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="assignment_notes"
                label="Assignment Notes"
                rules={[
                  { max: 500, message: "Assignment notes cannot exceed 500 characters" }
                ]}
              >
                <Input.TextArea 
                  rows={4}
                  placeholder="e.g., Focus on firewall logs and access control policies."
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
                {editingRecord ? "Update Assignment" : "Add Assignment"}
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default AssignTeam;