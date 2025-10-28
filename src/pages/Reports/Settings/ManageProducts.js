import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Space, Drawer, Form, Input, Select, message, Modal, InputNumber } from 'antd';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import CustomBreadcrumb from '../../../components/Breadcrumb';
import BackNavigation from '../../../components/BackNavigation';
import axios from 'axios';

const ManageProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      console.log('Fetching products from API...');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getProductsList', {
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
      console.log('Products API Response:', result);
    
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.products && Array.isArray(result.products)) {
        data = result.products;
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
        key: item.product_id || item.id || index.toString(),
      }));
      
      setProducts(dataWithKeys);
      message.success(`Products loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error(`Failed to load products: ${error.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies for dropdown
  const fetchCompanies = async () => {
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      const response = await fetch('http://202.53.92.35:5004/api/settings/getCompaniesList', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        }
      });

      const result = await response.json();
      
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.companies && Array.isArray(result.companies)) {
        data = result.companies;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      }
      
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCompanies();
  }, []);

  // Handle create/update product
  const onFinish = async (values) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('x-access-token') || sessionStorage.getItem('token');
      if (!token) {
        message.error('No authentication token found');
        return;
      }

      const productData = {
        product_name: values.product_name,
        product_code: values.product_code,
        company_id: values.company_id,
        category: values.category,
        subcategory: values.subcategory,
        make_model: values.make_model,
        description: values.description,
        warranty_period: values.warranty_period,
        unit_price: values.unit_price,
        status: values.status || 'Active'
      };

      let response;
      if (editingProduct) {
        // Update existing product
        const updateData = {
          product_id: editingProduct.product_id,
          ...productData
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));

        const token = sessionStorage.getItem('token') || '';
        console.log("Using token:", token); 

        response = await axios.put("http://202.53.92.35:5004/api/settings/updateProduct", updateData, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });

        console.log("Update response:", response.data);
        message.success('Product updated successfully!');
      } else {
        // Create new product
        console.log("Creating new product");
        console.log("Create data being sent:", productData);
        console.log("Create data types:", Object.keys(productData).map(key => `${key}: ${typeof productData[key]}`));

        const token = sessionStorage.getItem('token') || '';
        
        response = await axios.post("http://202.53.92.35:5004/api/settings/createProduct", productData, {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token
          }
        });
        
        console.log("Create response:", response.data);
        message.success('Product created successfully!');
      }

      setDrawerOpen(false);
      form.resetFields();
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save product: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save product. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle edit product
  const handleEdit = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      product_name: record.product_name,
      product_code: record.product_code,
      company_id: record.company_id,
      category: record.category,
      subcategory: record.subcategory,
      make_model: record.make_model,
      description: record.description,
      warranty_period: record.warranty_period,
      unit_price: record.unit_price,
      status: record.status
    });
    setDrawerOpen(true);
  };

  // Handle delete product
  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this product?',
      content: `This will permanently delete ${record.product_name}.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const deleteId = record.product_id || record.id;
          console.log("Attempting to delete with ID:", deleteId);
          
          // Call API directly
          const response = await fetch("http://202.53.92.35:5004/api/settings/deleteProduct", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": sessionStorage.getItem("token"),
            },
            body: JSON.stringify({ product_id: deleteId }),
          });
          
          console.log("Delete response status:", response.status);
          console.log("Delete response ok:", response.ok);
          
          if (response.ok) {
            const result = await response.json();
            console.log("Delete response data:", result);
            message.success("Product deleted successfully!");
            await fetchProducts(); // Refresh from API
          } else {
            const errorText = await response.text();
            console.error("Delete failed with status:", response.status);
            console.error("Delete error response:", errorText);
            throw new Error(`Failed to delete product: ${response.status}`);
          }
        } catch (error) {
          console.error("Error deleting product:", error);
          message.error(`Failed to delete product: ${error.message}`);
        }
      }
    });
  };

  // Export functionality
  const exportProducts = () => {
    const csvContent = [
      ['S.No', 'Product Name', 'Product Code', 'Company', 'Category', 'Subcategory', 'Make/Model', 'Warranty Period (Months)', 'Unit Price (₹)', 'Status'],
      ...filteredProducts.map((product, index) => [
        index + 1,
        product.product_name,
        product.product_code || '',
        product.company_name || '',
        product.category || '',
        product.subcategory || '',
        product.make_model || '',
        product.warranty_period || '',
        product.unit_price || '',
        product.status || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesStatus = selectedStatus === '' || product.status === selectedStatus;
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
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
      sorter: (a, b) => (a.product_name || '').localeCompare(b.product_name || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search product name"
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
        record.product_name?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Product Code',
      dataIndex: 'product_code',
      key: 'product_code',
      sorter: (a, b) => (a.product_code || '').localeCompare(b.product_code || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search product code"
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
        record.product_code?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Company',
      dataIndex: 'company_name',
      key: 'company_name',
      sorter: (a, b) => (a.company_name || '').localeCompare(b.company_name || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search company"
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
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => (a.category || '').localeCompare(b.category || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search category"
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
        record.category?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Subcategory',
      dataIndex: 'subcategory',
      key: 'subcategory',
      sorter: (a, b) => (a.subcategory || '').localeCompare(b.subcategory || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search subcategory"
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
        record.subcategory?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Make/Model',
      dataIndex: 'make_model',
      key: 'make_model',
      sorter: (a, b) => (a.make_model || '').localeCompare(b.make_model || ''),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search make/model"
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
        record.make_model?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Warranty (Months)',
      dataIndex: 'warranty_period',
      key: 'warranty_period',
      sorter: (a, b) => (a.warranty_period || 0) - (b.warranty_period || 0),
      render: (value) => value ? `${value} months` : '-',
    },
    {
      title: 'Unit Price (₹)',
      dataIndex: 'unit_price',
      key: 'unit_price',
      sorter: (a, b) => (a.unit_price || 0) - (b.unit_price || 0),
      render: (value) => value ? `₹${parseFloat(value).toLocaleString()}` : '-',
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
      
      <h2 className="mb-1">Manage Products</h2>
     
      <p className="mt-0">Maintain a list of all your products and their details.</p>

      {/* Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div></div>
        <div className="d-flex gap-2">
          <Button 
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingProduct(null);
              form.resetFields();
              setDrawerOpen(true);
            }}
            style={{ fontWeight: '500' }}
          >
            Add Product
          </Button>
          <Button 
            type="default"
            icon={<FaDownload />}
            onClick={exportProducts}
            style={{ 
              backgroundColor: '#52c41a',
              borderColor: '#52c41a',
              color: 'white',
              fontWeight: '500'
            }}
          >
            Export Products
          </Button>
        </div>
      </div>

      

      {/* Table */}
     
          <Table
            columns={columns}
            dataSource={filteredProducts}
            loading={loading}
            rowKey="product_id"
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['5', '10', '20', '50', '100'],
            }}
            scroll={{ x: 1000 }}
          />
       

      {/* Drawer for Add/Edit Product */}
      <Drawer
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        width={800}
        onClose={() => {
          setDrawerOpen(false);
          setEditingProduct(null);
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
                name="product_name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="product_code"
                label="Product Code"
              >
                <Input placeholder="Enter product code" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="company_id"
                label="Company"
                rules={[{ required: true, message: 'Please select company' }]}
              >
                <Select 
                  placeholder="Select company"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: '100%' }}
                >
                  {companies.map(company => (
                    <Select.Option key={company.company_id} value={company.company_id}>
                      {company.company_name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="category"
                label="Category"
              >
                <Input placeholder="Enter category" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="subcategory"
                label="Subcategory"
              >
                <Input placeholder="Enter subcategory" />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="make_model"
                label="Make/Model"
              >
                <Input placeholder="Enter make/model" />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="warranty_period"
                label="Warranty Period (Months)"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Enter warranty period in months"
                  min={0}
                />
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="unit_price"
                label="Unit Price (₹)"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="Enter unit price"
                  min={0}
                  step={0.01}
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
                setEditingProduct(null);
                form.resetFields();
              }} 
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default ManageProducts;
