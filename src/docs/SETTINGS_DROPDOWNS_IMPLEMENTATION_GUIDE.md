# Settings Dropdowns Implementation Guide

This guide shows how to implement the settings dropdowns throughout your project using the provided API endpoints.

## Available API Endpoints

| API Endpoint | Dropdown Component | Description |
|--------------|-------------------|-------------|
| `GET /api/settings/getStatusTypesDropdown` | `StatusTypesDropdown` | Status Types |
| `GET /api/settings/getStatusNamesDropdown` | `StatusNamesDropdown` | Status Names |
| `GET /api/settings/getCategoriesDropdown` | `CategoriesDropdown` | Categories |
| `GET /api/settings/getLocationsDropdown` | `LocationsDropdown` | Locations |
| `GET /api/settings/getLocationTypesDropdown` | `LocationTypesDropdown` | Location Types |
| `GET /api/settings/getLocationNamesDropdown` | `LocationNamesDropdown` | Location Names |
| `GET /api/settings/getVendorNamesDropdown` | `VendorNamesDropdown` | Vendor Names |

## Implementation Steps

### 1. Import the Required Dropdowns

```javascript
import { 
  StatusTypesDropdown,
  StatusNamesDropdown,
  CategoriesDropdown,
  LocationsDropdown,
  LocationTypesDropdown,
  LocationNamesDropdown,
  VendorNamesDropdown
} from '../components/SettingsDropdown';
```

### 2. Use in Forms

Replace hardcoded `<Select>` components with the settings dropdowns:

#### Before (Hardcoded):
```javascript
<Form.Item name="status" label="Status">
  <Select placeholder="Select Status">
    <Select.Option value="Active">Active</Select.Option>
    <Select.Option value="Inactive">Inactive</Select.Option>
  </Select>
</Form.Item>
```

#### After (Settings Dropdown):
```javascript
<Form.Item name="status" label="Status">
  <StatusNamesDropdown 
    placeholder="Select Status"
    showSearch={true}
    allowClear={true}
  />
</Form.Item>
```

## Implementation Examples

### Example 1: Basic Usage

```javascript
import React from 'react';
import { Form, Button } from 'antd';
import { 
  StatusNamesDropdown,
  CategoriesDropdown,
  LocationsDropdown
} from '../components/SettingsDropdown';

const MyForm = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Form values:', values);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item 
        name="status" 
        label="Status"
        rules={[{ required: true, message: 'Please select status' }]}
      >
        <StatusNamesDropdown 
          placeholder="Select Status"
          showSearch={true}
          allowClear={true}
        />
      </Form.Item>

      <Form.Item 
        name="category" 
        label="Category"
        rules={[{ required: true, message: 'Please select category' }]}
      >
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
  );
};
```

### Example 2: Advanced Usage with onChange

```javascript
import React, { useState } from 'react';
import { Form, Button, message } from 'antd';
import { 
  LocationTypesDropdown,
  LocationNamesDropdown,
  VendorNamesDropdown
} from '../components/SettingsDropdown';

const AdvancedForm = () => {
  const [form] = Form.useForm();
  const [selectedLocationType, setSelectedLocationType] = useState(null);

  const handleLocationTypeChange = (value, option) => {
    setSelectedLocationType(value);
    console.log('Location type changed:', value, option);
    
    // Clear location name when type changes
    form.setFieldValue('locationName', undefined);
  };

  const handleVendorChange = (value, option) => {
    console.log('Vendor selected:', value, option);
    message.success(`Selected vendor: ${option?.label}`);
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item name="locationType" label="Location Type">
        <LocationTypesDropdown 
          placeholder="Select Location Type"
          showSearch={true}
          allowClear={true}
          onChange={handleLocationTypeChange}
        />
      </Form.Item>

      <Form.Item name="locationName" label="Location Name">
        <LocationNamesDropdown 
          placeholder="Select Location Name"
          showSearch={true}
          allowClear={true}
          disabled={!selectedLocationType}
        />
      </Form.Item>

      <Form.Item name="vendor" label="Vendor">
        <VendorNamesDropdown 
          placeholder="Select Vendor"
          showSearch={true}
          allowClear={true}
          onChange={handleVendorChange}
        />
      </Form.Item>
    </Form>
  );
};
```

### Example 3: With Loading States

```javascript
import React, { useState, useEffect } from 'react';
import { Form, Button, Spin } from 'antd';
import { 
  StatusTypesDropdown,
  CategoriesDropdown
} from '../components/SettingsDropdown';

const FormWithLoading = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Your API call here
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Form submitted:', values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="statusType" label="Status Type">
          <StatusTypesDropdown 
            placeholder="Select Status Type"
            showSearch={true}
            allowClear={true}
            disabled={loading}
          />
        </Form.Item>

        <Form.Item name="category" label="Category">
          <CategoriesDropdown 
            placeholder="Select Category"
            showSearch={true}
            allowClear={true}
            disabled={loading}
          />
        </Form.Item>

        <Button 
          type="primary" 
          htmlType="submit" 
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </Form>
    </Spin>
  );
};
```

## Screen-Specific Implementations

### 1. ManageVendor.js
```javascript
// Replace hardcoded status dropdown
<Form.Item name="status" label="Status">
  <StatusNamesDropdown 
    placeholder="Select Status"
    showSearch={true}
    allowClear={true}
  />
</Form.Item>
```

### 2. ManageUser.js
```javascript
// Add location and status dropdowns
<Form.Item name="location" label="Location">
  <LocationsDropdown 
    placeholder="Select Location"
    showSearch={true}
    allowClear={true}
  />
</Form.Item>

<Form.Item name="status" label="Status">
  <StatusNamesDropdown 
    placeholder="Select Status"
    showSearch={true}
    allowClear={true}
  />
</Form.Item>
```

### 3. ManageDepartment.js
```javascript
// Add location type and category dropdowns
<Form.Item name="locationType" label="Location Type">
  <LocationTypesDropdown 
    placeholder="Select Location Type"
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
```

## Props Available for All Dropdowns

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | string | "Select option" | Placeholder text |
| `showSearch` | boolean | true | Enable search functionality |
| `allowClear` | boolean | true | Allow clearing selection |
| `disabled` | boolean | false | Disable the dropdown |
| `loading` | boolean | false | Show loading state |
| `onChange` | function | - | Callback when value changes |
| `onSelect` | function | - | Callback when option is selected |
| `onClear` | function | - | Callback when selection is cleared |

## Best Practices

### 1. Always Use Validation
```javascript
<Form.Item 
  name="status" 
  label="Status"
  rules={[{ required: true, message: 'Please select status' }]}
>
  <StatusNamesDropdown placeholder="Select Status" />
</Form.Item>
```

### 2. Handle Loading States
```javascript
<StatusNamesDropdown 
  placeholder="Select Status"
  disabled={isLoading}
  loading={isLoading}
/>
```

### 3. Use Search for Large Lists
```javascript
<CategoriesDropdown 
  placeholder="Select Category"
  showSearch={true}
  allowClear={true}
/>
```

### 4. Provide Clear Placeholders
```javascript
<LocationsDropdown 
  placeholder="Select Location (e.g., Bangalore Office)"
  showSearch={true}
  allowClear={true}
/>
```

## Error Handling

The dropdowns automatically handle:
- ✅ API connection errors
- ✅ Loading states
- ✅ Empty data fallbacks
- ✅ Network timeouts

## Caching

The dropdowns use a 5-minute cache to improve performance:
- ✅ Reduces API calls
- ✅ Faster loading on subsequent uses
- ✅ Automatic cache invalidation

## Troubleshooting

### Common Issues:

1. **Dropdown not loading data**
   - Check if API endpoint is accessible
   - Verify authentication token
   - Check browser console for errors

2. **Search not working**
   - Ensure `showSearch={true}` is set
   - Check if API returns searchable data

3. **Validation not working**
   - Ensure Form.Item has proper rules
   - Check if form is properly initialized

### Debug Mode:
```javascript
// Add this to see detailed logs
console.log('Dropdown data:', dropdownData);
console.log('Loading state:', loading);
console.log('Error state:', error);
```

## Migration Checklist

When updating existing forms:

- [ ] Import required dropdown components
- [ ] Replace hardcoded `<Select>` with settings dropdowns
- [ ] Update form validation rules if needed
- [ ] Test all form functionality
- [ ] Verify API endpoints are working
- [ ] Check loading states and error handling
- [ ] Test search functionality
- [ ] Verify form submission works correctly

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify API endpoints are accessible
3. Test with the example components
4. Check the settings service configuration
