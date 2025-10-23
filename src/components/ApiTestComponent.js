import React, { useState } from 'react';
import { api } from '../config/api';
import { getCurrentUser } from '../utils/authUtils';

const ApiTestComponent = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApiCall = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing API call...');
      
      // Check current user
      const user = getCurrentUser();
      console.log('👤 Current user:', user);
      
      // Check token
      const token = sessionStorage.getItem('token');
      console.log('🔑 Token:', token);
      
      // Make API call
      const response = await api.getAssets();
      console.log('📡 API Response:', response);
      
      setResult(response);
    } catch (err) {
      console.error('❌ API Test Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testDirectCall = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Testing direct API call...');
      
      const token = sessionStorage.getItem('token');
      console.log('🔑 Token:', token);
      
      // Make direct fetch call to test
      const response = await fetch('http://202.53.92.35:5004/api/assets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token
        }
      });
      
      const data = await response.json();
      console.log('📡 Direct API Response:', data);
      
      setResult({ success: response.ok, data, status: response.status });
    } catch (err) {
      console.error('❌ Direct API Test Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <h3>API Test Component</h3>
      
      <div className="mb-3">
        <button 
          className="btn btn-primary me-2" 
          onClick={testApiCall}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test API Call (via interceptor)'}
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={testDirectCall}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Direct API Call'}
        </button>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="alert alert-success">
          <strong>Result:</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-4">
        <h5>Debug Info:</h5>
        <div className="bg-light p-3">
          <p><strong>Token:</strong> {sessionStorage.getItem('token') || 'No token found'}</p>
          <p><strong>User:</strong> {JSON.stringify(getCurrentUser(), null, 2)}</p>
          <p><strong>Is Authenticated:</strong> {sessionStorage.getItem('isAuthenticated')}</p>
        </div>
      </div>
    </div>
  );
};

export default ApiTestComponent;
