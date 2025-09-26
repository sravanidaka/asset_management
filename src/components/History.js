import React, { useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const History = () => {
  const [filters, setFilters] = useState({
    asset: "",
    type: "All Types",
    status: "All Statuses",
    dateFrom: "",
    dateTo: "",
    referenceType: "",
    referenceStatus: "",
    referenceCategory: "",
  });

  const maintenanceRecords = [
    { id: "MNT-001", asset: "AST-101 (Laptop)", type: "Preventive", date: "2024-06-25", status: "Completed", cost: "$50.00" },
    { id: "MNT-002", asset: "AST-205 (Server)", type: "Corrective", date: "2024-06-20", status: "Completed", cost: "$200.00" },
    { id: "MNT-003", asset: "AST-310 (Printer)", type: "Scheduled", date: "2024-06-18", status: "Completed", cost: "$75.00" },
    { id: "MNT-004", asset: "AST-101 (Laptop)", type: "Preventive", date: "2024-05-15", status: "Completed", cost: "$45.00" },
    { id: "MNT-005", asset: "AST-402 (Vehicle)", type: "Corrective", date: "2024-05-10", status: "Completed", cost: "$300.00" },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      asset: "",
      type: "All Types",
      status: "All Statuses",
      dateFrom: "",
      dateTo: "",
      referenceType: "",
      referenceStatus: "",
      referenceCategory: "",
    });
  };

  return (
     <div className="container-fluid p-1">
    <h2 className="mb-1">History</h2>
    <p className="mt-0">View the complete history of assets.</p>
    
    
      {/* Main Card */}
      <div className="card custom-shadow">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h5 className="fs-4 mb-3">Maintenance Records</h5>
            <button className="btn px-4">+ Add Record</button>
          </div>

          {/* Filters */}
          <div className="row mt-1">
             <div className="col-md-4 mt-0">
              <label className="form-label">Asset ID</label>
              <select className="form-select">
                <option>Select ID</option>
                <option>AST-001</option>
                <option>AST-002</option>
                <option>AST-003</option>
              </select>
            </div>
            <div className="col-md-4 mt-0">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option>All Types</option>
                <option>Preventive</option>
                <option>Corrective</option>
                <option>Scheduled</option>
                <option>Emergency</option>
              </select>
            </div>
            <div className="col-md-4 mt-0">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option>All Statuses</option>
                <option>Completed</option>
                <option>In Progress</option>
                <option>Scheduled</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Date From</label>
              <input
                type="date"
                className="form-control"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Date To</label>
              <input
                type="date"
                className="form-control"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="row mb-3">
            <div className="col d-flex gap-2">
              <button className="btn px-4">Apply Filters</button>
              <button className="btn px-4" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>

          {/* Records Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Maintenance ID</th>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.id}</td>
                    <td>{record.asset}</td>
                    <td>{record.type}</td>
                    <td>{record.date}</td>
                    <td>
                       <span className="status-badge">{record.status}</span>
                     </td>
                    <td>{record.cost}</td>
                      <td className="actions">
                        <FaEye className="icon view" />
                        <FaEdit className="icon edit" />
                         <FaTrash className="icon trash" />
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center">
            <small>Showing 1 to 5 of 25 records</small>
            <div>
              <button className="btn btn-sm  me-1">Previous</button>
              <button className="btn btn-sm  me-1">1</button>
              <button className="btn btn-sm  me-1">2</button>
              <button className="btn btn-sm me-1">3</button>
              <button className="btn btn-sm me-1 ">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;