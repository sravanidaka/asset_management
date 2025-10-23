// Example component showing how to use the auth interceptor
import React, { useState, useEffect } from 'react';
import { api } from '../config/api';
import { authenticatedGet, authenticatedPost, getCurrentUser } from '../utils/authUtils';

const ApiUsageExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user info
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  // Example: Fetch data using the API object
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using the api object (recommended)
      const result = await api.getAssets();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Example: Fetch data using auth utils directly
  const fetchDataDirect = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using auth utils directly
      const result = await authenticatedGet('/assets');
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Example: Create new asset
  const createAsset = async () => {
    setLoading(true);
    setError(null);
    
    const newAsset = {
      name: 'New Asset',
      category: 'IT Equipment',
      location: 'Office A',
      // ... other asset data
    };
    
    try {
      const result = await api.createAsset(newAsset);
      
      if (result.success) {
        console.log('Asset created successfully:', result.data);
        // Refresh data
        await fetchData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  // Example: Update asset
  const updateAsset = async (assetId, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.updateAsset({ id: assetId, ...updateData });
      
      if (result.success) {
        console.log('Asset updated successfully:', result.data);
        // Refresh data
        await fetchData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update asset');
    } finally {
      setLoading(false);
    }
  };

  // Example: Delete asset
  const deleteAsset = async (assetId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.deleteAsset({ id: assetId });
      
      if (result.success) {
        console.log('Asset deleted successfully');
        // Refresh data
        await fetchData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to delete asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <h2>API Usage Examples</h2>
      
      {user && (
        <div className="alert alert-info">
          <strong>Current User:</strong> {user.name} ({user.role})
        </div>
      )}
      
      <div className="mb-3">
        <button 
          className="btn btn-primary me-2" 
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Assets (API Object)'}
        </button>
        
        <button 
          className="btn btn-secondary me-2" 
          onClick={fetchDataDirect}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Assets (Direct)'}
        </button>
        
        <button 
          className="btn btn-success me-2" 
          onClick={createAsset}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Asset'}
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="alert alert-success">
          <strong>Data loaded successfully!</strong>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-4">
        <h4>How to use in your components:</h4>
        <pre className="bg-light p-3">
{`// Import the API functions
import { api } from '../config/api';
import { authenticatedGet, authenticatedPost } from '../utils/authUtils';

// In your component
const MyComponent = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      // Method 1: Using the api object (recommended)
      const result = await api.getAssets();
      
      // Method 2: Using auth utils directly
      const result2 = await authenticatedGet('/assets');
      
      if (result.success) {
        setData(result.data);
      }
    };
    
    fetchData();
  }, []);
  
  return <div>{/* Your component JSX */}</div>;
};`}
        </pre>
      </div>
    </div>
  );
};

export default ApiUsageExample;
