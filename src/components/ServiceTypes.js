import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Drawer, Modal } from "antd";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import "../App.css";

export default function ServiceTypes({ onNavigate }) {
  // 🔹 Drawer state
  const [open, setOpen] = useState(false);

  // 🔹 Form state
  const [formData, setFormData] = useState({
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

  // 🔹 Table state
  const [serviceTypes, setServiceTypes] = useState([
    { name: "IT Maintenance", category: "Preventive", sla: "7", status: "Active" },
    { name: "Hardware Repair", category: "Corrective", sla: "3", status: "Active" },
    { name: "Emergency Fix", category: "Emergency", sla: "1", status: "Archived" },
  ]);

  // 🔹 Track editing row
  const [editingIndex, setEditingIndex] = useState(null);

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Open drawer for create
  const handleCreate = () => {
    setFormData({
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
    setEditingIndex(null);
    setOpen(true);
  };

  // 🔹 Open drawer for edit
  const handleEdit = (index) => {
    setFormData(serviceTypes[index]);
    setEditingIndex(index);
    setOpen(true);
  };

  // 🔹 Save form (add or update)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIndex !== null) {
      const updated = [...serviceTypes];
      updated[editingIndex] = formData;
      setServiceTypes(updated);
    } else {
      setServiceTypes([...serviceTypes, formData]);
    }
    setOpen(false);
    setEditingIndex(null);
    handleReset();
  };

  // 🔹 Delete service type
  const handleDelete = (index) => {
    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this service type?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        const updated = [...serviceTypes];
        updated.splice(index, 1);
        setServiceTypes(updated);
      },
    });
  };

  // 🔹 Reset form
  const handleReset = () => {
    setFormData({
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
          <h2 className="mb-1">Service Types</h2>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Types</button>
          <button className="btn btn-success px-4">All Vendors</button>
          <button className="btn btn-success px-4" onClick={handleCreate}>
            + Create Service Type
          </button>
        </div>
      </div>

      {/* 🔹 Table */}
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
              {serviceTypes.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{s.category}</td>
                  <td>{s.sla}</td>
                  <td>{s.status}</td>
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
              {serviceTypes.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">
                    No service types added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 Drawer Form */}
      <Drawer
        title={editingIndex !== null ? "Edit Service Type" : "Create Service Type"}
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={700}
      >
        <form onSubmit={handleSubmit}>
          {/* Row 1 */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">
                Type Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g., IT Maintenance"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="code"
                className="form-control"
                placeholder="e.g., ITM-001"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="row mb-3">
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
            <div className="col-md-4">
              <label className="form-label">
                Category <span className="text-danger">*</span>
              </label>
              <select name="category" className="form-select" value={formData.category} onChange={handleChange} required>
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
              <select name="assets" className="form-select" value={formData.assets} onChange={handleChange} required>
                <option value="">Select Assets</option>
                <option value="IT & Non-IT">IT & Non-IT</option>
                <option value="IT Only">IT Only</option>
                <option value="Non-IT Only">Non-IT Only</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">
                Default Vendor <span className="text-danger">*</span>
              </label>
              <select name="vendor" className="form-select" value={formData.vendor} onChange={handleChange} required>
                <option value="">Select Vendor</option>
                <option value="Acme Services">Acme Services</option>
                <option value="Tech Solutions">Tech Solutions</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">
                SLA (Days) <span className="text-danger">*</span>
              </label>
              <input type="number" name="sla" className="form-control" value={formData.sla} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Approval Required <span className="text-danger">*</span>
              </label>
              <select name="approval" className="form-select" value={formData.approval} onChange={handleChange} required>
                <option value="">Select Option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Row 4 */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">
                Cost Center <span className="text-danger">*</span>
              </label>
              <input type="text" name="costCenter" className="form-control" value={formData.costCenter} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <input type="text" name="description" className="form-control" value={formData.description} onChange={handleChange} required />
            </div>
          </div>

          {/* Row 5 */}
          <div className="row mb-3">
            <div className="col-md-12">
              <label className="form-label">
                Notes
              </label>
              <textarea name="notes" className="form-control" value={formData.notes} onChange={handleChange} rows="3"></textarea>
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary px-4" onClick={handleReset}>Reset</button>
            <button type="submit" className="btn btn-primary px-4">Save Service Type</button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}