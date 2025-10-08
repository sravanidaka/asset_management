import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUserCircle, FaSignOutAlt, FaBell, FaCog, FaChevronDown } from "react-icons/fa";
import { Dropdown, Badge, Avatar } from "antd";

const Header = ({ handleLogout, user = { name: "John Doe", }, onToggleSidebar }) => {
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
    <header className="bg-white border-bottom shadow-sm py-2 px-4 sticky-top" style={{ 
      width: '100vw', 
      marginLeft: 'calc(-50vw + 50%)', 
      marginRight: 'calc(-50vw + 50%)',
      zIndex: 999, /* Lower z-index than sidebar */
      position: 'sticky',
      top: 0,
      left: 0,
      right: 0,
      height: '60px', /* Fixed height for consistency */
      minHeight: '60px',
      backgroundColor: '#ffffff'
    }}>
      <div className="container-fluid d-flex justify-content-between align-items-center" style={{ paddingLeft: '300px', paddingRight: 0 }}>
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn d-none" 
          onClick={onToggleSidebar}
        >
          ☰
        </button>
        
        {/* Logo / Title */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex flex-column">
            <h1 className="h5 mb-0 fw-bold text-dark">Asset Management </h1>
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
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'transparent',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                border: '2px solid #e9ecef'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#28a745';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#e9ecef';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <Badge count={notifications.length} size="small">
                <FaBell size={16} style={{ color: '#495057' }} />
              </Badge>
            </div>
          </Dropdown>

          {/* User Profile Dropdown */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div 
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f8f9fa',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '2px solid #e9ecef'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e9ecef';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.borderColor = '#28a745';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.transform = 'scale(1)';
                e.target.style.borderColor = '#e9ecef';
              }}
            >
              <Avatar 
                size={24} 
                icon={<FaUserCircle />} 
                style={{ color: '#495057' }}
              />
            </div>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
