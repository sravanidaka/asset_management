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

const Compliance = ({ setActiveScreen }) => {
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

  // Fetch compliance policies from API
  const fetchCompliancePolicies = async () => {
    try {
      setLoading(true);
      
      console.log('=== FETCHING COMPLIANCE POLICIES ===');
      const result = await api.getCompliance();
      
      console.log("Compliance API Response:", result);
      console.log("Response type:", typeof result);
      console.log("Response keys:", Object.keys(result || {}));
      
      let complianceData = [];
      
      // Handle different response formats
      if (result.success && Array.isArray(result.data)) {
        complianceData = result.data;
        console.log("Using success.data format, found", complianceData.length, "policies");
      } else if (Array.isArray(result.data)) {
        complianceData = result.data;
        console.log("Using direct array format, found", complianceData.length, "policies");
      } else if (result.data?.data && Array.isArray(result.data.data)) {
        complianceData = result.data.data;
        console.log("Using data.data format, found", complianceData.length, "policies");
      } else {
        console.warn("Unexpected API response format:", result.data);
        const arrayProperties = Object.values(result.data || {}).filter(Array.isArray);
        if (arrayProperties.length > 0) {
          complianceData = arrayProperties[0];
        } else {
          setDataSource([]);
          return;
        }
      }
      
      // Map data with keys and rename fields
      const dataWithKeys = complianceData.map((item, index) => ({
        ...item,
        key: item.id || item.policy_id || index.toString(),
        policy_id: item.policy_id || item.id || '',
        policy_name: item.policy_name || item.name || '',
        compliance_type: item.compliance_type || item.type || '',
        status: item.status || '1',
        asset_category: item.asset_category || '',
        due_date_from: item.due_date_from || '',
        due_date_to: item.due_date_to || '',
      }));
      
      console.log("Final processed compliance policies:", dataWithKeys);
      setDataSource(dataWithKeys);
      
    } catch (error) {
      console.error("Error fetching compliance policies:", error);
      
      if (error.response?.status === 401) {
        message.error("Unauthorized: Token expired or invalid. Please log in again.");
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.warning("⚠️ API server is not running. Please check backend connectivity.");
      } else {
        message.error("Failed to fetch compliance policies: " + (error.message || "Unknown error"));
      }
      
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliancePolicies();
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
      title: "Policy ID",
      dataIndex: "policy_id",
      key: "policy_id",
      sorter: (a, b) => safeStringCompare(a.policy_id, b.policy_id),
      ...getColumnSearchProps('policy_id'),
    },
    {
      title: "Policy Name",
      dataIndex: "policy_name",
      key: "policy_name",
      sorter: (a, b) => safeStringCompare(a.policy_name, b.policy_name),
      ...getColumnSearchProps('policy_name'),
    },
    {
      title: "Compliance Type",
      dataIndex: "compliance_type",
      key: "compliance_type",
      sorter: (a, b) => safeStringCompare(a.compliance_type, b.compliance_type),
      ...getColumnSearchProps('compliance_type'),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => safeStringCompare(a.status, b.status),
      filters: [
        { text: 'Active', value: '1' },
        { text: 'Inactive', value: '0' },
        { text: 'Pending', value: '2' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusMap = {
          '1': { text: 'Active', color: 'success' },
          '0': { text: 'Inactive', color: 'secondary' },
          '2': { text: 'Pending', color: 'warning' },
        };
        const statusInfo = statusMap[status] || { text: status, color: 'secondary' };
        return (
          <span className={`badge bg-${statusInfo.color} ${statusInfo.color === 'warning' ? 'text-dark' : ''}`}>
            {statusInfo.text}
          </span>
        );
      },
    },
    {
      title: "Asset Category",
      dataIndex: "asset_category",
      key: "asset_category",
      sorter: (a, b) => safeStringCompare(a.asset_category, b.asset_category),
      ...getColumnSearchProps('asset_category'),
    },
    {
      title: "Due Date From",
      dataIndex: "due_date_from",
      key: "due_date_from",
      sorter: (a, b) => safeDateCompare(a.due_date_from, b.due_date_from),
      ...getColumnSearchProps('due_date_from'),
      render: (date) => formatDateForDisplay(date) || '-',
    },
    {
      title: "Due Date To",
      dataIndex: "due_date_to",
      key: "due_date_to",
      sorter: (a, b) => safeDateCompare(a.due_date_to, b.due_date_to),
      ...getColumnSearchProps('due_date_to'),
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
          <Popconfirm
            title="Are you sure to delete this compliance policy?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record.id || record.policy_id);
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
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const showDrawer = (record = null) => {
    console.log("Opening drawer for compliance policy:", record);
    setEditingRecord(record);
    if (record) {
      const formData = {
        policy_id: record.policy_id,
        policy_name: record.policy_name,
        compliance_type: record.compliance_type,
        status: record.status,
        asset_category: record.asset_category,
        due_date_from: record.due_date_from,
        due_date_to: record.due_date_to,
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

  const handleDelete = async (policyId) => {
    try {
      const result = await api.deleteCompliance({ id: policyId });
      
      if (result.success) {
        message.success("Compliance policy deleted successfully");
        fetchCompliancePolicies(); // Refresh the list
      } else {
        message.error(`Failed to delete compliance policy: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting compliance policy:", error);
      message.error("Failed to delete compliance policy. Please check your connection and try again.");
    }
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    console.log("Form validation passed, proceeding with submission");
    setSubmitting(true);
    message.loading("Saving compliance policy...", 0);
    
    // Validate required fields
    const requiredFields = ['policy_id', 'policy_name', 'compliance_type', 'status', 'asset_category'];
    const missingFields = requiredFields.filter(field => !values[field]);
    
    if (missingFields.length > 0) {
      message.error(`❌ Invalid data: ${missingFields.join(', ')} are required`);
      setSubmitting(false);
      return;
    }
    
    try {
      if (editingRecord) {
        // Update existing compliance policy
        console.log("Updating compliance policy:", editingRecord);
        
        const updateData = {
          id: editingRecord.id || editingRecord.policy_id,
          policy_id: values.policy_id?.toString() || '',
          policy_name: values.policy_name?.toString() || '',
          compliance_type: values.compliance_type?.toString() || '',
          status: values.status?.toString() || '1',
          asset_category: values.asset_category?.toString() || '',
          due_date_from: values.due_date_from ? formatDateForDB(values.due_date_from) : '',
          due_date_to: values.due_date_to ? formatDateForDB(values.due_date_to) : '',
        };
        
        console.log("Update data being sent:", updateData);
        
        const result = await api.updateCompliance(updateData);
        
        console.log("Update response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Compliance policy updated successfully!");
        fetchCompliancePolicies(); // Refresh the list
      } else {
        // Add new compliance policy
        console.log("Creating new compliance policy");
        
        const createData = {
          policy_id: values.policy_id?.toString() || '',
          policy_name: values.policy_name?.toString() || '',
          compliance_type: values.compliance_type?.toString() || '',
          status: values.status?.toString() || '1',
          asset_category: values.asset_category?.toString() || '',
          due_date_from: values.due_date_from ? formatDateForDB(values.due_date_from) : '',
          due_date_to: values.due_date_to ? formatDateForDB(values.due_date_to) : '',
        };
        
        console.log("Create data being sent:", createData);
        
        const result = await api.createCompliance(createData);
        
        console.log("Create response:", result);
        
        if (!result.success) {
          throw new Error(result.error || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Compliance policy added successfully!");
        fetchCompliancePolicies(); // Refresh the list
      }
      onClose();
    } catch (error) {
      console.error("Error saving compliance policy:", error);
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
        message.error(`❌ Failed to save compliance policy: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save compliance policy. Please check your connection and try again.");
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

  // Update the button click handler
  const handleNewAudit = () => {
    if (setActiveScreen) {
      setActiveScreen('new-audit');
    } else {
      navigate('/new-audit');
    }
  };

  return (
    <div className="container-fluid p-1">
      {/* Top Navigation Bar - Breadcrumb Only */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h2 className="mb-1">Compliance Management</h2>
          <p className="mt-0">Track and manage asset compliance policies and audits.</p>
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="Compliance_Policies_Report"
            title="Compliance Policies Report"
            reportType="compliance-policies"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add Policy
          </Button>
          <Button onClick={handleNewAudit}>
            New Audit
          </Button>
        </div>
      </div>

      <div className="card af-card mt-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Compliance Policies</h5>
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
        title={editingRecord ? "Update Compliance Policy" : "Add Compliance Policy"}
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
          {/* Policy Information */}
          <h5>Policy Information</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="policy_id"
                label="Policy ID"
                rules={[
                  { required: true, message: "Please enter policy ID" },
                  { max: 50, message: "Policy ID cannot exceed 50 characters" },
                  { pattern: /^[a-zA-Z0-9\-_]+$/, message: "Policy ID can only contain letters, numbers, hyphens, and underscores" }
                ]}
              >
                <Input placeholder="e.g., POL-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="policy_name"
                label="Policy Name"
                rules={[
                  { required: true, message: "Please enter policy name" },
                  { min: 2, message: "Policy name must be at least 2 characters" },
                  { max: 100, message: "Policy name cannot exceed 100 characters" }
                ]}
              >
                <Input placeholder="e.g., IT Security Policy" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="compliance_type"
                label="Compliance Type"
                rules={[
                  { required: true, message: "Please select compliance type" }
                ]}
              >
                <Select placeholder="Select compliance type">
                  <Option value="GDPR Compliance">GDPR Compliance</Option>
                  <Option value="Security Audit">Security Audit</Option>
                  <Option value="Regulatory Compliance">Regulatory Compliance</Option>
                  <Option value="Internal Policy">Internal Policy</Option>
                  <Option value="Industry Standard">Industry Standard</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select placeholder="Select status">
                  <Option value="1">Active</Option>
                  <Option value="0">Inactive</Option>
                  <Option value="2">Pending</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="asset_category"
                label="Asset Category"
                rules={[
                  { required: true, message: "Please enter asset category" },
                  { max: 50, message: "Asset category cannot exceed 50 characters" }
                ]}
              >
                <Input placeholder="e.g., IT Assets, Data Assets" />
              </Form.Item>
            </Col>
          </Row>

          <h5>Due Dates</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="due_date_from"
                label="Due Date From"
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
                name="due_date_to"
                label="Due Date To"
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
                {editingRecord ? "Update Policy" : "Add Policy"}
              </Button>
            </Space>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default Compliance;