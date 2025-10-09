import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaShoppingCart, FaHandHolding, FaTruck, FaDollarSign,
  FaTrash, FaClipboardCheck, FaWrench, FaCalendarAlt, FaHistory,
  FaChartLine, FaCashRegister, FaShieldAlt, FaFileAlt, FaCog,
  FaBuilding, FaBoxes, FaStore, FaTools, FaChartBar,
  FaChevronDown, FaChevronRight, FaUsers, FaUserShield
} from 'react-icons/fa';

function Sidebar({ activeScreen, handleNavClick, handleLogout, isOpen = true, collapsed = false }) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    'Assets': true,
    'Vendors': true,
    'Maintenance': true,
    'Reports & Settings': true,
    'User Management': true
  });

  const navigationSections = [
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
      items: [{ key: 'ManageVendor', label: 'Manage Vendor', icon: FaBuilding }]
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
      ]
    },
    {
      section: 'User Management',
      sectionIcon: FaUsers,
      items: [
        { key: 'user', label: 'User', icon: FaUsers },
        { key: 'roles', label: 'Roles', icon: FaUserShield },
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
    <aside
      className={`af-sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}
      style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        borderRight: '1px solid #ddd',
        transition: 'width 0.3s ease',
        width: collapsed ? '80px' : '260px',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000
      }}
    >
      {/* Header */}
      <div className="sidebar-header text-center py-3" style={{ flexShrink: 0, borderBottom: '1px solid #eee' }}>
        {collapsed ? (
          <img
            src="/greenlantern-logo.png"
            alt="Logo"
            style={{ width: '40px', height: '40px', objectFit: 'contain' }}
          />
        ) : (
          <img
            src="/greenlantern-logo.png"
            alt="Logo"
            style={{ width: '180px', height: '50px', objectFit: 'contain' }}
          />
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex-column mt-3"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 10px 20px 10px',
        }}
      >
        {/* Dashboard always visible */}
        <Link
          to="/dashboard"
          onClick={() => handleNavClick('dashboard')}
          className={`d-flex align-items-center ${collapsed ? 'justify-content-center' : 'gap-2'} px-3 py-2 text-decoration-none`}
          style={{
            background: location.pathname === '/dashboard' || location.pathname === '/' ? '#e0f3e7' : 'transparent',
            color: location.pathname === '/dashboard' || location.pathname === '/' ? '#1a7f49' : '#555',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '15px',
            transition: 'all 0.2s ease',
            marginBottom: '10px'
          }}
          title={collapsed ? 'Dashboard' : undefined}
        >
          <FaHome size={collapsed ? 22 : 16} />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {/* Collapsible Sections */}
        {navigationSections.map((section, index) => (
          <div key={index} className="nav-section mb-2">
            {section.section && !collapsed && (
              <div
                className="af-section-title d-flex align-items-center justify-content-between px-2 py-2"
                onClick={() => toggleSection(section.section)}
                style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  color: '#444',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  {section.sectionIcon && <section.sectionIcon size={14} />}
                  <span>{section.section}</span>
                </div>
                {expandedSections[section.section] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
              </div>
            )}

            <div
              className={`nav-dropdown ${expandedSections[section.section] ? 'show' : 'hide'}`}
              style={{
                maxHeight: expandedSections[section.section] ? '400px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
                ...(collapsed && {
                  maxHeight: 'none',
                  overflow: 'visible',
                  display: 'block'
                })
              }}
            >
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === `/${item.key}`;
                return (
                  <Link
                    key={item.key}
                    to={`/${item.key}`}
                    onClick={() => handleNavClick(item.key)}
                    className={`d-flex align-items-center ${collapsed ? 'justify-content-center' : 'gap-2'} px-3 py-2 text-decoration-none`}
                    style={{
                      background: isActive ? '#e0f3e7' : 'transparent',
                      color: isActive ? '#1a7f49' : '#555',
                      borderRadius: '6px',
                      fontSize: '14px',
                      marginTop: '4px',
                      transition: 'all 0.2s ease',
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={collapsed ? 20 : 16} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
