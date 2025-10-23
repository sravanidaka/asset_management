import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Drawer, Form, Input, Select, message, Modal, DatePicker } from 'antd';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '../../../components/Breadcrumb';
import BackNavigation from '../../../components/BackNavigation';
import axios from 'axios';
import dayjs from 'dayjs';

const ManageEmployee = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch employees from API
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      console.log('Fetching employees from API...');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getEmployeeList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token,
        }
      });
      
      console.log('API Response status:', response.status);
      
      const result = await response.json();
      console.log('Employees API Response:', result);
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.employees && Array.isArray(result.employees)) {
        data = result.employees;
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
        key: item.employee_id || item.id || index.toString(),
      }));
      
      setEmployees(dataWithKeys);
      message.success(`Employees loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching employees:", error);
      message.error(`Failed to load employees: ${error.message}`);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle create/update employee
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const employeeData = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        department: values.department,
        reported_to: values.reported_to,
        role: values.role,
        date_of_joining: values.date_of_joining ? dayjs(values.date_of_joining).format('YYYY-MM-DD') : null,
        status: values.status || 'Active'
      };

      let response;
      if (editingEmployee) {
        // Update existing employee
        const updateData = {
          employee_id: editingEmployee.employee_id,
          ...employeeData
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));

        const token = sessionStorage.getItem('token') || '';
        console.log("Using token:", token); 

        response = await axios.put("http://202.53.92.35:5004/api/settings/updateEmployee", updateData, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });

        console.log("Update response:", response.data);
        message.success('Employee updated successfully!');
      } else {
        // Create new employee
        console.log("Creating new employee");
        console.log("Create data being sent:", employeeData);
        console.log("Create data types:", Object.keys(employeeData).map(key => `${key}: ${typeof employeeData[key]}`));

        const token = sessionStorage.getItem('token') || '';
        
        response = await axios.post("http://202.53.92.35:5004/api/settings/createEmployee", employeeData, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });
        
        console.log("Create response:", response.data);
        message.success('Employee created successfully!');
      }

      setDrawerOpen(false);
      form.resetFields();
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save employee: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save employee. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit employee
  const handleEdit = (record) => {
    setEditingEmployee(record);
    form.setFieldsValue({
      first_name: record.first_name,
      last_name: record.last_name,
      email: record.email,
      phone: record.phone,
      department: record.department,
      reported_to: record.reported_to,
      role: record.role,
      date_of_joining: record.date_of_joining ? dayjs(record.date_of_joining) : null,
      status: record.status
    });
    setDrawerOpen(true);
  };

  // Handle delete employee
  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this employee?',
      content: `This will permanently delete ${record.first_name} ${record.last_name}.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const deleteId = record.employee_id || record.id;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deleteEmployee", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": sessionStorage.getItem("token"),
            },
            body: JSON.stringify({ employee_id: deleteId }),
          });
          
          console.log("Delete response status:", response.status);
          console.log("Delete response ok:", response.ok);
          
          if (response.ok) {
            const result = await response.json();
            console.log("Delete response data:", result);
            message.success("Employee deleted successfully!");
            await fetchEmployees(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete employee: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting employee:", error);
          message.error(`Failed to delete employee: ${error.message}`);
        }
      }
    });
  };

  // Export functionality
  const exportEmployees = () => {
    const csvContent = [
      ['S.No', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Reported To', 'Role', 'Date of Joining', 'Status'],
      ...filteredEmployees.map((employee, index) => [
        index + 1,
        employee.first_name,
        employee.last_name,
        employee.email || '',
        employee.phone || '',
        employee.department || '',
        employee.reported_to || '',
        employee.role || '',
        employee.date_of_joining || '',
        employee.status || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesStatus = selectedStatus === '' || employee.status === selectedStatus;
    return matchesStatus;
  });

  // Table columns
  const columns = [
    {
      title: 'S.No',
      key: 'serial',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: (a, b) => (a.first_name || '').localeCompare(b.first_name || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search first name"
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.first_name?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name',
      sorter: (a, b) => (a.last_name || '').localeCompare(b.last_name || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search last name"
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.last_name?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search email"
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.email?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
            placeholder="Search phone"
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
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        ),
      onFilter: (value, record) =>
        record.phone?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      sorter: (a, b) => (a.department || '').localeCompare(b.department || ''),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
            placeholder="Search department"
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
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        ),
      onFilter: (value, record) =>
        record.department?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Reported To',
      dataIndex: 'reported_to',
      key: 'reported_to',
      sorter: (a, b) => (a.reported_to || '').localeCompare(b.reported_to || ''),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
            placeholder="Search reported to"
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
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        ),
      onFilter: (value, record) =>
        record.reported_to?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      sorter: (a, b) => (a.role || '').localeCompare(b.role || ''),
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
            placeholder="Search role"
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
              <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </div>
        ),
      onFilter: (value, record) =>
        record.role?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Date of Joining',
      dataIndex: 'date_of_joining',
      key: 'date_of_joining',
      sorter: (a, b) => new Date(a.date_of_joining || 0) - new Date(b.date_of_joining || 0),
      render: (value) => value ? dayjs(value).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`badge ${status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
          {status}
        </span>
      ),
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="default" size="small" icon={<FaEdit />} onClick={() => handleEdit(record)} />
          {/* <Button type="primary" danger size="small" icon={<FaTrash />} onClick={() => handleDelete(record)} /> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="container-fluid p-1">
      {/* Top Navigation Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Back Navigation */}
        <BackNavigation />
        
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      <h2 className="mb-1">Manage Employees</h2>
     
      <p className="mt-0">Maintain a list of all your employees and their details.</p>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div></div>
        <div className="d-flex gap-2">
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEmployee(null);
              form.resetFields();
              setDrawerOpen(true);
            }}
            style={{ fontWeight: '500' }}
          >
            Add Employee
          </Button>
          <Button 
            type="default"
            icon={<FaDownload />}
            onClick={exportEmployees}
            style={{ 
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              color: 'white',
              fontWeight: '500'
            }}
          >
            Export Employees
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="card custom-shadow">
        <div className="card-body">
      <Table
            columns={columns}
            dataSource={filteredEmployees}
            loading={loading}
            rowKey="employee_id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['5', '10', '20', '50', '100'],
            }}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>

      {/* Drawer for Add/Edit Employee */}
      <Drawer
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        width={800}
        onClose={() => {
          setDrawerOpen(false);
          setEditingEmployee(null);
          form.resetFields();
        }}
        open={drawerOpen}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>
            </div>
            <div className="col-md-6">
          <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Enter last name" />
          </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
          <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
          </Form.Item>
            </div>
            <div className="col-md-6">
          <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
          </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
          <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please enter department' }]}
              >
                <Input placeholder="Enter department" />
          </Form.Item>
            </div>
            <div className="col-md-6">
          <Form.Item
                name="reported_to"
                label="Reported To"
                rules={[{ required: true, message: 'Please enter reported to' }]}
              >
                <Input placeholder="Enter reported to" />
          </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
          <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please enter role' }]}
              >
                <Input placeholder="Enter role" />
          </Form.Item>
            </div>
            <div className="col-md-6">
          <Form.Item
                name="date_of_joining"
                label="Date of Joining"
                rules={[{ required: true, message: 'Please select date of joining' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  placeholder="Select date of joining"
                  format="YYYY-MM-DD"
                />
          </Form.Item>
            </div>
          </div>

          <Form.Item
            name="status"
            label="Status"
            initialValue="Active"
          >
            <Select
              showSearch
              filterOption={(input, option) =>
                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: '100%' }}
            >
              <Select.Option value="Active">Active</Select.Option>
              <Select.Option value="Inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button 
              onClick={() => {
                setDrawerOpen(false);
                setEditingEmployee(null);
                form.resetFields();
              }} 
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingEmployee ? 'Update Employee' : 'Create Employee'}
              </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default ManageEmployee;