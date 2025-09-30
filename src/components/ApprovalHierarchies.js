import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Drawer, Modal } from "antd";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import "../App.css";

export default function ApprovalHierarchies({ onNavigate }) {
  // 🔹 Drawer state
  const [open, setOpen] = useState(false);

  // 🔹 Form state
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

  // 🔹 Table state
  const [hierarchies, setHierarchies] = useState([
    { name: "Procurement Hierarchy", module: "Procure", levels: 2, status: "Active" },
    { name: "Disposal Hierarchy", module: "Disposal", levels: 1, status: "Active" },
    { name: "Maintenance Hierarchy", module: "Maintenance", levels: 3, status: "Archived" },
  ]);

  // 🔹 Editing index
  const [editingIndex, setEditingIndex] = useState(null);

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Reset form
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
    setEditingIndex(null);
  };

  // 🔹 Open drawer for create
  const handleCreate = () => {
    handleReset();
    setOpen(true);
  };

  // 🔹 Open drawer for edit
  const handleEdit = (index) => {
    setFormData({
      ...hierarchies[index],
      threshold: hierarchies[index].threshold || "",
      escalation: hierarchies[index].escalation || "",
      autoAssign: hierarchies[index].autoAssign || "",
      skipOnLeave: hierarchies[index].skipOnLeave || "",
      department: hierarchies[index].department || "",
      code: hierarchies[index].code || "",
      description: hierarchies[index].description || "",
      notes: hierarchies[index].notes || "",
    });
    setEditingIndex(index);
    setOpen(true);
  };

  // 🔹 Save form
  const handleSubmit = (e) => {
    e.preventDefault();
    const hierarchyData = {
      name: formData.name,
      module: formData.module,
      levels: Math.floor(Math.random() * 3) + 1, // mock levels
      status: formData.status,
      department: formData.department,
      threshold: formData.threshold,
      escalation: formData.escalation,
      autoAssign: formData.autoAssign,
      skipOnLeave: formData.skipOnLeave,
      code: formData.code,
      description: formData.description,
      notes: formData.notes,
    };

    if (editingIndex !== null) {
      const updated = [...hierarchies];
      updated[editingIndex] = hierarchyData;
      setHierarchies(updated);
    } else {
      setHierarchies([...hierarchies, hierarchyData]);
    }

    setOpen(false);
    handleReset();
  };

  // 🔹 Delete hierarchy
  const handleDelete = (index) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this hierarchy?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        setHierarchies(hierarchies.filter((_, i) => i !== index));
      },
    });
  };

  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-success px-4"
            onClick={() => onNavigate("settings")}
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="mb-1">Approval Hierarchies</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Hierarchies</button>
          <button className="btn btn-success px-4">All Modules</button>
          <button className="btn btn-success px-4" onClick={handleCreate}>
            + Create Hierarchy
          </button>
        </div>
      </div>

      {/* 🔹 Table */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Saved Hierarchies</h5>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Module</th>
                <th>Levels</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hierarchies.map((h, i) => (
                <tr key={i}>
                  <td>{h.name}</td>
                  <td>{h.module}</td>
                  <td>{h.levels}</td>
                  <td>{h.status}</td>
                  <td>
                    <button className="btn btn-light btn-sm me-2" onClick={() => handleEdit(i)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(i)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {hierarchies.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">
                    No hierarchies added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Drawer Form */}
      <Drawer
        title={editingIndex !== null ? "Edit Approval Hierarchy" : "Create Approval Hierarchy"}
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
                Hierarchy Name <span className="text-danger">*</span>
              </label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Code <span className="text-danger">*</span>
              </label>
              <input type="text" name="code" className="form-control" value={formData.code} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Status <span className="text-danger">*</span>
              </label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange} required>
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
              <select name="module" className="form-select" value={formData.module} onChange={handleChange} required>
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
              <input type="text" name="department" className="form-control" value={formData.department} onChange={handleChange} required />
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Threshold (Amount) <span className="text-danger">*</span>
              </label>
              <input type="number" name="threshold" className="form-control" value={formData.threshold} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Escalation (Days) <span className="text-danger">*</span>
              </label>
              <input type="number" name="escalation" className="form-control" value={formData.escalation} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Auto-Assign Approvers <span className="text-danger">*</span>
              </label>
              <select name="autoAssign" className="form-select" value={formData.autoAssign} onChange={handleChange} required>
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
              <select name="skipOnLeave" className="form-select" value={formData.skipOnLeave} onChange={handleChange} required>
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="col-md-8">
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <input type="text" name="description" className="form-control" value={formData.description} onChange={handleChange} required />
            </div>
          </div>

          {/* Row 5 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-control" rows="3" value={formData.notes} onChange={handleChange}></textarea>
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
      </Drawer>
    </div>
  );
}