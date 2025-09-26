import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const Transfer = () => {
  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Asset Transfer</h2>
      <p className="mt-0">Move assets from one location, branch, or person to another.</p>

      {/* Card */}
      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Transfer Asset</h5>

          {/* Section 1: Transfer Identification */}
         <h5 className=" mb-2">Transfer Identification</h5>
          <div className="row mb-3">
            <div className="col-md-6 mt-1">
              <label className="form-label">Transfer ID</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-6 mt-1">
              <label className="form-label">Select Asset</label>
              <select className="form-select">
                <option>Select</option>
                <option>AST-001</option>
                <option>AST-002</option>
                <option>AST-003</option>
              </select>
            </div>
          </div>

          {/* Section 2: Transfer Logistics */}
          <h5 className="mb-2">Transfer Logistics</h5>
          <div className="row mt-2">
            <div className="col-md-6 mb-3">
              <label className="form-label">Current Location or User</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">New Location or User</label>
              <input type="text" className="form-control" />
            </div>
          {/* </div>
          <div className="row mb-3"> */}
            <div className="col-md-6 mt-2">
              <label className="form-label">Transfer Date</label>
              <input type="date" className="form-control" />
            </div>
          </div>

          {/* Section 3: Justification & Approval */}
          <h6 className="fs-5 mb-2">Justification & Approval</h6>
          <div className="row mt-2">
            <div className="col-12 mb-3">
              <label className="form-label">Justification</label>
              <textarea className="form-control" rows="3"></textarea>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Approver's Name</label>
              <input type="text" className="form-control" />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end">
            <button className="btn btn-light me-2 px-4 rounded-3">Cancel</button>
            <button className="btn btn-success px-4 rounded-3">
              Transfer Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfer;