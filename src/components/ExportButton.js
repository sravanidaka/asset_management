import React from 'react';
import { Button, Dropdown } from 'antd';
import { DownloadOutlined, DownOutlined } from '@ant-design/icons';
import { handleExport, formatDataForExport } from '../utils/exportUtils';

// Generate columns from data when columns is not provided
const generateColumnsFromData = (data, includeAllFields = false, reportType = '') => {
  if (!data || data.length === 0) return [];
  
  // If includeAllFields is true, use page-specific field lists
  if (includeAllFields) {
    let allPossibleFields = [];
    
    // Define page-specific field lists based on reportType
    switch (reportType) {
      case 'asset-register':
        allPossibleFields = [
          // Basic Asset Information
          'asset_id', 'asset_name', 'asset_tag', 'category', 'status', 'asset_type',
          
          // Technical Specifications
          'manufacturer_brand', 'manufacturer', 'model_number', 'model', 'serial_number', 'serial',
          'byod', 'requestable',
          
          // Location & Assignment
          'location', 'assigned_user', 'owning_department', 'building_facility', 
          'floor_room_number', 'floor_room', 'gps_coordinates',
          
          // Financial Information
          'original_purchase_price', 'purchase_cost', 'current_book_value', 'current_value',
          'depreciation', 'depreciation_method', 'fully_depreciated', 'supplier_vendor', 'supplier',
          
          // Dates & Warranty
          'purchase_date', 'installation_date', 'warranty_expiry', 'warranty_period_months',
          'amc_expiry', 'eol_date', 'eol_rate', 'order_number',
          
          // Activity & Usage
          'checkouts', 'checkins', 'requests',
          
          // Additional Information
          'notes', 'allocated',
          
          // File attachments
          'invoice_receipt_files', 'ownership_proof_files', 'insurance_policy_files', 'lease_agreement_files',
          
          // System fields
          'id', 'created_at', 'updated_at'
        ];
        break;
        
      case 'procurement-management':
        allPossibleFields = [
          'indent_number', 'requested_by', 'requested_date', 'category', 'asset_id', 
          'asset_name', 'quantity', 'po_number', 'supplier_vendor', 'received_date',
          'invoice_details', 'justification', 'status', 'company', 'location', 'product'
        ];
        break;
        
      case 'allocation-management':
        allPossibleFields = [
          'asset_id', 'assignment_type', 'transfer', 'assigned_to', 'assignment_date', 
          'return_date', 'assigned_by', 'assignment_notes', 'condition_at_issue',
          'company', 'location', 'product'
        ];
        break;
        
      case 'transfer-management':
        allPossibleFields = [
          'transfer_id', 'asset_id', 'current_location_or_user', 'new_location_or_user', 
          'transfer_date', 'justification', 'approver_name'
        ];
        break;
        
      case 'financial-management':
        allPossibleFields = [
          'asset_id', 'depreciation_method', 'purchase_value', 'salvage_value', 
          'useful_life_years', 'monthly_depreciation', 'accumulated_depreciation', 'general_ledger_code'
        ];
        break;
        
      case 'disposal-management':
        allPossibleFields = [
          'asset_code', 'disposal_type', 'disposal_date', 'approver_name', 
          'disposal_reason', 'sale_price', 'book_value', 'buyer_name'
        ];
        break;
        
      default:
        // Fallback to using fields present in data
        const allKeys = new Set();
        data.forEach(item => {
          Object.keys(item).forEach(key => {
            if (key !== 'key') {
              allKeys.add(key);
            }
          });
        });
        allPossibleFields = Array.from(allKeys);
    }
    
    console.log('generateColumnsFromData: includeAllFields =', includeAllFields);
    console.log('generateColumnsFromData: reportType =', reportType);
    console.log('generateColumnsFromData: Using page-specific field list with', allPossibleFields.length, 'fields');
    console.log('generateColumnsFromData: Fields =', allPossibleFields);
    
    // Convert to column format using the page-specific field list
    return allPossibleFields.map(key => ({
      title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Convert snake_case to Title Case
      dataIndex: key,
      key: key
    }));
  }
  
  // If includeAllFields is false, use only fields present in data
  const allKeys = new Set();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'key') { // Exclude the 'key' field added by Ant Design
        allKeys.add(key);
      }
    });
  });
  
  console.log('generateColumnsFromData: includeAllFields =', includeAllFields);
  console.log('generateColumnsFromData: Using data fields only =', Array.from(allKeys));
  
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
      console.log('=== EXPORT DEBUG START ===');
      console.log('ExportButton: Starting export with includeAllFields =', includeAllFields);
      console.log('ExportButton: Original data length =', data.length);
      console.log('ExportButton: Original data sample =', data[0]);
      console.log('ExportButton: Original data keys =', Object.keys(data[0] || {}));
      console.log('ExportButton: Original columns =', columns);
      console.log('ExportButton: columns is null?', columns === null);
      
      // If columns is null, use all fields from the data
      const exportColumns = columns || generateColumnsFromData(data, includeAllFields, reportType);
      console.log('ExportButton: Generated exportColumns length =', exportColumns.length);
      console.log('ExportButton: Generated exportColumns =', exportColumns.map(col => col.dataIndex || col.key));
      
      const formattedData = formatDataForExport(data, exportColumns);
      console.log('ExportButton: Formatted data length =', formattedData.length);
      console.log('ExportButton: Formatted data sample =', formattedData[0]);
      console.log('ExportButton: Formatted data keys =', Object.keys(formattedData[0] || {}));
      console.log('ExportButton: Total fields in export =', Object.keys(formattedData[0] || {}).length);
      console.log('=== EXPORT DEBUG END ===');
      
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

