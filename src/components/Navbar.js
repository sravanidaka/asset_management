import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("token"); // clear token
    navigate("/login");
  };

  return (
    <div className="app-layout d-flex">
      {/* Sidebar */}
      <aside className="sidebar p-3">
        <h2>Asset Management</h2>
        <nav className="nav flex-column">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/register" className="nav-link">Regiscjvhcdjgvhdjghdfjkghdkgdkhgkdgkdhgkhjter</Link>
          <Link to="/addnew" className="nav-link">Add New</Link>
          <Link to="/procure" className="nav-link">Procure</Link>
          <Link to="/allocate" className="nav-link">Allocate</Link>
          <Link to="/transfer" className="nav-link">Transfer</Link>
          <Link to="/financial" className="nav-link">Financial</Link>
          <Link to="/disposal" className="nav-link">Disposal</Link>
          <Link to="/reports" className="nav-link">Reports</Link>
          <Link to="/financials" className="nav-link">Financials</Link>
          <Link to="/compliance" className="nav-link">Compliance</Link>
          <Link to="/disposalreport" className="nav-link">Disposal Report</Link>
          <Link to="/settings" className="nav-link">Settings</Link>
          <Link to="/requests" className="nav-link">Requests</Link>
          <Link to="/service-log" className="nav-link">Service Log</Link>
          <Link to="/schedule" className="nav-link">Schedule</Link>
          <Link to="/history" className="nav-link">History</Link>
          <Link to="/user" className="nav-link">User</Link>
          <Link to="/roles" className="nav-link">Roles</Link>
          <button onClick={handleLogout} className="btn btn-danger mt-3">
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1 p-4">{children}</main>
    </div>
  );
};


export default Navbar;
