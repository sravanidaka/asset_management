import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

export default function ApprovalHierarchies({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "",
    module: "",
    department: "",
    threshold: "",
    escalation: "",
    autoAssign: "",
    skipOnLeave: "",
    description: "",
    notes: "",
  });

  const [hierarchies, setHierarchies] = useState([
    { name: "Procurement Hierarchy", module: "Procure", levels: 2, status: "Active" },
    { name: "Disposal Hierarchy", module: "Disposal", levels: 1, status: "Active" },
    { name: "Maintenance Hierarchy", module: "Maintenance", levels: 3, status: "Archived" },
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setFormData({
      name: "",
      code: "",
      status: "",
      module: "",
      department: "",
      threshold: "",
      escalation: "",
      autoAssign: "",
      skipOnLeave: "",
      description: "",
      notes: "",
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("📌 Approval Hierarchy Data:", formData);

    const newHierarchy = {
      name: formData.name,
      module: formData.module,
      levels: Math.floor(Math.random() * 3) + 1, // just mock value
      status: formData.status,
    };
    setHierarchies((prev) => [...prev, newHierarchy]);
    handleReset();
  };

  const handleDelete = (index) => {
    setHierarchies((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-1">Approval Hierarchies</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Hierarchies</button>
          <button className="btn btn-success px-4">All Modules</button>
        </div>
      </div>

      {/* 🔹 Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Approval Hierarchy</h5>

          <form onSubmit={handleSave}>
            {/* Row 1 */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">
                  Hierarchy Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Procurement Hierarchy"
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
                  value={formData.code}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., PH-001"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
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
              <div className="col-md-6">
                <label className="form-label">
                  Applicable Modules <span className="text-danger">*</span>
                </label>
                <select
                  name="module"
                  value={formData.module}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Module</option>
                  <option value="Procure">Procure</option>
                  <option value="Disposal">Disposal</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Department / Location <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., IT Department"
                  required
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">
                  Threshold (Amount) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="threshold"
                  value={formData.threshold}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 10000"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Escalation (Days) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="escalation"
                  value={formData.escalation}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 3"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Auto-Assign Approvers <span className="text-danger">*</span>
                </label>
                <select
                  name="autoAssign"
                  value={formData.autoAssign}
                  onChange={handleChange}
                  className="form-select"
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
              <div className="col-md-4">
                <label className="form-label">
                  Skip on Leave <span className="text-danger">*</span>
                </label>
                <select
                  name="skipOnLeave"
                  value={formData.skipOnLeave}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Approval process for procurement..."
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
                  value={formData.notes}
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
              <button type="button" className="btn btn-secondary px-4" onClick={handleReset}>
                Reset
              </button>
              <button type="submit" className="btn btn-primary px-4">
                Save Hierarchy
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔹 Saved Hierarchies Table */}
      <div className="card custom-shadow mb-3 position-relative">
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
              {hierarchies.map((h, index) => (
                <tr key={index}>
                  <td>{h.name}</td>
                  <td>{h.module}</td>
                  <td>{h.levels}</td>
                  <td>{h.status}</td>
                  <td>
                    <button className="btn btn-light btn-sm me-2">
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(index)}
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
