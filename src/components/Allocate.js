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
  Select,
  message,
} from "antd";
import axios from "axios";
import { formatDateForDB, parseDateFromDB } from "../utils/dateUtils";

const { Option } = Select;

const Allocate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);

  // Submit form
  const onFinish = async (values) => {
    console.log("Allocation form submitted with values:", values);
    message.loading("Saving allocation...", 0);
    
    try {
      setLoading(true);
      
      if (editingAllocation) {
        // Update existing allocation
        console.log("Updating allocation:", editingAllocation);
        const updateData = {
          id: editingAllocation.id,
          asset_id: parseInt(values.asset_id),
          assignment_date: formatDateForDB(values.assignment_date),
          assignment_type: values.assignment_type,
          return_date: formatDateForDB(values.return_date),
          assigned_to: parseInt(values.assigned_to),
          assigned_by: values.assigned_by,
          assignment_notes: values.assignment_notes,
          condition_at_issue: values.condition_at_issue
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
        const response = await axios.put("http://202.53.92.35:5004/api/assets/allocate", updateData);
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Allocation updated successfully!");
      } else {
        // Create new allocation
        console.log("Creating new allocation");
        const createData = {
          asset_id: parseInt(values.asset_id),
          assignment_date: formatDateForDB(values.assignment_date),
          assignment_type: values.assignment_type,
          return_date: formatDateForDB(values.return_date),
          assigned_to: parseInt(values.assigned_to),
          assigned_by: values.assigned_by,
          assignment_notes: values.assignment_notes,
          condition_at_issue: values.condition_at_issue
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        
        const response = await axios.post("http://202.53.92.35:5004/api/assets/allocate", createData);
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Asset allocated successfully!");
      }
      
      form.resetFields();
      setEditingAllocation(null);
    } catch (error) {
      console.error("Error saving allocation:", error);
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
        message.error(`❌ Failed to save allocation: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save allocation. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingAllocation(null);
  };

  return (
    <div className="container-fluid p-1">
      {/* Top Navigation Bar - Breadcrumb Only */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      <h2 className="mb-1">Asset Allocation</h2>
      <p className="mt-0">Assign assets to users or locations.</p>

      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Assign Asset</h5>
          
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
          >
            {/* Assignment Details */}
            <h5 className="mb-3">Assignment Details</h5>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="asset_id"
                  label="Asset ID"
                  rules={[
                    { required: true, message: "Please enter asset ID" },
                    { pattern: /^\d+$/, message: "Asset ID must be a number" }
                  ]}
                >
                  <Input placeholder="Enter asset ID (e.g., 101)" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="assignment_type"
                  label="Assignment Type"
                  rules={[{ required: true, message: "Please select assignment type" }]}
                >
                  <Select placeholder="Select assignment type">
                    <Option value="Permanent">Permanent</Option>
                    <Option value="Temporary">Temporary</Option>
                    <Option value="Project">Project</Option>
                    <Option value="Department">Department</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="assigned_to"
                  label="Assigned To (Employee ID)"
                  rules={[
                    { required: true, message: "Please enter assigned to ID" },
                    { pattern: /^\d+$/, message: "Employee ID must be a number" }
                  ]}
                >
                  <Input placeholder="Enter employee ID (e.g., 2001)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="assignment_date"
                  label="Assignment Date"
                  rules={[{ required: true, message: "Please select assignment date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="return_date"
                  label="Return Date (Optional)"
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="assigned_by"
                  label="Assigned By"
                  rules={[{ required: true, message: "Please enter assigned by" }]}
                >
                  <Input placeholder="Enter assigned by (e.g., Admin Team)" />
                </Form.Item>
              </Col>
            </Row>

            {/* Additional Information */}
            <h5 className="mb-3">Additional Information</h5>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="assignment_notes"
                  label="Assignment Notes / Purpose"
                  rules={[{ required: true, message: "Please enter assignment notes" }]}
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Enter assignment notes and purpose"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="condition_at_issue"
                  label="Condition at Time of Issue (Optional)"
                >
                  <Input.TextArea 
                    rows={2} 
                    placeholder="Describe the condition of the asset at the time of issue"
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
                {editingAllocation ? "Update Allocation" : "Assign Asset"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Allocate;