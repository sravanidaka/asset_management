import React, { useState } from "react";
import { FaSearch, FaDownload, FaEye, FaEdit } from "react-icons/fa";

const DisposalReport = () => {
  const [search, setSearch] = useState("");

  const assets = [
    {
      name: "Old Server Unit",
      id: "AST-SRV-005",
      date: "2023-11-20",
      reason: "Obsolete",
      method: "Recycling",
      status: "Completed",
    },
    {
      name: "Damaged Laptop",
      id: "AST-LAP-012",
      date: "2024-01-10",
      reason: "Damaged",
      method: "Scrap",
      status: "Completed",
    },
    {
      name: "Office Chair",
      id: "AST-CHR-003",
      date: "2024-03-01",
      reason: "Beyond Repair",
      method: "Donation",
      status: "Completed",
    },
    {
      name: "Old Projector",
      id: "AST-PRJ-007",
      date: "2024-05-15",
      reason: "Upgrade",
      method: "Sale",
      status: "Completed",
    },
  ];

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container p-1">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h2 className="mt-0">Disposal Report</h2>
      </div>
      <p className="mt-0 mb-3">Track and manage asset disposal records.</p>

      <div className="actions-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search disposed assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-add">
          <FaDownload className="me-2" /> Export Report
        </button>
      </div>

      <div className="card af-card mt-3">
        <h5 className="card-title">Disposed Assets</h5>
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Asset ID</th>
              <th>Disposal Date</th>
              <th>Reason</th>
              <th>Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset, index) => (
              <tr key={index}>
                <td>{asset.name}</td>
                <td>{asset.id}</td>
                <td>{asset.date}</td>
                <td>{asset.reason}</td>
                <td>{asset.method}</td>
                <td>
                  <span className="status-badge">{asset.status}</span>
                </td>
                <td className="actions">
                  <FaEye className="icon view" />
                  <FaEdit className="icon edit" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisposalReport;