import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaPlus, FaShoppingCart, FaHandHolding, FaTruck, FaDollarSign, FaTrash, FaClipboardCheck, FaWrench, FaCalendarAlt, FaHistory, FaChartLine, FaCashRegister, FaShieldAlt, FaFileAlt, FaCog, FaUser, FaSignOutAlt, FaBuilding, FaCubes, FaChevronDown, FaChevronRight, FaBoxes, FaStore, FaTools, FaChartBar } from 'react-icons/fa';

function Sidebar({ activeScreen, handleNavClick, handleLogout, isOpen = true }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    'Assets': true,
    'Vendors': true,
    'Maintenance': true,
    'Reports & Settings': true
  });

  const navigationItems = [
    {
      section: null,
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: FaHome }
      ]
    },
    {
      section: 'Assets',
      sectionIcon: FaBoxes,
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
      sectionIcon: FaStore,
      items: [
        { key: 'ManageVendor', label: 'Manage Vendor', icon: FaBuilding },
      ]
    },
    {
      section: 'Maintenance',
      sectionIcon: FaTools,
      items: [
        { key: 'requests', label: 'Requests', icon: FaClipboardCheck },
        { key: 'service-log', label: 'Service Log', icon: FaWrench },
        { key: 'schedule', label: 'Schedule', icon: FaCalendarAlt },
        { key: 'history', label: 'History', icon: FaHistory }
      ]
    },
    {
      section: 'Reports & Settings',
      sectionIcon: FaChartBar,
      items: [
        { key: 'reports', label: 'Reports', icon: FaChartLine },
        { key: 'financials', label: 'Financials', icon: FaCashRegister },
        { key: 'compliance', label: 'Compliance', icon: FaShieldAlt },
        { key: 'disposalreport', label: 'Disposal Report', icon: FaFileAlt },
        { key: 'settings', label: 'Settings', icon: FaCog },
        //{ key: 'user', label: 'User', icon: FaUser },
        // { key: 'roles', label: 'Roles', icon: FaUser }
      ]
    }
  ];

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  return (
    <aside className={`col-12 col-md-2 col-2 af-sidebar p-3 ${isOpen ? 'open' : ''}`}>
      {/* Header */}
      <div className="sidebar-header sticky-top">
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
          <div key={sectionIndex} className="nav-section">
            {section.section && (
              <div 
                className="af-section-title d-flex align-items-center justify-content-between"
                onClick={() => toggleSection(section.section)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div className="d-flex align-items-center gap-2">
                  {section.sectionIcon && <section.sectionIcon size={16} />}
                  <span>{section.section}</span>
                </div>
                {expandedSections[section.section] ? (
                  <FaChevronDown size={12} />
                ) : (
                  <FaChevronRight size={12} />
                )}
              </div>
            )}
            {section.section ? (
              <div 
                className={`nav-dropdown ${expandedSections[section.section] ? 'show' : 'hide'}`}
                style={{
                  maxHeight: expandedSections[section.section] ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease-in-out'
                }}
              >
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
            ) : (
              section.items.map((item) => {
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
              })
            )}
          </div>
        ))}

        {/* Logout */}
        {/*<div className="mt-auto">
          <button
            className="nav-link d-flex align-items-center gap-2 w-100"
            onClick={handleLogout}
            style={{
              color: '#dc3545',
              border: 'none',
              background: 'none',
              padding: '10px 15px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8d7da';
              e.target.style.color = '#721c24';
              e.target.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#dc3545';
              e.target.style.transform = 'translateX(0)';
            }}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>*/}
      </nav>
    </aside>
  );
}

export default Sidebar;
