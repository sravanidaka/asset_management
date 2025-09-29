import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

export default function ServiceTypes({ onNavigate }) {
  // 🔹 Form state
  const [form, setForm] = useState({
    name: "",
    code: "",
    status: "",
    category: "",
    assets: "",
    vendor: "",
    sla: "",
    approval: "",
    costCenter: "",
    description: "",
    notes: "",
  });

  // 🔹 Table data state
  const [serviceTypes, setServiceTypes] = useState([
    { name: "IT Maintenance", category: "Preventive", sla: "7", status: "Active" },
    { name: "Hardware Repair", category: "Corrective", sla: "3", status: "Active" },
    { name: "Emergency Fix", category: "Emergency", sla: "1", status: "Archived" },
  ]);

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // 🔹 Reset form
  const handleReset = () => {
    setForm({
      name: "",
      code: "",
      status: "",
      category: "",
      assets: "",
      vendor: "",
      sla: "",
      approval: "",
      costCenter: "",
      description: "",
      notes: "",
    });
  };

  // 🔹 Save new service type
  const handleSave = (e) => {
    e.preventDefault();
    console.log("📌 Service Type Data:", form);

    setServiceTypes([...serviceTypes, form]);
    handleReset();
  };

  // 🔹 Delete service type
  const handleDelete = (index) => {
    const updated = [...serviceTypes];
    updated.splice(index, 1);
    setServiceTypes(updated);
  };

  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-1">Service Types</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Types</button>
          <button className="btn btn-success px-4">All Vendors</button>
        </div>
      </div>

      {/* 🔹 Create / Edit Service Type Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Service Type</h5>

          <form onSubmit={handleSave}>
            {/* Row 1 */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">
                  Type Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., IT Maintenance"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., ITM-001"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="form-select"
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
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Preventive">Preventive</option>
                  <option value="Corrective">Corrective</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Applicable Assets <span className="text-danger">*</span>
                </label>
                <select
                  name="assets"
                  value={form.assets}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Assets</option>
                  <option value="IT & Non-IT">IT & Non-IT</option>
                  <option value="IT Only">IT Only</option>
                  <option value="Non-IT Only">Non-IT Only</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Default Vendor <span className="text-danger">*</span>
                </label>
                <select
                  name="vendor"
                  value={form.vendor}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Vendor</option>
                  <option value="Acme Services">Acme Services</option>
                  <option value="Tech Solutions">Tech Solutions</option>
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">
                  SLA (Days) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="sla"
                  value={form.sla}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 7"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Approval Required <span className="text-danger">*</span>
                </label>
                <select
                  name="approval"
                  value={form.approval}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Cost Center <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="costCenter"
                  value={form.costCenter}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Maintenance"
                  required
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="row mb-3">
              <div className="col-md-12">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Routine maintenance..."
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
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Additional details..."
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
                Save Service Type
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔹 Saved Service Types Table */}
      <div className="card custom-shadow mb-3 position-relative">
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
              {serviceTypes.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{s.category}</td>
                  <td>{s.sla}</td>
                  <td>{s.status}</td>
                  <td>
                    <button className="btn btn-light btn-sm me-2">
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(i)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
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
