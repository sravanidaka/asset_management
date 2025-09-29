import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaEdit, FaTrash } from "react-icons/fa";
import "../App.css";

export default function ManageCategory({ onNavigate }) {
  // 🔹 Form state
  const [formData, setFormData] = useState({
    category_name: "",
    parent_category: "",
    useful_life: "",
    description: "",
    default_depreciation: "",
    capex_opex: "",
    track_warranty: "",
  });

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // later: call API -> axios.post('/api/categories', formData)
  };

  // 🔹 Handle reset
  const handleReset = () => {
    setFormData({
      category_name: "",
      parent_category: "",
      useful_life: "",
      description: "",
      default_depreciation: "",
      capex_opex: "",
      track_warranty: "",
    });
  };

  return (
    <div
      className="container-fluid p-1 position-relative"
      style={{ minHeight: "100vh" }}
    >
      {/* 🔹 Header Row */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-1">Asset Categories</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success px-4">All Types</button>
          <button className="btn btn-success px-4">All Departments</button>
        </div>
      </div>

      {/* 🔹 Create Category Form */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Create Category</h5>
          <form onSubmit={handleSubmit}>
            {/* Row 1 */}
            <div className="row mb-3">
              <div className="col-md-4 ">
                <label className="form-label">
                  Category Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  placeholder="e.g., Laptops"
                  required
                />
              </div>
              <div className="col-md-4 ">
                <label className="form-label">
                  Parent Category <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="parent_category"
                  value={formData.parent_category}
                  onChange={handleChange}
                  placeholder="None"
                  required
                />
              </div>
              <div className="col-md-4 ">
                <label className="form-label">
                  Useful Life (years) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  name="useful_life"
                  value={formData.useful_life}
                  onChange={handleChange}
                  placeholder="5"
                  required
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="row md-4 mt-2">
              <div className="col-md-12 ">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Short description..."
                  required
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="row mb-3">
              <div className="col-md-4 ">
                <label className="form-label">
                  Default Depreciation <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="default_depreciation"
                  value={formData.default_depreciation}
                  onChange={handleChange}
                  placeholder="Straight Line"
                  required
                />
              </div>
              <div className="col-md-4 ">
                <label className="form-label">
                  CapEx/OpEx <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="capex_opex"
                  value={formData.capex_opex}
                  onChange={handleChange}
                  placeholder="CapEx"
                  required
                />
              </div>
              <div className="col-md-4 ">
                <label className="form-label">
                  Track Warranty <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="track_warranty"
                  value={formData.track_warranty}
                  onChange={handleChange}
                  placeholder="Yes"
                  required
                />
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
                Save Category
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 🔹 Categories Table */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Categories</h5>
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Category Name</th>
                <th>Parent Category</th>
                <th>Type (CapEx/OpEx)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Laptops</td>
                <td>IT Equipment</td>
                <td>CapEx</td>
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
                <td>Monitors</td>
                <td>IT Equipment</td>
                <td>CapEx</td>
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
                <td>Furniture</td>
                <td>Non-IT</td>
                <td>CapEx</td>
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
                <td>Vehicles</td>
                <td>Transport</td>
                <td>CapEx</td>
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
