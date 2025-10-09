import React from 'react';
import CustomBreadcrumb from './common/Breadcrumb';
import BackNavigation from './common/BackNavigation';

const Card = ({ title, description }) => (
  <div className="card  h-100 border-0">
    <div className="card-body border-start border-4 border-success">
      <h5 className="card-title mb-2">{title}</h5>
      <p className="card-text text-secondary mb-3">{description}</p>
      <button className="btn">View Details</button>
    </div>
  </div>
);

const Reports = () => {
  return (
   <div className="container-fluid p-1">
      {/* Top Navigation Bar - Breadcrumb Only */}
      <div className="d-flex justify-content-end align-items-center mb-3">
        {/* Breadcrumb Navigation */}
        <CustomBreadcrumb />
      </div>
      
      <h2 className="mb-1">Reports</h2> 
      <p className='mt-0'>Overview of all asset-related KPIs</p>
   <div className="card custom-shadow">
        <div className="card-body">
  </div>
  <div className="report-card">
    <div className="row g-3 align-items-end ">
      <div className="col-md-4 mb-0">
              <label className="form-label">Date Range</label>
              <input
                type="text"
                className="form-control"
                placeholder=""
              />
            </div>
      <div className="col-12 col-md-4">
        <label className="form-label">Report Type</label>
        <select className="form-select">
          <option>Select Report</option>
          <option>Asset Summary Report</option>
          <option>Maintenance History Report</option>
          <option>Depreciation Report</option>
          <option>Audit Log Report</option>
        </select>
      </div>
      <div className="col-12 col-md-4">
        <button className="btn fw-semibold">
          <i className="bi bi-clipboard me-2"></i>
          Generate Report
        </button>
      </div>
    </div>
  </div>
  

<div className="card-container">
  <div className="card mt-4">
    <h5 className="card-title p-3">Asset Summary Report</h5>
    <p className="card-description">Overview of all assets, their types, statuses, and locations.</p>
    <div className='btn'>view Details</div>
  </div>

  <div className="card mt-4">
    <h5 className="card-title p-3">MaintenanceHistory Report</h5>
    <p className="card-description">Detailed log of all maintenance activities per asset.</p>
    <div className='btn'>view Details</div>
  </div>

  <div className="card mt-4">
    <h5 className="card-title p-3">Depreciation Report</h5>
    <p className="card-description">Financial overview of asset depreciation over time.</p>
    <div className='btn'>view Details</div>
  </div>

  <div className="card mt-4">
    <h5 className="card-title p-3">Audit Log Report</h5>
    <p className="card-description">Track all changes and user activities within the system.</p>
    <div className='btn'>view Details</div>
  </div>
</div>


<div className="custom-report-card">
  <h5 className="mb-2">Custom Report Builder</h5>
  <p>
    Create custom reports by selecting specific data fields and filters.
  </p>
  <button className="btn  fw-semibold">
    <i className="bi bi-plus-circle me-2"></i>
    Build New Custom Report
  </button>
</div>


    </div>
    </div>
  );
};

export default Reports;