import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

export default function ApprovalHierarchies({ onNavigate }) {
  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-1">Approval Hierarchies</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Hierarchies</button>
          <button className="btn btn-success px-4">All Modules</button>
        </div>
      </div>

      {/* 🔹 Create / Edit Approval Hierarchy Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Approval Hierarchy</h5>

          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Hierarchy Name</label>
              <input type="text" className="form-control" placeholder="e.g., Procurement Hierarchy" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Code</label>
              <input type="text" className="form-control" placeholder="e.g., PH-001" />
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
            <div className="col-md-6">
              <label className="form-label">Applicable Modules</label>
              <select className="form-select">
                <option value="Procure">Procure</option>
                <option value="Disposal">Disposal</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Department / Location</label>
              <input type="text" className="form-control" placeholder="e.g., IT Department" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Threshold (Amount)</label>
              <input type="text" className="form-control" placeholder="e.g., 10000" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Escalation (Days)</label>
              <input type="text" className="form-control" placeholder="e.g., 3" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Auto-Assign Approvers</label>
              <select className="form-select">
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Skip on Leave</label>
              <select className="form-select">
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">Description</label>
              <input type="text" className="form-control" placeholder="e.g., Approval process for procurement..." />
            </div>
          </div>

          {/* Row 5 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">Notes</label>
              <textarea className="form-control" placeholder="e.g., Additional details..." rows="3"></textarea>
            </div>
          </div>

          {/* 🔹 Approval Levels Table */}
          <div className="card custom-shadow mb-3">
            <div className="card-body">
              <h5 className="fs-4 mb-3">Approval Levels</h5>
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Level</th>
                    <th>Approver Role</th>
                    <th>Backup Role</th>
                    <th>Parallel? (Yes / No)</th>
                    <th>Required? (Yes / No / Conditional)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Manager</td>
                    <td>Assistant Manager</td>
                    <td>Yes</td>
                    <td>Yes</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Director</td>
                    <td>Senior Manager</td>
                    <td>No</td>
                    <td>Conditional</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary px-4">Reset</button>
            <button className="btn btn-primary px-4">Save Hierarchy</button>
          </div>
        </div>
      </div>

      {/* 🔹 Saved Hierarchies Table */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Saved Hierarchies</h5>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Modules</th>
                <th>Levels</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Procurement Hierarchy</td>
                <td>Procure</td>
                <td>2</td>
                <td>Active</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>Disposal Hierarchy</td>
                <td>Disposal</td>
                <td>1</td>
                <td>Active</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>Maintenance Hierarchy</td>
                <td>Maintenance</td>
                <td>3</td>
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