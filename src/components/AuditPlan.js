import React, { useState } from "react";

export default function AuditPlan({ setActiveScreen }) {
  const [auditDetails, setAuditDetails] = useState({
    title: "Q3 Compliance Audit",
    policy: "",
    auditType: "Internal",
    scope: "All Sites",
    startDate: "",
    dueDate: "",
    description: "Brief summary of audit objectives and scope.",
  });
  const [checklistItems] = useState([
    { item: "Asset Tagging", control: "ITAM-CTRL-01", sampling: "20 assets", owner: "IT Ops", required: true },
    { item: "Access Reviews", control: "SECU-CTRL-08", sampling: "All users", owner: "Security", required: true },
    { item: "License Compliance", control: "SOFT-LIC-03", sampling: "Top 10 apps", owner: "Procurement", required: false },
  ]);
  const [timeline] = useState({
    preAudit: { duration: "1 week", tasks: "Notify stakeholders, finalize checklist" },
    execution: { duration: "2 weeks", tasks: "Collect evidence, sample assets" },
    closure: { duration: "3 days", tasks: "Report, approvals, archive" },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAuditDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = (e) => {
    e.preventDefault();
    console.log("Audit plan continued:", auditDetails, checklistItems, timeline);
    // Redirect to AssignTeam page
    setActiveScreen('assign-team');
  };

  const handleBack = () => {
    console.log("Going back to previous screen");
    // Add logic to navigate back (e.g., to NewAudit or Compliance screen)
    setActiveScreen('new-audit'); // Example: Navigate back to NewAudit
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Audit Plan</h2>
      <div className="card custom-shadow mt-4">
        <nav className="nav d-flex justify-content-between align-items-center mb-3" style={{ backgroundColor: '#f8f9fa', padding: '5px', borderRadius: '5px' }}>
          <a href="#" className="nav-link active" style={{ color: '#28a745', fontWeight: 'bold' }}>
            <i className="bi bi-clipboard-check"></i> Plan
          </a>
          <a href="#" className="nav-link" style={{ color: '#6c757d', fontWeight: 'bold' }}>
            <i className="bi bi-person-plus"></i> Assign
          </a>
          <a href="#" className="nav-link" style={{ color: '#6c757d', fontWeight: 'bold' }}>
            <i className="bi bi-play-circle"></i> Execute
          </a>
          <a href="#" className="nav-link" style={{ color: '#6c757d', fontWeight: 'bold' }}>
            <i className="bi bi-eye"></i> Review
          </a>
          <a href="#" className="nav-link" style={{ color: '#6c757d', fontWeight: 'bold' }}>
            <i className="bi bi-x-circle"></i> Close
          </a>
        </nav>

        <h5 className="fs-4 mb-4 ">Audit Metadata</h5>
        <form onSubmit={handleContinue} className="row g-3">
          <div className="col-md-4 mt-2">
            <label className="form-label">Audit Title</label>
            <input
              type="text"
              name="title"
              value={auditDetails.title}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Policy</label>
            <input
              type="text"
              name="policy"
              value={auditDetails.policy}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Select policy"
            />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Audit Type</label>
            <input
              type="text"
              name="auditType"
              value={auditDetails.auditType}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Scope</label>
            <input
              type="text"
              name="scope"
              value={auditDetails.scope}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={auditDetails.startDate}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={auditDetails.dueDate}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={auditDetails.description}
              onChange={handleInputChange}
              className="form-control"
            ></textarea>
          </div>
        </form>
      </div>

      <div className="card custom-shadow mt-4">
        <h4 className="fs-4">Checklist & Sampling</h4>
        <table className="table table-bordered mt-2">
          <thead>
            <tr>
              <th>Item</th>
              <th>Control</th>
              <th>Sampling</th>
              <th>Owner</th>
              <th>Required</th>
            </tr>
          </thead>
          <tbody>
            {checklistItems.map((item, index) => (
              <tr key={index}>
                <td>{item.item}</td>
                <td>{item.control}</td>
                <td>{item.sampling}</td>
                <td>{item.owner}</td>
                <td>{item.required ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-muted small">Note: You can adjust sampling later during execution.</p>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={handleBack}>
            <i className="bi bi-arrow-left"></i> Back
          </button>
          <button type="submit" className="btn btn-success" onClick={handleContinue}>
            Continue to Assign <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <h4 className="fs-4">Timeline Preview</h4>
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card bg-light p-2">
              <h6><i className="bi bi-clock"></i> Pre-Audit</h6>
              <p>{timeline.preAudit.duration}</p>
              <p>{timeline.preAudit.tasks}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-light p-2">
              <h6><i className="bi bi-gear"></i> Execution</h6>
              <p>{timeline.execution.duration}</p>
              <p>{timeline.execution.tasks}</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-light p-2">
              <h6><i className="bi bi-check-circle"></i> Closure</h6>
              <p>{timeline.closure.duration}</p>
              <p>{timeline.closure.tasks}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}