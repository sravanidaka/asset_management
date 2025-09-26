import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

export default function ManageVendor({ onNavigate }) {
  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className=" mb-1">Manage Vendors</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Vendors</button>
          <button className="btn btn-success px-4">All Categories</button>
        </div>
      </div>

      {/* 🔹 Create / Edit Vendor Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Vendor</h5>

          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Vendor Name</label>
              <input type="text" className="form-control" placeholder="e.g., Tech Solutions" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Vendor Code</label>
              <input type="text" className="form-control" placeholder="e.g., TS-001" />
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
              <label className="form-label">Primary Contact</label>
              <input type="text" className="form-control" placeholder="e.g., John Doe" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input type="text" className="form-control" placeholder="e.g., john@tech.com" />
            </div>
            <div className="col-md-4">
              <label className="form-label">Phone</label>
              <input type="text" className="form-control" placeholder="e.g., +1-555-1234" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select className="form-select">
                <option value="">Select Category</option>
                <option value="Hardware Supplier">Hardware Supplier</option>
                <option value="Logistics">Logistics</option>
                <option value="Software Provider">Software Provider</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Payment Terms</label>
              <select className="form-select">
                <option value="">Select Terms</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Tax ID</label>
              <input type="text" className="form-control" placeholder="e.g., 12-3456789" />
            </div>
          </div>

          {/* Row 4 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">Address</label>
              <input type="text" className="form-control" placeholder="e.g., 123 Main St, New York" />
            </div>
          </div>

          {/* Row 5 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">Notes</label>
              <textarea className="form-control" placeholder="e.g., Preferred vendor..." rows="3"></textarea>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-secondary px-4">Reset</button>
            <button className="btn btn-primary px-4">Save Vendor</button>
          </div>
        </div>
      </div>

      {/* 🔹 Vendor Directory Table */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Vendor Directory</h5>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Vendor</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tech Solutions</td>
                <td>Hardware Supplier</td>
                <td>John Doe</td>
                <td>Active</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>Supply Co.</td>
                <td>Logistics</td>
                <td>Jane Smith</td>
                <td>Active</td>
                <td>
                  <button className="btn btn-light btn-sm me-2"><FaEdit /></button>
                  <button className="btn btn-danger btn-sm"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td>Equip Inc.</td>
                <td>Hardware Supplier</td>
                <td>Bob Johnson</td>
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