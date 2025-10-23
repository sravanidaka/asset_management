import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { Tag, DatePicker, InputNumber, Select, Button, Space, Collapse, Input } from 'antd';
import { DownloadOutlined, FilterOutlined, SearchOutlined, CalendarOutlined, LineChartOutlined, ClockOutlined, ArrowLeftOutlined, SortAscendingOutlined, SortDescendingOutlined, HolderOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CloseOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const InventoryAgingReport = () => {
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
        quantityInStock: {
            operator: '=',
            value: null
        },
        unitCost: {
            operator: '=',
            value: null
        },
        totalValue: {
            operator: '=',
            value: null
        },
        ageDays: {
            operator: '=',
            value: null
        },
        // Date range filters
        receivedDateRange: null,
        // Text filters
        itemCode: '',
        itemDescription: '',
        subcategory: '',
        uom: '',
        grnReceiptNo: '',
        warehouseLocation: '',
        vendorName: '',
        actionPlan: '',
        remarks: '',
        // Multi-select filters
        categories: [],
        statuses: [],
        ageingBuckets: [],
        actionPlans: [],
        uoms: []
    });
    const [formData, setFormData] = useState({
        // 1. Item Details
        itemCode: '',
        itemDescription: '',
        assetCategory: '',
        subcategory: '',
        uom: '',

        // 2. Stock Info
        quantityInStock: '',
        unitCost: '0.00',
        totalValue: '0.00',

        // 3. Receipt Details
        grnReceiptNo: '',
        receivedDate: '',
        ageDays: '',
        ageingBucket: '',
        warehouseLocation: '',
        vendorName: '',

        // 4. Insights
        movementStatus: '',
        actionPlan: '',
        remarks: ''
    });

    // Filter functions - defined first to avoid hoisting issues
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
            quantityInStock: { operator: '=', value: null },
            unitCost: { operator: '=', value: null },
            totalValue: { operator: '=', value: null },
            ageDays: { operator: '=', value: null },
            receivedDateRange: null,
            itemCode: '',
            itemDescription: '',
            subcategory: '',
            uom: '',
            grnReceiptNo: '',
            warehouseLocation: '',
            vendorName: '',
            actionPlan: '',
            remarks: '',
            categories: [],
            statuses: [],
            ageingBuckets: [],
            actionPlans: [],
            uoms: []
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
            field: 'Item Code',
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
                        fieldValue = item.receivedDate || '';
                        break;
                    case 'Work Item Type':
                        fieldValue = item.assetCategory || '';
                        break;
                    case 'State':
                        fieldValue = item.movementStatus || '';
                        break;
                    case 'Item Code':
                        fieldValue = item.itemCode || '';
                        break;
                    case 'Item Description':
                        fieldValue = item.itemDescription || '';
                        break;
                    case 'Category':
                        fieldValue = item.assetCategory || '';
                        break;
                    case 'Location':
                        fieldValue = item.warehouseLocation || '';
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

    const saveAsDraft = () => {
        console.log('Saving as draft:', formData);
        setDrawerOpen(false);
    };

    const submitForm = () => {
        console.log('Submitting form:', formData);
        // Add new inventory item to table data
        const newItem = {
            id: tableData.length + 1,
            itemCode: formData.itemCode,
            itemDescription: formData.itemDescription,
            assetCategory: formData.assetCategory,
            subcategory: formData.subcategory,
            uom: formData.uom,
            quantityInStock: formData.quantityInStock,
            unitCost: formData.unitCost,
            totalValue: formData.totalValue,
            grnReceiptNo: formData.grnReceiptNo,
            receivedDate: formData.receivedDate,
            ageDays: formData.ageDays,
            ageingBucket: formData.ageingBucket,
            warehouseLocation: formData.warehouseLocation,
            vendorName: formData.vendorName,
            movementStatus: formData.movementStatus,
            actionPlan: formData.actionPlan,
            remarks: formData.remarks
        };
        setTableData(prev => [...prev, newItem]);
        setDrawerOpen(false);
    };

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
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

    // Sample data for the inventory aging table
    const [tableData, setTableData] = useState([
        {
            id: 1,
            itemCode: 'MAT-TEL-000451',
            itemDescription: '6F Fiber Patch Cord',
            assetCategory: 'Fiber Accessories',
            subcategory: 'Patch Cord',
            uom: 'Nos',
            quantityInStock: '120',
            unitCost: '250',
            totalValue: '30000',
            grnReceiptNo: 'GRN-2025-1002',
            receivedDate: '2024-07-05',
            ageDays: '100',
            ageingBucket: '>90 Days',
            warehouseLocation: 'Central Store - Hyderabad',
            vendorName: 'Sterlite Tech',
            movementStatus: 'Slow',
            actionPlan: 'Redeploy',
            remarks: 'Awaiting field dispatch'
        },
        {
            id: 2,
            itemCode: 'MAT-IT-000123',
            itemDescription: 'Cat6 Ethernet Cable',
            assetCategory: 'Network Cables',
            subcategory: 'Ethernet Cable',
            uom: 'Meters',
            quantityInStock: '500',
            unitCost: '45',
            totalValue: '22500',
            grnReceiptNo: 'GRN-2025-1003',
            receivedDate: '2024-08-15',
            ageDays: '60',
            ageingBucket: '61-90 Days',
            warehouseLocation: 'Central Store - Mumbai',
            vendorName: 'D-Link India',
            movementStatus: 'Fast',
            actionPlan: 'Use',
            remarks: 'Regular consumption item'
        },
        {
            id: 3,
            itemCode: 'MAT-PWR-000789',
            itemDescription: 'UPS Battery 12V 7Ah',
            assetCategory: 'Power Equipment',
            subcategory: 'Battery',
            uom: 'Nos',
            quantityInStock: '50',
            unitCost: '1200',
            totalValue: '60000',
            grnReceiptNo: 'GRN-2025-1004',
            receivedDate: '2024-06-01',
            ageDays: '135',
            ageingBucket: '>90 Days',
            warehouseLocation: 'Central Store - Delhi',
            vendorName: 'Exide Industries',
            movementStatus: 'Obsolete',
            actionPlan: 'Dispose',
            remarks: 'Battery life expired'
        }
    ]);

    // Filter and sort table data
    const filteredData = applyQueryFilters(tableData)
        .filter(item => {
            // Basic search filter
            const matchesSearch = searchTerm === '' ||
                item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

            // Basic category and status filters
            const matchesCategory = selectedCategory === '' || item.assetCategory === selectedCategory;
            const matchesStatus = selectedStatus === '' || item.movementStatus === selectedStatus;

            // Advanced filters
            const matchesNumericFilters = 
                applyNumericFilter(item.quantityInStock, advancedFilters.quantityInStock) &&
                applyNumericFilter(item.unitCost, advancedFilters.unitCost) &&
                applyNumericFilter(item.totalValue, advancedFilters.totalValue) &&
                applyNumericFilter(item.ageDays, advancedFilters.ageDays);

            const matchesDateRangeFilters = 
                applyDateRangeFilter(item.receivedDate, advancedFilters.receivedDateRange);

            const matchesTextFilters = 
                (advancedFilters.itemCode === '' || item.itemCode.toLowerCase().includes(advancedFilters.itemCode.toLowerCase())) &&
                (advancedFilters.itemDescription === '' || item.itemDescription.toLowerCase().includes(advancedFilters.itemDescription.toLowerCase())) &&
                (advancedFilters.subcategory === '' || (item.subcategory && item.subcategory.toLowerCase().includes(advancedFilters.subcategory.toLowerCase()))) &&
                (advancedFilters.uom === '' || (item.uom && item.uom.toLowerCase().includes(advancedFilters.uom.toLowerCase()))) &&
                (advancedFilters.grnReceiptNo === '' || (item.grnReceiptNo && item.grnReceiptNo.toLowerCase().includes(advancedFilters.grnReceiptNo.toLowerCase()))) &&
                (advancedFilters.warehouseLocation === '' || (item.warehouseLocation && item.warehouseLocation.toLowerCase().includes(advancedFilters.warehouseLocation.toLowerCase()))) &&
                (advancedFilters.vendorName === '' || (item.vendorName && item.vendorName.toLowerCase().includes(advancedFilters.vendorName.toLowerCase()))) &&
                (advancedFilters.actionPlan === '' || (item.actionPlan && item.actionPlan.toLowerCase().includes(advancedFilters.actionPlan.toLowerCase()))) &&
                (advancedFilters.remarks === '' || (item.remarks && item.remarks.toLowerCase().includes(advancedFilters.remarks.toLowerCase())));

            const matchesMultiSelectFilters = 
                (advancedFilters.categories.length === 0 || advancedFilters.categories.includes(item.assetCategory)) &&
                (advancedFilters.statuses.length === 0 || advancedFilters.statuses.includes(item.movementStatus)) &&
                (advancedFilters.ageingBuckets.length === 0 || (item.ageingBucket && advancedFilters.ageingBuckets.includes(item.ageingBucket))) &&
                (advancedFilters.actionPlans.length === 0 || (item.actionPlan && advancedFilters.actionPlans.includes(item.actionPlan))) &&
                (advancedFilters.uoms.length === 0 || (item.uom && advancedFilters.uoms.includes(item.uom)));

            return matchesSearch && matchesCategory && matchesStatus && 
                   matchesNumericFilters && matchesDateRangeFilters && 
                   matchesTextFilters && matchesMultiSelectFilters;
        })
        .sort((a, b) => {
            if (!sortField) return 0;

            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle numeric values
            if (sortField === 'ageDays' || sortField === 'quantityInStock' || sortField === 'unitCost' || sortField === 'totalValue') {
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
                    className="fw-semibold"
                    style={{backgroundColor: '#87CEEB !important', borderColor: '#87CEEB !important', color: 'white !important', border: '1px solid #87CEEB', borderRadius: '4px', padding: '8px 16px'}}
                    onClick={() => navigate('/reports')}
                >
                    <ArrowLeftOutlined className="me-2" />
                    Back to Reports
                </button>
                <CustomBreadcrumb />
            </div>

            {/* Main Heading */}
            <div className="mb-4">
                <h2 className="fw-bold mb-0">Inventory Aging Report</h2>
                <p className="text-muted mb-0">Track and manage inventory aging with comprehensive stock analysis</p>
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
                                Add Inventory Item
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
                                            { value: 'Item Code', label: 'Item Code' },
                                            { value: 'Item Description', label: 'Item Description' },
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
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Quantity in Stock</label>
                                        <div className="d-flex gap-2">
                                            <Select
                                                value={advancedFilters.quantityInStock.operator}
                                                onChange={(value) => handleNumericFilterChange('quantityInStock', value, advancedFilters.quantityInStock.value)}
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
                                                value={advancedFilters.quantityInStock.value}
                                                onChange={(value) => handleNumericFilterChange('quantityInStock', advancedFilters.quantityInStock.operator, value)}
                                                placeholder="Value"
                                                style={{ flex: 1 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Unit Cost (₹)</label>
                                        <div className="d-flex gap-2">
                                            <Select
                                                value={advancedFilters.unitCost.operator}
                                                onChange={(value) => handleNumericFilterChange('unitCost', value, advancedFilters.unitCost.value)}
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
                                                value={advancedFilters.unitCost.value}
                                                onChange={(value) => handleNumericFilterChange('unitCost', advancedFilters.unitCost.operator, value)}
                                                placeholder="Value"
                                                style={{ flex: 1 }}
                                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Total Value (₹)</label>
                                        <div className="d-flex gap-2">
                                            <Select
                                                value={advancedFilters.totalValue.operator}
                                                onChange={(value) => handleNumericFilterChange('totalValue', value, advancedFilters.totalValue.value)}
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
                                                value={advancedFilters.totalValue.value}
                                                onChange={(value) => handleNumericFilterChange('totalValue', advancedFilters.totalValue.operator, value)}
                                                placeholder="Value"
                                                style={{ flex: 1 }}
                                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={value => value.replace(/₹\s?|(,*)/g, '')}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Age (Days)</label>
                                        <div className="d-flex gap-2">
                                            <Select
                                                value={advancedFilters.ageDays.operator}
                                                onChange={(value) => handleNumericFilterChange('ageDays', value, advancedFilters.ageDays.value)}
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
                                                value={advancedFilters.ageDays.value}
                                                onChange={(value) => handleNumericFilterChange('ageDays', advancedFilters.ageDays.operator, value)}
                                                placeholder="Value"
                                                style={{ flex: 1 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Collapse.Panel>

                            {/* Date Range Filters */}
                            <Collapse.Panel header="Date Range Filters" key="2">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">Received Date Range</label>
                                        <DatePicker.RangePicker
                                            value={getDateRangeValue(advancedFilters.receivedDateRange)}
                                            onChange={(dates) => handleAdvancedFilterChange('receivedDateRange', dates)}
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
                                        <label className="form-label fw-semibold">Item Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Item Code"
                                            value={advancedFilters.itemCode}
                                            onChange={(e) => handleAdvancedFilterChange('itemCode', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Item Description</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Item Description"
                                            value={advancedFilters.itemDescription}
                                            onChange={(e) => handleAdvancedFilterChange('itemDescription', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Subcategory</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Subcategory"
                                            value={advancedFilters.subcategory}
                                            onChange={(e) => handleAdvancedFilterChange('subcategory', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">UoM</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by UoM"
                                            value={advancedFilters.uom}
                                            onChange={(e) => handleAdvancedFilterChange('uom', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">GRN/Receipt No</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by GRN/Receipt No"
                                            value={advancedFilters.grnReceiptNo}
                                            onChange={(e) => handleAdvancedFilterChange('grnReceiptNo', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Warehouse Location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Warehouse Location"
                                            value={advancedFilters.warehouseLocation}
                                            onChange={(e) => handleAdvancedFilterChange('warehouseLocation', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Vendor Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Vendor Name"
                                            value={advancedFilters.vendorName}
                                            onChange={(e) => handleAdvancedFilterChange('vendorName', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Action Plan</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Filter by Action Plan"
                                            value={advancedFilters.actionPlan}
                                            onChange={(e) => handleAdvancedFilterChange('actionPlan', e.target.value)}
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
                                                { value: 'Fiber Accessories', label: 'Fiber Accessories' },
                                                { value: 'Network Cables', label: 'Network Cables' },
                                                { value: 'Power Equipment', label: 'Power Equipment' },
                                                { value: 'IT Equipment', label: 'IT Equipment' }
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Movement Statuses</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Movement Statuses"
                                            value={advancedFilters.statuses}
                                            onChange={(value) => handleAdvancedFilterChange('statuses', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Fast', label: 'Fast' },
                                                { value: 'Slow', label: 'Slow' },
                                                { value: 'Obsolete', label: 'Obsolete' }
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Ageing Buckets</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Ageing Buckets"
                                            value={advancedFilters.ageingBuckets}
                                            onChange={(value) => handleAdvancedFilterChange('ageingBuckets', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: '0-30 Days', label: '0-30 Days (Fresh Stock)' },
                                                { value: '31-60 Days', label: '31-60 Days (Moderate)' },
                                                { value: '61-90 Days', label: '61-90 Days (Slow-moving)' },
                                                { value: '>90 Days', label: '>90 Days (Obsolete)' }
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">Action Plans</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select Action Plans"
                                            value={advancedFilters.actionPlans}
                                            onChange={(value) => handleAdvancedFilterChange('actionPlans', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Use', label: 'Use' },
                                                { value: 'Redeploy', label: 'Redeploy' },
                                                { value: 'Dispose', label: 'Dispose' }
                                            ]}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fw-semibold">UoMs</label>
                                        <Select
                                            mode="multiple"
                                            placeholder="Select UoMs"
                                            value={advancedFilters.uoms}
                                            onChange={(value) => handleAdvancedFilterChange('uoms', value)}
                                            style={{ width: '100%' }}
                                            options={[
                                                { value: 'Nos', label: 'Nos' },
                                                { value: 'Meters', label: 'Meters' },
                                                { value: 'Kg', label: 'Kg' },
                                                { value: 'Liters', label: 'Liters' },
                                                { value: 'Boxes', label: 'Boxes' }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </Collapse.Panel>
                        </Collapse>
                    </div>
                </div>
            )}

            <div className="card custom-shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">Inventory Aging Summary</h5>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Total Inventory Value</h6>
                                    <h4 className="text-primary">₹1,12,500</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">0-30 Days</h6>
                                    <h4 className="text-success">Fresh Stock</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">61-90 Days</h6>
                                    <h4 className="text-warning">Slow-moving</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">&gt;90 Days</h6>
                                    <h4 className="text-danger">Obsolete</h4>
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
                                            <span>Item Code</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('itemCode')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'itemCode' ?
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
                                            <span>Item Description</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('itemDescription')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'itemDescription' ?
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
                                                    onClick={() => handleSort('assetCategory')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'assetCategory' ?
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
                                            <span>Quantity</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('quantityInStock')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'quantityInStock' ?
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
                                            <span>Age (Days)</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('ageDays')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'ageDays' ?
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
                                            <span>Ageing Bucket</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('ageingBucket')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'ageingBucket' ?
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
                                            <span>Movement Status</span>
                                            <div className="d-flex gap-1 align-items-center">
                                                <span 
                                                    className="cursor-pointer"
                                                    onClick={() => handleSort('movementStatus')}
                                                    title="Sort"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {sortField === 'movementStatus' ?
                                                        (sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />) :
                                                        <HolderOutlined />
                                                    }
                                                </span>
                                                <FilterOutlined style={{ fontSize: '12px', color: '#8c8c8c' }} />
                                            </div>
                                        </div>
                                    </th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.itemCode}</td>
                                        <td>{item.itemDescription}</td>
                                        <td>{item.assetCategory}</td>
                                        <td>{item.quantityInStock} {item.uom}</td>
                                        <td>{item.ageDays}</td>
                                        <td>
                                            <Tag 
                                                color={item.ageingBucket === '&gt;90 Days' ? 'red' : item.ageingBucket === '61-90 Days' ? 'orange' : 'green'}
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    backgroundColor: item.ageingBucket === '&gt;90 Days' ? '#fff2f0' : item.ageingBucket === '61-90 Days' ? '#fff7e6' : '#f6ffed',
                                                    color: item.ageingBucket === '&gt;90 Days' ? '#ff4d4f' : item.ageingBucket === '61-90 Days' ? '#fa8c16' : '#52c41a',
                                                    borderColor: item.ageingBucket === '&gt;90 Days' ? '#ffccc7' : item.ageingBucket === '61-90 Days' ? '#ffd591' : '#b7eb8f'
                                                }}
                                            >
                                                {item.ageingBucket}
                                            </Tag>
                                        </td>
                                        <td>
                                            <Tag 
                                                color={item.movementStatus === 'Fast' ? 'green' : item.movementStatus === 'Slow' ? 'orange' : 'red'}
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    backgroundColor: item.movementStatus === 'Fast' ? '#f6ffed' : item.movementStatus === 'Slow' ? '#fff7e6' : '#fff2f0',
                                                    color: item.movementStatus === 'Fast' ? '#52c41a' : item.movementStatus === 'Slow' ? '#fa8c16' : '#ff4d4f',
                                                    borderColor: item.movementStatus === 'Fast' ? '#b7eb8f' : item.movementStatus === 'Slow' ? '#ffd591' : '#ffccc7'
                                                }}
                                            >
                                                {item.movementStatus}
                                            </Tag>
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

            {/* Drawer for Inventory Item Form */}
            <div className={`offcanvas offcanvas-end ${drawerOpen ? 'show' : ''}`} tabIndex="-1" style={{ visibility: drawerOpen ? 'visible' : 'hidden' }}>
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Inventory Item Details</h5>
                    <button type="button" className="btn-close" onClick={toggleDrawer}></button>
                </div>
                <div className="offcanvas-body">
                    <form>
                        {/* 1. Item Details */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">1. Item Details</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Item Code <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., MAT-TEL-000451"
                                        value={formData.itemCode}
                                        onChange={(e) => handleInputChange('itemCode', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Item Description <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., 6F Fiber Patch Cord"
                                        value={formData.itemDescription}
                                        onChange={(e) => handleInputChange('itemDescription', e.target.value)}
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
                                        <option value="Fiber Accessories">Fiber Accessories</option>
                                        <option value="Network Cables">Network Cables</option>
                                        <option value="Power Equipment">Power Equipment</option>
                                        <option value="IT Equipment">IT Equipment</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Subcategory</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Patch Cord"
                                        value={formData.subcategory}
                                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">UoM (Unit of Measurement)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Nos, Meters, Kg"
                                        value={formData.uom}
                                        onChange={(e) => handleInputChange('uom', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Stock Info */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">2. Stock Info</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Quantity in Stock <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g., 120"
                                        value={formData.quantityInStock}
                                        onChange={(e) => handleInputChange('quantityInStock', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Unit Cost (₹) <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="e.g., 250"
                                        value={formData.unitCost}
                                        onChange={(e) => handleInputChange('unitCost', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Total Value (₹)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Auto-calculated"
                                        value={formData.totalValue}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Receipt Details */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">3. Receipt Details</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">GRN / Receipt No <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., GRN-2025-1002"
                                        value={formData.grnReceiptNo}
                                        onChange={(e) => handleInputChange('grnReceiptNo', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Received Date <span className="text-danger">*</span></label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.receivedDate}
                                        onChange={(e) => handleInputChange('receivedDate', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Ageing Bucket</label>
                                    <select
                                        className="form-select"
                                        value={formData.ageingBucket}
                                        onChange={(e) => handleInputChange('ageingBucket', e.target.value)}
                                    >
                                        <option value="">Select bucket</option>
                                        <option value="0-30 Days">0-30 Days (Fresh Stock)</option>
                                        <option value="31-60 Days">31-60 Days (Moderate)</option>
                                        <option value="61-90 Days">61-90 Days (Slow-moving)</option>
                                        <option value="&gt;90 Days">&gt;90 Days (Obsolete)</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Warehouse / Location</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Central Store - Hyderabad"
                                        value={formData.warehouseLocation}
                                        onChange={(e) => handleInputChange('warehouseLocation', e.target.value)}
                                    />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Vendor Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="e.g., Sterlite Tech"
                                        value={formData.vendorName}
                                        onChange={(e) => handleInputChange('vendorName', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Insights */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">4. Insights</h6>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Movement Status</label>
                                    <select
                                        className="form-select"
                                        value={formData.movementStatus}
                                        onChange={(e) => handleInputChange('movementStatus', e.target.value)}
                                    >
                                        <option value="">Select status</option>
                                        <option value="Fast">Fast</option>
                                        <option value="Slow">Slow</option>
                                        <option value="Obsolete">Obsolete</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Action Plan</label>
                                    <select
                                        className="form-select"
                                        value={formData.actionPlan}
                                        onChange={(e) => handleInputChange('actionPlan', e.target.value)}
                                    >
                                        <option value="">Select action</option>
                                        <option value="Use">Use</option>
                                        <option value="Redeploy">Redeploy</option>
                                        <option value="Dispose">Dispose</option>
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Remarks</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="e.g., Awaiting field dispatch"
                                        value={formData.remarks}
                                        onChange={(e) => handleInputChange('remarks', e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Key Analytics */}
                        <div className="mb-4">
                            <h6 className="mb-3 fw-bold">Key Analytics to Enable</h6>
                            <div className="alert alert-info">
                                <ul className="mb-0">
                                    <li><strong>Total Inventory Value by Age Group:</strong> Track value distribution across aging brackets.</li>
                                    <li><strong>Top 10 Oldest Items in Inventory:</strong> Identify items requiring immediate attention.</li>
                                    <li><strong>Stock Ageing Trend per Warehouse:</strong> Monitor aging patterns by location.</li>
                                    <li><strong>Value of Obsolete Stock (&gt;180 days):</strong> Calculate potential write-off amounts.</li>
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
                                Save Inventory Item
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

export default InventoryAgingReport;


