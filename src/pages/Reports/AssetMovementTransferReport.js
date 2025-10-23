import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';
import { FaDownload, FaFilter, FaSearch, FaCalendarAlt, FaChartLine, FaArrowLeft, FaEdit, FaEye } from 'react-icons/fa';
import { Table, Input, Button, Space, Drawer, Form, Select, DatePicker, message, Popconfirm, Dropdown } from 'antd';
import { SearchOutlined, PlusOutlined, DownOutlined, FilterOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleExport, formatDataForExport, getExportOptions, applyFilters, applySorting } from '../../utils/exportUtils';
import '../../App.css';

const AssetMovementTransferReport = () => {
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

    // Fetch asset movement transfer data from API
    const fetchAssetMovementTransferData = async () => {
        setLoading(true);
        try {
            console.log('Fetching asset movement transfer data from API...');
            const response = await fetch('http://202.53.92.35:5004/api/asset-movement-transfer', {
                headers: {
                    "x-access-token": sessionStorage.getItem("token"),
                }
            });
            console.log('API Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('API Response data:', data);

                // Handle different response formats
                let transferData = [];
                if (data.success && Array.isArray(data.asset_movement_transfer)) {
                    transferData = data.asset_movement_transfer;
                    console.log('Using asset_movement_transfer array:', transferData.length, 'items');
                } else if (Array.isArray(data)) {
                    transferData = data;
                    console.log('Using direct array format:', transferData.length, 'items');
                } else {
                    console.log('Unexpected API response format:', data);
                    transferData = [];
                }

                const dataWithKeys = transferData.map((item, index) => ({
                    ...item,
                    key: item.transfer_id || index,
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
                        transfer_id: 'TRF-001',
                        asset_id: 'ASSET-TEL-000345',
                        asset_type: 'Fiber Accessories',
                        make_model: 'Huawei ODF 24F',
                        serial_number: '24F-ODF-HW-0021',
                        from_location_site_id: 'POP-MAD-WEST-001',
                        to_location_site_id: 'POP-DIN-CENTRAL-002',
                        from_circle: 'Madurai Circle',
                        to_circle: 'Dindigul Circle',
                        transfer_type: 'Inter-Circle',
                        transfer_initiation_date: '2025-07-01',
                        approved_by: 'Asset Manager',
                        transfer_dispatch_date: '2025-07-05',
                        received_by: 'Site Engineer',
                        receipt_acknowledgment_date: '2025-07-06',
                        current_status: 'Completed',
                        remarks: 'Transfer completed successfully for network optimization'
                    },
                    {
                        key: 2,
                        transfer_id: 'TRF-002',
                        asset_id: 'ASSET-IT-000123',
                        asset_type: 'IT Infrastructure',
                        make_model: 'Dell PowerEdge R740',
                        serial_number: 'DELL-SRV-2024-001',
                        from_location_site_id: 'DC-MUM-001',
                        to_location_site_id: 'DC-DEL-002',
                        from_circle: 'Mumbai Circle',
                        to_circle: 'Delhi Circle',
                        transfer_type: 'Inter-Circle',
                        transfer_initiation_date: '2025-06-08',
                        approved_by: 'IT Director',
                        transfer_dispatch_date: '2025-06-10',
                        received_by: 'Data Center Manager',
                        receipt_acknowledgment_date: '2025-06-12',
                        current_status: 'In Transit',
                        remarks: 'Data center consolidation - specialized transport required'
                    },
                    {
                        key: 3,
                        transfer_id: 'TRF-003',
                        asset_id: 'ASSET-VEH-000456',
                        asset_type: 'Vehicle',
                        make_model: 'Mahindra Bolero',
                        serial_number: 'MH-BOL-2024-789',
                        from_location_site_id: 'RO-CHN-001',
                        to_location_site_id: 'RO-BLR-002',
                        from_circle: 'Chennai Circle',
                        to_circle: 'Bangalore Circle',
                        transfer_type: 'Inter-Circle',
                        transfer_initiation_date: '2025-08-18',
                        approved_by: 'Regional Manager',
                        transfer_dispatch_date: '2025-08-20',
                        received_by: 'Field Operations Team',
                        receipt_acknowledgment_date: '2025-08-21',
                        current_status: 'Completed',
                        remarks: 'Regional reallocation completed - vehicle in good condition'
                    }
                ];
                setDataSource(sampleData);
                setPagination(prev => ({ ...prev, total: sampleData.length }));
                message.info("Using sample data - API not available");
            }
        } catch (error) {
            console.error('Error fetching asset movement transfer data:', error);
            message.error("Failed to load asset movement transfer data");
            setDataSource([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssetMovementTransferData();
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
                transfer_id: editingIndex !== null ? editingRecord?.transfer_id : values.transfer_id,
                asset_id: values.asset_id,
                asset_name: values.asset_name,
                transfer_type: values.transfer_type,
                from_location: values.from_location,
                to_location: values.to_location,
                transfer_date: values.transfer_date,
                status: values.status,
                requested_by: values.requested_by,
                approved_by: values.approved_by,
                transfer_reason: values.transfer_reason,
                priority: values.priority,
                transport_method: values.transport_method,
                tracking_number: values.tracking_number,
                transfer_cost: values.transfer_cost,
                condition_on_transfer: values.condition_on_transfer,
                condition_on_receipt: values.condition_on_receipt
            };

            console.log('Submitting asset movement transfer data:', apiData);

            let response;
            if (editingIndex !== null) {
                // Update existing record
                response = await fetch('http://202.53.92.35:5004/api/asset-movement-transfer', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        "x-access-token": sessionStorage.getItem("token"),
                    },
                    body: JSON.stringify(apiData),
                });
            } else {
                // Create new record
                response = await fetch('http://202.53.92.35:5004/api/asset-movement-transfer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        "x-access-token": sessionStorage.getItem("token"),
                    },
                    body: JSON.stringify(apiData),
                });
            }

            if (response.ok) {
                message.success(editingIndex !== null ? 'Asset movement transfer data updated successfully' : 'Asset movement transfer data created successfully');
                setDrawerVisible(false);
                form.resetFields();
                setEditingIndex(null);
                setEditingRecord(null);
                fetchAssetMovementTransferData();
            } else {
                message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} asset movement transfer data`);
            }
        } catch (error) {
            console.error('Error saving asset movement transfer data:', error);
            message.error(`Failed to ${editingIndex !== null ? 'update' : 'create'} asset movement transfer data`);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (record) => {
        console.log('Editing record:', record);

        const formValues = {
            transfer_id: record.transfer_id,
            asset_id: record.asset_id,
            asset_name: record.asset_name,
            transfer_type: record.transfer_type,
            from_location: record.from_location,
            to_location: record.to_location,
            transfer_date: record.transfer_date,
            status: record.status,
            requested_by: record.requested_by,
            approved_by: record.approved_by,
            transfer_reason: record.transfer_reason,
            priority: record.priority,
            transport_method: record.transport_method,
            tracking_number: record.tracking_number,
            transfer_cost: record.transfer_cost,
            condition_on_transfer: record.condition_on_transfer,
            condition_on_receipt: record.condition_on_receipt
        };

        form.setFieldsValue(formValues);
        setEditingIndex(record.key);
        setEditingRecord(record);
        setDrawerVisible(true);
    };

    // Handle delete
    const handleDelete = async (record) => {
        try {
            const response = await fetch('http://202.53.92.35:5004/api/asset-movement-transfer', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    "x-access-token": sessionStorage.getItem("token"),
                },
                body: JSON.stringify({
                    transfer_id: record.transfer_id
                }),
            });

            if (response.ok) {
                message.success('Asset movement transfer data deleted successfully');
                fetchAssetMovementTransferData();
            } else {
                message.error('Failed to delete asset movement transfer data');
            }
        } catch (error) {
            console.error('Error deleting asset movement transfer data:', error);
            message.error('Failed to delete asset movement transfer data');
        }
    };

    // Handle create new
    const handleCreate = () => {
        console.log('Creating new asset movement transfer record');
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
                'Asset_Movement_Transfer_Report',
                'Asset Movement / Transfer Report',
                'asset-movement',
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
                    case 'Changed Date': fieldValue = item.transfer_initiation_date || ''; break;
                    case 'Work Item Type': fieldValue = item.asset_type || ''; break;
                    case 'State': fieldValue = item.current_status || ''; break;
                    case 'Asset ID': fieldValue = item.asset_id || ''; break;
                    case 'Asset Name': fieldValue = item.asset_name || ''; break;
                    case 'Category': fieldValue = item.asset_type || ''; break;
                    case 'Location': fieldValue = item.from_location_site_id || ''; break;
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
            title: 'Transfer ID',
            dataIndex: 'transfer_id',
            key: 'transfer_id',
            sorter: (a, b) => a.transfer_id.localeCompare(b.transfer_id),
            ...getColumnSearchProps('transfer_id'),
        },
        {
            title: 'Asset ID',
            dataIndex: 'asset_id',
            key: 'asset_id',
            sorter: (a, b) => a.asset_id.localeCompare(b.asset_id),
            ...getColumnSearchProps('asset_id'),
        },
        {
            title: 'Asset Type',
            dataIndex: 'asset_type',
            key: 'asset_type',
            sorter: (a, b) => a.asset_type.localeCompare(b.asset_type),
            ...getColumnSearchProps('asset_type'),
        },
        {
            title: 'Make / Model',
            dataIndex: 'make_model',
            key: 'make_model',
            sorter: (a, b) => a.make_model.localeCompare(b.make_model),
            ...getColumnSearchProps('make_model'),
        },
        {
            title: 'Serial Number',
            dataIndex: 'serial_number',
            key: 'serial_number',
            sorter: (a, b) => a.serial_number.localeCompare(b.serial_number),
            ...getColumnSearchProps('serial_number'),
        },
        {
            title: 'From Location / Site ID',
            dataIndex: 'from_location_site_id',
            key: 'from_location_site_id',
            sorter: (a, b) => a.from_location_site_id.localeCompare(b.from_location_site_id),
            ...getColumnSearchProps('from_location_site_id'),
        },
        {
            title: 'To Location / Site ID',
            dataIndex: 'to_location_site_id',
            key: 'to_location_site_id',
            sorter: (a, b) => a.to_location_site_id.localeCompare(b.to_location_site_id),
            ...getColumnSearchProps('to_location_site_id'),
        },
        {
            title: 'From Circle',
            dataIndex: 'from_circle',
            key: 'from_circle',
            sorter: (a, b) => a.from_circle.localeCompare(b.from_circle),
            ...getColumnSearchProps('from_circle'),
        },
        {
            title: 'To Circle',
            dataIndex: 'to_circle',
            key: 'to_circle',
            sorter: (a, b) => a.to_circle.localeCompare(b.to_circle),
            ...getColumnSearchProps('to_circle'),
        },
        {
            title: 'Transfer Type',
            dataIndex: 'transfer_type',
            key: 'transfer_type',
            sorter: (a, b) => a.transfer_type.localeCompare(b.transfer_type),
            ...getColumnSearchProps('transfer_type'),
        },
        {
            title: 'Transfer Initiation Date',
            dataIndex: 'transfer_initiation_date',
            key: 'transfer_initiation_date',
            sorter: (a, b) => new Date(a.transfer_initiation_date) - new Date(b.transfer_initiation_date),
            render: (text) => text ? dayjs(text).format('DD-MMM-YY') : '',
        },
        {
            title: 'Approved By',
            dataIndex: 'approved_by',
            key: 'approved_by',
            sorter: (a, b) => a.approved_by.localeCompare(b.approved_by),
            ...getColumnSearchProps('approved_by'),
        },
        {
            title: 'Transfer Dispatch Date',
            dataIndex: 'transfer_dispatch_date',
            key: 'transfer_dispatch_date',
            sorter: (a, b) => new Date(a.transfer_dispatch_date) - new Date(b.transfer_dispatch_date),
            render: (text) => text ? dayjs(text).format('DD-MMM-YY') : '',
        },
        {
            title: 'Received By',
            dataIndex: 'received_by',
            key: 'received_by',
            sorter: (a, b) => a.received_by.localeCompare(b.received_by),
            ...getColumnSearchProps('received_by'),
        },
        {
            title: 'Receipt Acknowledgment Date',
            dataIndex: 'receipt_acknowledgment_date',
            key: 'receipt_acknowledgment_date',
            sorter: (a, b) => new Date(a.receipt_acknowledgment_date) - new Date(b.receipt_acknowledgment_date),
            render: (text) => text ? dayjs(text).format('DD-MMM-YY') : '',
        },
        {
            title: 'Current Status',
            dataIndex: 'current_status',
            key: 'current_status',
            sorter: (a, b) => a.current_status.localeCompare(b.current_status),
            ...getColumnSearchProps('current_status'),
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
                    <h2 className="mb-1">Asset Movement / Transfer Report</h2>
                    <p className="mt-0 text-muted">Track asset movements and transfers across locations</p>
                </div>
                <div className="d-flex gap-2">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Add New Transfer
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
                                    key: 'pdf',
                                    label: 'PDF',
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
                                <label className="form-label">Asset Type</label>
                                <Select
                                    placeholder="Select Asset Type"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.asset_type}
                                    onChange={(value) => handleAdvancedFilterChange('asset_type', value)}
                                >
                                    <Select.Option value="Fiber Accessories">Fiber Accessories</Select.Option>
                                    <Select.Option value="IT Infrastructure">IT Infrastructure</Select.Option>
                                    <Select.Option value="Vehicle">Vehicle</Select.Option>
                                    <Select.Option value="Equipment">Equipment</Select.Option>
                                </Select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Transfer Type</label>
                                <Select
                                    placeholder="Select Transfer Type"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.transfer_type}
                                    onChange={(value) => handleAdvancedFilterChange('transfer_type', value)}
                                >
                                    <Select.Option value="Inter-Circle">Inter-Circle</Select.Option>
                                    <Select.Option value="Within Project">Within Project</Select.Option>
                                    <Select.Option value="Inter-Project">Inter-Project</Select.Option>
                                    <Select.Option value="Inter-Region">Inter-Region</Select.Option>
                                </Select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Current Status</label>
                                <Select
                                    placeholder="Select Status"
                                    allowClear
                                    style={{ width: '100%' }}
                                    value={advancedFilters.current_status}
                                    onChange={(value) => handleAdvancedFilterChange('current_status', value)}
                                >
                                    <Select.Option value="Completed">Completed</Select.Option>
                                    <Select.Option value="In Transit">In Transit</Select.Option>
                                    <Select.Option value="Pending">Pending</Select.Option>
                                    <Select.Option value="Cancelled">Cancelled</Select.Option>
                                </Select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">From Circle</label>
                                <Input
                                    placeholder="Search From Circle"
                                    value={advancedFilters.from_circle}
                                    onChange={(e) => handleAdvancedFilterChange('from_circle', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-3">
                                <label className="form-label">To Circle</label>
                                <Input
                                    placeholder="Search To Circle"
                                    value={advancedFilters.to_circle}
                                    onChange={(e) => handleAdvancedFilterChange('to_circle', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Approved By</label>
                                <Input
                                    placeholder="Search Approved By"
                                    value={advancedFilters.approved_by}
                                    onChange={(e) => handleAdvancedFilterChange('approved_by', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Received By</label>
                                <Input
                                    placeholder="Search Received By"
                                    value={advancedFilters.received_by}
                                    onChange={(e) => handleAdvancedFilterChange('received_by', e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Date Range (Transfer Initiation)</label>
                                <DatePicker.RangePicker
                                    style={{ width: '100%' }}
                                    format="DD-MMM-YY"
                                    onChange={(dates) => {
                                        if (dates && dates[0] && dates[1]) {
                                            handleAdvancedFilterChange('transfer_initiation_date', {
                                                range: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]
                                            });
                                        } else {
                                            handleAdvancedFilterChange('transfer_initiation_date', null);
                                        }
                                    }}
                                />
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
                title={editingIndex ? "Edit Asset Movement Transfer" : "Create Asset Movement Transfer"}
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
                        status: 'Pending',
                        transfer_type: 'Within Project',
                        priority: 'Medium',
                        transport_method: 'Internal',
                        retirement_status: 'Active',
                        asset_category: 'Fiber Accessories',
                        commissioning_status: 'Commissioned',
                        amc_status: 'Under AMC'
                    }}
                >
                    {/* Transfer Information */}
                    <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                        <h4 style={{ marginBottom: 16, color: '#1890ff' }}>Transfer Information</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <Form.Item
                                name="transfer_id"
                                label="Transfer ID"
                                rules={[{ required: true, message: 'Please enter Transfer ID' }]}
                            >
                                <Input placeholder="e.g., TRF-001" />
                            </Form.Item>
                            <Form.Item
                                name="asset_id"
                                label="Asset ID"
                                rules={[{ required: true, message: 'Please enter Asset ID' }]}
                            >
                                <Input placeholder="e.g., ASSET-TEL-000345" />
                            </Form.Item>
                            <Form.Item
                                name="asset_type"
                                label="Asset Type"
                                rules={[{ required: true, message: 'Please enter Asset Type' }]}
                            >
                                <Input placeholder="e.g., Fiber Accessories" />
                            </Form.Item>
                            <Form.Item
                                name="make_model"
                                label="Make / Model"
                                rules={[{ required: true, message: 'Please enter Make / Model' }]}
                            >
                                <Input placeholder="e.g., Huawei ODF 24F" />
                            </Form.Item>
                            <Form.Item
                                name="serial_number"
                                label="Serial Number"
                                rules={[{ required: true, message: 'Please enter Serial Number' }]}
                            >
                                <Input placeholder="e.g., 24F-ODF-HW-0021" />
                            </Form.Item>
                            <Form.Item
                                name="from_location_site_id"
                                label="From Location / Site ID"
                                rules={[{ required: true, message: 'Please enter From Location / Site ID' }]}
                            >
                                <Input placeholder="e.g., POP-MAD-WEST-001" />
                            </Form.Item>
                            <Form.Item
                                name="to_location_site_id"
                                label="To Location / Site ID"
                                rules={[{ required: true, message: 'Please enter To Location / Site ID' }]}
                            >
                                <Input placeholder="e.g., POP-DIN-CENTRAL-002" />
                            </Form.Item>
                            <Form.Item
                                name="from_circle"
                                label="From Circle"
                                rules={[{ required: true, message: 'Please enter From Circle' }]}
                            >
                                <Input placeholder="e.g., Madurai Circle" />
                            </Form.Item>
                            <Form.Item
                                name="to_circle"
                                label="To Circle"
                                rules={[{ required: true, message: 'Please enter To Circle' }]}
                            >
                                <Input placeholder="e.g., Dindigul Circle" />
                            </Form.Item>
                            <Form.Item
                                name="transfer_type"
                                label="Transfer Type"
                                rules={[{ required: true, message: 'Please select Transfer Type' }]}
                            >
                                <Select placeholder="Select transfer type">
                                    <Select.Option value="Within Project">Within Project</Select.Option>
                                    <Select.Option value="Inter-Project">Inter-Project</Select.Option>
                                    <Select.Option value="Inter-Region">Inter-Region</Select.Option>
                                    <Select.Option value="Inter-Circle">Inter-Circle</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="transfer_initiation_date"
                                label="Transfer Initiation Date"
                                rules={[{ required: true, message: 'Please select Transfer Initiation Date' }]}
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
                            <Form.Item
                                name="transfer_dispatch_date"
                                label="Transfer Dispatch Date"
                                rules={[{ required: true, message: 'Please select Transfer Dispatch Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="received_by"
                                label="Received By"
                                rules={[{ required: true, message: 'Please enter Received By' }]}
                            >
                                <Input placeholder="e.g., Site Engineer" />
                            </Form.Item>
                            <Form.Item
                                name="receipt_acknowledgment_date"
                                label="Receipt Acknowledgment Date"
                                rules={[{ required: true, message: 'Please select Receipt Acknowledgment Date' }]}
                            >
                                <DatePicker style={{ width: '100%' }} format="DD-MMM-YY" />
                            </Form.Item>
                            <Form.Item
                                name="current_status"
                                label="Current Status"
                                rules={[{ required: true, message: 'Please select Current Status' }]}
                            >
                                <Select placeholder="Select current status">
                                    <Select.Option value="Completed">Completed</Select.Option>
                                    <Select.Option value="In Transit">In Transit</Select.Option>
                                    <Select.Option value="Pending">Pending</Select.Option>
                                    <Select.Option value="Cancelled">Cancelled</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="remarks"
                                label="Remarks"
                                rules={[{ required: true, message: 'Please enter Remarks' }]}
                                style={{ gridColumn: '1 / -1' }}
                            >
                                <Input.TextArea rows={3} placeholder="e.g., Transfer completed successfully for network optimization" />
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

export default AssetMovementTransferReport;
