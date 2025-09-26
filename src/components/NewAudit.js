import React, { useState } from "react";

export default function NewAudit({ setActiveScreen }) {
  const [auditDetails, setAuditDetails] = useState({
    title: "",
    policy: "",
    auditType: "Internal",
    assignedTo: "",
    dueDate: "",
    scope: "All Sites",
    description: "",
  });
  const [checklistItems, setChecklistItems] = useState([
    { item: "Asset Tagging", control: "ITAM-CTRL-01", owner: "IT Ops", required: true, attachment: false },
    { item: "Access Reviews", control: "SECU-CTRL-08", owner: "Security", required: true, attachment: true },
    { item: "License Compliance", control: "SOFT-LIC-03", owner: "Procurement", required: false, attachment: false },
  ]);
  const [linkedPolicies, setLinkedPolicies] = useState([
    { policy: "Data Privacy Regulation", type: "Regulatory", status: "Compliant", lastAudit: "2024-07-10", owner: "Legal" },
    { policy: "Internal Security Policy", type: "Internal", status: "Non-Compliant", lastAudit: "2024-07-05", owner: "Security" },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAuditDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Audit created:", auditDetails, checklistItems, linkedPolicies);
    // Add logic to save audit data if needed
    setActiveScreen('audit-plan'); // Redirect to Audit Plan page
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-4">New Audit</h2>
      <div className="card custom-shadow mb-1">
        <h5 className="fs-4">Audit Details</h5>
        <form id="auditForm" onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Audit Title</label>
            <input
              type="text"
              name="title"
              value={auditDetails.title}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Q3 Compliance Audit"
            />
          </div>
          <div className="col-md-4">
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
          <div className="col-md-4">
            <label className="form-label">Audit Type</label>
            <input
              type="text"
              name="auditType"
              value={auditDetails.auditType}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Internal"
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Assigned To</label>
            <input
              type="text"
              name="assignedTo"
              value={auditDetails.assignedTo}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Compliance Team"
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
          <div className="col-md-4">
            <label className="form-label">Scope</label>
            <input
              type="text"
              name="scope"
              value={auditDetails.scope}
              onChange={handleInputChange}
              className="form-control"
              placeholder="All Sites"
            />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={auditDetails.description}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Brief summary of audit objectives and scope."
            ></textarea>
          </div>
        </form>
      </div>

      <div className="card shadow-sm mt-4">
        <h5 className="fs-4">Checklist Items</h5>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Item</th>
              <th>Control</th>
              <th>Owner</th>
              <th>Required</th>
              <th>Attachment</th>
            </tr>
          </thead>
          <tbody>
            {checklistItems.map((item, index) => (
              <tr key={index}>
                <td>{item.item}</td>
                <td>{item.control}</td>
                <td>{item.owner}</td>
                <td>{item.required ? "Yes" : "No"}</td>
                <td>{item.attachment ? "Required" : "Optional"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn" onClick={() => setActiveScreen('compliance')}>
            Cancel
          </button>
          <button type="submit" className="btn" form="auditForm">
            Create Audit
          </button>
        </div>
      </div>

      <div className="card shadow-sm mt-4">
        <h4 className="fs-4">Linked Policies</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Policy</th>
              <th>Type</th>
              <th>Status</th>
              <th>Last Audit</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {linkedPolicies.map((policy, index) => (
              <tr key={index}>
                <td>{policy.policy}</td>
                <td>{policy.type}</td>
                <td>{policy.status}</td>
                <td>{policy.lastAudit}</td>
                <td>{policy.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}