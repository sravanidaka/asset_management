import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ManageStatus({ onNavigate }) {
  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-1">Asset Statuses</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All </button>
          <button className="btn btn-success px-4">Lifecycle</button>
        </div>
      </div>

      {/* 🔹 Create / Edit Status Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Edit Status</h5>

          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4 ">
              <label className="form-label">Status Name</label>
              <input type="text" className="form-control" placeholder="e.g., In Use" />
            </div>
            <div className="col-md-4 ">
              <label className="form-label">Status Type</label>
              <input type="text" className="form-control" placeholder="Lifecycle" />
            </div>
            <div className="col-md-4 ">
              <label className="form-label">Color Tag</label>
              <input type="text" className="form-control" placeholder="Accent" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="row mb-3">
            <div className="col-md-12 ">
              <label className="form-label">Description</label>
              <input type="text" className="form-control" placeholder="Short description..." />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4 ">
              <label className="form-label">Is Default?</label>
              <input type="text" className="form-control" placeholder="No" />
            </div>
            <div className="col-md-4 ">
              <label className="form-label">Affects Availability</label>
              <input type="text" className="form-control" placeholder="Yes" />
            </div>
            <div className="col-md-4 ">
              <label className="form-label">Include in Utilization</label>
              <input type="text" className="form-control" placeholder="Yes" />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-light px-4">Reset</button>
            <button className="btn btn-success px-4">Save Status</button>
          </div>
        </div>
      </div>

      {/* 🔹 Statuses Table */}
      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Statuses</h5>
          <table className="table table-bordered table-hover">
            <thead className="table-success">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Default</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>In Use</td>
                <td>Lifecycle</td>
                <td>Yes</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>In Stock</td>
                <td>Inventory</td>
                <td>No</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>Maintenance</td>
                <td>Lifecycle</td>
                <td>No</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>Disposed</td>
                <td>Terminal</td>
                <td>No</td>
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