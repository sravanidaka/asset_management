// src/components/Procure.js
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const Procure = () => {
  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Asset Procurement &amp; Indent</h2>
      <p className="mt-0">Capture procurement lifecycle.</p>

      <div className="card custom-shadow">
        <div className="card-body">
          {/* Indent Request Details */}
         <h5 className="fs-4 mb-3">Procure Details</h5>
          {/* Indent Request Details */}
          <h5 className="mb-3">Indent Request Details</h5>
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Request ID / Indent Number</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Requested By</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Requested Date</label>
              <input placeholder="dd-mm-yyyy" className="form-control" />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Status</label>
              <select className="form-select">
                <option>Select</option>
                 <option>Pending</option>
                  <option>Ordered</option>
                   <option>Approved</option>
              </select>
            </div>
        
            <div className="col-md-4 mt-2">
              <label className="form-label">Category</label>
              <select className="form-select">
                <option>Select Type</option>
                <option>Laptop</option>
                <option>Router</option>
                <option>Vehicle</option>
              </select>
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Name</label>
              <input type="number" className="form-control" />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Quantity</label>
              <input type="number" className="form-control" />
            </div>
          </div>

          {/* Procurement Information */}
          <h5 className=" mb-3">Procurement Information</h5>
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">PO Number</label>
              <input type="text" className="form-control" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Supplier / Vendor</label>
              <input type="text" className="form-control" />
            </div>
         
            <div className="col-md-4">
              <label className="form-label">Received Date</label>
              <input type="date" className="form-control" />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Invoice Details</label>
              <input type="text" className="form-control" />
            </div>
          </div>

          {/* Justification */}
          <h5 className=" mb-3">Justification</h5>
          <div className="mb-4">
            <label className="form-label">Justification / Remarks</label>
            <textarea className="form-control" rows="4"></textarea>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn  px-4">Cancel</button>
            <button className="btn  px-4">
              Save Procurement Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Procure;