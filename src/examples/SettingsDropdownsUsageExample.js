import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Card, Space, Divider } from 'antd';
import { 
  StatusTypesDropdown,
  StatusNamesDropdown,
  CategoriesDropdown,
  LocationsDropdown,
  LocationTypesDropdown,
  LocationNamesDropdown,
  VendorNamesDropdown
} from '../components/SettingsDropdown';

/**
 * Example showing how to use Settings Dropdowns in various screens
 * 
 * Available Dropdowns:
 * - StatusTypesDropdown: GET /api/settings/getStatusTypesDropdown
 * - StatusNamesDropdown: GET /api/settings/getStatusNamesDropdown  
 * - CategoriesDropdown: GET /api/settings/getCategoriesDropdown
 * - LocationsDropdown: GET /api/settings/getLocationsDropdown
 * - LocationTypesDropdown: GET /api/settings/getLocationTypesDropdown
 * - LocationNamesDropdown: GET /api/settings/getLocationNamesDropdown
 * - VendorNamesDropdown: GET /api/settings/getVendorNamesDropdown
 */

const SettingsDropdownsUsageExample = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>Settings Dropdowns Usage Examples</h2>
      <p>This example shows how to use the settings dropdowns in your forms.</p>
      
      <Row gutter={[16, 16]}>
        {/* Basic Usage Example */}
        <Col span={12}>
          <Card title="Basic Usage" size="small">
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item name="statusType" label="Status Type">
                <StatusTypesDropdown 
                  placeholder="Select Status Type"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
              
              <Form.Item name="statusName" label="Status Name">
                <StatusNamesDropdown 
                  placeholder="Select Status"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
              
              <Form.Item name="category" label="Category">
                <CategoriesDropdown 
                  placeholder="Select Category"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
              
              <Form.Item name="location" label="Location">
                <LocationsDropdown 
                  placeholder="Select Location"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
              
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form>
          </Card>
        </Col>

        {/* Advanced Usage Example */}
        <Col span={12}>
          <Card title="Advanced Usage" size="small">
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item name="locationType" label="Location Type">
                <LocationTypesDropdown 
                  placeholder="Select Location Type"
                  showSearch={true}
                  allowClear={true}
                  disabled={false}
                />
              </Form.Item>
              
              <Form.Item name="locationName" label="Location Name">
                <LocationNamesDropdown 
                  placeholder="Select Location Name"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
              
              <Form.Item name="vendor" label="Vendor">
                <VendorNamesDropdown 
                  placeholder="Select Vendor"
                  showSearch={true}
                  allowClear={true}
                />
              </Form.Item>
              
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Enter description" />
              </Form.Item>
              
              <Space>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
                <Button onClick={() => form.resetFields()}>
                  Reset
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Code Examples */}
      <Card title="Code Examples" size="small">
        <h4>1. Basic Import and Usage:</h4>
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`import { 
  StatusTypesDropdown,
  StatusNamesDropdown,
  CategoriesDropdown,
  LocationsDropdown,
  LocationTypesDropdown,
  LocationNamesDropdown,
  VendorNamesDropdown
} from '../components/SettingsDropdown';

// In your form:
<Form.Item name="statusType" label="Status Type">
  <StatusTypesDropdown 
    placeholder="Select Status Type"
    showSearch={true}
    allowClear={true}
  />
</Form.Item>`}
        </pre>

        <h4>2. With Form Validation:</h4>
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`<Form.Item 
  name="category" 
  label="Category"
  rules={[{ required: true, message: 'Please select a category' }]}
>
  <CategoriesDropdown 
    placeholder="Select Category"
    showSearch={true}
    allowClear={true}
  />
</Form.Item>`}
        </pre>

        <h4>3. With onChange Handler:</h4>
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`<Form.Item name="location" label="Location">
  <LocationsDropdown 
    placeholder="Select Location"
    showSearch={true}
    allowClear={true}
    onChange={(value, option) => {
      console.log('Selected location:', value, option);
      // Handle location change
    }}
  />
</Form.Item>`}
        </pre>

        <h4>4. Disabled State:</h4>
        <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`<Form.Item name="vendor" label="Vendor">
  <VendorNamesDropdown 
    placeholder="Select Vendor"
    showSearch={true}
    allowClear={true}
    disabled={isLoading}
  />
</Form.Item>`}
        </pre>
      </Card>

      <Divider />

      {/* Available Dropdowns */}
      <Card title="Available Dropdowns" size="small">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <h4>Status Dropdowns:</h4>
            <ul>
              <li><strong>StatusTypesDropdown</strong> - Status Types</li>
              <li><strong>StatusNamesDropdown</strong> - Status Names</li>
            </ul>
          </Col>
          <Col span={8}>
            <h4>Location Dropdowns:</h4>
            <ul>
              <li><strong>LocationsDropdown</strong> - Locations</li>
              <li><strong>LocationTypesDropdown</strong> - Location Types</li>
              <li><strong>LocationNamesDropdown</strong> - Location Names</li>
            </ul>
          </Col>
          <Col span={8}>
            <h4>Other Dropdowns:</h4>
            <ul>
              <li><strong>CategoriesDropdown</strong> - Categories</li>
              <li><strong>VendorNamesDropdown</strong> - Vendor Names</li>
            </ul>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* API Endpoints */}
      <Card title="API Endpoints" size="small">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <h4>Settings APIs:</h4>
            <ul>
              <li><code>GET /api/settings/getStatusTypesDropdown</code></li>
              <li><code>GET /api/settings/getStatusNamesDropdown</code></li>
              <li><code>GET /api/settings/getCategoriesDropdown</code></li>
              <li><code>GET /api/settings/getLocationsDropdown</code></li>
            </ul>
          </Col>
          <Col span={12}>
            <h4>More Settings APIs:</h4>
            <ul>
              <li><code>GET /api/settings/getLocationTypesDropdown</code></li>
              <li><code>GET /api/settings/getLocationNamesDropdown</code></li>
              <li><code>GET /api/settings/getVendorNamesDropdown</code></li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SettingsDropdownsUsageExample;
