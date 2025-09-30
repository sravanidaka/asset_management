import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const Header = ({ handleLogout }) => {
  const currentDate = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <header className="bg-dark text-white shadow-sm py-3 px-4 sticky-top">
      <div className="d-flex justify-content-between align-items-center">
        {/* Logo / Title */}
        <div className="d-flex flex-column">
          <h1 className="h4 mb-1 fw-bold">Asset Management System</h1>
          <small className="text-light">{currentDate} IST</small>
        </div>

        {/* User Info & Logout */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2  rounded-pill px-3 py-1 shadow-sm">
            <FaUserCircle size={24} />
            <span className="fw-semibold">John Doe</span>
          </div>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 rounded-pill shadow-sm"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
