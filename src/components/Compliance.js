import React, { useState, useEffect } from "react";
import { FaEye, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { Table, Input, Button, Space, Drawer, Form, Select, DatePicker, message, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

export default function Compliance({ setActiveScreen }) {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form] = Form.useForm();

  // Fetch compliance policies from API
  const fetchCompliancePolicies = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/compliance-policies');
      if (response.ok) {
        const data = await response.json();
        const dataWithKeys = data.map((item, index) => ({
          ...item,
          key: item.id || index,
        }));
        setDataSource(dataWithKeys);
        setPagination(prev => ({ ...prev, total: dataWithKeys.length }));
      } else {
        // Fallback to mock data
        const mockData = [
          {
            id: "POL-001",
            name: "Data Privacy Regulation",
            type: "Regulatory",
            dueDate: "2024-08-01",
            status: "Compliant",
            lastAudit: "2024-07-10",
          },
          {
            id: "POL-002",
            name: "Internal Security Policy",
            type: "Internal",
            dueDate: "2024-07-15",
            status: "Non-Compliant",
            lastAudit: "2024-07-05",
          },
          {
            id: "POL-003",
            name: "ISO 27001 Standard",
            type: "Industry Standard",
            dueDate: "2024-09-01",
            status: "Pending Audit",
            lastAudit: "N/A",
          },
          {
            id: "POL-004",
            name: "Asset Tagging Policy",
            type: "Internal",
            dueDate: "2024-06-30",
            status: "Audited",
            lastAudit: "2024-06-28",
          },
          {
            id: "POL-005",
            name: "Environmental Regulations",
            type: "Regulatory",
            dueDate: "2024-10-01",
            status: "Compliant",
            lastAudit: "2024-09-05",
          },
        ];
        const dataWithKeys = mockData.map((item, index) => ({
          ...item,
          key: item.id || index,
        }));
        setDataSource(dataWithKeys);
        setPagination(prev => ({ ...prev, total: dataWithKeys.length }));
      }
    } catch (error) {
      console.error('Error fetching compliance policies:', error);
      message.error('Failed to fetch compliance policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliancePolicies();
  }, []);

  // Filter data based on search text
  const filteredData = dataSource.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // Handle table change (pagination, sorting)
  const handleTableChange = (paginationConfig) => {
    setPagination(paginationConfig);
  };

  // Handle form submission
  const handleSave = async (values) => {
    try {
      const response = await fetch('http://localhost:3000/api/compliance-policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success('Compliance policy saved successfully');
        setDrawerVisible(false);
        form.resetFields();
        fetchCompliancePolicies();
      } else {
        message.error('Failed to save compliance policy');
      }
    } catch (error) {
      console.error('Error saving compliance policy:', error);
      message.error('Failed to save compliance policy');
    }
  };

  // Handle edit
  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingIndex(record.key);
    setDrawerVisible(true);
  };

  // Handle delete
  const handleDelete = async (record) => {
    try {
      const response = await fetch(`http://localhost:3000/api/compliance-policies/${record.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        message.success('Compliance policy deleted successfully');
        fetchCompliancePolicies();
      } else {
        message.error('Failed to delete compliance policy');
      }
    } catch (error) {
      console.error('Error deleting compliance policy:', error);
      message.error('Failed to delete compliance policy');
    }
  };

  // Handle create new
  const handleCreate = () => {
    form.resetFields();
    setEditingIndex(null);
    setDrawerVisible(true);
  };

  // Update the button click handler
  const handleNewAudit = () => {
    setActiveScreen('new-audit');
  };

  // Status badge colors
  const getStatusClass = (status) => {
    switch (status) {
      case "Compliant":
        return "badge bg-success";
      case "Non-Compliant":
        return "badge bg-danger";
      case "Pending Audit":
        return "badge bg-warning text-dark";
      case "Audited":
        return "badge bg-info text-dark";
      default:
        return "badge bg-secondary";
    }
  };

  // Define table columns
  const columns = [
    {
      title: 'Policy ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: 'Policy Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => (
        <span className={getStatusClass(status)}>
          {status}
        </span>
      ),
    },
    {
      title: 'Last Audit',
      dataIndex: 'lastAudit',
      key: 'lastAudit',
      sorter: (a, b) => a.lastAudit.localeCompare(b.lastAudit),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<FaEye />}
            onClick={() => console.log('View', record)}
          />
          <Button
            type="link"
            icon={<FaEdit />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this compliance policy?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<FaTrash />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid p-1 position-relative" style={{ minHeight: "100vh" }}>

      {/* Title and Description */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Compliance</h2>
          <p className="mt-0 text-muted">Track and manage asset compliance</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-3">
          <Input
            placeholder="Search compliance policies..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <div className="d-flex gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            loading={loading}
          >
            Add Policy
          </Button>
          <Button onClick={handleNewAudit}>
            New Audit
          </Button>
        </div>
      </div>

      {/* Ant Design Table */}
      <div className="card shadow-sm">
        <div className="card-body">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['5', '10', '20', '50'],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        </div>
      </div>

      {/* Drawer for Form */}
      <Drawer
        title={editingIndex ? "Edit Compliance Policy" : "Create Compliance Policy"}
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button onClick={() => form.submit()} type="primary" loading={loading}>
              {editingIndex ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            status: 'Pending Audit',
            type: 'Internal',
          }}
        >
          <Form.Item
            name="id"
            label="Policy ID"
            rules={[{ required: true, message: 'Please enter policy ID' }]}
          >
            <Input placeholder="Enter policy ID" />
          </Form.Item>

          <Form.Item
            name="name"
            label="Policy Name"
            rules={[{ required: true, message: 'Please enter policy name' }]}
          >
            <Input placeholder="Enter policy name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="Regulatory">Regulatory</Select.Option>
              <Select.Option value="Internal">Internal</Select.Option>
              <Select.Option value="Industry Standard">Industry Standard</Select.Option>
              <Select.Option value="Legal">Legal</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Select.Option value="Compliant">Compliant</Select.Option>
              <Select.Option value="Non-Compliant">Non-Compliant</Select.Option>
              <Select.Option value="Pending Audit">Pending Audit</Select.Option>
              <Select.Option value="Audited">Audited</Select.Option>
              <Select.Option value="Exempt">Exempt</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="lastAudit"
            label="Last Audit"
            rules={[{ required: true, message: 'Please enter last audit date' }]}
          >
            <Input placeholder="Enter last audit date" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}