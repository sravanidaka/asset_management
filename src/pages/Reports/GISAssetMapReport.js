import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { FaDownload, FaFilter, FaSearch, FaCalendarAlt, FaChartLine, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

const GISAssetMapReport = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        dateRange: '',
        assetCategory: '',
        location: '',
        status: ''
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateReport = () => {
        console.log('Generating GIS-Integrated Asset Map Report with filters:', filters);
    };

    const exportReport = () => {
        console.log('Exporting GIS-Integrated Asset Map Report');
    };

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
                <h2 className="fw-bold mb-0">GIS-Integrated Asset Map Report</h2>
                <p className="text-muted mt-2">Provides a visual representation of field assets</p>
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
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Status</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Offline">Offline</option>
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
                        <h5 className="card-title mb-0">GIS Asset Map Summary</h5>
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
                                    <h6 className="card-title text-muted">Active Assets</h6>
                                    <h4 className="text-success">1,234</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Locations</h6>
                                    <h4 className="text-info">89</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Coverage %</h6>
                                    <h4 className="text-warning">94.2%</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 bg-light" style={{ height: '400px' }}>
                                <div className="card-body d-flex align-items-center justify-content-center">
                                    <div className="text-center">
                                        <FaMapMarkerAlt size={48} className="text-muted mb-3" />
                                        <h5 className="text-muted">Interactive GIS Map</h5>
                                        <p className="text-muted">Real-time asset location visualization</p>
                                    </div>
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
                                    <th>GPS Coordinates</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>AST-001</td>
                                    <td>Network Switch</td>
                                    <td>Network Equipment</td>
                                    <td>Site A</td>
                                    <td>28.6139°N, 77.2090°E</td>
                                    <td><span className="badge bg-success">Active</span></td>
                                    <td>2024-01-25 14:30</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary">View</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>AST-002</td>
                                    <td>Power Generator</td>
                                    <td>Power Equipment</td>
                                    <td>Site B</td>
                                    <td>28.6140°N, 77.2091°E</td>
                                    <td><span className="badge bg-warning">Maintenance</span></td>
                                    <td>2024-01-24 10:15</td>
                                    <td>
                                        <button className="btn btn-sm btn-outline-primary">View</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>AST-003</td>
                                    <td>Server Rack</td>
                                    <td>IT Equipment</td>
                                    <td>Site C</td>
                                    <td>28.6141°N, 77.2092°E</td>
                                    <td><span className="badge bg-success">Active</span></td>
                                    <td>2024-01-25 16:45</td>
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

export default GISAssetMapReport;
