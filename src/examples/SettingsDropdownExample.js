import React, { useState } from 'react';
import { Form, Card, Row, Col, Button, Space, message } from 'antd';
import { 
  StatusTypesDropdown, 
  StatusNamesDropdown, 
  CategoriesDropdown, 
  LocationsDropdown, 
  LocationTypesDropdown, 
  LocationNamesDropdown 
} from '../components/SettingsDropdown';
import useSettingsDropdowns from '../hooks/useSettingsDropdowns';

const SettingsDropdownExample = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState({});

  // Using the custom hook
  const {
    dropdowns,
    loading,
    errors,
    fetchAllDropdowns,
    refreshDropdowns
  } = useSettingsDropdowns();

  const onFinish = (values) => {
    console.log('Form values:', values);
    setFormData(values);
    message.success('Form submitted successfully!');
  };

  const onReset = () => {
    form.resetFields();
    setFormData({});
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Settings Dropdown Examples</h2>
      <p>This example demonstrates how to use the new settings dropdown system.</p>

      <Row gutter={[24, 24]}>
        {/* Method 1: Using Individual Dropdown Components */}
        <Col span={12}>
          <Card title="Method 1: Individual Dropdown Components" style={{ height: '100%' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="statusType"
                label="Status Type"
                rules={[{ required: true, message: 'Please select status type' }]}
              >
                <StatusTypesDropdown />
              </Form.Item>

              <Form.Item
                name="statusName"
                label="Status Name"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <StatusNamesDropdown />
              </Form.Item>

              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <CategoriesDropdown />
              </Form.Item>

              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Please select location' }]}
              >
                <LocationsDropdown />
              </Form.Item>

              <Form.Item
                name="locationType"
                label="Location Type"
                rules={[{ required: true, message: 'Please select location type' }]}
              >
                <LocationTypesDropdown />
              </Form.Item>

              <Form.Item
                name="locationName"
                label="Location Name"
              >
                <LocationNamesDropdown />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Submit
                  </Button>
                  <Button onClick={onReset}>
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Method 2: Using Custom Hook */}
        <Col span={12}>
          <Card title="Method 2: Using Custom Hook" style={{ height: '100%' }}>
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Button 
                  onClick={fetchAllDropdowns}
                  loading={loading.all}
                >
                  Refresh All Data
                </Button>
                <Button 
                  onClick={refreshDropdowns}
                  loading={loading.all}
                >
                  Clear Cache & Refresh
                </Button>
              </Space>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4>Loading States:</h4>
              <ul>
                <li>Status Types: {loading.statusTypes ? 'Loading...' : 'Loaded'}</li>
                <li>Status Names: {loading.statusNames ? 'Loading...' : 'Loaded'}</li>
                <li>Categories: {loading.categories ? 'Loading...' : 'Loaded'}</li>
                <li>Locations: {loading.locations ? 'Loading...' : 'Loaded'}</li>
                <li>Location Types: {loading.locationTypes ? 'Loading...' : 'Loaded'}</li>
                <li>Location Names: {loading.locationNames ? 'Loading...' : 'Loaded'}</li>
              </ul>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4>Data Counts:</h4>
              <ul>
                <li>Status Types: {dropdowns.statusTypes.length} items</li>
                <li>Status Names: {dropdowns.statusNames.length} items</li>
                <li>Categories: {dropdowns.categories.length} items</li>
                <li>Locations: {dropdowns.locations.length} items</li>
                <li>Location Types: {dropdowns.locationTypes.length} items</li>
                <li>Location Names: {dropdowns.locationNames.length} items</li>
              </ul>
            </div>

            {Object.keys(errors).length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4>Errors:</h4>
                <ul>
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key} style={{ color: 'red' }}>
                      {key}: {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Form Data Display */}
      {Object.keys(formData).length > 0 && (
        <Card title="Form Data" style={{ marginTop: '24px' }}>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </Card>
      )}

      {/* API Endpoints Reference */}
      <Card title="API Endpoints Reference" style={{ marginTop: '24px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
          <p><strong>Status Types:</strong> GET /api/settings/getStatusTypesDropdown</p>
          <p><strong>Status Names:</strong> GET /api/settings/getStatusNamesDropdown</p>
          <p><strong>Categories:</strong> GET /api/settings/getCategoriesDropdown</p>
          <p><strong>Locations:</strong> GET /api/settings/getLocationsDropdown</p>
          <p><strong>Location Types:</strong> GET /api/settings/getLocationTypesDropdown</p>
          <p><strong>Location Names:</strong> GET /api/settings/getLocationNamesDropdown</p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsDropdownExample;
