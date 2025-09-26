import React, { useState } from "react";

export default function AuditExecute({ setActiveScreen }) {
  const [executionDetails, setExecutionDetails] = useState({
    notes: "",
  });

  const [executionTasks] = useState([
    {
      item: "Asset Tagging",
      control: "ITAM-CTRL-01",
      status: "In Progress",
      evidence: "Photos of tagged assets",
    },
    {
      item: "Access Reviews",
      control: "SECU-CTRL-08",
      status: "Completed",
      evidence: "Access logs",
    },
    {
      item: "License Compliance",
      control: "SOFT-LIC-03",
      status: "Pending",
      evidence: "N/A",
    },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExecutionDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    console.log("Execution continued:", executionDetails, executionTasks);
    setActiveScreen("review"); // Redirect to AuditReview screen
  };

  const handleBack = () => {
    console.log("Going back to previous screen");
    setActiveScreen("assign-team"); // Navigate back to AssignTeam
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1 d-flex justify-content-between align-items-center">
        Audit Execute
      </h2>

      <div className="card custom-shadow mt-4">
        {/* === Navigation Steps === */}
        <nav
          className="nav d-flex justify-content-between align-items-center mb-3"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "5px 10px",
            borderRadius: "5px",
          }}
        >
          <a href="#" className="nav-link fw-bold text-secondary">
            <i className="bi bi-clipboard-check me-1"></i> Plan
          </a>
          <a href="#" className="nav-link fw-bold text-secondary">
            <i className="bi bi-person-plus me-1"></i> Assign
          </a>
          <a href="#" className="nav-link fw-bold text-success">
            <i className="bi bi-play-circle me-1"></i> Execute
          </a>
          <a href="#" className="nav-link fw-bold text-secondary">
            <i className="bi bi-eye me-1"></i> Review
          </a>
          <a href="#" className="nav-link fw-bold text-secondary">
            <i className="bi bi-x-circle me-1"></i> Close
          </a>
        </nav>

        <div className="container mt-3">
          {/* === Summary (KPIs) === */}
          <div className="row text-center mb-3">
            <div className="col-md-4">
              <div className="card p-3">
                <h6 className="text-muted">Progress</h6>
                <h4>42%</h4>
                <small className="text-success">+6% today</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card p-3">
                <h6 className="text-muted">Open Findings</h6>
                <h4>7</h4>
                <small className="text-danger">2 High</small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card p-3">
                <h6 className="text-muted">Evidence Collected</h6>
                <h4>15</h4>
                <small className="text-warning">4 Pending</small>
              </div>
            </div>
          </div>

          <div className="row">
            {/* === Checklist Execution Table === */}
            <div className="col-md-12 mb-3">
              <div className="card mt-2">
                <h4 className="fs-4 mb-2">Checklist Execution</h4>
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Item</th>
                        <th>Owner</th>
                        <th>Due</th>
                        <th>Severity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Asset Tagging</td>
                        <td>Cody Fisher</td>
                        <td>Sep 14</td>
                        <td>
                          <span className="badge bg-light text-dark">High</span>
                        </td>
                        <td>
                          <span className="badge bg-info">In Progress</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Access Reviews</td>
                        <td>Courtney Henry</td>
                        <td>Sep 18</td>
                        <td>
                          <span className="badge bg-light text-dark">
                            Medium
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-danger">Blocked</span>
                        </td>
                      </tr>
                      <tr>
                        <td>License Compliance</td>
                        <td>Darrell Steward</td>
                        <td>Sep 20</td>
                        <td>
                          <span className="badge bg-light text-dark">High</span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">Not Started</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* === Activity Log Table === */}
            <div className="col-md-12 mb-3">
              <div className="card mt-2">
                <h4 className="fs-4">Activity Log</h4>
                <div className="table-responsive">
                  <table className="table table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Time</th>
                        <th>User</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>10:22</td>
                        <td>Cody</td>
                        <td>Uploaded evidence for Asset Tagging</td>
                      </tr>
                      <tr>
                        <td>09:40</td>
                        <td>Courtney</td>
                        <td>Requested access list from IAM</td>
                      </tr>
                      <tr>
                        <td>08:15</td>
                        <td>Savannah</td>
                        <td>Coordinated site walkthrough schedule</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* === Evidence & Notes === */}
          <div className="row">
            <div className="col-md-12 mb-3">
              <div className="card mt-0">
                <h4 className="fs-4 ">Evidence & Notes</h4>
                <div className="row">
                <div className="card-body">
                  <div className="border rounded p-2 mb-2">
                    <h6>
                      Inventory Export{" "}
                      <span className="badge bg-success">Verified</span>
                    </h6>
                    <p className="mb-1">inventory_q3.csv</p>
                    <small className="text-muted">Added by Cody • Sep 12</small>
                  </div>
                  <div className="border rounded p-2 mb-2">
                    <h6>
                      Access Review Screenshot{" "}
                      <span className="badge bg-warning">Pending</span>
                    </h6>
                    <p className="mb-1">access_review.png</p>
                    <small className="text-muted">Added by Courtney • Sep 12</small>
                  </div>
                  <div className="border rounded p-2 mb-2">
                    <h6>
                      License True-up{" "}
                      <span className="badge bg-danger">Rejected</span>
                    </h6>
                    <p className="mb-1">trueup.xlsx</p>
                    <small className="text-muted">Added by Darrell • Sep 11</small>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>

          {/* === Execution Notes === */}
          <div className="card mt-3">
            <h4 className="fs-4 ms-3 ">Execution Notes</h4>
            <div className="card-body">
              <textarea
                className="form-control"
                name="notes"
                rows="6"
                placeholder="List blockers, decisions, and context captured during execution."
                value={executionDetails.notes}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* === Export & Next Steps === */}
          <div className="card mt-4">
            <h4 className="fs-4 ms-3">Export & Next Steps</h4>
            <div className="card-body">
              
              <div className="row">
                {/* Column 1 */}
                <div className="col-md-4 mb-1">
                  <label className="form-label">Generate Report</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Execution Summary"
                    
                  />
                </div>

                {/* Column 2 */}
                <div className="col-md-4 mb-1">
                  <label className="form-label">Share With</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Audit Team"
                    
                  />
                </div>

                {/* Column 3 */}
                <div className="col-md-4 mb-1">
                  <label className="form-label">Include Evidence</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Yes"
                    
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-3 p-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <button
            type="submit"
            className="btn btn-success"
            onClick={handleContinue}
          >
            Continue to Review <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
