import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";
import CustomBreadcrumb from '../../components/Breadcrumb';
import BackNavigation from '../../components/BackNavigation';
import {
  Card,
  Row,
  Col,
  Steps,
  Timeline,
  Descriptions,
  Tag,
  Spin,
  message,
  Divider,
  Typography,
  Space,
  Button,
  Badge,
  Avatar,
  Skeleton,
  Table
} from "antd";
import { 
  CalendarOutlined, 
  DollarOutlined, 
  SettingOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  TeamOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  BookOutlined,
  BankOutlined,
  GlobalOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from 'react-router-dom';
import { safeStringCompare } from '../../utils/tableUtils';

const { Title, Text } = Typography;
const { Step } = Steps;

const AssetHistoryDetail = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState(null);
  const [financialDetails, setFinancialDetails] = useState(null);
  const [assetTransfers, setAssetTransfers] = useState([]);
  const [assetAllocations, setAssetAllocations] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from { 
          opacity: 0; 
          transform: translateY(30px); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      @keyframes slideInLeft {
        from { 
          opacity: 0; 
          transform: translateX(-50px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }
      @keyframes slideInRight {
        from { 
          opacity: 0; 
          transform: translateX(50px); 
        }
        to { 
          opacity: 1; 
          transform: translateX(0); 
        }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .fade-in-up {
        animation: fadeInUp 0.6s ease-out;
      }
      .slide-in-left {
        animation: slideInLeft 0.6s ease-out;
      }
      .slide-in-right {
        animation: slideInRight 0.6s ease-out;
      }
      .pulse {
        animation: pulse 2s infinite;
      }
      .bounce {
        animation: bounce 1s infinite;
      }
      .card-hover {
        transition: all 0.3s ease;
      }
      .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      }
      .avatar-pulse {
        animation: pulse 2s infinite;
      }
      .loading-spin {
        animation: spin 1s linear infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    console.log('Asset ID from URL params:', assetId);
    
    if (assetId && assetId !== 'asset-history-detail') {
      fetchAssetDetails(assetId);
      fetchAssetAllocations(assetId);
    } else {
      console.error('Invalid asset ID:', assetId);
      message.error('Invalid asset ID provided');
    }
  }, [assetId]);

  const fetchAssetDetails = async (assetId) => {
    setLoading(true);
    try {
      console.log(`Fetching asset details for asset ID: ${assetId}`);
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

      // Normalize to array of assets
      let assets = [];
      if (Array.isArray(result)) {
        assets = result;
      } else if (result.assets && Array.isArray(result.assets)) {
        assets = result.assets;
      } else if (result.data && Array.isArray(result.data)) {
        assets = result.data;
      } else if (result.items && Array.isArray(result.items)) {
        assets = result.items;
      } else {
        console.error("Unexpected Assets API response structure:", result);
        assets = [];
      }

      // Find matching asset
      const asset = assets.find(a => String(a.asset_id) === String(assetId));
      if (!asset) {
        setAssetDetails(null);
        message.warning('Asset not found');
        return;
      }

      setAssetDetails(asset);
      console.log('Set asset details:', asset);

      // Optionally, if you have allocation/transfer endpoints, fetch them here.
      setAssetAllocations([]);
      setAssetTransfers([]);
    } catch (error) {
      console.error("Error fetching asset details:", error);
      message.error("Failed to load asset details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetAllocations = async (assetId) => {
    try {
      console.log(`Fetching asset allocations for asset ID: ${assetId}`);
      // Try querying with server-side filter first
      let response = await fetch(`http://202.53.92.35:5004/api/assets/allocate?asset_id=${encodeURIComponent(assetId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          "x-access-token": sessionStorage.getItem("token"),
        }
      });

      console.log('Allocations API Response status:', response.status);
      let result = await response.json();
      console.log('Allocations API Response:', result);

      let items = [];
      if (Array.isArray(result)) {
        items = result;
      } else if (result.allocations && Array.isArray(result.allocations)) {
        items = result.allocations;
      } else if (result.data && Array.isArray(result.data)) {
        items = result.data;
      } else if (result.records && Array.isArray(result.records)) {
        items = result.records;
      } else if (result.items && Array.isArray(result.items)) {
        items = result.items;
      } else {
        // If first attempt returns no recognizable array, try the unfiltered endpoint as a fallback
        console.warn("Unrecognized or empty shape from filtered endpoint, retrying unfiltered allocations...");
        response = await fetch(`http://202.53.92.35:5004/api/assets/allocate`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            "x-access-token": sessionStorage.getItem("token"),
          }
        });
        console.log('Allocations (fallback) API Response status:', response.status);
        result = await response.json();
        console.log('Allocations (fallback) API Response:', result);
        if (Array.isArray(result)) items = result;
        else if (result.allocations && Array.isArray(result.allocations)) items = result.allocations;
        else if (result.data && Array.isArray(result.data)) items = result.data;
        else if (result.records && Array.isArray(result.records)) items = result.records;
        else if (result.items && Array.isArray(result.items)) items = result.items;
        else items = [];
      }

      const filtered = items.filter(i => String(i.asset_id) === String(assetId));
      const withKeys = filtered.map((item, index) => ({
        ...item,
        key: item.id || index.toString(),
      }));

      // Last resort: if still empty, synthesize a single row from assetDetails so the table shows something
      if (withKeys.length === 0 && assetDetails) {
        const synthetic = [{
          key: `synthetic-${assetId}`,
          asset_id: assetId,
          assignment_date: assetDetails.installation_date || assetDetails.created_at,
          assignment_type: 'Registration',
          assigned_to: assetDetails.assigned_user,
          assigned_by: assetDetails.created_by || 'System',
          company: assetDetails.company || '-',
          location: assetDetails.location,
          product: assetDetails.asset_name,
          assignment_notes: 'Initial registration',
          condition_at_issue: '-',
          generated_asset_id: assetDetails.asset_code || '-',
          created_at: assetDetails.created_at,
        }];
        setAssetAllocations(synthetic);
        console.log('No allocation rows found; showing synthetic registration row.');
      } else {
        setAssetAllocations(withKeys);
        console.log(`Loaded ${withKeys.length} allocation records for asset ${assetId}`);
      }
    } catch (error) {
      console.error('Error fetching allocations:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Generate timeline steps dynamically based on available data
  const generateTimelineSteps = () => {
    const steps = [];
    
    // Step 1: Asset Registration
    steps.push({
      title: 'Asset Registration',
      description: `Registered on ${formatDate(assetDetails?.created_at)}`,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });

    // Step 2: Financial Setup
    steps.push({
      title: 'Financial Setup',
      description: financialDetails ? 'Financial parameters configured' : 'Financial parameters pending',
      icon: financialDetails ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined style={{ color: '#faad14' }} />,
    });

    // Add transfer steps if any
    if (assetTransfers && assetTransfers.length > 0) {
      assetTransfers.forEach((transfer, index) => {
        steps.push({
          title: `Transfer ${index + 1}`,
          description: `Transferred from ${transfer.current_location_or_user} to ${transfer.new_location_or_user} on ${formatDate(transfer.transfer_date)}`,
          icon: <CheckCircleOutlined style={{ color: '#1890ff' }} />,
        });
      });
    }

    // Add allocation steps if any
    if (assetAllocations && assetAllocations.length > 0) {
      assetAllocations.forEach((allocation, index) => {
        steps.push({
          title: `Allocation ${index + 1}`,
          description: `Allocated to ${assetDetails?.assigned_user || allocation.assigned_user || allocation.assigned_to || 'User'} on ${formatDate(allocation.assignment_date)}`,
          icon: <CheckCircleOutlined style={{ color: '#722ed1' }} />,
        });
      });
    }

    // Final step: Current Status
    steps.push({
      title: 'Current Status',
      description: `Asset is ${assetDetails?.status || 'Active'}`,
      icon: <CheckCircleOutlined style={{ color: '#13c2c2' }} />,
    });

    return steps;
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="loading-spin">
            <Spin size="large" />
          </div>
          <Text type="secondary" style={{ marginTop: '16px', fontSize: '16px' }}>
            Loading asset history...
          </Text>
        </div>
      </div>
    );
  }

  if (!assetDetails) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <Text type="danger">Asset details not found</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 fade-in-up" style={{ minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <BackNavigation />
        <CustomBreadcrumb />
      </div>

      {/* Header */}
      <Card className="mb-4 fade-in-up" style={{ borderRadius: "12px" }}>
        <div className="text-center">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div>
              <Avatar 
                size={80} 
                className="avatar-pulse"
                style={{ 
                  backgroundColor: "#1890ff",
                  color: "white",
                  fontSize: "24px"
                }}
                icon={<HistoryOutlined />}
              />
            </div>
            <div>
              <Title level={1} style={{ marginBottom: "8px", color: "#1890ff" }}>
                <HistoryOutlined className="me-3" />
                Asset History - {assetDetails.asset_id || 'N/A'}
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                Complete timeline and specifications for this asset
              </Text>
            </div>
          </Space>
        </div>
      </Card>

      {/* Asset History Table */}
      {/* <Card className="mb-4 fade-in-up" style={{ borderRadius: "12px" }}>
        <div className="mb-4">
          <Title level={4} style={{ color: "#1890ff", marginBottom: "16px" }}>
            <HistoryOutlined className="me-2" />
            Asset History Details
          </Title>
        </div>
        <Table
          columns={[
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
              title: "Assignment Date",
              dataIndex: "assignment_date",
              key: "assignment_date",
              width: 150,
              sorter: (a, b) => safeStringCompare(a.assignment_date || a.allocation_date || a.created_at, b.assignment_date || b.allocation_date || b.created_at),
              render: (text, record) => {
                const value = text || record.allocation_date || record.created_at;
                if (!value) return '-';
                try {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-GB');
                } catch (error) {
                  return value;
                }
              },
            },
            {
              title: "Assignment Type",
              dataIndex: "assignment_type",
              key: "assignment_type",
              width: 130,
              sorter: (a, b) => safeStringCompare(a.assignment_type, b.assignment_type),
              render: (text) => {
                if (!text) return '-';
                const color = text === 'Temporary' ? 'orange' : text === 'Project' ? 'blue' : 'green';
                return <Tag color={color}>{text}</Tag>;
              },
            },
            {
              title: "Assigned To",
              dataIndex: "assigned_to",
              key: "assigned_to",
              width: 120,
              sorter: (a, b) => safeStringCompare(a.assigned_to, b.assigned_to),
              render: (text) => text || '-',
            },
            {
              title: "Assigned By",
              dataIndex: "assigned_by",
              key: "assigned_by",
              width: 120,
              sorter: (a, b) => safeStringCompare(a.assigned_by, b.assigned_by),
              render: (text) => text || '-',
            },
            {
              title: "Company",
              dataIndex: "company",
              key: "company",
              width: 120,
              sorter: (a, b) => safeStringCompare(a.company, b.company),
              render: (text) => text || '-',
            },
            {
              title: "Location",
              dataIndex: "location",
              key: "location",
              width: 120,
              sorter: (a, b) => safeStringCompare(a.location, b.location),
              render: (text) => text || '-',
            },
            {
              title: "Product",
              dataIndex: "product",
              key: "product",
              width: 120,
              sorter: (a, b) => safeStringCompare(a.product, b.product),
              render: (text) => text || '-',
            },
            {
              title: "Assignment Notes",
              dataIndex: "assignment_notes",
              key: "assignment_notes",
              width: 150,
              sorter: (a, b) => safeStringCompare(a.assignment_notes, b.assignment_notes),
              render: (text) => text || '-',
            },
            {
              title: "Condition at Issue",
              dataIndex: "condition_at_issue",
              key: "condition_at_issue",
              width: 150,
              sorter: (a, b) => safeStringCompare(a.condition_at_issue, b.condition_at_issue),
              render: (text) => text || '-',
            },
            {
              title: "Generated Asset ID",
              dataIndex: "generated_asset_id",
              key: "generated_asset_id",
              width: 150,
              sorter: (a, b) => safeStringCompare(a.generated_asset_id, b.generated_asset_id),
              render: (text) => text || '-',
            },
            {
              title: "Created At",
              dataIndex: "created_at",
              key: "created_at",
              width: 150,
              sorter: (a, b) => safeStringCompare(a.created_at, b.created_at),
              render: (text) => {
                if (!text) return '-';
                try {
                  const date = new Date(text);
                  return date.toLocaleDateString('en-GB') + ' ' + date.toLocaleTimeString('en-GB');
                } catch (error) {
                  return text;
                }
              },
            },
          ]}
          dataSource={assetAllocations}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['5', '10', '20', '50'],
            onChange: (page, pageSize) => setPagination({ current: page, pageSize: pageSize || 10 }),
          }}
          bordered
          size="middle"
          scroll={{ x: 1500 }}
        />
      </Card> */}

      {/* Steps Timeline */}
      <Card className="mb-4 fade-in-up" style={{ borderRadius: "12px" }}>
        <div className="mb-4">
          <Title level={4} style={{ color: "#1890ff", marginBottom: "16px" }}>
            <ClockCircleOutlined className="me-2" />
            Asset Timeline
          </Title>
        </div>
        <Steps
          direction="vertical"
          size="small"
          current={generateTimelineSteps().length - 1}
          items={generateTimelineSteps()}
        />
      </Card>

      <Row gutter={[16, 16]}>
        {/* Step 1: Asset Registration Details */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <Avatar 
                  style={{ 
                    backgroundColor: "#1890ff",
                    color: "white"
                  }}
                  icon={<FileTextOutlined />}
                />
                <span style={{ fontWeight: "600", color: "#1890ff" }}>Step 1: Asset Registration Details</span>
              </Space>
            }
            className="h-100 card-hover slide-in-left"
            style={{ borderRadius: "12px" }}
            headStyle={{
              borderBottom: "2px solid #f0f0f0"
            }}
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Asset ID">
                <Tag color="blue">{assetDetails.asset_id || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Asset Name">
                {assetDetails.asset_name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {assetDetails.category || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Asset Type">
                {assetDetails.asset_type || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Serial Number">
                {assetDetails.serial_number || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Model Number">
                {assetDetails.model_number || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Manufacturer">
                {assetDetails.manufacturer || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Vendor">
                {assetDetails.vendor_name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Purchase Date">
                {formatDate(assetDetails.purchase_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Registration Date">
                {formatDate(assetDetails.created_at || assetDetails.registration_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={assetDetails.status === 'Active' ? 'green' : 'orange'}>
                  {assetDetails.status || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned User">
                <Tag color="blue" icon={<UserOutlined />}>
                  {assetDetails.assigned_user || 'Not Assigned'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Step 2: Financial Details */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <Avatar 
                  style={{ 
                    backgroundColor: "#52c41a",
                    color: "white"
                  }}
                  icon={<DollarOutlined />}
                />
                <span style={{ fontWeight: "600", color: "#52c41a" }}>Step 2: Financial & Depreciation Details</span>
              </Space>
            }
            className="h-100 card-hover slide-in-right"
            style={{ borderRadius: "12px" }}
            headStyle={{
              borderBottom: "2px solid #f0f0f0"
            }}
          >
            {financialDetails ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Purchase Value">
                  <Text strong>{formatCurrency(financialDetails.purchase_value)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Salvage Value">
                  {formatCurrency(financialDetails.salvage_value)}
                </Descriptions.Item>
                <Descriptions.Item label="Depreciation Method">
                  <Tag color="purple">{financialDetails.depreciation_method || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Useful Life">
                  {financialDetails.useful_life_years ? `${financialDetails.useful_life_years} years` : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Monthly Depreciation">
                  {formatCurrency(financialDetails.monthly_depreciation)}
                </Descriptions.Item>
                <Descriptions.Item label="Accumulated Depreciation">
                  <Text type="warning">{formatCurrency(financialDetails.accumulated_depreciation)}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="General Ledger Code">
                  <Tag color="cyan">{financialDetails.general_ledger_code || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Current Book Value">
                  <Text strong type="success">
                    {formatCurrency(
                      financialDetails.purchase_value - financialDetails.accumulated_depreciation
                    )}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <div className="text-center py-4">
                <Text type="secondary">No financial details available</Text>
                <br />
                <Button type="primary" size="small" className="mt-2">
                  Add Financial Details
                </Button>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Asset Specifications */}
      <Card className="mt-4 fade-in-up card-hover" style={{ borderRadius: "12px" }}>
        <div className="mb-4">
          <Title level={4} style={{ color: "#722ed1", marginBottom: "16px" }}>
            <SettingOutlined className="me-2" />
            Asset Specifications & Details
          </Title>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Descriptions title="Physical Specifications" column={1} size="small">
              <Descriptions.Item label="Dimensions">
                {assetDetails.dimensions || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Weight">
                {assetDetails.weight || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Color">
                {assetDetails.color || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Material">
                {assetDetails.material || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={8}>
            <Descriptions title="Technical Specifications" column={1} size="small">
              <Descriptions.Item label="Power Rating">
                {assetDetails.power_rating || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Capacity">
                {assetDetails.capacity || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Operating System">
                {assetDetails.operating_system || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Processor">
                {assetDetails.processor || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={8}>
            <Descriptions title="Purchase Information" column={1} size="small">
              <Descriptions.Item label="Order Number">
                {assetDetails.order_number || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Supplier/Vendor">
                {assetDetails.supplier_vendor || assetDetails.vendor_name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Original Purchase Price">
                {formatCurrency(assetDetails.original_purchase_price)}
              </Descriptions.Item>
              <Descriptions.Item label="Current Book Value">
                <Text strong type="success">
                  {formatCurrency(assetDetails.current_book_value)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Location & Assignment Details */}
      <Card className="mt-4 fade-in-up card-hover" style={{ borderRadius: "12px" }}>
        <div className="mb-4">
          <Title level={4} style={{ color: "#fa8c16", marginBottom: "16px" }}>
            <EnvironmentOutlined className="me-2" />
            Location & Assignment Details
          </Title>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Descriptions title="Location" column={1} size="small">
              <Descriptions.Item label="Location Type">
                {assetDetails.location_type || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Location Name">
                {assetDetails.location_name || assetDetails.location || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Building/Facility">
                {assetDetails.building_facility || assetDetails.building || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Floor/Room">
                {assetDetails.floor_room_number || assetDetails.floor || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="GPS Coordinates">
                {assetDetails.gps_coordinates || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={8}>
            <Descriptions title="Assignment" column={1} size="small">
              <Descriptions.Item label="Assigned To">
                {assetDetails.assigned_user || assetDetails.assigned_to || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {assetDetails.owning_department || assetDetails.department}
              </Descriptions.Item>
              <Descriptions.Item label="Cost Center">
                {assetDetails.cost_center || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Installation Date">
                {formatDate(assetDetails.installation_date)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={8}>
            <Descriptions title="Warranty & AMC" column={1} size="small">
              <Descriptions.Item label="Warranty Start">
                {formatDate(assetDetails.warranty_start_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Warranty End">
                {formatDate(assetDetails.warranty_expiry || assetDetails.warranty_end_date)}
              </Descriptions.Item>
              <Descriptions.Item label="Warranty Period">
                {assetDetails.warranty_period_months ? `${assetDetails.warranty_period_months} months` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="AMC Expiry">
                {formatDate(assetDetails.amc_expiry || assetDetails.amc_expiry_date)}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Transfer History */}
      {assetTransfers && assetTransfers.length > 0 && (
        <Card className="mt-4 fade-in-up card-hover" style={{ borderRadius: "12px" }}>
          <div className="mb-4">
            <Title level={4} style={{ color: "#eb2f96", marginBottom: "16px" }}>
              <SwapOutlined className="me-2" />
              Transfer History
            </Title>
          </div>
          <Row gutter={[16, 16]}>
            {assetTransfers.map((transfer, index) => (
              <Col xs={24} key={transfer.id || index}>
                <Card 
                  size="small" 
                  className="mb-3 card-hover"
                  style={{ borderRadius: "8px", border: "1px solid #f0f0f0" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge 
                      count={index + 1} 
                      style={{ 
                        backgroundColor: "#eb2f96",
                        color: "white",
                        fontWeight: "bold"
                      }}
                    />
                    <Tag color="magenta" style={{ fontWeight: "bold" }}>
                      Transfer #{transfer.transfer_id}
                    </Tag>
                  </div>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Transfer Date">
                      <Text strong>{formatDate(transfer.transfer_date)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Approver">
                      <Text strong>{transfer.approver_name || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="From">
                      <Text strong type="warning">{transfer.current_location_or_user}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="To">
                      <Text strong type="success">{transfer.new_location_or_user}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Justification" span={2}>
                      <Text>{transfer.justification || 'N/A'}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Allocation History */}
      {assetAllocations && assetAllocations.length > 0 && (
        <Card className="mt-4 fade-in-up card-hover" style={{ borderRadius: "12px" }}>
          <div className="mb-4">
            <Title level={4} style={{ color: "#13c2c2", marginBottom: "16px" }}>
              <TeamOutlined className="me-2" />
              Allocation History
            </Title>
          </div>
          <Row gutter={[16, 16]}>
            {assetAllocations.map((allocation, index) => (
              <Col xs={24} key={allocation.id || index}>
                <Card 
                  size="small" 
                  className="mb-3 card-hover"
                  style={{ borderRadius: "8px", border: "1px solid #f0f0f0" }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Badge 
                      count={index + 1} 
                      style={{ 
                        backgroundColor: "#13c2c2",
                        color: "white",
                        fontWeight: "bold"
                      }}
                    />
                    <Tag color="cyan" style={{ fontWeight: "bold" }}>
                      {allocation.status || 'Active'}
                    </Tag>
                  </div>
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="Allocation Date">
                      <Text strong>{formatDate(allocation.allocation_date)}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Department">
                      <Text strong>{allocation.department || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Assigned To">
                      <Text strong type="success">{assetDetails?.assigned_user || allocation.assigned_user || allocation.assigned_to || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Justification" span={2}>
                      <Text>{allocation.justification || 'N/A'}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Additional Information */}
      <Card className="mt-4 fade-in-up card-hover" style={{ borderRadius: "12px" }}>
        <div className="mb-4">
          <Title level={4} style={{ color: "#fa541c", marginBottom: "16px" }}>
            <InfoCircleOutlined className="me-2" />
            Additional Information
          </Title>
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Descriptions title="Documentation" column={1} size="small">
              <Descriptions.Item label="Invoice/Receipt Files">
                {assetDetails.invoice_receipt_files ? 'Available' : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ownership Proof">
                {assetDetails.ownership_proof_files ? 'Available' : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Insurance Policy">
                {assetDetails.insurance_policy_files ? 'Available' : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Lease Agreements">
                {assetDetails.lease_agreements_files ? 'Available' : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} md={12}>
            <Descriptions title="System Information" column={1} size="small">
              <Descriptions.Item label="Created At">
                {formatDate(assetDetails.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {formatDate(assetDetails.updated_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {assetDetails.created_by || 'System'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Modified By">
                {assetDetails.updated_by || 'System'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AssetHistoryDetail;
