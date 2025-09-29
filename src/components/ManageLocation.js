import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

export default function ManageLocation({ onNavigate }) {
  // 🔹 Form state
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    code: "",
    parent: "",
    region: "",
    active: "",
    address: "",
    notes: "",
  });

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save form
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("📌 Location Form Data:", formData);
  };

  // 🔹 Reset form
  const handleReset = () => {
    setFormData({
      type: "",
      name: "",
      code: "",
      parent: "",
      region: "",
      active: "",
      address: "",
      notes: "",
    });
  };

  return (
    <div className="container-fluid p-1">
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className=" mb-1">Manage Locations</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Regions</button>
          <button className="btn btn-success px-4">All Sites</button>
        </div>
      </div>

      {/* 🔹 Create / Edit Location Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Location</h5>

          <form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">
                  Type <span className="text-danger">*</span>
                </label>
                <select
                  name="type"
                  className="form-select"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Location">Location</option>
                  <option value="Department">Department</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g., HQ - New York"
                  value={formData.name}
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
                  name="code"
                  className="form-control"
                  placeholder="e.g., NY-HQ"
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
                  Parent <span className="text-danger">*</span>
                </label>
                <select
                  name="parent"
                  className="form-select"
                  value={formData.parent}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Parent</option>
                  <option value="Headquarters">Headquarters</option>
                  <option value="Regional Office">Regional Office</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Region <span className="text-danger">*</span>
                </label>
                <select
                  name="region"
                  className="form-select"
                  value={formData.region}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Region</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">
                  Active <span className="text-danger">*</span>
                </label>
                <select
                  name="active"
                  className="form-select"
                  value={formData.active}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Status</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            {/* Row 3 */}
            <div className="row mb-3">
              <div className="col-md-12">
                <label className="form-label">
                  Address <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="Full address..."
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="row mb-3">
              <div className="col-md-12">
                <label className="form-label">
                  Notes <span className="text-danger">*</span>
                </label>
                <textarea
                  name="notes"
                  className="form-control"
                  placeholder="Optional notes..."
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
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
                Save Location
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔹 Directory Table */}
      <div className="card custom-shadow mb-3 position-relative">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Locations Directory</h5>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Region</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>HQ - New York</td>
                <td>Location</td>
                <td>North America</td>
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
                <td>Office - London</td>
                <td>Department</td>
                <td>Europe</td>
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
                <td>Warehouse - Tokyo</td>
                <td>Location</td>
                <td>Asia</td>
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
