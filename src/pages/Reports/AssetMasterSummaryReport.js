import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { Tag, DatePicker, InputNumber, Select, Button, Space, Collapse, Input } from 'antd';
import { DownloadOutlined, FilterOutlined, SearchOutlined, CalendarOutlined, LineChartOutlined, ArrowLeftOutlined, SortAscendingOutlined, SortDescendingOutlined, HolderOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CloseOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ExportButton from '../../components/ExportButton';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { safeStringCompare, safeDateCompare } from '../../utils/tableUtils';
import { parseAssetId } from '../../utils/assetIdUtils';
import { StatusNamesDropdown, CategoriesDropdown, LocationsDropdown } from '../../components/SettingsDropdown';

const AssetMasterSummaryReport = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        dateRange: '',
        assetCategory: '',
        status: '',
        location: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    
    // Query Editor Filters State
    const [queryFilters, setQueryFilters] = useState([
        {
            id: 1,
            field: 'Changed Date',
            operator: '>',
            value: '@Today - 180',
            logicalOperator: null // null for first row
        },
        {
            id: 2,
            field: 'Work Item Type',
            operator: '=',
            value: '[Any]',
            logicalOperator: 'And'
        },
        {
            id: 3,
            field: 'State',
            operator: '=',
            value: '[Any]',
            logicalOperator: 'And'
        }
    ]);
    
    // Advanced filters state
    const [advancedFilters, setAdvancedFilters] = useState({
        // Numeric filters
        currentValue: {
            operator: '=',
            value: null
        },
        // Date range filters
        deploymentDateRange: null,
        // Text filters
        assetId: '',
        assetName: '',
        category: '',
        location: '',
        // Multi-select filters
        categories: [],
        statuses: [],
        locations: []
    });
    
    const [formData, setFormData] = useState({
        // Asset Details
        assetId: '',
        assetName: '',
        category: '',
        subcategory: '',
        manufacturer: '',
        model: '',
        serialNumber: '',
        location: '',
        status: '',
        currentValue: '',
        deploymentDate: '',
        assignedTo: '',
        department: '',
        remarks: ''
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Filter handling functions
    const handleAdvancedFilterChange = (filterKey, value) => {
        setAdvancedFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
    };

    const handleNumericFilterChange = (filterKey, operator, value) => {
        setAdvancedFilters(prev => ({
            ...prev,
            [filterKey]: {
                operator,
                value
            }
        }));
    };

    const clearAllFilters = () => {
        setAdvancedFilters({
            // Numeric filters
            currentValue: { operator: '=', value: null },
            // Date range filters
            deploymentDateRange: null,
            // Text filters
            assetId: '',
            assetName: '',
            category: '',
            location: '',
            // Multi-select filters
            categories: [],
            statuses: [],
            locations: []
        });
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedStatus('');
        setSortField('');
        setSortDirection('asc');
    };

    const clearQueryFilters = () => {
        setQueryFilters([
            {
                id: 1,
                field: 'Changed Date',
                operator: '>',
                value: '@Today - 180',
                logicalOperator: null
            },
            {
                id: 2,
                field: 'Work Item Type',
                operator: '=',
                value: '[Any]',
                logicalOperator: 'And'
            },
            {
                id: 3,
                field: 'State',
                operator: '=',
                value: '[Any]',
                logicalOperator: 'And'
            }
        ]);
    };

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
            field: 'Asset ID',
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

    const applyQueryFilters = (data) => {
        return data.filter(item => {
            let result = true;
            
            for (let i = 0; i < queryFilters.length; i++) {
                const filter = queryFilters[i];
                let filterResult = true;
                
                // Skip if value is empty or [Any]
                if (!filter.value || filter.value === '[Any]') {
                    continue;
                }
                
                // Map field names to actual data properties
                let fieldValue = '';
                switch (filter.field) {
                    case 'Changed Date':
                        fieldValue = item.deploymentDate || '';
                        break;
                    case 'Work Item Type':
                        fieldValue = item.category || '';
                        break;
                    case 'State':
                        fieldValue = item.status || '';
                        break;
                    case 'Asset ID':
                        fieldValue = item.assetId || '';
                        break;
                    case 'Asset Name':
                        fieldValue = item.assetName || '';
                        break;
                    case 'Category':
                        fieldValue = item.category || '';
                        break;
                    case 'Location':
                        fieldValue = item.location || '';
                        break;
                    default:
                        fieldValue = item[filter.field.toLowerCase().replace(/\s+/g, '')] || '';
                }
                
                // Apply operator logic
                switch (filter.operator) {
                    case '=':
                        filterResult = fieldValue.toString().toLowerCase() === filter.value.toLowerCase();
                        break;
                    case '!=':
                        filterResult = fieldValue.toString().toLowerCase() !== filter.value.toLowerCase();
                        break;
                    case '>':
                        if (filter.field === 'Changed Date') {
                            try {
                                const itemDate = dayjs(fieldValue);
                                const filterDate = dayjs(filter.value.replace('@Today - ', ''));
                                filterResult = itemDate.isValid() && filterDate.isValid() && itemDate.isAfter(filterDate);
                            } catch (error) {
                                filterResult = false;
                            }
                        } else {
                            filterResult = parseFloat(fieldValue) > parseFloat(filter.value);
                        }
                        break;
                    case '<':
                        if (filter.field === 'Changed Date') {
                            try {
                                const itemDate = dayjs(fieldValue);
                                const filterDate = dayjs(filter.value.replace('@Today - ', ''));
                                filterResult = itemDate.isValid() && filterDate.isValid() && itemDate.isBefore(filterDate);
                            } catch (error) {
                                filterResult = false;
                            }
                        } else {
                            filterResult = parseFloat(fieldValue) < parseFloat(filter.value);
                        }
                        break;
                    case '>=':
                        if (filter.field === 'Changed Date') {
                            try {
                                const itemDate = dayjs(fieldValue);
                                const filterDate = dayjs(filter.value.replace('@Today - ', ''));
                                filterResult = itemDate.isValid() && filterDate.isValid() && (itemDate.isAfter(filterDate) || itemDate.isSame(filterDate));
                            } catch (error) {
                                filterResult = false;
                            }
                        } else {
                            filterResult = parseFloat(fieldValue) >= parseFloat(filter.value);
                        }
                        break;
                    case '<=':
                        if (filter.field === 'Changed Date') {
                            try {
                                const itemDate = dayjs(fieldValue);
                                const filterDate = dayjs(filter.value.replace('@Today - ', ''));
                                filterResult = itemDate.isValid() && filterDate.isValid() && (itemDate.isBefore(filterDate) || itemDate.isSame(filterDate));
                            } catch (error) {
                                filterResult = false;
                            }
                        } else {
                            filterResult = parseFloat(fieldValue) <= parseFloat(filter.value);
                        }
                        break;
                    default:
                        filterResult = fieldValue.toString().toLowerCase().includes(filter.value.toLowerCase());
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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const saveAsDraft = () => {
        console.log('Saving as draft:', formData);
        setDrawerOpen(false);
    };

    const submitForm = () => {
        console.log('Submitting form:', formData);
        // Add new asset to table data
        const newAsset = {
            id: tableData.length + 1,
            assetId: formData.assetId,
            assetName: formData.assetName,
            category: formData.category,
            subcategory: formData.subcategory,
            manufacturer: formData.manufacturer,
            model: formData.model,
            serialNumber: formData.serialNumber,
            location: formData.location,
            status: formData.status,
            currentValue: formData.currentValue,
            deploymentDate: formData.deploymentDate,
            assignedTo: formData.assignedTo,
            department: formData.department,
            remarks: formData.remarks
        };
        setTableData(prev => [...prev, newAsset]);
        setDrawerOpen(false);
    };

    // Sample data for the asset master summary table
    const [tableData, setTableData] = useState([
        {
            id: 1,
            assetId: 'AST-001',
            assetName: 'Dell OptiPlex 7090',
            category: 'IT Equipment',
            subcategory: 'Desktop',
            manufacturer: 'Dell',
            model: 'OptiPlex 7090',
            serialNumber: 'DL7090001',
            location: 'Head Office - Mumbai',
            status: 'Deployed',
            currentValue: '75000',
            deploymentDate: '2024-01-15',
            assignedTo: 'John Doe',
            department: 'IT Department',
            remarks: 'Primary workstation'
        },
        {
            id: 2,
            assetId: 'AST-002',
            assetName: 'Cisco Catalyst 2960',
            category: 'Network Equipment',
            subcategory: 'Switch',
            manufacturer: 'Cisco',
            model: 'Catalyst 2960',
            serialNumber: 'CS2960002',
            location: 'Data Center - Delhi',
            status: 'Deployed',
            currentValue: '45000',
            deploymentDate: '2024-02-20',
            assignedTo: 'Network Team',
            department: 'IT Department',
            remarks: 'Core network switch'
        },
        {
            id: 3,
            assetId: 'AST-003',
            assetName: 'HP LaserJet Pro',
            category: 'Office Equipment',
            subcategory: 'Printer',
            manufacturer: 'HP',
            model: 'LaserJet Pro',
            serialNumber: 'HP003',
            location: 'Branch Office - Bangalore',
            status: 'In Stock',
            currentValue: '25000',
            deploymentDate: '',
            assignedTo: '',
            department: '',
            remarks: 'Awaiting deployment'
        }
    ]);

    const applyNumericFilter = (value, filter) => {
        if (!filter || filter.value === null || filter.value === undefined) return true;
        
        const numValue = parseFloat(value);
        const filterValue = parseFloat(filter.value);
        
        switch (filter.operator) {
            case '=': return numValue === filterValue;
            case '>': return numValue > filterValue;
            case '<': return numValue < filterValue;
            case '>=': return numValue >= filterValue;
            case '<=': return numValue <= filterValue;
            case '!=': return numValue !== filterValue;
            default: return true;
        }
    };

    const applyDateRangeFilter = (dateValue, dateRange) => {
        if (!dateRange || !dateRange[0] || !dateRange[1] || !dateValue) return true;
        
        try {
            const date = dayjs(dateValue);
            const startDate = dayjs(dateRange[0]);
            const endDate = dayjs(dateRange[1]);
            
            if (!date.isValid() || !startDate.isValid() || !endDate.isValid()) {
                return true;
            }
            
            return date.isAfter(startDate) && date.isBefore(endDate);
        } catch (error) {
            console.warn('Date filter error:', error);
            return true;
        }
    };

    const generateReport = () => {
        console.log('Generating Asset Master Summary Report with filters:', filters);
    };

    const exportReport = () => {
        console.log('Exporting Asset Master Summary Report');
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

    // Filter and sort table data
    const filteredData = applyQueryFilters(tableData)
        .filter(item => {
            // Basic search filter
            const matchesSearch = searchTerm === '' ||
                item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase());

            // Basic category and status filters
            const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
            const matchesStatus = selectedStatus === '' || item.status === selectedStatus;

            // Advanced filters
            const matchesNumericFilters = 
                applyNumericFilter(item.currentValue, advancedFilters.currentValue);

            const matchesDateRangeFilters = 
                applyDateRangeFilter(item.deploymentDate, advancedFilters.deploymentDateRange);

            const matchesTextFilters = 
                (advancedFilters.assetId === '' || item.assetId.toLowerCase().includes(advancedFilters.assetId.toLowerCase())) &&
                (advancedFilters.assetName === '' || item.assetName.toLowerCase().includes(advancedFilters.assetName.toLowerCase())) &&
                (advancedFilters.category === '' || (item.category && item.category.toLowerCase().includes(advancedFilters.category.toLowerCase()))) &&
                (advancedFilters.location === '' || (item.location && item.location.toLowerCase().includes(advancedFilters.location.toLowerCase())));

            const matchesMultiSelectFilters = 
                (advancedFilters.categories.length === 0 || advancedFilters.categories.includes(item.category)) &&
                (advancedFilters.statuses.length === 0 || advancedFilters.statuses.includes(item.status)) &&
                (advancedFilters.locations.length === 0 || (item.location && advancedFilters.locations.includes(item.location)));

            return matchesSearch && matchesCategory && matchesStatus && 
                   matchesNumericFilters && matchesDateRangeFilters && 
                   matchesTextFilters && matchesMultiSelectFilters;
        })
        .sort((a, b) => {
            if (!sortField) return 0;

            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle numeric values
            if (sortField === 'currentValue') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    return (
        <div className="container-fluid p-1">
            {/* Top Navigation Bar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/reports')}
                >
                    <ArrowLeftOutlined className="me-2" />
                    Back to Reports
                </button>
                <CustomBreadcrumb />
            </div>

            {/* Main Heading */}
            <div className="mb-4">
                <h2 className="fw-bold mb-0">Asset Master Summary Report</h2>
                <p className="text-muted mt-2">Provides a complete view of deployed and in-stock assets</p>
            </div>

            {/* Query Editor Filters */}
            <div className="card custom-shadow mb-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold mb-0">
                            <FilterOutlined className="me-2" />
                            Editor
                        </h6>
                        <div className="d-flex gap-2">
                            <Button 
                                icon={<ClearOutlined />}
                                onClick={clearQueryFilters}
                                style={{backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', color: 'white'}}
                            >
                                Clear Filters
                            </Button>
                            <button
                                className="fw-semibold"
                                style={{backgroundColor: '#87CEEB !important', borderColor: '#87CEEB !important', color: 'white !important', border: '1px solid #87CEEB', borderRadius: '4px', padding: '8px 16px'}}
                                onClick={toggleDrawer}
                            >
                                <PlusOutlined className="me-2" />
                                Add Asset
                            </button>
                            <ExportButton
                                data={filteredData}
                                columns={[
                                    { title: 'S.No', key: 'serial', width: 80, render: (text, record, index) => index + 1 },
                                    { title: 'Asset ID', dataIndex: 'assetId', key: 'assetId' },
                                    { title: 'Asset Name', dataIndex: 'assetName', key: 'assetName' },
                                    { title: 'Category', dataIndex: 'category', key: 'category' },
                                    { title: 'Location', dataIndex: 'location', key: 'location' },
                                    { title: 'Status', dataIndex: 'status', key: 'status' },
                                    { title: 'Current Value', dataIndex: 'currentValue', key: 'currentValue', render: (value) => `₹${value}` },
                                    { title: 'Deployment Date', dataIndex: 'deploymentDate', key: 'deploymentDate', render: (date) => formatDateForDisplay(date) || '-' }
                                ]}
                                filename="Asset_Master_Summary_Report"
                                title="Asset Master Summary Report"
                                reportType="asset-master-summary"
                                filters={{}}
                                sorter={{}}
                                message={{ success: (msg) => console.log(msg), error: (msg) => console.error(msg) }}
                            />
                        </div>
                    </div>

                    {/* Query Editor Style Filters */}
                    <div className="query-editor-container" style={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #d9d9d9', 
                        borderRadius: '6px', 
                        padding: '0',
                        width: '100%'
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
                                            { value: 'Changed Date', label: 'Changed Date' },
                                            { value: 'Work Item Type', label: 'Work Item Type' },
                                            { value: 'State', label: 'State' },
                                            { value: 'Asset ID', label: 'Asset ID' },
                                            { value: 'Asset Name', label: 'Asset Name' },
                                            { value: 'Category', label: 'Category' },
                                            { value: 'Location', label: 'Location' }
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
                </div>
            </div>


            {/* Report Content */}
            <div className="card custom-shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">Asset Master Summary</h5>
                    </div>

                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Total Assets</h6>
                                    <h4 className="text-primary">2,847</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Deployed Assets</h6>
                                    <h4 className="text-success">2,156</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">In Stock</h6>
                                    <h4 className="text-info">691</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Under Maintenance</h6>
                                    <h4 className="text-warning">45</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Master Summary Table */}
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>S.No</th>
                                    <th>Asset ID</th>
                                    <th>Asset Name</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                    <th>Location</th>
                                    <th>Deployment Date</th>
                                    <th>Current Value</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.assetId}</td>
                                        <td>{item.assetName}</td>
                                        <td>{item.category}</td>
                                        <td>
                                            <Tag 
                                                color={item.status === 'Deployed' ? 'green' : item.status === 'In Stock' ? 'blue' : 'orange'}
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    backgroundColor: item.status === 'Deployed' ? '#f6ffed' : item.status === 'In Stock' ? '#e6f7ff' : '#fff7e6',
                                                    color: item.status === 'Deployed' ? '#52c41a' : item.status === 'In Stock' ? '#1890ff' : '#fa8c16',
                                                    borderColor: item.status === 'Deployed' ? '#b7eb8f' : item.status === 'In Stock' ? '#91d5ff' : '#ffd591'
                                                }}
                                            >
                                                {item.status}
                                            </Tag>
                                        </td>
                                        <td>{item.location}</td>
                                        <td>{formatDateForDisplay(item.deploymentDate) || '-'}</td>
                                        <td>₹{item.currentValue}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button className="" style={{backgroundColor: '#87CEEB !important', borderColor: '#87CEEB !important', color: 'white !important', border: '1px solid #87CEEB', borderRadius: '4px', padding: '6px 12px', fontSize: '12px'}} title="View">
                                                    <EyeOutlined />
                                                </button>
                                                <button className="" style={{backgroundColor: '#87CEEB !important', borderColor: '#87CEEB !important', color: 'white !important', border: '1px solid #87CEEB', borderRadius: '4px', padding: '6px 12px', fontSize: '12px'}} title="Edit">
                                                    <EditOutlined />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Drawer for Asset Form */}
            <div className={`offcanvas offcanvas-end ${drawerOpen ? 'show' : ''}`} tabIndex="-1" style={{ visibility: drawerOpen ? 'visible' : 'hidden' }}>
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Asset Details</h5>
                    <button type="button" className="btn-close" onClick={toggleDrawer}></button>
                </div>
                <div className="offcanvas-body">
                    <form>
                        {/* Asset Details */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">Asset Details</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Asset ID <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., AST-001"
                                        value={formData.assetId}
                                        onChange={(e) => handleInputChange('assetId', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Asset Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Dell OptiPlex 7090"
                                        value={formData.assetName}
                                        onChange={(e) => handleInputChange('assetName', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Category <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        value={formData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                    >
                                        <option value="">Select category</option>
                                        <option value="IT Equipment">IT Equipment</option>
                                        <option value="Network Equipment">Network Equipment</option>
                                        <option value="Office Equipment">Office Equipment</option>
                                        <option value="Furniture">Furniture</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Subcategory</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Desktop, Switch, Printer"
                                        value={formData.subcategory}
                                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Manufacturer</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Dell, Cisco, HP"
                                        value={formData.manufacturer}
                                        onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Model</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., OptiPlex 7090"
                                        value={formData.model}
                                        onChange={(e) => handleInputChange('model', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Serial Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., DL7090001"
                                        value={formData.serialNumber}
                                        onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Location <span className="text-danger">*</span></label>
                                    <LocationsDropdown
                                        value={formData.location}
                                        onChange={(value) => handleInputChange('location', value)}
                                        placeholder="Select location"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Status <span className="text-danger">*</span></label>
                                    <StatusNamesDropdown
                                        value={formData.status}
                                        onChange={(value) => handleInputChange('status', value)}
                                        placeholder="Select status"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Current Value (₹) <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g., 75000"
                                        value={formData.currentValue}
                                        onChange={(e) => handleInputChange('currentValue', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Deployment Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.deploymentDate}
                                        onChange={(e) => handleInputChange('deploymentDate', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Assigned To</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., John Doe"
                                        value={formData.assignedTo}
                                        onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Department</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., IT Department"
                                        value={formData.department}
                                        onChange={(e) => handleInputChange('department', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="e.g., Primary workstation"
                                        value={formData.remarks}
                                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Action Buttons */}
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="fw-semibold" style={{backgroundColor: '#87CEEB !important', borderColor: '#87CEEB !important', color: 'white !important', border: '1px solid #87CEEB', borderRadius: '4px', padding: '8px 16px'}} onClick={toggleDrawer}>
                                <CloseOutlined className="me-2" />
                                Cancel
                            </button>
                            <button type="button" className="fw-semibold" style={{backgroundColor: '#87CEEB !important', borderColor: '#87CEEB !important', color: 'white !important', border: '1px solid #87CEEB', borderRadius: '4px', padding: '8px 16px'}} onClick={submitForm}>
                                <SaveOutlined className="me-2" />
                                Save Asset
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Backdrop for drawer */}
            {drawerOpen && (
                <div className="offcanvas-backdrop fade show" onClick={toggleDrawer}></div>
            )}
        </div>
    );
};

export default AssetMasterSummaryReport;
