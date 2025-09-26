import React, { useState } from "react";
import { FaEye, FaEdit } from "react-icons/fa";

export default function Compliance({ setActiveScreen }) {
  // Filters state
  const [filters, setFilters] = useState({
    policySearch: "",
    complianceType: "All Types",
    status: "All Statuses",
    dueDateFrom: "",
    dueDateTo: "",
    assetCategory: "All Categories",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFilters((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Applied Filters:", filters);
  };

  const handleClear = () => {
    setFilters({
      policySearch: "",
      complianceType: "All Types",
      status: "All Statuses",
      dueDateFrom: "",
      dueDateTo: "",
      assetCategory: "All Categories",
    });
  };

  // Mock policies
  const [policies] = useState([
    {
      id: "POL-001",
      name: "Data Privacy Regulation",
      type: "Regulatory",
      dueDate: "2024-08-01",
      status: "Compliant",
      lastAudit: "2024-07-10",
    },
    {
      id: "POL-002",
      name: "Internal Security Policy",
      type: "Internal",
      dueDate: "2024-07-15",
      status: "Non-Compliant",
      lastAudit: "2024-07-05",
    },
    {
      id: "POL-003",
      name: "ISO 27001 Standard",
      type: "Industry Standard",
      dueDate: "2024-09-01",
      status: "Pending Audit",
      lastAudit: "N/A",
    },
    {
      id: "POL-004",
      name: "Asset Tagging Policy",
      type: "Internal",
      dueDate: "2024-06-30",
      status: "Audited",
      lastAudit: "2024-06-28",
    },
    {
      id: "POL-005",
      name: "Environmental Regulations",
      type: "Regulatory",
      dueDate: "2024-10-01",
      status: "Compliant",
      lastAudit: "2024-09-05",
    },
  ]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const totalPages = Math.ceil(policies.length / recordsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = policies.slice(indexOfFirstRecord, indexOfLastRecord);

  // Status badge colors
  const getStatusClass = (status) => {
    switch (status) {
      case "Compliant":
        return "badge bg-success";
      case "Non-Compliant":
        return "badge bg-danger";
      case "Pending Audit":
        return "badge bg-warning text-dark";
      case "Audited":
        return "badge bg-info text-dark";
      default:
        return "badge bg-secondary";
    }
  };

  // Update the button click handler
  const handleNewAudit = () => {
    setActiveScreen('new-audit');
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Compliance</h2>
      <p className="mt-0 text-muted">Track and manage asset compliance</p>

      {/* Filters */}
      <div className="card custom-shadow mb-3">
        <div className="card-body">
          {/* Header row */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fs-4 mb-0">Compliance Overview</h5>
            <button className="btn btn-sm" onClick={handleNewAudit}>
              <i className="bi bi-plus-circle me-1"></i> New Audit
            </button>
          </div>

          <form onSubmit={handleSubmit} className="row g-3">
            {/* Policy Search */}
            <div className="col-md-4 mt-2">
              <label htmlFor="policySearch" className="form-label">
                Search Policy
              </label>
              <input
                type="text"
                id="policySearch"
                value={filters.policySearch}
                onChange={handleChange}
                placeholder="Policy Name or ID"
                className="form-control"
              />
            </div>

            {/* Compliance Type */}
            <div className="col-md-4 mt-2">
              <label htmlFor="complianceType" className="form-label">
                Compliance Type
              </label>
              <select
                id="complianceType"
                value={filters.complianceType}
                onChange={handleChange}
                className="form-select"
              >
                <option>All Types</option>
                <option>Regulatory</option>
                <option>Internal</option>
                <option>Industry Standard</option>
                <option>Legal</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-md-4 mt-2">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={handleChange}
                className="form-select"
              >
                <option>All Statuses</option>
                <option>Compliant</option>
                <option>Non-Compliant</option>
                <option>Pending Audit</option>
                <option>Audited</option>
                <option>Exempt</option>
              </select>
            </div>

            {/* Due Date From */}
            <div className="col-md-4 mt-2">
              <label htmlFor="dueDateFrom" className="form-label">
                Due Date From
              </label>
              <input
                type="date"
                id="dueDateFrom"
                value={filters.dueDateFrom}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Due Date To */}
            <div className="col-md-4 mt-2">
              <label htmlFor="dueDateTo" className="form-label">
                Due Date To
              </label>
              <input
                type="date"
                id="dueDateTo"
                value={filters.dueDateTo}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Asset Category */}
            <div className="col-md-4 mt-2">
              <label htmlFor="assetCategory" className="form-label">
                Asset Category
              </label>
              <select
                id="assetCategory"
                value={filters.assetCategory}
                onChange={handleChange}
                className="form-select"
              >
                <option>All Categories</option>
                <option>IT Equipment</option>
                <option>Vehicles</option>
                <option>Office Furniture</option>
                <option>Machinery</option>
                <option>Real Estate</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="col-12 d-flex gap-2 mt-3">
              <button type="submit" className="btn">
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="btn"
              >
                Clear Filters
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Policies Table */}
      <div className="card custom-shadow rounded-3">
        <div className="card-body">
          <h5 className="mb-3 fs-4">Compliance Policies</h5>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Policy ID</th>
                  <th>Policy Name</th>
                  <th>Type</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Last Audit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRecords.map((policy, index) => (
                  <tr key={index}>
                    <td>{policy.id}</td>
                    <td>{policy.name}</td>
                    <td>{policy.type}</td>
                    <td>{policy.dueDate}</td>
                    <td>
                      <span className={getStatusClass(policy.status)}>
                        {policy.status}
                      </span>
                    </td>
                    <td>{policy.lastAudit}</td>
                    <td>
                      <button className="btn btn-sm me-2 btn-outline-secondary">
                        <FaEye />
                      </button>
                      <button className="btn btn-sm btn-outline-primary">
                        <FaEdit />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
              Showing {indexOfFirstRecord + 1} to{" "}
              {Math.min(indexOfLastRecord, policies.length)} of{" "}
              {policies.length} policies
            </span>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}