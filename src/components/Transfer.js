import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import CustomBreadcrumb from './common/Breadcrumb';
import BackNavigation from './common/BackNavigation';
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  message,
} from "antd";
import axios from "axios";
import { formatDateForDB, parseDateFromDB } from "../utils/dateUtils";

const Transfer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);

  // Submit form
  const onFinish = async (values) => {
    console.log("Transfer form submitted with values:", values);
    message.loading("Saving transfer...", 0);
    
    try {
      setLoading(true);
      
      if (editingTransfer) {
        // Update existing transfer
        console.log("Updating transfer:", editingTransfer);
        const updateData = {
          id: editingTransfer.id,
          transfer_id: values.transfer_id,
          asset_id: values.asset_id,
          current_location_or_user: values.current_location_or_user,
          new_location_or_user: values.new_location_or_user,
          transfer_date: values.transfer_date,
          justification: values.justification,
          approver_name: values.approver_name
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
        const response = await axios.put("http://202.53.92.35:5004/api/assets/transfer", updateData);
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Transfer updated successfully!");
      } else {
        // Create new transfer
        console.log("Creating new transfer");
        const createData = {
          transfer_id: values.transfer_id,
          asset_id: values.asset_id,
          current_location_or_user: values.current_location_or_user,
          new_location_or_user: values.new_location_or_user,
          transfer_date: values.transfer_date,
          justification: values.justification,
          approver_name: values.approver_name
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        
        const response = await axios.post("http://202.53.92.35:5004/api/assets/transfer", createData);
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Asset transferred successfully!");
      }
      
      form.resetFields();
      setEditingTransfer(null);
    } catch (error) {
      console.error("Error saving transfer:", error);
      message.destroy(); // Clear loading message
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save transfer: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save transfer. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingTransfer(null);
  };

  return (
    <div className="container-fluid p-1">
      {/* Top Navigation Bar - Breadcrumb Only */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      <h2 className="mb-1">Asset Transfer</h2>
      <p className="mt-0">Move assets from one location, branch, or person to another.</p>

      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Transfer Asset</h5>
          
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
          >
            {/* Section 1: Transfer Identification */}
            <h5 className="mb-2">Transfer Identification</h5>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="transfer_id"
                  label="Transfer ID"
                  rules={[{ required: true, message: "Please enter transfer ID" }]}
                >
                  <Input placeholder="Enter transfer ID (e.g., TRF-2025-001)" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="asset_id"
                  label="Asset ID"
                  rules={[{ required: true, message: "Please enter asset ID" }]}
                >
                  <Input placeholder="Enter asset ID (e.g., 101)" />
                </Form.Item>
              </Col>
            </Row>

            {/* Section 2: Transfer Logistics */}
            <h5 className="mb-2">Transfer Logistics</h5>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="current_location_or_user"
                  label="Current Location or User"
                  rules={[{ required: true, message: "Please enter current location or user" }]}
                >
                  <Input placeholder="Enter current location or user" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="new_location_or_user"
                  label="New Location or User"
                  rules={[{ required: true, message: "Please enter new location or user" }]}
                >
                  <Input placeholder="Enter new location or user" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="transfer_date"
                  label="Transfer Date"
                  rules={[{ required: true, message: "Please select transfer date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            {/* Section 3: Justification & Approval */}
            <h5 className="mb-2">Justification & Approval</h5>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="justification"
                  label="Justification"
                  rules={[{ required: true, message: "Please enter justification" }]}
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Enter justification for transfer"
                  />
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
                  <Input placeholder="Enter approver's name" />
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
                {editingTransfer ? "Update Transfer" : "Transfer Asset"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Transfer;