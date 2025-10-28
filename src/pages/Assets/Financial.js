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
import { formatDateForDB, parseDateFromDB } from "../../utils/dateUtils";
import { safeStringCompare } from '../../utils/tableUtils';
import { AssetIdsDropdown, DepreciationMethodsDropdown } from '../../components/SettingsDropdown';

const { Option } = Select;

const Financial = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  // Fetch financial data from API
  const fetchFinancials = async () => {
    setLoading(true);
    try {
      console.log('Fetching financial records from API...');
      const response = await fetch(`http://202.53.92.35:5004/api/assets/financial`, {
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
      } else if (result.financials && Array.isArray(result.financials)) {
        data = result.financials;
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
      message.success(`Financial records loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching financial records:", error);
      message.error(`Failed to load financial records: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
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
      'asset_id', 'depreciation_method', 'purchase_value', 'salvage_value', 
      'useful_life_years', 'monthly_depreciation', 'accumulated_depreciation', 'general_ledger_code'
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
      asset_id: { 
        title: "Asset ID", 
        sorter: (a, b) => safeStringCompare(a.asset_id, b.asset_id),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.asset_id?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search asset ID"
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
        filteredValue: filteredInfo.asset_id || null,
      },
      depreciation_method: { 
        title: "Depreciation Method", 
        sorter: (a, b) => safeStringCompare(a.depreciation_method, b.depreciation_method),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.depreciation_method?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search depreciation method"
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
        filteredValue: filteredInfo.depreciation_method || null,
      },
      purchase_value: { 
        title: "Purchase Value", 
        sorter: (a, b) => safeStringCompare(a.purchase_value, b.purchase_value),
        render: (text) => text && text !== 'N/A' ? `₹${text}` : '-',
        onFilter: (value, record) => record.purchase_value?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search purchase value"
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
        filteredValue: filteredInfo.purchase_value || null,
      },
      general_ledger_code: { 
        title: "General Ledger Code", 
        sorter: (a, b) => safeStringCompare(a.general_ledger_code, b.general_ledger_code),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.general_ledger_code?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search general ledger code"
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
        filteredValue: filteredInfo.general_ledger_code || null,
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
    setEditingFinancial(null);
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
    
    // Set form values with cleaned data
    form.setFieldsValue({
      asset_id: cleanValue(record.asset_id),
      depreciation_method: cleanValue(record.depreciation_method),
      purchase_value: cleanValue(record.purchase_value),
      salvage_value: cleanValue(record.salvage_value),
      useful_life_years: cleanValue(record.useful_life_years),
      monthly_depreciation: cleanValue(record.monthly_depreciation),
      accumulated_depreciation: cleanValue(record.accumulated_depreciation),
      general_ledger_code: cleanValue(record.general_ledger_code),
    });
    
    setEditingFinancial(record);
    setDrawerVisible(true);
  };

  // Handle delete
  const handleDelete = (record) => {
    console.log("Delete record:", record);
    console.log("Record ID:", record.id || record.key);
    
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this financial record?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/assets/financial", {
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
            message.success("Financial record deleted successfully!");
            await fetchFinancials(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete financial record: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting financial record:", error);
          message.error(`Failed to delete financial record: ${error.message}`);
        }
      },
    });
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Financial form submitted with values:", values);
    message.loading("Saving financial data...", 0);
    
    try {
      setLoading(true);
      
      if (editingFinancial) {
        // Update existing financial record
        console.log("Updating financial record:", editingFinancial);
        const updateData = {
          id: editingFinancial.id,
          asset_id: values.asset_id,
          depreciation_method: values.depreciation_method,
          purchase_value: values.purchase_value,
          salvage_value: values.salvage_value,
          useful_life_years: values.useful_life_years,
          monthly_depreciation: values.monthly_depreciation,
          accumulated_depreciation: values.accumulated_depreciation,
          general_ledger_code: values.general_ledger_code
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
        const response = await axios.put("http://202.53.92.35:5004/api/assets/financial", updateData,{
           headers: {
            "x-access-token":  sessionStorage.getItem("token"),
          }
        });
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Financial record updated successfully!");
      } else {
        // Create new financial record
        console.log("Creating new financial record");
        const createData = {
          asset_id: values.asset_id,
          depreciation_method: values.depreciation_method,
          purchase_value: values.purchase_value,
          salvage_value: values.salvage_value,
          useful_life_years: values.useful_life_years,
          monthly_depreciation: values.monthly_depreciation,
          accumulated_depreciation: values.accumulated_depreciation,
          general_ledger_code: values.general_ledger_code
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        
        const response = await axios.post("http://202.53.92.35:5004/api/assets/financial", createData,{
           headers: {
            "x-access-token":  sessionStorage.getItem("token"),
          }
        });
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Financial record created successfully!");
      }
      
      // Refresh the table data immediately
      await fetchFinancials();
      
      form.resetFields();
      setEditingFinancial(null);
      setDrawerVisible(false);
    } catch (error) {
      console.error("Error saving financial data:", error);
      message.destroy(); // Clear loading message
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save financial data: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save financial data. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingFinancial(null);
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
          <h2 className="mb-1">Asset Depreciation & Financials</h2>
          <span className="text-muted">The core screen for managing asset depreciation, financial records, and accounting details.</span>
        </div>
        <div className="d-flex gap-2">
         
          <ExportButton
            data={dataSource}
            columns={null}
            filename="Financial_Management_Report"
            title="Financial Management Report"
            reportType="financial-management"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
            includeAllFields={true}
          />
          <button
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Financial Record
          </button>
        </div>
      </div>

      {/* Financial Records Table */}
    
          
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
        title={editingFinancial !== null ? "Edit Financial Record" : "Add Financial Record"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
            {/* Asset Information */}
            <h5 className="mb-2">Asset Information</h5>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="asset_id"
                  label="Asset ID"
                  rules={[{ required: true, message: "Please select asset ID" }]}
                >
                  <AssetIdsDropdown 
                    placeholder="Select asset ID"
                    showSearch={true}
                    allowClear={true}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Depreciation Parameters */}
            <h5 className="mb-2">Depreciation Parameters</h5>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="depreciation_method"
                  label="Depreciation Method"
                  rules={[{ required: true, message: "Please select depreciation method" }]}
                >
                  <DepreciationMethodsDropdown 
                    placeholder="Select depreciation method"
                    showSearch={true}
                    allowClear={true}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="purchase_value"
                  label="Purchase Value"
                  rules={[{ required: true, message: "Please enter purchase value" }]}
                >
                  <InputNumber 
                    placeholder="Enter purchase value (e.g., 1200.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="salvage_value"
                  label="Salvage Value"
                  rules={[{ required: true, message: "Please enter salvage value" }]}
                >
                  <InputNumber 
                    placeholder="Enter salvage value (e.g., 200.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="useful_life_years"
                  label="Useful Life (Years)"
                  rules={[{ required: true, message: "Please enter useful life in years" }]}
                >
                  <InputNumber 
                    placeholder="Enter useful life (e.g., 5)" 
                    style={{ width: '100%' }}
                    min={1}
                    max={100}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Financial Details */}
            <h5 className="mb-2">Financial Details</h5>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="monthly_depreciation"
                  label="Monthly Depreciation"
                  rules={[{ required: true, message: "Please enter monthly depreciation" }]}
                >
                  <InputNumber 
                    placeholder="Enter monthly depreciation (e.g., 20.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="accumulated_depreciation"
                  label="Accumulated Depreciation"
                  rules={[{ required: true, message: "Please enter accumulated depreciation" }]}
                >
                  <InputNumber 
                    placeholder="Enter accumulated depreciation (e.g., 800.00)" 
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
                  name="general_ledger_code"
                  label="General Ledger Code"
                  rules={[{ required: true, message: "Please enter general ledger code" }]}
                >
                  <Input placeholder="Enter general ledger code (e.g., GL-DEP-2023-001)" />
                </Form.Item>
              </Col>
            </Row>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={onReset} disabled={loading}>Reset</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingFinancial !== null ? 'Update Financial Record' : 'Add Financial Record'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Financial;