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
  message,
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
  AssetIdsDropdown
} from '../../components/SettingsDropdown';

const Transfer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  // Fetch transfer data from API
  const fetchTransfers = async () => {
    setLoading(true);
    try {
      console.log('Fetching transfers from API...');
      const response = await fetch(`http://202.53.92.35:5004/api/assets/transfer`, {
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
      } else if (result.transfers && Array.isArray(result.transfers)) {
        data = result.transfers;
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
      message.success(`Transfers loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching transfers:", error);
      message.error(`Failed to load transfers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
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
      'transfer_id', 'asset_id', 'current_location_or_user', 'new_location_or_user', 
      'transfer_date', 'justification', 'approver_name'
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
      transfer_id: { 
        title: "Transfer ID", 
        sorter: (a, b) => safeStringCompare(a.transfer_id, b.transfer_id),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.transfer_id?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search transfer ID"
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
        filteredValue: filteredInfo.transfer_id || null,
      },
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
      current_location_or_user: { 
        title: "Current Location/User", 
        sorter: (a, b) => safeStringCompare(a.current_location_or_user, b.current_location_or_user),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.current_location_or_user?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search current location"
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
        filteredValue: filteredInfo.current_location_or_user || null,
      },
      new_location_or_user: { 
        title: "New Location/User", 
        sorter: (a, b) => safeStringCompare(a.new_location_or_user, b.new_location_or_user),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.new_location_or_user?.toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search new location"
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
        filteredValue: filteredInfo.new_location_or_user || null,
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
    setEditingTransfer(null);
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
      transfer_id: cleanValue(record.transfer_id),
      asset_id: cleanValue(record.asset_id),
      current_location_or_user: cleanValue(record.current_location_or_user),
      new_location_or_user: cleanValue(record.new_location_or_user),
      transfer_date: formatDateForInput(record.transfer_date),
      justification: cleanValue(record.justification),
      approver_name: cleanValue(record.approver_name),
    });
    
    setEditingTransfer(record);
    setDrawerVisible(true);
  };

  // Handle delete
  const handleDelete = (record) => {
    console.log("Delete record:", record);
    console.log("Record ID:", record.id || record.key);
    
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this transfer?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const deleteId = record.id || record.key;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/assets/transfer", {
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
            message.success("Transfer deleted successfully!");
            await fetchTransfers(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete transfer: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting transfer:", error);
          message.error(`Failed to delete transfer: ${error.message}`);
        }
      },
    });
  };

  // Submit form
  const onFinish = async (values) => {
    console.log("Transfer form submitted with values:", values);
    message.loading("Saving transfer...", 0);
    
    try {
      setLoading(true);
      
      if (editingTransfer) {
        // Update existing transfer
        console.log("Updating transfer:", editingTransfer);
        const updateData = {
          id: editingTransfer.id,
          transfer_id: values.transfer_id,
          asset_id: values.asset_id,
          current_location_or_user: values.current_location_or_user,
          new_location_or_user: values.new_location_or_user,
          transfer_date: formatDateForAPI(values.transfer_date),
          justification: values.justification,
          approver_name: values.approver_name
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));

        const token = sessionStorage.getItem('token') || '';
        console.log("Using token:", token); 

        const response = await axios.put("http://202.53.92.35:5004/api/assets/transfer", updateData, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });

        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Transfer updated successfully!");
      } else {
        // Create new transfer
        console.log("Creating new transfer");
        const createData = {
          transfer_id: values.transfer_id,
          asset_id: values.asset_id,
          current_location_or_user: values.current_location_or_user,
          new_location_or_user: values.new_location_or_user,
          transfer_date: formatDateForAPI(values.transfer_date),
          justification: values.justification,
          approver_name: values.approver_name
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));

         const token = sessionStorage.getItem('token') || '';
        
        const response = await axios.post("http://202.53.92.35:5004/api/assets/transfer", createData,{
          headers : {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Asset transferred successfully!");
      }
      
      // Refresh the table data immediately
      await fetchTransfers();
      
      form.resetFields();
      setEditingTransfer(null);
      setDrawerVisible(false);
    } catch (error) {
      console.error("Error saving transfer:", error);
      message.destroy(); // Clear loading message
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save transfer: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save transfer. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingTransfer(null);
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
          <h2 className="mb-1">Asset Transfer</h2>
          <span className="text-muted">The core screen for managing asset transfers between locations and users.</span>
        </div>
        <div className="d-flex gap-2">
         
          <ExportButton
            data={dataSource}
            columns={columns}
            filename="Transfer_Management_Report"
            title="Transfer Management Report"
            reportType="transfer-management"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
            includeAllFields={true}
          />
          <button
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Transfer
          </button>
        </div>
      </div>

      {/* Transfers Table */}
   
         
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
        title={editingTransfer !== null ? "Edit Transfer" : "Add Transfer"}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
            {/* Section 1: Transfer Identification */}
            <h5 className="mb-2">Transfer Identification</h5>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="transfer_id"
                  label="Transfer ID"
                  rules={[{ required: true, message: "Please enter transfer ID" }]}
                >
                  <Input placeholder="Enter transfer ID (e.g., TRF-2025-001)" />
                </Form.Item>
              </Col>
              <Col span={12}>
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

            {/* Section 2: Transfer Logistics */}
            <h5 className="mb-2">Transfer Logistics</h5>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="current_location_or_user"
                  label="Current Location or User"
                  rules={[{ required: true, message: "Please select current location" }]}
                >
                  <LocationsDropdown 
                    placeholder="Select current location"
                    showSearch={true}
                    allowClear={true}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="new_location_or_user"
                  label="New Location or User"
                  rules={[{ required: true, message: "Please select new location" }]}
                >
                  <LocationsDropdown 
                    placeholder="Select new location"
                    showSearch={true}
                    allowClear={true}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="transfer_date"
                  label="Transfer Date"
                  rules={[{ required: true, message: "Please select transfer date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            {/* Section 3: Justification & Approval */}
            <h5 className="mb-2">Justification & Approval</h5>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="justification"
                  label="Justification"
                  rules={[{ required: true, message: "Please enter justification" }]}
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Enter justification for transfer"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="approver_name"
                  label="Approver's Name"
                  rules={[{ required: true, message: "Please enter approver's name" }]}
                >
                  <Input placeholder="Enter approver's name" />
                </Form.Item>
              </Col>
            </Row>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={onReset} disabled={loading}>Reset</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                {editingTransfer !== null ? 'Update Transfer' : 'Add Transfer'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default Transfer;