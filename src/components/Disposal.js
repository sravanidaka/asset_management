import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  message,
  InputNumber,
} from "antd";
import axios from "axios";
import { formatDateForDB, parseDateFromDB } from "../utils/dateUtils";

const { Option } = Select;

const Disposal = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingDisposal, setEditingDisposal] = useState(null);

  // Submit form
  const onFinish = async (values) => {
    console.log("Disposal form submitted with values:", values);
    message.loading("Saving disposal data...", 0);
    
    try {
      setLoading(true);
      
      if (editingDisposal) {
        // Update existing disposal record
        console.log("Updating disposal record:", editingDisposal);
        const updateData = {
          id: editingDisposal.id,
          asset_code: values.asset_code,
          disposal_type: values.disposal_type,
          disposal_date: values.disposal_date,
          approver_name: values.approver_name,
          disposal_reason: values.disposal_reason,
          sale_price: values.sale_price,
          book_value: values.book_value,
          buyer_name: values.buyer_name
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
        const response = await axios.put("http://202.53.92.35:5004/api/assets/disposal", updateData);
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Disposal record updated successfully!");
      } else {
        // Create new disposal record
        console.log("Creating new disposal record");
        const createData = {
          asset_code: values.asset_code,
          disposal_type: values.disposal_type,
          disposal_date: values.disposal_date,
          approver_name: values.approver_name,
          disposal_reason: values.disposal_reason,
          sale_price: values.sale_price,
          book_value: values.book_value,
          buyer_name: values.buyer_name
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        
        const response = await axios.post("http://202.53.92.35:5004/api/assets/disposal", createData);
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Disposal record created successfully!");
      }
      
      form.resetFields();
      setEditingDisposal(null);
    } catch (error) {
      console.error("Error saving disposal data:", error);
      message.destroy(); // Clear loading message
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save disposal data: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save disposal data. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingDisposal(null);
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Asset Disposal / Retirement</h2>
      <p className="mt-0">Track disposal, retirement, or auction of assets</p>

      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Disposal Details</h5>
          
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
          >
            {/* Asset Identification */}
            <h5 className="mb-2">Asset Identification</h5>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="asset_code"
                  label="Asset Code"
                  rules={[{ required: true, message: "Please enter asset code" }]}
                >
                  <Input placeholder="Enter asset code (e.g., AST-001)" />
                </Form.Item>
              </Col>
            </Row>

            {/* Disposal Information */}
            <h5 className="mb-2">Disposal Information</h5>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="disposal_type"
                  label="Disposal Type"
                  rules={[{ required: true, message: "Please select disposal type" }]}
                >
                  <Select placeholder="Select disposal type">
                    <Option value="Sale">Sale</Option>
                    <Option value="Write-off">Write-off</Option>
                    <Option value="Auction">Auction</Option>
                    <Option value="Donation">Donation</Option>
                    <Option value="Scrap">Scrap</Option>
                    <Option value="Trade-in">Trade-in</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="disposal_date"
                  label="Disposal Date"
                  rules={[{ required: true, message: "Please select disposal date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="approver_name"
                  label="Approver's Name"
                  rules={[{ required: true, message: "Please enter approver's name" }]}
                >
                  <Input placeholder="Enter approver's name (e.g., John Doe)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="disposal_reason"
                  label="Reason for Disposal"
                  rules={[{ required: true, message: "Please enter disposal reason" }]}
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Enter reason for disposal"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Financial & Buyer Details */}
            <h5 className="mb-2">Financial & Buyer Details</h5>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="sale_price"
                  label="Sale Price"
                  rules={[{ required: true, message: "Please enter sale price" }]}
                >
                  <InputNumber 
                    placeholder="Enter sale price (e.g., 50.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="book_value"
                  label="Book Value"
                  rules={[{ required: true, message: "Please enter book value" }]}
                >
                  <InputNumber 
                    placeholder="Enter book value (e.g., 75.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="buyer_name"
                  label="Buyer's Name / Company"
                  rules={[{ required: true, message: "Please enter buyer's name" }]}
                >
                  <Input placeholder="Enter buyer's name or company (e.g., ABC Pvt Ltd)" />
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
                {editingDisposal ? "Update Disposal Record" : "Save Disposal Log"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Disposal;