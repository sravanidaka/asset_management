import React, { useState } from 'react';

const Schedule = () => {
  const [asset, setAsset] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [location, setLocation] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [vendor, setVendor] = useState('');
  const [notification, setNotification] = useState('');

  return (
    <div className="container p-1">
      <h2 className="mb-1 ">Schedule</h2>
      <p className="mt-0">Plan and manage asset schedules.</p>
      <div className="card ">
        <div className="card-body">
          <h5 className="fs-4 mb-3">Maintenance Details</h5>
          <h5 className="mb-3">Asset Information</h5>

          {/* Asset Info */}
          
           <div className="col-md-12">
              <label className="form-label">Asset ID</label>
              <select className="form-select">
                <option>Select ID</option>
                <option>AST-001</option>
                <option>AST-002</option>
                <option>AST-003</option>
              </select>
            </div>
          {/* Maintenance Details */}
          <h3 className="mt-3">Maintenance Details</h3>
          <div className="col-md-12 mt-2">
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
          <div className="form-label mt-2">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Enter maintenance description"
            ></textarea>
          </div>

          {/* Scheduling & Assignment */}
          <h5 className="mt-3">Scheduling & Assignment</h5>
          <div className="row mt-2">
            <div className="col-md-4 mt-2">
              <label className="form-label">Scheduled Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={scheduledDate} 
                onChange={(e) => setScheduledDate(e.target.value)} 
              />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Due Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
              />
            </div>
             <div className="col-md-4 mt-2">
              <label className="form-label">Priority</label>
              <select className="form-select">
                <option>Select</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Assigned To</label>
              <input 
                type="text" 
                className="form-control" 
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)} 
                placeholder="e.g., Mechanic Team" 
              />
            </div>
          </div>

          {/* Additional Settings */}
          <h3 className="mt-2">Additional Settings</h3>
          <div className="row mb-3">
            <div className="col-md-4 mt-2">
              <label className="form-label">Location</label>
              <input 
                type="text" 
                className="form-control" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)} 
                placeholder="Enter location" 
              />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Estimated Cost</label>
              <input 
                type="text" 
                className="form-control" 
                value={estimatedCost} 
                onChange={(e) => setEstimatedCost(e.target.value)} 
                placeholder="e.g., 250" 
              />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Vendor</label>
              <input 
                type="text" 
                className="form-control" 
                value={vendor} 
                onChange={(e) => setVendor(e.target.value)} 
                placeholder="Select vendor" 
              />
            </div>
            <div className="col-md-4 mt-2">
              <label className="form-label">Notification</label>
              <input 
                type="text" 
                className="form-control" 
                value={notification} 
                onChange={(e) => setNotification(e.target.value)} 
                placeholder="Email + In-app" 
              />
            </div>
          </div>

          {/* Attachments */}
          <h3 className="mb-3">Attachments</h3>
          <div className="form-group mt-2">
            <label className="form-label">Upload</label>
            <input type="file" className="form-control" />
            {/* <small className="form-text text-muted">Drop files or browse</small> */}
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end">
            <button className="btn me-2">Cancel</button>
            <button className="btn ">Save Maintenance</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;