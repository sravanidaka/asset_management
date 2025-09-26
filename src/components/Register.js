import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

export default function Register() {
  return (
    <div className="container-fluid p-1">
     
     {/* Header */}
<h2 className="mb-1">Asset Register</h2>
<p className="mt-0">The core screen where all assets are listed and searchable.</p>


      {/* Search Card */}
      <div className="card custom-shadow">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Search Assets</h5>
          <button className="btn btn-add px-4 mb-3">
            <i className="bi bi-plus-circle me-1" />
            Add New Asset
          </button>
            <div className="row g-3">
            <div className="col-md-4 mt-2">
              <label className="form-label">Asset ID</label>
              <select className="form-select">
                <option>Select ID</option>
                <option>AST-001</option>
                <option>AST-002</option>
                <option>AST-003</option>
              </select>
            </div>

            <div className="col-md-4 mt-2">
              <label className="form-label">Asset Name</label>
              <input type="text" className="form-control" placeholder="Laptop" />
            </div>

            <div className="col-md-4 mt-2">
              <label className="form-label">Category</label>
              <select className="form-select">
                <option>Select Type</option>
                <option>Laptop</option>
                <option>Router</option>
                <option>Vehicle</option>
              </select>
            </div>

            <div className="col-md-4 mt-2">
              <label className="form-label">Location</label>
              <select className="form-select">
                <option>Select</option>
                <option>All Locations</option>
                <option>Offices</option>
                <option>Branches</option>
                <option>Warehouses</option>
              </select>
            </div>

            <div className="col-md-4 mt-2">
              <label className="form-label">Department</label>
              <select className="form-select">
                <option>All Departments</option>
                <option>Information Technology</option>
                <option>Human Resources</option>
                <option>Finance</option>
                <option>Marketing</option>
              </select>
            </div>

            <div className="col-md-4 mt-2">
              <label className="form-label">Purchase Date (From)</label>
              <input type="date" className="form-control" />
            </div>

            <div className="col-md-4 mt-2">
              <label className="form-label">Purchase Date (To)</label>
              <input type="date" className="form-control" />
            </div>

            <div className="col-md-4 mt-2">
              <label className="form-label">Status</label>
              <select className="form-select">
                <option>Select</option>
                 <option>Active</option>
                  <option>In Repair</option>
                   <option>Retired</option>
              </select>
            </div>

            <div className="col-md-4 mt-2">
              <label className="form-label">Vendor</label>
              <select className="form-select">
                <option>All Vendors</option>
                <option>Office Furniture</option>
                <option>Cisco Systems</option>
                <option>Maintenance Pro Services</option>
              </select>
            </div>

            <div className="col-md-4 mt-2">
              <label className="form-label">Employee</label>
              <input type="text" className="form-control" placeholder="All Employees" />
            </div>
          </div>

          <div className="d-flex gap-2 mt-3">
            <button className="btn">
              <i className="bi bi-funnel me-1" />
              Apply Filters
            </button>
            <button className="btn ">
              <i className="bi bi-x-circle me-1" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="card af-card mt-3">
        <div className="card-body">
          <h6 className="fs-5 mb-3">Asset List</h6>

          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">ASSET ID</th>
                  <th scope="col">ASSET NAME</th>
                  <th scope="col">CATEGORY</th>
                  <th scope="col">TYPE</th>
                  <th scope="col">LOCATION</th>
                  <th scope="col">STATUS</th>
                  <th scope="col">PURCHASE DATE</th>
                  <th scope="col" className="text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>AST-001</td>
                  <td>Dell XPS 15</td>
                  <td>IT Equipment</td>
                  <td>Laptop</td>
                  <td>Headquarters</td>
                  <td><span className="badge bg-success">Active</span></td>
                  <td>2023-01-15</td>
                  <td className="text-center action-icons">
                    <i className="bi bi-eye me-2 text-primary"></i>
                    <i className="bi bi-pencil-square me-2 text-warning"></i>
                    <i className="bi bi-trash text-danger"></i>
                  </td>
                </tr>
                <tr>
                  <td>AST-002</td>
                  <td>HP LaserJet Pro</td>
                  <td>IT Equipment</td>
                  <td>Printer</td>
                  <td>Branch A</td>
                  <td><span className="badge bg-warning text-dark">In Maintenance</span></td>
                  <td>2022-05-20</td>
                  <td className="text-center action-icons">
                    <i className="bi bi-eye me-2 text-primary"></i>
                    <i className="bi bi-pencil-square me-2 text-warning"></i>
                    <i className="bi bi-trash text-danger"></i>
                  </td>
                </tr>
                <tr>
                  <td>AST-003</td>
                  <td>Office Chair Ergonomic</td>
                  <td>Office Furniture</td>
                  <td>Chair</td>
                  <td>Headquarters</td>
                  <td><span className="badge bg-success">Active</span></td>
                  <td>2023-03-10</td>
                  <td className="text-center action-icons">
                    <i className="bi bi-eye me-2 text-primary"></i>
                    <i className="bi bi-pencil-square me-2 text-warning"></i>
                    <i className="bi bi-trash text-danger"></i>
                  </td>
                </tr>
                <tr>
                  <td>AST-004</td>
                  <td>Ford Transit Van</td>
                  <td>Vehicles</td>
                  <td>Van</td>
                  <td>Warehouse</td>
                  <td><span className="badge bg-success">Active</span></td>
                  <td>2021-11-01</td>
                  <td className="text-center action-icons">
                    <i className="bi bi-eye me-2 text-primary"></i>
                    <i className="bi bi-pencil-square me-2 text-warning"></i>
                    <i className="bi bi-trash text-danger"></i>
                  </td>
                </tr>
                <tr>
                  <td>AST-005</td>
                  <td>Lenovo ThinkPad</td>
                  <td>IT Equipment</td>
                  <td>Laptop</td>
                  <td>Headquarters</td>
                  <td><span className="badge bg-secondary">Inactive</span></td>
                  <td>2022-08-25</td>
                  <td className="text-center action-icons">
                    <i className="bi bi-eye me-2 text-primary"></i>
                    <i className="bi bi-pencil-square me-2 text-warning"></i>
                    <i className="bi bi-trash text-danger"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">Showing 1 to 5 of 50 assets</small>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <span className="page-link">Previous</span>
                </li>
                <li className="page-item active">
                  <span className="page-link">1</span>
                </li>
                <li className="page-item">
                  <span className="page-link">2</span>
                </li>
                <li className="page-item">
                  <span className="page-link">3</span>
                </li>
                <li className="page-item">
                  <span className="page-link">Next</span>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}