import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { FaDownload, FaFilter, FaSearch, FaCalendarAlt, FaChartLine, FaChartBar, FaPlus, FaEdit, FaEye, FaTrash, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { Table, Input, Button, Space, Drawer, Form, Select, DatePicker, message, Popconfirm, Dropdown } from 'antd';
import { SearchOutlined, PlusOutlined, DownOutlined, FilterOutlined, CloseOutlined } from '@ant-design/icons';
import { handleExport, formatDataForExport, getExportOptions, applyFilters, applySorting } from '../../utils/exportUtils';
import '../../App.css';

const AssetUtilizationReport = () => {
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

    // Fetch asset utilization data from API
    const fetchAssetUtilizationData = async () => {
        setLoading(true);
        try {
            console.log('Fetching asset utilization data from API...');
            const response = await fetch('http://202.53.92.35:5004/api/asset-utilization', {
                headers: {
                    "x-access-token": sessionStorage.getItem("token"),
                }
            });
            console.log('API Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('API Response data:', data);

                // Handle different response formats
                let utilizationData = [];
                if (data.success && Array.isArray(data.asset_utilization)) {
                    utilizationData = data.asset_utilization;
                    console.log('Using asset_utilization array:', utilizationData.length, 'items');
                } else if (Array.isArray(data)) {
                    utilizationData = data;
                    console.log('Using direct array format:', utilizationData.length, 'items');
                } else {
                    console.log('Unexpected API response format:', data);
                    utilizationData = [];
                }

                const dataWithKeys = utilizationData.map((item, index) => ({
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
                        asset_id: 'ASSET-TEL-000231',
                        asset_name: 'Cisco Router 3900',
                        asset_category: 'Network Equipment',
                        asset_subcategory: 'Router',
                        location_site: 'POP – Hyderabad',
                        department_custodian: 'NOC Team',
                        available_hours: '720',
                        operating_hours: '650',
                        idle_hours: '70',
                        utilization_percentage: '90.28',
                        uptime_percentage: '99.8',
                        usage_type: 'Continuous',
                        peak_load_percentage: '85',
                        average_load_percentage: '72',
                        throughput: '120',
                        utilization_status: 'Optimal',
                        action_plan: 'Maintain',
                        remarks: 'High uptime, normal load'
                    },
                    {
                        key: 2,
                        asset_id: 'ASSET-IT-000456',
                        asset_name: 'Dell Server R740',
                        asset_category: 'IT Equipment',
                        asset_subcategory: 'Server',
                        location_site: 'Data Center - Mumbai',
                        department_custodian: 'IT Operations',
                        available_hours: '720',
                        operating_hours: '600',
                        idle_hours: '120',
                        utilization_percentage: '83.33',
                        uptime_percentage: '99.5',
                        usage_type: 'Continuous',
                        peak_load_percentage: '90',
                        average_load_percentage: '75',
                        throughput: '500',
                        utilization_status: 'Good',
                        action_plan: 'Monitor',
                        remarks: 'Stable performance'
                    },
                    {
                        key: 3,
                        asset_id: 'ASSET-PWR-000789',
                        asset_name: 'UPS System 10KVA',
                        asset_category: 'Power Equipment',
                        asset_subcategory: 'UPS',
                        location_site: 'Office Building - Delhi',
                        department_custodian: 'Facilities',
                        available_hours: '720',
                        operating_hours: '200',
                        idle_hours: '520',
                        utilization_percentage: '27.78',
                        uptime_percentage: '100',
                        usage_type: 'Standby',
                        peak_load_percentage: '30',
                        average_load_percentage: '15',
                        throughput: '0',
                        utilization_status: 'Underutilized',
                        action_plan: 'Review',
                        remarks: 'Low utilization, consider optimization'
                    }
                ];
                setDataSource(sampleData);
                setPagination(prev => ({ ...prev, total: sampleData.length }));
                message.info("Using sample data - API not available");
            }
        } catch (error) {
            console.error('Error fetching asset utilization data:', error);
            message.error("Failed to load asset utilization data");
            setDataSource([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssetUtilizationData();
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
                asset_category: values.asset_category,
                asset_subcategory: values.asset_subcategory,
                location_site: values.location_site,
                department_custodian: values.department_custodian,
                available_hours: values.available_hours,
                operating_hours: values.operating_hours,
                idle_hours: values.idle_hours,
                utilization_percentage: values.utilization_percentage,
                uptime_percentage: values.uptime_percentage,
                usage_type: values.usage_type,
                peak_load_percentage: values.peak_load_percentage,
                average_load_percentage: values.average_load_percentage,
                throughput: values.throughput,
                utilization_status: values.utilization_status,
                action_plan: values.action_plan,
                remarks: values.remarks
            };

            console.log('Submitting asset utilization data:', apiData);

            let response;
            if (editingIndex !== null) {
                // Update existing record
                response = await fetch('http://202.53.92.35:5004/api/asset-utilization', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        "x-access-token": sessionStorage.getItem("token"),
                    },
                    body: JSON.stringify(apiData),
                });
            } else {
                // Create new record
                response = await fetch('http://202.53.92.35:5004/api/asset-utilization', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "x-access-token": sessionStorage.getItem("token"),
                    },
                    body: JSON.stringify(apiData),
                });
            }

            if (response.ok) {
                message.success(editingIndex !== null ? 'Asset utilization updated successfully' : 'Asset utilization created successfully');
                setDrawerVisible(false);
                form.resetFields();
                setEditingIndex(null);
                setEditingRecord(null);
                fetchAssetUtilizationData();
            } else {
                message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} asset utilization data`);
            }
        } catch (error) {
            console.error('Error saving asset utilization data:', error);
            message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} asset utilization data`);
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
            asset_category: record.asset_category,
            asset_subcategory: record.asset_subcategory,
            location_site: record.location_site,
            department_custodian: record.department_custodian,
            available_hours: record.available_hours,
            operating_hours: record.operating_hours,
            idle_hours: record.idle_hours,
            utilization_percentage: record.utilization_percentage,
            uptime_percentage: record.uptime_percentage,
            usage_type: record.usage_type,
            peak_load_percentage: record.peak_load_percentage,
            average_load_percentage: record.average_load_percentage,
            throughput: record.throughput,
            utilization_status: record.utilization_status,
            action_plan: record.action_plan,
            remarks: record.remarks
        };

        form.setFieldsValue(formValues);
        setEditingIndex(record.key);
        setEditingRecord(record);
        setDrawerVisible(true);
    };

    // Handle delete
    const handleDelete = async (record) => {
        try {
            const response = await fetch('http://202.53.92.35:5004/api/asset-utilization', {
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
                message.success('Asset utilization data deleted successfully');
                fetchAssetUtilizationData();
            } else {
                message.error('Failed to delete asset utilization data');
            }
        } catch (error) {
            console.error('Error deleting asset utilization data:', error);
            message.error('Failed to delete asset utilization data');
        }
    };

    // Handle create new
    const handleCreate = () => {
        console.log('Creating new asset utilization record');
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
                'Asset_Utilization_Report',
                'Asset Utilization Report',
                'asset-utilization',
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
                    case 'Changed Date': fieldValue = item.available_hours || ''; break;
                    case 'Work Item Type': fieldValue = item.asset_category || ''; break;
                    case 'State': fieldValue = item.utilization_status || ''; break;
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
                { text: 'Network Equipment', value: 'Network Equipment' },
                { text: 'IT Equipment', value: 'IT Equipment' },
                { text: 'Power Equipment', value: 'Power Equipment' },
                { text: 'Telecom Equipment', value: 'Telecom Equipment' },
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
            title: 'Location / Site',
            dataIndex: 'location_site',
            key: 'location_site',
            sorter: (a, b) => a.location_site.localeCompare(b.location_site),
            ...getColumnSearchProps('location_site'),
        },
        {
            title: 'Department / Custodian',
            dataIndex: 'department_custodian',
            key: 'department_custodian',
            sorter: (a, b) => a.department_custodian.localeCompare(b.department_custodian),
            ...getColumnSearchProps('department_custodian'),
        },
        {
            title: 'Available Hours',
            dataIndex: 'available_hours',
            key: 'available_hours',
            sorter: (a, b) => parseFloat(a.available_hours) - parseFloat(b.available_hours),
            ...getColumnSearchProps('available_hours'),
        },
        {
            title: 'Operating Hours',
            dataIndex: 'operating_hours',
            key: 'operating_hours',
            sorter: (a, b) => parseFloat(a.operating_hours) - parseFloat(b.operating_hours),
            ...getColumnSearchProps('operating_hours'),
        },
        {
            title: 'Idle Hours',
            dataIndex: 'idle_hours',
            key: 'idle_hours',
            sorter: (a, b) => parseFloat(a.idle_hours) - parseFloat(b.idle_hours),
            ...getColumnSearchProps('idle_hours'),
        },
        {
            title: 'Utilization (%)',
            dataIndex: 'utilization_percentage',
            key: 'utilization_percentage',
            sorter: (a, b) => parseFloat(a.utilization_percentage) - parseFloat(b.utilization_percentage),
            render: (percentage) => {
                const value = parseFloat(percentage);
                let color = 'secondary';
                if (value >= 80) color = 'success';
                else if (value >= 60) color = 'info';
                else if (value >= 40) color = 'warning';
                else color = 'danger';
                return <span className={`badge bg-${color}`}>{percentage}%</span>;
            },
        },
        {
            title: 'Uptime (%)',
            dataIndex: 'uptime_percentage',
            key: 'uptime_percentage',
            sorter: (a, b) => parseFloat(a.uptime_percentage) - parseFloat(b.uptime_percentage),
            ...getColumnSearchProps('uptime_percentage'),
        },
        {
            title: 'Usage Type',
            dataIndex: 'usage_type',
            key: 'usage_type',
            sorter: (a, b) => a.usage_type.localeCompare(b.usage_type),
            filters: [
                { text: 'Continuous', value: 'Continuous' },
                { text: 'Intermittent', value: 'Intermittent' },
                { text: 'Standby', value: 'Standby' },
                { text: 'On-Demand', value: 'On-Demand' },
                { text: 'Scheduled', value: 'Scheduled' },
            ],
            onFilter: (value, record) => record.usage_type === value,
        },
        {
            title: 'Peak Load (%)',
            dataIndex: 'peak_load_percentage',
            key: 'peak_load_percentage',
            sorter: (a, b) => parseFloat(a.peak_load_percentage) - parseFloat(b.peak_load_percentage),
            ...getColumnSearchProps('peak_load_percentage'),
        },
        {
            title: 'Average Load (%)',
            dataIndex: 'average_load_percentage',
            key: 'average_load_percentage',
            sorter: (a, b) => parseFloat(a.average_load_percentage) - parseFloat(b.average_load_percentage),
            ...getColumnSearchProps('average_load_percentage'),
        },
        {
            title: 'Throughput',
            dataIndex: 'throughput',
            key: 'throughput',
            sorter: (a, b) => parseFloat(a.throughput) - parseFloat(b.throughput),
            ...getColumnSearchProps('throughput'),
        },
        {
            title: 'Utilization Status',
            dataIndex: 'utilization_status',
            key: 'utilization_status',
            sorter: (a, b) => a.utilization_status.localeCompare(b.utilization_status),
            filters: [
                { text: 'Optimal', value: 'Optimal' },
                { text: 'Good', value: 'Good' },
                { text: 'Underutilized', value: 'Underutilized' },
                { text: 'Critical', value: 'Critical' },
            ],
            onFilter: (value, record) => record.utilization_status === value,
            render: (status) => {
                let color = 'secondary';
                switch (status) {
                    case 'Optimal': color = 'success'; break;
                    case 'Good': color = 'info'; break;
                    case 'Underutilized': color = 'warning'; break;
                    case 'Critical': color = 'danger'; break;
                    default: color = 'secondary';
                }
                return <span className={`badge bg-${color}`}>{status}</span>;
            },
        },
        {
            title: 'Action Plan',
            dataIndex: 'action_plan',
            key: 'action_plan',
            sorter: (a, b) => a.action_plan.localeCompare(b.action_plan),
            filters: [
                { text: 'Maintain', value: 'Maintain' },
                { text: 'Monitor', value: 'Monitor' },
                { text: 'Optimize', value: 'Optimize' },
                { text: 'Review', value: 'Review' },
                { text: 'Replace', value: 'Replace' },
                { text: 'Relocate', value: 'Relocate' },
            ],
            onFilter: (value, record) => record.action_plan === value,
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
                    <h2 className="mb-1">Asset Utilization Report</h2>
                    <p className="mt-0 text-muted">Identifies underutilized or idle assets.</p>
                </div>
                <div className="d-flex gap-2">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                        loading={loading}
                    >
                        Add Asset Utilization
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
                                    key: 'dashboard',
                                    label: 'Dashboard',
                                    icon: <FaChartLine />,
                                },
                                {
                                    key: 'excel',
                                    label: 'Excel',
                                    icon: <FaDownload />,
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
                                <label className="form-label">Asset Category</label>
                                <Select
                                    placeholder="Select Category"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.asset_category}
                                    onChange={(value) => handleAdvancedFilterChange('asset_category', value)}
                                >
                                    <Select.Option value="Network Equipment">Network Equipment</Select.Option>
                                    <Select.Option value="IT Equipment">IT Equipment</Select.Option>
                                    <Select.Option value="Power Equipment">Power Equipment</Select.Option>
                                    <Select.Option value="Telecom Equipment">Telecom Equipment</Select.Option>
                                </Select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Usage Type</label>
                                <Select
                                    placeholder="Select Usage Type"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.usage_type}
                                    onChange={(value) => handleAdvancedFilterChange('usage_type', value)}
                                >
                                    <Select.Option value="Continuous">Continuous</Select.Option>
                                    <Select.Option value="Intermittent">Intermittent</Select.Option>
                                    <Select.Option value="Standby">Standby</Select.Option>
                                    <Select.Option value="On-Demand">On-Demand</Select.Option>
                                </Select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Utilization Status</label>
                                <Select
                                    placeholder="Select Status"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.utilization_status}
                                    onChange={(value) => handleAdvancedFilterChange('utilization_status', value)}
                                >
                                    <Select.Option value="Optimal">Optimal</Select.Option>
                                    <Select.Option value="Good">Good</Select.Option>
                                    <Select.Option value="Underutilized">Underutilized</Select.Option>
                                    <Select.Option value="Critical">Critical</Select.Option>
                                </Select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Action Plan</label>
                                <Select
                                    placeholder="Select Action Plan"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.action_plan}
                                    onChange={(value) => handleAdvancedFilterChange('action_plan', value)}
                                >
                                    <Select.Option value="Maintain">Maintain</Select.Option>
                                    <Select.Option value="Monitor">Monitor</Select.Option>
                                    <Select.Option value="Optimize">Optimize</Select.Option>
                                    <Select.Option value="Review">Review</Select.Option>
                                </Select>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-3">
                                <label className="form-label">Location/Site</label>
                                <Input
                                    placeholder="Search Location/Site"
                                    value={advancedFilters.location_site}
                                    onChange={(e) => handleAdvancedFilterChange('location_site', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Department/Custodian</label>
                                <Input
                                    placeholder="Search Department/Custodian"
                                    value={advancedFilters.department_custodian}
                                    onChange={(e) => handleAdvancedFilterChange('department_custodian', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Utilization Range (%)</label>
                                <Input.Group compact>
                                    <Input
                                        placeholder="Min %"
                                        style={{ width: '50%' }}
                                        onChange={(e) => {
                                            const min = parseFloat(e.target.value) || 0;
                                            const max = advancedFilters.utilization_percentage?.numeric?.[1] || 100;
                                            handleAdvancedFilterChange('utilization_percentage', { numeric: [min, max] });
                                        }}
                                    />
                                    <Input
                                        placeholder="Max %"
                                        style={{ width: '50%' }}
                                        onChange={(e) => {
                                            const max = parseFloat(e.target.value) || 100;
                                            const min = advancedFilters.utilization_percentage?.numeric?.[0] || 0;
                                            handleAdvancedFilterChange('utilization_percentage', { numeric: [min, max] });
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
                        </div>
                    </div>
                </div>
            )}

            {/* Ant Design Table */}
            <div className="card custom-shadow mt-2">
                <div className="card-body">
                    <Table
                        className="table table-hover"
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

            {/* Drawer for Form */}
            <Drawer
                title={editingIndex ? "Edit Asset Utilization" : "Create Asset Utilization"}
                width={600}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                bodyStyle={{ paddingBottom: 80 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        utilization_status: 'Good',
                        action_plan: 'Monitor',
                    }}
                >
                    <Form.Item
                        name="asset_id"
                        label="Asset ID"
                        rules={[{ required: true, message: 'Please enter asset ID' }]}
                    >
                        <Input placeholder="Enter asset ID (e.g., ASSET-TEL-000231)" />
                    </Form.Item>

                    <Form.Item
                        name="asset_name"
                        label="Asset Name"
                        rules={[{ required: true, message: 'Please enter asset name' }]}
                    >
                        <Input placeholder="Enter asset name (e.g., Cisco Router 3900)" />
                    </Form.Item>

                    <Form.Item
                        name="asset_category"
                        label="Asset Category"
                        rules={[{ required: true, message: 'Please select asset category' }]}
                    >
                        <Select placeholder="Select asset category">
                            <Select.Option value="Network Equipment">Network Equipment</Select.Option>
                            <Select.Option value="IT Equipment">IT Equipment</Select.Option>
                            <Select.Option value="Power Equipment">Power Equipment</Select.Option>
                            <Select.Option value="Telecom Equipment">Telecom Equipment</Select.Option>
                            <Select.Option value="Office Equipment">Office Equipment</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="asset_subcategory"
                        label="Asset Subcategory"
                    >
                        <Input placeholder="Enter asset subcategory (e.g., Router)" />
                    </Form.Item>

                    <Form.Item
                        name="location_site"
                        label="Location / Site"
                    >
                        <Input placeholder="Enter location or site (e.g., POP – Hyderabad)" />
                    </Form.Item>

                    <Form.Item
                        name="department_custodian"
                        label="Department / Custodian"
                    >
                        <Input placeholder="Enter department or custodian (e.g., NOC Team)" />
                    </Form.Item>

                    <Form.Item
                        name="available_hours"
                        label="Available Hours"
                        rules={[{ required: true, message: 'Please enter available hours' }]}
                    >
                        <Input type="number" placeholder="Enter available hours (e.g., 720)" />
                    </Form.Item>

                    <Form.Item
                        name="operating_hours"
                        label="Operating Hours"
                        rules={[{ required: true, message: 'Please enter operating hours' }]}
                    >
                        <Input type="number" placeholder="Enter operating hours (e.g., 650)" />
                    </Form.Item>

                    <Form.Item
                        name="idle_hours"
                        label="Idle Hours"
                    >
                        <Input type="number" placeholder="Auto-calculated: Available Hours - Operating Hours" readOnly />
                    </Form.Item>

                    <Form.Item
                        name="utilization_percentage"
                        label="Utilization (%)"
                    >
                        <Input type="number" step="0.01" placeholder="Auto-calculated: (Operating Hours / Available Hours) × 100" readOnly />
                    </Form.Item>

                    <Form.Item
                        name="uptime_percentage"
                        label="Uptime (%)"
                    >
                        <Input type="number" step="0.01" placeholder="Enter uptime percentage (e.g., 99.8)" />
                    </Form.Item>

                    <Form.Item
                        name="usage_type"
                        label="Usage Type"
                    >
                        <Select placeholder="Select usage type">
                            <Select.Option value="Continuous">Continuous</Select.Option>
                            <Select.Option value="Intermittent">Intermittent</Select.Option>
                            <Select.Option value="Standby">Standby</Select.Option>
                            <Select.Option value="On-Demand">On-Demand</Select.Option>
                            <Select.Option value="Scheduled">Scheduled</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="peak_load_percentage"
                        label="Peak Load (%)"
                    >
                        <Input type="number" step="0.01" placeholder="Enter peak load percentage (e.g., 85)" />
                    </Form.Item>

                    <Form.Item
                        name="average_load_percentage"
                        label="Average Load (%)"
                    >
                        <Input type="number" step="0.01" placeholder="Enter average load percentage (e.g., 72)" />
                    </Form.Item>

                    <Form.Item
                        name="throughput"
                        label="Throughput"
                    >
                        <Input type="number" placeholder="Enter throughput (e.g., 120)" />
                    </Form.Item>

                    <Form.Item
                        name="utilization_status"
                        label="Utilization Status"
                    >
                        <Select placeholder="Select utilization status">
                            <Select.Option value="Optimal">Optimal (&gt;80%)</Select.Option>
                            <Select.Option value="Good">Good (60-80%)</Select.Option>
                            <Select.Option value="Underutilized">Underutilized (40-60%)</Select.Option>
                            <Select.Option value="Critical">Critical (&lt;40%)</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="action_plan"
                        label="Action Plan"
                    >
                        <Select placeholder="Select action plan">
                            <Select.Option value="Maintain">Maintain</Select.Option>
                            <Select.Option value="Monitor">Monitor</Select.Option>
                            <Select.Option value="Optimize">Optimize</Select.Option>
                            <Select.Option value="Review">Review</Select.Option>
                            <Select.Option value="Replace">Replace</Select.Option>
                            <Select.Option value="Relocate">Relocate</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="remarks"
                        label="Remarks"
                    >
                        <Input.TextArea rows={3} placeholder="Enter any additional remarks" />
                    </Form.Item>

                    {/* Submit Buttons */}
                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                        <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            loading={loading}
                            htmlType="submit"
                        >
                            {editingIndex ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    );
};

export default AssetUtilizationReport;