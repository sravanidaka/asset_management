import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { FaDownload, FaFilter, FaSearch, FaCalendarAlt, FaChartLine, FaBolt, FaArrowLeft, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const EnergyEquipmentPerformanceReport = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        dateRange: '',
        equipmentType: '',
        performanceStatus: '',
        location: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
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
        console.log('Generating Energy Equipment Performance Report with filters:', filters);
    };

    const exportReport = () => {
        console.log('Exporting Energy Equipment Performance Report');
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
            equipmentId: 'EQ-001',
            equipmentName: 'UPS System',
            equipmentType: 'Power Equipment',
            location: 'Data Center',
            powerConsumption: '2.5 kW',
            efficiency: '95%',
            performanceStatus: 'Optimal',
            lastMaintenance: '2024-01-15',
            nextMaintenance: '2024-04-15'
        },
        {
            id: 2,
            equipmentId: 'EQ-002',
            equipmentName: 'Air Conditioning',
            equipmentType: 'HVAC',
            location: 'Server Room',
            powerConsumption: '5.2 kW',
            efficiency: '88%',
            performanceStatus: 'Good',
            lastMaintenance: '2024-01-10',
            nextMaintenance: '2024-04-10'
        }
    ];

    // Filter and sort table data
    const filteredData = tableData
        .filter(item => {
            const matchesSearch = searchTerm === '' ||
                item.equipmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesType = selectedType === '' || item.equipmentType === selectedType;
            const matchesStatus = selectedStatus === '' || item.performanceStatus === selectedStatus;

            return matchesSearch && matchesType && matchesStatus;
        })
        .sort((a, b) => {
            if (!sortField) return 0;

            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle numeric values
            if (sortField.includes('power') || sortField.includes('efficiency')) {
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
                <h2 className="fw-bold mb-0">Energy Equipment Performance Report</h2>
                <p className="text-muted mt-2">Tracks DG, Battery, and Solar Unit performance</p>
            </div>

            <div className="card custom-shadow mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">
                                <FaSearch className="me-2" />
                                Search Equipment
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by Equipment ID, Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Equipment Type</label>
                            <select
                                className="form-select"
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                            >
                                <option value="">All Types</option>
                                <option value="Power Equipment">Power Equipment</option>
                                <option value="HVAC">HVAC</option>
                                <option value="UPS">UPS</option>
                                <option value="Generator">Generator</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">Performance Status</label>
                            <select
                                className="form-select"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Optimal">Optimal</option>
                                <option value="Good">Good</option>
                                <option value="Poor">Poor</option>
                                <option value="Critical">Critical</option>
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
                        <h5 className="card-title mb-0">Energy Equipment Performance Summary</h5>
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
                                    <h6 className="card-title text-muted">Total Equipment</h6>
                                    <h4 className="text-primary">156</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">DG Sets</h6>
                                    <h4 className="text-success">45</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Batteries</h6>
                                    <h4 className="text-info">67</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Solar Units</h6>
                                    <h4 className="text-warning">44</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Equipment ID</span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                                    onClick={() => handleSort('equipmentId')}
                                                    title="Sort"
                                                >
                                                    {sortField === 'equipmentId' ?
                                                        (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) :
                                                        <FaSort />
                                                    }
                                                </button>
                                                <button className="btn btn-sm p-0 border-0 bg-transparent" title="Search">
                                                    <FaSearch />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Equipment Name</span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                                    onClick={() => handleSort('equipmentName')}
                                                    title="Sort"
                                                >
                                                    {sortField === 'equipmentName' ?
                                                        (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) :
                                                        <FaSort />
                                                    }
                                                </button>
                                                <button className="btn btn-sm p-0 border-0 bg-transparent" title="Search">
                                                    <FaSearch />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Type</span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                                    onClick={() => handleSort('equipmentType')}
                                                    title="Sort"
                                                >
                                                    {sortField === 'equipmentType' ?
                                                        (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) :
                                                        <FaSort />
                                                    }
                                                </button>
                                                <button className="btn btn-sm p-0 border-0 bg-transparent" title="Filter">
                                                    <FaFilter />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Location</span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                                    onClick={() => handleSort('location')}
                                                    title="Sort"
                                                >
                                                    {sortField === 'location' ?
                                                        (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) :
                                                        <FaSort />
                                                    }
                                                </button>
                                                <button className="btn btn-sm p-0 border-0 bg-transparent" title="Search">
                                                    <FaSearch />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Capacity</span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                                    onClick={() => handleSort('powerConsumption')}
                                                    title="Sort"
                                                >
                                                    {sortField === 'powerConsumption' ?
                                                        (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) :
                                                        <FaSort />
                                                    }
                                                </button>
                                                <button className="btn btn-sm p-0 border-0 bg-transparent" title="Search">
                                                    <FaSearch />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Efficiency %</span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                                    onClick={() => handleSort('efficiency')}
                                                    title="Sort"
                                                >
                                                    {sortField === 'efficiency' ?
                                                        (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) :
                                                        <FaSort />
                                                    }
                                                </button>
                                                <button className="btn btn-sm p-0 border-0 bg-transparent" title="Search">
                                                    <FaSearch />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Last Service</span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                                    onClick={() => handleSort('lastMaintenance')}
                                                    title="Sort"
                                                >
                                                    {sortField === 'lastMaintenance' ?
                                                        (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) :
                                                        <FaSort />
                                                    }
                                                </button>
                                                <button className="btn btn-sm p-0 border-0 bg-transparent" title="Search">
                                                    <FaSearch />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Performance</span>
                                            <div className="d-flex gap-1">
                                                <button
                                                    className="btn btn-sm p-0 border-0 bg-transparent"
                                                    onClick={() => handleSort('performanceStatus')}
                                                    title="Sort"
                                                >
                                                    {sortField === 'performanceStatus' ?
                                                        (sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />) :
                                                        <FaSort />
                                                    }
                                                </button>
                                                <button className="btn btn-sm p-0 border-0 bg-transparent" title="Filter">
                                                    <FaFilter />
                                                </button>
                                            </div>
                                        </div>
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.equipmentId}</td>
                                        <td>{item.equipmentName}</td>
                                        <td>{item.equipmentType}</td>
                                        <td>{item.location}</td>
                                        <td>{item.powerConsumption}</td>
                                        <td>{item.efficiency}</td>
                                        <td>{item.lastMaintenance}</td>
                                        <td><span className="badge bg-success">{item.performanceStatus}</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary">View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default EnergyEquipmentPerformanceReport;
