import React, { useState } from 'react';
import CustomBreadcrumb from '../../components/Breadcrumb';
// import BackNavigation from './common/BackNavigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../App.css';
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  message,
  InputNumber,
} from 'antd';
import axios from 'axios';
// import { formatDateForDB, parseDateFromDB } from '../utils/dateUtils';

const { Option } = Select;

const Schedule = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Submit form
  const onFinish = async (values) => {
    console.log("Schedule form submitted with values:", values);
    message.loading("Saving schedule...", 0);
    
    try {
      setLoading(true);
      
      if (editingSchedule) {
        // Update existing schedule
        console.log("Updating schedule:", editingSchedule);
        const updateData = {
          id: editingSchedule.id,
          asset_id: values.asset_id,
          maintenance_type: values.maintenance_type,
          description: values.description,
          scheduled_date: values.scheduled_date,
          due_date: values.due_date,
          priority: values.priority,
          assigned_to: values.assigned_to,
          location: values.location,
          estimated_cost: values.estimated_cost,
          vendor: values.vendor,
          notification: values.notification,
          attachment: values.attachment
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
        const response = await axios.put("http://202.53.92.35:5004/api/maintenance/schedule", updateData,{
          headers: {
            "x-access-token":  sessionStorage.getItem("token"),
          }
        });
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Schedule updated successfully!");
      } else {
        // Create new schedule
        console.log("Creating new schedule");
        const createData = {
          asset_id: values.asset_id,
          maintenance_type: values.maintenance_type,
          description: values.description,
          scheduled_date: values.scheduled_date,
          due_date: values.due_date,
          priority: values.priority,
          assigned_to: values.assigned_to,
          location: values.location,
          estimated_cost: values.estimated_cost,
          vendor: values.vendor,
          notification: values.notification,
          attachment: values.attachment
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        
        const response = await axios.post("http://202.53.92.35:5004/api/maintenance/schedule", createData,{
          headers: {
            "x-access-token":  sessionStorage.getItem("token"),
          }
        });
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Schedule created successfully!");
      }
      
      form.resetFields();
      setEditingSchedule(null);
    } catch (error) {
      console.error("Error saving schedule:", error);
      message.destroy(); // Clear loading message
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save schedule: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save schedule. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingSchedule(null);
  };

  return (
    <div className="container-fluid p-1">
      {/* Top Navigation Bar - Breadcrumb Only */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      <h2 className="mb-1">Schedule</h2>
      <p className="mt-0">Plan and manage asset schedules.</p>
      
      <div className="card">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Maintenance Details</h5>
          
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
          >
            {/* Asset Information */}
            <h5 className="mb-2">Asset Information</h5>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="asset_id"
                  label="Asset ID"
                  rules={[{ required: true, message: "Please select asset ID" }]}
                >
                  <Select placeholder="Select asset ID">
                    <Option value="AST-001">AST-001</Option>
                    <Option value="AST-002">AST-002</Option>
                    <Option value="AST-003">AST-003</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Maintenance Details */}
            <h5 className="mb-2">Maintenance Details</h5>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="maintenance_type"
                  label="Maintenance Type"
                  rules={[{ required: true, message: "Please select maintenance type" }]}
                >
                  <Select placeholder="Select maintenance type">
                    <Option value="Preventive">Preventive</Option>
                    <Option value="Corrective">Corrective</Option>
                    <Option value="Calibration">Calibration</Option>
                    <Option value="AMC">AMC</Option>
                    <Option value="Repair">Repair</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label="Priority"
                  rules={[{ required: true, message: "Please select priority" }]}
                >
                  <Select placeholder="Select priority">
                    <Option value="High">High</Option>
                    <Option value="Medium">Medium</Option>
                    <Option value="Low">Low</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: "Please enter description" }]}
                >
                  <Input.TextArea 
                    rows={3} 
                    placeholder="Enter maintenance description"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="scheduled_date"
                  label="Scheduled Date"
                  rules={[{ required: true, message: "Please select scheduled date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="due_date"
                  label="Due Date"
                  rules={[{ required: true, message: "Please select due date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="assigned_to"
                  label="Assigned To"
                  rules={[{ required: true, message: "Please enter assigned to" }]}
                >
                  <Input placeholder="Enter assigned to" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Location"
                  rules={[{ required: true, message: "Please enter location" }]}
                >
                  <Input placeholder="Enter location" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="estimated_cost"
                  label="Estimated Cost"
                  rules={[{ required: true, message: "Please enter estimated cost" }]}
                >
                  <InputNumber 
                    placeholder="Enter estimated cost (e.g., 7500.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="vendor"
                  label="Vendor"
                  rules={[{ required: true, message: "Please enter vendor" }]}
                >
                  <Input placeholder="Enter vendor name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="notification"
                  label="Notification"
                  rules={[{ required: true, message: "Please select notification" }]}
                >
                  <Select placeholder="Select notification method">
                    <Option value="Email">Email</Option>
                    <Option value="SMS">SMS</Option>
                    <Option value="Email + In-app">Email + In-app</Option>
                    <Option value="SMS + Email">SMS + Email</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="attachment"
                  label="Attachment"
                >
                  <Input placeholder="Enter attachment filename (e.g., mnt_sched_001.pdf)" />
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
                {editingSchedule ? "Update Schedule" : "Create Schedule"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Schedule;