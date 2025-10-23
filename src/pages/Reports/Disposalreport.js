


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { Tag, DatePicker, InputNumber, Select, Button, Space, Collapse, Input } from 'antd';
import { DownloadOutlined, FilterOutlined, SearchOutlined, CalendarOutlined, LineChartOutlined, SaveOutlined, CloseOutlined, PlusOutlined, EditOutlined, EyeOutlined, DeleteOutlined, ArrowLeftOutlined, SortAscendingOutlined, SortDescendingOutlined, HolderOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const Disposalreport = () => {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    
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
        quantityDisposed: {
            operator: '=',
            value: null
        },
        scrapValue: {
            operator: '=',
            value: null
        },
        totalScrapValue: {
            operator: '=',
            value: null
        },
        // Date range filters
        purchaseDateRange: null,
        disposalDateRange: null,
        approvalDateRange: null,
        verificationDateRange: null,
        // Text filters
        assetId: '',
        assetName: '',
        location: '',
        custodian: '',
        disposalReason: '',
        disposalMethod: '',
        assetCondition: '',
        approvedBy: '',
        verifiedBy: '',
        // Multi-select filters
        categories: [],
        statuses: [],
        disposalReasons: [],
        disposalMethods: [],
        assetConditions: [],
        approvalStatuses: []
    });
    const [formData, setFormData] = useState({
        // 1. Asset Details
        assetId: '',
        assetName: '',
        assetCategory: '',
        assetSubcategory: '',
        locationSite: '',
        custodian: '',

        // 2. Disposal Details
        disposalId: '',
        disposalDate: '',
        disposalReason: '',
        approvalStatus: '',
        approvedBy: '',
        approvalDate: '',

        // 3. Verification & Audit
        verifiedBy: '',
        verificationDate: '',
        assetCondition: '',
        serialBatchNumbers: '',

        // 4. Disposal Execution
        disposalMethod: '',
        quantityDisposed: '',
        scrapValue: '0.00',
        remarks: '',

        // 5. Summary & Reporting
        totalAssetsDisposed: '',
        totalScrapValue: '0.00',
        pendingDisposal: '',
        complianceNotes: ''
    });

    // Sample data for the disposal table
    const [tableData, setTableData] = useState([
        {
            id: 4,
            assetId: 'BLR-IT-LTP-2024-0001',
            assetName: 'HP Latitude Laptop',
            category: 'Laptop',
            type: 'IT Equipment',
            location: 'Hyderabad Office',
            status: 'Disposed',
            purchaseDate: '2023-10-05T18:30:00.000Z',
            disposalDate: '2024-12-15T18:30:00.000Z',
            disposalReason: 'End of Life',
            disposalMethod: 'Recycled',
            quantityDisposed: 1,
            scrapValue: 5000,
            totalScrapValue: 5000,
            assetCondition: 'Damaged',
            approvedBy: 'John Smith',
            approvalDate: '2024-12-10T18:30:00.000Z',
            verifiedBy: 'Jane Doe',
            verificationDate: '2024-12-12T18:30:00.000Z',
            custodian: 'IT Department',
            approvalStatus: 'Approved'
        },
        {
            id: 1,
            assetId: 'BLR-IT-DTP-2024-0002',
            assetName: 'Dell Desktop Computer',
            category: 'Desktop',
            type: 'IT Equipment',
            location: 'Mumbai Office',
            status: 'Disposed',
            purchaseDate: '2022-06-14T18:30:00.000Z',
            disposalDate: '2024-11-20T18:30:00.000Z',
            disposalReason: 'Obsolete',
            disposalMethod: 'Sold',
            quantityDisposed: 2,
            scrapValue: 8000,
            totalScrapValue: 16000,
            assetCondition: 'Good',
            approvedBy: 'Mike Johnson',
            approvalDate: '2024-11-15T18:30:00.000Z',
            verifiedBy: 'Sarah Wilson',
            verificationDate: '2024-11-18T18:30:00.000Z',
            custodian: 'IT Department',
            approvalStatus: 'Approved'
        },
        {
            id: 3,
            assetId: 'BLR-ADM-FUR-2024-0003',
            assetName: 'Office Chair',
            category: 'Office Furniture',
            type: 'Furniture',
            location: 'Delhi Office',
            status: 'Pending Disposal',
            purchaseDate: '2021-03-10T18:30:00.000Z',
            disposalDate: null,
            disposalReason: 'Damaged',
            disposalMethod: 'Recycled',
            quantityDisposed: 5,
            scrapValue: 2000,
            totalScrapValue: 10000,
            assetCondition: 'Damaged',
            approvedBy: 'Tom Brown',
            approvalDate: '2024-12-01T18:30:00.000Z',
            verifiedBy: 'Lisa Davis',
            verificationDate: '2024-12-03T18:30:00.000Z',
            custodian: 'Admin Department',
            approvalStatus: 'Pending'
        },
        {
            id: 5,
            assetId: 'BLR-IT-SWT-2024-0004',
            assetName: 'Network Switch',
            category: 'Network Equipment',
            type: 'IT Equipment',
            location: 'Bangalore Office',
            status: 'Disposed',
            purchaseDate: '2020-08-20T18:30:00.000Z',
            disposalDate: '2024-10-30T18:30:00.000Z',
            disposalReason: 'Upgrade',
            disposalMethod: 'Donated',
            quantityDisposed: 1,
            scrapValue: 0,
            totalScrapValue: 0,
            assetCondition: 'Good',
            approvedBy: 'Alex Chen',
            approvalDate: '2024-10-25T18:30:00.000Z',
            verifiedBy: 'Emma Taylor',
            verificationDate: '2024-10-28T18:30:00.000Z',
            custodian: 'Network Team',
            approvalStatus: 'Approved'
        }
    ]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
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
                value: value ? parseFloat(value) : null
            }
        }));
    };

    const clearAllFilters = () => {
        setAdvancedFilters({
            quantityDisposed: { operator: '=', value: null },
            scrapValue: { operator: '=', value: null },
            totalScrapValue: { operator: '=', value: null },
            purchaseDateRange: null,
            disposalDateRange: null,
            approvalDateRange: null,
            verificationDateRange: null,
            assetId: '',
            assetName: '',
            location: '',
            custodian: '',
            disposalReason: '',
            disposalMethod: '',
            assetCondition: '',
            approvedBy: '',
            verifiedBy: '',
            categories: [],
            statuses: [],
            disposalReasons: [],
            disposalMethods: [],
            assetConditions: [],
            approvalStatuses: []
        });
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedStatus('');
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

    // Helper function to safely convert date range to dayjs objects
    const getDateRangeValue = (dateRange) => {
        if (!dateRange || !Array.isArray(dateRange) || dateRange.length !== 2) {
            return null;
        }
        try {
            const startDate = dayjs(dateRange[0]);
            const endDate = dayjs(dateRange[1]);
            if (startDate.isValid() && endDate.isValid()) {
                return [startDate, endDate];
            }
        } catch (error) {
            console.warn('Date range conversion error:', error);
        }
        return null;
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
                        fieldValue = item.purchaseDate || '';
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

    const applyNumericFilter = (value, filter) => {
        if (!filter.value && filter.value !== 0) return true;
        
        const numValue = parseFloat(value) || 0;
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
        if (!dateRange || !dateValue) return true;
        
        try {
            const date = dayjs(dateValue);
            const startDate = dateRange[0];
            const endDate = dateRange[1];
            
            if (!date.isValid()) return true;
            
            if (!startDate && !endDate) return true;
            if (startDate && !endDate) return date.isAfter(startDate) || date.isSame(startDate);
            if (!startDate && endDate) return date.isBefore(endDate) || date.isSame(endDate);
            
            return date.isBetween(startDate, endDate, 'day', '[]');
        } catch (error) {
            console.warn('Date filter error:', error);
            return true;
        }
    };

    const saveAsDraft = () => {
        console.log('Saving as draft:', formData);
        setDrawerOpen(false);
    };

    const submitForm = () => {
        console.log('Submitting form:', formData);
        // Add new asset record to table data
        const newAsset = {
            id: tableData.length + 1,
            assetId: formData.assetId,
            assetName: formData.assetName,
            category: formData.assetCategory,
            type: formData.assetSubcategory,
            location: formData.locationSite,
            status: 'Active',
            purchaseDate: new Date().toISOString()
        };
        setTableData(prev => [...prev, newAsset]);
        setDrawerOpen(false);
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
                item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase());

            // Basic category and status filters
            const matchesCategory = selectedCategory === '' || item.category === selectedCategory;
            const matchesStatus = selectedStatus === '' || item.status === selectedStatus;

            // Advanced filters
            const matchesNumericFilters = 
                applyNumericFilter(item.quantityDisposed, advancedFilters.quantityDisposed) &&
                applyNumericFilter(item.scrapValue, advancedFilters.scrapValue) &&
                applyNumericFilter(item.totalScrapValue, advancedFilters.totalScrapValue);

            const matchesDateRangeFilters = 
                applyDateRangeFilter(item.purchaseDate, advancedFilters.purchaseDateRange) &&
                applyDateRangeFilter(item.disposalDate, advancedFilters.disposalDateRange) &&
                applyDateRangeFilter(item.approvalDate, advancedFilters.approvalDateRange) &&
                applyDateRangeFilter(item.verificationDate, advancedFilters.verificationDateRange);

            const matchesTextFilters = 
                (advancedFilters.assetId === '' || item.assetId.toLowerCase().includes(advancedFilters.assetId.toLowerCase())) &&
                (advancedFilters.assetName === '' || item.assetName.toLowerCase().includes(advancedFilters.assetName.toLowerCase())) &&
                (advancedFilters.location === '' || item.location.toLowerCase().includes(advancedFilters.location.toLowerCase())) &&
                (advancedFilters.custodian === '' || (item.custodian && item.custodian.toLowerCase().includes(advancedFilters.custodian.toLowerCase()))) &&
                (advancedFilters.disposalReason === '' || (item.disposalReason && item.disposalReason.toLowerCase().includes(advancedFilters.disposalReason.toLowerCase()))) &&
                (advancedFilters.disposalMethod === '' || (item.disposalMethod && item.disposalMethod.toLowerCase().includes(advancedFilters.disposalMethod.toLowerCase()))) &&
                (advancedFilters.assetCondition === '' || (item.assetCondition && item.assetCondition.toLowerCase().includes(advancedFilters.assetCondition.toLowerCase()))) &&
                (advancedFilters.approvedBy === '' || (item.approvedBy && item.approvedBy.toLowerCase().includes(advancedFilters.approvedBy.toLowerCase()))) &&
                (advancedFilters.verifiedBy === '' || (item.verifiedBy && item.verifiedBy.toLowerCase().includes(advancedFilters.verifiedBy.toLowerCase())));

            const matchesMultiSelectFilters = 
                (advancedFilters.categories.length === 0 || advancedFilters.categories.includes(item.category)) &&
                (advancedFilters.statuses.length === 0 || advancedFilters.statuses.includes(item.status)) &&
                (advancedFilters.disposalReasons.length === 0 || (item.disposalReason && advancedFilters.disposalReasons.includes(item.disposalReason))) &&
                (advancedFilters.disposalMethods.length === 0 || (item.disposalMethod && advancedFilters.disposalMethods.includes(item.disposalMethod))) &&
                (advancedFilters.assetConditions.length === 0 || (item.assetCondition && advancedFilters.assetConditions.includes(item.assetCondition))) &&
                (advancedFilters.approvalStatuses.length === 0 || (item.approvalStatus && advancedFilters.approvalStatuses.includes(item.approvalStatus)));

            return matchesSearch && matchesCategory && matchesStatus && 
                   matchesNumericFilters && matchesDateRangeFilters && 
                   matchesTextFilters && matchesMultiSelectFilters;
        })
        .sort((a, b) => {
            if (!sortField) return 0;

            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle numeric values
            if (sortField.includes('value') || sortField.includes('date')) {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <div className="container-fluid p-1">
            {/* Top Navigation Bar */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <button
                    className="fw-semibold"
                    style={{backgroundColor: '#87CEEB !important', borderColor: '#87CEEB !important', color: 'white !important', border: '1px solid #87CEEB', borderRadius: '4px', padding: '8px 16px'}}
                    onClick={() => navigate('/reports')}
                >
                    <ArrowLeftOutlined className="me-2" />
                    Back to Reports
                </button>
                <CustomBreadcrumb />
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
                                Add Disposal Record
                            </button>
                            <button className="fw-semibold" style={{backgroundColor: '#87CEEB !important', borderColor: '#87CEEB !important', color: 'white !important', border: '1px solid #87CEEB', borderRadius: '4px', padding: '8px 16px'}}>
                                <DownloadOutlined className="me-2" />
                                Export Report
                            </button>
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

            {/* Advanced Filters Panel */}
            {advancedFiltersOpen && (
                <div className="card custom-shadow mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold mb-3">
                                <FilterOutlined className="me-2" />
                                Advanced Filters
                        </h6>
                        
                        <Collapse defaultActiveKey={['1', '2', '3', '4']} ghost>
                            {/* Numeric Filters */}
                            <Collapse.Panel header="Numeric Filters" key="1">
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Quantity Disposed</label>
                                        <div className="d-flex gap-2">
                                            <Select
                                                value={advancedFilters.quantityDisposed.operator}
                                                onChange={(value) => handleNumericFilterChange('quantityDisposed', value, advancedFilters.quantityDisposed.value)}
                                                style={{ width: 80 }}
                                                options={[
                                                    { value: '=', label: '=' },
                                                    { value: '>', label: '>' },
                                                    { value: '<', label: '<' },
                                                    { value: '>=', label: '>=' },
                                                    { value: '<=', label: '<=' },
                                                    { value: '!=', label: '!=' }
                                                ]}
                                            />
                                            <InputNumber
                                                value={advancedFilters.quantityDisposed.value}
                                                onChange={(value) => handleNumericFilterChange('quantityDisposed', advancedFilters.quantityDisposed.operator, value)}
                                                placeholder="Value"
                                                style={{ flex: 1 }}
                                            />
                        </div>
                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Scrap Value (₹)</label>
                                        <div className="d-flex gap-2">
                                            <Select
                                                value={advancedFilters.scrapValue.operator}
                                                onChange={(value) => handleNumericFilterChange('scrapValue', value, advancedFilters.scrapValue.value)}
                                                style={{ width: 80 }}
                                                options={[
                                                    { value: '=', label: '=' },
                                                    { value: '>', label: '>' },
                                                    { value: '<', label: '<' },
                                                    { value: '>=', label: '>=' },
                                                    { value: '<=', label: '<=' },
                                                    { value: '!=', label: '!=' }
                                                ]}
                                            />
                                            <InputNumber
                                                value={advancedFilters.scrapValue.value}
                                                onChange={(value) => handleNumericFilterChange('scrapValue', advancedFilters.scrapValue.operator, value)}
                                                placeholder="Value"
                                                style={{ flex: 1 }}
                                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                                            />
                </div>
            </div>
                                    <div className="col-md-4">
                                        <label className="form-label fw-semibold">Total Scrap Value (₹)</label>
                                        <div className="d-flex gap-2">
                                            <Select
                                                value={advancedFilters.totalScrapValue.operator}
                                                onChange={(value) => handleNumericFilterChange('totalScrapValue', value, advancedFilters.totalScrapValue.value)}
                                                style={{ width: 80 }}
                                                options={[
                                                    { value: '=', label: '=' },
                                                    { value: '>', label: '>' },
                                                    { value: '<', label: '<' },
                                                    { value: '>=', label: '>=' },
                                                    { value: '<=', label: '<=' },
                                                    { value: '!=', label: '!=' }
                                                ]}
                                            />
                                            <InputNumber
                                                value={advancedFilters.totalScrapValue.value}
                                                onChange={(value) => handleNumericFilterChange('totalScrapValue', advancedFilters.totalScrapValue.operator, value)}
                                                placeholder="Value"
                                                style={{ flex: 1 }}
                                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Collapse.Panel>

                            {/* Date Range Filters */}
                            <Collapse.Panel header="Date Range Filters" key="2">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Purchase Date Range</label>
                                        <DatePicker.RangePicker
                                            value={getDateRangeValue(advancedFilters.purchaseDateRange)}
                                            onChange={(dates) => handleAdvancedFilterChange('purchaseDateRange', dates)}
                                            style={{ width: '100%' }}
                                            placeholder={['From', 'To']}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Disposal Date Range</label>
                                        <DatePicker.RangePicker
                                            value={getDateRangeValue(advancedFilters.disposalDateRange)}
                                            onChange={(dates) => handleAdvancedFilterChange('disposalDateRange', dates)}
                                            style={{ width: '100%' }}
                                            placeholder={['From', 'To']}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Approval Date Range</label>
                                        <DatePicker.RangePicker
                                            value={getDateRangeValue(advancedFilters.approvalDateRange)}
                                            onChange={(dates) => handleAdvancedFilterChange('approvalDateRange', dates)}
                                            style={{ width: '100%' }}
                                            placeholder={['From', 'To']}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Verification Date Range</label>
                                        <DatePicker.RangePicker
                                            value={getDateRangeValue(advancedFilters.verificationDateRange)}
                                            onChange={(dates) => handleAdvancedFilterChange('verificationDateRange', dates)}
                                            style={{ width: '100%' }}
                                            placeholder={['From', 'To']}
                                        />
                                    </div>
                                </div>
                            </Collapse.Panel>

                            {/* Text Filters */}
                            <Collapse.Panel header="Text Filters" key="3">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Asset ID</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Asset ID"
                                            value={advancedFilters.assetId}
                                            onChange={(e) => handleAdvancedFilterChange('assetId', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Asset Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Asset Name"
                                            value={advancedFilters.assetName}
                                            onChange={(e) => handleAdvancedFilterChange('assetName', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Location"
                                            value={advancedFilters.location}
                                            onChange={(e) => handleAdvancedFilterChange('location', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Custodian</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Custodian"
                                            value={advancedFilters.custodian}
                                            onChange={(e) => handleAdvancedFilterChange('custodian', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Disposal Reason</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Disposal Reason"
                                            value={advancedFilters.disposalReason}
                                            onChange={(e) => handleAdvancedFilterChange('disposalReason', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Disposal Method</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Disposal Method"
                                            value={advancedFilters.disposalMethod}
                                            onChange={(e) => handleAdvancedFilterChange('disposalMethod', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Asset Condition</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Asset Condition"
                                            value={advancedFilters.assetCondition}
                                            onChange={(e) => handleAdvancedFilterChange('assetCondition', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Approved By</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Approved By"
                                            value={advancedFilters.approvedBy}
                                            onChange={(e) => handleAdvancedFilterChange('approvedBy', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </Collapse.Panel>

                            {/* Multi-Select Filters */}
                            <Collapse.Panel header="Multi-Select Filters" key="4">
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Categories</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Categories"
                                            value={advancedFilters.categories}
                                            onChange={(value) => handleAdvancedFilterChange('categories', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Laptop', label: 'Laptop' },
                                                { value: 'Desktop', label: 'Desktop' },
                                                { value: 'Office Furniture', label: 'Office Furniture' },
                                                { value: 'Network Equipment', label: 'Network Equipment' },
                                                { value: 'IT Equipment', label: 'IT Equipment' }
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Statuses</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Statuses"
                                            value={advancedFilters.statuses}
                                            onChange={(value) => handleAdvancedFilterChange('statuses', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Disposed', label: 'Disposed' },
                                                { value: 'Pending Disposal', label: 'Pending Disposal' },
                                                { value: 'Active', label: 'Active' },
                                                { value: 'Inactive', label: 'Inactive' }
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Disposal Reasons</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Disposal Reasons"
                                            value={advancedFilters.disposalReasons}
                                            onChange={(value) => handleAdvancedFilterChange('disposalReasons', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'End of Life', label: 'End of Life' },
                                                { value: 'Obsolete', label: 'Obsolete' },
                                                { value: 'Damaged', label: 'Damaged' },
                                                { value: 'Upgrade', label: 'Upgrade' }
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Disposal Methods</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Disposal Methods"
                                            value={advancedFilters.disposalMethods}
                                            onChange={(value) => handleAdvancedFilterChange('disposalMethods', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Recycled', label: 'Recycled' },
                                                { value: 'Sold', label: 'Sold' },
                                                { value: 'Destroyed', label: 'Destroyed' },
                                                { value: 'Donated', label: 'Donated' }
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Asset Conditions</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Asset Conditions"
                                            value={advancedFilters.assetConditions}
                                            onChange={(value) => handleAdvancedFilterChange('assetConditions', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Good', label: 'Good' },
                                                { value: 'Damaged', label: 'Damaged' },
                                                { value: 'Non-Functional', label: 'Non-Functional' }
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Approval Statuses</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Approval Statuses"
                                            value={advancedFilters.approvalStatuses}
                                            onChange={(value) => handleAdvancedFilterChange('approvalStatuses', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Approved', label: 'Approved' },
                                                { value: 'Pending', label: 'Pending' },
                                                { value: 'Rejected', label: 'Rejected' }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </Collapse.Panel>
                        </Collapse>
                    </div>
                </div>
            )}

            {/* Main Heading */}
            <div className="mb-4">
                <h2 className="fw-bold mb-0">Asset Disposal Report</h2>
                <p className="text-muted mb-0">Track and manage asset disposal processes with comprehensive audit trails</p>
            </div>

            {/* Data Table */}
            <div className="card custom-shadow">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Asset ID</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('assetId')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'assetId' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <SearchOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Asset Name</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('assetName')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'assetName' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <SearchOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Category</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('category')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'category' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <SearchOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Type</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('type')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'type' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <SearchOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Location</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('location')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'location' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <SearchOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Status</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('status')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'status' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <FilterOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Purchase Date</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('purchaseDate')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'purchaseDate' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <SearchOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Disposal Date</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('disposalDate')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'disposalDate' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <SearchOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Disposal Reason</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('disposalReason')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'disposalReason' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <SearchOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span>Scrap Value (₹)</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('scrapValue')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'scrapValue' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <SearchOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((asset) => (
                                    <tr key={asset.id}>
                                        <td>{asset.assetId}</td>
                                        <td>{asset.assetName}</td>
                                        <td>{asset.category}</td>
                                        <td>{asset.type}</td>
                                        <td>{asset.location}</td>
                                        <td>
                                            <Tag 
                                                color={asset.status === 'Disposed' ? 'green' : asset.status === 'Pending Disposal' ? 'orange' : 'red'}
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    backgroundColor: asset.status === 'Disposed' ? '#f6ffed' : asset.status === 'Pending Disposal' ? '#fff7e6' : '#fff2f0',
                                                    color: asset.status === 'Disposed' ? '#52c41a' : asset.status === 'Pending Disposal' ? '#fa8c16' : '#ff4d4f',
                                                    borderColor: asset.status === 'Disposed' ? '#b7eb8f' : asset.status === 'Pending Disposal' ? '#ffd591' : '#ffccc7'
                                                }}
                                            >
                                                {asset.status}
                                            </Tag>
                                        </td>
                                        <td>{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                                        <td>{asset.disposalDate ? new Date(asset.disposalDate).toLocaleDateString() : '-'}</td>
                                        <td>{asset.disposalReason || '-'}</td>
                                        <td>
                                            {asset.scrapValue ? `₹${asset.scrapValue.toLocaleString()}` : '-'}
                                        </td>
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

            {/* Drawer for Asset Details Form */}
            <div className={`offcanvas offcanvas-end ${drawerOpen ? 'show' : ''}`} tabIndex="-1" style={{ visibility: drawerOpen ? 'visible' : 'hidden' }}>
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Asset Disposal Details</h5>
                    <button type="button" className="btn-close" onClick={toggleDrawer}></button>
                </div>
                <div className="offcanvas-body">
                    <form>
                        {/* 1. Asset Details */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">1. Asset Details</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Asset ID <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter asset ID"
                                        value={formData.assetId}
                                        onChange={(e) => handleInputChange('assetId', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Asset Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Huawei OLT MA5800"
                                        value={formData.assetName}
                                        onChange={(e) => handleInputChange('assetName', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Asset Category <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        value={formData.assetCategory}
                                        onChange={(e) => handleInputChange('assetCategory', e.target.value)}
                                    >
                                        <option value="">Select category</option>
                                        <option value="Telecom">Telecom</option>
                                        <option value="IT">IT</option>
                                        <option value="Power">Power</option>
                                        <option value="Civil">Civil</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Asset Subcategory</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., OLT, Server, Battery"
                                        value={formData.assetSubcategory}
                                        onChange={(e) => handleInputChange('assetSubcategory', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Location / Site</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., POP - Chennai North"
                                        value={formData.locationSite}
                                        onChange={(e) => handleInputChange('locationSite', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Custodian</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Field O&M Team"
                                        value={formData.custodian}
                                        onChange={(e) => handleInputChange('custodian', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Disposal Details */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">2. Disposal Details</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Disposal ID <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., DISP-2025-001"
                                        value={formData.disposalId}
                                        onChange={(e) => handleInputChange('disposalId', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Disposal Date <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.disposalDate}
                                        onChange={(e) => handleInputChange('disposalDate', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Disposal Reason <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        value={formData.disposalReason}
                                        onChange={(e) => handleInputChange('disposalReason', e.target.value)}
                                    >
                                        <option value="">Select reason</option>
                                        <option value="End of Life">End of Life</option>
                                        <option value="Damaged">Damaged</option>
                                        <option value="Obsolete">Obsolete</option>
                                        <option value="Upgrade">Upgrade</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Approval Status</label>
                                    <select
                                        className="form-select"
                                        value={formData.approvalStatus}
                                        onChange={(e) => handleInputChange('approvalStatus', e.target.value)}
                                    >
                                        <option value="">Select status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Approved By</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., O&M Manager"
                                        value={formData.approvedBy}
                                        onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Approval Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.approvalDate}
                                        onChange={(e) => handleInputChange('approvalDate', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Verification & Audit */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">3. Verification & Audit</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Verified By</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Audit Officer - R. Kumar"
                                        value={formData.verifiedBy}
                                        onChange={(e) => handleInputChange('verifiedBy', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Verification Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.verificationDate}
                                        onChange={(e) => handleInputChange('verificationDate', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Asset Condition</label>
                                    <select
                                        className="form-select"
                                        value={formData.assetCondition}
                                        onChange={(e) => handleInputChange('assetCondition', e.target.value)}
                                    >
                                        <option value="">Select condition</option>
                                        <option value="Good">Good</option>
                                        <option value="Damaged">Damaged</option>
                                        <option value="Non-Functional">Non-Functional</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Serial / Batch Numbers</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                                placeholder="e.g., ASSET-TEL-000123 to 000130"
                                        value={formData.serialBatchNumbers}
                                        onChange={(e) => handleInputChange('serialBatchNumbers', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Disposal Execution */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">4. Disposal Execution</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Disposal Method <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select"
                                        value={formData.disposalMethod}
                                        onChange={(e) => handleInputChange('disposalMethod', e.target.value)}
                                    >
                                        <option value="">Select method</option>
                                        <option value="Recycled">Recycled</option>
                                        <option value="Sold">Sold</option>
                                        <option value="Destroyed">Destroyed</option>
                                        <option value="Donated">Donated</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Quantity Disposed</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g., 8"
                                        value={formData.quantityDisposed}
                                        onChange={(e) => handleInputChange('quantityDisposed', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Scrap Value (₹)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g., 12,000"
                                        value={formData.scrapValue}
                                        onChange={(e) => handleInputChange('scrapValue', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="e.g., Batteries recycled separately"
                                        value={formData.remarks}
                                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* 5. Summary & Reporting */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">5. Summary & Reporting</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Total Assets Disposed</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g., 8"
                                        value={formData.totalAssetsDisposed}
                                        onChange={(e) => handleInputChange('totalAssetsDisposed', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Total Scrap Value (₹)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g., 12,000"
                                        value={formData.totalScrapValue}
                                        onChange={(e) => handleInputChange('totalScrapValue', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Pending Disposal</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g., 2"
                                        value={formData.pendingDisposal}
                                        onChange={(e) => handleInputChange('pendingDisposal', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Compliance Notes</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="e.g., Hazardous material compliance done"
                                        value={formData.complianceNotes}
                                        onChange={(e) => handleInputChange('complianceNotes', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Key Features / Analytics */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">Key Features / Analytics</h6>
                            <div className="alert alert-info">
                                <ul className="mb-0">
                                    <li><strong>Pending Disposal Tracking:</strong> Identify approved assets yet to be physically scrapped.</li>
                                    <li><strong>Scrap Value Summary:</strong> Track revenue or cost recovered from disposal.</li>
                                    <li><strong>Asset Category Analysis:</strong> Highlight which asset types are retired most frequently.</li>
                                    <li><strong>Audit & Compliance:</strong> Maintain verification records for legal and financial audits.</li>
                                    <li><strong>Trend Analysis:</strong> Monthly/quarterly scrap trends for asset lifecycle planning.</li>
                                </ul>
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
                                Save Disposal Record
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

export default Disposalreport;
