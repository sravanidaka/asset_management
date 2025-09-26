import React, { useState } from "react";

export default function AuditReview({ setActiveScreen }) {
  const [reviewDetails, setReviewDetails] = useState({
    findings: "",
    approvalStatus: "Pending",
  });
  const [reviewTasks] = useState([
    { item: "Asset Tagging", control: "ITAM-CTRL-01", status: "Completed", findings: "All assets tagged correctly", approved: "Yes" },
    { item: "Access Reviews", control: "SECU-CTRL-08", status: "Completed", findings: "Minor access issues found", approved: "No" },
    { item: "License Compliance", control: "SOFT-LIC-03", status: "Pending", findings: "Review in progress", approved: "N/A" },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    console.log("Review continued:", reviewDetails, reviewTasks);
    setActiveScreen('close'); // Example: Redirect to Close phase
  };

  const handleBack = () => {
    console.log("Going back to previous screen");
    setActiveScreen('execute'); // Example: Navigate back to AuditExecute
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1 d-flex justify-content-between align-items-center">
        Audit Review
      </h2>
      <div className="card custom-shadow mt-4">
        <nav className="nav d-flex justify-content-between align-items-center mb-3" style={{ backgroundColor: '#f8f9fa', padding: '5px 10px', borderRadius: '5px' }}>
          <a href="#" className="nav-link" style={{ color: '#6c757d', fontWeight: 'bold', padding: '5px 10px' }}>
            <i className="bi bi-clipboard-check me-1"></i> Plan
          </a>
          <a href="#" className="nav-link" style={{ color: '#6c757d', fontWeight: 'bold', padding: '5px 10px' }}>
            <i className="bi bi-person-plus me-1"></i> Assign
          </a>
          <a href="#" className="nav-link" style={{ color: '#6c757d', fontWeight: 'bold', padding: '5px 10px' }}>
            <i className="bi bi-play-circle me-1"></i> Execute
          </a>
          <a href="#" className="nav-link active" style={{ color: '#28a745', fontWeight: 'bold', padding: '5px 10px' }}>
            <i className="bi bi-eye me-1"></i> Review
          </a>
          <a href="#" className="nav-link" style={{ color: '#6c757d', fontWeight: 'bold', padding: '5px 10px' }}>
            <i className="bi bi-x-circle me-1"></i> Close
          </a>
        </nav>

        {/* Progress & Evidence */}
  <div className="row mb-3">
    <div className="col-md-4">
      <div className="card p-3">
        <small className="text-muted">Overall Progress</small>
        <h5>78% <span className="text-success">+12% since execute</span></h5>
        <small className="text-muted">Updated Sep 14, 10:24</small>
      </div>
    </div>
    <div className="col-md-4">
      <div className="card p-3">
        <small className="text-muted">Open Findings</small>
        <h5>5 <span className="text-danger">2 High</span></h5>
        <small className="text-muted">3 owners</small>
      </div>
    </div>
    <div className="col-md-4">
      <div className="card p-3">
        <small className="text-muted">Evidence</small>
        <h5>15 <span className="text-warning">4 pending</span></h5>
        <small className="text-muted">9 verified</small>
      </div>
    </div>
  </div>

  <div className="row">
    {/* === Finding Review === */}
    <div className="col-md-12">
      <div className="card mb-3 ">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Finding Review</h5>
          <div className="row">
            <div className="col-md-4">
              <div className="border rounded p-2 mb-2 bg-white">
                <h6 className="text-success">Asset Tagging Gaps <span className="badge bg-secondary">Changes Requested</span></h6>
                <small>Owner: Cody Fisher • Due: Sep 18 • Severity: High</small>
                <p className="mb-0 mt-1">Add serial capture for 12 devices and re-upload evidence.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="border rounded p-2 mb-2 bg-white">
                <h6 className="text-success">Access Review Coverage <span className="badge bg-success">Approved</span></h6>
                <small>Owner: Courtney Henry • Due: Sep 22 • Severity: Medium</small>
                <p className="mb-0 mt-1">Coverage meets policy threshold.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="border rounded p-2 mb-2 bg-white">
                <h6 className="text-success">License True-up Evidence <span className="badge bg-danger">Rejected</span></h6>
                <small>Owner: Darrell Steward • Due: Sep 22 • Severity: High</small>
                <p className="mb-0 mt-1">Provide vendor confirmation for seat counts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
        <div className="col-md-12">
      {/* Attachments */}
      <div className="card mb-3 ">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Attachments</h5>
          <div className="row ms-0">
          <div className="col-md-4 me-3 border rounded p-2 mb-2 bg-white">
            <h6 className="text-success">Execution Summary</h6>
            <p className="mb-1">audit_exec_summary.pdf</p>
            <small className="text-muted">Added by Jane • Sep 14</small>
          </div>
          <div className="col-md-4 border rounded p-2 ms-3 mb-2 bg-white">
            <h6 className="text-success">Evidence</h6>
            <p className="mb-1">evidence_summary.pdf</p>
            <small className="text-muted">Generated Sep 14</small>
          </div>
            </div>        
      
          <h5 className="fs-4 mt-3">Sign-off Routing</h5>
          <div className="row">
          <div className="mb-2 col-md-4">
            <label className="form-label">Approver</label>
            <input type="text" className="form-control" placeholder="Compliance Lead"  />
          </div>
          <div className="mb-2 col-md-4">
            <label className="form-label">Co-Approver</label>
            <input type="text" className="form-control" placeholder="IT Manager"  />
          </div>
          <div className="mb-2 col-md-4">
            <label className="form-label">Effective Date</label>
            <input type="text" className="form-control" placeholder="Sep 15, 2025"  />
          </div>
          <div className="mb-2 col-md-4">
            <label className="form-label">Require Evidence</label>
            <input type="text" className="form-control" placeholder="Yes"  />
          </div>
        </div>
        </div>
      </div>
    </div>
      {/* Reviewer Notes */}
      <div className="card mb-3 ">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Reviewer Notes</h5>
          <textarea className="form-control" rows="3" placeholder="Summarize decisions, policy references, and remediation guidance."></textarea>
        </div>
      </div>

      {/* Export & Next Steps */}
      <div className="card mb-3">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Export & Next Steps</h5>
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Report Type</label>
              <input type="text" className="form-control" value="Review Summary" readOnly />
            </div>
            <div className="col-md-4">
              <label className="form-label">Include Findings</label>
              <input type="text" className="form-control" value="All (Open + Closed)" readOnly />
            </div>
            <div className="col-md-4">
              <label className="form-label">Distribution</label>
              <input type="text" className="form-control" value="Stakeholders" readOnly />
            </div>
          </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
          <button type="button" className="btn btn-secondary" onClick={handleBack}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <button type="submit" className="btn btn-success" onClick={handleContinue}>
            Continue to Close <i className="bi bi-arrow-right"></i>
          </button>
        </div>
        </div>
      </div>
    </div>

    {/* === Right Column === */}
    
  </div>
        
      </div>
    </div>
  );
}