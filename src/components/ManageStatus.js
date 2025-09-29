import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ManageStatus({ onNavigate }) {
  // 🔹 Form state
  const [formData, setFormData] = useState({
    status_name: "",
    status_type: "",
    color_tag: "",
    description: "",
    is_default: "",
    affects_availability: "",
    include_in_utilization: "",
  });

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Status Form Data:", formData);
  };

  // 🔹 Reset form
  const handleReset = () => {
    setFormData({
      status_name: "",
      status_type: "",
      color_tag: "",
      description: "",
      is_default: "",
      affects_availability: "",
      include_in_utilization: "",
    });
  };

  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-1">Asset Statuses</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All</button>
          <button className="btn btn-success px-4">Lifecycle</button>
        </div>
      </div>

      {/* 🔹 Create / Edit Status Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Edit Status</h5>

          <form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">
                  Status Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="status_name"
                  className="form-control"
                  placeholder="e.g., In Use"
                  value={formData.status_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Status Type <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="status_type"
                  className="form-control"
                  placeholder="Lifecycle"
                  value={formData.status_type}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Color Tag <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="color_tag"
                  className="form-control"
                  placeholder="Accent"
                  value={formData.color_tag}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="row mb-3">
              <div className="col-md-12">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  className="form-control"
                  placeholder="Short description..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">
                  Is Default? <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="is_default"
                  className="form-control"
                  placeholder="No"
                  value={formData.is_default}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Affects Availability <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="affects_availability"
                  className="form-control"
                  placeholder="Yes"
                  value={formData.affects_availability}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Include in Utilization <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="include_in_utilization"
                  className="form-control"
                  placeholder="Yes"
                  value={formData.include_in_utilization}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-light px-4"
                onClick={handleReset}
              >
                Reset
              </button>
              <button type="submit" className="btn btn-success px-4">
                Save Status
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔹 Statuses Table */}
      <div className="card custom-shadow position-relative">
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
                  <button className="btn btn-light btn-sm me-2">
                    <FaEdit />
                  </button>
                  <button className="btn btn-danger btn-sm">
                    <FaTrash />
                  </button>
                </td>
              </tr>
              <tr>
                <td>In Stock</td>
                <td>Inventory</td>
                <td>No</td>
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
                <td>Maintenance</td>
                <td>Lifecycle</td>
                <td>No</td>
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
                <td>Disposed</td>
                <td>Terminal</td>
                <td>No</td>
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
