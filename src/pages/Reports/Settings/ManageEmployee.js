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
  const [roles, setRoles] = useState([]);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch states from API
  const fetchStates = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found for states');
        return;
      }

      console.log('Fetching states from API...');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getStatesList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token,
        }
      });
      
      console.log('States API Response status:', response.status);
      
      const result = await response.json();
      console.log('States API Response:', result);
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from states API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.states && Array.isArray(result.states)) {
        data = result.states;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      } else {
        console.error("Unexpected states API response structure:", result);
        data = [];
      }
      
      setStates(data);
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    }
  };

  // Fetch districts from API
  const fetchDistricts = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found for districts');
        return;
      }

      console.log('Fetching districts from API...');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getDistrictsList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token,
        }
      });
      
      console.log('Districts API Response status:', response.status);
      
      const result = await response.json();
      console.log('Districts API Response:', result);
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from districts API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.districts && Array.isArray(result.districts)) {
        data = result.districts;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      } else {
        console.error("Unexpected districts API response structure:", result);
        data = [];
      }
      
      setDistricts(data);
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    }
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found for roles');
        return;
      }

      console.log('Fetching roles from API...');
      const response = await fetch('http://202.53.92.35:5004/api/roles/getRolesList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-access-token': token,
        }
      });
      
      console.log('Roles API Response status:', response.status);
      
      const result = await response.json();
      console.log('Roles API Response:', result);
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from roles API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.roles && Array.isArray(result.roles)) {
        data = result.roles;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      } else {
        console.error("Unexpected roles API response structure:", result);
        data = [];
      }
      
      setRoles(data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  };

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
      const response = await fetch('http://202.53.92.35:5004/api/settings/getEmployeesList', {
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
    fetchRoles();
    fetchStates();
    fetchDistricts();
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
        emp_first_name: values.first_name,
        emp_last_name: values.last_name,
        emp_email: values.email,
        emp_phone: values.phone,
        district: values.district,
        state: values.state,
        emp_department: values.department,
        emp_role: values.role,
        emp_date_of_joining: values.date_of_joining ? dayjs(values.date_of_joining).format('YYYY-MM-DD') : null,
        emp_reported_to: values.reported_to,
        emp_status: values.status || 'Active'
      };

      let response;
      if (editingEmployee) {
        // Update existing employee
        const updateData = {
          emp_id: editingEmployee.employee_id || editingEmployee.emp_id,
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
      first_name: record.emp_first_name || record.first_name,
      last_name: record.emp_last_name || record.last_name,
      email: record.emp_email || record.email,
      phone: record.emp_phone || record.phone,
      department: record.emp_department || record.department,
      reported_to: record.emp_reported_to || record.reported_to,
      role: record.emp_role || record.role,
      district: record.district,
      state: record.state,
      date_of_joining: record.emp_date_of_joining || record.date_of_joining ? dayjs(record.emp_date_of_joining || record.date_of_joining) : null,
      status: record.emp_status || record.status
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
      ['S.No', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Reported To', 'Role', 'District', 'State', 'Date of Joining', 'Status'],
      ...filteredEmployees.map((employee, index) => [
        index + 1,
        employee.emp_first_name || employee.first_name || '',
        employee.emp_last_name || employee.last_name || '',
        employee.emp_email || employee.email || '',
        employee.emp_phone || employee.phone || '',
        employee.emp_department || employee.department || '',
        employee.emp_reported_to || employee.reported_to || '',
        employee.emp_role || employee.role || '',
        employee.district || '',
        employee.state || '',
        employee.emp_date_of_joining || employee.date_of_joining || '',
        employee.emp_status || employee.status || ''
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
      dataIndex: 'emp_first_name',
      key: 'emp_first_name',
      sorter: (a, b) => (a.emp_first_name || a.first_name || '').localeCompare(b.emp_first_name || b.first_name || ''),
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
        (record.emp_first_name || record.first_name)?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Last Name',
      dataIndex: 'emp_last_name',
      key: 'emp_last_name',
      sorter: (a, b) => (a.emp_last_name || a.last_name || '').localeCompare(b.emp_last_name || b.last_name || ''),
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
        (record.emp_last_name || record.last_name)?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Email',
      dataIndex: 'emp_email',
      key: 'emp_email',
      sorter: (a, b) => (a.emp_email || a.email || '').localeCompare(b.emp_email || b.email || ''),
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
        (record.emp_email || record.email)?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Phone',
      dataIndex: 'emp_phone',
      key: 'emp_phone',
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
        (record.emp_phone || record.phone)?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Department',
      dataIndex: 'emp_department',
      key: 'emp_department',
      sorter: (a, b) => (a.emp_department || a.department || '').localeCompare(b.emp_department || b.department || ''),
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
        (record.emp_department || record.department)?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Reported To',
      dataIndex: 'emp_reported_to',
      key: 'emp_reported_to',
      sorter: (a, b) => (a.emp_reported_to || a.reported_to || '').localeCompare(b.emp_reported_to || b.reported_to || ''),
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
        (record.emp_reported_to || record.reported_to)?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Role',
      dataIndex: 'emp_role',
      key: 'emp_role',
      sorter: (a, b) => (a.emp_role || a.role || '').localeCompare(b.emp_role || b.role || ''),
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
        (record.emp_role || record.role)?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Date of Joining',
      dataIndex: 'emp_date_of_joining',
      key: 'emp_date_of_joining',
      sorter: (a, b) => new Date(a.emp_date_of_joining || a.date_of_joining || 0) - new Date(b.emp_date_of_joining || b.date_of_joining || 0),
      render: (value, record) => {
        const dateValue = value || record.emp_date_of_joining || record.date_of_joining;
        return dateValue ? dayjs(dateValue).format('DD/MM/YYYY') : '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'emp_status',
      key: 'emp_status',
      render: (status, record) => {
        const statusValue = status || record.emp_status || record.status;
        return (
          <span className={`badge ${statusValue === 'Active' ? 'bg-success' : 'bg-danger'}`}>
            {statusValue}
          </span>
        );
      },
      sorter: (a, b) => (a.emp_status || a.status || '').localeCompare(b.emp_status || b.status || ''),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (value, record) => (record.emp_status || record.status) === value,
    },
    {
      title: 'District',
      dataIndex: 'district',
      key: 'district',
      sorter: (a, b) => (a.district || '').localeCompare(b.district || ''),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      sorter: (a, b) => (a.state || '').localeCompare(b.state || ''),
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
                name="state"
                label="State"
                rules={[{ required: true, message: 'Please select state' }]}
              >
                <Select
                  showSearch
                  placeholder="Select state"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                >
                  {states.map((state) => (
                    <Select.Option key={state.state_id || state.id} value={state.state_name || state.name || state.state}>
                      {state.state_name || state.name || state.state}
                    </Select.Option>
                  ))}
                </Select>
          </Form.Item>
            </div>
            <div className="col-md-6">
          <Form.Item
                name="district"
                label="District"
                rules={[{ required: true, message: 'Please select district' }]}
              >
                <Select
                  showSearch
                  placeholder="Select district"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                >
                  {districts.map((district) => (
                    <Select.Option key={district.district_id || district.id} value={district.district_name || district.name || district.district}>
                      {district.district_name || district.name || district.district}
                    </Select.Option>
                  ))}
                </Select>
          </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
          <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select
                  showSearch
                  placeholder="Select a role"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                >
                  {roles.map((role) => (
                    <Select.Option key={role.role_id || role.id} value={role.role_name || role.name || role.role}>
                      {role.role_name || role.name || role.role}
                    </Select.Option>
                  ))}
                </Select>
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