import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

export default function PaymentMethods({ onNavigate }) {
  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-1">Payment Methods</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Methods</button>
          <button className="btn btn-success px-4">All Currencies</button>
        </div>
      </div>

      {/* 🔹 Create / Edit Method Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Payment Method</h5>

          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Method Name</label>
              <input type="text" className="form-control" placeholder="e.g., Credit Card" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Code</label>
              <input type="text" className="form-control" placeholder="e.g., CC-001" />
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
              <label className="form-label">Type</label>
              <select className="form-select">
                <option value="">Select Type</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Default For</label>
              <select className="form-select">
                <option value="">Select Default</option>
                <option value="Vendors">Vendors</option>
                <option value="Internal Purchases">Internal Purchases</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">GL Account</label>
              <input type="text" className="form-control" placeholder="e.g., 2101 - Payables" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Processing Fee (%)</label>
              <input type="text" className="form-control" placeholder="e.g., 2.5" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Currency</label>
              <select className="form-select">
                <option value="">Select Currency</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Approval Required</label>
              <select className="form-select">
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">Instructions</label>
              <input type="text" className="form-control" placeholder="e.g., Submit within 24 hours..." />
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
            <button className="btn btn-primary px-4">Save Method</button>
          </div>
        </div>
      </div>

      {/* 🔹 Saved Methods Table */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Saved Payment Methods</h5>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Default For</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Credit Card</td>
                <td>Online</td>
                <td>Vendors</td>
                <td>Active</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>Bank Transfer</td>
                <td>Offline</td>
                <td>Internal Purchases</td>
                <td>Active</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>PayPal</td>
                <td>Online</td>
                <td>Vendors</td>
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