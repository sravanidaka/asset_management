import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUserCircle, FaSignOutAlt, FaBell, FaCog, FaChevronDown } from "react-icons/fa";
import { Dropdown, Badge, Avatar } from "antd";

const Header = ({ handleLogout, user = { name: "John Doe", } }) => {
  const [notifications] = useState([
    { id: 1, message: "New asset request pending approval", time: "2 min ago" },
    { id: 2, message: "Maintenance scheduled for tomorrow", time: "1 hour ago" },
    { id: 3, message: "System backup completed", time: "3 hours ago" },
  ]);

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

  // User dropdown menu
  const userMenuItems = [
    {
      key: "profile",
      label: (
        <div className="d-flex align-items-center gap-2">
          <FaUserCircle />
          <span>Profile</span>
        </div>
      ),
    },
    {
      key: "settings",
      label: (
        <div className="d-flex align-items-center gap-2">
          <FaCog />
          <span>Settings</span>
        </div>
      ),
      
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <div className="d-flex align-items-center gap-2 text-danger">
          <FaSignOutAlt />
          <span>Logout</span>
        </div>
      ),
      onClick: handleLogout,
    },
  ];

  // Notifications dropdown menu
  const notificationItems = [
    {
      key: "header",
      label: (
        <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
          <span className="fw-bold">Notifications</span>
          <Badge count={notifications.length} size="small" />
        </div>
      ),
      type: "group",
    },
    ...notifications.map((notification) => ({
      key: notification.id,
      label: (
        <div className="p-2" style={{ minWidth: "300px" }}>
          <div className="fw-semibold">{notification.message}</div>
          <small className="text-muted">{notification.time}</small>
        </div>
      ),
    })),
    {
      type: "divider",
    },
    {
      key: "view-all",
      label: (
        <div className="text-center p-2">
          <span className="text-primary">View All Notifications</span>
        </div>
      ),
    },
  ];

  return (
    <header className="bg-dark border-bottom shadow-sm py-3 px-4 sticky-top" style={{ 
      width: '100vw', 
      marginLeft: 'calc(-50vw + 50%)', 
      marginRight: 'calc(-50vw + 50%)',
      zIndex: 1000,
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0
    }}>
      <div className="container-fluid d-flex justify-content-between align-items-center" style={{ paddingLeft: 0, paddingRight: 0 }}>
        {/* Logo / Title */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex flex-column">
            <h1 className="h5 mb-0 fw-bold text-white">Asset Management System</h1>
            {/* <small className="text-light">{currentDate} IST</small> */}
          </div>
        </div>

        {/* Right Side - Notifications & User */}
        <div className="d-flex align-items-center gap-3">
          {/* Notifications */}
          <Dropdown
            menu={{ items: notificationItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <button className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 rounded-pill">
              <Badge count={notifications.length} size="small">
                <FaBell size={16} />
              </Badge>
            </button>
          </Dropdown>

          {/* User Profile Dropdown */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className="d-flex align-items-center gap-2 btn btn-outline-light rounded-pill px-3 py-2 border-0 bg-light">
              <Avatar 
                size={32} 
                icon={<FaUserCircle />} 
                className="bg-primary"
              />
              <div className="d-flex flex-column align-items-start">
                <span className="fw-semibold text-dark small">{user.name}</span>
                <small className="text-muted">{user.role}</small>
              </div>
              <FaChevronDown size={12} className="text-muted" />
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
