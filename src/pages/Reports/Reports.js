import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomBreadcrumb from '../../components/Breadcrumb';

const Card = ({ title, description, frequency, stakeholders, onViewDetails }) => (
  <div className="card h-100 border-0">
    <div className="card-body border-start border-4 border-success">
      <h5 className="card-title mb-2">{title}</h5>
      <p className="card-text text-secondary mb-2">{description}</p>
      <small className="text-muted d-block mb-2">
        <strong>Frequency:</strong> {frequency}
      </small>
      <small className="text-muted d-block mb-3">
        <strong>Stakeholders:</strong> {stakeholders}
      </small>
      <button className="btn btn-primary" onClick={onViewDetails}>
        View Details
      </button>
    </div>
  </div>
);

const Reports = () => {
  const navigate = useNavigate();

  const reports = [
    {
      id: 'asset-master-summary',
      title: 'Asset Master Summary Report',
      description: 'Provides a complete view of deployed and in-stock assets',
      frequency: 'Weekly / Monthly',
      stakeholders: 'Asset Manager, Circle Head'
    },
    {
      id: 'assetlifecycle',
      title: 'Asset Lifecycle Report',
      description: 'Tracks assets from procurement to decommissioning',
      frequency: 'Monthly',
      stakeholders: 'Central Asset Team, Finance'
    },
    {
      id: 'asset-movement-transfer',
      title: 'Asset Movement / Transfer Report',
      description: 'Captures inter-site or inter-circle movement',
      frequency: 'Weekly',
      stakeholders: 'Logistics, Regional Head'
    },
    {
      id: 'maintenance-repair',
      title: 'Maintenance & Repair Report',
      description: 'Analyzes maintenance activities and downtime',
      frequency: 'Weekly',
      stakeholders: 'NOC, Vendor Management'
    },
    {
      id: 'asset-utilization',
      title: 'Asset Utilization Report',
      description: 'Identifies underutilized or idle assets',
      frequency: 'Monthly',
      stakeholders: 'Operations, Planning'
    },
    {
      id: 'asset-financial',
      title: 'Asset Financial Report',
      description: 'Shows depreciation, cost, and book value',
      frequency: 'Quarterly',
      stakeholders: 'Finance, Audit'
    },
    {
      id: 'compliance-audit',
      title: 'Compliance & Audit Report',
      description: 'Validates physical vs system records',
      frequency: 'Quarterly / Annual',
      stakeholders: 'Audit, Compliance Team'
    },
    {
      id: 'fault-trend-mttr',
      title: 'Fault Trend / MTTR Report',
      description: 'Measures reliability and SLA adherence',
      frequency: 'Weekly',
      stakeholders: 'NOC, Vendor Management'
    },
    {
      id: 'warranty-amc-tracker',
      title: 'Warranty / AMC Tracker',
      description: 'Tracks contract renewals and warranty expiries',
      frequency: 'Monthly',
      stakeholders: 'Procurement, Vendor Management'
    },
    // {
    //   id: 'gis-asset-map',
    //   title: 'GIS-Integrated Asset Map Report',
    //   description: 'Provides a visual representation of field assets',
    //   frequency: 'Real-time',
    //   stakeholders: 'Planning, Field Ops, NOC'
    // },
    {
      id: 'asset-procurement-deployment',
      title: 'Asset Procurement vs Deployment Report',
      description: 'Tracks procurement pipeline and deployment ratio',
      frequency: 'Monthly',
      stakeholders: 'Procurement, Project Office'
    },
    {
      id: 'disposal-report',
      title: 'Scrap / Disposal Report',
      description: 'Tracks scrapped or disposed assets and recovery',
      frequency: 'Quarterly',
      stakeholders: 'Finance, Audit'
    },
    // {
    //   id: 'asset-health',
    //   title: 'Asset Health Report',
    //   description: 'Monitors uptime and fault frequency',
    //   frequency: 'Weekly',
    //   stakeholders: 'NOC, Operations'
    // },
    {
      id: 'inventory-aging',
      title: 'Inventory Aging Report',
      description: 'Highlights items in stock beyond a defined threshold',
      frequency: 'Monthly',
      stakeholders: 'Warehouse, Procurement'
    },
    // {
    //   id: 'energy-equipment-performance',
    //   title: 'Energy Equipment Performance Report',
    //   description: 'Tracks DG, Battery, and Solar Unit performance',
    //   frequency: 'Weekly',
    //   stakeholders: 'Infra Team, Energy Management'
    // }
  ];

  const handleViewDetails = (reportId) => {
    navigate(`/${reportId}`);
  };

  return (
    <div className="container-fluid p-1">
      {/* Top Navigation Bar - Breadcrumb Only */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        <CustomBreadcrumb />
      </div>

      <h2 className="mb-1">Reports</h2>
      <p className='mt-0'>Overview of all asset-related KPIs and reports</p>

      {/* Report Cards Grid */}
      <div className="row g-4 mt-3">
        {reports.map((report) => (
          <div key={report.id} className="col-lg-4 col-md-6">
            <Card
              title={report.title}
              description={report.description}
              frequency={report.frequency}
              stakeholders={report.stakeholders}
              onViewDetails={() => handleViewDetails(report.id)}
            />
          </div>
        ))}
      </div>

    </div>
  );
};

export default Reports;