import React, { useState,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

import { Drawer, Form, Input, InputNumber, Select, Button, Space, Table, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "../App.css";

export default function ManageStatus({ onNavigate }) {
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

  // 🔹 Drawer state

  // 🔹 Drawer state
  const [open, setOpen] = useState(false);

  // 🔹 Form state
  const [formData, setFormData] = useState({
    status_name: "",
    status_type: "",
    color_tag: "",
    description: "",
    is_default: "",
    affects_availability: "",
    include_in_utilization: "", 
  });

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Status Form Data:", formData);
    setOpen(false); // close drawer after save
  };

  // 🔹 Reset form
  const handleReset = () => {
    setFormData({
      status_name: "",
      status_type: "",
      color_tag: "",
      description: "",
      is_default: "",
      affects_availability: "",
      include_in_utilization: "",
    });
  };

  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-success px-4 "
            onClick={() => onNavigate("settings")}
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="mb-1">Asset Statuses</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All</button>
          <button className="btn btn-success px-4">Lifecycle</button>
          <button
            className="btn btn-success px-4"
            onClick={() => setOpen(true)}
          >
            + Create Status
          </button>
        </div>
      </div>

      {/* 🔹 Statuses Table */}
      <div className="card custom-shadow">
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

      {/* 🔹 Drawer with Create/Edit Form */}
      <Drawer
        title="Create / Edit Status"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={600}
      >
        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Status Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="status_name"
                className="form-control"
                placeholder="e.g., In Use"
                value={formData.status_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Status Type <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="status_type"
                className="form-control"
                placeholder="Lifecycle"
                value={formData.status_type}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Color Tag <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="color_tag"
                className="form-control"
                placeholder="Accent"
                value={formData.color_tag}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="description"
                className="form-control"
                placeholder="Short description..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Is Default? <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="is_default"
                className="form-control"
                placeholder="No"
                value={formData.is_default}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Affects Availability <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="affects_availability"
                className="form-control"
                placeholder="Yes"
                value={formData.affects_availability}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Include in Utilization <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="include_in_utilization"
                className="form-control"
                placeholder="Yes"
                value={formData.include_in_utilization}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-light px-4"
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className="btn btn-success px-4">
              Save Status
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}