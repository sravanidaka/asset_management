import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';

import { FaDownload, FaFilter, FaSearch, FaCalendarAlt, FaWrench, FaArrowLeft, FaEdit, FaEye, FaChartLine } from 'react-icons/fa';
import { Table, Input, Button, Space, Drawer, Form, Select, DatePicker, message, Popconfirm, Dropdown } from 'antd';
import { SearchOutlined, PlusOutlined, DownOutlined, FilterOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleExport, formatDataForExport, getExportOptions, applyFilters, applySorting } from '../../utils/exportUtils';
import '../../App.css';

const MaintenanceRepairReport = () => {
    const navigate = useNavigate();

    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [filteredInfo, setFilteredInfo] = useState({});
    const [sortedInfo, setSortedInfo] = useState({});
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();
    const [advancedFilters, setAdvancedFilters] = useState({});
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
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

    // Fetch maintenance repair data from API
    const fetchMaintenanceRepairData = async () => {
        setLoading(true);
        try {
            console.log('Fetching maintenance repair data from API...');
            const response = await fetch('http://202.53.92.35:5004/api/maintenance-repair', {
                headers: {
                    "x-access-token": sessionStorage.getItem("token"),
                }
            });
            console.log('API Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('API Response data:', data);

                // Handle different response formats
                let maintenanceData = [];
                if (data.success && Array.isArray(data.maintenance_repair)) {
                    maintenanceData = data.maintenance_repair;
                    console.log('Using maintenance_repair array:', maintenanceData.length, 'items');
                } else if (Array.isArray(data)) {
                    maintenanceData = data;
                    console.log('Using direct array format:', maintenanceData.length, 'items');
                } else {
                    console.log('Unexpected API response format:', data);
                    maintenanceData = [];
                }

                const dataWithKeys = maintenanceData.map((item, index) => ({
                    ...item,
                    key: item.maintenance_id || index,
                }));
                setDataSource(dataWithKeys);
                setPagination(prev => ({ ...prev, total: dataWithKeys.length }));
                console.log('Data loaded successfully:', dataWithKeys.length, 'items');
            } else {
                console.log('API failed, using sample data');
                // Use sample data if API fails
                const sampleData = [
                    {
                        key: 1,
                        maintenance_id: 'MNT-2025-0087',
                        asset_id: 'ASSET-TEL-000879',
                        asset_name: 'OLT - Huawei MA5800',
                        asset_category: 'Telecom Equipment',
                        asset_subcategory: 'OLT',
                        location_site: 'POP - Coimbatore South',
                        project_department: 'BharatNet Phase II',
                        custodian: 'Field O&M Team',
                        maintenance_type: 'Preventive',
                        scheduled_date: '2025-03-15',
                        performed_date: '2025-03-16',
                        maintenance_agency_vendor: 'Huawei AMC Division',
                        work_order_no: 'WO/AMC/024/345',
                        amc_coverage: 'Under AMC',
                        warranty_status: 'Out of Warranty',
                        activity_performed: 'Cleaning optical ports & replacing patch cords',
                        spare_parts_used: 'OLT Fan Module, SC/APC Patch Cord',
                        material_cost: '₹4,500',
                        labour_cost: '₹2,000',
                        total_maintenance_cost: '₹6,500',
                        maintenance_verified_by: 'Area Engineer',
                        verification_date: '2025-03-17',
                        breakdown_id: '',
                        breakdown_date: '',
                        nature_of_fault: '',
                        root_cause: '',
                        fault_category: '',
                        repair_type: '',
                        resolution_action: '',
                        repair_completed_date: '',
                        downtime_duration: '0',
                        repaired_by: '',
                        uptime_percentage: '99.50%',
                        sla_breach: 'No',
                        root_cause_category: '',
                        preventive_action_suggested: '',
                        total_repair_cost: '₹0',
                        cost_covered_under_amc: 'Yes',
                        approved_by: 'O&M Manager',
                        approval_date: '2025-03-20',
                        payment_reference: 'INV-AMC-2025/035',
                        audit_cycle: 'Q1 FY 2025-26',
                        auditor_name: 'R. Prakash',
                        audit_date: '2025-03-31',
                        remarks: 'All preventive maintenance on schedule',
                        status: 'Completed'
                    },
                    {
                        key: 2,
                        maintenance_id: 'MNT-2025-0088',
                        asset_id: 'ASSET-PWR-001234',
                        asset_name: 'UPS System - APC',
                        asset_category: 'Power Equipment',
                        asset_subcategory: 'UPS',
                        location_site: 'Data Center - Mumbai',
                        project_department: 'Infrastructure Upgrade',
                        custodian: 'Power Management Team',
                        maintenance_type: 'Corrective',
                        scheduled_date: '2025-03-20',
                        performed_date: '2025-03-21',
                        maintenance_agency_vendor: 'APC Service Center',
                        work_order_no: 'WO/APC/025/456',
                        amc_coverage: 'Under AMC',
                        warranty_status: 'Within Warranty',
                        activity_performed: 'Battery replacement and system testing',
                        spare_parts_used: 'UPS Battery Pack, Cooling Fan',
                        material_cost: '₹5,000',
                        labour_cost: '₹3,200',
                        total_maintenance_cost: '₹8,200',
                        maintenance_verified_by: 'Power Engineer',
                        verification_date: '2025-03-22',
                        breakdown_id: 'BD-2025-042',
                        breakdown_date: '2025-03-12',
                        nature_of_fault: 'PON card failure',
                        root_cause: 'Voltage fluctuation',
                        fault_category: 'Electrical',
                        repair_type: 'Replacement',
                        resolution_action: 'Replaced faulty card and tested',
                        repair_completed_date: '2025-03-13',
                        downtime_duration: '8',
                        repaired_by: 'Vendor',
                        uptime_percentage: '98.5%',
                        sla_breach: 'No',
                        root_cause_category: 'Power',
                        preventive_action_suggested: 'Surge protection installed',
                        total_repair_cost: '₹8,200',
                        cost_covered_under_amc: 'Yes',
                        approved_by: 'O&M Manager',
                        approval_date: '2025-03-20',
                        payment_reference: 'INV-APC-2025/036',
                        audit_cycle: 'Q1 FY 2025-26',
                        auditor_name: 'R. Prakash',
                        audit_date: '2025-03-31',
                        remarks: 'Repair completed within SLA',
                        status: 'In Progress'
                    },
                    {
                        key: 3,
                        maintenance_id: 'MNT-2025-0089',
                        asset_id: 'ASSET-IT-000456',
                        asset_name: 'Server Rack - Dell',
                        asset_category: 'IT Infrastructure',
                        asset_subcategory: 'Server',
                        location_site: 'Head Office - Bangalore',
                        project_department: 'IT Operations',
                        custodian: 'IT Support Team',
                        maintenance_type: 'Emergency',
                        scheduled_date: '2025-03-25',
                        performed_date: '2025-03-25',
                        maintenance_agency_vendor: 'Dell Service Center',
                        work_order_no: 'WO/DEL/026/567',
                        amc_coverage: 'Out of AMC',
                        warranty_status: 'Out of Warranty',
                        activity_performed: 'Hardware replacement and configuration',
                        spare_parts_used: 'Motherboard, RAM, Power Supply',
                        material_cost: '₹8,000',
                        labour_cost: '₹4,000',
                        total_maintenance_cost: '₹12,000',
                        maintenance_verified_by: 'IT Engineer',
                        verification_date: '2025-03-26',
                        breakdown_id: 'BD-2025-043',
                        breakdown_date: '2025-03-24',
                        nature_of_fault: 'System crash',
                        root_cause: 'Hardware failure',
                        fault_category: 'Hardware',
                        repair_type: 'Replacement',
                        resolution_action: 'Replaced motherboard and reconfigured system',
                        repair_completed_date: '2025-03-25',
                        downtime_duration: '6',
                        repaired_by: 'Vendor',
                        uptime_percentage: '95.2%',
                        sla_breach: 'Yes',
                        root_cause_category: 'O&M',
                        preventive_action_suggested: 'Regular hardware monitoring',
                        total_repair_cost: '₹12,000',
                        cost_covered_under_amc: 'No',
                        approved_by: 'IT Manager',
                        approval_date: '2025-03-25',
                        payment_reference: 'INV-DEL-2025/037',
                        audit_cycle: 'Q1 FY 2025-26',
                        auditor_name: 'R. Prakash',
                        audit_date: '2025-03-31',
                        remarks: 'Emergency repair completed',
                        status: 'Completed'
                    }
                ];
                setDataSource(sampleData);
                setPagination(prev => ({ ...prev, total: sampleData.length }));
                message.info("Using sample data - API not available");
            }
        } catch (error) {
            console.error('Error fetching maintenance repair data:', error);
            message.error("Failed to load maintenance repair data");
            setDataSource([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaintenanceRepairData();
    }, []);

    // Handle table change (pagination, filters, sorting)
    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    };

    // Handle form submission
    const handleSave = async (values) => {
        try {
            setLoading(true);

            const apiData = {
                maintenance_id: editingIndex !== null ? editingRecord?.maintenance_id : values.maintenance_id,
                asset_id: values.asset_id,
                asset_name: values.asset_name,
                maintenance_type: values.maintenance_type,
                scheduled_date: values.scheduled_date,
                performed_date: values.performed_date,
                status: values.status,
                total_cost: values.total_cost,
                verified_by: values.verified_by,
                work_order_no: values.work_order_no,
                maintenance_agency: values.maintenance_agency,
                activity_performed: values.activity_performed,
                spare_parts_used: values.spare_parts_used,
                material_cost: values.material_cost,
                labour_cost: values.labour_cost,
                downtime_duration: values.downtime_duration,
                uptime_percentage: values.uptime_percentage,
                sla_breach: values.sla_breach,
                root_cause: values.root_cause,
                preventive_action: values.preventive_action
            };

            console.log('Submitting maintenance repair data:', apiData);

            let response;
            if (editingIndex !== null) {
                // Update existing record
                response = await fetch('http://202.53.92.35:5004/api/maintenance-repair', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        "x-access-token": sessionStorage.getItem("token"),
                    },
                    body: JSON.stringify(apiData),
                });
            } else {
                // Create new record
                response = await fetch('http://202.53.92.35:5004/api/maintenance-repair', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "x-access-token": sessionStorage.getItem("token"),
                    },
                    body: JSON.stringify(apiData),
                });
            }

            if (response.ok) {
                message.success(editingIndex !== null ? 'Maintenance repair data updated successfully' : 'Maintenance repair data created successfully');
                setDrawerVisible(false);
                form.resetFields();
                setEditingIndex(null);
                setEditingRecord(null);
                fetchMaintenanceRepairData();
            } else {
                message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} maintenance repair data`);
            }
        } catch (error) {
            console.error('Error saving maintenance repair data:', error);
            message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} maintenance repair data`);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (record) => {
        console.log('Editing record:', record);

        const formValues = {
            maintenance_id: record.maintenance_id,
            asset_id: record.asset_id,
            asset_name: record.asset_name,
            maintenance_type: record.maintenance_type,
            scheduled_date: record.scheduled_date,
            performed_date: record.performed_date,
            status: record.status,
            total_cost: record.total_cost,
            verified_by: record.verified_by,
            work_order_no: record.work_order_no,
            maintenance_agency: record.maintenance_agency,
            activity_performed: record.activity_performed,
            spare_parts_used: record.spare_parts_used,
            material_cost: record.material_cost,
            labour_cost: record.labour_cost,
            downtime_duration: record.downtime_duration,
            uptime_percentage: record.uptime_percentage,
            sla_breach: record.sla_breach,
            root_cause: record.root_cause,
            preventive_action: record.preventive_action
        };

        form.setFieldsValue(formValues);
        setEditingIndex(record.key);
        setEditingRecord(record);
        setDrawerVisible(true);
    };

    // Handle delete
    const handleDelete = async (record) => {
        try {
            const response = await fetch('http://202.53.92.35:5004/api/maintenance-repair', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "x-access-token": sessionStorage.getItem("token"),
                },
                body: JSON.stringify({
                    maintenance_id: record.maintenance_id
                }),
            });

            if (response.ok) {
                message.success('Maintenance repair data deleted successfully');
                fetchMaintenanceRepairData();
            } else {

                message.error('Failed to delete maintenance repair data');
            }
        } catch (error) {
            console.error('Error deleting maintenance repair data:', error);
            message.error('Failed to delete maintenance repair data');
        }
    };

    // Handle create new
    const handleCreate = () => {
        console.log('Creating new maintenance repair record');
        form.resetFields();
        setEditingIndex(null);
        setEditingRecord(null);
        setDrawerVisible(true);
    };

    // Handle export with filters
    const handleExportClick = (exportType) => {
        try {
            // Use the already filtered and sorted data from the table
            const currentData = getFilteredData();
            const formattedData = formatDataForExport(currentData, columns);
            const result = handleExport(
                exportType,
                formattedData,
                columns,
                'Maintenance_Repair_Report',
                'Maintenance & Repair Report',
                'maintenance-repair',
                {}, // No additional filters needed since data is already filtered
                {}  // No additional sorting needed since data is already sorted
            );

            if (result.success) {
                const recordCount = result.recordCount || formattedData.length;
                message.success(`${exportType.toUpperCase()} export completed successfully. ${recordCount} records exported.`);
            } else {
                message.error(`Failed to export ${exportType.toUpperCase()}: ${result.error}`);
            }
        } catch (error) {
            console.error('Export error:', error);
            message.error('Export failed. Please try again.');
        }
    };

    // Handle advanced filter changes
    const handleAdvancedFilterChange = (key, value) => {
        setAdvancedFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilteredInfo({});
        setAdvancedFilters({});
        setSortedInfo({});
        message.success('All filters cleared');
    };

    // Query filter handlers
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
            return filtered.map((filter, index) => ({
                ...filter,
                logicalOperator: index === 0 ? null : 'And'
            }));
        });
    };

    const clearQueryFilters = () => {
        setQueryFilters([
            { id: 1, field: 'Changed Date', operator: '>', value: '@Today - 180', logicalOperator: null },
            { id: 2, field: 'Work Item Type', operator: '=', value: '[Any]', logicalOperator: 'And' },
            { id: 3, field: 'State', operator: '=', value: '[Any]', logicalOperator: 'And' }
        ]);
    };

    // Apply query filters to data
    const applyQueryFilters = (data) => {
        return data.filter(item => {
            let result = true;
            for (let i = 0; i < queryFilters.length; i++) {
                const filter = queryFilters[i];
                let filterResult = true;
                if (!filter.value || filter.value === '[Any]') {
                    continue;
                }
                let fieldValue = '';
                switch (filter.field) {
                    case 'Changed Date': fieldValue = item.scheduled_date || ''; break;
                    case 'Work Item Type': fieldValue = item.maintenance_type || ''; break;
                    case 'State': fieldValue = item.status || ''; break;
                    case 'Asset ID': fieldValue = item.asset_id || ''; break;
                    case 'Asset Name': fieldValue = item.asset_name || ''; break;
                    case 'Category': fieldValue = item.asset_category || ''; break;
                    case 'Location': fieldValue = item.location_site || ''; break;
                    default: fieldValue = item[filter.field.toLowerCase().replace(/\s+/g, '')] || '';
                }
                switch (filter.operator) {
                    case '=': filterResult = fieldValue.toString().toLowerCase() === filter.value.toLowerCase(); break;
                    case '!=': filterResult = fieldValue.toString().toLowerCase() !== filter.value.toLowerCase(); break;
                    case '>':
                        if (filter.field === 'Changed Date') {
                            const itemDate = new Date(fieldValue);
                            const filterDate = new Date(filter.value.replace('@Today - ', ''));
                            filterResult = itemDate > filterDate;
                        } else {
                            filterResult = parseFloat(fieldValue) > parseFloat(filter.value);
                        }
                        break;
                    case '<':
                        if (filter.field === 'Changed Date') {
                            const itemDate = new Date(fieldValue);
                            const filterDate = new Date(filter.value.replace('@Today - ', ''));
                            filterResult = itemDate < filterDate;
                        } else {
                            filterResult = parseFloat(fieldValue) < parseFloat(filter.value);
                        }
                        break;
                    case '>=':
                        if (filter.field === 'Changed Date') {
                            const itemDate = new Date(fieldValue);
                            const filterDate = new Date(filter.value.replace('@Today - ', ''));
                            filterResult = itemDate >= filterDate;
                        } else {
                            filterResult = parseFloat(fieldValue) >= parseFloat(filter.value);
                        }
                        break;
                    case '<=':
                        if (filter.field === 'Changed Date') {
                            const itemDate = new Date(fieldValue);
                            const filterDate = new Date(filter.value.replace('@Today - ', ''));
                            filterResult = itemDate <= filterDate;
                        } else {
                            filterResult = parseFloat(fieldValue) <= parseFloat(filter.value);
                        }
                        break;
                    default: filterResult = fieldValue.toString().toLowerCase().includes(filter.value.toLowerCase());
                }
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

    // Get filtered and sorted data for display
    const getFilteredData = () => {
        let filteredData = applyFilters(dataSource, { ...filteredInfo, ...advancedFilters });
        filteredData = applyQueryFilters(filteredData);
        filteredData = applySorting(filteredData, sortedInfo);
        return filteredData;
    };

    // Column search props
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => confirm()}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters()}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
    });

    // Define table columns
    const columns = [
        // Asset Identification
        {
            title: 'Asset ID',
            dataIndex: 'asset_id',
            key: 'asset_id',
            sorter: (a, b) => a.asset_id.localeCompare(b.asset_id),
            ...getColumnSearchProps('asset_id'),
        },
        {
            title: 'Asset Name',
            dataIndex: 'asset_name',
            key: 'asset_name',
            sorter: (a, b) => a.asset_name.localeCompare(b.asset_name),
            ...getColumnSearchProps('asset_name'),
        },
        {
            title: 'Asset Category',
            dataIndex: 'asset_category',
            key: 'asset_category',
            sorter: (a, b) => a.asset_category.localeCompare(b.asset_category),
            ...getColumnSearchProps('asset_category'),
        },
        {
            title: 'Asset Subcategory',
            dataIndex: 'asset_subcategory',
            key: 'asset_subcategory',
            sorter: (a, b) => a.asset_subcategory.localeCompare(b.asset_subcategory),
            ...getColumnSearchProps('asset_subcategory'),
        },
        {
            title: 'Location / Site Name',
            dataIndex: 'location_site_name',
            key: 'location_site_name',
            sorter: (a, b) => a.location_site_name.localeCompare(b.location_site_name),
            ...getColumnSearchProps('location_site_name'),
        },
        {
            title: 'Department / Project',
            dataIndex: 'department_project',
            key: 'department_project',
            sorter: (a, b) => a.department_project.localeCompare(b.department_project),
            ...getColumnSearchProps('department_project'),
        },
        {
            title: 'Custodian / Responsible Person',
            dataIndex: 'custodian_responsible_person',
            key: 'custodian_responsible_person',
            sorter: (a, b) => a.custodian_responsible_person.localeCompare(b.custodian_responsible_person),
            ...getColumnSearchProps('custodian_responsible_person'),
        },

        // Financial Details
        {
            title: 'Purchase Order No.',
            dataIndex: 'purchase_order_no',
            key: 'purchase_order_no',
            sorter: (a, b) => a.purchase_order_no.localeCompare(b.purchase_order_no),
            ...getColumnSearchProps('purchase_order_no'),
        },
        {
            title: 'PO Date',
            dataIndex: 'po_date',
            key: 'po_date',
            sorter: (a, b) => new Date(a.po_date) - new Date(b.po_date),
            render: (text) => text ? dayjs(text).format('DD-MMM-YY') : '',
        },
        {
            title: 'Vendor Name',
            dataIndex: 'vendor_name',
            key: 'vendor_name',
            sorter: (a, b) => a.vendor_name.localeCompare(b.vendor_name),
            ...getColumnSearchProps('vendor_name'),
        },
        {
            title: 'Invoice No.',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            sorter: (a, b) => a.invoice_no.localeCompare(b.invoice_no),
            ...getColumnSearchProps('invoice_no'),
        },
        {
            title: 'Invoice Date',
            dataIndex: 'invoice_date',
            key: 'invoice_date',
            sorter: (a, b) => new Date(a.invoice_date) - new Date(b.invoice_date),
            render: (text) => text ? dayjs(text).format('DD-MMM-YY') : '',
        },
        {
            title: 'Invoice Value (₹)',
            dataIndex: 'invoice_value',
            key: 'invoice_value',
            sorter: (a, b) => parseFloat(a.invoice_value.replace(/[₹,]/g, '')) - parseFloat(b.invoice_value.replace(/[₹,]/g, '')),
        },
        {
            title: 'GST / Tax Amount (₹)',
            dataIndex: 'gst_tax_amount',
            key: 'gst_tax_amount',
            sorter: (a, b) => parseFloat(a.gst_tax_amount.replace(/[₹,]/g, '')) - parseFloat(b.gst_tax_amount.replace(/[₹,]/g, '')),
        },
        {
            title: 'Total Capitalized Value (₹)',
            dataIndex: 'total_capitalized_value',
            key: 'total_capitalized_value',
            sorter: (a, b) => parseFloat(a.total_capitalized_value.replace(/[₹,]/g, '')) - parseFloat(b.total_capitalized_value.replace(/[₹,]/g, '')),
        },
        {
            title: 'Capitalization Date',
            dataIndex: 'capitalization_date',
            key: 'capitalization_date',
            sorter: (a, b) => new Date(a.capitalization_date) - new Date(b.capitalization_date),
            render: (text) => text ? dayjs(text).format('DD-MMM-YY') : '',
        },
        {
            title: 'Payment Status',
            dataIndex: 'payment_status',
            key: 'payment_status',
            sorter: (a, b) => a.payment_status.localeCompare(b.payment_status),
            ...getColumnSearchProps('payment_status'),
        },
        {
            title: 'Asset Life (Years)',
            dataIndex: 'asset_life_years',
            key: 'asset_life_years',
            sorter: (a, b) => parseFloat(a.asset_life_years) - parseFloat(b.asset_life_years),
        },

        // Depreciation Summary
        {
            title: 'Depreciation Method',
            dataIndex: 'depreciation_method',
            key: 'depreciation_method',
            sorter: (a, b) => a.depreciation_method.localeCompare(b.depreciation_method),
            ...getColumnSearchProps('depreciation_method'),
        },
        {
            title: 'Depreciation Rate (%)',
            dataIndex: 'depreciation_rate',
            key: 'depreciation_rate',
            sorter: (a, b) => parseFloat(a.depreciation_rate) - parseFloat(b.depreciation_rate),
        },
        {
            title: 'Accumulated Depreciation (₹)',
            dataIndex: 'accumulated_depreciation',
            key: 'accumulated_depreciation',
            sorter: (a, b) => parseFloat(a.accumulated_depreciation.replace(/[₹,]/g, '')) - parseFloat(b.accumulated_depreciation.replace(/[₹,]/g, '')),
        },
        {
            title: 'Net Book Value (₹)',
            dataIndex: 'net_book_value',
            key: 'net_book_value',
            sorter: (a, b) => parseFloat(a.net_book_value.replace(/[₹,]/g, '')) - parseFloat(b.net_book_value.replace(/[₹,]/g, '')),
        },
        {
            title: 'Residual Value (₹)',
            dataIndex: 'residual_value',
            key: 'residual_value',
            sorter: (a, b) => parseFloat(a.residual_value.replace(/[₹,]/g, '')) - parseFloat(b.residual_value.replace(/[₹,]/g, '')),
        },

        // Operational Status
        {
            title: 'Current Status',
            dataIndex: 'current_status',
            key: 'current_status',
            sorter: (a, b) => a.current_status.localeCompare(b.current_status),
            ...getColumnSearchProps('current_status'),
        },
        {
            title: 'Asset Movement',
            dataIndex: 'asset_movement',
            key: 'asset_movement',
            sorter: (a, b) => a.asset_movement.localeCompare(b.asset_movement),
            ...getColumnSearchProps('asset_movement'),
        },
        {
            title: 'Utilization %',
            dataIndex: 'utilization_percentage',
            key: 'utilization_percentage',
            sorter: (a, b) => parseFloat(a.utilization_percentage) - parseFloat(b.utilization_percentage),
        },
        {
            title: 'AMC Status',
            dataIndex: 'amc_status',
            key: 'amc_status',
            sorter: (a, b) => a.amc_status.localeCompare(b.amc_status),
            ...getColumnSearchProps('amc_status'),
        },
        {
            title: 'AMC Vendor',
            dataIndex: 'amc_vendor',
            key: 'amc_vendor',
            sorter: (a, b) => a.amc_vendor.localeCompare(b.amc_vendor),
            ...getColumnSearchProps('amc_vendor'),
        },

        // Financial Year Summary
        {
            title: 'Opening Value',
            dataIndex: 'opening_value',
            key: 'opening_value',
            sorter: (a, b) => parseFloat(a.opening_value.replace(/[₹,]/g, '')) - parseFloat(b.opening_value.replace(/[₹,]/g, '')),
        },
        {
            title: 'Additions',
            dataIndex: 'additions',
            key: 'additions',
            sorter: (a, b) => parseFloat(a.additions.replace(/[₹,]/g, '')) - parseFloat(b.additions.replace(/[₹,]/g, '')),
        },
        {
            title: 'Deletions / Retirements',
            dataIndex: 'deletions_retirements',
            key: 'deletions_retirements',
            sorter: (a, b) => parseFloat(a.deletions_retirements.replace(/[₹,]/g, '')) - parseFloat(b.deletions_retirements.replace(/[₹,]/g, '')),
        },
        {
            title: 'Closing Value',
            dataIndex: 'closing_value',
            key: 'closing_value',
            sorter: (a, b) => parseFloat(a.closing_value.replace(/[₹,]/g, '')) - parseFloat(b.closing_value.replace(/[₹,]/g, '')),
        },
        {
            title: 'Total Depreciation for FY',
            dataIndex: 'total_depreciation_fy',
            key: 'total_depreciation_fy',
            sorter: (a, b) => parseFloat(a.total_depreciation_fy.replace(/[₹,]/g, '')) - parseFloat(b.total_depreciation_fy.replace(/[₹,]/g, '')),
        },
        {
            title: 'Net Asset Value (Book)',
            dataIndex: 'net_asset_value_book',
            key: 'net_asset_value_book',
            sorter: (a, b) => parseFloat(a.net_asset_value_book.replace(/[₹,]/g, '')) - parseFloat(b.net_asset_value_book.replace(/[₹,]/g, '')),
        },

        // Remarks & Audit Info
        {
            title: 'Verified By',
            dataIndex: 'verified_by',
            key: 'verified_by',
            sorter: (a, b) => a.verified_by.localeCompare(b.verified_by),
            ...getColumnSearchProps('verified_by'),
        },
        {
            title: 'Audit Date',
            dataIndex: 'audit_date',
            key: 'audit_date',
            sorter: (a, b) => new Date(a.audit_date) - new Date(b.audit_date),
            render: (text) => text ? dayjs(text).format('DD-MMM-YY') : '',
        },
        {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            sorter: (a, b) => a.remarks.localeCompare(b.remarks),
            ...getColumnSearchProps('remarks'),
        },

        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        ghost
                        icon={<FaEye />}
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('View', record);
                        }}
                    />
                    <Button
                        ghost
                        icon={<FaEdit />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(record);
                        }}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="container-fluid p-1 position-relative" style={{ minHeight: "100vh" }}>
            {/* Top Navigation Bar - Back Button and Breadcrumb */}
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

            {/* Title and Description */}
            <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                    <h2 className="mb-1">Maintenance & Repair Report</h2>
                    <p className="mt-0 text-muted">Track maintenance activities and repair operations</p>
                </div>
                <div className="d-flex gap-2">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add New Record
                    </Button>
                    <Button
                        icon={<FaFilter />}
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                        Advanced Filters
                    </Button>
                    <Button
                        onClick={clearAllFilters}
                    >
                        Clear Filters
                    </Button>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'excel',
                                    label: 'Excel',
                                    icon: <FaDownload />,
                                },
                                {
                                    key: 'dashboard',
                                    label: 'Dashboard',
                                    icon: <FaChartLine />,
                                },
                            ],
                            onClick: ({ key }) => {
                                handleExportClick(key);
                            },
                        }}
                        trigger={['click']}
                    >
                        <Button>
                            Export <DownOutlined />
                        </Button>
                    </Dropdown>
                </div>
            </div>

            {/* Query Editor Filters */}
            <div className="card mt-3 mb-3">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Query Editor</h5>
                    <Button type="text" onClick={clearQueryFilters} size="small">
                        Clear Filters
                    </Button>
                </div>
                <div className="card-body">
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
                                    border: 'none', 
                                    background: 'none',
                                    padding: '4px 8px',
                                    height: 'auto'
                                }}
                            >
                                Add new clause
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
                <div className="card mt-3 mb-3">
                    <div className="card-header">
                        <h5 className="mb-0">Advanced Filters</h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-3">
                                <label className="form-label">Maintenance Type</label>
                                <Select
                                    placeholder="Select Type"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.maintenance_type}
                                    onChange={(value) => handleAdvancedFilterChange('maintenance_type', value)}
                                >
                                    <Select.Option value="Preventive">Preventive</Select.Option>
                                    <Select.Option value="Corrective">Corrective</Select.Option>
                                    <Select.Option value="Emergency">Emergency</Select.Option>
                                </Select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Status</label>
                                <Select
                                    placeholder="Select Status"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.status}
                                    onChange={(value) => handleAdvancedFilterChange('status', value)}
                                >
                                    <Select.Option value="Completed">Completed</Select.Option>
                                    <Select.Option value="In Progress">In Progress</Select.Option>
                                    <Select.Option value="Pending">Pending</Select.Option>
                                </Select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">AMC Coverage</label>
                                <Select
                                    placeholder="Select AMC Coverage"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.amc_coverage}
                                    onChange={(value) => handleAdvancedFilterChange('amc_coverage', value)}
                                >
                                    <Select.Option value="Under AMC">Under AMC</Select.Option>
                                    <Select.Option value="Out of AMC">Out of AMC</Select.Option>
                                </Select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Warranty Status</label>
                                <Select
                                    placeholder="Select Warranty Status"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.warranty_status}
                                    onChange={(value) => handleAdvancedFilterChange('warranty_status', value)}
                                >
                                    <Select.Option value="Within Warranty">Within Warranty</Select.Option>
                                    <Select.Option value="Out of Warranty">Out of Warranty</Select.Option>
                                </Select>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-3">
                                <label className="form-label">Maintenance Agency/Vendor</label>
                                <Input
                                    placeholder="Search Agency/Vendor"
                                    value={advancedFilters.maintenance_agency_vendor}
                                    onChange={(e) => handleAdvancedFilterChange('maintenance_agency_vendor', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Location/Site</label>
                                <Input
                                    placeholder="Search Location/Site"
                                    value={advancedFilters.location_site}
                                    onChange={(e) => handleAdvancedFilterChange('location_site', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Date Range (Scheduled)</label>
                                <DatePicker.RangePicker
                                    style={{ width: '100%' }}
                                    format="DD-MMM-YY"
                                    onChange={(dates) => {
                                        if (dates && dates[0] && dates[1]) {
                                            handleAdvancedFilterChange('scheduled_date', {
                                                range: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]
                                            });
                                        } else {
                                            handleAdvancedFilterChange('scheduled_date', null);
                                        }
                                    }}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Cost Range (₹)</label>
                                <Input.Group compact>
                                    <Input
                                        placeholder="Min Cost"
                                        style={{ width: '50%' }}
                                        onChange={(e) => {
                                            const min = parseFloat(e.target.value) || 0;
                                            const max = advancedFilters.total_maintenance_cost?.numeric?.[1] || 999999999;
                                            handleAdvancedFilterChange('total_maintenance_cost', { numeric: [min, max] });
                                        }}
                                    />
                                    <Input
                                        placeholder="Max Cost"
                                        style={{ width: '50%' }}
                                        onChange={(e) => {
                                            const max = parseFloat(e.target.value) || 999999999;
                                            const min = advancedFilters.total_maintenance_cost?.numeric?.[0] || 0;
                                            handleAdvancedFilterChange('total_maintenance_cost', { numeric: [min, max] });
                                        }}
                                    />
                                </Input.Group>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card shadow-sm mt-2">
                <div className="card-body">
                    <Table
                        columns={columns}
                        dataSource={getFilteredData()}
                        loading={loading}
                        style={{
                            '--ant-table-header-cell-white-space': 'nowrap'
                        }}
                        components={{
                            header: {
                                cell: (props) => (
                                    <th {...props} style={{ ...props.style, whiteSpace: 'nowrap' }} />
                                )
                            }
                        }}
                        pagination={{
                            ...pagination,
                            total: getFilteredData().length,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => (
                                <span>
                                    {range[0]}-{range[1]} of {total} items
                                    {Object.keys({ ...filteredInfo, ...advancedFilters }).length > 0 && (
                                        <span className="text-muted"> (filtered from {dataSource.length} total)</span>
                                    )}
                                </span>
                            ),
                            pageSizeOptions: ['5', '10', '20', '50'],
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1200 }}
                        rowKey="key"
                    />
                </div>
            </div>


            <Drawer
                title={editingIndex ? "Edit Asset Lifecycle Information" : "Create Asset Lifecycle Information"}
                width={800}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        payment_status: 'Paid',
                        depreciation_method: 'Straight Line Method',
                        current_status: 'Active',
                        amc_status: 'Under AMC'
                    }}
                >
                    {/* Asset Identification Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Asset Identification</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="asset_id"
                                label="Asset ID"
                                rules={[{ required: true, message: 'Please enter Asset ID' }]}
                            >
                                <Input placeholder="e.g., ASSET-TEL-000123" />
                            </Form.Item>
                            <Form.Item
                                name="asset_name"
                                label="Asset Name"
                                rules={[{ required: true, message: 'Please enter Asset Name' }]}
                            >
                                <Input placeholder="e.g., OLT - Huawei MA5800" />
                            </Form.Item>
                            <Form.Item
                                name="asset_category"
                                label="Asset Category"
                                rules={[{ required: true, message: 'Please enter Asset Category' }]}
                            >
                                <Input placeholder="e.g., Telecom Equipment" />
                            </Form.Item>
                            <Form.Item
                                name="asset_subcategory"
                                label="Asset Subcategory"
                                rules={[{ required: true, message: 'Please enter Asset Subcategory' }]}
                            >
                                <Input placeholder="e.g., OLT" />
                            </Form.Item>
                            <Form.Item
                                name="location_site_name"
                                label="Location / Site Name"
                                rules={[{ required: true, message: 'Please enter Location/Site Name' }]}
                            >
                                <Input placeholder="e.g., GPON POP - Chennai South" />
                            </Form.Item>
                            <Form.Item
                                name="department_project"
                                label="Department / Project"
                                rules={[{ required: true, message: 'Please enter Department/Project' }]}
                            >
                                <Input placeholder="e.g., BharatNet Phase II" />
                            </Form.Item>
                            <Form.Item
                                name="custodian_responsible_person"
                                label="Custodian / Responsible Person"
                                rules={[{ required: true, message: 'Please enter Custodian/Responsible Person' }]}
                            >
                                <Input placeholder="e.g., Network Team" />
                            </Form.Item>
                        </div>
                    </div>


                    {/* Financial Details Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Financial Details</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="purchase_order_no"
                                label="Purchase Order No."
                                rules={[{ required: true, message: 'Please enter Purchase Order No.' }]}
                            >
                                <Input placeholder="e.g., PO/BN/2024/089" />
                            </Form.Item>
                            <Form.Item
                                name="po_date"
                                label="PO Date"
                                rules={[{ required: true, message: 'Please select PO Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="vendor_name"
                                label="Vendor Name"
                                rules={[{ required: true, message: 'Please enter Vendor Name' }]}
                            >
                                <Input placeholder="e.g., Huawei India Pvt Ltd" />
                            </Form.Item>
                            <Form.Item
                                name="invoice_no"
                                label="Invoice No."
                                rules={[{ required: true, message: 'Please enter Invoice No.' }]}
                            >
                                <Input placeholder="e.g., INV/4567/24" />
                            </Form.Item>
                            <Form.Item
                                name="invoice_date"
                                label="Invoice Date"
                                rules={[{ required: true, message: 'Please select Invoice Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="invoice_value"
                                label="Invoice Value (₹)"
                                rules={[{ required: true, message: 'Please enter Invoice Value' }]}
                            >
                                <Input placeholder="e.g., ₹4,50,000" />
                            </Form.Item>
                            <Form.Item
                                name="gst_tax_amount"
                                label="GST / Tax Amount (₹)"
                                rules={[{ required: true, message: 'Please enter GST/Tax Amount' }]}
                            >
                                <Input placeholder="e.g., ₹81,000" />
                            </Form.Item>
                            <Form.Item
                                name="total_capitalized_value"
                                label="Total Capitalized Value (₹)"
                                rules={[{ required: true, message: 'Please enter Total Capitalized Value' }]}
                            >
                                <Input placeholder="e.g., ₹5,31,000" />
                            </Form.Item>
                            <Form.Item
                                name="capitalization_date"
                                label="Capitalization Date"
                                rules={[{ required: true, message: 'Please select Capitalization Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="payment_status"
                                label="Payment Status"
                                rules={[{ required: true, message: 'Please select Payment Status' }]}
                            >
                                <Select placeholder="Select payment status">
                                    <Select.Option value="Paid">Paid</Select.Option>
                                    <Select.Option value="Pending">Pending</Select.Option>
                                    <Select.Option value="Part Paid">Part Paid</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="asset_life_years"
                                label="Asset Life (Years)"
                                rules={[{ required: true, message: 'Please enter Asset Life' }]}
                            >
                                <Input placeholder="e.g., 7" />
                            </Form.Item>
                        </div>
                    </div>


                    {/* Depreciation Summary Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Depreciation Summary</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="depreciation_method"
                                label="Depreciation Method"
                                rules={[{ required: true, message: 'Please select Depreciation Method' }]}
                            >
                                <Select placeholder="Select depreciation method">
                                    <Select.Option value="Straight Line Method">Straight Line Method</Select.Option>
                                    <Select.Option value="WDV">WDV</Select.Option>
                                    <Select.Option value="Custom">Custom</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="depreciation_rate"
                                label="Depreciation Rate (%)"
                                rules={[{ required: true, message: 'Please enter Depreciation Rate' }]}
                            >
                                <Input placeholder="e.g., 15%" />
                            </Form.Item>
                            <Form.Item
                                name="accumulated_depreciation"
                                label="Accumulated Depreciation (₹)"
                                rules={[{ required: true, message: 'Please enter Accumulated Depreciation' }]}
                            >
                                <Input placeholder="e.g., ₹90,000" />
                            </Form.Item>
                            <Form.Item
                                name="net_book_value"
                                label="Net Book Value (₹)"
                                rules={[{ required: true, message: 'Please enter Net Book Value' }]}
                            >
                                <Input placeholder="e.g., ₹4,41,000" />
                            </Form.Item>
                            <Form.Item
                                name="residual_value"
                                label="Residual Value (₹)"
                                rules={[{ required: true, message: 'Please enter Residual Value' }]}
                            >
                                <Input placeholder="e.g., ₹30,000" />
                            </Form.Item>
                        </div>
                    </div>


                    {/* Operational Status Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Operational Status</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="current_status"
                                label="Current Status"
                                rules={[{ required: true, message: 'Please select Current Status' }]}
                            >
                                <Select placeholder="Select current status">
                                    <Select.Option value="Active">Active</Select.Option>
                                    <Select.Option value="Under Repair">Under Repair</Select.Option>
                                    <Select.Option value="Retired">Retired</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="asset_movement"
                                label="Asset Movement"
                                rules={[{ required: true, message: 'Please enter Asset Movement' }]}
                            >
                                <Input placeholder="e.g., Moved to Salem POP on 10-Jul-2024" />
                            </Form.Item>
                            <Form.Item
                                name="utilization_percentage"
                                label="Utilization %"
                                rules={[{ required: true, message: 'Please enter Utilization %' }]}
                            >
                                <Input placeholder="e.g., 95%" />
                            </Form.Item>
                            <Form.Item
                                name="amc_status"
                                label="AMC Status"
                                rules={[{ required: true, message: 'Please select AMC Status' }]}
                            >
                                <Select placeholder="Select AMC status">
                                    <Select.Option value="Under AMC">Under AMC</Select.Option>
                                    <Select.Option value="Expired">Expired</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="amc_vendor"
                                label="AMC Vendor"
                                rules={[{ required: true, message: 'Please enter AMC Vendor' }]}
                            >
                                <Input placeholder="e.g., Huawei Support India" />
                            </Form.Item>
                        </div>
                    </div>


                    {/* Financial Year Summary Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Financial Year Summary</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="opening_value"
                                label="Opening Value"
                                rules={[{ required: true, message: 'Please enter Opening Value' }]}
                            >
                                <Input placeholder="e.g., ₹5,31,000" />
                            </Form.Item>
                            <Form.Item
                                name="additions"
                                label="Additions"
                                rules={[{ required: true, message: 'Please enter Additions' }]}
                            >
                                <Input placeholder="e.g., ₹2,50,000" />
                            </Form.Item>
                            <Form.Item
                                name="deletions_retirements"
                                label="Deletions / Retirements"
                                rules={[{ required: true, message: 'Please enter Deletions/Retirements' }]}
                            >
                                <Input placeholder="e.g., ₹50,000" />
                            </Form.Item>
                            <Form.Item
                                name="closing_value"
                                label="Closing Value"
                                rules={[{ required: true, message: 'Please enter Closing Value' }]}
                            >
                                <Input placeholder="e.g., ₹7,31,000" />
                            </Form.Item>
                            <Form.Item
                                name="total_depreciation_fy"
                                label="Total Depreciation for FY"
                                rules={[{ required: true, message: 'Please enter Total Depreciation for FY' }]}
                            >
                                <Input placeholder="e.g., ₹1,20,000" />
                            </Form.Item>
                            <Form.Item
                                name="net_asset_value_book"
                                label="Net Asset Value (Book)"
                                rules={[{ required: true, message: 'Please enter Net Asset Value (Book)' }]}
                            >
                                <Input placeholder="e.g., ₹6,11,000" />
                            </Form.Item>
                        </div>
                    </div>


                    {/* Remarks & Audit Info Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Remarks & Audit Info</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="verified_by"
                                label="Verified By"
                                rules={[{ required: true, message: 'Please enter Verified By' }]}
                            >
                                <Input placeholder="e.g., Finance Head" />
                            </Form.Item>
                            <Form.Item
                                name="audit_date"
                                label="Audit Date"
                                rules={[{ required: true, message: 'Please select Audit Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="remarks"
                                label="Remarks"
                                style={{ gridColumn: '1 / -1' }}
                            >
                                <Input.TextArea rows={3} placeholder="e.g., Revalued in FY 2024-25" />
                            </Form.Item>
                        </div>
                    </div>


                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                        <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
                            Cancel

                        </Button>
                        <Button type="primary" loading={loading} htmlType="submit">
                            {editingIndex ? 'Update' : 'Create'}
                        </Button>
                    </div>

                </Form>
            </Drawer>
        </div>
    );
};


export default MaintenanceRepairReport;