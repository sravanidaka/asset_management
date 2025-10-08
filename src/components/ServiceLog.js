import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
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
import { formatDateForDB, parseDateFromDB } from '../utils/dateUtils';

const { Option } = Select;

const ServiceLog = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingServiceLog, setEditingServiceLog] = useState(null);

  // Submit form
  const onFinish = async (values) => {
    console.log("Service log form submitted with values:", values);
    message.loading("Saving service log...", 0);
    
    try {
      setLoading(true);
      
      if (editingServiceLog) {
        // Update existing service log
        console.log("Updating service log:", editingServiceLog);
        const updateData = {
          id: editingServiceLog.id,
          asset_id: values.asset_id,
          maintenance_type: values.maintenance_type,
          service_date: values.service_date,
          next_scheduled_date: values.next_scheduled_date,
          vendor_technician: values.vendor_technician,
          cost_incurred: values.cost_incurred,
          downtime_hours: values.downtime_hours,
          service_notes: values.service_notes,
          attachment: values.attachment
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
        const response = await axios.put("http://202.53.92.35:5004/api/maintenance/service-log", updateData);
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Service log updated successfully!");
      } else {
        // Create new service log
        console.log("Creating new service log");
        const createData = {
          asset_id: values.asset_id,
          maintenance_type: values.maintenance_type,
          service_date: values.service_date,
          next_scheduled_date: values.next_scheduled_date,
          vendor_technician: values.vendor_technician,
          cost_incurred: values.cost_incurred,
          downtime_hours: values.downtime_hours,
          service_notes: values.service_notes,
          attachment: values.attachment
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        
        const response = await axios.post("http://202.53.92.35:5004/api/maintenance/service-log", createData);
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Service log created successfully!");
      }
      
      form.resetFields();
      setEditingServiceLog(null);
    } catch (error) {
      console.error("Error saving service log:", error);
      message.destroy(); // Clear loading message
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save service log: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save service log. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingServiceLog(null);
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Maintenance/Service Call Log</h2>
      <p className="mt-0">Track maintenance, repairs, AMC, calibration, etc.</p>
      
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Service Log Details</h5>
          
          <Form
            layout="vertical"
            form={form}
            onFinish={onFinish}
          >
            <Row gutter={16}>
              <Col span={12}>
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
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="service_date"
                  label="Service Date"
                  rules={[{ required: true, message: "Please select service date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="next_scheduled_date"
                  label="Next Scheduled Date"
                  rules={[{ required: true, message: "Please select next scheduled date" }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="vendor_technician"
                  label="Vendor/Technician"
                  rules={[{ required: true, message: "Please enter vendor/technician" }]}
                >
                  <Input placeholder="Enter vendor/technician name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cost_incurred"
                  label="Cost Incurred"
                  rules={[{ required: true, message: "Please enter cost incurred" }]}
                >
                  <InputNumber 
                    placeholder="Enter cost incurred (e.g., 5000.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="downtime_hours"
                  label="Downtime Hours"
                  rules={[{ required: true, message: "Please enter downtime hours" }]}
                >
                  <InputNumber 
                    placeholder="Enter downtime hours (e.g., 4)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.1}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="attachment"
                  label="Attachment"
                >
                  <Input placeholder="Enter attachment filename (e.g., report_mnt001.pdf)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="service_notes"
                  label="Service Notes"
                  rules={[{ required: true, message: "Please enter service notes" }]}
                >
                  <Input.TextArea 
                    rows={4} 
                    placeholder="Enter detailed service notes"
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
                {editingServiceLog ? "Update Service Log" : "Save Service Log"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ServiceLog;