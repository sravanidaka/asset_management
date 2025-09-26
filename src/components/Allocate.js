import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

function Allocate() {
  return (
    <div className="container-fluid p-1">
     
     {/* Header */}
<h2 className="mb-1">Asset Allocation</h2>
<p className="mt-0">Assign assets to users or locations.</p>

      {/* Card Section */}
      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Assign Asset</h5>

          {/* Assignment Details */}
           <h5 className=" mb-3">Assignment Details</h5>
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Asset ID</label>
              <select className="form-select">
                <option>Select ID</option>
                <option>AST-001</option>
                <option>AST-002</option>
                <option>AST-003</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Assignment Type</label>
              <select className="form-select">
                <option>Select </option>
                <option>Employee</option>
                <option>Department</option>
                <option>Location</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Assigned To</label>
              <select className="form-select">
                <option>Select ID</option>
                <option>Employee</option>
                <option>Department</option>
              </select>
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Assignment Date</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Return Date (Optional)</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Assigned By</label>
              <input type="text" className="form-control" />
            </div>
          </div>

          {/* Additional Information */}
          <h5 className=" mb-3">Additional Information</h5>
          <div className="mb-3">
            <label className="form-label">Assignment Notes / Purpose</label>
            <textarea className="form-control" rows="3"></textarea>
          </div>
          <div className="mb-4">
            <label className="form-label">
              Condition at Time of Issue (Optional)
            </label>
            <textarea className="form-control" rows="2"></textarea>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end">
            <button className="btn  me-2 cancel-btn">Cancel</button>
            <button className="btn  save-btn">Assign Asset</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Allocate;