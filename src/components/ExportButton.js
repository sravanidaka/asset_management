import React from 'react';
import { Button, Dropdown } from 'antd';
import { DownloadOutlined, DownOutlined } from '@ant-design/icons';
import { handleExport, formatDataForExport } from '../utils/exportUtils';

// Generate columns from data when columns is not provided
const generateColumnsFromData = (data, includeAllFields = false) => {
  if (!data || data.length === 0) return [];
  
  // Get all unique keys from all data objects
  const allKeys = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'key') { // Exclude the 'key' field added by Ant Design
        allKeys.add(key);
      }
    });
  });
  
  // If includeAllFields is true, also include all possible form fields
  if (includeAllFields) {
    // Define all possible form fields for different components
    const allPossibleFields = [
      // Register form fields
      'asset_id', 'asset_name', 'category', 'manufacturer', 'model', 'serial_number',
      'location', 'assigned_user', 'allocated_to', 'department', 'building_facility',
      'floor_room', 'gps_coordinates', 'status', 'purchase_date', 'installation_date',
      'warranty_start_date', 'warranty_period', 'warranty_expiry', 'amc_expiry_date',
      'order_number', 'supplier_details', 'original_purchase_price', 'current_value',
      'vendor', 'type', 'depreciation_method', 'invoice_receipt', 'ownership_proof',
      'insurance_policy', 'lease_agreements',
      
      // Disposal form fields
      'asset_code', 'disposal_type', 'disposal_date', 'approver_name', 
      'disposal_reason', 'sale_price', 'book_value', 'buyer_name',
      
      // Procurement form fields
      'procurement_id', 'vendor_name', 'procurement_date', 'order_number',
      'delivery_date', 'warranty_period', 'amc_period', 'procurement_type',
      'quantity', 'unit_price', 'total_amount', 'payment_terms',
      
      // Allocation form fields
      'allocation_id', 'asset_id', 'allocated_to', 'allocation_date',
      'department', 'location', 'allocation_type', 'return_date',
      'allocation_status', 'notes',
      
      // Financial form fields
      'financial_id', 'asset_id', 'current_value', 'depreciation_amount',
      'depreciation_method', 'financial_status', 'valuation_date',
      'book_value', 'market_value',
      
      // Transfer form fields
      'transfer_id', 'asset_id', 'from_location', 'to_location',
      'transfer_date', 'transfer_type', 'transfer_reason', 'authorized_by',
      'transfer_status', 'notes'
    ];
    
    // Add all possible fields to ensure they're included even if empty
    allPossibleFields.forEach(field => {
      allKeys.add(field);
    });
  }
  
  // Convert to column format
  return Array.from(allKeys).map(key => ({
    title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Convert snake_case to Title Case
    dataIndex: key,
    key: key
  }));
};

const ExportButton = ({ 
  data, 
  columns, 
  filename, 
  title, 
  reportType, 
  filters = {}, 
  sorter = {},
  message,
  includeAllFields = false
}) => {
  const handleExportClick = (exportType) => {
    try {
      // If columns is null, use all fields from the data
      const exportColumns = columns || generateColumnsFromData(data, includeAllFields);
      const formattedData = formatDataForExport(data, exportColumns);
      const result = handleExport(
        exportType,
        formattedData,
        exportColumns,
        filename,
        title,
        reportType,
        filters,
        sorter
      );

      if (result.success) {
        const recordCount = result.recordCount || formattedData.length;
        message.success(`${exportType.toUpperCase()} export completed successfully. ${recordCount} records exported.`);
      } else {
        message.error(`Failed to export ${exportType.toUpperCase()}: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Export failed. Please try again.');
    }
  };

  const exportMenuItems = [
    {
      key: 'excel',
      label: 'Export to Excel',
      icon: <DownloadOutlined />,
      onClick: () => handleExportClick('excel')
    },
    {
      key: 'pdf',
      label: 'Export to PDF',
      icon: <DownloadOutlined />,
      onClick: () => handleExportClick('pdf')
    }
  ];

  return (
    <Dropdown
      menu={{ items: exportMenuItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button icon={<DownloadOutlined />}>
        Export <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default ExportButton;

