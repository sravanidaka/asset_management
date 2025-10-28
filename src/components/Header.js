import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaUserCircle, FaSignOutAlt, FaBell, FaCog, FaChevronDown, FaBars, FaHome } from "react-icons/fa";
import { Dropdown, Badge, Avatar, Breadcrumb, Modal } from "antd";
import { useLocation } from "react-router-dom";

const Header = ({ handleLogout, user = { name: "John Doe", }, onToggleSidebar, sidebarCollapsed }) => {
  const location = useLocation();
  const [notifications] = useState([
    { id: 1, message: "New asset request pending approval", time: "2 min ago" },
    { id: 2, message: "Maintenance scheduled for tomorrow", time: "1 hour ago" },
    { id: 3, message: "System backup completed", time: "3 hours ago" },
  ]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handle logout confirmation
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // Generate breadcrumb items based on current path
  const generateBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbItems = [
      {
        title: (
          <span className="d-flex align-items-center gap-1">
            <FaHome size={12} />
            <span>Home</span>
          </span>
        ),
        href: '/'
      }
    ];

    // Map path segments to readable names
    const pathNames = {
      'dashboard': 'Dashboard',
      'register': 'Register',
      'procure': 'Procure',
      'allocate': 'Allocate',
      'transfer': 'Transfer',
      'financial': 'Financial',
      'disposal': 'Disposal',
      'asset-history': 'Asset History',
      'asset-history-detail': 'Asset History Detail',
      'ManageVendor': 'Manage Vendor',
      'requests': 'Requests',
      'service-log': 'Service Log',
      'schedule': 'Schedule',
      'history': 'History',
      'reports': 'Reports',
      'financials': 'Financials',
      'compliance': 'Compliance',
      'disposalreport': 'Disposal Report',
      'settings': 'Settings',
      'user': 'User',
      'roles': 'Roles',
      'module': 'Module'
    };

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      breadcrumbItems.push({
        title: pathNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : `/${pathSegments.slice(0, index + 1).join('/')}`
      });
    });

    return breadcrumbItems;
  };

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
      onClick: handleLogoutClick,
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
    <header className="bg-white border-bottom shadow-sm py-2 px-4 sticky-top header-main">
      <div className={`container-fluid d-flex justify-content-between align-items-center header-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Left Side - Hamburger Menu & Logo/Title */}
        <div className="d-flex align-items-center gap-3">
          {/* Simple Hamburger Menu Button */}
          <button 
            className="hamburger-button"
            onClick={onToggleSidebar}
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
          
          {/* Title */}
          <div className="d-flex flex-column">
            <h1 className="h5 mb-0 fw-bold text-dark">Asset Management</h1>
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
            <div className="d-flex align-items-center justify-content-center notification-icon">
              <Badge count={notifications.length} size="small">
                <FaBell size={16} className="bell-icon" />
              </Badge>
            </div>
          </Dropdown>

          {/* User Profile Dropdown */}
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className="d-flex align-items-center gap-2 user-profile-container">
              <Avatar 
                size={24} 
                icon={<FaUserCircle />} 
                className="avatar-icon"
              />
              <div className="d-flex flex-column">
                <span className="fw-semibold text-dark user-name">
                  {user.name || 'Admin'}
                </span>
                <span className="text-muted user-role">
                  Administrator
                </span>
              </div>
              <FaChevronDown size={10} className="chevron-icon" />
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center gap-2">
            <FaSignOutAlt className="text-danger" />
            <span>Confirm Logout</span>
          </div>
        }
        open={showLogoutModal}
        onOk={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        okText="Yes, Logout"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          style: { backgroundColor: '#dc3545', borderColor: '#dc3545' }
        }}
        cancelButtonProps={{
          style: { borderColor: '#6c757d', color: '#6c757d' }
        }}
        centered
        width={400}
      >
        <div className="text-center py-3">
          <div className="mb-3">
            <FaSignOutAlt size={48} className="text-danger" />
          </div>
          <h5 className="mb-2">Are you sure you want to logout?</h5>
          <p className="text-muted mb-0">
            You will be redirected to the login page and will need to sign in again to access the system.
          </p>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
