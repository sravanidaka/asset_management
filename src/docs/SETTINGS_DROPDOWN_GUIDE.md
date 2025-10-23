# Settings Dropdown System Guide

This guide explains how to use the new centralized settings dropdown system that fetches data from the settings APIs.

## Overview

The system provides a unified way to handle all dropdown data from the settings module, with caching, loading states, and error handling.

## API Endpoints

The system connects to these API endpoints:

- `GET /api/settings/getStatusTypesDropdown` - Status Types
- `GET /api/settings/getStatusNamesDropdown` - Status Names  
- `GET /api/settings/getCategoriesDropdown` - Categories
- `GET /api/settings/getLocationsDropdown` - Locations
- `GET /api/settings/getLocationTypesDropdown` - Location Types
- `GET /api/settings/getLocationNamesDropdown` - Location Names

## Components

### 1. Settings Service (`src/services/settingsService.js`)

The core service that handles API calls and data transformation.

```javascript
import { getCategories, getLocations, getStatusNames } from '../services/settingsService';

// Fetch individual dropdown data
const categories = await getCategories();
const locations = await getLocations();
const statusNames = await getStatusNames();

// Fetch all dropdown data at once
const allData = await getAllDropdownData();
```

### 2. Custom Hook (`src/hooks/useSettingsDropdowns.js`)

A React hook that provides easy access to all dropdown data with loading states.

```javascript
import useSettingsDropdowns from '../hooks/useSettingsDropdowns';

const MyComponent = () => {
  const {
    dropdowns,
    loading,
    errors,
    fetchAllDropdowns,
    refreshDropdowns
  } = useSettingsDropdowns();

  return (
    <div>
      {loading.categories ? 'Loading...' : 'Loaded'}
      <p>Categories: {dropdowns.categories.length}</p>
    </div>
  );
};
```

### 3. Reusable Dropdown Components (`src/components/SettingsDropdown.js`)

Pre-built dropdown components for each type.

```javascript
import { 
  StatusNamesDropdown, 
  CategoriesDropdown, 
  LocationsDropdown 
} from '../components/SettingsDropdown';

const MyForm = () => {
  return (
    <Form>
      <Form.Item name="status" label="Status">
        <StatusNamesDropdown />
      </Form.Item>
      
      <Form.Item name="category" label="Category">
        <CategoriesDropdown />
      </Form.Item>
      
      <Form.Item name="location" label="Location">
        <LocationsDropdown />
      </Form.Item>
    </Form>
  );
};
```

## Usage Examples

### Method 1: Using Individual Dropdown Components

```javascript
import { StatusNamesDropdown, CategoriesDropdown } from '../components/SettingsDropdown';

const MyComponent = () => {
  const [formData, setFormData] = useState({});

  return (
    <div>
      <StatusNamesDropdown
        value={formData.status}
        onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
        placeholder="Select status"
      />
      
      <CategoriesDropdown
        value={formData.category}
        onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        placeholder="Select category"
        allowClear
        showSearch
      />
    </div>
  );
};
```

### Method 2: Using Custom Hook

```javascript
import useSettingsDropdowns from '../hooks/useSettingsDropdowns';
import { Select } from 'antd';

const MyComponent = () => {
  const { dropdowns, loading, fetchAllDropdowns } = useSettingsDropdowns();

  return (
    <div>
      <Select
        placeholder="Select category"
        loading={loading.categories}
        options={dropdowns.categories.map(item => ({
          value: item.value,
          label: item.label
        }))}
      />
      
      <button onClick={fetchAllDropdowns}>
        Refresh Data
      </button>
    </div>
  );
};
```

### Method 3: Using Settings Service Directly

```javascript
import { getCategories, getSelectOptions } from '../services/settingsService';

const MyComponent = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Select
      placeholder="Select category"
      loading={loading}
      options={getSelectOptions(categories)}
    />
  );
};
```

## Available Dropdown Components

| Component | Type | Description |
|-----------|------|-------------|
| `StatusTypesDropdown` | statusTypes | Status type options |
| `StatusNamesDropdown` | statusNames | Status name options |
| `CategoriesDropdown` | categories | Asset category options |
| `LocationsDropdown` | locations | Location options |
| `LocationTypesDropdown` | locationTypes | Location type options |
| `LocationNamesDropdown` | locationNames | Location name options |

## Props

All dropdown components accept these props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | string | "Select option" | Placeholder text |
| `loading` | boolean | false | External loading state |
| `disabled` | boolean | false | Disable the dropdown |
| `allowClear` | boolean | true | Allow clearing selection |
| `showSearch` | boolean | true | Enable search functionality |
| `value` | any | - | Controlled value |
| `onChange` | function | - | Change handler |
| `onBlur` | function | - | Blur handler |
| `style` | object | - | Custom styles |
| `className` | string | - | Custom CSS class |
| `size` | string | "middle" | Size of the dropdown |
| `mode` | string | - | "multiple" for multi-select |
| `maxTagCount` | number | - | Max tags in multi-select |

## Caching

The system includes intelligent caching:

- **Cache Duration**: 5 minutes
- **Auto-refresh**: Data is cached and reused across components
- **Manual Refresh**: Use `refreshAllDropdownData()` to clear cache and fetch fresh data

```javascript
import { refreshAllDropdownData } from '../services/settingsService';

// Clear cache and fetch fresh data
await refreshAllDropdownData();
```

## Error Handling

The system includes comprehensive error handling:

```javascript
const { errors, hasErrors } = useSettingsDropdowns();

if (hasErrors) {
  console.log('Errors:', errors);
  // Handle errors appropriately
}
```

## Migration Guide

### Before (Hardcoded Options)

```javascript
<Select placeholder="Select status">
  <Option value="Active">Active</Option>
  <Option value="Inactive">Inactive</Option>
  <Option value="Pending">Pending</Option>
</Select>
```

### After (Dynamic Options)

```javascript
<StatusNamesDropdown placeholder="Select status" />
```

### For HTML Select Elements

```javascript
// Before
<select>
  <option value="">Select category</option>
  <option value="IT">IT Equipment</option>
  <option value="Furniture">Office Furniture</option>
</select>

// After
import { getCategories, getHtmlSelectOptions } from '../services/settingsService';

const [categories, setCategories] = useState([]);

useEffect(() => {
  getCategories().then(setCategories);
}, []);

<select>
  {getHtmlSelectOptions(categories, "Select category").map(option => (
    <option key={option.value} value={option.value} disabled={option.disabled}>
      {option.text}
    </option>
  ))}
</select>
```

## Best Practices

1. **Use the appropriate component**: Choose the right dropdown component for your use case
2. **Handle loading states**: Always show loading indicators while data is being fetched
3. **Error handling**: Implement proper error handling for failed API calls
4. **Caching**: Leverage the built-in caching to avoid unnecessary API calls
5. **Consistent styling**: Use the same props across all dropdowns for consistency

## Troubleshooting

### Common Issues

1. **Empty dropdowns**: Check if the API endpoints are accessible and returning data
2. **Loading forever**: Verify the API endpoints are responding correctly
3. **Authentication errors**: Ensure the auth token is properly set in sessionStorage

### Debug Mode

Enable debug logging by checking the browser console for API responses and error messages.

## Example Implementation

See `src/examples/SettingsDropdownExample.js` for a complete working example of all the different usage methods.
