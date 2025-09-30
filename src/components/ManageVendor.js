import React, { useState,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

import { Drawer, Form, Input, InputNumber, Select, Button, Space, Table, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "../App.css";

export default function ManageVendor({ onNavigate }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch categories from API
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/asset-categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      // Add key property for each item (required by Ant Design Table)
      const dataWithKeys = data.map((item, index) => ({
        ...item,
        key: item.id || item._id || index.toString(),
      }));
      setDataSource(dataWithKeys);
      message.success("Categories loaded successfully");
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch data on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 Filter data based on search
  const filteredData = dataSource.filter((item) =>
    Object.values(item).some((value) =>
      value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  // 🔹 Table columns with sorting
  const columns = [
    {
      title: "Category Name",
      dataIndex: "category_name",
      key: "category_name",
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
    },
    {
      title: "Parent Category",
      dataIndex: "parent_category",
      key: "parent_category",
      sorter: (a, b) => a.parent_category.localeCompare(b.parent_category),
    },
    {
      title: "Type (CapEx/OpEx)",
      dataIndex: "capex_opex",
      key: "capex_opex",
      sorter: (a, b) => a.capex_opex.localeCompare(b.capex_opex),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button type="default" size="small" icon={<FaEdit />} />
          <Button type="primary" danger size="small" icon={<FaTrash />} />
        </Space>
      ),
    },
  ];


  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  // 🔹 Save Category
  const handleSave = async (values) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/asset-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      const newCategory = await response.json();
      message.success("Category created successfully!");
      
      // Refresh the table data
      await fetchCategories();
      
      form.resetFields();
      setDrawerVisible(false);
    } catch (error) {
      console.error("Error creating category:", error);
      message.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Form State
  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_code: "",
    status: "",
    contact: "",
    email: "",
    phone: "",
    category: "",
    payment_terms: "",
    tax_id: "",
    address: "", 
    notes: "",
  });

  // 🔹 Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  // 🔹 Reset Form
  const handleReset = () => {
    setFormData({
      vendor_name: "",
      vendor_code: "",
      status: "",
      contact: "",
      email: "",
      phone: "",
      category: "",
      payment_terms: "",
      tax_id: "",
      address: "",
      notes: "",
    });
  };

  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-success px-4"
            onClick={() => onNavigate("settings")}
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="mb-1">Manage Vendors</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Vendors</button>
          <button className="btn btn-success px-4">All Categories</button>
          <button
            className="btn btn-success px-4"
            onClick={() => setDrawerVisible(true)}
          >
            +Create Vendor
          </button>
        </div>
      </div>

      {/* 🔹 Vendor Directory */}
      <div className="card custom-shadow mb-3">
      <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fs-4 mb-0">Categories</h5>
            <Input
              placeholder="Search categories..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </div>
          <Table
            columns={columns}
            dataSource={filteredData}
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
      </div>

      {/* 🔹 Drawer with Form */}
      <Drawer
        title="Create Vendor"
        placement="right"
        width={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <form onSubmit={handleSave}>
          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Vendor Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="vendor_name"
                className="form-control"
                value={formData.vendor_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Vendor Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="vendor_code"
                className="form-control"
                value={formData.vendor_code}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Status <span className="text-danger">*</span>
              </label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Primary Contact <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="contact"
                className="form-control"
                value={formData.contact}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Phone <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Category <span className="text-danger">*</span>
              </label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Hardware Supplier">Hardware Supplier</option>
                <option value="Logistics">Logistics</option>
                <option value="Software Provider">Software Provider</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Payment Terms <span className="text-danger">*</span>
              </label>
              <select
                name="payment_terms"
                className="form-select"
                value={formData.payment_terms}
                onChange={handleChange}
                required
              >
                <option value="">Select Terms</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Tax ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="tax_id"
                className="form-control"
                value={formData.tax_id}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          /* Row 4 */
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">
                Address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          /* Row 5 */
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">
                Notes <span className="text-danger">*</span>
              </label>
              <textarea
                name="notes"
                className="form-control"
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>

          /* Buttons */
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className="btn btn-primary px-4">
              Save Vendor
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}