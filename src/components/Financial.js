import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const Financial = () => {
  return (
    <div className="container-fluid p-1">
      {/* Header */}
      <h2 className="mb-1">Asset Depreciation &amp; Financials</h2>
      <p className="mt-0">Calculate and record depreciation.</p>

      {/* Card */}
      <div className="card custom-shadow">
        <div className="card-body">
         <h5 className="fs-4 mb-3">Asset Depreciation Details</h5>

          {/* Asset Information */}
          <h5 className=" mb-2">Asset Information</h5>
          <div className="row mb-3">
            <div className="col-12">
              <label className="form-label">Asset ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Asset ID"
              />
            </div>
          </div>

          {/* Depreciation Parameters */}
          <h5 className="mb-2">Depreciation Parameters</h5>
          <div className="row mb-3">
            <div className="col-md-4 mt-2">
              <label className="form-label">Depreciation Method</label>
              <select className="form-select">
                <option>Select Method</option>
                <option>SLM</option>
                <option>WDV</option>
              </select>
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Purchase Value</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 1200.00"
              />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Salvage Value</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 200.00"
              />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Useful Life (Years)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., 5"
              />
            </div>
          </div>

          {/* Financial Details */}
          <h5 className=" mb-2">Financial Details</h5>
          <div className="row mb-3">
            <div className="col-md-6 mt-2">
              <label className="form-label">Monthly Depreciation</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., $20.00/month"
              />
            </div>
            <div className="col-md-6 mt-2">
              <label className="form-label">Accumulated Depreciation</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., $800.00"
              />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-12">
              <label className="form-label">General Ledger Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., GL-DEP-2023-001"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn cancel-btn px-4">Cancel</button>
            <button className="btn save-btn px-4">Save Depreciation Log</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financial;