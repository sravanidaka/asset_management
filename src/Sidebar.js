import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlus, FaShoppingCart, FaHandHolding, FaTruck, FaDollarSign, FaTrash, FaClipboardCheck, FaWrench, FaCalendarAlt, FaHistory, FaChartLine, FaCashRegister, FaShieldAlt, FaFileAlt, FaCog, FaUser, FaSignOutAlt, FaBuilding, FaCubes } from 'react-icons/fa';

function Sidebar({ activeScreen, handleNavClick, handleLogout }) {
  const location = useLocation();
  const navigationItems = [
    {
      section: null,
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: FaHome }
      ]
    },
    {
      section: 'Assets',
      items: [
        { key: 'register', label: 'Register', icon: FaFileAlt },
        { key: 'procure', label: 'Procure', icon: FaShoppingCart },
        { key: 'allocate', label: 'Allocate', icon: FaHandHolding },
        { key: 'transfer', label: 'Transfer', icon: FaTruck },
        { key: 'financial', label: 'Financial', icon: FaDollarSign },
        { key: 'disposal', label: 'Disposal', icon: FaTrash }
      ]
    },
    {
      section: 'Vendors',
      items: [
        { key: 'ManageVendor', label: 'Manage Vendor', icon: FaBuilding },
      ]
    },

    {
      section: 'Maintenance',
      items: [
        { key: 'requests', label: 'Requests', icon: FaClipboardCheck },
        { key: 'service-log', label: 'Service Log', icon: FaWrench },
        { key: 'schedule', label: 'Schedule', icon: FaCalendarAlt },
        { key: 'history', label: 'History', icon: FaHistory }
      ]
    },
    {
      section: 'Reports & Settings',
      items: [
        { key: 'reports', label: 'Reports', icon: FaChartLine },
        { key: 'financials', label: 'Financials', icon: FaCashRegister },
        { key: 'compliance', label: 'Compliance', icon: FaShieldAlt },
        { key: 'disposalreport', label: 'Disposal Report', icon: FaFileAlt },
        { key: 'settings', label: 'Settings', icon: FaCog },
         { key: 'user', label: 'User', icon: FaUser },
        // { key: 'roles', label: 'Roles', icon: FaUser }
      ]
    }
  ];

  return (
    <aside className="col-12 col-md-2 col-2 af-sidebar p-3">
      {/* Header */}
      <div className="sidebar-header">
        <div className="d-flex align-items-center">
          <img 
            src="/greenlantern-logo.png" 
            alt="Asset Management Logo" 
            className="af-brand-logo"
            style={{ width: '200px', height: '60px', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav flex-column af-nav">
        {navigationItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.section && (
              <div className="af-section-title">{section.section}</div>
            )}
            {section.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === `/${item.key}` || (item.key === 'dashboard' && location.pathname === '/');
              return (
                <Link
                  key={item.key}
                  to={`/${item.key}`}
                  className={`nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.key)}
                >
                  <IconComponent />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Logout */}
        
      </nav>
    </aside>
  );
}

export default Sidebar;