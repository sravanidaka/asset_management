import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Apply filters to data
export const applyFilters = (data, filters) => {
    if (!filters || Object.keys(filters).length === 0) {
        return data;
    }

    return data.filter(row => {
        return Object.entries(filters).every(([key, filterValue]) => {
            if (!filterValue || filterValue.length === 0) {
                return true;
            }

            const cellValue = row[key];
            if (cellValue === null || cellValue === undefined) {
                return false;
            }

            // Handle different filter types
            if (Array.isArray(filterValue)) {
                // Multiple values filter (like dropdown filters)
                return filterValue.includes(cellValue);
            } else if (typeof filterValue === 'string') {
                // Text search filter
                return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
            } else if (typeof filterValue === 'object' && filterValue.range) {
                // Date range filter
                const cellDate = new Date(cellValue);
                const startDate = new Date(filterValue.range[0]);
                const endDate = new Date(filterValue.range[1]);
                return cellDate >= startDate && cellDate <= endDate;
            } else if (typeof filterValue === 'object' && filterValue.numeric) {
                // Numeric range filter
                const cellNum = parseFloat(cellValue);
                const min = filterValue.numeric[0];
                const max = filterValue.numeric[1];
                return cellNum >= min && cellNum <= max;
            }

            return true;
        });
    });
};

// Apply sorting to data
export const applySorting = (data, sorter) => {
    if (!sorter || !sorter.field) {
        return data;
    }

    return [...data].sort((a, b) => {
        const aValue = a[sorter.field];
        const bValue = b[sorter.field];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        // Handle different data types
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sorter.order === 'ascend' ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
            return sorter.order === 'ascend' ? comparison : -comparison;
        }

        // Handle date strings
        if (aValue.match(/\d{4}-\d{2}-\d{2}/) && bValue.match(/\d{4}-\d{2}-\d{2}/)) {
            const aDate = new Date(aValue);
            const bDate = new Date(bValue);
            return sorter.order === 'ascend' ? aDate - bDate : bDate - aDate;
        }

        // Handle currency values
        const aNum = parseFloat(aValue.toString().replace(/[₹,]/g, ''));
        const bNum = parseFloat(bValue.toString().replace(/[₹,]/g, ''));
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return sorter.order === 'ascend' ? aNum - bNum : bNum - aNum;
        }

        // Default string comparison
        const comparison = aValue.toString().localeCompare(bValue.toString());
        return sorter.order === 'ascend' ? comparison : -comparison;
    });
};

// Export to Excel with filters
export const exportToExcel = (data, filename, sheetName = 'Sheet1', filters = {}, sorter = {}) => {
    try {
        console.log('=== EXCEL EXPORT DEBUG START ===');
        console.log('exportToExcel: Data length =', data.length);
        console.log('exportToExcel: Data sample =', data[0]);
        console.log('exportToExcel: Data keys =', Object.keys(data[0] || {}));
        console.log('exportToExcel: Total fields =', Object.keys(data[0] || {}).length);
        
        // Apply filters and sorting
        let filteredData = applyFilters(data, filters);
        filteredData = applySorting(filteredData, sorter);

        console.log('exportToExcel: Filtered data length =', filteredData.length);
        console.log('exportToExcel: Filtered data sample =', filteredData[0]);
        console.log('exportToExcel: Filtered data keys =', Object.keys(filteredData[0] || {}));

        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Convert data to worksheet
        const worksheet = XLSX.utils.json_to_sheet(filteredData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate filename with timestamp and filter info
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filterSuffix = Object.keys(filters).length > 0 ? '_filtered' : '';
        const finalFilename = `${filename}${filterSuffix}_${timestamp}.xlsx`;

        console.log('exportToExcel: Final filename =', finalFilename);
        console.log('=== EXCEL EXPORT DEBUG END ===');

        // Write and download file
        XLSX.writeFile(workbook, finalFilename);

        return { success: true, filename: finalFilename, recordCount: filteredData.length };
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        return { success: false, error: error.message };
    }
};

// Create a compact PDF version for reports with many columns
const createCompactPDF = (data, columns, filename, title, filters = {}, sorter = {}) => {
    try {
        // Since data is already filtered and sorted, use it directly
        let filteredData = data;

        console.log(`PDF Export (Compact): Processing ${filteredData.length} records with ${columns.length} columns (showing first 8 key columns)`);

        const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation

        // Add title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, 22);

        // Add version indicator
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('(Compact Version - Key Columns Only)', 14, 30);

        // Add date and filter info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38);

        let yPosition = 45;

        // Add filter information if filters are applied
        if (Object.keys(filters).length > 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Applied Filters:', 14, yPosition);
            yPosition += 5;

            doc.setFont('helvetica', 'normal');
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value.length > 0) {
                    const filterText = `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
                    doc.text(filterText, 16, yPosition);
                    yPosition += 4;
                }
            });
            yPosition += 5;
        }

        // Add record count
        doc.setFontSize(9);
        doc.text(`Total Records: ${filteredData.length}`, 14, yPosition);
        yPosition += 8;

        // Create a summary table with key columns only
        const keyColumns = columns.slice(0, 8); // Take first 8 most important columns
        const tableColumns = keyColumns.map(col => ({
            title: col.title,
            dataKey: col.dataIndex || col.key
        }));

        const tableData = filteredData.map(row => {
            const newRow = {};
            keyColumns.forEach(col => {
                const key = col.dataIndex || col.key;
                if (key && key !== 'actions') {
                    newRow[key] = row[key] || '';
                }
            });
            return newRow;
        });

        // Add compact table
        autoTable(doc, {
            head: [tableColumns.map(col => col.title)],
            body: tableData.map(row => tableColumns.map(col => row[col.dataKey] || '')),
            startY: yPosition,
            styles: {
                fontSize: 9,
                cellPadding: 4,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle'
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 4,
                halign: 'center',
                valign: 'middle'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { left: 10, right: 10 },
            tableWidth: 'auto',
            showHead: 'everyPage',
            pageBreak: 'auto'
        });

        // Add note about full data
        if (columns.length > 8) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text(`Note: This is a summary view showing key columns. Full data has ${columns.length} columns.`, 14, doc.lastAutoTable.finalY + 10);
        }

        // Generate filename with timestamp and filter info
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filterSuffix = Object.keys(filters).length > 0 ? '_filtered' : '';
        const finalFilename = `${filename}${filterSuffix}_${timestamp}.pdf`;

        // Save the PDF
        doc.save(finalFilename);

        return { success: true, filename: finalFilename, recordCount: filteredData.length };
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        return { success: false, error: error.message };
    }
};

// Export to PDF with filters
export const exportToPDF = (data, columns, filename, title, filters = {}, sorter = {}) => {
    try {
        // Always use full version for explicit PDF export
        // Compact version is only used when explicitly requested

        // Since data is already filtered and sorted, use it directly
        let filteredData = data;

        console.log(`PDF Export (Full): Processing ${filteredData.length} records with ${columns.length} columns`);
        console.log('PDF Export (Full): Column names:', columns.map(col => col.title || col.dataIndex || col.key));

        const doc = new jsPDF('l', 'mm', 'a3'); // landscape orientation with larger page size

        // Prepare table data first - filter out columns without proper keys
        const tableColumns = columns
            .filter(col => {
                const key = col.dataIndex || col.key;
                return key && key !== 'actions' && col.title; // Only include columns with valid keys and titles
            })
            .map(col => ({
                title: col.title,
                dataKey: col.dataIndex || col.key
            }));

        const tableData = filteredData.map(row => {
            const newRow = {};
            tableColumns.forEach(col => {
                const key = col.dataKey;
                newRow[key] = row[key] || '';
            });
            return newRow;
        });

        console.log(`PDF Export: Prepared ${tableData.length} table rows with ${tableColumns.length} columns`);
        console.log('PDF Export: Table column names:', tableColumns.map(col => col.title));
        console.log('PDF Export: Table column dataKeys:', tableColumns.map(col => col.dataKey));
        console.log('PDF Export: Sample data row keys:', Object.keys(tableData[0] || {}));
        console.log('PDF Export: Original columns count:', columns.length);
        console.log('PDF Export: Original column keys:', columns.map(col => col.dataIndex || col.key));

        // Check for columns without proper keys
        const columnsWithoutKeys = columns.filter(col => {
            const key = col.dataIndex || col.key;
            return !key || key === 'actions' || !col.title;
        });
        if (columnsWithoutKeys.length > 0) {
            console.log('PDF Export: Columns without proper keys (will be excluded):', columnsWithoutKeys.map(col => ({ title: col.title, dataIndex: col.dataIndex, key: col.key })));
        }

        // For reports with many columns, we'll need to split across multiple pages
        const maxColumnsPerPage = 20; // Maximum columns that can fit on A3 landscape (reduced to force multiple pages)
        const totalColumns = tableColumns.length;
        const needsMultiplePages = totalColumns > maxColumnsPerPage;

        console.log(`PDF Export: totalColumns=${totalColumns}, maxColumnsPerPage=${maxColumnsPerPage}, needsMultiplePages=${needsMultiplePages}`);

        // Add title on the left
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, 20);

        // Add page info on the right side
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const totalPages = needsMultiplePages ? Math.ceil(totalColumns / maxColumnsPerPage) : 1;
        const pageText = `Page 1 of ${totalPages}`;
        const pageTextWidth = doc.getTextWidth(pageText);
        const pageX = doc.internal.pageSize.width - pageTextWidth - 14;
        doc.text(pageText, pageX, 20);

        console.log(`PDF Header: pageText="${pageText}", x=${pageX}`);

        // Add total records
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Records: ${filteredData.length}`, 14, 28);

        let yPosition = 35;

        // Add filter information if filters are applied
        if (Object.keys(filters).length > 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Applied Filters:', 14, yPosition);
            yPosition += 5;

            doc.setFont('helvetica', 'normal');
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value.length > 0) {
                    const filterText = `${key}: ${Array.isArray(value) ? value.join(', ') : value}`;
                    doc.text(filterText, 16, yPosition);
                    yPosition += 4;
                }
            });
            yPosition += 5;
        }

        // Record count is already added in the header above

        if (needsMultiplePages) {
            // Split columns across multiple pages
            const pages = [];
            for (let i = 0; i < totalColumns; i += maxColumnsPerPage) {
                const pageColumns = tableColumns.slice(i, i + maxColumnsPerPage);
                pages.push(pageColumns);
            }

            console.log(`PDF Export: Splitting ${totalColumns} columns across ${pages.length} pages`);

            pages.forEach((pageColumns, pageIndex) => {
                if (pageIndex > 0) {
                    doc.addPage();
                }

                console.log(`PDF Export: Page ${pageIndex + 1} - Processing ${pageColumns.length} columns:`, pageColumns.map(col => col.title));

                // Add title on the left
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text(title, 14, 20);

                // Add page info on the right side
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
                const pageText = `Page ${pageIndex + 1} of ${pages.length}`;
                const pageTextWidth = doc.getTextWidth(pageText);
                const pageX = doc.internal.pageSize.width - pageTextWidth - 14;
                doc.text(pageText, pageX, 20);

                console.log(`PDF Multi-Page Header: pageText="${pageText}", x=${pageX}`);

                // Add total records
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
                doc.text(`Total Records: ${filteredData.length}`, 14, 28);

                const pageStartY = 35;

                // Create column styles for this page - use full width
                const pageColumnStyles = {};
                const availableWidth = doc.internal.pageSize.width - 28; // 14mm margin on each side
                const columnWidth = availableWidth / pageColumns.length;
                pageColumns.forEach((col, index) => {
                    pageColumnStyles[index] = { cellWidth: columnWidth };
                });

                autoTable(doc, {
                    head: [pageColumns.map(col => col.title)],
                    body: tableData.map(row => pageColumns.map(col => row[col.dataKey] || '')),
                    startY: pageStartY,
                    columnStyles: pageColumnStyles,
                    styles: {
                        fontSize: 9,
                        cellPadding: 3,
                        overflow: 'linebreak',
                        halign: 'left',
                        valign: 'middle'
                    },
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 9,
                        cellPadding: 3,
                        halign: 'center',
                        valign: 'middle'
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    columnStyles: pageColumnStyles,
                    margin: { left: 5, right: 5 },
                    tableWidth: 'wrap',
                    showHead: 'everyPage',
                    pageBreak: 'auto',
                    rowPageBreak: 'avoid'
                });
            });
        } else {
            // Single page with all columns
            console.log('PDF Export: Single page - all columns fit');
            console.log('PDF Export: Single page - Processing all columns:', tableColumns.map(col => col.title));
            // Create column styles for single page - use full width
            const singlePageColumnStyles = {};
            const availableWidth = doc.internal.pageSize.width - 28; // 14mm margin on each side
            const columnWidth = availableWidth / tableColumns.length;
            tableColumns.forEach((col, index) => {
                singlePageColumnStyles[index] = { cellWidth: columnWidth };
            });

            autoTable(doc, {
                head: [tableColumns.map(col => col.title)],
                body: tableData.map(row => tableColumns.map(col => row[col.dataKey] || '')),
                startY: yPosition,
                columnStyles: singlePageColumnStyles,
                styles: {
                    fontSize: 10,
                    cellPadding: 4,
                    overflow: 'linebreak',
                    halign: 'left',
                    valign: 'middle'
                },
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 10,
                    cellPadding: 3,
                    halign: 'center',
                    valign: 'middle'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { left: 8, right: 8 },
                tableWidth: 'wrap',
                showHead: 'everyPage',
                pageBreak: 'auto',
                rowPageBreak: 'avoid'
            });
        }

        // Add summary at the end
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        if (needsMultiplePages) {
            doc.text(`Export Summary: ${filteredData.length} records with ${tableColumns.length} columns exported across ${Math.ceil(totalColumns / maxColumnsPerPage)} pages`, 14, finalY);
        } else {
            doc.text(`Export Summary: ${filteredData.length} records with ${tableColumns.length} columns exported`, 14, finalY);
        }

        // Generate filename with timestamp and filter info
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filterSuffix = Object.keys(filters).length > 0 ? '_filtered' : '';
        const finalFilename = `${filename}${filterSuffix}_${timestamp}.pdf`;

        // Save the PDF
        doc.save(finalFilename);

        return { success: true, filename: finalFilename, recordCount: filteredData.length };
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        return { success: false, error: error.message };
    }
};

// Export to Dashboard (redirect to existing dashboard with report data)
export const exportToDashboard = (data, columns, filename, title, reportType, filters = {}) => {
    try {
        console.log(`Dashboard Export: Redirecting to dashboard with ${data.length} records`);

        // Store the report data in sessionStorage for the dashboard to use
        const dashboardData = {
            reportType: reportType,
            reportTitle: title,
            data: data,
            columns: columns,
            filters: filters,
            timestamp: new Date().toISOString(),
            recordCount: data.length
        };

        // Store in sessionStorage
        sessionStorage.setItem('dashboardReportData', JSON.stringify(dashboardData));

        // Redirect to the existing dashboard page
        window.location.href = '/dashboard';

        return { success: true, message: 'Redirecting to dashboard...' };
    } catch (error) {
        console.error('Error exporting to dashboard:', error);
        return { success: false, error: error.message };
    }
};

// Helper function to analyze data for dashboard integration
export const analyzeDataForDashboard = (data, reportType) => {
    return analyzeDataForCharts(data, [], reportType);
};

// Generic export handler with filters
export const handleExport = (exportType, data, columns, filename, title, reportType, filters = {}, sorter = {}) => {
    console.log(`Export Handler: Called with exportType="${exportType}", ${data.length} records, ${columns.length} columns`);

    switch (exportType) {
        case 'excel':
            return exportToExcel(data, filename, 'Sheet1', filters, sorter);
        case 'pdf':
            console.log('Export Handler: Calling FULL PDF export');
            return exportToPDF(data, columns, filename, title, filters, sorter);
        case 'pdf-compact':
            console.log('Export Handler: Calling COMPACT PDF export');
            return createCompactPDF(data, columns, filename, title, filters, sorter);
        case 'dashboard':
            return exportToDashboard(data, columns, filename, title, reportType, filters);
        default:
            return { success: false, error: 'Invalid export type' };
    }
};

// Get export options based on report type
export const getExportOptions = (reportType) => {
    const exportOptions = {
        'asset-lifecycle': ['pdf', 'dashboard'],
        'asset-movement': ['excel', 'pdf'],
        'maintenance-repair': ['excel', 'dashboard'],
        'asset-utilization': ['dashboard', 'excel'],
        'asset-financial': ['excel', 'pdf']
    };

    return exportOptions[reportType] || ['excel', 'pdf'];
};

// Format data for export (remove actions column and format values)
export const formatDataForExport = (data, columns) => {
    console.log(`formatDataForExport: Processing ${data.length} rows with ${columns.length} columns`);
    console.log('formatDataForExport: Column keys:', columns.map(col => col.dataIndex || col.key).filter(key => key && key !== 'actions'));
    console.log('formatDataForExport: Sample data row keys:', Object.keys(data[0] || {}));

    return data.map((row, index) => {
        const formattedRow = {};
        
        // Ensure ALL columns are included, even if they don't exist in the data
        columns.forEach(col => {
            const key = col.dataIndex || col.key;
            if (key && key !== 'actions') {
                let value = row[key];

                // Format specific data types
                if (typeof value === 'string' && value.includes('₹')) {
                    // Keep currency format
                    formattedRow[key] = value;
                } else if (typeof value === 'number') {
                    formattedRow[key] = value;
                } else if (value && typeof value === 'object' && value.props) {
                    // Handle React elements (like badges)
                    formattedRow[key] = value.props.children || '';
                } else if (value === null || value === undefined || value === '') {
                    // Ensure null/undefined/empty values are exported as empty strings
                    formattedRow[key] = '';
                } else {
                    // Include all fields, even if empty - this ensures all form fields are exported
                    formattedRow[key] = value || '';
                }
            }
        });
        
        // Debug first row
        if (index === 0) {
            console.log('formatDataForExport: First row formatted keys:', Object.keys(formattedRow));
            console.log('formatDataForExport: Total columns in export:', Object.keys(formattedRow).length);
            console.log('formatDataForExport: First row sample values:', {
                asset_id: formattedRow.asset_id,
                asset_name: formattedRow.asset_name,
                category: formattedRow.category,
                manufacturer_brand: formattedRow.manufacturer_brand,
                model_number: formattedRow.model_number,
                serial_number: formattedRow.serial_number,
                location: formattedRow.location,
                assigned_user: formattedRow.assigned_user,
                owning_department: formattedRow.owning_department,
                building_facility: formattedRow.building_facility,
                floor_room_number: formattedRow.floor_room_number,
                gps_coordinates: formattedRow.gps_coordinates,
                purchase_date: formattedRow.purchase_date,
                warranty_expiry: formattedRow.warranty_expiry,
                amc_expiry: formattedRow.amc_expiry,
                warranty_period_months: formattedRow.warranty_period_months,
                installation_date: formattedRow.installation_date,
                order_number: formattedRow.order_number,
                supplier_vendor: formattedRow.supplier_vendor,
                current_book_value: formattedRow.current_book_value,
                original_purchase_price: formattedRow.original_purchase_price,
                asset_type: formattedRow.asset_type,
                depreciation_method: formattedRow.depreciation_method,
                invoice_receipt_files: formattedRow.invoice_receipt_files,
                ownership_proof_files: formattedRow.ownership_proof_files,
                insurance_policy_files: formattedRow.insurance_policy_files,
                lease_agreement_files: formattedRow.lease_agreement_files
            });
        }
        
        return formattedRow;
    });
};

// Analyze data to extract chart information
const analyzeDataForCharts = (data, columns, reportType) => {
    const chartData = {
        totalRecords: data.length,
        categories: {},
        statuses: {},
        dates: {},
        values: {},
        trends: {}
    };

    // Analyze data based on report type
    switch (reportType) {
        case 'asset-lifecycle':
            analyzeAssetLifecycleData(data, chartData);
            break;
        case 'asset-financial':
            analyzeAssetFinancialData(data, chartData);
            break;
        case 'asset-utilization':
            analyzeAssetUtilizationData(data, chartData);
            break;
        case 'maintenance-repair':
            analyzeMaintenanceRepairData(data, chartData);
            break;
        case 'fault-trend-mttr':
            analyzeFaultTrendData(data, chartData);
            break;
        case 'compliance-audit':
            analyzeComplianceAuditData(data, chartData);
            break;
        case 'asset-master-summary':
            analyzeAssetMasterSummaryData(data, chartData);
            break;
        default:
            analyzeGenericData(data, chartData);
    }

    return chartData;
};

// Asset Lifecycle specific analysis
const analyzeAssetLifecycleData = (data, chartData) => {
    data.forEach(item => {
        // Category distribution
        if (item.asset_category) {
            chartData.categories[item.asset_category] = (chartData.categories[item.asset_category] || 0) + 1;
        }

        // Status distribution
        if (item.commissioning_status) {
            chartData.statuses[item.commissioning_status] = (chartData.statuses[item.commissioning_status] || 0) + 1;
        }

        // AMC Status
        if (item.amc_status) {
            chartData.statuses[`AMC: ${item.amc_status}`] = (chartData.statuses[`AMC: ${item.amc_status}`] || 0) + 1;
        }

        // Installation dates
        if (item.installation_date) {
            const year = new Date(item.installation_date).getFullYear();
            chartData.dates[year] = (chartData.dates[year] || 0) + 1;
        }
    });
};

// Asset Financial specific analysis
const analyzeAssetFinancialData = (data, chartData) => {
    let totalValue = 0;
    let totalDepreciation = 0;

    data.forEach(item => {
        // Financial values
        if (item.current_value) {
            const value = parseFloat(item.current_value.toString().replace(/[^0-9.-]+/g, ''));
            if (!isNaN(value)) {
                totalValue += value;
                chartData.values[item.asset_category || 'Unknown'] = (chartData.values[item.asset_category || 'Unknown'] || 0) + value;
            }
        }

        if (item.depreciation_amount) {
            const dep = parseFloat(item.depreciation_amount.toString().replace(/[^0-9.-]+/g, ''));
            if (!isNaN(dep)) {
                totalDepreciation += dep;
            }
        }

        // Status distribution
        if (item.financial_status) {
            chartData.statuses[item.financial_status] = (chartData.statuses[item.financial_status] || 0) + 1;
        }
    });

    chartData.totalValue = totalValue;
    chartData.totalDepreciation = totalDepreciation;
};

// Fault Trend specific analysis
const analyzeFaultTrendData = (data, chartData) => {
    let totalMTTR = 0;
    let faultCount = 0;

    data.forEach(item => {
        // Priority distribution
        if (item.priority) {
            chartData.statuses[item.priority] = (chartData.statuses[item.priority] || 0) + 1;
        }

        // Fault category
        if (item.fault_category) {
            chartData.categories[item.fault_category] = (chartData.categories[item.fault_category] || 0) + 1;
        }

        // MTTR analysis
        if (item.mttr_hours) {
            const mttr = parseFloat(item.mttr_hours);
            if (!isNaN(mttr)) {
                totalMTTR += mttr;
                faultCount++;
            }
        }

        // Status distribution
        if (item.status) {
            chartData.statuses[`Status: ${item.status}`] = (chartData.statuses[`Status: ${item.status}`] || 0) + 1;
        }
    });

    chartData.averageMTTR = faultCount > 0 ? totalMTTR / faultCount : 0;
};

// Asset Utilization specific analysis
const analyzeAssetUtilizationData = (data, chartData) => {
    data.forEach(item => {
        // Utilization rate analysis
        if (item.utilization_rate) {
            const rate = parseFloat(item.utilization_rate);
            if (!isNaN(rate)) {
                chartData.values[item.asset_category || 'Unknown'] = (chartData.values[item.asset_category || 'Unknown'] || 0) + rate;
            }
        }

        // Status distribution
        if (item.status) {
            chartData.statuses[item.status] = (chartData.statuses[item.status] || 0) + 1;
        }

        // Category distribution
        if (item.asset_category) {
            chartData.categories[item.asset_category] = (chartData.categories[item.asset_category] || 0) + 1;
        }
    });
};

// Maintenance Repair specific analysis
const analyzeMaintenanceRepairData = (data, chartData) => {
    data.forEach(item => {
        // Maintenance type distribution
        if (item.maintenance_type) {
            chartData.categories[item.maintenance_type] = (chartData.categories[item.maintenance_type] || 0) + 1;
        }

        // Status distribution
        if (item.status) {
            chartData.statuses[item.status] = (chartData.statuses[item.status] || 0) + 1;
        }

        // Priority distribution
        if (item.priority) {
            chartData.statuses[`Priority: ${item.priority}`] = (chartData.statuses[`Priority: ${item.priority}`] || 0) + 1;
        }

        // Cost analysis
        if (item.cost) {
            const cost = parseFloat(item.cost.toString().replace(/[^0-9.-]+/g, ''));
            if (!isNaN(cost)) {
                chartData.values[item.maintenance_type || 'Unknown'] = (chartData.values[item.maintenance_type || 'Unknown'] || 0) + cost;
            }
        }
    });
};

// Compliance Audit specific analysis
const analyzeComplianceAuditData = (data, chartData) => {
    data.forEach(item => {
        // Compliance status
        if (item.compliance_status) {
            chartData.statuses[item.compliance_status] = (chartData.statuses[item.compliance_status] || 0) + 1;
        }

        // Risk level distribution
        if (item.risk_level) {
            chartData.categories[item.risk_level] = (chartData.categories[item.risk_level] || 0) + 1;
        }

        // Audit type
        if (item.audit_type) {
            chartData.categories[`Type: ${item.audit_type}`] = (chartData.categories[`Type: ${item.audit_type}`] || 0) + 1;
        }
    });
};

// Asset Master Summary specific analysis
const analyzeAssetMasterSummaryData = (data, chartData) => {
    data.forEach(item => {
        // Category distribution
        if (item.category) {
            chartData.categories[item.category] = (chartData.categories[item.category] || 0) + 1;
        }

        // Status distribution
        if (item.status) {
            chartData.statuses[item.status] = (chartData.statuses[item.status] || 0) + 1;
        }

        // Location distribution
        if (item.location) {
            chartData.categories[`Location: ${item.location}`] = (chartData.categories[`Location: ${item.location}`] || 0) + 1;
        }

        // Value analysis
        if (item.current_value) {
            const value = parseFloat(item.current_value.toString().replace(/[^0-9.-]+/g, ''));
            if (!isNaN(value)) {
                chartData.values[item.category || 'Unknown'] = (chartData.values[item.category || 'Unknown'] || 0) + value;
            }
        }
    });
};

// Generic data analysis
const analyzeGenericData = (data, chartData) => {
    data.forEach(item => {
        // Look for common fields
        Object.keys(item).forEach(key => {
            if (key.includes('category') || key.includes('type')) {
                chartData.categories[item[key]] = (chartData.categories[item[key]] || 0) + 1;
            }
            if (key.includes('status')) {
                chartData.statuses[item[key]] = (chartData.statuses[item[key]] || 0) + 1;
            }
        });
    });
};

