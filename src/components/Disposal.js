import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const Disposal = () => {
  return (
    <div className="container-fluid p-1">
      {/* Header */}
      <h2 className="mb-1">Asset Disposal / Retirement</h2>
      <p className="mt-0">Track disposal, retirement, or auction of assets</p>

      <div className="card custom-shadow">
        <div className="card-body">
          {/* Asset Identification */}
          <h5 className="fs-4 mb-3">Disposal Details</h5>
          <h5 className=" mb-3">Asset Identification</h5>
          <div className="mt-3">
            <label className="form-label">Asset</label>
            <input type="text" className="form-control" placeholder="e.g., AST-001" />
          </div>

          {/* Disposal Information */}
          <h5 className="mt-3">Disposal Information</h5>
          <div className="row mb-3">
            <div className="col-md-6 mt-1">
              <label className="form-label">Disposal Type</label>
              <input type="text" className="form-control" placeholder="e.g., Sale / Write-off" />
            </div>
            <div className="col-md-6 mt-1">
              <label className="form-label">Disposal Date</label>
              <input type="date" className="form-control" />
            </div>
          </div>

          <div className="mt-2">
            <label className="form-label">Approver's Name</label>
            <input type="text" className="form-control" placeholder="e.g., John Doe" />
          </div>

          <div className="mt-2">
            <label className="form-label">Reason for Disposal</label>
            <textarea
              className="form-control"
              rows="1"
              placeholder="Enter reason for disposal"
            ></textarea>
          </div>

          {/* Financial & Buyer Details */}
          <h5 className=" mt-3">Financial & Buyer Details</h5>
          <div className="row mb-3">
            <div className="col-md-6 mb-2">
              <label className="form-label">Sale Price</label>
              <input type="number" className="form-control" placeholder="e.g., 50.00" />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label">Book Value</label>
              <input type="number" className="form-control" placeholder="e.g., 75.00" />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Buyer’s Name / Company</label>
            <input type="text" className="form-control" placeholder="e.g., ABC Pvt Ltd" />
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn cancel-btn px-4">Cancel</button>
            <button className="btn save-btn px-4">Save Disposal Log</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disposal;