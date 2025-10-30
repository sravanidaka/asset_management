import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import CustomBreadcrumb from '../../components/Breadcrumb';
import BackNavigation from '../../components/BackNavigation';
import ExportButton from '../../components/ExportButton';
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
  Modal,
  Space
} from "antd";
import { FaEdit, FaTrash } from "react-icons/fa";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { formatDateForDB, parseDateFromDB, formatDateForAPI } from "../../utils/dateUtils";
import { safeStringCompare } from '../../utils/tableUtils';
import {
  StatusNamesDropdown,
  CategoriesDropdown,
  LocationsDropdown,
  VendorNamesDropdown,
  AssetIdsDropdown
} from '../../components/SettingsDropdown';
import { getEmployeeNamesDropdown } from '../../services/settingsService';

const { Option } = Select;

const Disposal = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingDisposal, setEditingDisposal] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // Fetch disposal data from API
  const fetchDisposals = async () => {
    setLoading(true);
    try {
      console.log('Fetching disposal records from API...');
      const response = await fetch(`http://202.53.92.35:5004/api/assets/disposal`, {
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
      } else if (result.disposals && Array.isArray(result.disposals)) {
        data = result.disposals;
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

      setDataSource(dataWithKeys);
      message.success(`Disposal records loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching disposal records:", error);
      message.error(`Failed to load disposal records: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisposals();
  }, []);

  // Load approver options for dropdown
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const employees = await getEmployeeNamesDropdown();
        const options = (Array.isArray(employees) ? employees : []).map((item, index) => {
          if (typeof item === 'string') {
            const s = item.trim();
            return { label: s, value: s, id: s };
          }
          const firstName = item.first_name || item.firstname || item.firstName || '';
          const lastName = item.last_name || item.lastname || item.lastName || '';
          const combined = `${firstName} ${lastName}`.trim();
          const label = item.label || item.employee_name || item.full_name || item.fullName || item.name || combined || String(item.value || '').trim();
          const value = item.id || item.employee_id || item.emp_id || item.user_id || item.value || label || index;
          return { label, value, id: value };
        });
        setEmployeeOptions(options);
      } catch (e) {
        console.error('Failed to load employee options:', e);
        setEmployeeOptions([]);
      }
    };
    loadEmployees();
  }, []);

  // Handle table change for filters and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Dynamic table columns based on available data
  const getDynamicColumns = () => {
    if (dataSource.length === 0) return [];

    // Define only the fields that should be shown
    const allPossibleFields = [
      'asset_code', 'disposal_type', 'disposal_date', 'approver_name',
      'disposal_reason', 'sale_price', 'book_value', 'buyer_name'
    ];

    // Get fields that have actual data (not N/A, null, undefined, empty)
    const getFieldsWithData = () => {
      const fieldsWithData = new Set();

      // First, add all possible fields that exist in the data
      allPossibleFields.forEach(field => {
        if (dataSource.some(item => item[field] !== undefined && item[field] !== null)) {
          fieldsWithData.add(field);
        }
      });

      // Then add any other fields that have data
      dataSource.forEach(item => {
        Object.keys(item).forEach(key => {
          if (key !== 'key' &&
            item[key] !== 'N/A' &&
            item[key] !== null &&
            item[key] !== undefined &&
            item[key] !== '' &&
            item[key] !== 'null' &&
            item[key] !== 'undefined') {
            fieldsWithData.add(key);
          }
        });
      });

      return Array.from(fieldsWithData);
    };

    const availableFields = getFieldsWithData();

    // Define field mappings with display names, render functions, and filters
    const fieldMappings = {
      asset_code: {
        title: "Asset Code",
        sorter: (a, b) => safeStringCompare(a.asset_code, b.asset_code),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.asset_code?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search asset code"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
        filteredValue: filteredInfo.asset_code || null,
      },
      disposal_type: {
        title: "Disposal Type",
        sorter: (a, b) => safeStringCompare(a.disposal_type, b.disposal_type),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.disposal_type?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search disposal type"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
        filteredValue: filteredInfo.disposal_type || null,
      },
      approver_name: {
        title: "Approver Name",
        sorter: (a, b) => safeStringCompare(a.approver_name, b.approver_name),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.approver_name?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search approver name"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
        filteredValue: filteredInfo.approver_name || null,
      },
      sale_price: {
        title: "Sale Price",
        sorter: (a, b) => safeStringCompare(a.sale_price, b.sale_price),
        render: (text) => text && text !== 'N/A' ? `₹${text}` : '-',
        onFilter: (value, record) => record.sale_price?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search sale price"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
        filteredValue: filteredInfo.sale_price || null,
      },
      buyer_name: {
        title: "Buyer Name",
        sorter: (a, b) => safeStringCompare(a.buyer_name, b.buyer_name),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.buyer_name?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search buyer name"
              value={selectedKeys[0]}
              onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
        filteredValue: filteredInfo.buyer_name || null,
      }
    };

    // Create columns for all possible fields first, then add any additional fields
    const columns = [];

    // Add Serial Number column
    columns.push({
      title: "S.No",
      key: "serial",
      width: 80,
      render: (text, record, index) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    });

    // Add all standard fields
    allPossibleFields.forEach(field => {
      if (fieldMappings[field]) {
        columns.push({
          title: fieldMappings[field].title,
          dataIndex: field,
          key: field,
          sorter: fieldMappings[field].sorter,
          render: fieldMappings[field].render,
          onFilter: fieldMappings[field].onFilter,
          filterDropdown: fieldMappings[field].filterDropdown,
          filteredValue: fieldMappings[field].filteredValue,
          ellipsis: true,
        });
      }
    });

    // Add any additional fields that aren't in the standard list
    availableFields
      .filter(field => !allPossibleFields.includes(field) && fieldMappings[field])
      .forEach(field => {
        columns.push({
          title: fieldMappings[field].title,
          dataIndex: field,
          key: field,
          sorter: fieldMappings[field].sorter,
          render: fieldMappings[field].render,
          onFilter: fieldMappings[field].onFilter,
          filterDropdown: fieldMappings[field].filterDropdown,
          filteredValue: fieldMappings[field].filteredValue,
          ellipsis: true,
        });
      });

    // Add Actions column
    columns.push({
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="default" size="small" icon={<FaEdit />} onClick={() => handleEdit(record)} />
          {/* <Button type="primary" danger size="small" icon={<FaTrash />} onClick={() => handleDelete(record)} /> */}
        </Space>
      ),
    });

    return columns;
  };

  const columns = getDynamicColumns();

  // Open drawer for create
  const handleCreate = () => {
    form.resetFields();
    setEditingDisposal(null);
    setDrawerVisible(true);
  };

  // Open drawer for edit
  const handleEdit = (record) => {
    console.log("Edit record:", record);

    // Helper function to clean values (remove N/A, null, undefined)
    const cleanValue = (value) => {
      if (value === 'N/A' || value === null || value === undefined || value === '') {
        return undefined; // Return undefined so form field shows as empty
      }
      return value;
    };

    // Helper function to format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateValue) => {
      if (!dateValue) return undefined;
      try {
        // If it's already in YYYY-MM-DD format, return as is
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
          return dateValue;
        }
        // If it's an ISO date string, extract just the date part
        if (typeof dateValue === 'string' && dateValue.includes('T')) {
          return dateValue.split('T')[0];
        }
        // Use the dateUtils function to format properly
        return formatDateForAPI(dateValue);
      } catch (error) {
        console.error('Error formatting date for input:', error);
        return undefined;
      }
    };

    // Set form values with cleaned data
    form.setFieldsValue({
      asset_code: cleanValue(record.asset_code),
      disposal_type: cleanValue(record.disposal_type),
      disposal_date: formatDateForInput(record.disposal_date),
      approver_name: cleanValue(record.approver_name),
      disposal_reason: cleanValue(record.disposal_reason),
      sale_price: cleanValue(record.sale_price),
      book_value: cleanValue(record.book_value),
      buyer_name: cleanValue(record.buyer_name),
    });

    setEditingDisposal(record);
    setDrawerVisible(true);
  };

  // Handle delete
  const handleDelete = (record) => {
    console.log("Delete record:", record);
    console.log("Record ID:", record.id || record.key);

    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this disposal record?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);

          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/assets/disposal", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": sessionStorage.getItem("token"),
            },
            body: JSON.stringify({ id: deleteId }),
          });

          console.log("Delete response status:", response.status);
          console.log("Delete response ok:", response.ok);

          if (response.ok) {
            const result = await response.json();
            console.log("Delete response data:", result);
            message.success("Disposal record deleted successfully!");
            await fetchDisposals(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete disposal record: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting disposal record:", error);
          message.error(`Failed to delete disposal record: ${error.message}`);
        }
      },
    });
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Disposal form submitted with values:", values);
    message.loading("Saving disposal data...", 0);

    try {
      setLoading(true);
      // resolve approver id to name
      const getEmployeeName = async (employeeId) => {
        try {
          const employees = await getEmployeeNamesDropdown();
          const employee = (employees || []).find(emp => (emp.id ?? emp.value) == employeeId);
          return employee ? (employee.name || employee.label || employeeId) : employeeId;
        } catch (_) { return employeeId; }
      };
      const approverName = await getEmployeeName(values.approver_name);

      if (editingDisposal) {
        // Update existing disposal record
        console.log("Updating disposal record:", editingDisposal);
        const updateData = {
          id: editingDisposal.id,
          asset_code: values.asset_code,
          disposal_type: values.disposal_type,
          disposal_date: formatDateForAPI(values.disposal_date),
          approver_name: approverName,
          disposal_reason: values.disposal_reason,
          sale_price: values.sale_price,
          book_value: values.book_value,
          buyer_name: values.buyer_name
        };

        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));

        // Use PUT for updates
        const response = await axios.put(
          "http://202.53.92.35:5004/api/assets/disposal",
          updateData,
          {
            headers: {
              "x-access-token": sessionStorage.getItem("token"),
              "Content-Type": "application/json"
            }
          }
        );

        console.log("Update response:", response.data);

        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }

        message.destroy(); // Clear loading message
        message.success("✅ Disposal record updated successfully!");
      } else {
        // Create new disposal record
        console.log("Creating new disposal record");
        const createData = {
          asset_code: values.asset_code,
          disposal_type: values.disposal_type,
          disposal_date: formatDateForAPI(values.disposal_date),
          approver_name: approverName,
          disposal_reason: values.disposal_reason,
          sale_price: values.sale_price,
          book_value: values.book_value,
          buyer_name: values.buyer_name
        };

        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));

        const response = await axios.post("http://202.53.92.35:5004/api/assets/disposal", createData, {
          headers: {
            "x-access-token": sessionStorage.getItem("token"),
          }
        });

        console.log("Create response:", response.data);

        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }

        message.destroy(); // Clear loading message
        message.success("✅ Disposal record created successfully!");
      }

      // Refresh the table data immediately
      await fetchDisposals();

      form.resetFields();
      setEditingDisposal(null);
      setDrawerVisible(false);
    } catch (error) {
      console.error("Error saving disposal data:", error);
      message.destroy(); // Clear loading message

      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save disposal data: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save disposal data. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingDisposal(null);
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
        <div>
          <h2 className="mb-1">Asset Disposal / Retirement</h2>
          <span className="text-muted">The core screen for managing asset disposal, retirement, and end-of-life processes.</span>
        </div>
        <div className="d-flex gap-2">

          <ExportButton
            data={dataSource}
            columns={null}
            filename="Disposal_Management_Report"
            title="Disposal Management Report"
            reportType="disposal-management"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
            includeAllFields={true}
          />
          <button
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Disposal Record
          </button>
        </div>
      </div>

      {/* Disposal Records Table */}


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


      {/* Drawer Form */}
      <Drawer
        title={editingDisposal !== null ? "Edit Disposal Record" : "Add Disposal Record"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          {/* Asset Identification */}
          <h5 className="mb-2">Asset Identification</h5>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="asset_code"
                label="Asset Code"
                rules={[{ required: true, message: "Please select asset code" }]}
              >
                <AssetIdsDropdown
                  placeholder="Select asset code"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Disposal Information */}
          <h5 className="mb-2">Disposal Information</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="disposal_type"
                label="Disposal Type"
                rules={[{ required: true, message: "Please select disposal type" }]}
              >
                <Select placeholder="Select disposal type">
                  <Option value="Sale">Sale</Option>
                  <Option value="Write-off">Write-off</Option>
                  <Option value="Auction">Auction</Option>
                  <Option value="Donation">Donation</Option>
                  <Option value="Scrap">Scrap</Option>
                  <Option value="Trade-in">Trade-in</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="disposal_date"
                label="Disposal Date"
                rules={[{ required: true, message: "Please select disposal date" }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="approver_name"
                label="Approver's Name"
                rules={[{ required: true, message: "Please select approver's name" }]}
              >
                <Select
                  placeholder="Select approver's name"
                  showSearch
                  allowClear
                  options={employeeOptions}
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="disposal_reason"
                label="Reason for Disposal"
                rules={[{ required: true, message: "Please enter disposal reason" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter reason for disposal"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Financial & Buyer Details */}
          <h5 className="mb-2">Financial & Buyer Details</h5>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sale_price"
                label="Sale Price"
                rules={[{ required: true, message: "Please enter sale price" }]}
              >
                <InputNumber
                  placeholder="Enter sale price (e.g., 50.00)"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="book_value"
                label="Book Value"
                rules={[{ required: true, message: "Please enter book value" }]}
              >
                <InputNumber
                  placeholder="Enter book value (e.g., 75.00)"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="buyer_name"
                label="Buyer's Name / Company"
                rules={[{ required: true, message: "Please select buyer" }]}
              >
                <VendorNamesDropdown
                  placeholder="Select buyer or company"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button size="large" className="drawer-primary-btn px-4" onClick={() => setDrawerVisible(false)} disabled={loading}>Close</Button>
              <Button size="large" className="drawer-primary-btn px-4" htmlType="submit" loading={loading}>
                {editingDisposal !== null ? 'Update Disposal Record' : 'Add Disposal Record'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Disposal;