import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { FaDownload, FaFilter, FaSearch, FaCalendarAlt, FaChartLine, FaSave, FaTimes, FaPlus, FaEdit, FaEye, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { Table, Input, Button, Space, Drawer, Form, Select, DatePicker, message, Popconfirm, Dropdown } from 'antd';
import { SearchOutlined, PlusOutlined, DownOutlined, FilterOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleExport, formatDataForExport, getExportOptions, applyFilters, applySorting } from '../../utils/exportUtils';
import '../../App.css';

const AssetLifecycleReport = () => {
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

    // Fetch asset lifecycle data from API
    const fetchAssetLifecycleData = async () => {
        setLoading(true);
        try {
            console.log('Fetching asset lifecycle data from API...');
            const response = await fetch('http://202.53.92.35:5004/api/asset-lifecycle', {
                headers: {
                    "x-access-token": sessionStorage.getItem("token"),
                }
            });
            console.log('API Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('API Response data:', data);

                // Handle different response formats
                let lifecycleData = [];
                if (data.success && Array.isArray(data.asset_lifecycle)) {
                    lifecycleData = data.asset_lifecycle;
                    console.log('Using asset_lifecycle array:', lifecycleData.length, 'items');
                } else if (Array.isArray(data)) {
                    lifecycleData = data;
                    console.log('Using direct array format:', lifecycleData.length, 'items');
                } else {
                    console.log('Unexpected API response format:', data);
                    lifecycleData = [];
                }

                const dataWithKeys = lifecycleData.map((item, index) => ({
                    ...item,
                    key: item.asset_id || index,
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
                        // Asset Identification
                        asset_id: 'ASSET-TEL-000345',
                        asset_name: 'ODF 24F Rack',
                        asset_category: 'Fiber Accessories',
                        asset_subcategory: 'ODF',
                        serial_no: '24F-ODF-HW-0021',
                        tag_barcode: 'GLN-ODF-00021',
                        project_department: 'BharatNet Phase II',

                        // Procurement & Capitalization
                        purchase_order_no: 'PO/BN/2024/105',
                        po_date: '10-May-24',
                        vendor_supplier: 'HFCL Telecom Pvt Ltd',
                        invoice_no: 'INV/7896/24',
                        invoice_value: '₹85,000',
                        capitalization_date: '20-May-24',

                        // Deployment / Commissioning
                        installation_location: 'POP - Madurai West',
                        installed_by: 'Team FiberLink',
                        installation_date: '25-May-24',
                        commissioning_status: 'Commissioned',
                        go_live_date: '30-May-24',

                        // Operation & Maintenance
                        current_custodian: 'Network Ops',
                        amc_status: 'Under AMC',
                        amc_vendor: 'HFCL AMC Division',
                        last_maintenance_date: '15-Mar-25',
                        next_maintenance_due: '15-Sep-25',
                        uptime_percentage: '99.20%',
                        downtime_hours_ytd: '10 hrs',
                        utilization_level: '90%',

                        // Movement / Transfer
                        transfer_type: 'Within Project',
                        from_location: 'POP - Madurai West',
                        to_location: 'POP - Dindigul',
                        transfer_date: '05-Jul-25',
                        approved_by: 'Asset Manager',

                        // Incident & Repair History
                        incident_id: 'TCK-24567',
                        incident_date: '10-Sep-25',
                        nature_of_fault: 'Power Module Fault',
                        resolution_date: '12-Sep-25',
                        resolution_summary: 'Module replaced under AMC',

                        // Depreciation & Valuation
                        original_value: '₹85,000',
                        accumulated_depreciation: '₹18,000',
                        net_book_value: '₹67,000',
                        asset_life_years: '7',
                        remaining_life_years: '6',

                        // Retirement / Disposal
                        retirement_status: 'Active',
                        retirement_date: '',
                        disposal_method: '',
                        sale_value: '',
                        scrap_value: '',
                        approved_by_retirement: 'Finance Head',
                        verified_by: 'Audit Team',

                        // Audit & Remarks
                        audit_date: '31-Mar-25',
                        remarks: 'Working fine under AMC'
                    },
                    {
                        key: 2,
                        // Asset Identification
                        asset_id: 'ASSET-IT-000123',
                        asset_name: 'Dell Server Rack',
                        asset_category: 'IT Infrastructure',
                        asset_subcategory: 'Server',
                        serial_no: 'DELL-SRV-2024-001',
                        tag_barcode: 'IT-SRV-000123',
                        project_department: 'Digital Infrastructure',

                        // Procurement & Capitalization
                        purchase_order_no: 'PO/IT/2024/089',
                        po_date: '15-Mar-24',
                        vendor_supplier: 'Dell Technologies',
                        invoice_no: 'INV/DELL/4567',
                        invoice_value: '₹2,50,000',
                        capitalization_date: '25-Mar-24',

                        // Deployment / Commissioning
                        installation_location: 'Data Center - Mumbai',
                        installed_by: 'Dell Installation Team',
                        installation_date: '30-Mar-24',
                        commissioning_status: 'Commissioned',
                        go_live_date: '05-Apr-24',

                        // Operation & Maintenance
                        current_custodian: 'IT Operations',
                        amc_status: 'Under AMC',
                        amc_vendor: 'Dell Support Services',
                        last_maintenance_date: '20-Feb-25',
                        next_maintenance_due: '20-Aug-25',
                        uptime_percentage: '99.95%',
                        downtime_hours_ytd: '2 hrs',
                        utilization_level: '85%',

                        // Movement / Transfer
                        transfer_type: 'Inter-Project',
                        from_location: 'Data Center - Mumbai',
                        to_location: 'Data Center - Delhi',
                        transfer_date: '10-Jun-25',
                        approved_by: 'IT Director',

                        // Incident & Repair History
                        incident_id: 'TCK-23456',
                        incident_date: '15-Aug-25',
                        nature_of_fault: 'Hardware Failure',
                        resolution_date: '16-Aug-25',
                        resolution_summary: 'RAM module replaced',

                        // Depreciation & Valuation
                        original_value: '₹2,50,000',
                        accumulated_depreciation: '₹45,000',
                        net_book_value: '₹2,05,000',
                        asset_life_years: '5',
                        remaining_life_years: '4',

                        // Retirement / Disposal
                        retirement_status: 'Active',
                        retirement_date: '',
                        disposal_method: '',
                        sale_value: '',
                        scrap_value: '',
                        approved_by_retirement: 'Finance Head',
                        verified_by: 'Audit Team',

                        // Audit & Remarks
                        audit_date: '30-Jun-25',
                        remarks: 'Performance excellent, under warranty'
                    },
                    {
                        key: 3,
                        // Asset Identification
                        asset_id: 'ASSET-VEH-000456',
                        asset_name: 'Mahindra Bolero',
                        asset_category: 'Vehicle',
                        asset_subcategory: 'Utility Vehicle',
                        serial_no: 'MH-BOL-2024-789',
                        tag_barcode: 'VEH-BOL-000456',
                        project_department: 'Field Operations',

                        // Procurement & Capitalization
                        purchase_order_no: 'PO/VEH/2024/012',
                        po_date: '01-Jan-24',
                        vendor_supplier: 'Mahindra & Mahindra',
                        invoice_no: 'INV/MH/8901',
                        invoice_value: '₹8,50,000',
                        capitalization_date: '10-Jan-24',

                        // Deployment / Commissioning
                        installation_location: 'Regional Office - Chennai',
                        installed_by: 'Mahindra Dealer',
                        installation_date: '15-Jan-24',
                        commissioning_status: 'Commissioned',
                        go_live_date: '20-Jan-24',

                        // Operation & Maintenance
                        current_custodian: 'Field Operations Team',
                        amc_status: 'Under AMC',
                        amc_vendor: 'Mahindra Service Center',
                        last_maintenance_date: '10-Mar-25',
                        next_maintenance_due: '10-Sep-25',
                        uptime_percentage: '95.50%',
                        downtime_hours_ytd: '15 hrs',
                        utilization_level: '75%',

                        // Movement / Transfer
                        transfer_type: 'Inter-Region',
                        from_location: 'Regional Office - Chennai',
                        to_location: 'Regional Office - Bangalore',
                        transfer_date: '20-Aug-25',
                        approved_by: 'Regional Manager',

                        // Incident & Repair History
                        incident_id: 'TCK-25678',
                        incident_date: '05-Oct-25',
                        nature_of_fault: 'Engine Issue',
                        resolution_date: '08-Oct-25',
                        resolution_summary: 'Engine service completed',

                        // Depreciation & Valuation
                        original_value: '₹8,50,000',
                        accumulated_depreciation: '₹1,70,000',
                        net_book_value: '₹6,80,000',
                        asset_life_years: '8',
                        remaining_life_years: '7',

                        // Retirement / Disposal
                        retirement_status: 'Active',
                        retirement_date: '',
                        disposal_method: '',
                        sale_value: '',
                        scrap_value: '',
                        approved_by_retirement: 'Finance Head',
                        verified_by: 'Audit Team',

                        // Audit & Remarks
                        audit_date: '15-Sep-25',
                        remarks: 'Vehicle in good condition, regular maintenance'
                    }
                ];
                setDataSource(sampleData);
                setPagination(prev => ({ ...prev, total: sampleData.length }));
                message.info("Using sample data - API not available");
            }
        } catch (error) {
            console.error('Error fetching asset lifecycle data:', error);
            message.error("Failed to load asset lifecycle data");
            setDataSource([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssetLifecycleData();
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
                asset_id: editingIndex !== null ? editingRecord?.asset_id : values.asset_id,
                asset_name: values.asset_name,
                category: values.category,
                location: values.location,
                status: values.status,
                custodian: values.custodian,
                value: values.value,
                last_maintenance: values.last_maintenance,
                next_maintenance: values.next_maintenance,
                purchase_date: values.purchase_date,
                warranty_end: values.warranty_end,
                depreciation_method: values.depreciation_method,
                current_value: values.current_value
            };

            console.log('Submitting asset lifecycle data:', apiData);

            let response;
            if (editingIndex !== null) {
                // Update existing record
                response = await fetch('http://202.53.92.35:5004/api/asset-lifecycle', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        "x-access-token": sessionStorage.getItem("token"),
                    },
                    body: JSON.stringify(apiData),
                });
            } else {
                // Create new record
                response = await fetch('http://202.53.92.35:5004/api/asset-lifecycle', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "x-access-token": sessionStorage.getItem("token"),
                    },
                    body: JSON.stringify(apiData),
                });
            }

            if (response.ok) {
                message.success(editingIndex !== null ? 'Asset lifecycle data updated successfully' : 'Asset lifecycle data created successfully');
                setDrawerVisible(false);
                form.resetFields();
                setEditingIndex(null);
                setEditingRecord(null);
                fetchAssetLifecycleData();
            } else {
                message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} asset lifecycle data`);
            }
        } catch (error) {
            console.error('Error saving asset lifecycle data:', error);
            message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} asset lifecycle data`);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (record) => {
        console.log('Editing record:', record);

        const formValues = {
            asset_id: record.asset_id,
            asset_name: record.asset_name,
            category: record.category,
            location: record.location,
            status: record.status,
            custodian: record.custodian,
            value: record.value,
            last_maintenance: record.last_maintenance,
            next_maintenance: record.next_maintenance,
            purchase_date: record.purchase_date,
            warranty_end: record.warranty_end,
            depreciation_method: record.depreciation_method,
            current_value: record.current_value
        };

        form.setFieldsValue(formValues);
        setEditingIndex(record.key);
        setEditingRecord(record);
        setDrawerVisible(true);
    };

    // Handle delete
    const handleDelete = async (record) => {
        try {
            const response = await fetch('http://202.53.92.35:5004/api/asset-lifecycle', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "x-access-token": sessionStorage.getItem("token"),
                },
                body: JSON.stringify({
                    asset_id: record.asset_id
                }),
            });

            if (response.ok) {
                message.success('Asset lifecycle data deleted successfully');
                fetchAssetLifecycleData();
            } else {
                message.error('Failed to delete asset lifecycle data');
            }
        } catch (error) {
            console.error('Error deleting asset lifecycle data:', error);
            message.error('Failed to delete asset lifecycle data');
        }
    };

    // Handle create new
    const handleCreate = () => {
        console.log('Creating new asset lifecycle record');
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

            console.log(`Asset Lifecycle Report: Export clicked - type="${exportType}", ${currentData.length} records, ${columns.length} columns`);
            console.log('Asset Lifecycle Report: Column titles:', columns.map(col => col.title));

            const result = handleExport(
                exportType,
                formattedData,
                columns,
                'Asset_Lifecycle_Report',
                'Asset Lifecycle Report',
                'asset-lifecycle',
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
                    case 'Changed Date': fieldValue = item.installation_date || ''; break;
                    case 'Work Item Type': fieldValue = item.asset_category || ''; break;
                    case 'State': fieldValue = item.retirement_status || ''; break;
                    case 'Asset ID': fieldValue = item.asset_id || ''; break;
                    case 'Asset Name': fieldValue = item.asset_name || ''; break;
                    case 'Category': fieldValue = item.asset_category || ''; break;
                    case 'Location': fieldValue = item.installation_location || ''; break;
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
            filters: [
                { text: 'Fiber Accessories', value: 'Fiber Accessories' },
                { text: 'IT Infrastructure', value: 'IT Infrastructure' },
                { text: 'Vehicle', value: 'Vehicle' },
                { text: 'Equipment', value: 'Equipment' },
            ],
            onFilter: (value, record) => record.asset_category === value,
        },
        {
            title: 'Asset Subcategory',
            dataIndex: 'asset_subcategory',
            key: 'asset_subcategory',
            sorter: (a, b) => a.asset_subcategory.localeCompare(b.asset_subcategory),
            ...getColumnSearchProps('asset_subcategory'),
        },
        {
            title: 'Serial No.',
            dataIndex: 'serial_no',
            key: 'serial_no',
            sorter: (a, b) => a.serial_no.localeCompare(b.serial_no),
            ...getColumnSearchProps('serial_no'),
        },
        {
            title: 'Tag / Barcode',
            dataIndex: 'tag_barcode',
            key: 'tag_barcode',
            sorter: (a, b) => a.tag_barcode.localeCompare(b.tag_barcode),
            ...getColumnSearchProps('tag_barcode'),
        },
        {
            title: 'Project / Department',
            dataIndex: 'project_department',
            key: 'project_department',
            sorter: (a, b) => a.project_department.localeCompare(b.project_department),
            ...getColumnSearchProps('project_department'),
        },

        // Procurement & Capitalization
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
            ...getColumnSearchProps('po_date'),
        },
        {
            title: 'Vendor / Supplier',
            dataIndex: 'vendor_supplier',
            key: 'vendor_supplier',
            sorter: (a, b) => a.vendor_supplier.localeCompare(b.vendor_supplier),
            ...getColumnSearchProps('vendor_supplier'),
        },
        {
            title: 'Invoice No.',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            sorter: (a, b) => a.invoice_no.localeCompare(b.invoice_no),
            ...getColumnSearchProps('invoice_no'),
        },
        {
            title: 'Invoice Value (₹)',
            dataIndex: 'invoice_value',
            key: 'invoice_value',
            sorter: (a, b) => parseFloat(a.invoice_value.replace(/[₹,]/g, '')) - parseFloat(b.invoice_value.replace(/[₹,]/g, '')),
        },
        {
            title: 'Capitalization Date',
            dataIndex: 'capitalization_date',
            key: 'capitalization_date',
            sorter: (a, b) => new Date(a.capitalization_date) - new Date(b.capitalization_date),
            ...getColumnSearchProps('capitalization_date'),
        },

        // Deployment / Commissioning
        {
            title: 'Installation Location',
            dataIndex: 'installation_location',
            key: 'installation_location',
            sorter: (a, b) => a.installation_location.localeCompare(b.installation_location),
            ...getColumnSearchProps('installation_location'),
        },
        {
            title: 'Installed By',
            dataIndex: 'installed_by',
            key: 'installed_by',
            sorter: (a, b) => a.installed_by.localeCompare(b.installed_by),
            ...getColumnSearchProps('installed_by'),
        },
        {
            title: 'Installation Date',
            dataIndex: 'installation_date',
            key: 'installation_date',
            sorter: (a, b) => new Date(a.installation_date) - new Date(b.installation_date),
            ...getColumnSearchProps('installation_date'),
        },
        {
            title: 'Commissioning Status',
            dataIndex: 'commissioning_status',
            key: 'commissioning_status',
            sorter: (a, b) => a.commissioning_status.localeCompare(b.commissioning_status),
            filters: [
                { text: 'Commissioned', value: 'Commissioned' },
                { text: 'Installed', value: 'Installed' },
                { text: 'Pending', value: 'Pending' },
            ],
            onFilter: (value, record) => record.commissioning_status === value,
            render: (status) => {
                let color = 'secondary';
                switch (status) {
                    case 'Commissioned': color = 'success'; break;
                    case 'Installed': color = 'warning'; break;
                    case 'Pending': color = 'info'; break;
                    default: color = 'secondary';
                }
                return <span className={`badge bg-${color}`}>{status}</span>;
            },
        },
        {
            title: 'Go-Live Date',
            dataIndex: 'go_live_date',
            key: 'go_live_date',
            sorter: (a, b) => new Date(a.go_live_date) - new Date(b.go_live_date),
            ...getColumnSearchProps('go_live_date'),
        },

        // Operation & Maintenance
        {
            title: 'Current Custodian',
            dataIndex: 'current_custodian',
            key: 'current_custodian',
            sorter: (a, b) => a.current_custodian.localeCompare(b.current_custodian),
            ...getColumnSearchProps('current_custodian'),
        },
        {
            title: 'AMC Status',
            dataIndex: 'amc_status',
            key: 'amc_status',
            sorter: (a, b) => a.amc_status.localeCompare(b.amc_status),
            filters: [
                { text: 'Under AMC', value: 'Under AMC' },
                { text: 'Expired', value: 'Expired' },
            ],
            onFilter: (value, record) => record.amc_status === value,
            render: (status) => {
                let color = status === 'Under AMC' ? 'success' : 'danger';
                return <span className={`badge bg-${color}`}>{status}</span>;
            },
        },
        {
            title: 'AMC Vendor',
            dataIndex: 'amc_vendor',
            key: 'amc_vendor',
            sorter: (a, b) => a.amc_vendor.localeCompare(b.amc_vendor),
            ...getColumnSearchProps('amc_vendor'),
        },
        {
            title: 'Last Maintenance Date',
            dataIndex: 'last_maintenance_date',
            key: 'last_maintenance_date',
            sorter: (a, b) => new Date(a.last_maintenance_date) - new Date(b.last_maintenance_date),
            ...getColumnSearchProps('last_maintenance_date'),
        },
        {
            title: 'Next Maintenance Due',
            dataIndex: 'next_maintenance_due',
            key: 'next_maintenance_due',
            sorter: (a, b) => new Date(a.next_maintenance_due) - new Date(b.next_maintenance_due),
            ...getColumnSearchProps('next_maintenance_due'),
        },
        {
            title: 'Uptime %',
            dataIndex: 'uptime_percentage',
            key: 'uptime_percentage',
            sorter: (a, b) => parseFloat(a.uptime_percentage) - parseFloat(b.uptime_percentage),
        },
        {
            title: 'Downtime Hours (YTD)',
            dataIndex: 'downtime_hours_ytd',
            key: 'downtime_hours_ytd',
            sorter: (a, b) => parseFloat(a.downtime_hours_ytd) - parseFloat(b.downtime_hours_ytd),
        },
        {
            title: 'Utilization Level (%)',
            dataIndex: 'utilization_level',
            key: 'utilization_level',
            sorter: (a, b) => parseFloat(a.utilization_level) - parseFloat(b.utilization_level),
        },

        // Movement / Transfer
        {
            title: 'Transfer Type',
            dataIndex: 'transfer_type',
            key: 'transfer_type',
            sorter: (a, b) => a.transfer_type.localeCompare(b.transfer_type),
            filters: [
                { text: 'Within Project', value: 'Within Project' },
                { text: 'Inter-Project', value: 'Inter-Project' },
                { text: 'Inter-Region', value: 'Inter-Region' },
            ],
            onFilter: (value, record) => record.transfer_type === value,
        },
        {
            title: 'From Location',
            dataIndex: 'from_location',
            key: 'from_location',
            sorter: (a, b) => a.from_location.localeCompare(b.from_location),
            ...getColumnSearchProps('from_location'),
        },
        {
            title: 'To Location',
            dataIndex: 'to_location',
            key: 'to_location',
            sorter: (a, b) => a.to_location.localeCompare(b.to_location),
            ...getColumnSearchProps('to_location'),
        },
        {
            title: 'Transfer Date',
            dataIndex: 'transfer_date',
            key: 'transfer_date',
            sorter: (a, b) => new Date(a.transfer_date) - new Date(b.transfer_date),
            ...getColumnSearchProps('transfer_date'),
        },
        {
            title: 'Approved By',
            dataIndex: 'approved_by',
            key: 'approved_by',
            sorter: (a, b) => a.approved_by.localeCompare(b.approved_by),
            ...getColumnSearchProps('approved_by'),
        },

        // Incident & Repair History
        {
            title: 'Incident ID',
            dataIndex: 'incident_id',
            key: 'incident_id',
            sorter: (a, b) => a.incident_id.localeCompare(b.incident_id),
            ...getColumnSearchProps('incident_id'),
        },
        {
            title: 'Incident Date',
            dataIndex: 'incident_date',
            key: 'incident_date',
            sorter: (a, b) => new Date(a.incident_date) - new Date(b.incident_date),
            ...getColumnSearchProps('incident_date'),
        },
        {
            title: 'Nature of Fault',
            dataIndex: 'nature_of_fault',
            key: 'nature_of_fault',
            sorter: (a, b) => a.nature_of_fault.localeCompare(b.nature_of_fault),
            ...getColumnSearchProps('nature_of_fault'),
        },
        {
            title: 'Resolution Date',
            dataIndex: 'resolution_date',
            key: 'resolution_date',
            sorter: (a, b) => new Date(a.resolution_date) - new Date(b.resolution_date),
            ...getColumnSearchProps('resolution_date'),
        },
        {
            title: 'Resolution Summary',
            dataIndex: 'resolution_summary',
            key: 'resolution_summary',
            sorter: (a, b) => a.resolution_summary.localeCompare(b.resolution_summary),
            ...getColumnSearchProps('resolution_summary'),
        },

        // Depreciation & Valuation
        {
            title: 'Original Value (₹)',
            dataIndex: 'original_value',
            key: 'original_value',
            sorter: (a, b) => parseFloat(a.original_value.replace(/[₹,]/g, '')) - parseFloat(b.original_value.replace(/[₹,]/g, '')),
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
            title: 'Asset Life (Years)',
            dataIndex: 'asset_life_years',
            key: 'asset_life_years',
            sorter: (a, b) => parseFloat(a.asset_life_years) - parseFloat(b.asset_life_years),
        },
        {
            title: 'Remaining Life (Years)',
            dataIndex: 'remaining_life_years',
            key: 'remaining_life_years',
            sorter: (a, b) => parseFloat(a.remaining_life_years) - parseFloat(b.remaining_life_years),
        },

        // Retirement / Disposal
        {
            title: 'Retirement Status',
            dataIndex: 'retirement_status',
            key: 'retirement_status',
            sorter: (a, b) => a.retirement_status.localeCompare(b.retirement_status),
            filters: [
                { text: 'Active', value: 'Active' },
                { text: 'Decommissioned', value: 'Decommissioned' },
                { text: 'Sold', value: 'Sold' },
                { text: 'Scrapped', value: 'Scrapped' },
            ],
            onFilter: (value, record) => record.retirement_status === value,
            render: (status) => {
                let color = 'secondary';
                switch (status) {
                    case 'Active': color = 'success'; break;
                    case 'Decommissioned': color = 'warning'; break;
                    case 'Sold': color = 'info'; break;
                    case 'Scrapped': color = 'danger'; break;
                    default: color = 'secondary';
                }
                return <span className={`badge bg-${color}`}>{status}</span>;
            },
        },
        {
            title: 'Retirement Date',
            dataIndex: 'retirement_date',
            key: 'retirement_date',
            sorter: (a, b) => new Date(a.retirement_date) - new Date(b.retirement_date),
            ...getColumnSearchProps('retirement_date'),
        },
        {
            title: 'Disposal Method',
            dataIndex: 'disposal_method',
            key: 'disposal_method',
            sorter: (a, b) => a.disposal_method.localeCompare(b.disposal_method),
            ...getColumnSearchProps('disposal_method'),
        },
        {
            title: 'Sale Value (₹)',
            dataIndex: 'sale_value',
            key: 'sale_value',
            sorter: (a, b) => parseFloat(a.sale_value.replace(/[₹,]/g, '')) - parseFloat(b.sale_value.replace(/[₹,]/g, '')),
        },
        {
            title: 'Scrap Value (₹)',
            dataIndex: 'scrap_value',
            key: 'scrap_value',
            sorter: (a, b) => parseFloat(a.scrap_value.replace(/[₹,]/g, '')) - parseFloat(b.scrap_value.replace(/[₹,]/g, '')),
        },
        {
            title: 'Approved By (Retirement)',
            dataIndex: 'approved_by_retirement',
            key: 'approved_by_retirement',
            sorter: (a, b) => a.approved_by_retirement.localeCompare(b.approved_by_retirement),
            ...getColumnSearchProps('approved_by_retirement'),
        },
        {
            title: 'Verified By',
            dataIndex: 'verified_by',
            key: 'verified_by',
            sorter: (a, b) => a.verified_by.localeCompare(b.verified_by),
            ...getColumnSearchProps('verified_by'),
        },

        // Audit & Remarks
        {
            title: 'Audit Date',
            dataIndex: 'audit_date',
            key: 'audit_date',
            sorter: (a, b) => new Date(a.audit_date) - new Date(b.audit_date),
            ...getColumnSearchProps('audit_date'),
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
        <>
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
                        <h2 className="mb-1">Asset Lifecycle Report</h2>
                        <p className="mt-0 text-muted">Complete asset lifecycle tracking from procurement to disposal</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            size="large"
                        >
                            Add New Record
                        </Button>
                        <Button
                            icon={<FaFilter />}
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            size="large"
                        >
                            Advanced Filters
                        </Button>
                        <Button
                            onClick={clearAllFilters}
                            size="large"
                        >
                            Clear Filters
                        </Button>
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'pdf',
                                        label: 'PDF (Full)',
                                        icon: <FaDownload />,
                                    },
                                    {
                                        key: 'pdf-compact',
                                        label: 'PDF (Compact)',
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
                            <Button size="large">
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
                                    <label className="form-label">Asset Category</label>
                                    <Select
                                        placeholder="Select Category"
                                        allowClear
                                        style={{ width: '100%' }}
                                        value={advancedFilters.asset_category}
                                        onChange={(value) => handleAdvancedFilterChange('asset_category', value)}
                                    >
                                        <Select.Option value="Fiber Accessories">Fiber Accessories</Select.Option>
                                        <Select.Option value="IT Infrastructure">IT Infrastructure</Select.Option>
                                        <Select.Option value="Vehicle">Vehicle</Select.Option>
                                        <Select.Option value="Equipment">Equipment</Select.Option>
                                    </Select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Commissioning Status</label>
                                    <Select
                                        placeholder="Select Status"
                                        allowClear
                                        style={{ width: '100%' }}
                                        value={advancedFilters.commissioning_status}
                                        onChange={(value) => handleAdvancedFilterChange('commissioning_status', value)}
                                    >
                                        <Select.Option value="Commissioned">Commissioned</Select.Option>
                                        <Select.Option value="Installed">Installed</Select.Option>
                                        <Select.Option value="Pending">Pending</Select.Option>
                                    </Select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">AMC Status</label>
                                    <Select
                                        placeholder="Select AMC Status"
                                        allowClear
                                        style={{ width: '100%' }}
                                        value={advancedFilters.amc_status}
                                        onChange={(value) => handleAdvancedFilterChange('amc_status', value)}
                                    >
                                        <Select.Option value="Under AMC">Under AMC</Select.Option>
                                        <Select.Option value="Expired">Expired</Select.Option>
                                    </Select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Retirement Status</label>
                                    <Select
                                        placeholder="Select Retirement Status"
                                        allowClear
                                        style={{ width: '100%' }}
                                        value={advancedFilters.retirement_status}
                                        onChange={(value) => handleAdvancedFilterChange('retirement_status', value)}
                                    >
                                        <Select.Option value="Active">Active</Select.Option>
                                        <Select.Option value="Decommissioned">Decommissioned</Select.Option>
                                        <Select.Option value="Sold">Sold</Select.Option>
                                        <Select.Option value="Scrapped">Scrapped</Select.Option>
                                    </Select>
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-md-3">
                                    <label className="form-label">Transfer Type</label>
                                    <Select
                                        placeholder="Select Transfer Type"
                                        allowClear
                                        style={{ width: '100%' }}
                                        value={advancedFilters.transfer_type}
                                        onChange={(value) => handleAdvancedFilterChange('transfer_type', value)}
                                    >
                                        <Select.Option value="Within Project">Within Project</Select.Option>
                                        <Select.Option value="Inter-Project">Inter-Project</Select.Option>
                                        <Select.Option value="Inter-Region">Inter-Region</Select.Option>
                                    </Select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Project/Department</label>
                                    <Input
                                        placeholder="Search Project/Department"
                                        value={advancedFilters.project_department}
                                        onChange={(e) => handleAdvancedFilterChange('project_department', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Vendor/Supplier</label>
                                    <Input
                                        placeholder="Search Vendor/Supplier"
                                        value={advancedFilters.vendor_supplier}
                                        onChange={(e) => handleAdvancedFilterChange('vendor_supplier', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Current Custodian</label>
                                    <Input
                                        placeholder="Search Custodian"
                                        value={advancedFilters.current_custodian}
                                        onChange={(e) => handleAdvancedFilterChange('current_custodian', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-md-3">
                                    <label className="form-label">Date Range (Installation)</label>
                                    <DatePicker.RangePicker
                                        style={{ width: '100%' }}
                                        format="DD-MMM-YY"
                                        onChange={(dates) => {
                                            if (dates && dates[0] && dates[1]) {
                                                handleAdvancedFilterChange('installation_date', {
                                                    range: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]
                                                });
                                            } else {
                                                handleAdvancedFilterChange('installation_date', null);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Value Range (₹)</label>
                                    <Input.Group compact>
                                        <Input
                                            placeholder="Min Value"
                                            style={{ width: '50%' }}
                                            onChange={(e) => {
                                                const min = parseFloat(e.target.value) || 0;
                                                const max = advancedFilters.invoice_value?.numeric?.[1] || 999999999;
                                                handleAdvancedFilterChange('invoice_value', { numeric: [min, max] });
                                            }}
                                        />
                                        <Input
                                            placeholder="Max Value"
                                            style={{ width: '50%' }}
                                            onChange={(e) => {
                                                const max = parseFloat(e.target.value) || 999999999;
                                                const min = advancedFilters.invoice_value?.numeric?.[0] || 0;
                                                handleAdvancedFilterChange('invoice_value', { numeric: [min, max] });
                                            }}
                                        />
                                    </Input.Group>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Uptime Range (%)</label>
                                    <Input.Group compact>
                                        <Input
                                            placeholder="Min %"
                                            style={{ width: '50%' }}
                                            onChange={(e) => {
                                                const min = parseFloat(e.target.value) || 0;
                                                const max = advancedFilters.uptime_percentage?.numeric?.[1] || 100;
                                                handleAdvancedFilterChange('uptime_percentage', { numeric: [min, max] });
                                            }}
                                        />
                                        <Input
                                            placeholder="Max %"
                                            style={{ width: '50%' }}
                                            onChange={(e) => {
                                                const max = parseFloat(e.target.value) || 100;
                                                const min = advancedFilters.uptime_percentage?.numeric?.[0] || 0;
                                                handleAdvancedFilterChange('uptime_percentage', { numeric: [min, max] });
                                            }}
                                        />
                                    </Input.Group>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Utilization Range (%)</label>
                                    <Input.Group compact>
                                        <Input
                                            placeholder="Min %"
                                            style={{ width: '50%' }}
                                            onChange={(e) => {
                                                const min = parseFloat(e.target.value) || 0;
                                                const max = advancedFilters.utilization_level?.numeric?.[1] || 100;
                                                handleAdvancedFilterChange('utilization_level', { numeric: [min, max] });
                                            }}
                                        />
                                        <Input
                                            placeholder="Max %"
                                            style={{ width: '50%' }}
                                            onChange={(e) => {
                                                const max = parseFloat(e.target.value) || 100;
                                                const min = advancedFilters.utilization_level?.numeric?.[0] || 0;
                                                handleAdvancedFilterChange('utilization_level', { numeric: [min, max] });
                                            }}
                                        />
                                    </Input.Group>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="mt-4">
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
                                    <th {...props} style={{
                                        ...props.style,
                                        whiteSpace: 'nowrap'
                                    }} />
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
                                    Showing {range[0]}-{range[1]} of {total} items
                                    {Object.keys({ ...filteredInfo, ...advancedFilters }).length > 0 && (
                                        <span className="text-muted"> (filtered from {dataSource.length} total)</span>
                                    )}
                                </span>
                            ),
                            pageSizeOptions: ['5', '10', '20', '50']
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 1200 }}
                        rowKey="key"
                        rowClassName={(record, index) =>
                            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
                        }
                    />
                </div>
            </div>

            <Drawer
                title={editingIndex ? "Edit Asset Lifecycle" : "Create Asset Lifecycle"}
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
                        retirement_status: 'Active',
                        asset_category: 'Fiber Accessories',
                        commissioning_status: 'Commissioned',
                        amc_status: 'Under AMC',
                        transfer_type: 'Within Project'
                    }}
                >
                    {/* Asset Identification Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Asset Identification</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="asset_id"
                                label="Asset ID"
                                rules={[
                                    { required: true, message: 'Please enter Asset ID' }
                                ]}
                            >
                                <Input placeholder="Enter asset ID" />
                            </Form.Item>
                            <Form.Item
                                name="asset_name"
                                label="Asset Name"
                                rules={[{ required: true, message: 'Please enter Asset Name' }]}
                            >
                                <Input placeholder="e.g., ODF 24F Rack" />
                            </Form.Item>
                            <Form.Item
                                name="asset_category"
                                label="Asset Category"
                                rules={[{ required: true, message: 'Please select Asset Category' }]}
                            >
                                <Select placeholder="Select category">
                                    <Select.Option value="Fiber Accessories">Fiber Accessories</Select.Option>
                                    <Select.Option value="IT Infrastructure">IT Infrastructure</Select.Option>
                                    <Select.Option value="Vehicle">Vehicle</Select.Option>
                                    <Select.Option value="Equipment">Equipment</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="asset_subcategory"
                                label="Asset Subcategory"
                                rules={[{ required: true, message: 'Please enter Asset Subcategory' }]}
                            >
                                <Input placeholder="e.g., ODF" />
                            </Form.Item>
                            <Form.Item
                                name="serial_no"
                                label="Serial No. / Part No."
                                rules={[{ required: true, message: 'Please enter Serial No.' }]}
                            >
                                <Input placeholder="e.g., 24F-ODF-HW-0021" />
                            </Form.Item>
                            <Form.Item
                                name="tag_barcode"
                                label="Tag / Barcode"
                                rules={[{ required: true, message: 'Please enter Tag/Barcode' }]}
                            >
                                <Input placeholder="e.g., GLN-ODF-00021" />
                            </Form.Item>
                            <Form.Item
                                name="project_department"
                                label="Project / Department"
                                rules={[{ required: true, message: 'Please enter Project/Department' }]}
                            >
                                <Input placeholder="e.g., BharatNet Phase II" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Procurement & Capitalization Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Procurement & Capitalization</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="purchase_order_no"
                                label="Purchase Order No."
                                rules={[{ required: true, message: 'Please enter Purchase Order No.' }]}
                            >
                                <Input placeholder="e.g., PO/BN/2024/105" />
                            </Form.Item>
                            <Form.Item
                                name="po_date"
                                label="PO Date"
                                rules={[{ required: true, message: 'Please select PO Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="vendor_supplier"
                                label="Vendor / Supplier"
                                rules={[{ required: true, message: 'Please enter Vendor/Supplier' }]}
                            >
                                <Input placeholder="e.g., HFCL Telecom Pvt Ltd" />
                            </Form.Item>
                            <Form.Item
                                name="invoice_no"
                                label="Invoice No."
                                rules={[{ required: true, message: 'Please enter Invoice No.' }]}
                            >
                                <Input placeholder="e.g., INV/7896/24" />
                            </Form.Item>
                            <Form.Item
                                name="invoice_value"
                                label="Invoice Value (₹)"
                                rules={[{ required: true, message: 'Please enter Invoice Value' }]}
                            >
                                <Input placeholder="e.g., ₹85,000" />
                            </Form.Item>
                            <Form.Item
                                name="capitalization_date"
                                label="Capitalization Date"
                                rules={[{ required: true, message: 'Please select Capitalization Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Deployment / Commissioning Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Deployment / Commissioning</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="installation_location"
                                label="Installation Location"
                                rules={[{ required: true, message: 'Please enter Installation Location' }]}
                            >
                                <Input placeholder="e.g., POP - Madurai West" />
                            </Form.Item>
                            <Form.Item
                                name="installed_by"
                                label="Installed By"
                                rules={[{ required: true, message: 'Please enter Installed By' }]}
                            >
                                <Input placeholder="e.g., Team FiberLink" />
                            </Form.Item>
                            <Form.Item
                                name="installation_date"
                                label="Installation Date"
                                rules={[{ required: true, message: 'Please select Installation Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="commissioning_status"
                                label="Commissioning Status"
                                rules={[{ required: true, message: 'Please select Commissioning Status' }]}
                            >
                                <Select placeholder="Select status">
                                    <Select.Option value="Commissioned">Commissioned</Select.Option>
                                    <Select.Option value="Installed">Installed</Select.Option>
                                    <Select.Option value="Pending">Pending</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="go_live_date"
                                label="Go-Live Date"
                                rules={[{ required: true, message: 'Please select Go-Live Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Operation & Maintenance Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Operation & Maintenance</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="current_custodian"
                                label="Current Custodian"
                                rules={[{ required: true, message: 'Please enter Current Custodian' }]}
                            >
                                <Input placeholder="e.g., Network Ops" />
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
                                <Input placeholder="e.g., HFCL AMC Division" />
                            </Form.Item>
                            <Form.Item
                                name="last_maintenance_date"
                                label="Last Maintenance Date"
                                rules={[{ required: true, message: 'Please select Last Maintenance Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="next_maintenance_due"
                                label="Next Maintenance Due"
                                rules={[{ required: true, message: 'Please select Next Maintenance Due' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="uptime_percentage"
                                label="Uptime %"
                                rules={[{ required: true, message: 'Please enter Uptime %' }]}
                            >
                                <Input placeholder="e.g., 99.20%" />
                            </Form.Item>
                            <Form.Item
                                name="downtime_hours_ytd"
                                label="Downtime Hours (YTD)"
                                rules={[{ required: true, message: 'Please enter Downtime Hours' }]}
                            >
                                <Input placeholder="e.g., 10 hrs" />
                            </Form.Item>
                            <Form.Item
                                name="utilization_level"
                                label="Utilization Level (%)"
                                rules={[{ required: true, message: 'Please enter Utilization Level' }]}
                            >
                                <Input placeholder="e.g., 90%" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Movement / Transfer Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Movement / Transfer</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="transfer_type"
                                label="Transfer Type"
                                rules={[{ required: true, message: 'Please select Transfer Type' }]}
                            >
                                <Select placeholder="Select transfer type">
                                    <Select.Option value="Within Project">Within Project</Select.Option>
                                    <Select.Option value="Inter-Project">Inter-Project</Select.Option>
                                    <Select.Option value="Inter-Region">Inter-Region</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="from_location"
                                label="From Location"
                                rules={[{ required: true, message: 'Please enter From Location' }]}
                            >
                                <Input placeholder="e.g., POP - Madurai West" />
                            </Form.Item>
                            <Form.Item
                                name="to_location"
                                label="To Location"
                                rules={[{ required: true, message: 'Please enter To Location' }]}
                            >
                                <Input placeholder="e.g., POP - Dindigul" />
                            </Form.Item>
                            <Form.Item
                                name="transfer_date"
                                label="Transfer Date"
                                rules={[{ required: true, message: 'Please select Transfer Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="approved_by"
                                label="Approved By"
                                rules={[{ required: true, message: 'Please enter Approved By' }]}
                            >
                                <Input placeholder="e.g., Asset Manager" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Incident & Repair History Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Incident & Repair History</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="incident_id"
                                label="Incident ID"
                                rules={[{ required: true, message: 'Please enter Incident ID' }]}
                            >
                                <Input placeholder="e.g., TCK-24567" />
                            </Form.Item>
                            <Form.Item
                                name="incident_date"
                                label="Incident Date"
                                rules={[{ required: true, message: 'Please select Incident Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="nature_of_fault"
                                label="Nature of Fault"
                                rules={[{ required: true, message: 'Please enter Nature of Fault' }]}
                            >
                                <Input placeholder="e.g., Power Module Fault" />
                            </Form.Item>
                            <Form.Item
                                name="resolution_date"
                                label="Resolution Date"
                                rules={[{ required: true, message: 'Please select Resolution Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="resolution_summary"
                                label="Resolution Summary"
                                rules={[{ required: true, message: 'Please enter Resolution Summary' }]}
                                style={{ gridColumn: '1 / -1' }}
                            >
                                <Input.TextArea rows={3} placeholder="e.g., Module replaced under AMC" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Depreciation & Valuation Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Depreciation & Valuation</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="original_value"
                                label="Original Value (₹)"
                                rules={[{ required: true, message: 'Please enter Original Value' }]}
                            >
                                <Input placeholder="e.g., ₹85,000" />
                            </Form.Item>
                            <Form.Item
                                name="accumulated_depreciation"
                                label="Accumulated Depreciation (₹)"
                                rules={[{ required: true, message: 'Please enter Accumulated Depreciation' }]}
                            >
                                <Input placeholder="e.g., ₹18,000" />
                            </Form.Item>
                            <Form.Item
                                name="net_book_value"
                                label="Net Book Value (₹)"
                                rules={[{ required: true, message: 'Please enter Net Book Value' }]}
                            >
                                <Input placeholder="e.g., ₹67,000" />
                            </Form.Item>
                            <Form.Item
                                name="asset_life_years"
                                label="Asset Life (Years)"
                                rules={[{ required: true, message: 'Please enter Asset Life' }]}
                            >
                                <Input placeholder="e.g., 7" />
                            </Form.Item>
                            <Form.Item
                                name="remaining_life_years"
                                label="Remaining Life (Years)"
                                rules={[{ required: true, message: 'Please enter Remaining Life' }]}
                            >
                                <Input placeholder="e.g., 6" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Retirement / Disposal Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Retirement / Disposal</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="retirement_status"
                                label="Retirement Status"
                                rules={[{ required: true, message: 'Please select Retirement Status' }]}
                            >
                                <Select placeholder="Select retirement status">
                                    <Select.Option value="Active">Active</Select.Option>
                                    <Select.Option value="Decommissioned">Decommissioned</Select.Option>
                                    <Select.Option value="Sold">Sold</Select.Option>
                                    <Select.Option value="Scrapped">Scrapped</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="retirement_date"
                                label="Retirement Date"
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="disposal_method"
                                label="Disposal Method"
                            >
                                <Select placeholder="Select disposal method">
                                    <Select.Option value="Sale">Sale</Select.Option>
                                    <Select.Option value="Scrap">Scrap</Select.Option>
                                    <Select.Option value="Transfer">Transfer</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="sale_value"
                                label="Sale Value (₹)"
                            >
                                <Input placeholder="e.g., ₹50,000" />
                            </Form.Item>
                            <Form.Item
                                name="scrap_value"
                                label="Scrap Value (₹)"
                            >
                                <Input placeholder="e.g., ₹5,000" />
                            </Form.Item>
                            <Form.Item
                                name="approved_by_retirement"
                                label="Approved By (Retirement)"
                            >
                                <Input placeholder="e.g., Finance Head" />
                            </Form.Item>
                            <Form.Item
                                name="verified_by"
                                label="Verified By"
                            >
                                <Input placeholder="e.g., Audit Team" />
                            </Form.Item>
                        </div>
                    </div>

                    {/* Audit & Remarks Section */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Audit & Remarks</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
                                <Input.TextArea rows={3} placeholder="e.g., Working fine under AMC" />
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
        </>
    );
};

export default AssetLifecycleReport;
