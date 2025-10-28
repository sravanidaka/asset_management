import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import CustomBreadcrumb from '../../components/Breadcrumb';
import BackNavigation from '../../components/BackNavigation';
import ExportButton from '../../components/ExportButton';
import {
  Button,
  message,
  Table
} from "antd";
import { safeStringCompare } from '../../utils/tableUtils';


const AssetHistory = () => {
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  // Fetch financial data from API
  const fetchFinancials = async () => {
    setLoading(true);
    try {
      console.log('Fetching financial records from API...');
      const response = await fetch(`http://202.53.92.35:5004/api/assets/financial`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-access-token": sessionStorage.getItem("token"),
        }
      });
      
      console.log('API Response status:', response.status);
      
      const result = await response.json();
    
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
      } else if (result.financials && Array.isArray(result.financials)) {
        data = result.financials;
      } else if (result.result && Array.isArray(result.result)) {
        data = result.result;
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
      } else {
        console.error("Unexpected API response structure:", result);
        data = [];
      }
    
      // Add key property for each item (required by Ant Design Table)
      const dataWithKeys = data.map((item, index) => ({
        ...item,
        key: item.id || item._id || index.toString(),
      }));
      
      setDataSource(dataWithKeys);
    } catch (error) {
      console.error("Error fetching financial records:", error);
      message.error(`Failed to load financial records: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  // Handle table change for filters and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Dynamic table columns based on available data
  const getDynamicColumns = () => {
    if (dataSource.length === 0) return [];
    
    // Define only the fields that should be shown
    const allPossibleFields = [
      'asset_id', 'depreciation_method', 'purchase_value', 'salvage_value', 
      'useful_life_years', 'monthly_depreciation', 'accumulated_depreciation', 'general_ledger_code'
    ];
    
    // Get fields that have actual data (not N/A, null, undefined, empty)
    const getFieldsWithData = () => {
      const fieldsWithData = new Set();
      
      // First, add all possible fields that exist in the data
      allPossibleFields.forEach(field => {
        if (dataSource.some(item => item[field] !== undefined && item[field] !== null)) {
          fieldsWithData.add(field);
        }
      });
      
      // Then add any other fields that have data
      dataSource.forEach(item => {
        Object.keys(item).forEach(key => {
          if (key !== 'key' && 
              item[key] !== 'N/A' && 
              item[key] !== null && 
              item[key] !== undefined && 
              item[key] !== '' &&
              item[key] !== 'null' &&
              item[key] !== 'undefined') {
            fieldsWithData.add(key);
          }
        });
      });
      
      return Array.from(fieldsWithData);
    };
    
    const availableFields = getFieldsWithData();
    
    // Define field mappings with display names, render functions, and simple filters
    const fieldMappings = {
      asset_id: { 
        title: "Asset ID", 
        sorter: (a, b) => safeStringCompare(a.asset_id, b.asset_id),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.asset_id?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.asset_id || null,
      },
      depreciation_method: { 
        title: "Depreciation Method", 
        sorter: (a, b) => safeStringCompare(a.depreciation_method, b.depreciation_method),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.depreciation_method?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.depreciation_method || null,
      },
      purchase_value: { 
        title: "Purchase Value", 
        sorter: (a, b) => safeStringCompare(a.purchase_value, b.purchase_value),
        render: (text) => text && text !== 'N/A' ? `₹${text}` : '-',
        onFilter: (value, record) => record.purchase_value?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.purchase_value || null,
      },
      general_ledger_code: { 
        title: "General Ledger Code", 
        sorter: (a, b) => safeStringCompare(a.general_ledger_code, b.general_ledger_code),
        render: (text) => text && text !== 'N/A' ? text : '-',
        onFilter: (value, record) => record.general_ledger_code?.toString().toLowerCase().includes(value.toLowerCase()),
        filteredValue: filteredInfo.general_ledger_code || null,
      }
    };
    
    // Create columns for all possible fields first, then add any additional fields
    const columns = [];
    
    // Add Serial Number column
    columns.push({
      title: "S.No",
      key: "serial",
      width: 80,
      render: (text, record, index) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    });
    
    // Add all standard fields
    allPossibleFields.forEach(field => {
      if (fieldMappings[field]) {
        columns.push({
          title: fieldMappings[field].title,
          dataIndex: field,
          key: field,
          sorter: fieldMappings[field].sorter,
          render: fieldMappings[field].render,
          onFilter: fieldMappings[field].onFilter,
          filterDropdown: fieldMappings[field].filterDropdown,
          filteredValue: fieldMappings[field].filteredValue,
          ellipsis: true,
        });
      }
    });
    
    // Add any additional fields that aren't in the standard list
    availableFields
      .filter(field => !allPossibleFields.includes(field) && fieldMappings[field])
      .forEach(field => {
        columns.push({
          title: fieldMappings[field].title,
          dataIndex: field,
          key: field,
          sorter: fieldMappings[field].sorter,
          render: fieldMappings[field].render,
          onFilter: fieldMappings[field].onFilter,
          filteredValue: fieldMappings[field].filteredValue,
          ellipsis: true,
        });
      });
    
    
    return columns;
  };

  const columns = getDynamicColumns();


  // Handle row click to navigate to detailed asset history
  const handleRowClick = (record) => {
    console.log("Row clicked:", record);
    // Navigate to detailed asset history in same tab
    const assetId = record.asset_id;
    if (assetId) {
      const url = `/asset-history-detail/${assetId}`;
      window.location.href = url;
    } else {
      message.warning("Asset ID not found for this record");
    }
  };

  return (
    <div className="container-fluid p-1 position-relative" style={{ minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Back Navigation */}
        <BackNavigation />
        
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      {/* Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Asset History</h2>
          {/* <span className="text-muted">The core screen for managing asset depreciation, financial records, and accounting details.</span> */}
        </div>
        <div className="d-flex gap-2">
         
          <ExportButton
            data={dataSource}
            columns={null}
            filename="Financial_Management_Report"
            title="Financial Management Report"
            reportType="financial-management"
            filters={filteredInfo}
            sorter={sortedInfo}
            message={message}
            includeAllFields={true}
          />
          {/* <button
            className="btn btn-success px-4"
            onClick={handleCreate}
          >
            <PlusOutlined /> Create Financial Record
          </button> */}
        </div>
      </div>

      {/* Financial Records Table */}
    
          
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ['5', '10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            bordered
            size="middle"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: 'pointer' }
            })}
          />
      

    </div>
  );
};

export default AssetHistory;