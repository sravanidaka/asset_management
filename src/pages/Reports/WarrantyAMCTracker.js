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
    SafetyCertificateOutlined, 
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
    CheckCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';

const WarrantyAMCTracker = () => {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContractType, setSelectedContractType] = useState('');
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
            field: 'Warranty Expiry Date',
            operator: '>',
            value: '@Today - 30',
            logicalOperator: null // null for first row
        },
        {
            id: 2,
            field: 'AMC Status',
            operator: '=',
            value: '[Any]',
            logicalOperator: 'And'
        },
        {
            id: 3,
            field: 'Contract Type',
            operator: '=',
            value: '[Any]',
            logicalOperator: 'And'
        }
    ]);

    // Advanced filters state
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        numeric: {
            contractValue: { operator: '>=', value: '' },
            serviceCallsLogged: { operator: '>=', value: '' },
            downtime: { operator: '>=', value: '' }
        },
        dateRange: {
            warrantyStartDate: { from: '', to: '' },
            warrantyExpiryDate: { from: '', to: '' },
            amcStartDate: { from: '', to: '' },
            amcEndDate: { from: '', to: '' }
        },
        text: {
            location: '',
            vendor: '',
            assetCategory: '',
            warrantyStatus: '',
            amcStatus: '',
            amcCoverage: ''
        },
        multiSelect: {
            vendors: [],
            locations: [],
            categories: [],
            statuses: []
        }
    });
    
    // Report customization state
    const [reportSettings, setReportSettings] = useState({
        includeAssetDetails: true,
        includeWarrantyInfo: true,
        includeAMCInfo: true,
        includeServiceSLA: true,
        groupBy: '',
        sortBy: 'warrantyExpiryDate',
        sortOrder: 'asc',
        dateRange: {
            from: '',
            to: ''
        },
        exportFormat: 'pdf',
        alertDays: 30
    });
    
    const [filters, setFilters] = useState({
        dateRange: '',
        contractType: '',
        status: '',
        vendor: ''
    });

    // Comprehensive form data for warranty/AMC details
    const [formData, setFormData] = useState({
        // Asset Details
        assetId: '',
        assetName: '',
        assetCategory: '',
        assetSubcategory: '',
        locationSite: '',
        
        // Warranty Info
        warrantyStartDate: '',
        warrantyPeriod: '',
        warrantyExpiryDate: '',
        warrantyStatus: '',
        vendorManufacturer: '',
        
        // AMC Info
        amcStartDate: '',
        amcEndDate: '',
        amcCoverage: '',
        amcValue: '',
        amcVendor: '',
        amcStatus: '',
        nextRenewalReminder: '',
        
        // Service & SLA
        serviceCallsLogged: '',
        downtime: '',
        slaCompliance: '',
        lastServiceDate: '',
        remarks: '',
        slaResponseTime: '',
        slaResolutionTime: '',
        
        // Additional Details
        contractId: '',
        purchaseDate: '',
        invoiceNumber: '',
        contractDocument: '',
        renewalHistory: '',
        escalationContact: '',
        contactPerson: '',
        contactNumber: '',
        notes: '',
        serviceLevel: '',
        responseTime: '',
        resolutionTime: '',
        preventiveMaintenance: '',
        correctiveMaintenance: '',
        partsReplacement: '',
        laborCost: '',
        partsCost: '',
        totalServiceCost: '',
        warrantyClaimed: '',
        amcUtilized: '',
        performanceRating: '',
        customerSatisfaction: '',
        notes: ''
    });

    // Sample data for the table
    const [tableData, setTableData] = useState([
        {
            id: 1,
            contractId: 'CNT-001',
            assetId: 'ASSET-TEL-000456',
            assetName: 'Huawei OLT MA5800',
            assetCategory: 'Telecom Equipment',
            assetSubcategory: 'OLT',
            locationSite: 'POP - Chennai North',
            warrantyStartDate: '2025-01-10',
            warrantyPeriod: '24 months',
            warrantyExpiryDate: '2027-01-09',
            warrantyStatus: 'Active',
            vendorManufacturer: 'Huawei',
            amcStartDate: '2025-01-15',
            amcEndDate: '2026-01-14',
            amcCoverage: 'Full Coverage',
            amcValue: 120000,
            amcVendor: 'HFCL AMC Division',
            amcStatus: 'Active',
            nextRenewalReminder: '2025-12-15',
            serviceCallsLogged: 3,
            downtime: 12,
            slaCompliance: 'Yes',
            lastServiceDate: '2025-09-10',
            remarks: 'Minor repairs done, SLA met'
        },
        {
            id: 2,
            contractId: 'CNT-002',
            assetId: 'ASSET-TEL-000457',
            assetName: 'Cisco Router ASR1000',
            assetCategory: 'IT Equipment',
            assetSubcategory: 'Router',
            locationSite: 'POP - Mumbai Central',
            warrantyStartDate: '2024-06-01',
            warrantyPeriod: '36 months',
            warrantyExpiryDate: '2027-05-31',
            warrantyStatus: 'Active',
            vendorManufacturer: 'Cisco',
            amcStartDate: '2024-06-01',
            amcEndDate: '2025-05-31',
            amcCoverage: 'Preventive & Corrective',
            amcValue: 85000,
            amcVendor: 'TechCorp AMC',
            amcStatus: 'Expiring Soon',
            nextRenewalReminder: '2025-04-01',
            serviceCallsLogged: 2,
            downtime: 8,
            slaCompliance: 'Yes',
            lastServiceDate: '2025-08-15',
            remarks: 'Regular maintenance completed'
        },
        {
            id: 3,
            contractId: 'CNT-003',
            assetId: 'ASSET-TEL-000458',
            assetName: 'APC UPS Smart-UPS 3000',
            assetCategory: 'Power Equipment',
            assetSubcategory: 'UPS',
            locationSite: 'POP - Bangalore South',
            warrantyStartDate: '2023-12-01',
            warrantyPeriod: '24 months',
            warrantyExpiryDate: '2025-11-30',
            warrantyStatus: 'Active',
            vendorManufacturer: 'APC',
            amcStartDate: '2023-12-01',
            amcEndDate: '2024-11-30',
            amcCoverage: 'Full Coverage',
            amcValue: 45000,
            amcVendor: 'PowerTech Solutions',
            amcStatus: 'Expired',
            nextRenewalReminder: '2024-10-01',
            serviceCallsLogged: 5,
            downtime: 24,
            slaCompliance: 'No',
            lastServiceDate: '2024-10-20',
            remarks: 'AMC expired, renewal pending'
        },
        {
            id: 4,
            contractId: 'CNT-004',
            assetId: 'ASSET-TEL-000459',
            assetName: 'Fiber Optic Cable 48F',
            assetCategory: 'Telecom Equipment',
            assetSubcategory: 'Fiber Cable',
            locationSite: 'POP - Delhi East',
            warrantyStartDate: '2024-03-15',
            warrantyPeriod: '12 months',
            warrantyExpiryDate: '2025-03-14',
            warrantyStatus: 'Active',
            vendorManufacturer: 'Corning',
            amcStartDate: '2024-03-15',
            amcEndDate: '2025-03-14',
            amcCoverage: 'Corrective Only',
            amcValue: 25000,
            amcVendor: 'CableCare Services',
            amcStatus: 'Active',
            nextRenewalReminder: '2025-02-15',
            serviceCallsLogged: 1,
            downtime: 4,
            slaCompliance: 'Yes',
            lastServiceDate: '2025-07-05',
            remarks: 'Cable replacement completed'
        },
        {
            id: 5,
            contractId: 'CNT-005',
            assetId: 'ASSET-TEL-000460',
            assetName: 'Dell Server PowerEdge R740',
            assetCategory: 'IT Equipment',
            assetSubcategory: 'Server',
            locationSite: 'POP - Hyderabad West',
            warrantyStartDate: '2024-01-20',
            warrantyPeriod: '60 months',
            warrantyExpiryDate: '2029-01-19',
            warrantyStatus: 'Active',
            vendorManufacturer: 'Dell',
            amcStartDate: '2024-01-20',
            amcEndDate: '2025-01-19',
            amcCoverage: 'Full Coverage',
            amcValue: 95000,
            amcVendor: 'Dell ProSupport',
            amcStatus: 'Active',
            nextRenewalReminder: '2024-12-20',
            serviceCallsLogged: 0,
            downtime: 0,
            slaCompliance: 'Yes',
            lastServiceDate: '2024-01-20',
            remarks: 'No service calls required'
        },
        {
            id: 6,
            contractId: 'CNT-006',
            assetId: 'ASSET-TEL-000461',
            assetName: 'Nokia BTS Flexi Multiradio',
            assetCategory: 'Telecom Equipment',
            assetSubcategory: 'BTS',
            locationSite: 'POP - Pune North',
            warrantyStartDate: '2023-08-10',
            warrantyPeriod: '36 months',
            warrantyExpiryDate: '2026-08-09',
            warrantyStatus: 'Active',
            vendorManufacturer: 'Nokia',
            amcStartDate: '2023-08-10',
            amcEndDate: '2024-08-09',
            amcCoverage: 'Preventive & Corrective',
            amcValue: 150000,
            amcVendor: 'Nokia Care Services',
            amcStatus: 'Expired',
            nextRenewalReminder: '2024-07-10',
            serviceCallsLogged: 8,
            downtime: 36,
            slaCompliance: 'No',
            lastServiceDate: '2024-07-25',
            remarks: 'Multiple service calls, AMC renewal required'
        },
        {
            id: 7,
            contractId: 'CNT-007',
            assetId: 'ASSET-TEL-000462',
            assetName: 'Schneider Electric UPS Galaxy',
            assetCategory: 'Power Equipment',
            assetSubcategory: 'UPS',
            locationSite: 'POP - Kolkata Central',
            warrantyStartDate: '2024-05-01',
            warrantyPeriod: '24 months',
            warrantyExpiryDate: '2026-04-30',
            warrantyStatus: 'Active',
            vendorManufacturer: 'Schneider Electric',
            amcStartDate: '2024-05-01',
            amcEndDate: '2025-04-30',
            amcCoverage: 'Full Coverage',
            amcValue: 75000,
            amcVendor: 'Schneider Services',
            amcStatus: 'Active',
            nextRenewalReminder: '2025-03-01',
            serviceCallsLogged: 2,
            downtime: 6,
            slaCompliance: 'Yes',
            lastServiceDate: '2025-06-15',
            remarks: 'Battery replacement completed'
        },
        {
            id: 8,
            contractId: 'CNT-008',
            assetId: 'ASSET-TEL-000463',
            assetName: 'Juniper Switch EX4300',
            assetCategory: 'IT Equipment',
            assetSubcategory: 'Switch',
            locationSite: 'POP - Ahmedabad South',
            warrantyStartDate: '2024-02-15',
            warrantyPeriod: '36 months',
            warrantyExpiryDate: '2027-02-14',
            warrantyStatus: 'Active',
            vendorManufacturer: 'Juniper',
            amcStartDate: '2024-02-15',
            amcEndDate: '2025-02-14',
            amcCoverage: 'Preventive & Corrective',
            amcValue: 65000,
            amcVendor: 'Juniper Care',
            amcStatus: 'Active',
            nextRenewalReminder: '2025-01-15',
            serviceCallsLogged: 1,
            downtime: 2,
            slaCompliance: 'Yes',
            lastServiceDate: '2025-05-20',
            remarks: 'Software update completed'
        }
    ]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
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

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
                    case 'Warranty Expiry Date':
                        fieldValue = item.warrantyExpiryDate || '';
                        break;
                    case 'AMC Status':
                        fieldValue = item.amcStatus || '';
                        break;
                    case 'Contract Type':
                        fieldValue = (item.warrantyStatus === 'Active' && item.amcStatus === 'Active') ? 'Both' : 
                                   (item.warrantyStatus === 'Active') ? 'Warranty' : 
                                   (item.amcStatus === 'Active') ? 'AMC' : 'None';
                        break;
                    case 'Asset ID':
                        fieldValue = item.assetId || '';
                        break;
                    case 'Asset Name':
                        fieldValue = item.assetName || '';
                        break;
                    case 'Location':
                        fieldValue = item.locationSite || '';
                        break;
                    case 'AMC Value':
                        fieldValue = item.amcValue || '';
                        break;
                    case 'Vendor':
                        fieldValue = item.vendorManufacturer || item.amcVendor || '';
                        break;
                    case 'Warranty Status':
                        fieldValue = item.warrantyStatus || '';
                        break;
                    case 'Asset Category':
                        fieldValue = item.assetCategory || '';
                        break;
                    case 'AMC Coverage':
                        fieldValue = item.amcCoverage || '';
                        break;
                    case 'Service Calls Logged':
                        fieldValue = item.serviceCallsLogged || '';
                        break;
                    case 'Downtime':
                        fieldValue = item.downtime || '';
                        break;
                    case 'SLA Compliance':
                        fieldValue = item.slaCompliance || '';
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

    const clearAllFilters = () => {
        setQueryFilters([
            {
                id: 1,
                field: 'Warranty Expiry Date',
                operator: '>',
                value: '@Today - 30',
                logicalOperator: null
            },
            {
                id: 2,
                field: 'AMC Status',
                operator: '=',
                value: '[Any]',
                logicalOperator: 'And'
            },
            {
                id: 3,
                field: 'Contract Type',
                operator: '=',
                value: '[Any]',
                logicalOperator: 'And'
            }
        ]);
        setAdvancedFilters({
            numeric: {
                contractValue: { operator: '>=', value: '' },
                serviceCallsLogged: { operator: '>=', value: '' },
                downtime: { operator: '>=', value: '' }
            },
            dateRange: {
                warrantyStartDate: { from: '', to: '' },
                warrantyExpiryDate: { from: '', to: '' },
                amcStartDate: { from: '', to: '' },
                amcEndDate: { from: '', to: '' }
            },
            text: {
                location: '',
                vendor: '',
                assetCategory: '',
                warrantyStatus: '',
                amcStatus: '',
                amcCoverage: ''
            },
            multiSelect: {
                vendors: [],
                locations: [],
                categories: [],
                statuses: []
            }
        });
        setSearchTerm('');
        setSelectedContractType('');
        setSelectedStatus('');
    };

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

    const generateReport = () => {
        console.log('Generating Warranty / AMC Tracker Report with filters:', filters);
    };

    const exportReport = () => {
        const csvContent = [
            ['Contract ID', 'Asset ID', 'Asset Name', 'Asset Category', 'Location', 'Warranty Start Date', 'Warranty Expiry Date', 'Warranty Status', 'Vendor/Manufacturer', 'AMC Start Date', 'AMC End Date', 'AMC Coverage', 'AMC Value (₹)', 'AMC Vendor', 'AMC Status', 'Service Calls Logged', 'Downtime (Hrs)', 'SLA Compliance', 'Last Service Date', 'Remarks'],
            ...filteredData.map(item => [
                item.contractId,
                item.assetId,
                item.assetName,
                item.assetCategory,
                item.locationSite,
                item.warrantyStartDate,
                item.warrantyExpiryDate,
                item.warrantyStatus,
                item.vendorManufacturer,
                item.amcStartDate,
                item.amcEndDate,
                item.amcCoverage,
                item.amcValue,
                item.amcVendor,
                item.amcStatus,
                item.serviceCallsLogged,
                item.downtime,
                item.slaCompliance,
                item.lastServiceDate,
                item.remarks
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `warranty_amc_tracker_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const saveAsDraft = () => {
        console.log('Saving as draft:', formData);
        setDrawerOpen(false);
    };

    const submitForm = () => {
        console.log('Submitting form:', formData);
        // Add new warranty/AMC to table data
        const newContract = {
            id: tableData.length + 1,
            contractId: `CNT-${String(tableData.length + 1).padStart(3, '0')}`,
            assetId: formData.assetId,
            assetName: formData.assetName,
            assetCategory: formData.assetCategory,
            assetSubcategory: formData.assetSubcategory,
            locationSite: formData.locationSite,
            warrantyStartDate: formData.warrantyStartDate,
            warrantyPeriod: formData.warrantyPeriod,
            warrantyExpiryDate: formData.warrantyExpiryDate,
            warrantyStatus: formData.warrantyStatus,
            vendorManufacturer: formData.vendorManufacturer,
            amcStartDate: formData.amcStartDate,
            amcEndDate: formData.amcEndDate,
            amcCoverage: formData.amcCoverage,
            amcValue: parseFloat(formData.amcValue) || 0,
            amcVendor: formData.amcVendor,
            amcStatus: formData.amcStatus,
            nextRenewalReminder: formData.nextRenewalReminder,
            serviceCallsLogged: parseInt(formData.serviceCallsLogged) || 0,
            downtime: parseFloat(formData.downtime) || 0,
            slaCompliance: formData.slaCompliance,
            lastServiceDate: formData.lastServiceDate,
            remarks: formData.remarks
        };
        setTableData(prev => [...prev, newContract]);
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

    // Advanced filtering and sorting logic
    const filteredData = useMemo(() => {
        let filtered = tableData.filter(item => {
            // Basic search filter
            const matchesSearch = searchTerm === '' ||
                item.contractId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.locationSite.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.vendorManufacturer.toLowerCase().includes(searchTerm.toLowerCase());

            // Basic filters
            const matchesContractType = selectedContractType === '' || 
                (selectedContractType === 'Warranty' && item.warrantyStatus === 'Active') ||
                (selectedContractType === 'AMC' && item.amcStatus === 'Active') ||
                (selectedContractType === 'Both' && item.warrantyStatus === 'Active' && item.amcStatus === 'Active');

            const matchesStatus = selectedStatus === '' || 
                item.warrantyStatus === selectedStatus || 
                item.amcStatus === selectedStatus;

            // Advanced filters - Numeric
            const matchesContractValue = applyNumericFilter(
                item.amcValue, 
                advancedFilters.numeric.contractValue.value, 
                advancedFilters.numeric.contractValue.operator
            );
            const matchesServiceCallsLogged = applyNumericFilter(
                item.serviceCallsLogged, 
                advancedFilters.numeric.serviceCallsLogged.value, 
                advancedFilters.numeric.serviceCallsLogged.operator
            );
            const matchesDowntime = applyNumericFilter(
                item.downtime, 
                advancedFilters.numeric.downtime.value, 
                advancedFilters.numeric.downtime.operator
            );

            // Advanced filters - Date Range
            const matchesWarrantyStartDate = applyDateRangeFilter(
                item.warrantyStartDate, 
                advancedFilters.dateRange.warrantyStartDate.from, 
                advancedFilters.dateRange.warrantyStartDate.to
            );
            const matchesWarrantyExpiryDate = applyDateRangeFilter(
                item.warrantyExpiryDate, 
                advancedFilters.dateRange.warrantyExpiryDate.from, 
                advancedFilters.dateRange.warrantyExpiryDate.to
            );
            const matchesAmcStartDate = applyDateRangeFilter(
                item.amcStartDate, 
                advancedFilters.dateRange.amcStartDate.from, 
                advancedFilters.dateRange.amcStartDate.to
            );
            const matchesAmcEndDate = applyDateRangeFilter(
                item.amcEndDate, 
                advancedFilters.dateRange.amcEndDate.from, 
                advancedFilters.dateRange.amcEndDate.to
            );

            // Advanced filters - Text
            const matchesLocation = !advancedFilters.text.location || 
                item.locationSite.toLowerCase().includes(advancedFilters.text.location.toLowerCase());
            const matchesVendor = !advancedFilters.text.vendor || 
                item.vendorManufacturer.toLowerCase().includes(advancedFilters.text.vendor.toLowerCase()) || 
                item.amcVendor.toLowerCase().includes(advancedFilters.text.vendor.toLowerCase());
            const matchesAssetCategory = !advancedFilters.text.assetCategory || 
                item.assetCategory.toLowerCase().includes(advancedFilters.text.assetCategory.toLowerCase());
            const matchesWarrantyStatus = !advancedFilters.text.warrantyStatus || 
                item.warrantyStatus.toLowerCase().includes(advancedFilters.text.warrantyStatus.toLowerCase());
            const matchesAmcStatus = !advancedFilters.text.amcStatus || 
                item.amcStatus.toLowerCase().includes(advancedFilters.text.amcStatus.toLowerCase());
            const matchesAmcCoverage = !advancedFilters.text.amcCoverage || 
                item.amcCoverage.toLowerCase().includes(advancedFilters.text.amcCoverage.toLowerCase());

            // Advanced filters - Multi-select
            const matchesVendorsMulti = advancedFilters.multiSelect.vendors.length === 0 || 
                advancedFilters.multiSelect.vendors.includes(item.vendorManufacturer) ||
                advancedFilters.multiSelect.vendors.includes(item.amcVendor);
            const matchesLocationsMulti = advancedFilters.multiSelect.locations.length === 0 || 
                advancedFilters.multiSelect.locations.includes(item.locationSite);
            const matchesCategoriesMulti = advancedFilters.multiSelect.categories.length === 0 || 
                advancedFilters.multiSelect.categories.includes(item.assetCategory);
            const matchesStatusesMulti = advancedFilters.multiSelect.statuses.length === 0 || 
                advancedFilters.multiSelect.statuses.includes(item.warrantyStatus) ||
                advancedFilters.multiSelect.statuses.includes(item.amcStatus);

            return matchesSearch && matchesContractType && matchesStatus && matchesContractValue && 
                   matchesServiceCallsLogged && matchesDowntime && matchesWarrantyStartDate && 
                   matchesWarrantyExpiryDate && matchesAmcStartDate && matchesAmcEndDate && 
                   matchesLocation && matchesVendor && matchesAssetCategory && matchesWarrantyStatus && 
                   matchesAmcStatus && matchesAmcCoverage && matchesVendorsMulti && matchesLocationsMulti && 
                   matchesCategoriesMulti && matchesStatusesMulti;
        });

        // Apply query filters
        filtered = applyQueryFilters(filtered);

        // Sorting
        if (sortField) {
            filtered.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Handle different data types
                if (sortField === 'amcValue' || sortField === 'serviceCallsLogged' || sortField === 'downtime') {
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                } else if (sortField === 'warrantyStartDate' || sortField === 'warrantyExpiryDate' || sortField === 'amcStartDate' || sortField === 'amcEndDate' || sortField === 'lastServiceDate') {
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
    }, [tableData, searchTerm, selectedContractType, selectedStatus, advancedFilters, queryFilters, sortField, sortDirection]);

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Pagination handlers
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
                <h2 className="fw-bold mb-0">Warranty / AMC Tracker</h2>
                <p className="text-muted mt-2">Tracks contract renewals and warranty expiries</p>
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
                                Add Contract
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
                                            { value: 'Warranty Expiry Date', label: 'Warranty Expiry Date' },
                                            { value: 'AMC Status', label: 'AMC Status' },
                                            { value: 'Contract Type', label: 'Contract Type' },
                                            { value: 'Asset ID', label: 'Asset ID' },
                                            { value: 'Asset Name', label: 'Asset Name' },
                                            { value: 'Location', label: 'Location' },
                                            { value: 'AMC Value', label: 'AMC Value' },
                                            { value: 'Vendor', label: 'Vendor' },
                                            { value: 'Warranty Status', label: 'Warranty Status' },
                                            { value: 'Asset Category', label: 'Asset Category' },
                                            { value: 'AMC Coverage', label: 'AMC Coverage' },
                                            { value: 'Service Calls Logged', label: 'Service Calls Logged' },
                                            { value: 'Downtime', label: 'Downtime' },
                                            { value: 'SLA Compliance', label: 'SLA Compliance' }
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

            {/* Advanced Filters Section */}
            {advancedFiltersOpen && (
                <div className="card custom-shadow mb-4">
                    <div className="card-header bg-light">
                        <h6 className="mb-0 fw-bold">
                            <FilterOutlined className="me-2" />
                            Advanced Filters
                        </h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            {/* Contract Value Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">AMC Value (₹)</label>
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select"
                                        value={advancedFilters.contractValue.operator}
                                        onChange={(e) => handleAdvancedFilterChange('contractValue', 'operator', e.target.value)}
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
                                        placeholder="Amount"
                                        value={advancedFilters.contractValue.value}
                                        onChange={(e) => handleAdvancedFilterChange('contractValue', 'value', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Warranty Start Date Range */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Warranty Start From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.warrantyStartDate.from}
                                    onChange={(e) => handleAdvancedFilterChange('warrantyStartDate', 'from', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Warranty Start To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.warrantyStartDate.to}
                                    onChange={(e) => handleAdvancedFilterChange('warrantyStartDate', 'to', e.target.value)}
                                />
                            </div>

                            {/* Warranty Expiry Date Range */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Warranty Expiry From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.warrantyExpiryDate.from}
                                    onChange={(e) => handleAdvancedFilterChange('warrantyExpiryDate', 'from', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Warranty Expiry To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.warrantyExpiryDate.to}
                                    onChange={(e) => handleAdvancedFilterChange('warrantyExpiryDate', 'to', e.target.value)}
                                />
                            </div>

                            {/* AMC Start Date Range */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">AMC Start From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.amcStartDate.from}
                                    onChange={(e) => handleAdvancedFilterChange('amcStartDate', 'from', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">AMC Start To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.amcStartDate.to}
                                    onChange={(e) => handleAdvancedFilterChange('amcStartDate', 'to', e.target.value)}
                                />
                            </div>

                            {/* AMC End Date Range */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">AMC End From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.amcEndDate.from}
                                    onChange={(e) => handleAdvancedFilterChange('amcEndDate', 'from', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">AMC End To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.amcEndDate.to}
                                    onChange={(e) => handleAdvancedFilterChange('amcEndDate', 'to', e.target.value)}
                                />
                            </div>

                            {/* Service Calls Logged Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Service Calls Logged</label>
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select"
                                        value={advancedFilters.serviceCallsLogged.operator}
                                        onChange={(e) => handleAdvancedFilterChange('serviceCallsLogged', 'operator', e.target.value)}
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
                                        placeholder="Count"
                                        value={advancedFilters.serviceCallsLogged.value}
                                        onChange={(e) => handleAdvancedFilterChange('serviceCallsLogged', 'value', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Downtime Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Downtime (Hours)</label>
                                <div className="d-flex gap-2">
                                    <select
                                        className="form-select"
                                        value={advancedFilters.downtime.operator}
                                        onChange={(e) => handleAdvancedFilterChange('downtime', 'operator', e.target.value)}
                                    >
                                        <option value=">=">&gt;=</option>
                                        <option value="<=">&lt;=</option>
                                        <option value="=">=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                    </select>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="form-control"
                                        placeholder="Hours"
                                        value={advancedFilters.downtime.value}
                                        onChange={(e) => handleAdvancedFilterChange('downtime', 'value', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Location Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by location"
                                    value={advancedFilters.location}
                                    onChange={(e) => handleAdvancedFilterChange('location', null, e.target.value)}
                                />
                            </div>

                            {/* Vendor Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Vendor</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by vendor"
                                    value={advancedFilters.vendor}
                                    onChange={(e) => handleAdvancedFilterChange('vendor', null, e.target.value)}
                                />
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
                                    <option value="Telecom Equipment">Telecom Equipment</option>
                                    <option value="IT Equipment">IT Equipment</option>
                                    <option value="Power Equipment">Power Equipment</option>
                                </select>
                            </div>

                            {/* Warranty Status Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Warranty Status</label>
                                <select
                                    className="form-select"
                                    value={advancedFilters.warrantyStatus}
                                    onChange={(e) => handleAdvancedFilterChange('warrantyStatus', null, e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                </select>
                            </div>

                            {/* AMC Status Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">AMC Status</label>
                                <select
                                    className="form-select"
                                    value={advancedFilters.amcStatus}
                                    onChange={(e) => handleAdvancedFilterChange('amcStatus', null, e.target.value)}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Expiring Soon">Expiring Soon</option>
                                </select>
                            </div>

                            {/* AMC Coverage Filter */}
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">AMC Coverage</label>
                                <select
                                    className="form-select"
                                    value={advancedFilters.amcCoverage}
                                    onChange={(e) => handleAdvancedFilterChange('amcCoverage', null, e.target.value)}
                                >
                                    <option value="">All Coverage Types</option>
                                    <option value="Full Coverage">Full Coverage</option>
                                    <option value="Preventive & Corrective">Preventive & Corrective</option>
                                    <option value="Corrective Only">Corrective Only</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card custom-shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">Warranty & AMC Summary</h5>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Total Contracts</h6>
                                    <h4 className="text-primary">{filteredData.length}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Active</h6>
                                    <h4 className="text-success">{filteredData.filter(item => item.warrantyStatus === 'Active' || item.amcStatus === 'Active').length}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Expiring Soon</h6>
                                    <h4 className="text-warning">{filteredData.filter(item => item.amcStatus === 'Expiring Soon').length}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Expired</h6>
                                    <h4 className="text-danger">{filteredData.filter(item => item.warrantyStatus === 'Expired' || item.amcStatus === 'Expired').length}</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Table
                        dataSource={paginatedData}
                        columns={[
                            {
                                title: 'Contract ID',
                                dataIndex: 'contractId',
                                key: 'contractId',
                            },
                            {
                                title: 'Asset ID',
                                dataIndex: 'assetId',
                                key: 'assetId',
                            },
                            {
                                title: 'Asset Name',
                                dataIndex: 'assetName',
                                key: 'assetName',
                            },
                            {
                                title: 'Warranty Status',
                                dataIndex: 'warrantyStatus',
                                key: 'warrantyStatus',
                                render: (status) => (
                                    <Tag color={status === 'Active' ? 'green' : 'red'}>
                                        {status}
                                    </Tag>
                                ),
                            },
                            {
                                title: 'AMC Status',
                                dataIndex: 'amcStatus',
                                key: 'amcStatus',
                                render: (status) => (
                                    <Tag color={
                                        status === 'Active' ? 'green' : 
                                        status === 'Expiring Soon' ? 'orange' : 'red'
                                    }>
                                        {status}
                                    </Tag>
                                ),
                            },
                            {
                                title: 'AMC Value (₹)',
                                dataIndex: 'amcValue',
                                key: 'amcValue',
                                render: (value) => (
                                    <span className="text-success fw-bold">
                                        ₹{value.toLocaleString()}
                                    </span>
                                ),
                            },
                            {
                                title: 'Expiry Date',
                                dataIndex: 'warrantyExpiryDate',
                                key: 'warrantyExpiryDate',
                                render: (date) => (
                                    <Tag color={new Date(date) > new Date() ? 'green' : 'red'}>
                                        {date}
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

            {/* Drawer for Add/Edit Contract */}
            <div
                className={`offcanvas offcanvas-end ${drawerOpen ? 'show' : ''}`}
                tabIndex="-1"
                style={{ 
                    visibility: drawerOpen ? 'visible' : 'hidden',
                    zIndex: 1055
                }}
            >
                <div className="offcanvas-header border-bottom">
                    <h5 className="offcanvas-title fw-bold">Add New Contract</h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={toggleDrawer}
                    ></button>
                </div>
                <div className="offcanvas-body" style={{ padding: '24px' }}>
                    <form>
                        {/* Asset Details Section */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#1890ff', fontSize: '16px' }}>
                                    <EnvironmentOutlined className="me-2" />
                                    Asset Details
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Asset ID *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.assetId}
                                            onChange={(e) => handleInputChange('assetId', e.target.value)}
                                            placeholder="Enter Asset ID"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Asset Name *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.assetName}
                                            onChange={(e) => handleInputChange('assetName', e.target.value)}
                                            placeholder="Enter Asset Name"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Asset Category</label>
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
                                        >
                                            <option value="">Select Category</option>
                                            <option value="IT Equipment">IT Equipment</option>
                                            <option value="Office Furniture">Office Furniture</option>
                                            <option value="Machinery">Machinery</option>
                                            <option value="Vehicles">Vehicles</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Location/Site</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.locationSite}
                                            onChange={(e) => handleInputChange('locationSite', e.target.value)}
                                            placeholder="Enter Location"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Warranty Information Section */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#28a745', fontSize: '16px' }}>
                                    <SafetyCertificateOutlined className="me-2" />
                                    Warranty Information
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Warranty Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.warrantyStartDate}
                                            onChange={(e) => handleInputChange('warrantyStartDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Warranty Period (Months)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.warrantyPeriod}
                                            onChange={(e) => handleInputChange('warrantyPeriod', e.target.value)}
                                            placeholder="Enter warranty period"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Warranty Expiry Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.warrantyExpiryDate}
                                            onChange={(e) => handleInputChange('warrantyExpiryDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Warranty Status</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.warrantyStatus}
                                            onChange={(e) => handleInputChange('warrantyStatus', e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Expired">Expired</option>
                                            <option value="Expiring Soon">Expiring Soon</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Vendor/Manufacturer</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.vendorManufacturer}
                                            onChange={(e) => handleInputChange('vendorManufacturer', e.target.value)}
                                            placeholder="Enter vendor/manufacturer name"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AMC Information Section */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#17a2b8', fontSize: '16px' }}>
                                    <ToolOutlined className="me-2" />
                                    AMC Information
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>AMC Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.amcStartDate}
                                            onChange={(e) => handleInputChange('amcStartDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>AMC End Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.amcEndDate}
                                            onChange={(e) => handleInputChange('amcEndDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>AMC Value (₹)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.amcValue}
                                            onChange={(e) => handleInputChange('amcValue', e.target.value)}
                                            placeholder="Enter AMC value"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>AMC Status</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.amcStatus}
                                            onChange={(e) => handleInputChange('amcStatus', e.target.value)}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Expired">Expired</option>
                                            <option value="Expiring Soon">Expiring Soon</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>AMC Vendor</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.amcVendor}
                                            onChange={(e) => handleInputChange('amcVendor', e.target.value)}
                                            placeholder="Enter AMC vendor name"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service & SLA Section */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#ffc107', fontSize: '16px' }}>
                                    <ClockCircleOutlined className="me-2" />
                                    Service & SLA
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Service Calls Logged</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.serviceCallsLogged}
                                            onChange={(e) => handleInputChange('serviceCallsLogged', e.target.value)}
                                            placeholder="Enter number of service calls"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Downtime (Hours)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.downtime}
                                            onChange={(e) => handleInputChange('downtime', e.target.value)}
                                            placeholder="Enter downtime in hours"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>SLA Response Time (Hours)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.slaResponseTime}
                                            onChange={(e) => handleInputChange('slaResponseTime', e.target.value)}
                                            placeholder="Enter SLA response time"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>SLA Resolution Time (Hours)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.slaResolutionTime}
                                            onChange={(e) => handleInputChange('slaResolutionTime', e.target.value)}
                                            placeholder="Enter SLA resolution time"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Details Section */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#6c757d', fontSize: '16px' }}>
                                    <UserOutlined className="me-2" />
                                    Additional Details
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Contact Person</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.contactPerson}
                                            onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                                            placeholder="Enter contact person name"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Contact Number</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.contactNumber}
                                            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                                            placeholder="Enter contact number"
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Notes/Remarks</label>
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
                                            value={formData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            placeholder="Enter any additional notes or remarks"
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
                                    Save Contract
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

export default WarrantyAMCTracker;
