import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Drawer, Form, Input, Select, message, Modal } from 'antd';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '../../../components/Breadcrumb';
import BackNavigation from '../../../components/BackNavigation';
import axios from 'axios';

const ManageCompany = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch companies from API
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      console.log('Fetching companies from API...');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getCompaniesList', {
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

      console.log('Companies API Response:', result);
    
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.companies && Array.isArray(result.companies)) {
        data = result.companies;
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
        key: item.company_id || item.id || index.toString(),
      }));
      
      setCompanies(dataWithKeys);
      message.success(`Companies loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching companies:", error);
      message.error(`Failed to load companies: ${error.message}`);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle create/update company
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const companyData = {
        company_name: values.company_name,
        registration_no: values.registration_no,
        address: values.address,
        city: values.city,
        state: values.state,
        country: values.country || 'India',
        contact_person: values.contact_person,
        phone: values.phone,
        email: values.email,
        website: values.website,
        status: values.status || 'Active'
      };

      let response;
      if (editingCompany) {
        // Update existing company
        const updateData = {
          company_id: editingCompany.company_id,
          ...companyData
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));

        const token = sessionStorage.getItem('token') || '';
        console.log("Using token:", token); 

        response = await axios.put("http://202.53.92.35:5004/api/settings/updateCompany", updateData, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });

        console.log("Update response:", response.data);
        message.success('Company updated successfully!');
      } else {
        // Create new company
        console.log("Creating new company");
        console.log("Create data being sent:", companyData);
        console.log("Create data types:", Object.keys(companyData).map(key => `${key}: ${typeof companyData[key]}`));

        const token = sessionStorage.getItem('token') || '';
        
        response = await axios.post("http://202.53.92.35:5004/api/settings/createCompany", companyData, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });
        
        console.log("Create response:", response.data);
        message.success('Company created successfully!');
      }

      setDrawerOpen(false);
      form.resetFields();
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save company: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save company. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit company
  const handleEdit = (record) => {
    setEditingCompany(record);
    form.setFieldsValue({
      company_name: record.company_name,
      registration_no: record.registration_no,
      address: record.address,
      city: record.city,
      state: record.state,
      country: record.country,
      contact_person: record.contact_person,
      phone: record.phone,
      email: record.email,
      website: record.website,
      status: record.status
    });
    setDrawerOpen(true);
  };

  // Handle delete company
  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this company?',
      content: `This will permanently delete ${record.company_name}.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const deleteId = record.company_id || record.id;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deleteCompany", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": sessionStorage.getItem("token"),
            },
            body: JSON.stringify({ company_id: deleteId }),
          });
          
          console.log("Delete response status:", response.status);
          console.log("Delete response ok:", response.ok);
          
          if (response.ok) {
            const result = await response.json();
            console.log("Delete response data:", result);
            message.success("Company deleted successfully!");
            await fetchCompanies(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete company: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting company:", error);
          message.error(`Failed to delete company: ${error.message}`);
        }
      }
    });
  };


  // Export functionality
  const exportCompanies = () => {
    const csvContent = [
      ['S.No', 'Company Name', 'Registration No', 'Address', 'City', 'State', 'Country', 'Contact Person', 'Phone', 'Email', 'Website', 'Status'],
      ...filteredCompanies.map((company, index) => [
        index + 1,
        company.company_name,
        company.registration_no || '',
        company.address || '',
        company.city || '',
        company.state || '',
        company.country || '',
        company.contact_person || '',
        company.phone || '',
        company.email || '',
        company.website || '',
        company.status || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `companies_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter companies
  const filteredCompanies = companies.filter(company => {
    const matchesStatus = selectedStatus === '' || company.status === selectedStatus;
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
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
      sorter: (a, b) => (a.company_name || '').localeCompare(b.company_name || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search company name"
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
        record.company_name?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Registration No',
      dataIndex: 'registration_no',
      key: 'registration_no',
      sorter: (a, b) => (a.registration_no || '').localeCompare(b.registration_no || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search registration no"
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
        record.registration_no?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      sorter: (a, b) => (a.city || '').localeCompare(b.city || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search city"
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
        record.city?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      sorter: (a, b) => (a.state || '').localeCompare(b.state || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search state"
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
        record.state?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contact_person',
      key: 'contact_person',
      sorter: (a, b) => (a.contact_person || '').localeCompare(b.contact_person || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search contact person"
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
        record.contact_person?.toLowerCase().includes(value.toLowerCase()),
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
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
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
      
      <h2 className="mb-1">Manage Companies</h2>
     
      <p className="mt-0">Maintain a list of all your asset companies.</p>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div></div>
        <div className="d-flex gap-2">
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCompany(null);
              form.resetFields();
              setDrawerOpen(true);
            }}
            style={{ fontWeight: '500' }}
          >
            Add Company
          </Button>
          <Button 
            type="default"
            icon={<FaDownload />}
            onClick={exportCompanies}
            style={{ 
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              color: 'white',
              fontWeight: '500'
            }}
          >
            Export Companies
          </Button>
        </div>
      </div>

      {/* Filters */}
     
      {/* Table */}
      <div className="card custom-shadow">
        <div className="card-body">
          <Table
            columns={columns}
            dataSource={filteredCompanies}
            loading={loading}
            rowKey="company_id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['5', '10', '20', '50', '100'],
            }}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>

      {/* Drawer for Add/Edit Company */}
      <Drawer
        title={editingCompany ? 'Edit Company' : 'Add New Company'}
        width={800}
        onClose={() => {
          setDrawerOpen(false);
          setEditingCompany(null);
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
                name="company_name"
                label="Company Name"
                rules={[{ required: true, message: 'Please enter company name' }]}
              >
                <Input placeholder="Enter company name" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="registration_no"
                label="Registration Number"
              >
                <Input placeholder="Enter registration number" />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea rows={3} placeholder="Enter company address" />
          </Form.Item>

          <div className="row">
            <div className="col-md-4">
              <Form.Item
                name="city"
                label="City"
              >
                <Input placeholder="Enter city" />
              </Form.Item>
            </div>
            <div className="col-md-4">
              <Form.Item
                name="state"
                label="State"
              >
                <Input placeholder="Enter state" />
              </Form.Item>
            </div>
            <div className="col-md-4">
              <Form.Item
                name="country"
                label="Country"
                initialValue="India"
              >
                <Input placeholder="Enter country" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="contact_person"
                label="Contact Person"
              >
                <Input placeholder="Enter contact person name" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="website"
                label="Website"
              >
                <Input placeholder="Enter website URL" />
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
                setEditingCompany(null);
                form.resetFields();
              }} 
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingCompany ? 'Update Company' : 'Create Company'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default ManageCompany;
