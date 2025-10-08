import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaDownload, FaPlus, FaCheck, FaPause, FaClock, FaUser, FaMapPin, FaArchive, FaSave, FaCheckCircle } from 'react-icons/fa';
import { Table, Input, Button, Card, Space, Badge, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import '../App.css';
const AllDepartments = ({ onNavigate }) => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    costCenter: '',
    location: '',
    manager: '',
    status: 'Active',
    notes: ''
  });

  // Sample departments data
  const [departments] = useState([
    {
      id: 1,
      name: 'IT',
      location: 'HQ - 3rd Floor',
      costCenter: 'CC-1001',
      assets: 128,
      status: 'Active',
      code: 'DEPT-IT',
      manager: 'Courtney Henry',
      notes: 'Handles infrastructure, endpoints, and SaaS.',
      locations: 12,
      users: 58
    },
    {
      id: 2,
      name: 'Finance',
      location: 'HQ - 2nd Floor',
      costCenter: 'CC-1002',
      assets: 64,
      status: 'Active',
      code: 'DEPT-FIN',
      manager: 'John Smith',
      notes: 'Financial operations and accounting.',
      locations: 8,
      users: 32
    },
    {
      id: 3,
      name: 'Logistics',
      location: 'Warehouse A',
      costCenter: 'CC-2001',
      assets: 212,
      status: 'On Hold',
      code: 'DEPT-LOG',
      manager: 'Sarah Wilson',
      notes: 'Supply chain and warehouse management.',
      locations: 15,
      users: 45
    },
    {
      id: 4,
      name: 'HR',
      location: 'HQ - 1st Floor',
      costCenter: 'CC-1003',
      assets: 43,
      status: 'Active',
      code: 'DEPT-HR',
      manager: 'Mike Johnson',
      notes: 'Human resources and employee relations.',
      locations: 6,
      users: 28
    },
    {
      id: 5,
      name: 'Field Ops',
      location: 'Regional',
      costCenter: 'CC-3005',
      assets: 356,
      status: 'Pending',
      code: 'DEPT-FLD',
      manager: 'Lisa Brown',
      notes: 'Field operations and regional management.',
      locations: 25,
      users: 89
    }
  ]);

  // Set default selected department
  useEffect(() => {
    if (departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0]);
      setFormData({
        name: departments[0].name,
        code: departments[0].code,
        costCenter: departments[0].costCenter,
        location: departments[0].location,
        manager: departments[0].manager,
        status: departments[0].status,
        notes: departments[0].notes
      });
    }
  }, [departments, selectedDepartment]);

  // Filter departments based on search
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
    dept.location.toLowerCase().includes(searchText.toLowerCase()) ||
    dept.costCenter.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle department selection
  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      costCenter: department.costCenter,
      location: department.location,
      manager: department.manager,
      status: department.status,
      notes: department.notes
    });
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save changes
  const handleSaveChanges = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      message.success('Changes saved successfully!');
      setLoading(false);
    }, 1000);
  };

  // Handle continue to review
  const handleContinueReview = () => {
    message.success('Proceeding to review...');
  };

    // Handle back to settings navigation
    const handleBackToSettings = () => {
        if (onNavigate) {
          onNavigate('settings');
        }
    };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <FaCheck className="text-success" />;
      case 'On Hold':
        return <FaPause className="text-warning" />;
      case 'Pending':
        return <FaClock className="text-info" />;
      default:
        return <FaCheck className="text-success" />;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'On Hold':
        return 'warning';
      case 'Pending':
        return 'processing';
      default:
        return 'success';
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div 
          className={`cursor-pointer ${selectedDepartment?.id === record.id ? 'fw-bold text-primary' : ''}`}
          onClick={() => handleDepartmentSelect(record)}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      sorter: (a, b) => a.location.localeCompare(b.location),
    },
    {
      title: 'Cost Center',
      dataIndex: 'costCenter',
      key: 'costCenter',
      sorter: (a, b) => a.costCenter.localeCompare(b.costCenter),
    },
    {
      title: 'Assets',
      dataIndex: 'assets',
      key: 'assets',
      sorter: (a, b) => a.assets - b.assets,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status) => (
        <div className="d-flex align-items-center gap-2">
          {getStatusIcon(status)}
          <Badge status={getStatusBadgeColor(status)} text={status} />
        </div>
      ),
    },
  ];

  return (
    <div className="container-fluid p-1">
      {/* Page Title */}
      <h2 className="mb-4">All Departments</h2>

      {/* Search and Action Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <Input
            placeholder="Search departments..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400, borderRadius: '25px' }}
            size="large"
          />
        </div>
        <div className="d-flex gap-2">
          <Button 
            type="primary" 
            icon={<FaDownload />}
            size="large"
            style={{ borderRadius: '8px' }}
          >
            Export
          </Button>
          <Button 
            type="primary" 
            icon={<FaPlus />}
            size="large"
            style={{ borderRadius: '8px' }}
          >
            Add Department
          </Button>
        </div>
      </div>

      <div className="row">
        {/* Left Column - Departments Table */}
        <div className="col-md-12">
          <Card 
            title="Departments" 
            className="mb-4"
            style={{ borderRadius: '12px' }}
            headStyle={{ 
              backgroundColor: '#f8f9fa', 
              borderBottom: '1px solid #e9ecef',
              borderRadius: '12px 12px 0 0'
            }}
          >
            <Table
              columns={columns}
              dataSource={filteredDepartments}
              pagination={false}
              rowKey="id"
              className="departments-table"
              rowClassName={(record) => 
                selectedDepartment?.id === record.id ? 'table-row-selected' : ''
              }
            />
          </Card>
        </div>

        {/* Right Column - Department Details */}
        <div className="col-md-12">
          {/* Department Details Card */}
          <Card 
            title="Department Details" 
            className="mb-4"
            style={{ borderRadius: '12px' }}
            headStyle={{ 
              backgroundColor: '#f8f9fa', 
              borderBottom: '1px solid #e9ecef',
              borderRadius: '12px 12px 0 0'
            }}
          >
            {selectedDepartment && (
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-medium">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.code}
                    onChange={(e) => handleFieldChange('code', e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Cost Center</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.costCenter}
                    onChange={(e) => handleFieldChange('costCenter', e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.location}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Manager</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.manager}
                    onChange={(e) => handleFieldChange('manager', e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Notes</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Quick Actions Card */}
          <Card 
            title="Quick Actions" 
            className="mb-4"
            style={{ borderRadius: '12px' }}
            headStyle={{ 
              backgroundColor: '#f8f9fa', 
              borderBottom: '1px solid #e9ecef',
              borderRadius: '12px 12px 0 0'
            }}
          >
            <div className="d-grid gap-2">
              <Button 
                className="d-flex align-items-center justify-content-start gap-2"
                style={{ borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', color: '#495057' }}
              >
                <FaUser className="text-muted" />
                Assign Manager
              </Button>
              <Button 
                className="d-flex align-items-center justify-content-start gap-2"
                style={{ borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', color: '#495057' }}
              >
                <FaMapPin className="text-muted" />
                Set Location
              </Button>
              <Button 
                className="d-flex align-items-center justify-content-start gap-2"
                style={{ borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', color: '#495057' }}
              >
                <FaArchive className="text-muted" />
                Archive
              </Button>
            </div>
          </Card>

          {/* Linked Lists Card */}
          <Card 
            title="Linked Lists" 
            style={{ borderRadius: '12px' }}
            headStyle={{ 
              backgroundColor: '#f8f9fa', 
              borderBottom: '1px solid #e9ecef',
              borderRadius: '12px 12px 0 0'
            }}
          >
            {selectedDepartment && (
              <div className="row text-center">
                <div className="col-4">
                  <div className="fw-bold fs-4 text-primary">{selectedDepartment.locations}</div>
                  <div className="text-muted small">Locations</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold fs-4 text-primary">{selectedDepartment.users}</div>
                  <div className="text-muted small">Users</div>
                </div>
                <div className="col-4">
                  <div className="fw-bold fs-4 text-primary">{selectedDepartment.assets}</div>
                  <div className="text-muted small">Assets</div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="d-flex justify-content-end gap-2">
      
      <Button 
              type="link" 
              icon={<FaArrowLeft />}
              className="text-white"
              onClick={handleBackToSettings}
              style={{ textDecoration: 'none' }}
             >
             Back to Master Data
           </Button>
          <div className="d-flex gap-2">
            <Button 
              type="primary" 
              icon={<FaSave />}
              onClick={handleSaveChanges}
              loading={loading}
              style={{ borderRadius: '8px' }}
            >
              Save Changes
            </Button>
            <Button 
              type="primary" 
              icon={<FaCheckCircle />}
              onClick={handleContinueReview}
              style={{ borderRadius: '8px' }}
            >
              Continue to Review
            </Button>
          </div>
        </div>
      </div>
  
  );
};


export default AllDepartments;
