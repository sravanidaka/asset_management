import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Login from './components/Login';
import NewAudit from './components/NewAudit';
import AuditPlan from './components/AuditPlan';
import AssignTeam from './components/AssignTeam';
import AuditExecute from './components/AuditExecute';
import AuditReview from './components/AuditReview';
import ManageCategory from './components/ManageCategory';
import ManageStatus from './components/ManageStatus';
import ManageLocation from './components/ManageLocation';
import ManageVendor from './components/ManageVendor';
import PaymentMethods from './components/PaymentMethods';
import ServiceTypes from './components/ServiceTypes';
import ApprovalHierarchies from './components/ApprovalHierarchies';
import Roles from './components/Roles';
import Sidebar from './Sidebar';
import Navbar from './components/Navbar';
import Header from './components/common/Header';
import Footer from './components/common/Footer';

function MainApp({ setIsAuthenticated }) {
  const [activeScreen, setActiveScreen] = useState('dashboard');

  const handleNavClick = (screen) => {
    console.log(`Navigating to: ${screen}`);
    setActiveScreen(screen);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <div className="container-fluid d-flex flex-column min-vh-100">
      <Header handleLogout={handleLogout} />
      <div className="row g-0 flex-grow-1">
        <Sidebar activeScreen={activeScreen} handleNavClick={handleNavClick} handleLogout={handleLogout} />
        <main className="col-12 col-md-10 col-lg-10 p-3 p-lg-4">
          <div className="container-fluid content">
            {activeScreen === 'reports' && <Reports />}
            {activeScreen === 'financials' && <Financials />}
            {activeScreen === 'compliance' && <Compliance setActiveScreen={setActiveScreen} />}
            {activeScreen === 'disposalreport' && <DisposalReport />}
            {activeScreen === 'settings' && <Settings onNavigate={handleNavClick} />}
            {activeScreen === 'dashboard' && <Dashboard />}
            {activeScreen === 'register' && <Register />}
            {activeScreen === 'addnew' && <AddNew />}
            {activeScreen === 'procure' && <Procure />}
            {activeScreen === 'allocate' && <Allocate />}
            {activeScreen === 'transfer' && <Transfer />}
            {activeScreen === 'financial' && <Financial />}
            {activeScreen === 'disposal' && <Disposal />}
            {activeScreen === 'history' && <History />}
            {activeScreen === 'schedule' && <Schedule />}
            {activeScreen === 'service-log' && <ServiceLog />}
            {activeScreen === 'requests' && <Requests />}
            {activeScreen === 'user' && <User />}
            {activeScreen === 'roles' && <Roles />}
            {activeScreen === 'new-audit' && <NewAudit setActiveScreen={setActiveScreen} />}
            {activeScreen === 'audit-plan' && <AuditPlan setActiveScreen={setActiveScreen} />}
            {activeScreen === 'assign-team' && <AssignTeam setActiveScreen={setActiveScreen} />}
            {activeScreen === 'execute' && <AuditExecute setActiveScreen={setActiveScreen} />}
            {activeScreen === 'review' && <AuditReview setActiveScreen={setActiveScreen} />}
            {activeScreen === 'ManageCategory' && <ManageCategory onNavigate={handleNavClick} />}
            {activeScreen === 'ManageStatus' && <ManageStatus onNavigate={handleNavClick} />}
            {activeScreen === 'ManageLocation' && <ManageLocation onNavigate={handleNavClick} />}
            {activeScreen === 'ManageVendor' && <ManageVendor onNavigate={handleNavClick} />}
            {activeScreen === 'PaymentMethods' && <PaymentMethods onNavigate={handleNavClick} />}
            {activeScreen === 'ServiceTypes' && <ServiceTypes onNavigate={handleNavClick} />}
            {activeScreen === 'ApprovalHierarchies' && <ApprovalHierarchies onNavigate={handleNavClick} />}
            {activeScreen === 'navbar' && <Navbar onNavigate={Navbar} />}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <MainApp setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;