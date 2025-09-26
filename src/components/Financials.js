import React from 'react';

const Financials = () => {
  const overview = {
    totalAssets: '$1,250,000',
    totalDepreciation: '$350,000',
    netBookValue: '$900,000',
    annualBudget: '$150,000',
  };

  return (
    <div className="container-fluid p-1">
      {/* Header */}
      <h2 className="mb-1">Financials</h2>
      <p className="mt-0 text-muted">
        Monitor and manage asset-related financial records.
      </p>

      {/* Filters Card */}
      <div className="card custom-shadow">
        <div className="card-body p-3">
          {/* Top row with title + button */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fs-4 mb-0">Filters</h5>
            <button className="btn btn-primary btn-sm">
              <i className="bi bi-download me-1"></i> Export
            </button>
          </div>

          {/* Filter fields */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label htmlFor="assetCategory" className="form-label">
                Asset Category
              </label>
              <select className="form-select">
                <option>All Categories</option>
                <option>IT Equipment</option>
                <option>Vehicles</option>
                <option>Office Furniture</option>
                <option>Machinery</option>
                <option>Real Estate</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Cost Center</label>
              <input type="text" className="form-control" placeholder="All" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Location</label>
              <select className="form-select">
                <option>Select</option>
                <option>All Locations</option>
                <option>Offices</option>
                <option>Branches</option>
                <option>Warehouses</option>
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className=" col-md-4">
              <label className="form-label">Acquisition Date From</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Acquisition Date To</label>
              <input type="date" className="form-control" />
            </div>
            <div className=" col-md-4">
              <label className="form-label">Financial Year</label>
              <input
                type="text"
                className="form-control"
                value="2024-2025"
                readOnly
              />
            </div>
          </div>

          {/* Apply & Reset buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-success btn-sm">Apply</button>
            <button className="btn btn-outline-secondary btn-sm">Reset</button>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="card shadow-md mt-4">
        <div className="card-body">
          <h5 className=" fs-4 mb-4">Financial Overview</h5>
          <div className="row row-cols-1 mt-2 row-cols-md-4 g-4">
            {Object.entries(overview).map(([key, value]) => (
              <div className="col" key={key}>
                <div className="card h-100 shadow-sm border-0 rounded-3">
                  <div className="card-body text-center">
                    <h5 className="card-title fs-6 text-muted">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h5>
                    <p className="card-text fw-bold fs-5">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="card shadow-md mt-4">
        <div className="card-body">
          <h5 className=" mb-3 ">Cost Breakdown by Category</h5>
          <div className="chart-placeholder">[Chart Placeholder]</div>
        </div>
      </div>

      {/* Upcoming Financial Events */}
      <div className="card shadow-md mt-4">
        <div className="card-body">
          <h5 className="mb-4">Upcoming Financial Events</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Asset ID</th>
                  <th scope="col">Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Lease Renewal</td>
                  <td>IT-LAP-005</td>
                  <td>2024-12-01</td>
                  <td>$500.00</td>
                  <td>
                    <span className="badge bg-warning text-dark">Pending</span>
                  </td>
                </tr>
                <tr>
                  <td>Warranty Expiry</td>
                  <td>IT-SRV-010</td>
                  <td>2024-11-15</td>
                  <td>N/A</td>
                  <td>
                    <span className="badge bg-success">Upcoming</span>
                  </td>
                </tr>
                <tr>
                  <td>AMC Payment</td>
                  <td>NON-PRN-002</td>
                  <td>2024-10-20</td>
                  <td>$120.00</td>
                  <td>
                    <span className="badge bg-info text-dark">Scheduled</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Financial Reports */}
      <div className="card shadow-md mt-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className=" mb-3">Financial Reports</h5>
            <button className="btn btn-sm btn-outline-primary">
              <i className="bi bi-download"></i> Download All
            </button>
          </div>
          <div className="list-group">
            <a
              href="#"
              className="list-group-item list-group-item-action d-flex align-items-center rounded-3 mb-3"
            >
              <i className="bi bi-file-earmark-text me-2"></i> Depreciation
              Schedule (PDF)
            </a>
            <a
              href="#"
              className="list-group-item list-group-item-action d-flex align-items-center rounded-3 mb-3"
            >
              <i className="bi bi-file-earmark-text me-2"></i> Asset Cost
              Analysis (CSV)
            </a>
            <a
              href="#"
              className="list-group-item list-group-item-action d-flex align-items-center rounded-3 mb-3"
            >
              <i className="bi bi-file-earmark-text me-2"></i> Budget vs Actuals
              Report (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financials;
