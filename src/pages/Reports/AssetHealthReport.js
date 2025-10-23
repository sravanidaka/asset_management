import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { FaDownload, FaFilter, FaSearch, FaCalendarAlt, FaChartLine, FaHeartbeat, FaArrowLeft, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const AssetHealthReport = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        dateRange: '',
        assetCategory: '',
        healthStatus: '',
        location: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateReport = () => {
        console.log('Generating Asset Health Report with filters:', filters);
    };

    const exportReport = () => {
        console.log('Exporting Asset Health Report');
    };

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Sample data for the table
    const tableData = [
        {
            id: 1,
            assetId: 'AST-001',
            assetName: 'Laptop Dell',
            category: 'IT Equipment',
            location: 'Office',
            healthScore: 85,
            healthStatus: 'Good',
            lastInspection: '2024-01-15',
            nextInspection: '2024-04-15'
        },
        {
            id: 2,
            assetId: 'AST-002',
            assetName: 'Office Chair',
            category: 'Furniture',
            location: 'Office',
            healthScore: 92,
            healthStatus: 'Excellent',
            lastInspection: '2024-01-10',
            nextInspection: '2024-04-10'
        }
    ];

    // Filter and sort table data
    const filteredData = tableData
        .filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
            const matchesStatus = selectedStatus === '' || item.healthStatus === selectedStatus;

            return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
            if (!sortField) return 0;

            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle numeric values
            if (sortField === 'healthScore') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div className="container-fluid p-1">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/reports')}
                >
                    <FaArrowLeft className="me-2" />
                    Back to Reports
                </button>
                <CustomBreadcrumb />
            </div>

            <div className="mb-4">
                <h2 className="fw-bold mb-0">Asset Health Report</h2>
                <p className="text-muted mt-2">Monitors uptime and fault frequency</p>
            </div>

            <div className="card custom-shadow mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">
                                <FaCalendarAlt className="me-2" />
                                Date Range
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Select date range"
                                value={filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Asset Category</label>
                            <select
                                className="form-select"
                                value={filters.assetCategory}
                                onChange={(e) => handleFilterChange('assetCategory', e.target.value)}
                            >
                                <option value="">All Categories</option>
                                <option value="IT Equipment">IT Equipment</option>
                                <option value="Network Equipment">Network Equipment</option>
                                <option value="Power Equipment">Power Equipment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Health Status</label>
                            <select
                                className="form-select"
                                value={filters.healthStatus}
                                onChange={(e) => handleFilterChange('healthStatus', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Excellent">Excellent</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                                <option value="Poor">Poor</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Location</label>
                            <select
                                className="form-select"
                                value={filters.location}
                                onChange={(e) => handleFilterChange('location', e.target.value)}
                            >
                                <option value="">All Locations</option>
                                <option value="Head Office">Head Office</option>
                                <option value="Branch Office">Branch Office</option>
                                <option value="Remote Sites">Remote Sites</option>
                                <option value="Field Locations">Field Locations</option>
                            </select>
                        </div>
                    </div>

                    <div className="row mt-3">
                        <div className="col-12 d-flex gap-2">
                            <button
                                className="btn btn-primary fw-semibold"
                                onClick={generateReport}
                            >
                                <FaChartLine className="me-2" />
                                Generate Report
                            </button>
                            <button
                                className="btn btn-success fw-semibold"
                                onClick={exportReport}
                            >
                                <FaDownload className="me-2" />
                                Export Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card custom-shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">Asset Health Summary</h5>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary">
                                <FaSearch className="me-1" />
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Total Assets</h6>
                                    <h4 className="text-primary">1,456</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Healthy Assets</h6>
                                    <h4 className="text-success">1,234</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">At Risk</h6>
                                    <h4 className="text-warning">156</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Critical</h6>
                                    <h4 className="text-danger">66</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Asset ID</th>
                                    <th>Asset Name</th>
                                    <th>Category</th>
                                    <th>Location</th>
                                    <th>Uptime %</th>
                                    <th>Fault Count</th>
                                    <th>Last Maintenance</th>
                                    <th>Health Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>AST-001</td>
                                    <td>Network Switch</td>
                                    <td>Network Equipment</td>
                                    <td>Head Office</td>
                                    <td>99.8%</td>
                                    <td>2</td>
                                    <td>2024-01-15</td>
                                    <td><span className="badge bg-success">Excellent</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary">View</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>AST-002</td>
                                    <td>Power Generator</td>
                                    <td>Power Equipment</td>
                                    <td>Branch Office</td>
                                    <td>95.2%</td>
                                    <td>8</td>
                                    <td>2024-01-10</td>
                                    <td><span className="badge bg-warning">Fair</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary">View</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>AST-003</td>
                                    <td>Server Rack</td>
                                    <td>IT Equipment</td>
                                    <td>Remote Site</td>
                                    <td>87.5%</td>
                                    <td>15</td>
                                    <td>2024-01-05</td>
                                    <td><span className="badge bg-danger">Poor</span></td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary">View</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssetHealthReport;
