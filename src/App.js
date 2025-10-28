import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { isAuthenticated as checkAuth, logout } from './utils/authUtils';
import tokenExpirationChecker from './utils/tokenExpirationChecker';
import TokenExpirationWarning from './components/TokenExpirationWarning';
import logoutManager from './utils/logoutManager';
import './utils/logoutTest'; // Load logout test utilities
import Reports from './pages/Reports/Reports';
import AssetFinancialReport from './pages/Reports/AssetFinancialReport';
import AssetMasterSummaryReport from './pages/Reports/AssetMasterSummaryReport';
import AssetLifecycleReport from './pages/Reports/AssetLifecycleReport';
import AssetMovementTransferReport from './pages/Reports/AssetMovementTransferReport';
import MaintenanceRepairReport from './pages/Reports/MaintenanceRepairReport';
import AssetUtilizationReport from './pages/Reports/AssetUtilizationReport';
import ComplianceAuditReport from './pages/Reports/ComplianceAuditReport';
import FaultTrendMTTRReport from './pages/Reports/FaultTrendMTTRReport';
import WarrantyAMCTracker from './pages/Reports/WarrantyAMCTracker';
import AssetProcurementDeploymentReport from './pages/Reports/AssetProcurementDeploymentReport';
import InventoryAgingReport from './pages/Reports/InventoryAgingReport';
import Compliance from './pages/Reports/Compliance/Compliance';
import DisposalReport from './pages/Reports/Disposalreport';
import Settings from './pages/Reports/Settings/Settings';
import Dashboard from './pages/Dashboard/Dashboard';
import Register from './pages/Assets/Register';
import AddNew from './pages/Assets/AddNew';
import Procure from './pages/Assets/Procure';
import Allocate from './pages/Assets/Allocate';
import Transfer from './pages/Assets/Transfer';
import Financial from './pages/Assets/Financial';
import Disposal from './pages/Assets/Disposal';
import AssetHistory from './pages/Assets/AssetHistory';
import AssetHistoryDetail from './pages/Assets/AssetHistoryDetail';
import DisposalReports from './pages/Reports/DisposalReports';
import Financials from './pages/Reports/Financials';
import Schedule from './pages/Maintainance/Schedule';
import ServiceLog from './pages/Maintainance/ServiceLog';
import Requests from './pages/Maintainance/Requests';
import History from './pages/Maintainance/History';
import User from './pages/UserManagement/User';
import Module from './pages/UserManagement/Module';
import Login from './pages/Login';
import NewAudit from './pages/Reports/Compliance/NewAudit';
import AuditPlan from './pages/Reports/Compliance/AuditPlan';
import AssignTeam from './pages/Reports/Compliance/AssignTeam';
import AuditExecute from './pages/Reports/Compliance/AuditExecute';
import AuditReview from './pages/Reports/Compliance/AuditReview';
import ManageCategory from './pages/Reports/Settings/ManageCategory';
import ManageStatus from './pages/Reports/Settings/ManageStatus';
import ManageLocation from './pages/Reports/Settings/ManageLocation';
import AllDepartments from './pages/Reports/Settings/AllDepartments';
import ManageVendor from './pages/Vendor/ManageVendor';
import PaymentMethods from './pages/Reports/Settings/PaymentMethods';
import ServiceTypes from './pages/Reports/Settings/ServiceTypes';
import ApprovalHierarchies from './pages/Reports/Settings/ApprovalHierarchies';
import Roles from './pages/UserManagement/Roles';
import Sidebar from './components/Sidebar';
import Navbar from './pages/Navbar';
import Header from './components/Header';
import Footer from './components/Footer';
import ManageEmployee from './pages/Reports/Settings/ManageEmployee';
import ManageCompany from './pages/Reports/Settings/ManageCompany';
import ManageProducts from './pages/Reports/Settings/ManageProducts';
import AssetSpecification from './pages/Reports/Settings/AssetSpecification';
import ManageDepreciationMethod from './pages/Reports/Settings/ManageDepreciationMethod';

// Layout component that wraps all authenticated routes
function Layout({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Ensure authentication is maintained
  useEffect(() => {
    const authStatus = checkAuth();
    if (!authStatus) {
      console.log('Authentication lost, redirecting to login');
      navigate('/login');
    } else {
      // Start token expiration checker if user is authenticated
      tokenExpirationChecker.start();
    }

    // Cleanup token expiration checker on unmount
    return () => {
      tokenExpirationChecker.stop();
    };
  }, [location, navigate]);

  // Handle window resize to show/hide sidebar appropriately
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logoutManager.safeLogout(() => {
      // Stop token expiration checker
      tokenExpirationChecker.stop();
      
      logout(navigate);
      setIsAuthenticated(false);
    });
  };

  const handleNavClick = (screen) => {
    console.log(`Navigating to: ${screen}`);
    navigate(`/${screen}`);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
    
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 100); 
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get current screen from URL path
  const getCurrentScreen = () => {
    const path = location.pathname.substring(1); // Remove leading slash
    return path || 'dashboard';
  };

  return (
    <div className="app-layout">
      <TokenExpirationWarning />
      <Header handleLogout={handleLogout} onToggleSidebar={toggleSidebar} sidebarCollapsed={!sidebarOpen} />
      <Sidebar 
        activeScreen={getCurrentScreen()} 
        handleNavClick={handleNavClick} 
        handleLogout={handleLogout} 
        isOpen={sidebarOpen}
        collapsed={!sidebarOpen}
      />
      {/* Mobile backdrop */}
      {window.innerWidth <= 768 && sidebarOpen && (
        <div 
          className="sidebar-backdrop show" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main className={`main-content ${!sidebarOpen ? 'sidebar-collapsed' : ''}`}>
        <div className="container-fluid content">
          <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/asset-financial" element={<AssetFinancialReport />} />
              <Route path="/asset-master-summary" element={<AssetMasterSummaryReport />} />
              <Route path="/assetlifecycle" element={<AssetLifecycleReport />} />
              <Route path="/asset-movement-transfer" element={<AssetMovementTransferReport />} />
              <Route path="/maintenance-repair" element={<MaintenanceRepairReport />} />
              <Route path="/asset-utilization" element={<AssetUtilizationReport />} />
              <Route path="/compliance-audit" element={<ComplianceAuditReport />} />
              <Route path="/fault-trend-mttr" element={<FaultTrendMTTRReport />} />
              <Route path="/warranty-amc-tracker" element={<WarrantyAMCTracker />} />
              <Route path="/asset-procurement-deployment" element={<AssetProcurementDeploymentReport />} />
              <Route path="/disposal-report" element={<DisposalReport />} />
              <Route path="/inventory-aging" element={<InventoryAgingReport />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/disposal-reports" element={<DisposalReports />} />
              <Route path="/compliance" element={<Compliance setActiveScreen={handleNavClick} />} />
              <Route path="/settings" element={<Settings onNavigate={handleNavClick} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/addnew" element={<AddNew />} />
              <Route path="/procure" element={<Procure />} />
              <Route path="/allocate" element={<Allocate />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/financial" element={<Financial />} />
              <Route path="/disposal" element={<Disposal />} />
              <Route path="/asset-history" element={<AssetHistory />} />
              <Route path="/asset-history-detail/:assetId" element={<AssetHistoryDetail />} />
              <Route path="/history" element={<History />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/service-log" element={<ServiceLog />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/user" element={<User />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/module" element={<Module />} />
              <Route path="/new-audit" element={<NewAudit setActiveScreen={handleNavClick} />} />
              <Route path="/audit-plan" element={<AuditPlan setActiveScreen={handleNavClick} />} />
              <Route path="/audit-execute" element={<AuditExecute setActiveScreen={handleNavClick} />} />
              <Route path="/audit-review" element={<AuditReview setActiveScreen={handleNavClick} />} />
              <Route path="/assign-team" element={<AssignTeam setActiveScreen={handleNavClick} />} />
              <Route path="/ManageCategory" element={<ManageCategory onNavigate={handleNavClick} />} />
              <Route path="/all-departments" element={<AllDepartments onNavigate={handleNavClick} />} />
              <Route path="/ManageStatus" element={<ManageStatus onNavigate={handleNavClick} />} />
              <Route path="/ManageLocation" element={<ManageLocation onNavigate={handleNavClick} />} />
              <Route path="/ManageVendor" element={<ManageVendor onNavigate={handleNavClick} />} />
              <Route path="/PaymentMethods" element={<PaymentMethods onNavigate={handleNavClick} />} />
              <Route path="/ServiceTypes" element={<ServiceTypes onNavigate={handleNavClick} />} />
              <Route path="/ApprovalHierarchies" element={<ApprovalHierarchies onNavigate={handleNavClick} />} />
              <Route path="/manage-employee" element={<ManageEmployee onNavigate={handleNavClick} />} />
              <Route path="/manage-company" element={<ManageCompany onNavigate={handleNavClick} />} />
              <Route path="/manage-products" element={<ManageProducts onNavigate={handleNavClick} />} />
              <Route path="/asset-specifications" element={<AssetSpecification onNavigate={handleNavClick} />} />
              <Route path="/manage-depreciation-methods" element={<ManageDepreciationMethod onNavigate={handleNavClick} />} />
              <Route path="/navbar" element={<Navbar onNavigate={handleNavClick} />} />
            </Routes>
          </div>
        </main>
      <Footer />
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status using auth utils
    const checkAuthStatus = () => {
      const authStatus = checkAuth();
      console.log('Checking auth status:', authStatus);
      setIsAuthenticated(authStatus);
      setIsLoading(false);
    };

    // Small delay to ensure sessionStorage is available
    const timer = setTimeout(checkAuthStatus, 100);

    // Listen for storage changes (in case of multiple tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated' || e.key === 'token') {
        console.log('Storage change detected:', e.newValue);
        const authStatus = checkAuth();
        setIsAuthenticated(authStatus);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to handle authentication state changes
  const handleAuthChange = (authStatus) => {
    setIsAuthenticated(authStatus);
    if (!authStatus) {
      // Don't call logout here as it will cause double navigation
      // The logout is already handled in the main logout flow
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={handleAuthChange} />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout setIsAuthenticated={handleAuthChange} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;