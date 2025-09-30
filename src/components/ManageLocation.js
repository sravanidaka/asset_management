import React, { useState,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

import { Drawer, Form, Input, InputNumber, Select, Button, Space, Table, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "../App.css";


export default function ManageLocation({ onNavigate }) {
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

  // 🔹 Handle pagination change
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

  // 🔹 Drawer state
  const [open, setOpen] = useState(false);

  // 🔹 Form state
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    code: "",
    parent: "",
    region: "",
    active: "",
    address: "",
    notes: "", 
  });

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📌 Location Form Data:", formData);
    setOpen(false); // close drawer after save
  };

  // 🔹 Reset form
  const handleReset = () => {
    setFormData({
      type: "",
      name: "",
      code: "",
      parent: "",
      region: "",
      active: "",
      address: "",
      notes: "",
    });
  };

  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-success px-4"
            onClick={() => onNavigate("settings")}
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="mb-1">Manage Locations</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Regions</button>
          <button className="btn btn-success px-4">All Sites</button>
          <button className="btn btn-success px-4" onClick={() => setOpen(true)}>
            + Create Location
          </button>
        </div>
      </div>

      {/* 🔹 Directory Table */}
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

      {/* 🔹 Drawer with Create/Edit Location Form */}
      <Drawer
        title="Create Location"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={700}
      >
        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Type <span className="text-danger">*</span>
              </label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Location">Location</option>
                <option value="Department">Department</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g., HQ - New York"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="code"
                className="form-control"
                placeholder="e.g., NY-HQ"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Parent <span className="text-danger">*</span>
              </label>
              <select
                name="parent"
                className="form-select"
                value={formData.parent}
                onChange={handleChange}
                required
              >
                <option value="">Select Parent</option>
                <option value="Headquarters">Headquarters</option>
                <option value="Regional Office">Regional Office</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Region <span className="text-danger">*</span>
              </label>
              <select
                name="region"
                className="form-select"
                value={formData.region}
                onChange={handleChange}
                required
              >
                <option value="">Select Region</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Active <span className="text-danger">*</span>
              </label>
              <select
                name="active"
                className="form-select"
                value={formData.active}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">
                Address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Full address..."
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">
                Notes <span className="text-danger">*</span>
              </label>
              <textarea
                name="notes"
                className="form-control"
                placeholder="Optional notes..."
                rows="3"
                value={formData.notes}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className="btn btn-primary px-4">
              Save Location
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}