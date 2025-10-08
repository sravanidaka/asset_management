import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Reports from './components/Reports';
import Financials from './components/Financials';
import Compliance from './components/Compliance';
import DisposalReport from './components/DisposalReport';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import AddNew from './components/AddNew';
import Procure from './components/Procure';
import Allocate from './components/Allocate';
import Transfer from './components/Transfer';
import Financial from './components/Financial';
import Disposal from './components/Disposal';
import Schedule from './components/Schedule';
import ServiceLog from './components/ServiceLog';
import Requests from './components/Requests';
import History from './components/History';
import User from './components/User';
// import Login from './components/Login'; // Commented out - no authentication needed
import NewAudit from './components/NewAudit';
import AuditPlan from './components/AuditPlan';
import AssignTeam from './components/AssignTeam';
import AuditExecute from './components/AuditExecute';
import AuditReview from './components/AuditReview';
import ManageCategory from './components/ManageCategory';
import ManageStatus from './components/ManageStatus';
import ManageLocation from './components/ManageLocation';
import AllDepartments from './components/AllDepartments';
import ManageVendor from './components/ManageVendor';
import PaymentMethods from './components/PaymentMethods';
import ServiceTypes from './components/ServiceTypes';
import ApprovalHierarchies from './components/ApprovalHierarchies';
import Roles from './components/Roles';
import Sidebar from './Sidebar';
import Navbar from './components/Navbar';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Layout component that wraps all authenticated routes
function Layout({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Commented out logout functionality - no authentication needed
    // localStorage.removeItem('isAuthenticated');
    // setIsAuthenticated(false);
    // navigate('/login');
    console.log('Logout clicked - but authentication is disabled');
  };

  const handleNavClick = (screen) => {
    console.log(`Navigating to: ${screen}`);
    navigate(`/${screen}`);
    
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }, 100); 
  };

  // Get current screen from URL path
  const getCurrentScreen = () => {
    const path = location.pathname.substring(1); // Remove leading slash
    return path || 'dashboard';
  };

  return (
    <div className="app-layout">
      <Header handleLogout={handleLogout} />
      <Sidebar activeScreen={getCurrentScreen()} handleNavClick={handleNavClick} handleLogout={handleLogout} />
      <main className="main-content">
        <div className="container-fluid content">
          <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/financials" element={<Financials />} />
              <Route path="/compliance" element={<Compliance setActiveScreen={handleNavClick} />} />
              <Route path="/disposalreport" element={<DisposalReport />} />
              <Route path="/settings" element={<Settings onNavigate={handleNavClick} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/addnew" element={<AddNew />} />
              <Route path="/procure" element={<Procure />} />
              <Route path="/allocate" element={<Allocate />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/financial" element={<Financial />} />
              <Route path="/disposal" element={<Disposal />} />
              <Route path="/history" element={<History />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/service-log" element={<ServiceLog />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/user" element={<User />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/new-audit" element={<NewAudit setActiveScreen={handleNavClick} />} />
              <Route path="/audit-plan" element={<AuditPlan setActiveScreen={handleNavClick} />} />
              <Route path="/assign-team" element={<AssignTeam setActiveScreen={handleNavClick} />} />
              <Route path="/execute" element={<AuditExecute setActiveScreen={handleNavClick} />} />
              <Route path="/review" element={<AuditReview setActiveScreen={handleNavClick} />} />
              <Route path="/ManageCategory" element={<ManageCategory onNavigate={handleNavClick} />} />
              <Route path="/all-departments" element={<AllDepartments onNavigate={handleNavClick} />} />
              <Route path="/ManageStatus" element={<ManageStatus onNavigate={handleNavClick} />} />
              <Route path="/ManageLocation" element={<ManageLocation onNavigate={handleNavClick} />} />
              <Route path="/ManageVendor" element={<ManageVendor onNavigate={handleNavClick} />} />
              <Route path="/PaymentMethods" element={<PaymentMethods onNavigate={handleNavClick} />} />
              <Route path="/ServiceTypes" element={<ServiceTypes onNavigate={handleNavClick} />} />
              <Route path="/ApprovalHierarchies" element={<ApprovalHierarchies onNavigate={handleNavClick} />} />
              <Route path="/navbar" element={<Navbar onNavigate={handleNavClick} />} />
            </Routes>
          </div>
        </main>
      <Footer />
    </div>
  );
}

function App() {
  // Commented out authentication - always show dashboard
  // const [isAuthenticated, setIsAuthenticated] = useState(() => {
  //   return localStorage.getItem('isAuthenticated') === 'true';
  // });
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   setIsLoading(false);
  // }, []);

  // if (isLoading) {
  //   return (
  //     <div className="d-flex justify-content-center align-items-center min-vh-100">
  //       <div className="spinner-border text-primary" role="status">
  //         <span className="visually-hidden">Loading...</span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <Router>
      <Routes>
        {/* <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} /> */}
        <Route
          path="/*"
          element={<Layout setIsAuthenticated={() => {}} />}
        />
      </Routes>
    </Router>
  );
}

export default App;