import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

export default function ManageVendor({ onNavigate }) {
  // 🔹 State for form fields
  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_code: "",
    status: "",
    contact: "",
    email: "",
    phone: "",
    category: "",
    payment_terms: "",
    tax_id: "",
    address: "",
    notes: "",
  });

  // 🔹 Handle Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Handle Save
  const handleSave = (e) => {
    e.preventDefault();

    // check required fields
    for (const key in formData) {
      if (!formData[key]) {
        alert(`Please fill the required field: ${key.replace("_", " ")}`);
        return;
      }
    }

    console.log("📌 Vendor Data:", formData);
    // Later -> call API here with formData
  };

  // 🔹 Handle Reset
  const handleReset = () => {
    setFormData({
      vendor_name: "",
      vendor_code: "",
      status: "",
      contact: "",
      email: "",
      phone: "",
      category: "",
      payment_terms: "",
      tax_id: "",
      address: "",
      notes: "",
    });
  };

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
      <form className="card custom-shadow mb-3" onSubmit={handleSave}>
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Vendor</h5>

          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Vendor Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="vendor_name"
                className="form-control"
                value={formData.vendor_name}
                onChange={handleChange}
                required
                placeholder="e.g., Tech Solutions"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Vendor Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="vendor_code"
                className="form-control"
                value={formData.vendor_code}
                onChange={handleChange}
                required
                placeholder="e.g., TS-001"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Status <span className="text-danger">*</span>
              </label>
              <select
                name="status"
                className="form-select"
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
                Primary Contact <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="contact"
                className="form-control"
                value={formData.contact}
                onChange={handleChange}
                required
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="e.g., john@tech.com"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Phone <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="e.g., +1-555-1234"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Category <span className="text-danger">*</span>
              </label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Hardware Supplier">Hardware Supplier</option>
                <option value="Logistics">Logistics</option>
                <option value="Software Provider">Software Provider</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Payment Terms <span className="text-danger">*</span>
              </label>
              <select
                name="payment_terms"
                className="form-select"
                value={formData.payment_terms}
                onChange={handleChange}
                required
              >
                <option value="">Select Terms</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Tax ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="tax_id"
                className="form-control"
                value={formData.tax_id}
                onChange={handleChange}
                required
                placeholder="e.g., 12-3456789"
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">
                Address <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="e.g., 123 Main St, New York"
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
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleChange}
                required
                placeholder="e.g., Preferred vendor..."
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary px-4" onClick={handleReset}>
              Reset
            </button>
            <button type="submit" className="btn btn-primary px-4">
              Save Vendor
            </button>
          </div>
        </div>
      </form>

      {/* 🔹 Vendor Directory Table */}
      <div className="card custom-shadow mb-3 position-relative">
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
                  <button className="btn btn-light btn-sm me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-danger btn-sm">
                    <FaTrash />
                  </button>
                </td>
              </tr>
              <tr>
                <td>Supply Co.</td>
                <td>Logistics</td>
                <td>Jane Smith</td>
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
                <td>Equip Inc.</td>
                <td>Hardware Supplier</td>
                <td>Bob Johnson</td>
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
        <button
          className="btn-light btn-sm px-5 position-absolute"
          style={{ bottom: "8px", right: "45px" }}
          onClick={() => onNavigate("settings")}
        >
          Back
        </button>
      </div>
    </div>
  );
}
