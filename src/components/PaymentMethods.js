import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Drawer } from "antd";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import "../App.css";

export default function PaymentMethods({ onNavigate }) {
  // 🔹 Drawer state
  const [open, setOpen] = useState(false);

  // 🔹 Form state
  const [formData, setFormData] = useState({
    method_name: "",
    code: "",
    status: "",
    type: "",
    default_for: "",
    gl_account: "",
    processing_fee: "",
    currency: "",
    approval_required: "",
    instructions: "",
    notes: "",
  });

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📌 Payment Method Data:", formData);
    setOpen(false); // close drawer after save
  };

  // 🔹 Reset form
  const handleReset = () => {
    setFormData({
      method_name: "",
      code: "",
      status: "",
      type: "",
      default_for: "",
      gl_account: "",
      processing_fee: "",
      currency: "",
      approval_required: "",
      instructions: "",
      notes: "",
    });
  };

  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-success px-4"
            onClick={() => onNavigate("settings")}
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="mb-1">Payment Methods</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Methods</button>
          <button className="btn btn-success px-4">All Currencies</button>
          <button className="btn btn-success px-4" onClick={() => setOpen(true)}>
            + Create Method
          </button>
        </div>
      </div>

      {/* 🔹 Directory Table */}
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
                  <button className="btn btn-light btn-sm me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-danger btn-sm">
                    <FaTrash />
                  </button>
                </td>
              </tr>
              <tr>
                <td>Bank Transfer</td>
                <td>Offline</td>
                <td>Internal Purchases</td>
                <td>Active</td>
                <td>
                  <button className="btn btn-light btn-sm me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-danger btn-sm">
                    <FaTrash />
                  </button>
                </td>
              </tr>
              <tr>
                <td>PayPal</td>
                <td>Online</td>
                <td>Vendors</td>
                <td>Archived</td>
                <td>
                  <button className="btn btn-light btn-sm me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-danger btn-sm">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Drawer with Create/Edit Payment Method Form */}
      <Drawer
        title="Create Payment Method"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={700}
      >
        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Method Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="method_name"
                value={formData.method_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Status <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Default For <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="default_for"
                value={formData.default_for}
                onChange={handleChange}
                required
              >
                <option value="">Select Default</option>
                <option value="Vendors">Vendors</option>
                <option value="Internal Purchases">Internal Purchases</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                GL Account <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="gl_account"
                value={formData.gl_account}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Processing Fee (%) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="processing_fee"
                value={formData.processing_fee}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Currency <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
              >
                <option value="">Select Currency</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Approval Required <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="approval_required"
                value={formData.approval_required}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">
                Instructions <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">
                Notes <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                required
              ></textarea>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className="btn btn-primary px-4">
              Save Method
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}