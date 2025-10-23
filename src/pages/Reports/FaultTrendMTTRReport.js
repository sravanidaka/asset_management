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
    ExclamationCircleOutlined,
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
    CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const FaultTrendMTTRReport = () => {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFaultType, setSelectedFaultType] = useState('');
    const [selectedSeverity, setSelectedSeverity] = useState('');
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Query Editor Filters State
    const [queryFilters, setQueryFilters] = useState([
        {
            id: 1,
            field: 'Fault Date',
            operator: '>',
            value: '@Today - 180',
            logicalOperator: null // null for first row
        },
        {
            id: 2,
            field: 'Fault Type',
            operator: '=',
            value: '[Any]',
            logicalOperator: 'And'
        },
        {
            id: 3,
            field: 'Severity',
            operator: '=',
            value: '[Any]',
            logicalOperator: 'And'
        }
    ]);

    // Advanced filters state
    const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        numeric: {
            mttr: { operator: '>=', value: '' },
            downtime: { operator: '>=', value: '' },
            recurrenceCount: { operator: '>=', value: '' },
            repairCost: { operator: '>=', value: '' }
        },
        dateRange: {
            faultDate: { from: '', to: '' },
            repairStartDate: { from: '', to: '' },
            repairCompletionDate: { from: '', to: '' }
        },
        text: {
            location: '',
            responsibleTeam: '',
            assetCategory: '',
            detectionMethod: '',
            rootCause: '',
            vendor: ''
        },
        multiSelect: {
            faultType: [],
            severity: [],
            status: []
        }
    });
    
    // Report customization state
    const [reportSettings, setReportSettings] = useState({
        includeFaultLogs: true,
        includeMTTRSummary: true,
        includeFaultTrend: true,
        includeDashboard: true,
        groupBy: '',
        sortBy: 'faultDate',
        sortOrder: 'desc',
        dateRange: {
            from: '',
            to: ''
        },
        exportFormat: 'pdf',
        timeAnalysis: 'monthly'
    });
    
    const [filters, setFilters] = useState({
        dateRange: '',
        assetCategory: '',
        priority: '',
        location: ''
    });

    // Comprehensive form data for fault details
    const [formData, setFormData] = useState({
        // Basic Fault Details
        faultId: '',
        assetId: '',
        assetName: '',
        assetCategory: '',
        subcategory: '',
        location: '',
        faultDate: '',
        detectionMethod: '',
        faultType: '',
        faultCategory: '',
        severity: '',
        faultDescription: '',
        
        // Repair Information
        repairStartDate: '',
        repairCompletionDate: '',
        downtime: '',
        mttr: '',
        responsibleTeam: '',
        vendor: '',
        repairDescription: '',
        partsReplaced: '',
        repairCost: '',
        
        // Analysis & Tracking
        recurrenceCount: '',
        rootCause: '',
        preventiveActionSuggested: '',
        sopReference: '',
        lessonsLearned: '',
        
        // SLA & Performance
        slaTarget: '',
        slaStatus: '',
        escalationLevel: '',
        customerImpact: '',
        businessImpact: '',
        
        // Documentation
        evidenceDocument: '',
        photos: '',
        testResults: '',
        verificationMethod: '',
        closureNotes: '',
        
        // Approval & Review
        reportedBy: '',
        assignedTo: '',
        reviewedBy: '',
        approvedBy: '',
        closureDate: '',
        remarks: ''
    });

    // Sample data for the table
    const [tableData, setTableData] = useState([
        {
            id: 1,
            faultId: 'FLT-001',
            assetId: 'ASSET-TEL-000456',
            assetName: '48F OFC Cable',
            assetCategory: 'Fiber Cable',
            subcategory: 'ADSS Cable',
            location: 'GP - Kanchipuram',
            faultDate: '2024-01-15',
            detectionMethod: 'NMS Alert',
            faultType: 'Fiber Cut',
            faultCategory: 'Physical',
            severity: 'High',
            faultDescription: 'Fiber cable cut due to road construction',
            repairStartDate: '2024-01-15',
            repairCompletionDate: '2024-01-15',
            downtime: 2.25,
            mttr: 2.25,
            responsibleTeam: 'Field Maintenance Team',
            vendor: 'HFCL Maintenance',
            recurrenceCount: 1,
            rootCause: 'External damage during road work',
            preventiveActionSuggested: 'Coordinate with local authorities',
            slaStatus: 'Met',
            slaTarget: 4,
            customerImpact: 'Service disruption for 2.25 hours',
            businessImpact: 'Revenue loss of ₹15,000'
        },
        {
            id: 2,
            faultId: 'FLT-002',
            assetId: 'ASSET-TEL-000457',
            assetName: 'OLT Equipment',
            assetCategory: 'OLT Equipment',
            subcategory: 'GPON OLT',
            location: 'GP - Chennai',
            faultDate: '2024-01-20',
            detectionMethod: 'Manual',
            faultType: 'Hardware Failure',
            faultCategory: 'Hardware',
            severity: 'Critical',
            faultDescription: 'OLT power supply unit failure',
            repairStartDate: '2024-01-20',
            repairCompletionDate: '2024-01-20',
            downtime: 1.5,
            mttr: 1.5,
            responsibleTeam: 'Technical Support',
            vendor: 'Equipment Vendor',
            recurrenceCount: 0,
            rootCause: 'Power supply component failure',
            preventiveActionSuggested: 'Regular power supply maintenance',
            slaStatus: 'Met',
            slaTarget: 2,
            customerImpact: 'Service disruption for 1.5 hours',
            businessImpact: 'Revenue loss of ₹25,000'
        },
        {
            id: 3,
            faultId: 'FLT-003',
            assetId: 'ASSET-TEL-000458',
            assetName: 'Power Backup System',
            assetCategory: 'Power Backup',
            subcategory: 'UPS System',
            location: 'GP - Bangalore',
            faultDate: '2024-01-25',
            detectionMethod: 'Sensor',
            faultType: 'Battery Failure',
            faultCategory: 'Power',
            severity: 'Medium',
            faultDescription: 'UPS battery bank failure',
            repairStartDate: '2024-01-25',
            repairCompletionDate: '2024-01-25',
            downtime: 3.0,
            mttr: 3.0,
            responsibleTeam: 'Power Team',
            vendor: 'UPS Vendor',
            recurrenceCount: 2,
            rootCause: 'Battery aging and poor maintenance',
            preventiveActionSuggested: 'Battery replacement schedule',
            slaStatus: 'Met',
            slaTarget: 4,
            customerImpact: 'Service disruption for 3 hours',
            businessImpact: 'Revenue loss of ₹20,000'
        },
        {
            id: 4,
            faultId: 'FLT-004',
            assetId: 'ASSET-TEL-000459',
            assetName: '24F OFC Cable',
            assetCategory: 'Fiber Cable',
            subcategory: 'Underground Cable',
            location: 'GP - Hyderabad',
            faultDate: '2024-02-01',
            detectionMethod: 'NMS Alert',
            faultType: 'Fiber Degradation',
            faultCategory: 'Physical',
            severity: 'Low',
            faultDescription: 'Gradual fiber signal degradation',
            repairStartDate: '2024-02-01',
            repairCompletionDate: '2024-02-02',
            downtime: 8.0,
            mttr: 8.0,
            responsibleTeam: 'Field Maintenance Team',
            vendor: 'Cable Vendor',
            recurrenceCount: 1,
            rootCause: 'Environmental factors and aging',
            preventiveActionSuggested: 'Regular cable inspection',
            slaStatus: 'Breached',
            slaTarget: 6,
            customerImpact: 'Service degradation for 8 hours',
            businessImpact: 'Revenue loss of ₹30,000'
        },
        {
            id: 5,
            faultId: 'FLT-005',
            assetId: 'ASSET-TEL-000460',
            assetName: 'BTS Equipment',
            assetCategory: 'IT Equipment',
            subcategory: 'Base Station',
            location: 'GP - Mumbai',
            faultDate: '2024-02-05',
            detectionMethod: 'Manual',
            faultType: 'Software Issue',
            faultCategory: 'Software',
            severity: 'Medium',
            faultDescription: 'BTS software configuration error',
            repairStartDate: '2024-02-05',
            repairCompletionDate: '2024-02-05',
            downtime: 1.0,
            mttr: 1.0,
            responsibleTeam: 'Software Team',
            vendor: 'Software Vendor',
            recurrenceCount: 0,
            rootCause: 'Configuration mismatch',
            preventiveActionSuggested: 'Configuration validation process',
            slaStatus: 'Met',
            slaTarget: 2,
            customerImpact: 'Service disruption for 1 hour',
            businessImpact: 'Revenue loss of ₹10,000'
        },
        {
            id: 6,
            faultId: 'FLT-006',
            assetId: 'ASSET-TEL-000461',
            assetName: 'UPS System',
            assetCategory: 'Power Backup',
            subcategory: 'Online UPS',
            location: 'GP - Delhi',
            faultDate: '2024-02-10',
            detectionMethod: 'Sensor',
            faultType: 'Cooling Fan Failure',
            faultCategory: 'Hardware',
            severity: 'Low',
            faultDescription: 'UPS cooling fan malfunction',
            repairStartDate: '2024-02-10',
            repairCompletionDate: '2024-02-10',
            downtime: 0.5,
            mttr: 0.5,
            responsibleTeam: 'Power Team',
            vendor: 'UPS Vendor',
            recurrenceCount: 1,
            rootCause: 'Fan motor failure',
            preventiveActionSuggested: 'Regular fan maintenance',
            slaStatus: 'Met',
            slaTarget: 1,
            customerImpact: 'No service impact',
            businessImpact: 'Minimal impact'
        },
        {
            id: 7,
            faultId: 'FLT-007',
            assetId: 'ASSET-TEL-000462',
            assetName: '96F OFC Cable',
            assetCategory: 'Fiber Cable',
            subcategory: 'Aerial Cable',
            location: 'GP - Pune',
            faultDate: '2024-02-15',
            detectionMethod: 'NMS Alert',
            faultType: 'Fiber Cut',
            faultCategory: 'Physical',
            severity: 'High',
            faultDescription: 'Aerial cable damaged by tree branch',
            repairStartDate: '2024-02-15',
            repairCompletionDate: '2024-02-15',
            downtime: 4.5,
            mttr: 4.5,
            responsibleTeam: 'Field Maintenance Team',
            vendor: 'Cable Vendor',
            recurrenceCount: 3,
            rootCause: 'Tree branch damage',
            preventiveActionSuggested: 'Tree trimming schedule',
            slaStatus: 'Breached',
            slaTarget: 4,
            customerImpact: 'Service disruption for 4.5 hours',
            businessImpact: 'Revenue loss of ₹35,000'
        },
        {
            id: 8,
            faultId: 'FLT-008',
            assetId: 'ASSET-TEL-000463',
            assetName: 'Router Equipment',
            assetCategory: 'IT Equipment',
            subcategory: 'Core Router',
            location: 'GP - Kolkata',
            faultDate: '2024-02-20',
            detectionMethod: 'Manual',
            faultType: 'Network Congestion',
            faultCategory: 'Network',
            severity: 'Medium',
            faultDescription: 'Router experiencing high traffic congestion',
            repairStartDate: '2024-02-20',
            repairCompletionDate: '2024-02-20',
            downtime: 2.0,
            mttr: 2.0,
            responsibleTeam: 'Network Team',
            vendor: 'Router Vendor',
            recurrenceCount: 0,
            rootCause: 'Traffic spike and capacity limitation',
            preventiveActionSuggested: 'Capacity planning and monitoring',
            slaStatus: 'Met',
            slaTarget: 3,
            customerImpact: 'Service degradation for 2 hours',
            businessImpact: 'Revenue loss of ₹18,000'
        }
    ]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
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

    // Advanced filter handlers
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

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedFaultType('');
        setSelectedSeverity('');
        setQueryFilters([
            {
                id: 1,
                field: 'Fault Date',
                operator: '>',
                value: '@Today - 180',
                logicalOperator: null
            },
            {
                id: 2,
                field: 'Fault Type',
                operator: '=',
                value: '[Any]',
                logicalOperator: 'And'
            },
            {
                id: 3,
                field: 'Severity',
                operator: '=',
                value: '[Any]',
                logicalOperator: 'And'
            }
        ]);
        setAdvancedFilters({
            numeric: {
                mttr: { operator: '>=', value: '' },
                downtime: { operator: '>=', value: '' },
                recurrenceCount: { operator: '>=', value: '' },
                repairCost: { operator: '>=', value: '' }
            },
            dateRange: {
                faultDate: { from: '', to: '' },
                repairStartDate: { from: '', to: '' },
                repairCompletionDate: { from: '', to: '' }
            },
            text: {
                location: '',
                responsibleTeam: '',
                assetCategory: '',
                detectionMethod: '',
                rootCause: '',
                vendor: ''
            },
            multiSelect: {
                faultType: [],
                severity: [],
                status: []
            }
        });
        setCurrentPage(1);
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
                    case 'Fault Date':
                        fieldValue = item.faultDate || '';
                        break;
                    case 'Fault Type':
                        fieldValue = item.faultType || '';
                        break;
                    case 'Severity':
                        fieldValue = item.severity || '';
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
                    case 'MTTR':
                        fieldValue = item.mttr || '';
                        break;
                    case 'Downtime':
                        fieldValue = item.downtime || '';
                        break;
                    case 'Asset Category':
                        fieldValue = item.assetCategory || '';
                        break;
                    case 'Detection Method':
                        fieldValue = item.detectionMethod || '';
                        break;
                    case 'Responsible Team':
                        fieldValue = item.responsibleTeam || '';
                        break;
                    case 'Vendor':
                        fieldValue = item.vendor || '';
                        break;
                    case 'SLA Status':
                        fieldValue = item.slaStatus || '';
                        break;
                    case 'Recurrence Count':
                        fieldValue = item.recurrenceCount || '';
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

    const generateReport = () => {
        console.log('Generating Fault Trend / MTTR Report with filters:', filters);
    };

    const exportReport = () => {
        const csvContent = [
            ['Fault ID', 'Asset ID', 'Asset Name', 'Asset Category', 'Location', 'Fault Date', 'Detection Method', 'Fault Type', 'Severity', 'Fault Description', 'Repair Start Date', 'Repair Completion Date', 'Downtime (hrs)', 'MTTR (hrs)', 'Responsible Team', 'Vendor', 'Recurrence Count', 'Root Cause', 'Preventive Action', 'SLA Status', 'SLA Target', 'Customer Impact', 'Business Impact'],
            ...filteredData.map(item => [
                item.faultId,
                item.assetId,
                item.assetName,
                item.assetCategory,
                item.location,
                item.faultDate,
                item.detectionMethod,
                item.faultType,
                item.severity,
                item.faultDescription,
                item.repairStartDate,
                item.repairCompletionDate,
                item.downtime,
                item.mttr,
                item.responsibleTeam,
                item.vendor,
                item.recurrenceCount,
                item.rootCause,
                item.preventiveActionSuggested,
                item.slaStatus,
                item.slaTarget,
                item.customerImpact,
                item.businessImpact
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `fault_trend_mttr_report_${new Date().toISOString().split('T')[0]}.csv`);
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
        // Add new fault to table data
        const newFault = {
            id: tableData.length + 1,
            faultId: `FLT-${String(tableData.length + 1).padStart(3, '0')}`,
            assetId: formData.assetId,
            assetName: formData.assetName,
            assetCategory: formData.assetCategory,
            location: formData.location,
            faultDate: formData.faultDate,
            detectionMethod: formData.detectionMethod,
            faultType: formData.faultType,
            severity: formData.severity,
            faultDescription: formData.faultDescription,
            repairStartDate: formData.repairStartDate,
            repairCompletionDate: formData.repairCompletionDate,
            downtime: parseFloat(formData.downtime) || 0,
            mttr: parseFloat(formData.mttr) || 0,
            responsibleTeam: formData.responsibleTeam,
            vendor: formData.vendor,
            recurrenceCount: parseInt(formData.recurrenceCount) || 0,
            rootCause: formData.rootCause,
            preventiveActionSuggested: formData.preventiveActionSuggested,
            slaStatus: formData.slaStatus,
            slaTarget: parseFloat(formData.slaTarget) || 0,
            customerImpact: formData.customerImpact,
            businessImpact: formData.businessImpact
        };
        setTableData(prev => [...prev, newFault]);
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
                item.faultId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.assetCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.faultDescription.toLowerCase().includes(searchTerm.toLowerCase());

            // Basic filters
            const matchesFaultType = selectedFaultType === '' || item.faultType === selectedFaultType;
            const matchesSeverity = selectedSeverity === '' || item.severity === selectedSeverity;

            // Advanced filters - Numeric
            const matchesMTTR = applyNumericFilter(
                item.mttr, 
                advancedFilters.numeric.mttr.value, 
                advancedFilters.numeric.mttr.operator
            );
            const matchesDowntime = applyNumericFilter(
                item.downtime, 
                advancedFilters.numeric.downtime.value, 
                advancedFilters.numeric.downtime.operator
            );
            const matchesRecurrenceCount = applyNumericFilter(
                item.recurrenceCount, 
                advancedFilters.numeric.recurrenceCount.value, 
                advancedFilters.numeric.recurrenceCount.operator
            );
            const matchesRepairCost = applyNumericFilter(
                item.repairCost || 0, 
                advancedFilters.numeric.repairCost.value, 
                advancedFilters.numeric.repairCost.operator
            );

            // Advanced filters - Date Range
            const matchesFaultDate = applyDateRangeFilter(
                item.faultDate, 
                advancedFilters.dateRange.faultDate.from, 
                advancedFilters.dateRange.faultDate.to
            );
            const matchesRepairStartDate = applyDateRangeFilter(
                item.repairStartDate, 
                advancedFilters.dateRange.repairStartDate.from, 
                advancedFilters.dateRange.repairStartDate.to
            );
            const matchesRepairCompletionDate = applyDateRangeFilter(
                item.repairCompletionDate, 
                advancedFilters.dateRange.repairCompletionDate.from, 
                advancedFilters.dateRange.repairCompletionDate.to
            );

            // Advanced filters - Text
            const matchesLocation = !advancedFilters.text.location || 
                item.location.toLowerCase().includes(advancedFilters.text.location.toLowerCase());
            const matchesResponsibleTeam = !advancedFilters.text.responsibleTeam || 
                item.responsibleTeam.toLowerCase().includes(advancedFilters.text.responsibleTeam.toLowerCase());
            const matchesAssetCategory = !advancedFilters.text.assetCategory || 
                item.assetCategory.toLowerCase().includes(advancedFilters.text.assetCategory.toLowerCase());
            const matchesDetectionMethod = !advancedFilters.text.detectionMethod || 
                item.detectionMethod.toLowerCase().includes(advancedFilters.text.detectionMethod.toLowerCase());
            const matchesRootCause = !advancedFilters.text.rootCause || 
                item.rootCause.toLowerCase().includes(advancedFilters.text.rootCause.toLowerCase());
            const matchesVendor = !advancedFilters.text.vendor || 
                item.vendor.toLowerCase().includes(advancedFilters.text.vendor.toLowerCase());

            // Advanced filters - Multi-select
            const matchesFaultTypeMulti = advancedFilters.multiSelect.faultType.length === 0 || 
                advancedFilters.multiSelect.faultType.includes(item.faultType);
            const matchesSeverityMulti = advancedFilters.multiSelect.severity.length === 0 || 
                advancedFilters.multiSelect.severity.includes(item.severity);
            const matchesStatusMulti = advancedFilters.multiSelect.status.length === 0 || 
                advancedFilters.multiSelect.status.includes(item.status);

            return matchesSearch && matchesFaultType && matchesSeverity && matchesMTTR && 
                   matchesDowntime && matchesRecurrenceCount && matchesRepairCost &&
                   matchesFaultDate && matchesRepairStartDate && matchesRepairCompletionDate && 
                   matchesLocation && matchesResponsibleTeam && matchesAssetCategory && 
                   matchesDetectionMethod && matchesRootCause && matchesVendor &&
                   matchesFaultTypeMulti && matchesSeverityMulti && matchesStatusMulti;
        });

        // Apply query filters
        filtered = applyQueryFilters(filtered);

        // Sorting
        if (sortField) {
            filtered.sort((a, b) => {
                let aValue = a[sortField];
                let bValue = b[sortField];

                // Handle different data types
                if (sortField === 'mttr' || sortField === 'downtime' || sortField === 'recurrenceCount' || sortField === 'slaTarget') {
                    aValue = parseFloat(aValue) || 0;
                    bValue = parseFloat(bValue) || 0;
                } else if (sortField === 'faultDate' || sortField === 'repairStartDate' || sortField === 'repairCompletionDate') {
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
    }, [tableData, searchTerm, selectedFaultType, selectedSeverity, advancedFilters, queryFilters, sortField, sortDirection]);

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
                <h2 className="fw-bold mb-0">Fault Trend / MTTR Report</h2>
                <p className="text-muted mt-2">Measures reliability and SLA adherence</p>
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
                                Add Fault
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
                                            { value: 'Fault Date', label: 'Fault Date' },
                                            { value: 'Fault Type', label: 'Fault Type' },
                                            { value: 'Severity', label: 'Severity' },
                                            { value: 'Asset ID', label: 'Asset ID' },
                                            { value: 'Asset Name', label: 'Asset Name' },
                                            { value: 'Location', label: 'Location' },
                                            { value: 'MTTR', label: 'MTTR' },
                                            { value: 'Downtime', label: 'Downtime' },
                                            { value: 'Asset Category', label: 'Asset Category' },
                                            { value: 'Detection Method', label: 'Detection Method' },
                                            { value: 'Responsible Team', label: 'Responsible Team' },
                                            { value: 'Vendor', label: 'Vendor' },
                                            { value: 'SLA Status', label: 'SLA Status' },
                                            { value: 'Recurrence Count', label: 'Recurrence Count' }
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
                                <label className="form-label fw-semibold">MTTR (Hours)</label>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        value={advancedFilters.numeric.mttr.operator}
                                        onChange={(value) => handleNumericFilterChange('mttr', value, advancedFilters.numeric.mttr.value)}
                                        style={{ width: '35%' }}
                                    >
                                        <Select.Option value=">=">&gt;=</Select.Option>
                                        <Select.Option value="<=">&lt;=</Select.Option>
                                        <Select.Option value="=">=</Select.Option>
                                        <Select.Option value=">">&gt;</Select.Option>
                                        <Select.Option value="<">&lt;</Select.Option>
                                    </Select>
                                    <InputNumber
                                        value={advancedFilters.numeric.mttr.value}
                                        onChange={(value) => handleNumericFilterChange('mttr', advancedFilters.numeric.mttr.operator, value)}
                                        placeholder="Hours"
                                        step={0.1}
                                        style={{ width: '65%' }}
                                    />
                                </Space.Compact>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Downtime (Hours)</label>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        value={advancedFilters.numeric.downtime.operator}
                                        onChange={(value) => handleNumericFilterChange('downtime', value, advancedFilters.numeric.downtime.value)}
                                        style={{ width: '35%' }}
                                    >
                                        <Select.Option value=">=">&gt;=</Select.Option>
                                        <Select.Option value="<=">&lt;=</Select.Option>
                                        <Select.Option value="=">=</Select.Option>
                                        <Select.Option value=">">&gt;</Select.Option>
                                        <Select.Option value="<">&lt;</Select.Option>
                                    </Select>
                                    <InputNumber
                                        value={advancedFilters.numeric.downtime.value}
                                        onChange={(value) => handleNumericFilterChange('downtime', advancedFilters.numeric.downtime.operator, value)}
                                        placeholder="Hours"
                                        step={0.1}
                                        style={{ width: '65%' }}
                                    />
                                </Space.Compact>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Recurrence Count</label>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        value={advancedFilters.numeric.recurrenceCount.operator}
                                        onChange={(value) => handleNumericFilterChange('recurrenceCount', value, advancedFilters.numeric.recurrenceCount.value)}
                                        style={{ width: '35%' }}
                                    >
                                        <Select.Option value=">=">&gt;=</Select.Option>
                                        <Select.Option value="<=">&lt;=</Select.Option>
                                        <Select.Option value="=">=</Select.Option>
                                        <Select.Option value=">">&gt;</Select.Option>
                                        <Select.Option value="<">&lt;</Select.Option>
                                    </Select>
                                    <InputNumber
                                        value={advancedFilters.numeric.recurrenceCount.value}
                                        onChange={(value) => handleNumericFilterChange('recurrenceCount', advancedFilters.numeric.recurrenceCount.operator, value)}
                                        placeholder="Count"
                                        style={{ width: '65%' }}
                                    />
                                </Space.Compact>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Repair Cost</label>
                                <Space.Compact style={{ width: '100%' }}>
                                    <Select
                                        value={advancedFilters.numeric.repairCost.operator}
                                        onChange={(value) => handleNumericFilterChange('repairCost', value, advancedFilters.numeric.repairCost.value)}
                                        style={{ width: '35%' }}
                                    >
                                        <Select.Option value=">=">&gt;=</Select.Option>
                                        <Select.Option value="<=">&lt;=</Select.Option>
                                        <Select.Option value="=">=</Select.Option>
                                        <Select.Option value=">">&gt;</Select.Option>
                                        <Select.Option value="<">&lt;</Select.Option>
                                    </Select>
                                    <InputNumber
                                        value={advancedFilters.numeric.repairCost.value}
                                        onChange={(value) => handleNumericFilterChange('repairCost', advancedFilters.numeric.repairCost.operator, value)}
                                        placeholder="Cost"
                                        style={{ width: '65%' }}
                                    />
                                </Space.Compact>
                            </div>

                            {/* Date Range Filters */}
                            <div className="col-12 mt-4">
                                <h6 className="fw-bold mb-3">Date Range Filters</h6>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Fault Date From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.faultDate.from}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'faultDate', { ...advancedFilters.dateRange.faultDate, from: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Fault Date To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.faultDate.to}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'faultDate', { ...advancedFilters.dateRange.faultDate, to: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Repair Start From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.repairStartDate.from}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'repairStartDate', { ...advancedFilters.dateRange.repairStartDate, from: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Repair Start To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.repairStartDate.to}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'repairStartDate', { ...advancedFilters.dateRange.repairStartDate, to: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Repair Completion From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.repairCompletionDate.from}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'repairCompletionDate', { ...advancedFilters.dateRange.repairCompletionDate, from: e.target.value })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Repair Completion To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={advancedFilters.dateRange.repairCompletionDate.to}
                                    onChange={(e) => handleAdvancedFilterChange('dateRange', 'repairCompletionDate', { ...advancedFilters.dateRange.repairCompletionDate, to: e.target.value })}
                                />
                            </div>

                            {/* Text Filters */}
                            <div className="col-12 mt-4">
                                <h6 className="fw-bold mb-3">Text Filters</h6>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by location"
                                    value={advancedFilters.text.location}
                                    onChange={(e) => handleAdvancedFilterChange('text', 'location', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Responsible Team</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by team"
                                    value={advancedFilters.text.responsibleTeam}
                                    onChange={(e) => handleAdvancedFilterChange('text', 'responsibleTeam', e.target.value)}
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
                                <label className="form-label fw-semibold">Detection Method</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by method"
                                    value={advancedFilters.text.detectionMethod}
                                    onChange={(e) => handleAdvancedFilterChange('text', 'detectionMethod', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-semibold">Root Cause</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Filter by root cause"
                                    value={advancedFilters.text.rootCause}
                                    onChange={(e) => handleAdvancedFilterChange('text', 'rootCause', e.target.value)}
                                />
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

                            {/* Multi-Select Filters */}
                            <div className="col-12 mt-4">
                                <h6 className="fw-bold mb-3">Multi-Select Filters</h6>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Fault Type</label>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="Select fault types"
                                    value={advancedFilters.multiSelect.faultType}
                                    onChange={(value) => handleAdvancedFilterChange('multiSelect', 'faultType', value)}
                                    options={[
                                        { value: 'Fiber Cut', label: 'Fiber Cut' },
                                        { value: 'Hardware Failure', label: 'Hardware Failure' },
                                        { value: 'Battery Failure', label: 'Battery Failure' },
                                        { value: 'Fiber Degradation', label: 'Fiber Degradation' },
                                        { value: 'Software Issue', label: 'Software Issue' },
                                        { value: 'Cooling Fan Failure', label: 'Cooling Fan Failure' },
                                        { value: 'Network Congestion', label: 'Network Congestion' }
                                    ]}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Severity</label>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="Select severities"
                                    value={advancedFilters.multiSelect.severity}
                                    onChange={(value) => handleAdvancedFilterChange('multiSelect', 'severity', value)}
                                    options={[
                                        { value: 'Critical', label: 'Critical' },
                                        { value: 'High', label: 'High' },
                                        { value: 'Medium', label: 'Medium' },
                                        { value: 'Low', label: 'Low' }
                                    ]}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Status</label>
                                <Select
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="Select statuses"
                                    value={advancedFilters.multiSelect.status}
                                    onChange={(value) => handleAdvancedFilterChange('multiSelect', 'status', value)}
                                    options={[
                                        { value: 'Resolved', label: 'Resolved' },
                                        { value: 'In Progress', label: 'In Progress' },
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'Recurring', label: 'Recurring' }
                                    ]}
                                />
                            </div>
                        </div>
                    </Collapse.Panel>
                </Collapse>
            )}

            <div className="card custom-shadow">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h5 className="card-title mb-0">Fault Trend & MTTR Summary</h5>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Total Faults</h6>
                                    <h4 className="text-primary">{filteredData.length}</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Avg. MTTR (Hours)</h6>
                                    <h4 className="text-success">
                                        {filteredData.length > 0 
                                            ? (filteredData.reduce((sum, item) => sum + item.mttr, 0) / filteredData.length).toFixed(1)
                                            : 0}
                                    </h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">SLA Compliance</h6>
                                    <h4 className="text-info">
                                        {filteredData.length > 0 
                                            ? Math.round((filteredData.filter(item => item.slaStatus === 'Met').length / filteredData.length) * 100)
                                            : 0}%
                                    </h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 bg-light">
                                <div className="card-body text-center">
                                    <h6 className="card-title text-muted">Critical Faults</h6>
                                    <h4 className="text-danger">{filteredData.filter(item => item.severity === 'Critical').length}</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Table
                        dataSource={paginatedData}
                        columns={[
                            {
                                title: 'Fault ID',
                                dataIndex: 'faultId',
                                key: 'faultId',
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
                                title: 'Fault Type',
                                dataIndex: 'faultType',
                                key: 'faultType',
                            },
                            {
                                title: 'Severity',
                                dataIndex: 'severity',
                                key: 'severity',
                                render: (severity) => (
                                    <Tag color={
                                        severity === 'Critical' ? 'red' : 
                                        severity === 'High' ? 'orange' : 
                                        severity === 'Medium' ? 'blue' : 'default'
                                    }>
                                        {severity}
                                    </Tag>
                                ),
                            },
                            {
                                title: 'Fault Date',
                                dataIndex: 'faultDate',
                                key: 'faultDate',
                            },
                            {
                                title: 'MTTR (hrs)',
                                dataIndex: 'mttr',
                                key: 'mttr',
                                render: (mttr) => (
                                    <Tag color={mttr <= 2 ? 'green' : mttr <= 4 ? 'orange' : 'red'}>
                                        {mttr} hrs
                                    </Tag>
                                ),
                            },
                            {
                                title: 'SLA Status',
                                dataIndex: 'slaStatus',
                                key: 'slaStatus',
                                render: (status) => (
                                    <Tag color={status === 'Met' ? 'green' : 'red'}>
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

            {/* Drawer for Fault Details Form */}
            <div className={`offcanvas offcanvas-end ${drawerOpen ? 'show' : ''}`} tabIndex="-1" style={{ visibility: drawerOpen ? 'visible' : 'hidden', zIndex: 1055 }}>
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title">Fault Details</h5>
                    <button type="button" className="btn-close" onClick={toggleDrawer}></button>
                </div>
                <div className="offcanvas-body" style={{ padding: '24px' }}>
                    <form>
                        {/* Basic Fault Details */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#1890ff', fontSize: '16px' }}>
                                    <ExclamationCircleOutlined className="me-2" />
                                    Basic Fault Details
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
                                            placeholder="e.g., ASSET-TEL-000456"
                                            value={formData.assetId}
                                            onChange={(e) => handleInputChange('assetId', e.target.value)}
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
                                            placeholder="e.g., 48F OFC Cable"
                                            value={formData.assetName}
                                            onChange={(e) => handleInputChange('assetName', e.target.value)}
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
                                            <option value="">Select category</option>
                                            <option value="Fiber Cable">Fiber Cable</option>
                                            <option value="OLT Equipment">OLT Equipment</option>
                                            <option value="Power Backup">Power Backup</option>
                                            <option value="IT Equipment">IT Equipment</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Subcategory</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., ADSS Cable"
                                            value={formData.subcategory}
                                            onChange={(e) => handleInputChange('subcategory', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., GP - Kanchipuram"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Fault Date *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.faultDate}
                                            onChange={(e) => handleInputChange('faultDate', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Detection Method</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.detectionMethod}
                                            onChange={(e) => handleInputChange('detectionMethod', e.target.value)}
                                        >
                                            <option value="">Select method</option>
                                            <option value="NMS Alert">NMS Alert</option>
                                            <option value="Manual">Manual</option>
                                            <option value="Sensor">Sensor</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Fault Type</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.faultType}
                                            onChange={(e) => handleInputChange('faultType', e.target.value)}
                                        >
                                            <option value="">Select type</option>
                                            <option value="Fiber Cut">Fiber Cut</option>
                                            <option value="Hardware Failure">Hardware Failure</option>
                                            <option value="Battery Failure">Battery Failure</option>
                                            <option value="Fiber Degradation">Fiber Degradation</option>
                                            <option value="Software Issue">Software Issue</option>
                                            <option value="Cooling Fan Failure">Cooling Fan Failure</option>
                                            <option value="Network Congestion">Network Congestion</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Fault Category</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.faultCategory}
                                            onChange={(e) => handleInputChange('faultCategory', e.target.value)}
                                        >
                                            <option value="">Select category</option>
                                            <option value="Physical">Physical</option>
                                            <option value="Hardware">Hardware</option>
                                            <option value="Power">Power</option>
                                            <option value="Software">Software</option>
                                            <option value="Network">Network</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Severity</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.severity}
                                            onChange={(e) => handleInputChange('severity', e.target.value)}
                                        >
                                            <option value="">Select severity</option>
                                            <option value="Critical">Critical</option>
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Fault Description</label>
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
                                            placeholder="Describe the fault in detail"
                                            value={formData.faultDescription}
                                            onChange={(e) => handleInputChange('faultDescription', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Repair Information */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#28a745', fontSize: '16px' }}>
                                    <ToolOutlined className="me-2" />
                                    Repair Information
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Repair Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.repairStartDate}
                                            onChange={(e) => handleInputChange('repairStartDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Repair Completion Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.repairCompletionDate}
                                            onChange={(e) => handleInputChange('repairCompletionDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Downtime (Hours)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., 2.5"
                                            value={formData.downtime}
                                            onChange={(e) => handleInputChange('downtime', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>MTTR (Hours)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., 2.5"
                                            value={formData.mttr}
                                            onChange={(e) => handleInputChange('mttr', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Responsible Team</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., Field Maintenance Team"
                                            value={formData.responsibleTeam}
                                            onChange={(e) => handleInputChange('responsibleTeam', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Vendor</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., HFCL Maintenance"
                                            value={formData.vendor}
                                            onChange={(e) => handleInputChange('vendor', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Repair Description</label>
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
                                            placeholder="Describe the repair work performed"
                                            value={formData.repairDescription}
                                            onChange={(e) => handleInputChange('repairDescription', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Parts Replaced</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., Power supply unit, Cooling fan"
                                            value={formData.partsReplaced}
                                            onChange={(e) => handleInputChange('partsReplaced', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Repair Cost (₹)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., 15000"
                                            value={formData.repairCost}
                                            onChange={(e) => handleInputChange('repairCost', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analysis & Tracking */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#17a2b8', fontSize: '16px' }}>
                                    <LineChartOutlined className="me-2" />
                                    Analysis & Tracking
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Recurrence Count</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., 1"
                                            value={formData.recurrenceCount}
                                            onChange={(e) => handleInputChange('recurrenceCount', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>SOP Reference</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., SOP-FAULT-001"
                                            value={formData.sopReference}
                                            onChange={(e) => handleInputChange('sopReference', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Root Cause</label>
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
                                            placeholder="e.g., External damage during road work"
                                            value={formData.rootCause}
                                            onChange={(e) => handleInputChange('rootCause', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Preventive Action Suggested</label>
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
                                            placeholder="e.g., Coordinate with local authorities"
                                            value={formData.preventiveActionSuggested}
                                            onChange={(e) => handleInputChange('preventiveActionSuggested', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Lessons Learned</label>
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
                                            placeholder="Key learnings from this fault"
                                            value={formData.lessonsLearned}
                                            onChange={(e) => handleInputChange('lessonsLearned', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SLA & Performance */}
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
                                    SLA & Performance
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>SLA Target (Hours)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., 4"
                                            value={formData.slaTarget}
                                            onChange={(e) => handleInputChange('slaTarget', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>SLA Status</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.slaStatus}
                                            onChange={(e) => handleInputChange('slaStatus', e.target.value)}
                                        >
                                            <option value="">Select status</option>
                                            <option value="Met">Met</option>
                                            <option value="Breached">Breached</option>
                                            <option value="Pending">Pending</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Escalation Level</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.escalationLevel}
                                            onChange={(e) => handleInputChange('escalationLevel', e.target.value)}
                                        >
                                            <option value="">Select level</option>
                                            <option value="Level 1">Level 1</option>
                                            <option value="Level 2">Level 2</option>
                                            <option value="Level 3">Level 3</option>
                                            <option value="Management">Management</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Customer Impact</label>
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
                                            placeholder="e.g., Service disruption for 2.25 hours"
                                            value={formData.customerImpact}
                                            onChange={(e) => handleInputChange('customerImpact', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Business Impact</label>
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
                                            placeholder="e.g., Revenue loss of ₹15,000"
                                            value={formData.businessImpact}
                                            onChange={(e) => handleInputChange('businessImpact', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documentation */}
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
                                    Documentation
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Evidence Document</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., Fault_Report_2024_001.pdf"
                                            value={formData.evidenceDocument}
                                            onChange={(e) => handleInputChange('evidenceDocument', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Photos</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., fault_photos_001.jpg, fault_photos_002.jpg"
                                            value={formData.photos}
                                            onChange={(e) => handleInputChange('photos', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Verification Method</label>
                                        <select
                                            className="form-select"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.verificationMethod}
                                            onChange={(e) => handleInputChange('verificationMethod', e.target.value)}
                                        >
                                            <option value="">Select method</option>
                                            <option value="Visual Inspection">Visual Inspection</option>
                                            <option value="Functional Test">Functional Test</option>
                                            <option value="Performance Test">Performance Test</option>
                                            <option value="Diagnostic Tool">Diagnostic Tool</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Test Results</label>
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
                                            placeholder="Test results and measurements"
                                            value={formData.testResults}
                                            onChange={(e) => handleInputChange('testResults', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Closure Notes</label>
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
                                            placeholder="Final closure notes and verification"
                                            value={formData.closureNotes}
                                            onChange={(e) => handleInputChange('closureNotes', e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Approval & Review */}
                        <div className="mb-5">
                            <div style={{ 
                                backgroundColor: '#f8f9fa', 
                                padding: '16px 20px', 
                                borderRadius: '8px', 
                                marginBottom: '24px',
                                border: '1px solid #e9ecef'
                            }}>
                                <h6 className="fw-bold mb-0" style={{ color: '#dc3545', fontSize: '16px' }}>
                                    <CheckCircleOutlined className="me-2" />
                                    Approval & Review
                                </h6>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Reported By</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., Field Engineer"
                                            value={formData.reportedBy}
                                            onChange={(e) => handleInputChange('reportedBy', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Assigned To</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., Maintenance Team Lead"
                                            value={formData.assignedTo}
                                            onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Reviewed By</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., Technical Manager"
                                            value={formData.reviewedBy}
                                            onChange={(e) => handleInputChange('reviewedBy', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Approved By</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            placeholder="e.g., Operations Head"
                                            value={formData.approvedBy}
                                            onChange={(e) => handleInputChange('approvedBy', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-semibold mb-2" style={{ color: '#333', fontSize: '14px' }}>Closure Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            style={{ 
                                                padding: '12px 16px', 
                                                borderRadius: '6px', 
                                                border: '1px solid #d9d9d9',
                                                fontSize: '14px'
                                            }}
                                            value={formData.closureDate}
                                            onChange={(e) => handleInputChange('closureDate', e.target.value)}
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
                                            placeholder="Additional remarks and observations"
                                            value={formData.remarks}
                                            onChange={(e) => handleInputChange('remarks', e.target.value)}
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
                                    <SaveOutlined className="me-2" />
                                    Save Fault
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Backdrop for drawer */}
            {drawerOpen && (
                <div className="offcanvas-backdrop fade show" onClick={toggleDrawer} style={{ zIndex: 1050 }}></div>
            )}
        </div>
    );
};

export default FaultTrendMTTRReport;
