import React, { useState } from "react";

export default function AssignTeam({ setActiveScreen }) {
  const [teamDetails, setTeamDetails] = useState({
    teamName: "",
    manager: "",
    members: "",
    department: "",
    location: "",
    contactEmail: "",
  });

  const [teamMembers] = useState([
    { name: "Jane Cooper", role: "Manager", email: "jane.cooper@example.com", status: "Active" },
    { name: "John Doe", role: "Auditor", email: "john.doe@example.com", status: "Active" },
    { name: "Alice Smith", role: "Reviewer", email: "alice.smith@example.com", status: "Pending" },
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeamDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveContinue = (e) => {
    e.preventDefault();
    console.log("Team assigned:", teamDetails, teamMembers);
    setActiveScreen("execute"); // Redirect to AuditExecute screen
  };

  const handleBack = () => {
    console.log("Going back to previous screen");
    setActiveScreen("audit-plan"); // Navigate back to AuditPlan
  };

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1 d-flex justify-content-between align-items-center">
        Assign Team
      </h2>

      {/* First Card */}
      <div className="card custom-shadow mt-4">
        {/* Steps Navigation */}
        <nav
          className="nav d-flex justify-content-between align-items-center mb-3"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "5px 10px",
            borderRadius: "5px",
          }}
        >
          <a href="#" className="nav-link" style={{ color: "#6c757d", fontWeight: "bold" }}>
            <i className="bi bi-clipboard-check me-1"></i> Plan
          </a>
          <a href="#" className="nav-link active" style={{ color: "#28a745", fontWeight: "bold" }}>
            <i className="bi bi-person-plus me-1"></i> Assign
          </a>
          <a href="#" className="nav-link" style={{ color: "#6c757d", fontWeight: "bold" }}>
            <i className="bi bi-play-circle me-1"></i> Execute
          </a>
          <a href="#" className="nav-link" style={{ color: "#6c757d", fontWeight: "bold" }}>
            <i className="bi bi-eye me-1"></i> Review
          </a>
          <a href="#" className="nav-link" style={{ color: "#6c757d", fontWeight: "bold" }}>
            <i className="bi bi-x-circle me-1"></i> Close
          </a>
        </nav>

        {/* Audit Context Form */}
        <h5 className="fs-4 ms-3 mt-3">Audit Context</h5>
        <form onSubmit={handleSaveContinue} className="row g-3 p-3">
          <div className="col-md-4 mt-2">
            <label className="form-label">Audit Title</label>
            <input
              type="text"
              name="teamName"
              value={teamDetails.teamName}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter Team Name"
            />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Policy</label>
            <input
              type="text"
              name="manager"
              value={teamDetails.manager}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter Manager Name"
            />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Scope</label>
            <input
              type="text"
              name="members"
              value={teamDetails.members}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter Member Names"
            />
          </div>

          {/* Role Requirements */}
          <h5 className="fs-4 mt-3">Role Requirements</h5>
          <div className="col-md-4 mt-2">
            <label className="form-label">Lead Auditor</label>
            <input type="text" name="leadAuditor" className="form-control" placeholder="Enter name" />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Reviewer</label>
            <input type="text" name="reviewer" className="form-control" placeholder="Enter name" />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Evidence Approver</label>
            <input type="text" name="evidenceApprover" className="form-control" placeholder="Enter name" />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Site Coordinators</label>
            <input type="text" name="siteCoordinators" className="form-control" placeholder="Enter name" />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Observers</label>
            <input type="text" name="observers" className="form-control" placeholder="Enter name" />
          </div>
          <div className="col-md-4 mt-2">
            <label className="form-label">Due Reminder</label>
            <select name="dueReminder" className="form-select">
              <option value="">Select reminder</option>
              <option value="1 day before">1 day before</option>
              <option value="3 days before">3 days before</option>
              <option value="5 days before">5 days before</option>
              <option value="1 week before">1 week before</option>
            </select>
          </div>
          <div className="col-md-12 mt-2">
            <label className="form-label">Assignment Notes</label>
            <input type="text" name="assignmentNotes" className="form-control" placeholder="Enter notes" />
          </div>
        </form>
      </div>

      {/* Second Card: Checklist Ownership */}
      <div className="card custom-shadow mt-4">
        <h4 className="fs-4 mt-2">Checklist Ownership</h4>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered align-middle mt-2">
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
                  <td>
                    <img
                      src="https://i.pravatar.cc/30?img=1"
                      alt="Cody Fisher"
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                    />
                    Cody Fisher
                  </td>
                  <td>Sep 14</td>
                  <td>
                    <span className="badge bg-light text-dark">High</span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">Unassigned</span>
                  </td>
                </tr>
                <tr>
                  <td>Access Reviews</td>
                  <td>
                    <img
                      src="https://i.pravatar.cc/30?img=2"
                      alt="Courtney Henry"
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                    />
                    Courtney Henry
                  </td>
                  <td>Sep 18</td>
                  <td>
                    <span className="badge bg-light text-dark">Medium</span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">Unassigned</span>
                  </td>
                </tr>
                <tr>
                  <td>License Compliance</td>
                  <td>
                    <img
                      src="https://i.pravatar.cc/30?img=3"
                      alt="Darrell Steward"
                      className="rounded-circle me-2"
                      width="30"
                      height="30"
                    />
                    Darrell Steward
                  </td>
                  <td>Sep 20</td>
                  <td>
                    <span className="badge bg-light text-dark">High</span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">Unassigned</span>
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Buttons */}
            <div className="col-12 d-flex justify-content-end mt-3">
              <button type="button" className="btn btn-secondary me-4" onClick={handleBack}>
                <i className="bi bi-arrow-left"></i> Back
              </button>
              <button type="submit" className="btn btn-success" onClick={handleSaveContinue}>
                Continue to Execute <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}