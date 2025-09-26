import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';

const ServiceLog = () => {
  const [assetId, setAssetId] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [nextScheduledDate, setNextScheduledDate] = useState('');
  const [vendorTechnician, setVendorTechnician] = useState('');
  const [costIncurred, setCostIncurred] = useState('');
  const [downtime, setDowntime] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Maintenance/Service Call Log</h2>
      <p className="mt-0">Track maintenance, repairs, AMC, calibration, etc.</p>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row mb-3">
           
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
              <label className="form-label">Maintenance Type</label>
              <select
                className="form-select"
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="1">Preventive</option>
                <option value="2">Corrective</option>
                <option value="3">Calibration</option>
                <option value="4">AMC</option>
              </select>
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Service Date</label>
              <input
                type="date"
                className="form-control"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="form-label">Next Scheduled Date</label>
            <input
              type="date"
              className="form-control"
              value={nextScheduledDate}
              onChange={(e) => setNextScheduledDate(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <label className="form-label">Vendor / Technician</label>
            <input
              type="text"
              className="form-control"
              value={vendorTechnician}
              onChange={(e) => setVendorTechnician(e.target.value)}
              placeholder="Enter Vendor or Technician Name"
            />
          </div>
          <div className="row ">
            <div className="col-md-4 mt-2">
              <label className="form-label">Cost Incurred</label>
              <input
                type="number"
                className="form-control"
                value={costIncurred}
                onChange={(e) => setCostIncurred(e.target.value)}
                placeholder="Enter Cost"
              />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Downtime (hours)</label>
              <input
                type="number"
                className="form-control"
                value={downtime}
                onChange={(e) => setDowntime(e.target.value)}
                placeholder="Enter Downtime"
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Service Notes</label>
            <textarea
              className="form-control"
              rows="4"
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              placeholder="Add any relevant service notes..."
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="form-label">Attachments (Service Reports / Bills)</label>
            <input type="file" className="form-control" />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn cancel-btn px-4">Cancel</button>
            <button className="btn save-btn px-4">Save Log</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceLog;