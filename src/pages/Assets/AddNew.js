import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../App.css";

const AddNew = () => {
  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Add New Asset</h2>http://202.53.92.35:5004/api
      <p className="mt-0">Add a new asset to the register.</p>

      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Asset Details</h5>

          {/* General Information */}
         <h5 className="">General Information</h5>
          <div className="row mb-3">
             <div className="col-md-4">
              <label className="form-label">Asset ID</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter asset ID"
              />
            </div>
            <div className="col-md-4 ">
              <label className="form-label">Asset Name</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4 ">
              <label className="form-label">Category</label>
              <select className="form-select">
                <option>Select Type</option>
                <option>Laptop</option>
                <option>Router</option>
                <option>Vehicle</option>
              </select>
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Manufacturer / Brand</label>
              <input type="text" className="form-control" />
            </div>
          {/* </div>

          <div className="row mb-4"> */}
            <div className="col-md-4 mt-2">
              <label className="form-label">Model Number</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Serial Number</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Asset Tag / QR Code</label>
              <input type="text" className="form-control" />
            </div>
          </div>

          {/* Location & Assignment */}
          <h5 className="">Location & Assignment</h5>
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label">Asset Location</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Assigned User</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Owning Department</label>
              <input type="text" className="form-control" />
            </div>
          </div>

          {/* Status & Dates */}
          <h5 className="">Status & Dates</h5>
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label">Asset Status</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Purchase Date</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Warranty Expiry Date</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">AMC Expiry Date (if applicable)</label>
              <input type="date" className="form-control" />
            </div>
          </div>

          {/* Financial Details */}
          <h5 className="">Financial Details</h5>
          <div className="row mb-4">
            <div className="col-md-4">
              <label className="form-label">Depreciation Method</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Current Book Value</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Vendor / Supplier Name</label>
              <input type="text" className="form-control" />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn px-4">Cancel</button>
            <button className="btn px-4">
              <i className="bi bi-save me-2"></i> Save Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNew;