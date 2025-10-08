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

const Financial = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState(null);

  // Submit form
  const onFinish = async (values) => {
    console.log("Financial form submitted with values:", values);
    message.loading("Saving financial data...", 0);
    
    try {
      setLoading(true);
      
      if (editingFinancial) {
        // Update existing financial record
        console.log("Updating financial record:", editingFinancial);
        const updateData = {
          id: editingFinancial.id,
          asset_id: values.asset_id,
          depreciation_method: values.depreciation_method,
          purchase_value: values.purchase_value,
          salvage_value: values.salvage_value,
          useful_life_years: values.useful_life_years,
          monthly_depreciation: values.monthly_depreciation,
          accumulated_depreciation: values.accumulated_depreciation,
          general_ledger_code: values.general_ledger_code
        };
        
        console.log("Update data being sent:", updateData);
        console.log("Update data types:", Object.keys(updateData).map(key => `${key}: ${typeof updateData[key]}`));
        
        const response = await axios.put("http://202.53.92.35:5004/api/assets/financial", updateData);
        
        console.log("Update response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Update failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Financial record updated successfully!");
      } else {
        // Create new financial record
        console.log("Creating new financial record");
        const createData = {
          asset_id: values.asset_id,
          depreciation_method: values.depreciation_method,
          purchase_value: values.purchase_value,
          salvage_value: values.salvage_value,
          useful_life_years: values.useful_life_years,
          monthly_depreciation: values.monthly_depreciation,
          accumulated_depreciation: values.accumulated_depreciation,
          general_ledger_code: values.general_ledger_code
        };
        
        console.log("Create data being sent:", createData);
        console.log("Create data types:", Object.keys(createData).map(key => `${key}: ${typeof createData[key]}`));
        
        const response = await axios.post("http://202.53.92.35:5004/api/assets/financial", createData);
        
        console.log("Create response:", response.data);
        
        if (response.data?.success === false) {
          throw new Error(response.data.message || "Creation failed");
        }
        
        message.destroy(); // Clear loading message
        message.success("✅ Financial record created successfully!");
      }
      
      form.resetFields();
      setEditingFinancial(null);
    } catch (error) {
      console.error("Error saving financial data:", error);
      message.destroy(); // Clear loading message
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        message.error("❌ API server is not running. Please check the backend server on 202.53.92.35:5004");
      } else if (error.response?.data?.message) {
        message.error(`❌ Failed to save financial data: ${error.response.data.message}`);
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        message.error("❌ Network error. Please check your internet connection.");
      } else {
        message.error("❌ Failed to save financial data. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    form.resetFields();
    setEditingFinancial(null);
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Asset Depreciation & Financials</h2>
      <p className="mt-0">Calculate and record depreciation.</p>

      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Asset Depreciation Details</h5>
          
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
                  rules={[{ required: true, message: "Please enter asset ID" }]}
                >
                  <Input placeholder="Enter asset ID (e.g., 101)" />
                </Form.Item>
              </Col>
            </Row>

            {/* Depreciation Parameters */}
            <h5 className="mb-2">Depreciation Parameters</h5>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="depreciation_method"
                  label="Depreciation Method"
                  rules={[{ required: true, message: "Please select depreciation method" }]}
                >
                  <Select placeholder="Select depreciation method">
                    <Option value="Straight Line">Straight Line</Option>
                    <Option value="Declining Balance">Declining Balance</Option>
                    <Option value="Sum of Years">Sum of Years</Option>
                    <Option value="SLM">SLM</Option>
                    <Option value="WDV">WDV</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="purchase_value"
                  label="Purchase Value"
                  rules={[{ required: true, message: "Please enter purchase value" }]}
                >
                  <InputNumber 
                    placeholder="Enter purchase value (e.g., 1200.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="salvage_value"
                  label="Salvage Value"
                  rules={[{ required: true, message: "Please enter salvage value" }]}
                >
                  <InputNumber 
                    placeholder="Enter salvage value (e.g., 200.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="useful_life_years"
                  label="Useful Life (Years)"
                  rules={[{ required: true, message: "Please enter useful life in years" }]}
                >
                  <InputNumber 
                    placeholder="Enter useful life (e.g., 5)" 
                    style={{ width: '100%' }}
                    min={1}
                    max={100}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Financial Details */}
            <h5 className="mb-2">Financial Details</h5>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="monthly_depreciation"
                  label="Monthly Depreciation"
                  rules={[{ required: true, message: "Please enter monthly depreciation" }]}
                >
                  <InputNumber 
                    placeholder="Enter monthly depreciation (e.g., 20.00)" 
                    style={{ width: '100%' }}
                    min={0}
                    step={0.01}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="accumulated_depreciation"
                  label="Accumulated Depreciation"
                  rules={[{ required: true, message: "Please enter accumulated depreciation" }]}
                >
                  <InputNumber 
                    placeholder="Enter accumulated depreciation (e.g., 800.00)" 
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
                  name="general_ledger_code"
                  label="General Ledger Code"
                  rules={[{ required: true, message: "Please enter general ledger code" }]}
                >
                  <Input placeholder="Enter general ledger code (e.g., GL-DEP-2023-001)" />
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
                {editingFinancial ? "Update Financial Record" : "Save Depreciation Log"}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Financial;