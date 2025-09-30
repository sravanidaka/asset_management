import React from 'react';

function Sidebar({ activeScreen, handleNavClick, handleLogout }) {
  return (
    <aside className="col-12 col-md-2 col-2 af-sidebar p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <span className="af-brand">Asset Management</span>
        <span
          className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center"
          style={{ width: 32, height: 32 }}
        >
          <i className="bi bi-grid-3x3-gap"></i>
        </span>
      </div>
      <nav className="nav flex-column af-nav">
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'dashboard' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('dashboard')}
        >
          <i className="bi bi-speedometer2"></i> <span>Dashboard</span>
        </a>

        <div className="af-section-title">Assets</div>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'register' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('register')}
        >
          <i className="bi bi-journal-text"></i> <span>Register</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'addnew' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('addnew')}
        >
          <i className="bi bi-plus-circle"></i> <span>Add New</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'procure' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('procure')}
        >
          <i className="bi bi-bag"></i> <span>Procure</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'allocate' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('allocate')}
        >
          <i className="bi bi-arrow-right-circle"></i> <span>Allocate</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'transfer' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('transfer')}
        >
          <i className="bi bi-truck"></i> <span>Transfer</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'financial' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('financial')}
        >
          <i className="bi bi-currency-dollar"></i> <span>Financial</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'disposal' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('disposal')}
        >
          <i className="bi bi-trash"></i> <span>Disposal</span>
        </a>

        <div className="af-section-title">Maintenance</div>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'requests' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('requests')}
        >
          <i className="bi bi-clipboard-check"></i> <span>Requests</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'service-log' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('service-log')}
        >
          <i className="bi bi-wrench"></i> <span>Service Log</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'schedule' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('schedule')}
        >
          <i className="bi bi-calendar-event"></i> <span>Schedule</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'history' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('history')}
        >
          <i className="bi bi-clock-history"></i> <span>History</span>
        </a>

        <div className="af-section-title">Reports</div>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'reports' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('reports')}
        >
          <i className="bi bi-graph-up"></i> <span>Reports</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'financials' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('financials')}
        >
          <i className="bi bi-cash-coin"></i> <span>Financials</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'compliance' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('compliance')}
        >
          <i className="bi bi-shield-check"></i> <span>Compliance</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'disposalreport' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('disposalreport')}
        >
          <i className="bi bi-file-earmark-text"></i> <span>Disposal Report</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'settings' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('settings')}
        >
          <i className="bi bi-gear"></i> <span>Settings</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'user' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('user')}
        >
          <i className="bi bi-person-fill"></i> <span>User</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2 ${activeScreen === 'roles' ? 'active' : ''}`}
          href="#"
          onClick={() => handleNavClick('roles')}
        >
          <i className="bi bi-person-fill"></i> <span>Roles</span>
        </a>
        <a
          className={`nav-link d-flex align-items-center gap-2`}
          href="/login"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right"></i> <span>Logout</span>
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;