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
import { useNavigate } from 'react-router-dom';


const AssetHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [dataSource, setDataSource] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  // Fetch assets data from API
  const fetchAssets = async () => {
    setLoading(true);
    try {
      console.log('Fetching assets from API...');
      const response = await fetch(`http://202.53.92.35:5004/api/assets`, {
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
      console.log('Assets API Response:', result);
    
      // Handle different response structures
      let data = [];
      if (Array.isArray(result)) {
        data = result;
        console.log("Using direct array from API");
      } else if (result.assets && Array.isArray(result.assets)) {
        data = result.assets;
        console.log("Using result.assets from API");
      } else if (result.data && Array.isArray(result.data)) {
        data = result.data;
        console.log("Using result.data from API");
      } else if (result.records && Array.isArray(result.records)) {
        data = result.records;
        console.log("Using result.records from API");
      } else if (result.items && Array.isArray(result.items)) {
        data = result.items;
        console.log("Using result.items from API");
      } else {
        console.error("Unexpected API response structure:", result);
        data = [];
      }
    
      // Add key property for each item (required by Ant Design Table)
      const dataWithKeys = data.map((item, index) => ({
        ...item,
        key: item.asset_id || item.id || index.toString(),
      }));
      
      setDataSource(dataWithKeys);
      console.log(`Assets loaded successfully (${dataWithKeys.length} items)`);
    } catch (error) {
      console.error("Error fetching assets:", error);
      message.error(`Failed to load assets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Handle table change for filters and sorting
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  // Handle asset ID click navigation
  const handleAssetIdClick = (assetId) => {
    navigate(`/asset-history-detail/${assetId}`);
  };

  // Table columns based on assets API response (hide asset_id, show asset_code)
  const columns = [
    {
      title: "S.No",
      key: "serial",
      width: 80,
      render: (text, record, index) => {
        const current = pagination.current || 1;
        const pageSize = pagination.pageSize || 10;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Asset Code",
      dataIndex: "asset_code",
      key: "asset_code",
      width: 130,
      sorter: (a, b) => safeStringCompare(a.asset_code, b.asset_code),
      render: (text, record) => {
        if (!text) return '-';
        const assetId = record.asset_id;
        return (
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (assetId) handleAssetIdClick(assetId);
            }}
            style={{ color: '#1890ff', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: "Asset Name",
      dataIndex: "asset_name",
      key: "asset_name",
      width: 180,
      sorter: (a, b) => safeStringCompare(a.asset_name, b.asset_name),
      render: (text) => text || '-',
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      sorter: (a, b) => safeStringCompare(a.status, b.status),
      render: (text) => text || '-',
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 140,
      sorter: (a, b) => safeStringCompare(a.category, b.category),
      render: (text) => text || '-',
    },
    {
      title: "Brand",
      dataIndex: "manufacturer_brand",
      key: "manufacturer_brand",
      width: 130,
      sorter: (a, b) => safeStringCompare(a.manufacturer_brand, b.manufacturer_brand),
      render: (text) => text || '-',
    },
    {
      title: "Model",
      dataIndex: "model_number",
      key: "model_number",
      width: 140,
      sorter: (a, b) => safeStringCompare(a.model_number, b.model_number),
      render: (text) => text || '-',
    },
    {
      title: "Serial Number",
      dataIndex: "serial_number",
      key: "serial_number",
      width: 160,
      sorter: (a, b) => safeStringCompare(a.serial_number, b.serial_number),
      render: (text) => text || '-',
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: 140,
      sorter: (a, b) => safeStringCompare(a.location, b.location),
      render: (text) => text || '-',
    },
    {
      title: "Assigned User",
      dataIndex: "assigned_user",
      key: "assigned_user",
      width: 140,
      sorter: (a, b) => safeStringCompare(a.assigned_user, b.assigned_user),
      render: (text) => text || '-',
    },
    {
      title: "Department",
      dataIndex: "owning_department",
      key: "owning_department",
      width: 160,
      sorter: (a, b) => safeStringCompare(a.owning_department, b.owning_department),
      render: (text) => text || '-',
    },
    {
      title: "Purchase Date",
      dataIndex: "purchase_date",
      key: "purchase_date",
      width: 160,
      sorter: (a, b) => safeStringCompare(a.purchase_date, b.purchase_date),
      render: (text) => {
        if (!text) return '-';
        try { const d = new Date(text); return d.toLocaleDateString('en-GB'); } catch { return text; }
      },
    },
    {
      title: "Warranty Expiry",
      dataIndex: "warranty_expiry",
      key: "warranty_expiry",
      width: 160,
      sorter: (a, b) => safeStringCompare(a.warranty_expiry, b.warranty_expiry),
      render: (text) => {
        if (!text) return '-';
        try { const d = new Date(text); return d.toLocaleDateString('en-GB'); } catch { return text; }
      },
    },
    {
      title: "AMC Expiry",
      dataIndex: "amc_expiry",
      key: "amc_expiry",
      width: 160,
      sorter: (a, b) => safeStringCompare(a.amc_expiry, b.amc_expiry),
      render: (text) => {
        if (!text) return '-';
        try { const d = new Date(text); return d.toLocaleDateString('en-GB'); } catch { return text; }
      },
    },
    {
      title: "Asset Type",
      dataIndex: "asset_type",
      key: "asset_type",
      width: 140,
      sorter: (a, b) => safeStringCompare(a.asset_type, b.asset_type),
      render: (text) => text || '-',
    },
    {
      title: "Depreciation",
      dataIndex: "depreciation_method",
      key: "depreciation_method",
      width: 180,
      sorter: (a, b) => safeStringCompare(a.depreciation_method, b.depreciation_method),
      render: (text) => text || '-',
    },
    {
      title: "Current Book Value",
      dataIndex: "current_book_value",
      key: "current_book_value",
      width: 170,
      sorter: (a, b) => safeStringCompare(a.current_book_value, b.current_book_value),
      render: (text) => text || '-',
    },
    {
      title: "Original Price",
      dataIndex: "original_purchase_price",
      key: "original_purchase_price",
      width: 160,
      sorter: (a, b) => safeStringCompare(a.original_purchase_price, b.original_purchase_price),
      render: (text) => text || '-',
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 200,
      sorter: (a, b) => safeStringCompare(a.created_at, b.created_at),
      render: (text) => {
        if (!text) return '-';
        try { const d = new Date(text); return d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString('en-GB'); } catch { return text; }
      },
    },
    {
      title: "Allocated",
      dataIndex: "allocated",
      key: "allocated",
      width: 120,
      sorter: (a, b) => safeStringCompare(String(a.allocated), String(b.allocated)),
      render: (text) => (text || text === 0) ? String(text) : '-',
    },
  ];

  return (
    <div className="container-fluid p-1">
      <CustomBreadcrumb />
        <BackNavigation />
      
      <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
        <div>
          <h2 className="mb-1">Assets</h2>
        </div>
        <div className="d-flex gap-2">
          <ExportButton
            data={dataSource}
                columns={columns}
                filename="Assets_List"
                title="Assets List"
                reportType="assets-list"
                filters={{}}
                sorter={{}}
            message={message}
            includeAllFields={true}
          />
        </div>
      </div>
      
      <div className="card af-card mt-2">
        <div className="card-body">
          
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
            scroll={{ x: 2200 }}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetHistory;