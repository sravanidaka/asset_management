import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import dayjs from 'dayjs';
import { Tag, DatePicker, InputNumber, Select, Button, Space, Collapse, Input, Drawer, Form } from 'antd';
import { 
    DownloadOutlined, 
    FilterOutlined, 
    SearchOutlined, 
    CalendarOutlined, 
    LineChartOutlined, 
    ArrowLeftOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    HolderOutlined,
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CloseOutlined,
    SaveOutlined,
    ClearOutlined
} from '@ant-design/icons';

const ComplianceAuditReport = () => {
    const navigate = useNavigate();
    
    // Basic state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAuditType, setSelectedAuditType] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // Query Editor Filters State
    const [queryFilters, setQueryFilters] = useState([
        {
            id: 1,
            field: 'Audit Date',
            operator: '=',
            value: '',
            logicalOperator: null // null for first row
        },
        {
            id: 2,
            field: 'Audit Type',
            operator: '=',
            value: '',
            logicalOperator: 'And'
        },
        {
            id: 3,
            field: 'Status',
            operator: '=',
            value: '',
            logicalOperator: 'And'
        }
    ]);

    // Sample data
    const [tableData, setTableData] = useState([
        {
            id: 1,
            auditId: 'AUD-001',
            assetId: 'AST-001',
            assetName: 'Server Rack A',
            auditType: 'Physical Audit',
            location: 'Data Center 1',
            auditor: 'John Smith',
            auditDate: '2024-01-15',
            complianceScore: 95,
            status: 'Compliant',
            totalItems: 20,
            compliantItems: 19,
            nonCompliantItems: 1
        },
        {
            id: 2,
            auditId: 'AUD-002',
            assetId: 'AST-002',
            assetName: 'Network Switch B',
            auditType: 'System Audit',
            location: 'Data Center 2',
            auditor: 'Jane Doe',
            auditDate: '2024-01-20',
            complianceScore: 78,
            status: 'Non-Compliant',
            totalItems: 15,
            compliantItems: 12,
            nonCompliantItems: 3
        },
        {
            id: 3,
            auditId: 'AUD-003',
            assetId: 'AST-003',
            assetName: 'Firewall C',
            auditType: 'Compliance Check',
            location: 'Data Center 1',
            auditor: 'Mike Johnson',
            auditDate: '2024-01-25',
            complianceScore: 88,
            status: 'Compliant',
            totalItems: 18,
            compliantItems: 16,
            nonCompliantItems: 2
        },
        {
            id: 4,
            auditId: 'AUD-004',
            assetId: 'AST-004',
            assetName: 'Database Server D',
            auditType: 'Physical Audit',
            location: 'Data Center 3',
            auditor: 'Sarah Wilson',
            auditDate: '2024-02-01',
            complianceScore: 92,
            status: 'Compliant',
            totalItems: 25,
            compliantItems: 23,
            nonCompliantItems: 2
        },
        {
            id: 5,
            auditId: 'AUD-005',
            assetId: 'AST-005',
            assetName: 'Load Balancer E',
            auditType: 'System Audit',
            location: 'Data Center 2',
            auditor: 'David Brown',
            auditDate: '2024-02-05',
            complianceScore: 65,
            status: 'Non-Compliant',
            totalItems: 12,
            compliantItems: 8,
            nonCompliantItems: 4
        },
        {
            id: 6,
            auditId: 'AUD-006',
            assetId: 'AST-006',
            assetName: 'Storage Array F',
            auditType: 'Compliance Check',
            location: 'Data Center 1',
            auditor: 'Lisa Garcia',
            auditDate: '2024-02-10',
            complianceScore: 98,
            status: 'Compliant',
            totalItems: 30,
            compliantItems: 29,
            nonCompliantItems: 1
        },
        {
            id: 7,
            auditId: 'AUD-007',
            assetId: 'AST-007',
            assetName: 'Web Server G',
            auditType: 'Physical Audit',
            location: 'Data Center 3',
            auditor: 'Robert Taylor',
            auditDate: '2024-02-15',
            complianceScore: 85,
            status: 'Compliant',
            totalItems: 22,
            compliantItems: 19,
            nonCompliantItems: 3
        },
        {
            id: 8,
            auditId: 'AUD-008',
            assetId: 'AST-008',
            assetName: 'Mail Server H',
            auditType: 'System Audit',
            location: 'Data Center 2',
            auditor: 'Emily Davis',
            auditDate: '2024-02-20',
            complianceScore: 72,
            status: 'Non-Compliant',
            totalItems: 16,
            compliantItems: 12,
            nonCompliantItems: 4
        },
        {
            id: 9,
            auditId: 'AUD-009',
            assetId: 'AST-009',
            assetName: 'Backup Server I',
            auditType: 'Compliance Check',
            location: 'Data Center 1',
            auditor: 'Michael Chen',
            auditDate: '2024-02-25',
            complianceScore: 90,
            status: 'Compliant',
            totalItems: 28,
            compliantItems: 25,
            nonCompliantItems: 3
        },
        {
            id: 10,
            auditId: 'AUD-010',
            assetId: 'AST-010',
            assetName: 'Monitoring Server J',
            auditType: 'Physical Audit',
            location: 'Data Center 3',
            auditor: 'Jennifer Lee',
            auditDate: '2024-03-01',
            complianceScore: 96,
            status: 'Compliant',
            totalItems: 24,
            compliantItems: 23,
            nonCompliantItems: 1
        },
        {
            id: 11,
            auditId: 'AUD-011',
            assetId: 'AST-011',
            assetName: 'Application Server K',
            auditType: 'System Audit',
            location: 'Data Center 2',
            auditor: 'Christopher Moore',
            auditDate: '2024-03-05',
            complianceScore: 68,
            status: 'Non-Compliant',
            totalItems: 14,
            compliantItems: 10,
            nonCompliantItems: 4
        },
        {
            id: 12,
            auditId: 'AUD-012',
            assetId: 'AST-012',
            assetName: 'Proxy Server L',
            auditType: 'Compliance Check',
            location: 'Data Center 1',
            auditor: 'Amanda White',
            auditDate: '2024-03-10',
            complianceScore: 94,
            status: 'Compliant',
            totalItems: 26,
            compliantItems: 24,
            nonCompliantItems: 2
        },
        {
            id: 13,
            auditId: 'AUD-013',
            assetId: 'AST-013',
            assetName: 'Cache Server M',
            auditType: 'Physical Audit',
            location: 'Data Center 3',
            auditor: 'Daniel Anderson',
            auditDate: '2024-03-15',
            complianceScore: 87,
            status: 'Compliant',
            totalItems: 20,
            compliantItems: 17,
            nonCompliantItems: 3
        },
        {
            id: 14,
            auditId: 'AUD-014',
            assetId: 'AST-014',
            assetName: 'DNS Server N',
            auditType: 'System Audit',
            location: 'Data Center 2',
            auditor: 'Rachel Martinez',
            auditDate: '2024-03-20',
            complianceScore: 75,
            status: 'Non-Compliant',
            totalItems: 18,
            compliantItems: 14,
            nonCompliantItems: 4
        },
        {
            id: 15,
            auditId: 'AUD-015',
            assetId: 'AST-015',
            assetName: 'File Server O',
            auditType: 'Compliance Check',
            location: 'Data Center 1',
            auditor: 'Kevin Thompson',
            auditDate: '2024-03-25',
            complianceScore: 91,
            status: 'Compliant',
            totalItems: 32,
            compliantItems: 29,
            nonCompliantItems: 3
        }
    ]);

    // Form data for drawer
    const [formData, setFormData] = useState({
        assetId: '',
        assetName: '',
        complianceType: '',
        locationSite: '',
        auditorName: '',
        verifiedDate: '',
        complianceScore: '',
        complianceStatus: '',
        totalComplianceItemsChecked: '',
        totalCompliant: '',
        totalNonCompliant: ''
    });

    // Query Editor Filter Handlers
    const updateQueryFilter = (id, field, value) => {
        setQueryFilters(prev => prev.map(filter => 
            filter.id === id ? { ...filter, [field]: value } : filter
        ));
    };

    const addQueryFilter = () => {
        const newId = Math.max(...queryFilters.map(f => f.id)) + 1;
        const newFilter = {
            id: newId,
            field: 'Audit ID',
            operator: '=',
            value: '',
            logicalOperator: 'And'
        };
        setQueryFilters(prev => [...prev, newFilter]);
    };

    const removeQueryFilter = (id) => {
        setQueryFilters(prev => {
            const filtered = prev.filter(f => f.id !== id);
            // Update logical operators for remaining filters
            return filtered.map((filter, index) => ({
                ...filter,
                logicalOperator: index === 0 ? null : 'And'
            }));
        });
    };

    // Query Editor Filter Logic
    const applyQueryFilters = (data) => {
        return data.filter(item => {
            let result = true;
            
            for (let i = 0; i < queryFilters.length; i++) {
                const filter = queryFilters[i];
                let filterResult = true;
                
                // Skip if value is empty or [Any]
                if (!filter.value || filter.value === '[Any]' || filter.value.trim() === '') {
                    continue;
                }
                
                // Map field names to actual data properties
                let fieldValue = '';
                switch (filter.field) {
                    case 'Audit Date':
                        fieldValue = item.auditDate || '';
                        break;
                    case 'Audit Type':
                        fieldValue = item.auditType || '';
                        break;
                    case 'Status':
                        fieldValue = item.status || '';
                        break;
                    case 'Audit ID':
                        fieldValue = item.auditId || '';
                        break;
                    case 'Asset ID':
                        fieldValue = item.assetId || '';
                        break;
                    case 'Asset Name':
                        fieldValue = item.assetName || '';
                        break;
                    case 'Location':
                        fieldValue = item.location || '';
                        break;
                    case 'Auditor':
                        fieldValue = item.auditor || '';
                        break;
                    case 'Compliance Score':
                        fieldValue = item.complianceScore || '';
                        break;
                    default:
                        fieldValue = '';
                }
                
                // Apply filter logic
                if (filter.operator === '=') {
                    filterResult = fieldValue.toString().toLowerCase() === filter.value.toLowerCase();
                } else if (filter.operator === '!=') {
                    filterResult = fieldValue.toString().toLowerCase() !== filter.value.toLowerCase();
                } else if (filter.operator === '>') {
                    filterResult = parseFloat(fieldValue) > parseFloat(filter.value);
                } else if (filter.operator === '<') {
                    filterResult = parseFloat(fieldValue) < parseFloat(filter.value);
                } else if (filter.operator === '>=') {
                    filterResult = parseFloat(fieldValue) >= parseFloat(filter.value);
                } else if (filter.operator === '<=') {
                    filterResult = parseFloat(fieldValue) <= parseFloat(filter.value);
                }
                
                // Apply logical operator
                if (i === 0) {
                    result = filterResult;
                } else {
                    if (filter.logicalOperator === 'And') {
                        result = result && filterResult;
                    } else if (filter.logicalOperator === 'Or') {
                        result = result || filterResult;
                    }
                }
            }
            
            return result;
        });
    };

    // Filtering and sorting logic
    const filteredData = useMemo(() => {
        let filtered = tableData.filter(item => {
            // Basic search filter
            const matchesSearch = searchTerm === '' ||
                item.auditId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.auditor.toLowerCase().includes(searchTerm.toLowerCase());

            // Audit type filter
            const matchesAuditType = selectedAuditType === '' || item.auditType === selectedAuditType;

            // Status filter
            const matchesStatus = selectedStatus === '' || item.status === selectedStatus;

            return matchesSearch && matchesAuditType && matchesStatus;
        });

        // Apply query filters
        filtered = applyQueryFilters(filtered);

        // Sorting
        if (sortField) {
            filtered.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Handle different data types
                if (sortField === 'complianceScore' || sortField === 'totalItems' || sortField === 'compliantItems' || sortField === 'nonCompliantItems') {
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                } else if (sortField === 'auditDate') {
                    aValue = new Date(aValue);
                    bValue = new Date(bValue);
                } else {
                    aValue = String(aValue).toLowerCase();
                    bValue = String(bValue).toLowerCase();
                }

                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [tableData, searchTerm, selectedAuditType, selectedStatus, queryFilters, sortField, sortDirection]);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Handle sorting
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Export functionality
    const exportReport = () => {
        const csvContent = [
            ['S.No', 'Audit ID', 'Asset ID', 'Asset Name', 'Audit Type', 'Location', 'Auditor', 'Audit Date', 'Compliance Score', 'Status', 'Total Items', 'Compliant Items', 'Non-Compliant Items'],
            ...filteredData.map((item, index) => [
                index + 1,
                item.auditId,
                item.assetId,
                item.assetName,
                item.auditType,
                item.location,
                item.auditor,
                item.auditDate,
                item.complianceScore,
                item.status,
                item.totalItems,
                item.compliantItems,
                item.nonCompliantItems
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `compliance_audit_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const submitForm = () => {
        console.log('Submitting form:', formData);
        // Add new audit to table data
        const newAudit = {
            id: tableData.length + 1,
            auditId: `AUD-${String(tableData.length + 1).padStart(3, '0')}`,
            assetId: formData.assetId,
            assetName: formData.assetName,
            auditType: formData.complianceType,
            location: formData.locationSite,
            auditor: formData.auditorName,
            auditDate: formData.verifiedDate,
            complianceScore: formData.complianceScore,
            status: formData.complianceStatus,
            totalItems: formData.totalComplianceItemsChecked,
            compliantItems: formData.totalCompliant,
            nonCompliantItems: formData.totalNonCompliant
        };
        setTableData(prev => [...prev, newAudit]);
        setDrawerOpen(false);
    };

    return (
        <div className="container-fluid p-1">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button
                    type="default"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/reports')}
                    style={{
                        borderColor: '#d9d9d9',
                        color: '#595959',
                        fontWeight: '500'
                    }}
                >
                    Back to Reports
                </Button>
                <CustomBreadcrumb />
            </div>

            {/* Main Heading */}
            <div className="mb-4">
                <h2 className="fw-bold mb-0">Compliance & Audit Report</h2>
                <p className="text-muted mt-2">Validates physical vs system records</p>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Button 
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={toggleDrawer}
                                    style={{ fontWeight: '500' }}
                                >
                                    Add Audit
                                </Button>
                <div className="d-flex gap-2">
                                <Button 
                                    type="default"
                                    icon={<DownloadOutlined />}
                                    onClick={exportReport}
                                    style={{ 
                                        backgroundColor: '#52c41a',
                                        borderColor: '#52c41a',
                                        color: 'white',
                                        fontWeight: '500'
                                    }}
                                >
                                    Export Report
                                </Button>
                </div>
            </div>

            {/* Query Editor Style Filters */}
            <div className="query-editor-container" style={{ 
                backgroundColor: 'white', 
                border: '1px solid #d9d9d9', 
                borderRadius: '6px', 
                padding: '0',
                width: '100%',
                marginBottom: '1.5rem'
            }}>
                {/* Header Row */}
                <div className="filter-header d-flex align-items-center" style={{ 
                    backgroundColor: '#f5f5f5', 
                    borderBottom: '1px solid #d9d9d9',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    <div style={{ width: '80px', display: 'flex', alignItems: 'center' }}>
                        <FilterOutlined style={{ marginRight: '8px', fontSize: '12px' }} />
                        And/Or
                            </div>
                    <div style={{ width: '180px' }}>
                        Field *
                            </div>
                    <div style={{ width: '100px' }}>
                        Operator
                            </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        Value
                            </div>
                            </div>

                {/* Dynamic Filter Rows */}
                {queryFilters.map((filter, index) => (
                    <div key={filter.id} className="filter-row d-flex align-items-center" style={{ 
                        borderBottom: '1px solid #f0f0f0',
                        padding: '12px 16px',
                        minHeight: '48px'
                    }}>
                        <div style={{ width: '80px', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <PlusOutlined 
                                style={{ color: '#52c41a', fontSize: '12px', cursor: 'pointer' }} 
                                onClick={() => addQueryFilter()}
                            />
                            <CloseOutlined 
                                style={{ color: '#ff4d4f', fontSize: '12px', cursor: 'pointer' }} 
                                onClick={() => removeQueryFilter(filter.id)}
                            />
                            <input type="checkbox" style={{ margin: 0, width: '14px', height: '14px' }} />
                            </div>
                        <div style={{ width: '180px', marginRight: '12px', flexShrink: 0 }}>
                                <Select
                                value={filter.field}
                                onChange={(value) => updateQueryFilter(filter.id, 'field', value)}
                                    style={{ width: '100%' }}
                                size="small"
                                    options={[
                                    { value: 'Audit Date', label: 'Audit Date' },
                                    { value: 'Audit Type', label: 'Audit Type' },
                                    { value: 'Status', label: 'Status' },
                                    { value: 'Audit ID', label: 'Audit ID' },
                                    { value: 'Asset ID', label: 'Asset ID' },
                                    { value: 'Asset Name', label: 'Asset Name' },
                                    { value: 'Location', label: 'Location' },
                                    { value: 'Auditor', label: 'Auditor' },
                                    { value: 'Compliance Score', label: 'Compliance Score' }
                                    ]}
                                />
                            </div>
                        <div style={{ width: '100px', marginRight: '12px', flexShrink: 0 }}>
                                <Select
                                value={filter.operator}
                                onChange={(value) => updateQueryFilter(filter.id, 'operator', value)}
                                    style={{ width: '100%' }}
                                size="small"
                                    options={[
                                    { value: '>', label: '>' },
                                    { value: '<', label: '<' },
                                    { value: '>=', label: '>=' },
                                    { value: '<=', label: '<=' },
                                    { value: '=', label: '=' },
                                    { value: '!=', label: '!=' }
                                    ]}
                                />
                            </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <Input
                                value={filter.value}
                                onChange={(e) => updateQueryFilter(filter.id, 'value', e.target.value)}
                                    style={{ width: '100%' }}
                                size="small"
                                placeholder="Enter value"
                                />
                            </div>
                        </div>
                ))}

                {/* Add New Clause Button */}
                <div style={{ padding: '16px', textAlign: 'left' }}>
                    <Button 
                        type="text" 
                        icon={<PlusOutlined style={{ color: '#52c41a' }} />}
                        onClick={addQueryFilter}
                        style={{ 
                            color: '#52c41a',
                            padding: '0',
                            height: 'auto',
                            fontSize: '14px'
                        }}
                    >
                        Add new clause
                    </Button>
                </div>
            </div>

            <div className="card custom-shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">Compliance & Audit Summary</h5>
                        <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary">
                                <LineChartOutlined className="me-1" />
                                Analytics
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover table-light">
                            <thead>
                                <tr>
                                    <th className="text-center fw-bold">Audit ID</th>
                                    <th className="text-center fw-bold">Asset ID</th>
                                    <th className="text-center fw-bold">Asset Name</th>
                                    <th className="text-center fw-bold">Audit Type</th>
                                    <th className="text-center fw-bold">Location</th>
                                    <th className="text-center fw-bold">Auditor</th>
                                    <th className="text-center fw-bold">Audit Date</th>
                                    <th className="text-center fw-bold">Compliance Score</th>
                                    <th className="text-center fw-bold">Status</th>
                                    <th className="text-center fw-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((audit) => (
                                    <tr key={audit.id}>
                                        <td className="text-center">{audit.auditId}</td>
                                        <td className="text-center">{audit.assetId}</td>
                                        <td className="text-center">{audit.assetName}</td>
                                        <td className="text-center">{audit.auditType}</td>
                                        <td className="text-center">{audit.location}</td>
                                        <td className="text-center">{audit.auditor}</td>
                                        <td className="text-center">{audit.auditDate}</td>
                                        <td className="text-center">
                                            <span className={`badge ${audit.complianceScore >= 90 ? 'bg-success' : audit.complianceScore >= 70 ? 'bg-warning' : 'bg-danger'}`}>
                                                {audit.complianceScore}%
                                            </span>
                                    </td>
                                        <td className="text-center">
                                            <span className={`badge ${audit.status === 'Compliant' ? 'bg-success' : audit.status === 'Non-Compliant' ? 'bg-danger' : 'bg-warning'}`}>
                                                {audit.status}
                                            </span>
                                    </td>
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-sm btn-outline-secondary" title="Edit">
                                                    <EditOutlined />
                                                </button>
                                            </div>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <div className="text-muted">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                </div>
                        <div className="d-flex gap-2">
                            <Button 
                                        disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                size="small"
                            >
                                Previous
                            </Button>
                            <span className="align-self-center px-3">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button 
                                        disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                size="small"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Audit Drawer */}
            <Drawer
                title="Add New Audit"
                width={800}
                onClose={toggleDrawer}
                open={drawerOpen}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <Form
                    layout="vertical"
                    onFinish={submitForm}
                >
                    {/* Audit Information Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#e9ecef', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#6c757d' }}>Audit Information</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="assetId"
                                label="Asset ID"
                                rules={[{ required: true, message: 'Please enter Asset ID' }]}
                                initialValue={formData.assetId}
                            >
                                <Input 
                                    placeholder="e.g., ASSET-001"
                                    value={formData.assetId}
                                    onChange={(e) => setFormData({...formData, assetId: e.target.value})}
                                />
                            </Form.Item>
                            <Form.Item
                                name="assetName"
                                label="Asset Name"
                                rules={[{ required: true, message: 'Please enter Asset Name' }]}
                                initialValue={formData.assetName}
                            >
                                <Input 
                                    placeholder="e.g., Server Rack A1"
                                    value={formData.assetName}
                                    onChange={(e) => setFormData({...formData, assetName: e.target.value})}
                                />
                            </Form.Item>
                            <Form.Item
                                name="complianceType"
                                label="Compliance Type"
                                rules={[{ required: true, message: 'Please select Compliance Type' }]}
                                initialValue={formData.complianceType}
                            >
                                <Select 
                                    placeholder="Select Type"
                                    value={formData.complianceType}
                                    onChange={(value) => setFormData({...formData, complianceType: value})}
                                >
                                    <Select.Option value="Physical Audit">Physical Audit</Select.Option>
                                    <Select.Option value="System Audit">System Audit</Select.Option>
                                    <Select.Option value="Compliance Check">Compliance Check</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="locationSite"
                                label="Location/Site"
                                rules={[{ required: true, message: 'Please enter Location/Site' }]}
                                initialValue={formData.locationSite}
                            >
                                <Input 
                                    placeholder="e.g., Data Center - Floor 1"
                                    value={formData.locationSite}
                                    onChange={(e) => setFormData({...formData, locationSite: e.target.value})}
                                />
                            </Form.Item>
                            <Form.Item
                                name="auditorName"
                                label="Auditor Name"
                                rules={[{ required: true, message: 'Please enter Auditor Name' }]}
                                initialValue={formData.auditorName}
                            >
                                <Input 
                                    placeholder="e.g., John Smith"
                                    value={formData.auditorName}
                                    onChange={(e) => setFormData({...formData, auditorName: e.target.value})}
                                />
                            </Form.Item>
                            <Form.Item
                                name="verifiedDate"
                                label="Verified Date"
                                rules={[{ required: true, message: 'Please select Verified Date' }]}
                                initialValue={formData.verifiedDate ? dayjs(formData.verifiedDate) : null}
                            >
                                <DatePicker 
                                    style={{ width: '100%' }} 
                                    format="DD-MMM-YY"
                                    value={formData.verifiedDate ? dayjs(formData.verifiedDate) : null}
                                    onChange={(date) => setFormData({...formData, verifiedDate: date ? date.format('YYYY-MM-DD') : ''})}
                                />
                            </Form.Item>
                            <Form.Item
                                name="complianceScore"
                                label="Compliance Score"
                                rules={[{ required: true, message: 'Please enter Compliance Score' }]}
                                initialValue={formData.complianceScore}
                            >
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    placeholder="Enter Score" 
                                    min={0} 
                                    max={100}
                                    value={formData.complianceScore}
                                    onChange={(value) => setFormData({...formData, complianceScore: value})}
                                />
                            </Form.Item>
                            <Form.Item
                                name="complianceStatus"
                                label="Compliance Status"
                                rules={[{ required: true, message: 'Please select Compliance Status' }]}
                                initialValue={formData.complianceStatus}
                            >
                                <Select 
                                    placeholder="Select Status"
                                    value={formData.complianceStatus}
                                    onChange={(value) => setFormData({...formData, complianceStatus: value})}
                                >
                                    <Select.Option value="Compliant">Compliant</Select.Option>
                                    <Select.Option value="Non-Compliant">Non-Compliant</Select.Option>
                                    <Select.Option value="In Progress">In Progress</Select.Option>
                                </Select>
                            </Form.Item>
                        </div>
                    </div>

                    {/* Compliance Details Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#e9ecef', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#6c757d' }}>Compliance Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="totalComplianceItemsChecked"
                                label="Total Items Checked"
                                rules={[{ required: true, message: 'Please enter Total Items Checked' }]}
                                initialValue={formData.totalComplianceItemsChecked}
                            >
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    placeholder="Enter Number"
                                    min={0}
                                    value={formData.totalComplianceItemsChecked}
                                    onChange={(value) => setFormData({...formData, totalComplianceItemsChecked: value})}
                                />
                            </Form.Item>
                            <Form.Item
                                name="totalCompliant"
                                label="Compliant Items"
                                rules={[{ required: true, message: 'Please enter Compliant Items' }]}
                                initialValue={formData.totalCompliant}
                            >
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    placeholder="Enter Number"
                                    min={0}
                                    value={formData.totalCompliant}
                                    onChange={(value) => setFormData({...formData, totalCompliant: value})}
                                />
                            </Form.Item>
                            <Form.Item
                                name="totalNonCompliant"
                                label="Non-Compliant Items"
                                rules={[{ required: true, message: 'Please enter Non-Compliant Items' }]}
                                initialValue={formData.totalNonCompliant}
                            >
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    placeholder="Enter Number"
                                    min={0}
                                    value={formData.totalNonCompliant}
                                    onChange={(value) => setFormData({...formData, totalNonCompliant: value})}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                        <Button onClick={toggleDrawer} style={{ marginRight: 8 }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            <SaveOutlined className="me-2" />
                            Save
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    );
};

export default ComplianceAuditReport;