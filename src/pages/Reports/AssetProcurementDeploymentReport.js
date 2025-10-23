import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { Tag, DatePicker, InputNumber, Select, Button, Space, Collapse, Table, Input } from 'antd';
import { 
    DownloadOutlined, 
    FilterOutlined, 
    SearchOutlined, 
    CalendarOutlined, 
    LineChartOutlined, 
    ShoppingCartOutlined,
    ArrowLeftOutlined, 
    ArrowRightOutlined,
    SortAscendingOutlined, 
    SortDescendingOutlined, 
    HolderOutlined,
    PlusOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CloseOutlined,
    SaveOutlined,
    ClearOutlined,
    ClockCircleOutlined,
    ToolOutlined,
    UserOutlined,
    EnvironmentOutlined,
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    InboxOutlined,
    TruckOutlined,
    HomeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const AssetProcurementDeploymentReport = () => {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Query Editor Filters State
    const [queryFilters, setQueryFilters] = useState([
        {
            id: 1,
            field: 'PO Date',
            operator: '>',
            value: '@Today - 30',
            logicalOperator: null // null for first row
        },
        {
            id: 2,
            field: 'Vendor',
            operator: '=',
            value: '[Any]',
            logicalOperator: 'And'
        },
        {
            id: 3,
            field: 'Commissioning Status',
            operator: '=',
            value: '[Any]',
            logicalOperator: 'And'
        }
    ]);

    // Advanced filters state
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        numeric: {
            totalPOValue: { operator: '>=', value: '' },
            requestedQuantity: { operator: '>=', value: '' },
            receivedQuantity: { operator: '>=', value: '' },
            deployedQuantity: { operator: '>=', value: '' }
        },
        dateRange: {
            poDate: { from: '', to: '' },
            receivedDate: { from: '', to: '' },
            deploymentDate: { from: '', to: '' },
            expectedDeliveryDate: { from: '', to: '' }
        },
        text: {
            vendor: '',
            assetCategory: '',
            assetSubcategory: '',
            deploymentLocation: '',
            commissioningStatus: '',
            receivedCondition: '',
            delayReasons: ''
        },
        multiSelect: {
            vendors: [],
            locations: [],
            projects: [],
            categories: [],
            statuses: []
        }
    });
    
    // Report customization state
    const [reportSettings, setReportSettings] = useState({
        includeProcurementDetails: true,
        includeGoodsReceipt: true,
        includeDeploymentInfo: true,
        includeExceptions: true,
        groupBy: '',
        sortBy: 'poDate',
        sortOrder: 'desc',
        dateRange: {
            from: '',
            to: ''
        },
        exportFormat: 'pdf',
        alertDays: 30
    });
    
    const [filters, setFilters] = useState({
        dateRange: '',
        procurementStatus: '',
        deploymentStatus: '',
        vendor: ''
    });

    // Comprehensive form data for procurement/deployment details
    const [formData, setFormData] = useState({
        // Procurement Info
        poNumber: '',
        poDate: '',
        vendor: '',
        assetCategory: '',
        assetSubcategory: '',
        requestedQuantity: '',
        unitCost: '',
        totalPOValue: '',
        expectedDeliveryDate: '',
        
        // Goods Receipt / Inventory
        receivedQuantity: '',
        receivedDate: '',
        batchSerialNumbers: '',
        receivedCondition: '',
        
        // Deployment Info
        deployedQuantity: '',
        deploymentDate: '',
        deploymentLocation: '',
        installedBy: '',
        commissioningStatus: '',
        
        // Exceptions & Notes
        pendingDeployment: '',
        damagedMissing: '',
        delayReasons: '',
        remarks: ''
    });

    // Sample data with comprehensive procurement/deployment records
    const [tableData, setTableData] = useState([
        {
            id: 1,
            poNumber: 'PO/BN/2025/105',
            poDate: '10-Oct-25',
            vendor: 'HFCL Telecom',
            assetCategory: 'OLT',
            assetSubcategory: 'Huawei MA5800',
            requestedQuantity: 50,
            unitCost: 85000,
            totalPOValue: 4250000,
            expectedDeliveryDate: '20-Oct-25',
            receivedQuantity: 48,
            receivedDate: '21-Oct-25',
            batchSerialNumbers: 'ASSET-TEL-000123 to 000170',
            receivedCondition: 'Good',
            deployedQuantity: 45,
            deploymentDate: '25-Oct-25',
            deploymentLocation: 'POP - Chennai North',
            installedBy: 'Field Team Alpha',
            commissioningStatus: 'Completed',
            pendingDeployment: 3,
            damagedMissing: 2,
            delayReasons: 'Delivery delay by vendor',
            remarks: 'Assets reconciled with warehouse'
        },
        {
            id: 2,
            poNumber: 'PO/BN/2025/106',
            poDate: '15-Oct-25',
            vendor: 'TechCorp Solutions',
            assetCategory: 'Router',
            assetSubcategory: 'Cisco ISR 4331',
            requestedQuantity: 25,
            unitCost: 120000,
            totalPOValue: 3000000,
            expectedDeliveryDate: '25-Oct-25',
            receivedQuantity: 25,
            receivedDate: '24-Oct-25',
            batchSerialNumbers: 'ASSET-ROU-000201 to 000225',
            receivedCondition: 'Good',
            deployedQuantity: 22,
            deploymentDate: '28-Oct-25',
            deploymentLocation: 'POP - Mumbai Central',
            installedBy: 'Field Team Beta',
            commissioningStatus: 'Completed',
            pendingDeployment: 3,
            damagedMissing: 0,
            delayReasons: '',
            remarks: 'On-time delivery and deployment'
        },
        {
            id: 3,
            poNumber: 'PO/BN/2025/107',
            poDate: '20-Oct-25',
            vendor: 'FiberNet Equipment',
            assetCategory: 'OFC',
            assetSubcategory: 'Single Mode Fiber 24 Core',
            requestedQuantity: 100,
            unitCost: 15000,
            totalPOValue: 1500000,
            expectedDeliveryDate: '30-Oct-25',
            receivedQuantity: 95,
            receivedDate: '29-Oct-25',
            batchSerialNumbers: 'ASSET-FIB-000301 to 000395',
            receivedCondition: 'Good',
            deployedQuantity: 90,
            deploymentDate: '02-Nov-25',
            deploymentLocation: 'POP - Delhi East',
            installedBy: 'Field Team Gamma',
            commissioningStatus: 'In Progress',
            pendingDeployment: 5,
            damagedMissing: 5,
            delayReasons: 'Quality issues with 5 units',
            remarks: '5 units rejected due to quality issues'
        },
        {
            id: 4,
            poNumber: 'PO/BN/2025/108',
            poDate: '25-Oct-25',
            vendor: 'NetworkGear Pro',
            assetCategory: 'Switch',
            assetSubcategory: 'HP ProCurve 2920',
            requestedQuantity: 30,
            unitCost: 45000,
            totalPOValue: 1350000,
            expectedDeliveryDate: '05-Nov-25',
            receivedQuantity: 30,
            receivedDate: '04-Nov-25',
            batchSerialNumbers: 'ASSET-SWI-000401 to 000430',
            receivedCondition: 'Good',
            deployedQuantity: 25,
            deploymentDate: '08-Nov-25',
            deploymentLocation: 'POP - Bangalore South',
            installedBy: 'Field Team Delta',
            commissioningStatus: 'Completed',
            pendingDeployment: 5,
            damagedMissing: 0,
            delayReasons: '',
            remarks: 'Successful deployment with 5 units in stock'
        },
        {
            id: 5,
            poNumber: 'PO/BN/2025/109',
            poDate: '30-Oct-25',
            vendor: 'PowerTech Systems',
            assetCategory: 'UPS',
            assetSubcategory: 'APC Smart-UPS 3000VA',
            requestedQuantity: 15,
            unitCost: 75000,
            totalPOValue: 1125000,
            expectedDeliveryDate: '10-Nov-25',
            receivedQuantity: 12,
            receivedDate: '12-Nov-25',
            batchSerialNumbers: 'ASSET-UPS-000501 to 000512',
            receivedCondition: 'Good',
            deployedQuantity: 10,
            deploymentDate: '15-Nov-25',
            deploymentLocation: 'POP - Kolkata West',
            installedBy: 'Field Team Epsilon',
            commissioningStatus: 'Completed',
            pendingDeployment: 2,
            damagedMissing: 3,
            delayReasons: 'Vendor supply shortage',
            remarks: '3 units pending from vendor due to supply issues'
        },
        {
            id: 6,
            poNumber: 'PO/BN/2025/110',
            poDate: '05-Nov-25',
            vendor: 'CableMaster Ltd',
            assetCategory: 'Cable',
            assetSubcategory: 'Cat6 UTP Cable 305m',
            requestedQuantity: 200,
            unitCost: 2500,
            totalPOValue: 500000,
            expectedDeliveryDate: '15-Nov-25',
            receivedQuantity: 200,
            receivedDate: '14-Nov-25',
            batchSerialNumbers: 'ASSET-CAB-000601 to 000800',
            receivedCondition: 'Good',
            deployedQuantity: 180,
            deploymentDate: '18-Nov-25',
            deploymentLocation: 'POP - Hyderabad Central',
            installedBy: 'Field Team Zeta',
            commissioningStatus: 'Completed',
            pendingDeployment: 20,
            damagedMissing: 0,
            delayReasons: '',
            remarks: 'Full delivery and 90% deployment completed'
        },
        {
            id: 7,
            poNumber: 'PO/BN/2025/111',
            poDate: '10-Nov-25',
            vendor: 'AntennaTech Solutions',
            assetCategory: 'Antenna',
            assetSubcategory: 'Omni Directional 2.4GHz',
            requestedQuantity: 40,
            unitCost: 12000,
            totalPOValue: 480000,
            expectedDeliveryDate: '20-Nov-25',
            receivedQuantity: 38,
            receivedDate: '22-Nov-25',
            batchSerialNumbers: 'ASSET-ANT-000701 to 000738',
            receivedCondition: 'Good',
            deployedQuantity: 35,
            deploymentDate: '25-Nov-25',
            deploymentLocation: 'POP - Pune North',
            installedBy: 'Field Team Eta',
            commissioningStatus: 'In Progress',
            pendingDeployment: 3,
            damagedMissing: 2,
            delayReasons: 'Transportation damage',
            remarks: '2 units damaged during transportation'
        },
        {
            id: 8,
            poNumber: 'PO/BN/2025/112',
            poDate: '15-Nov-25',
            vendor: 'ServerPro Technologies',
            assetCategory: 'Server',
            assetSubcategory: 'Dell PowerEdge R740',
            requestedQuantity: 8,
            unitCost: 250000,
            totalPOValue: 2000000,
            expectedDeliveryDate: '25-Nov-25',
            receivedQuantity: 8,
            receivedDate: '24-Nov-25',
            batchSerialNumbers: 'ASSET-SER-000801 to 000808',
            receivedCondition: 'Good',
            deployedQuantity: 6,
            deploymentDate: '28-Nov-25',
            deploymentLocation: 'Data Center - Mumbai',
            installedBy: 'Field Team Theta',
            commissioningStatus: 'Completed',
            pendingDeployment: 2,
            damagedMissing: 0,
            delayReasons: '',
            remarks: 'High-value equipment deployed successfully'
        }
    ]);

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
            field: 'PO Number',
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

    // Helper functions for filtering
    const applyNumericFilter = (value, filterValue, operator) => {
        if (!filterValue) return true;
        const numValue = parseFloat(value);
        const numFilter = parseFloat(filterValue);
        switch (operator) {
            case '>=': return numValue >= numFilter;
            case '<=': return numValue <= numFilter;
            case '=': return numValue === numFilter;
            case '>': return numValue > numFilter;
            case '<': return numValue < numFilter;
            default: return true;
        }
    };

    const applyDateRangeFilter = (date, fromDate, toDate) => {
        if (!fromDate && !toDate) return true;
        const itemDate = dayjs(date);
        if (fromDate && toDate) {
            return itemDate.isAfter(dayjs(fromDate).subtract(1, 'day')) && itemDate.isBefore(dayjs(toDate).add(1, 'day'));
        }
        if (fromDate) return itemDate.isAfter(dayjs(fromDate).subtract(1, 'day'));
        if (toDate) return itemDate.isBefore(dayjs(toDate).add(1, 'day'));
        return true;
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
                    case 'PO Date':
                        fieldValue = item.poDate || '';
                        break;
                    case 'Vendor':
                        fieldValue = item.vendor || '';
                        break;
                    case 'Commissioning Status':
                        fieldValue = item.commissioningStatus || '';
                        break;
                    case 'PO Number':
                        fieldValue = item.poNumber || '';
                        break;
                    case 'Asset Category':
                        fieldValue = item.assetCategory || '';
                        break;
                    case 'Asset Subcategory':
                        fieldValue = item.assetSubcategory || '';
                        break;
                    case 'Deployment Location':
                        fieldValue = item.deploymentLocation || '';
                        break;
                    case 'Total PO Value':
                        fieldValue = item.totalPOValue || '';
                        break;
                    case 'Requested Quantity':
                        fieldValue = item.requestedQuantity || '';
                        break;
                    case 'Received Quantity':
                        fieldValue = item.receivedQuantity || '';
                        break;
                    case 'Deployed Quantity':
                        fieldValue = item.deployedQuantity || '';
                        break;
                    case 'Received Date':
                        fieldValue = item.receivedDate || '';
                        break;
                    case 'Deployment Date':
                        fieldValue = item.deploymentDate || '';
                        break;
                    case 'Expected Delivery Date':
                        fieldValue = item.expectedDeliveryDate || '';
                        break;
                    case 'Received Condition':
                        fieldValue = item.receivedCondition || '';
                        break;
                    case 'Installed By':
                        fieldValue = item.installedBy || '';
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

    // Filtered and sorted data
    const filteredData = useMemo(() => {
        let filtered = tableData.filter(item => {
            const matchesSearch = !searchTerm || 
                item.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetSubcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.deploymentLocation.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesVendor = !selectedVendor || item.vendor === selectedVendor;
            const matchesStatus = !selectedStatus || item.commissioningStatus === selectedStatus;

            // Advanced filters - Numeric
            const matchesTotalPOValue = applyNumericFilter(
                item.totalPOValue, 
                advancedFilters.numeric.totalPOValue.value, 
                advancedFilters.numeric.totalPOValue.operator
            );
            const matchesRequestedQuantity = applyNumericFilter(
                item.requestedQuantity, 
                advancedFilters.numeric.requestedQuantity.value, 
                advancedFilters.numeric.requestedQuantity.operator
            );
            const matchesReceivedQuantity = applyNumericFilter(
                item.receivedQuantity, 
                advancedFilters.numeric.receivedQuantity.value, 
                advancedFilters.numeric.receivedQuantity.operator
            );
            const matchesDeployedQuantity = applyNumericFilter(
                item.deployedQuantity, 
                advancedFilters.numeric.deployedQuantity.value, 
                advancedFilters.numeric.deployedQuantity.operator
            );

            // Advanced filters - Date Range
            const matchesPODate = applyDateRangeFilter(
                item.poDate, 
                advancedFilters.dateRange.poDate.from, 
                advancedFilters.dateRange.poDate.to
            );
            const matchesReceivedDate = applyDateRangeFilter(
                item.receivedDate, 
                advancedFilters.dateRange.receivedDate.from, 
                advancedFilters.dateRange.receivedDate.to
            );
            const matchesDeploymentDate = applyDateRangeFilter(
                item.deploymentDate, 
                advancedFilters.dateRange.deploymentDate.from, 
                advancedFilters.dateRange.deploymentDate.to
            );
            const matchesExpectedDeliveryDate = applyDateRangeFilter(
                item.expectedDeliveryDate, 
                advancedFilters.dateRange.expectedDeliveryDate.from, 
                advancedFilters.dateRange.expectedDeliveryDate.to
            );

            // Advanced filters - Text
            const matchesVendorFilter = !advancedFilters.text.vendor || 
                item.vendor.toLowerCase().includes(advancedFilters.text.vendor.toLowerCase());
            const matchesAssetCategory = !advancedFilters.text.assetCategory || 
                item.assetCategory.toLowerCase().includes(advancedFilters.text.assetCategory.toLowerCase());
            const matchesAssetSubcategory = !advancedFilters.text.assetSubcategory || 
                item.assetSubcategory.toLowerCase().includes(advancedFilters.text.assetSubcategory.toLowerCase());
            const matchesDeploymentLocation = !advancedFilters.text.deploymentLocation || 
                item.deploymentLocation.toLowerCase().includes(advancedFilters.text.deploymentLocation.toLowerCase());
            const matchesCommissioningStatus = !advancedFilters.text.commissioningStatus || 
                item.commissioningStatus.toLowerCase().includes(advancedFilters.text.commissioningStatus.toLowerCase());
            const matchesReceivedCondition = !advancedFilters.text.receivedCondition || 
                item.receivedCondition.toLowerCase().includes(advancedFilters.text.receivedCondition.toLowerCase());
            const matchesDelayReasons = !advancedFilters.text.delayReasons || 
                item.delayReasons.toLowerCase().includes(advancedFilters.text.delayReasons.toLowerCase());

            // Advanced filters - Multi-select
            const matchesVendorsMulti = advancedFilters.multiSelect.vendors.length === 0 || 
                advancedFilters.multiSelect.vendors.includes(item.vendor);
            const matchesLocationsMulti = advancedFilters.multiSelect.locations.length === 0 || 
                advancedFilters.multiSelect.locations.includes(item.deploymentLocation);
            const matchesProjectsMulti = advancedFilters.multiSelect.projects.length === 0 || 
                advancedFilters.multiSelect.projects.includes(item.project);
            const matchesCategoriesMulti = advancedFilters.multiSelect.categories.length === 0 || 
                advancedFilters.multiSelect.categories.includes(item.assetCategory);
            const matchesStatusesMulti = advancedFilters.multiSelect.statuses.length === 0 || 
                advancedFilters.multiSelect.statuses.includes(item.commissioningStatus);

            return matchesSearch && matchesVendor && matchesStatus && matchesTotalPOValue && 
                   matchesRequestedQuantity && matchesReceivedQuantity && matchesDeployedQuantity &&
                   matchesPODate && matchesReceivedDate && matchesDeploymentDate && matchesExpectedDeliveryDate &&
                   matchesVendorFilter && matchesAssetCategory && matchesAssetSubcategory && 
                   matchesDeploymentLocation && matchesCommissioningStatus && matchesReceivedCondition && matchesDelayReasons &&
                   matchesVendorsMulti && matchesLocationsMulti && matchesProjectsMulti && matchesCategoriesMulti && matchesStatusesMulti;
        });

        // Apply query filters
        filtered = applyQueryFilters(filtered);

        // Sort data
        if (sortField) {
            filtered.sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (sortDirection === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });
        }

        return filtered;
    }, [tableData, searchTerm, selectedVendor, selectedStatus, advancedFilters, queryFilters, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleAdvancedFilterChange = (category, field, value) => {
        setAdvancedFilters(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleNumericFilterChange = (field, operator, value) => {
        setAdvancedFilters(prev => ({
            ...prev,
            numeric: {
                ...prev.numeric,
                [field]: { operator, value }
            }
        }));
    };

    const handleReportSettingChange = (field, value) => {
        setReportSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearAllFilters = () => {
        setAdvancedFilters({
            numeric: {
                totalPOValue: { operator: '>=', value: '' },
                requestedQuantity: { operator: '>=', value: '' },
                receivedQuantity: { operator: '>=', value: '' },
                deployedQuantity: { operator: '>=', value: '' }
            },
            dateRange: {
                poDate: { from: '', to: '' },
                receivedDate: { from: '', to: '' },
                deploymentDate: { from: '', to: '' },
                expectedDeliveryDate: { from: '', to: '' }
            },
            text: {
                vendor: '',
                assetCategory: '',
                assetSubcategory: '',
                deploymentLocation: '',
                commissioningStatus: '',
                receivedCondition: '',
                delayReasons: ''
            },
            multiSelect: {
                vendors: [],
                locations: [],
                projects: [],
                categories: [],
                statuses: []
            }
        });
        setQueryFilters([
            {
                id: 1,
                field: 'PO Date',
                operator: '>',
                value: '@Today - 30',
                logicalOperator: null
            },
            {
                id: 2,
                field: 'Vendor',
                operator: '=',
                value: '[Any]',
                logicalOperator: 'And'
            },
            {
                id: 3,
                field: 'Commissioning Status',
                operator: '=',
                value: '[Any]',
                logicalOperator: 'And'
            }
        ]);
        setSearchTerm('');
        setSelectedVendor('');
        setSelectedStatus('');
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (items) => {
        setItemsPerPage(items);
        setCurrentPage(1);
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
        // Add new procurement/deployment to table data
        const newRecord = {
            id: tableData.length + 1,
            poNumber: formData.poNumber,
            poDate: formData.poDate,
            vendor: formData.vendor,
            assetCategory: formData.assetCategory,
            assetSubcategory: formData.assetSubcategory,
            requestedQuantity: parseInt(formData.requestedQuantity) || 0,
            unitCost: parseFloat(formData.unitCost) || 0,
            totalPOValue: parseFloat(formData.totalPOValue) || 0,
            expectedDeliveryDate: formData.expectedDeliveryDate,
            receivedQuantity: parseInt(formData.receivedQuantity) || 0,
            receivedDate: formData.receivedDate,
            batchSerialNumbers: formData.batchSerialNumbers,
            receivedCondition: formData.receivedCondition,
            deployedQuantity: parseInt(formData.deployedQuantity) || 0,
            deploymentDate: formData.deploymentDate,
            deploymentLocation: formData.deploymentLocation,
            installedBy: formData.installedBy,
            commissioningStatus: formData.commissioningStatus,
            pendingDeployment: parseInt(formData.pendingDeployment) || 0,
            damagedMissing: parseInt(formData.damagedMissing) || 0,
            delayReasons: formData.delayReasons,
            remarks: formData.remarks
        };
        
        setTableData(prev => [...prev, newRecord]);
        setFormData({
            poNumber: '', poDate: '', vendor: '', assetCategory: '', assetSubcategory: '',
            requestedQuantity: '', unitCost: '', totalPOValue: '', expectedDeliveryDate: '',
            receivedQuantity: '', receivedDate: '', batchSerialNumbers: '', receivedCondition: '',
            deployedQuantity: '', deploymentDate: '', deploymentLocation: '', installedBy: '',
            commissioningStatus: '', pendingDeployment: '', damagedMissing: '', delayReasons: '', remarks: ''
        });
        setDrawerOpen(false);
    };

    const exportReport = () => {
        const csvContent = [
            ['PO Number', 'PO Date', 'Vendor', 'Asset Category', 'Asset Subcategory', 'Requested Qty', 'Unit Cost (₹)', 'Total PO Value (₹)', 'Expected Delivery', 'Received Qty', 'Received Date', 'Deployed Qty', 'Deployment Date', 'Deployment Location', 'Commissioning Status', 'Pending Deployment', 'Damaged/Missing', 'Delay Reasons', 'Remarks'],
            ...filteredData.map(item => [
                item.poNumber,
                item.poDate,
                item.vendor,
                item.assetCategory,
                item.assetSubcategory,
                item.requestedQuantity,
                item.unitCost,
                item.totalPOValue,
                item.expectedDeliveryDate,
                item.receivedQuantity,
                item.receivedDate,
                item.deployedQuantity,
                item.deploymentDate,
                item.deploymentLocation,
                item.commissioningStatus,
                item.pendingDeployment,
                item.damagedMissing,
                item.delayReasons,
                item.remarks
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'asset_procurement_deployment_report.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

            <div className="mb-4">
                <h2 className="fw-bold mb-0">Asset Procurement vs Deployment Report</h2>
                <p className="text-muted mt-2">Tracks procurement pipeline and deployment ratio with comprehensive analytics</p>
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
                                onClick={clearAllFilters}
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
                                Add Record
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={exportReport}
                            >
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
                                            { value: 'PO Date', label: 'PO Date' },
                                            { value: 'Vendor', label: 'Vendor' },
                                            { value: 'Commissioning Status', label: 'Commissioning Status' },
                                            { value: 'PO Number', label: 'PO Number' },
                                            { value: 'Asset Category', label: 'Asset Category' },
                                            { value: 'Asset Subcategory', label: 'Asset Subcategory' },
                                            { value: 'Deployment Location', label: 'Deployment Location' },
                                            { value: 'Total PO Value', label: 'Total PO Value' },
                                            { value: 'Requested Quantity', label: 'Requested Quantity' },
                                            { value: 'Received Quantity', label: 'Received Quantity' },
                                            { value: 'Deployed Quantity', label: 'Deployed Quantity' },
                                            { value: 'Received Date', label: 'Received Date' },
                                            { value: 'Deployment Date', label: 'Deployment Date' },
                                            { value: 'Expected Delivery Date', label: 'Expected Delivery Date' },
                                            { value: 'Received Condition', label: 'Received Condition' },
                                            { value: 'Installed By', label: 'Installed By' }
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
                <Collapse
                    defaultActiveKey={['1']}
                    style={{ marginBottom: '1.5rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #d9d9d9' }}
                >
                    <Collapse.Panel header={<span style={{ fontWeight: '600' }}><FilterOutlined className="me-2" />Advanced Filters</span>} key="1">
                        <div className="row g-3">
                            {/* Numeric Filters */}
                            <div className="col-12">
                                <h6 className="fw-bold mb-3">Numeric Filters</h6>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Total PO Value (₹)</label>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        value={advancedFilters.numeric.totalPOValue.operator}
                                        onChange={(value) => handleNumericFilterChange('totalPOValue', value, advancedFilters.numeric.totalPOValue.value)}
                                        style={{ width: '35%' }}
                                    >
                                        <Select.Option value=">=">&gt;=</Select.Option>
                                        <Select.Option value="<=">&lt;=</Select.Option>
                                        <Select.Option value="=">=</Select.Option>
                                        <Select.Option value=">">&gt;</Select.Option>
                                        <Select.Option value="<">&lt;</Select.Option>
                                    </Select>
                                    <InputNumber
                                        value={advancedFilters.numeric.totalPOValue.value}
                                        onChange={(value) => handleNumericFilterChange('totalPOValue', advancedFilters.numeric.totalPOValue.operator, value)}
                                        placeholder="Value"
                                        style={{ width: '65%' }}
                                    />
                                </Space.Compact>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Requested Quantity</label>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        value={advancedFilters.numeric.requestedQuantity.operator}
                                        onChange={(value) => handleNumericFilterChange('requestedQuantity', value, advancedFilters.numeric.requestedQuantity.value)}
                                        style={{ width: '35%' }}
                                    >
                                        <Select.Option value=">=">&gt;=</Select.Option>
                                        <Select.Option value="<=">&lt;=</Select.Option>
                                        <Select.Option value="=">=</Select.Option>
                                        <Select.Option value=">">&gt;</Select.Option>
                                        <Select.Option value="<">&lt;</Select.Option>
                                    </Select>
                                    <InputNumber
                                        value={advancedFilters.numeric.requestedQuantity.value}
                                        onChange={(value) => handleNumericFilterChange('requestedQuantity', advancedFilters.numeric.requestedQuantity.operator, value)}
                                        placeholder="Quantity"
                                        style={{ width: '65%' }}
                                    />
                                </Space.Compact>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Received Quantity</label>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        value={advancedFilters.numeric.receivedQuantity.operator}
                                        onChange={(value) => handleNumericFilterChange('receivedQuantity', value, advancedFilters.numeric.receivedQuantity.value)}
                                        style={{ width: '35%' }}
                                    >
                                        <Select.Option value=">=">&gt;=</Select.Option>
                                        <Select.Option value="<=">&lt;=</Select.Option>
                                        <Select.Option value="=">=</Select.Option>
                                        <Select.Option value=">">&gt;</Select.Option>
                                        <Select.Option value="<">&lt;</Select.Option>
                                    </Select>
                                    <InputNumber
                                        value={advancedFilters.numeric.receivedQuantity.value}
                                        onChange={(value) => handleNumericFilterChange('receivedQuantity', advancedFilters.numeric.receivedQuantity.operator, value)}
                                        placeholder="Quantity"
                                        style={{ width: '65%' }}
                                    />
                                </Space.Compact>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Deployed Quantity</label>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        value={advancedFilters.numeric.deployedQuantity.operator}
                                        onChange={(value) => handleNumericFilterChange('deployedQuantity', value, advancedFilters.numeric.deployedQuantity.value)}
                                        style={{ width: '35%' }}
                                    >
                                        <Select.Option value=">=">&gt;=</Select.Option>
                                        <Select.Option value="<=">&lt;=</Select.Option>
                                        <Select.Option value="=">=</Select.Option>
                                        <Select.Option value=">">&gt;</Select.Option>
                                        <Select.Option value="<">&lt;</Select.Option>
                                    </Select>
                                    <InputNumber
                                        value={advancedFilters.numeric.deployedQuantity.value}
                                        onChange={(value) => handleNumericFilterChange('deployedQuantity', advancedFilters.numeric.deployedQuantity.operator, value)}
                                        placeholder="Quantity"
                                        style={{ width: '65%' }}
                                    />
                                </Space.Compact>
                            </div>

                            {/* Date Range Filters */}
                            <div className="col-12 mt-4">
                                <h6 className="fw-bold mb-3">Date Range Filters</h6>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">PO Date From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.poDate.from}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'poDate', { ...advancedFilters.dateRange.poDate, from: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">PO Date To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.poDate.to}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'poDate', { ...advancedFilters.dateRange.poDate, to: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Received Date From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.receivedDate.from}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'receivedDate', { ...advancedFilters.dateRange.receivedDate, from: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Received Date To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.receivedDate.to}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'receivedDate', { ...advancedFilters.dateRange.receivedDate, to: e.target.value })}
                                />
                            </div>

                            {/* Text Filters */}
                            <div className="col-12 mt-4">
                                <h6 className="fw-bold mb-3">Text Filters</h6>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Vendor</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by vendor"
                                    value={advancedFilters.text.vendor}
                                    onChange={(e) => handleAdvancedFilterChange('text', 'vendor', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Asset Category</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by category"
                                    value={advancedFilters.text.assetCategory}
                                    onChange={(e) => handleAdvancedFilterChange('text', 'assetCategory', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Deployment Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by location"
                                    value={advancedFilters.text.deploymentLocation}
                                    onChange={(e) => handleAdvancedFilterChange('text', 'deploymentLocation', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Commissioning Status</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by status"
                                    value={advancedFilters.text.commissioningStatus}
                                    onChange={(e) => handleAdvancedFilterChange('text', 'commissioningStatus', e.target.value)}
                                />
                            </div>
                        </div>
                    </Collapse.Panel>
                </Collapse>
            )}

            {/* Legacy Advanced Filters Section */}
            {false && (
                <div className="card custom-shadow mb-4">
                    <div className="card-body">
                        <h6 className="fw-bold text-primary mb-3">
                            <FilterOutlined className="me-2" />
                            Advanced Filters
                        </h6>
                        <div className="row g-3">
                            {/* Total PO Value Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Total PO Value (₹)</label>
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select"
                                        style={{ width: '80px' }}
                                        value={advancedFilters.totalPOValue.operator}
                                        onChange={(e) => handleAdvancedFilterChange('totalPOValue', 'operator', e.target.value)}
                                    >
                                        <option value=">=">&gt;=</option>
                                        <option value="<=">&lt;=</option>
                                        <option value="=">=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Value"
                                        value={advancedFilters.totalPOValue.value}
                                        onChange={(e) => handleAdvancedFilterChange('totalPOValue', 'value', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Requested Quantity Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Requested Quantity</label>
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select"
                                        style={{ width: '80px' }}
                                        value={advancedFilters.requestedQuantity.operator}
                                        onChange={(e) => handleAdvancedFilterChange('requestedQuantity', 'operator', e.target.value)}
                                    >
                                        <option value=">=">&gt;=</option>
                                        <option value="<=">&lt;=</option>
                                        <option value="=">=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Qty"
                                        value={advancedFilters.requestedQuantity.value}
                                        onChange={(e) => handleAdvancedFilterChange('requestedQuantity', 'value', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Received Quantity Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Received Quantity</label>
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select"
                                        style={{ width: '80px' }}
                                        value={advancedFilters.receivedQuantity.operator}
                                        onChange={(e) => handleAdvancedFilterChange('receivedQuantity', 'operator', e.target.value)}
                                    >
                                        <option value=">=">&gt;=</option>
                                        <option value="<=">&lt;=</option>
                                        <option value="=">=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Qty"
                                        value={advancedFilters.receivedQuantity.value}
                                        onChange={(e) => handleAdvancedFilterChange('receivedQuantity', 'value', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Deployed Quantity Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Deployed Quantity</label>
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select"
                                        style={{ width: '80px' }}
                                        value={advancedFilters.deployedQuantity.operator}
                                        onChange={(e) => handleAdvancedFilterChange('deployedQuantity', 'operator', e.target.value)}
                                    >
                                        <option value=">=">&gt;=</option>
                                        <option value="<=">&lt;=</option>
                                        <option value="=">=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                    </select>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Qty"
                                        value={advancedFilters.deployedQuantity.value}
                                        onChange={(e) => handleAdvancedFilterChange('deployedQuantity', 'value', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Asset Category Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Asset Category</label>
                                <select
                                    className="form-select"
                                    value={advancedFilters.assetCategory}
                                    onChange={(e) => handleAdvancedFilterChange('assetCategory', null, e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    <option value="OLT">OLT</option>
                                    <option value="Router">Router</option>
                                    <option value="OFC">OFC</option>
                                    <option value="Switch">Switch</option>
                                    <option value="UPS">UPS</option>
                                    <option value="Cable">Cable</option>
                                    <option value="Antenna">Antenna</option>
                                    <option value="Server">Server</option>
                                </select>
                            </div>

                            {/* Deployment Location Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Deployment Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search location..."
                                    value={advancedFilters.deploymentLocation}
                                    onChange={(e) => handleAdvancedFilterChange('deploymentLocation', null, e.target.value)}
                                />
                            </div>

                            {/* Commissioning Status Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Commissioning Status</label>
                                <select
                                    className="form-select"
                                    value={advancedFilters.commissioningStatus}
                                    onChange={(e) => handleAdvancedFilterChange('commissioningStatus', null, e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Completed">Completed</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>

                            {/* Received Condition Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Received Condition</label>
                                <select
                                    className="form-select"
                                    value={advancedFilters.receivedCondition}
                                    onChange={(e) => handleAdvancedFilterChange('receivedCondition', null, e.target.value)}
                                >
                                    <option value="">All Conditions</option>
                                    <option value="Good">Good</option>
                                    <option value="Damaged">Damaged</option>
                                    <option value="Poor">Poor</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card custom-shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">Procurement vs Deployment Summary</h5>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Total Procured</h6>
                                    <h4 className="text-primary">{filteredData.reduce((sum, item) => sum + item.requestedQuantity, 0)}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Total Received</h6>
                                    <h4 className="text-info">{filteredData.reduce((sum, item) => sum + item.receivedQuantity, 0)}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Total Deployed</h6>
                                    <h4 className="text-success">{filteredData.reduce((sum, item) => sum + item.deployedQuantity, 0)}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Deployment Efficiency</h6>
                                    <h4 className="text-warning">
                                        {filteredData.length > 0 ? 
                                            Math.round((filteredData.reduce((sum, item) => sum + item.deployedQuantity, 0) / 
                                                      filteredData.reduce((sum, item) => sum + item.receivedQuantity, 0)) * 100) : 0}%
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Table
                        dataSource={paginatedData}
                        columns={[
                            {
                                title: 'PO Number',
                                dataIndex: 'poNumber',
                                key: 'poNumber',
                                render: (text, record) => (
                                    <div>
                                        <span style={{ color: '#000000' }}>{text}</span>
                                        <br />
                                        <small className="text-muted">{record.poDate}</small>
                                    </div>
                                ),
                            },
                            {
                                title: 'Vendor',
                                dataIndex: 'vendor',
                                key: 'vendor',
                            },
                            {
                                title: 'Asset Category',
                                dataIndex: 'assetCategory',
                                key: 'assetCategory',
                                render: (text, record) => (
                                    <div>
                                        <span className="fw-semibold">{text}</span>
                                        <br />
                                        <small className="text-muted">{record.assetSubcategory}</small>
                                    </div>
                                ),
                            },
                            {
                                title: 'Requested Qty',
                                dataIndex: 'requestedQuantity',
                                key: 'requestedQuantity',
                                render: (value) => <Tag color="blue">{value}</Tag>,
                            },
                            {
                                title: 'Received Qty',
                                dataIndex: 'receivedQuantity',
                                key: 'receivedQuantity',
                                render: (value) => <Tag color="cyan">{value}</Tag>,
                            },
                            {
                                title: 'Deployed Qty',
                                dataIndex: 'deployedQuantity',
                                key: 'deployedQuantity',
                                render: (value) => <Tag color="green">{value}</Tag>,
                            },
                            {
                                title: 'Total PO Value (₹)',
                                dataIndex: 'totalPOValue',
                                key: 'totalPOValue',
                                render: (value) => (
                                    <span className="text-success fw-bold">
                                        ₹{value.toLocaleString()}
                                    </span>
                                ),
                            },
                            {
                                title: 'Commissioning Status',
                                dataIndex: 'commissioningStatus',
                                key: 'commissioningStatus',
                                render: (status) => (
                                    <Tag color={
                                        status === 'Completed' ? 'green' : 
                                        status === 'In Progress' ? 'orange' : 'default'
                                    }>
                                        {status}
                                    </Tag>
                                ),
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                render: (_, record) => (
                                    <Space>
                                        <Button type="link" icon={<EditOutlined />} title="Edit" />
                                    </Space>
                                ),
                            },
                        ]}
                        pagination={false}
                        rowKey="id"
                        size="small"
                        bordered
                    />

                    {/* Pagination Controls */}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <div className="d-flex align-items-center gap-3">
                            <span className="text-muted">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
                            </span>
                            <div className="d-flex align-items-center gap-2">
                                <label className="form-label mb-0">Show:</label>
                                <select
                                    className="form-select form-select-sm"
                                    style={{ width: 'auto' }}
                                    value={itemsPerPage}
                                    onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                                <span className="text-muted">entries</span>
                            </div>
                        </div>

                        <nav aria-label="Table pagination">
                            <ul className="pagination pagination-sm mb-0">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ArrowLeftOutlined />
                                    </button>
                                </li>
                                
                                {/* Page numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        </li>
                                    );
                                })}
                                
                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ArrowRightOutlined />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Drawer for Add/Edit Record */}
            <div
                className={`offcanvas offcanvas-end ${drawerOpen ? 'show' : ''}`}
                tabIndex="-1"
                style={{ 
                    visibility: drawerOpen ? 'visible' : 'hidden',
                    zIndex: 1055
                }}
            >
                <div className="offcanvas-header border-bottom">
                    <h5 className="offcanvas-title fw-bold">Add New Procurement Record</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={toggleDrawer}
                    ></button>
                </div>
                <div className="offcanvas-body" style={{ padding: '24px' }}>
                    <form>
                        {/* Procurement Info Section */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#1890ff', fontSize: '16px' }}>
                                    <ShoppingCartOutlined className="me-2" />
                                    Procurement Information
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>PO Number *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.poNumber}
                                            onChange={(e) => handleInputChange('poNumber', e.target.value)}
                                            placeholder="e.g., PO/BN/2025/105"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>PO Date *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.poDate}
                                            onChange={(e) => handleInputChange('poDate', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Vendor *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.vendor}
                                            onChange={(e) => handleInputChange('vendor', e.target.value)}
                                            placeholder="Enter vendor name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Asset Category *</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.assetCategory}
                                            onChange={(e) => handleInputChange('assetCategory', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            <option value="OLT">OLT</option>
                                            <option value="Router">Router</option>
                                            <option value="OFC">OFC</option>
                                            <option value="Switch">Switch</option>
                                            <option value="UPS">UPS</option>
                                            <option value="Cable">Cable</option>
                                            <option value="Antenna">Antenna</option>
                                            <option value="Server">Server</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Asset Subcategory</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.assetSubcategory}
                                            onChange={(e) => handleInputChange('assetSubcategory', e.target.value)}
                                            placeholder="e.g., Huawei MA5800"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Requested Quantity *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.requestedQuantity}
                                            onChange={(e) => handleInputChange('requestedQuantity', e.target.value)}
                                            placeholder="Enter quantity"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Unit Cost (₹) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.unitCost}
                                            onChange={(e) => handleInputChange('unitCost', e.target.value)}
                                            placeholder="Enter unit cost"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Total PO Value (₹)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                            value={formData.totalPOValue}
                                            onChange={(e) => handleInputChange('totalPOValue', e.target.value)}
                                            placeholder="Auto-calculated"
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Expected Delivery Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.expectedDeliveryDate}
                                            onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Goods Receipt Section */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#17a2b8', fontSize: '16px' }}>
                                    <InboxOutlined className="me-2" />
                                    Goods Receipt / Inventory
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Received Quantity</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.receivedQuantity}
                                            onChange={(e) => handleInputChange('receivedQuantity', e.target.value)}
                                            placeholder="Enter received quantity"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Received Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.receivedDate}
                                            onChange={(e) => handleInputChange('receivedDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Batch / Serial Numbers</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.batchSerialNumbers}
                                            onChange={(e) => handleInputChange('batchSerialNumbers', e.target.value)}
                                            placeholder="e.g., ASSET-TEL-000123 to 000170"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Received Condition</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.receivedCondition}
                                            onChange={(e) => handleInputChange('receivedCondition', e.target.value)}
                                        >
                                            <option value="">Select Condition</option>
                                            <option value="Good">Good</option>
                                            <option value="Damaged">Damaged</option>
                                            <option value="Poor">Poor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Deployment Info Section */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#28a745', fontSize: '16px' }}>
                                    <TruckOutlined className="me-2" />
                                    Deployment Information
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Deployed Quantity</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.deployedQuantity}
                                            onChange={(e) => handleInputChange('deployedQuantity', e.target.value)}
                                            placeholder="Enter deployed quantity"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Deployment Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.deploymentDate}
                                            onChange={(e) => handleInputChange('deploymentDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Deployment Location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.deploymentLocation}
                                            onChange={(e) => handleInputChange('deploymentLocation', e.target.value)}
                                            placeholder="e.g., POP - Chennai North"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Installed By</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.installedBy}
                                            onChange={(e) => handleInputChange('installedBy', e.target.value)}
                                            placeholder="e.g., Field Team Alpha"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Commissioning Status</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.commissioningStatus}
                                            onChange={(e) => handleInputChange('commissioningStatus', e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Completed">Completed</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Exceptions & Notes Section */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#ffc107', fontSize: '16px' }}>
                                    <ExclamationCircleOutlined className="me-2" />
                                    Exceptions & Notes
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Pending Deployment</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.pendingDeployment}
                                            onChange={(e) => handleInputChange('pendingDeployment', e.target.value)}
                                            placeholder="Enter pending quantity"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Damaged / Missing</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.damagedMissing}
                                            onChange={(e) => handleInputChange('damagedMissing', e.target.value)}
                                            placeholder="Enter damaged/missing quantity"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Delay Reasons</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.delayReasons}
                                            onChange={(e) => handleInputChange('delayReasons', e.target.value)}
                                            placeholder="Enter delay reasons if any"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Remarks</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }}
                                            value={formData.remarks}
                                            onChange={(e) => handleInputChange('remarks', e.target.value)}
                                            placeholder="Enter any additional remarks or observations"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ 
                            marginTop: '32px', 
                            paddingTop: '24px', 
                            borderTop: '1px solid #e9ecef',
                            backgroundColor: '#f8f9fa',
                            padding: '20px 24px',
                            borderRadius: '8px',
                            margin: '32px -24px -24px -24px'
                        }}>
                            <div className="d-flex gap-3 justify-content-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    style={{ 
                                        padding: '10px 20px', 
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                    onClick={toggleDrawer}
                                >
                                    <CloseOutlined className="me-2" />
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    style={{ 
                                        padding: '10px 20px', 
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                    onClick={saveAsDraft}
                                >
                                    <SaveOutlined className="me-2" />
                                    Save as Draft
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    style={{ 
                                        padding: '10px 20px', 
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        backgroundColor: '#1890ff',
                                        borderColor: '#1890ff'
                                    }}
                                    onClick={submitForm}
                                >
                                    <CheckCircleOutlined className="me-2" />
                                    Save Record
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Backdrop for drawer */}
            {drawerOpen && (
                <div
                    className="offcanvas-backdrop fade show"
                    style={{ zIndex: 1050 }}
                    onClick={toggleDrawer}
                ></div>
            )}
        </div>
    );
};

export default AssetProcurementDeploymentReport;