import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import { Drawer, Form, Input, InputNumber, Select, Button, Space, Table, message } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import "../App.css";

export default function ManageCategory({ onNavigate }) {
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

  return (
    <div className="container-fluid p-1 position-relative" style={{ minHeight: "100vh" }}>
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-success px-4"
            onClick={() => onNavigate("settings")}
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="mb-1">Asset Categories</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Types</button>
          <button className="btn btn-success px-4">All Departments</button>
          <button
            className="btn btn-success px-4"
            onClick={() => setDrawerVisible(true)}
          >
            <PlusOutlined /> Create Category
          </button>
        </div>
      </div>

      {/* 🔹 Categories Table */}
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

      {/* 🔹 Drawer Form */}
      <Drawer
        title="Create Category"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item
            label="Category Name"
            name="category_name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="e.g., Laptops" />
          </Form.Item>

          <Form.Item
            label="Parent Category"
            name="parent_category"
            rules={[{ required: true, message: "Please enter parent category" }]}
          >
            <Input placeholder="e.g., IT Equipment" />
          </Form.Item>

          <Form.Item
            label="Useful Life (years)"
            name="useful_life"
            rules={[{ required: true, message: "Please enter useful life" }]}
          >
            <InputNumber min={1} className="w-100" placeholder="5" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={3} placeholder="Short description..." />
          </Form.Item>

          <Form.Item
            label="Default Depreciation"
            name="default_depreciation"
            rules={[{ required: true, message: "Please enter depreciation method" }]}
          >
            <Input placeholder="Straight Line" />
          </Form.Item>

          <Form.Item
            label="CapEx/OpEx"
            name="capex_opex"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select placeholder="Select type">
              <Select.Option value="CapEx">CapEx</Select.Option>
              <Select.Option value="OpEx">OpEx</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Track Warranty"
            name="track_warranty"
            rules={[{ required: true, message: "Please select option" }]}
          >
            <Select placeholder="Select option">
              <Select.Option value="Yes">Yes</Select.Option>
              <Select.Option value="No">No</Select.Option>
            </Select>
          </Form.Item>

          {/* Buttons */}
          <Form.Item>
            <Space className="d-flex justify-content-end w-100">
              <Button onClick={() => form.resetFields()} disabled={loading}>Reset</Button>
              <Button className="btn btn-success" htmlType="submit" loading={loading}>
                Save Category
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}