import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

export default function ServiceTypes({ onNavigate }) {
  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className=" mb-1">Service Types</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Types</button>
          <button className="btn btn-success px-4">All Vendors</button>
        </div>
      </div>

      {/* 🔹 Create / Edit Service Type Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Service Type</h5>

          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Type Name</label>
              <input type="text" className="form-control" placeholder="e.g., IT Maintenance" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Code</label>
              <input type="text" className="form-control" placeholder="e.g., ITM-001" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select className="form-select">
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select className="form-select">
                <option value="">Select Category</option>
                <option value="Preventive">Preventive</option>
                <option value="Corrective">Corrective</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Applicable Assets</label>
              <select className="form-select">
                <option value="">Select Assets</option>
                <option value="IT & Non-IT">IT & Non-IT</option>
                <option value="IT Only">IT Only</option>
                <option value="Non-IT Only">Non-IT Only</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Default Vendor</label>
              <select className="form-select">
                <option value="">Select Vendor</option>
                <option value="Acme Services">Acme Services</option>
                <option value="Tech Solutions">Tech Solutions</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">SLA (Days)</label>
              <input type="text" className="form-control" placeholder="e.g., 7" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Approval Required</label>
              <select className="form-select">
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Cost Center</label>
              <input type="text" className="form-control" placeholder="e.g., Maintenance" />
            </div>
          </div>

          {/* Row 4 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">Description</label>
              <input type="text" className="form-control" placeholder="e.g., Routine maintenance..." />
            </div>
          </div>

          {/* Row 5 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">Notes</label>
              <textarea className="form-control" placeholder="e.g., Additional details..." rows="3"></textarea>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary px-4">Reset</button>
            <button className="btn btn-primary px-4">Save Service Type</button>
          </div>
        </div>
      </div>

      {/* 🔹 Saved Service Types Table */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Saved Service Types</h5>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>SLA (Days)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>IT Maintenance</td>
                <td>Preventive</td>
                <td>7</td>
                <td>Active</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>Hardware Repair</td>
                <td>Corrective</td>
                <td>3</td>
                <td>Active</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>Emergency Fix</td>
                <td>Emergency</td>
                <td>1</td>
                <td>Archived</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
        className="btn-light btn-sm px-5 position-absolute "
        style={{ bottom: "8px", right: "45px",  }}
        onClick={() => onNavigate('settings')}
      >
        Back
      </button>
      </div>
    </div>
  );
}