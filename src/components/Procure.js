import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  message,
  InputNumber,
} from "antd";
import axios from "axios";
import { formatDateForDB, parseDateFromDB } from "../utils/dateUtils";

const { Option } = Select;

const Procure = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingProcurement, setEditingProcurement] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://202.53.92.35:5004/api/settings/getSettingCategoriesList");
      
      console.log("Categories API Response:", response.data);
      
      let categoriesData = [];
      
      // Handle different response formats
      if (response.data?.success && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data?.categories && Array.isArray(response.data.categories)) {
        categoriesData = response.data.categories;
      } else {
        console.warn("Unexpected categories API response format:", response.data);
        // Fallback to default categories
        categoriesData = [
          { category_name: "IT Equipment", category_id: "IT" },
          { category_name: "Office Furniture", category_id: "FURNITURE" },
          { category_name: "Vehicles", category_id: "VEHICLES" },
          { category_name: "Machinery", category_id: "MACHINERY" },
          { category_name: "Electronics", category_id: "ELECTRONICS" }
        ];
      }
      
      setCategories(categoriesData);
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      
      // Fallback to default categories on error
      const defaultCategories = [
        { category_name: "IT Equipment", category_id: "IT" },
        { category_name: "Office Furniture", category_id: "FURNITURE" },
        { category_name: "Vehicles", category_id: "VEHICLES" },
        { category_name: "Machinery", category_id: "MACHINERY" },
        { category_name: "Electronics", category_id: "ELECTRONICS" }
      ];
      setCategories(defaultCategories);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Submit form
  const onFinish = async (values) => {
    console.log("Procurement form submitted with values:", values);
    message.loading("Saving procurement...", 0);
    
    try {
      setLoading(true);
      
      if (editingProcurement) {
        // Update existing procurement
        console.log("Updating procurement:", editingProcurement);
        const updateData = {
          id: editingProcurement.id,
          indent_number: values.indent_number,
          requested_by: values.requested_by,
          requested_date: values.requested_date,
          status: values.status,
          category: values.category,
          asset_name: values.asset_name,
          quantity: values.quantity,
          po_number: values.po_number,
          supplier_vendor: values.supplier_vendor,
          received_date: formatDateForDB(values.received_date),
          invoice_details: values.invoice_details,
          justification: values.justification
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
        const response = await axios.put("http://202.53.92.35:5004/api/assets/procure", updateData);
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Procurement updated successfully!");
      } else {
        // Create new procurement
        console.log("Creating new procurement");
        const createData = {
          indent_number: values.indent_number,
          requested_by: values.requested_by,
          requested_date: values.requested_date,
          status: values.status,
          category: values.category,
          asset_name: values.asset_name,
          quantity: values.quantity,
          po_number: values.po_number,
          supplier_vendor: values.supplier_vendor,
          received_date: formatDateForDB(values.received_date),
          invoice_details: values.invoice_details,
          justification: values.justification
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        
        const response = await axios.post("http://202.53.92.35:5004/api/assets/procure", createData);
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Procurement created successfully!");
      }
      
      form.resetFields();
      setEditingProcurement(null);
    } catch (error) {
      console.error("Error saving procurement:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      
      message.destroy(); // Clear loading message
      
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Bad Request - Invalid data format";
        console.error("400 Bad Request details:", error.response?.data);
        message.error(`❌ Invalid data: ${errorMessage}`);
      } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please start the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save procurement: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save procurement. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingProcurement(null);
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Asset Procurement & Indent</h2>
      <p className="mt-0">Capture procurement lifecycle.</p>

      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Procurement Details</h5>
          
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
            initialValues={{
              status: "Pending"
            }}
          >
            {/* Indent Request Details */}
            <h5 className="mb-3">Indent Request Details</h5>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="requested_by"
                  label="Requested By"
                  rules={[{ required: true, message: "Please enter requester name" }]}
                >
                  <Input placeholder="Enter requester name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="requested_date"
                  label="Requested Date"
                  rules={[{ required: true, message: "Please select requested date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Select placeholder="Select status">
                    <Option value="Pending">Pending</Option>
                    <Option value="Ordered">Ordered</Option>
                    <Option value="Approved">Approved</Option>
                    <Option value="Received">Received</Option>
                    <Option value="Rejected">Rejected</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[{ required: true, message: "Please select category" }]}
                >
                  <Select placeholder="Select category" loading={categories.length === 0}>
                    {categories.map((category) => (
                      <Option key={category.category_id || category.id} value={category.category_name || category.name}>
                        {category.category_name || category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="asset_name"
                  label="Asset Name"
                  rules={[{ required: true, message: "Please enter asset name" }]}
                >
                  <Input placeholder="Enter asset name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[{ required: true, message: "Please enter quantity" }]}
                >
                  <InputNumber 
                    placeholder="Enter quantity" 
                    min={1}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Procurement Information */}
            <h5 className="mb-3">Procurement Information</h5>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="indent_number"
                  label="Indent Number"
                  rules={[{ required: true, message: "Please enter indent number" }]}
                >
                  <Input placeholder="Enter indent number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="po_number"
                  label="PO Number"
                  rules={[{ required: true, message: "Please enter PO number" }]}
                >
                  <Input placeholder="Enter PO number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="supplier_vendor"
                  label="Supplier / Vendor"
                  rules={[{ required: true, message: "Please enter supplier/vendor name" }]}
                >
                  <Input placeholder="Enter supplier/vendor name" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="received_date"
                  label="Received Date"
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="invoice_details"
                  label="Invoice Details"
                >
                  <Input placeholder="Enter invoice details (e.g., INV-123456, ₹250,000)" />
                </Form.Item>
              </Col>
            </Row>

            {/* Justification */}
            <h5 className="mb-3">Justification</h5>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="justification"
                  label="Justification / Remarks"
                  rules={[{ required: true, message: "Please enter justification" }]}
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder="Enter justification for procurement"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <Button onClick={onReset} disabled={loading}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="btn-add"
              >
                {editingProcurement ? "Update Procurement" : "Save Procurement Log"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Procure;