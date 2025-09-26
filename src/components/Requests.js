import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaSearch, FaDownload, FaEye, FaEdit } from "react-icons/fa";
import '../App.css';

const Requests = () => {
  const [maintenanceData] = useState([
    { id: 'MNT-001', asset: 'Company Van (AST-003)', type: 'Preventive', scheduled: '2024-07-01', due: '2024-07-05', status: 'In Progress', priority: 'High', assigned: 'Mechanic Team' },
    { id: 'MNT-002', asset: 'Dell XPS 15 (AST-001)', type: 'Repair', scheduled: '2024-06-20', due: '2024-06-25', status: 'Completed', priority: 'Medium', assigned: 'IT Support' },
    { id: 'MNT-003', asset: 'Forklift (AST-005)', type: 'Scheduled Inspection', scheduled: '2024-07-10', due: '2024-07-10', status: 'Scheduled', priority: 'Low', assigned: 'Safety Officer' },
    { id: 'MNT-004', asset: 'Office Printer (AST-007)', type: 'Maintenance', scheduled: '2024-07-15', due: '2024-07-20', status: 'In Progress', priority: 'Medium', assigned: 'IT Support' },
    { id: 'MNT-005', asset: 'Delivery Truck (AST-009)', type: 'Repair', scheduled: '2024-07-25', due: '2024-07-30', status: 'Scheduled', priority: 'High', assigned: 'Mechanic Team' },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = maintenanceData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Maintenance/Requests</h2>
      <p className="mt-0">Log and track maintenance requests.</p>

      <div className="card shadow-sm">
      
          <div className="d-flex justify-content-end gap-2">
            <button className="btn btn-add px-4">
              <i className="bi bi-plus-circle me-2"></i>
              Schedule New Maintenance
            </button>
            <button className="btn export-btn px-4">
              <i className="bi bi-download me-2"></i>
              Export
            </button>
          </div>
        

        <div className="card-body mt-4">
          <div className="table-responsive">
            <table className="table shadow-md table-bordered table-hover align-middle mb-0">
              <thead className="table-light ">
                <tr>
                  <th>Maintenance ID</th>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Scheduled Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.id}</strong></td>
                    <td>{item.asset}</td>
                    <td>{item.type}</td>
                    <td>{item.scheduled}</td>
                    <td>{item.due}</td>
                    <td>
                      <span className={`badge ${item.status === 'In Progress' ? 'bg-warning' : item.status === 'Completed' ? 'bg-success' : 'bg-info'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.priority === 'High' ? 'bg-danger' : item.priority === 'Medium' ? 'bg-warning' : 'bg-secondary'}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td>{item.assigned}</td>
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

        
          <nav>
            <ul className="pagination pagination-sm mb-0 d-flex justify-content-center gap-2">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link btn btn-add px-4" onClick={() => paginate(currentPage - 1)}>
                  <i className="bi bi-chevron-left ms-1"></i> Previous
                </button>
              </li>
              <li className="page-item">
                <span className="page-link">Page {currentPage} of {Math.ceil(maintenanceData.length / itemsPerPage)}</span>
              </li>
              <li className={`page-item ${currentPage === Math.ceil(maintenanceData.length / itemsPerPage) ? 'disabled' : ''}`}>
                <button className="page-link btn btn-add px-4" onClick={() => paginate(currentPage + 1)}>
                  Next <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </li>
            </ul>
          </nav>
        
      </div>
    </div>
  );
};

export default Requests;