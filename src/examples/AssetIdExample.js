import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Space, Alert, Divider, Typography, Row, Col } from 'antd';
import { 
  generateAssetId, 
  parseAssetId, 
  validateAssetId, 
  autoGenerateAssetId,
  getLocationCodes,
  getDepartmentCodes,
  getAssetTypeCodes
} from '../utils/assetIdUtils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AssetIdExample = () => {
  const [form] = Form.useForm();
  const [generatedId, setGeneratedId] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);

  const onGenerate = (values) => {
    const assetId = generateAssetId(values);
    setGeneratedId(assetId);
    
    // Parse the generated ID
    const parsed = parseAssetId(assetId);
    setParsedData(parsed);
    
    // Validate the ID
    const isValid = validateAssetId(assetId);
    setValidationResult(isValid);
  };

  const onAutoGenerate = () => {
    const formData = {
      location: 'Bangalore',
      department: 'IT',
      category: 'Laptop',
      purchase_date: new Date()
    };
    
    const assetId = autoGenerateAssetId(formData);
    setGeneratedId(assetId);
    
    const parsed = parseAssetId(assetId);
    setParsedData(parsed);
    
    const isValid = validateAssetId(assetId);
    setValidationResult(isValid);
  };

  const onValidate = (value) => {
    if (!value) {
      setValidationResult(null);
      return;
    }
    
    const isValid = validateAssetId(value);
    setValidationResult(isValid);
    
    if (isValid) {
      const parsed = parseAssetId(value);
      setParsedData(parsed);
    } else {
      setParsedData(null);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Asset ID Format Examples</Title>
      <Paragraph>
        This component demonstrates the new standardized asset ID format: <Text code>BLR-IT-LTP-2025-0012</Text>
      </Paragraph>
      
      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="Generate Asset ID" style={{ height: '100%' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onGenerate}
            >
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Please select location' }]}
              >
                <Select placeholder="Select location">
                  {Object.keys(getLocationCodes()).map(location => (
                    <Option key={location} value={location}>{location}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select placeholder="Select department">
                  {Object.keys(getDepartmentCodes()).map(dept => (
                    <Option key={dept} value={dept}>{dept}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="assetType"
                label="Asset Type"
                rules={[{ required: true, message: 'Please select asset type' }]}
              >
                <Select placeholder="Select asset type">
                  {Object.keys(getAssetTypeCodes()).map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="purchaseYear"
                label="Purchase Year"
                rules={[{ required: true, message: 'Please enter purchase year' }]}
              >
                <Input placeholder="e.g., 2025" />
              </Form.Item>

              <Form.Item
                name="uniqueNumber"
                label="Unique Number"
                rules={[{ required: true, message: 'Please enter unique number' }]}
              >
                <Input placeholder="e.g., 12" />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit">
                  Generate ID
                </Button>
                <Button onClick={onAutoGenerate}>
                  Auto Generate
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Validate Asset ID" style={{ height: '100%' }}>
            <Form.Item label="Asset ID to Validate">
              <Input
                placeholder="e.g., BLR-IT-LTP-2025-0012"
                onChange={(e) => onValidate(e.target.value)}
              />
            </Form.Item>

            {validationResult !== null && (
              <Alert
                message={validationResult ? "Valid Asset ID" : "Invalid Asset ID"}
                type={validationResult ? "success" : "error"}
                style={{ marginBottom: 16 }}
              />
            )}

            {generatedId && (
              <div>
                <Title level={4}>Generated Asset ID:</Title>
                <Text code style={{ fontSize: '16px' }}>{generatedId}</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {parsedData && (
        <Card title="Parsed Asset ID Components" style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <div>
                <Text strong>Location:</Text>
                <br />
                <Text>{parsedData.location} ({parsedData.locationCode})</Text>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text strong>Department:</Text>
                <br />
                <Text>{parsedData.department} ({parsedData.departmentCode})</Text>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text strong>Asset Type:</Text>
                <br />
                <Text>{parsedData.assetType} ({parsedData.assetTypeCode})</Text>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text strong>Purchase Year:</Text>
                <br />
                <Text>{parsedData.purchaseYear}</Text>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text strong>Unique Number:</Text>
                <br />
                <Text>{parsedData.uniqueNumber}</Text>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Card title="Asset ID Format Rules" style={{ marginTop: 24 }}>
        <Paragraph>
          <Text strong>Format:</Text> <Text code>LOCATION-DEPARTMENT-TYPE-YEAR-NUMBER</Text>
        </Paragraph>
        
        <Divider />
        
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Title level={5}>Location Codes</Title>
            <ul>
              <li>BLR - Bangalore</li>
              <li>MUM - Mumbai</li>
              <li>DEL - Delhi</li>
              <li>CHN - Chennai</li>
              <li>KOL - Kolkata</li>
              <li>HYD - Hyderabad</li>
            </ul>
          </Col>
          
          <Col span={8}>
            <Title level={5}>Department Codes</Title>
            <ul>
              <li>IT - Information Technology</li>
              <li>HR - Human Resources</li>
              <li>FIN - Finance</li>
              <li>OPS - Operations</li>
              <li>MKT - Marketing</li>
              <li>SAL - Sales</li>
            </ul>
          </Col>
          
          <Col span={8}>
            <Title level={5}>Asset Type Codes</Title>
            <ul>
              <li>LTP - Laptop</li>
              <li>DTP - Desktop</li>
              <li>SVR - Server</li>
              <li>PRT - Printer</li>
              <li>RTR - Router</li>
              <li>VEH - Vehicle</li>
            </ul>
          </Col>
        </Row>
        
        <Divider />
        
        <Alert
          message="Example Asset IDs"
          description={
            <div>
              <p><Text code>BLR-IT-LTP-2025-0012</Text> - IT Laptop in Bangalore, purchased in 2025, number 12</p>
              <p><Text code>MUM-HR-FUR-2024-0001</Text> - HR Furniture in Mumbai, purchased in 2024, number 1</p>
              <p><Text code>DEL-FIN-EQP-2023-0045</Text> - Finance Equipment in Delhi, purchased in 2023, number 45</p>
            </div>
          }
          type="info"
        />
      </Card>
    </div>
  );
};

export default AssetIdExample;
