import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Login = ({ setIsAuthenticated }) => {
  const [passwordType, setPasswordType] = useState('password');
  const [isModalActive, setIsModalActive] = useState(false);
  const [toast, setToast] = useState({ show: false, title: '', message: '', type: 'success' });
  const navigate = useNavigate();

  // Toggle password visibility
  const togglePassword = () => {
    setPasswordType(passwordType === 'password' ? 'text' : 'password');
  };

  // Show/hide modal
  const showModal = (e) => {
    e.preventDefault();
    setIsModalActive(true);
  };

  const closeModal = () => {
    setIsModalActive(false);
  };

  // Show toast notification
  const showToast = (title, message, type = 'success') => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast({ ...toast, show: false });
    }, 5000);
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const password = e.target.password.value;

    // Basic validation
    if (!username || !password) {
      showToast('Validation Error', 'Please enter both username and password', 'error');
      return;
    }

    showToast('Logging in...', 'Please wait while we sign you in');

    try {
      console.log('Attempting login with:', { username, password: '***' });
      
      // Use direct fetch for login (no token required)
      const response = await fetch('http://202.53.92.35:5004/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      console.log('Login response status:', response.status);
      console.log('Login response data:', data);

      if (response.ok) {
        showToast('Login Successful', `Welcome back, ${username}`);
        
        // Debug login response
        console.log('=== LOGIN RESPONSE DEBUG ===');
        console.log('Full response data:', data);
        console.log('User data:', data.user);
        console.log('Token from response:', data.user?.token);
        console.log('Token from data.token:', data.token);
        
        // Store authentication data - try different token paths
        localStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('user', JSON.stringify(data.user || data));
        
        // Try different token paths
        const token = data.user?.token || data.token || data.access_token || data.accessToken;
        console.log('Final token to store:', token);
        sessionStorage.setItem('token', token);
        
        setIsAuthenticated(true);
        navigate('/');
      } else {
        const errorMessage = data.message || 'Invalid username or password';
        showToast('Login Failed', errorMessage, 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Connection Error', 'Unable to connect to server. Please check your connection.', 'error');
    }
  };

  // Handle reset form submission
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    const username = e.target.resetUsername.value.trim();
    const newPassword = e.target.newPassword.value;
    
    // Basic validation
    if (!username || !newPassword) {
      showToast('Validation Error', 'Please enter both username and new password', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('Validation Error', 'Password must be at least 6 characters long', 'error');
      return;
    }
    
    showToast('Resetting Password...', 'Please wait while we reset your password');

    try {
      const response = await fetch('http://202.53.92.35:5004/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, newPassword }),
      });

      const data = await response.json();
      console.log('Password reset response:', data);

      if (response.ok) {
        showToast('Password Reset Successful', `Password has been reset for user: ${username}`);
        setIsModalActive(false);
        e.target.reset();
      } else {
        const errorMessage = data.message || 'Failed to reset password. Please try again.';
        showToast('Password Reset Failed', errorMessage, 'error');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      showToast('Connection Error', 'Unable to connect to server. Please check your connection.', 'error');
    }
  };

  // Close modal on outside click
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal')) {
      setIsModalActive(false);
    }
  };

  return (
    <div className="login-split-page d-flex flex-column flex-md-row position-relative" style={{ minHeight: '100vh' }}>

  {/* Left Side - Illustration & Info */}
  <div className="login-left d-flex flex-column position-relative justify-content-center align-items-center text-white col-12 col-md-6 p-0">
    <div className="login_clip_path w-100 h-100" style={{ background: 'rgb(26 29 44)' }}>
      <div className="position-relative mx-auto px-4 py-5 text-center text-md-start" style={{ maxWidth: 500 }}>
        <h3 className="mb-2 fw-bold">Asset Management System</h3>
        <p className="mb-4 text-light-50" style={{ color: '#d1d5db' }}>
          An Asset Management System (AMS) is a software framework that enables organizations to track,
          monitor, maintain, and optimize physical and intangible assets throughout their lifecycle, reducing waste
          and boosting efficiency.
        </p>
      </div>
    </div>

    {/* Illustration */}
    <div className="illustration mb-4 position-absolute d-none d-md-block" style={{ bottom: 10, left: '5rem' }}>
      <img src="/login_illustration-1.png" alt="Illustration" className="img-fluid" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  </div>

  {/* Right Side - Login Form */}
  <div className="login-right d-flex flex-column justify-content-center align-items-center bg-white col-12 col-md-6 py-5 px-4">
    <div className="login-form-container w-100" style={{ minWidth: 'auto', maxWidth: 400 }}>
      <img src="/greenlantern-logo.png" alt="Logo" className="mb-4 mx-auto d-block" style={{ height: 70 }} />
      <h3 className="mb-4 mt-3 text-center fw-bold">Sign In</h3>

      <form id="loginForm" onSubmit={handleLoginSubmit}>
        <div className="form-group mb-3">
          <input type="text" id="username" className="form-control px-4" placeholder="Username" required />
        </div>

        <div className="form-group mb-3 position-relative">
          <input
            type={passwordType}
            id="password"
            className="form-control px-4"
            placeholder="Password"
            required
          />
          <button
            type="button"
            className="bg-transparent btn btn-link end-0 me-2 mt-3 p-0 position-absolute shadow-none text-body top-0"
            style={{ color: '#888', background: '#fff' }}
            onClick={togglePassword}
            tabIndex={-1}
          >
            <i className={`bi bi-${passwordType === 'password' ? 'eye' : 'eye-slash'}`}></i>
          </button>
        </div>

        <button type="submit" className="btn btn-dark w-100 mb-3 signInBtn" style={{ borderRadius: 20, fontWeight: 600 }}>
          <i className="bi bi-box-arrow-right me-2"></i>Sign In
        </button>

        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div className="mb-2 mb-sm-0">
            <input type="checkbox" id="remember" className="form-check-input me-1" />
            <label htmlFor="remember" className="form-check-label">Remember me</label>
          </div>
          <a href="#" className="text-decoration-none fw-semibold" style={{ color: '#4562f5ff' }} onClick={showModal}>
            <i className="bi bi-key me-2"></i>Forgot Password?
          </a>
        </div>

        <div className="text-center mb-2 text-muted">
          Or <span className="text-dark fw-semibold">One-click sign in with</span>
        </div>

        <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap social_icons">
          <button type="button" className="btn btn-sm border d-flex justify-content-center align-items-center rounded-circle social_icons_btn">
            <i className="bi bi-google text-danger"></i>
          </button>
          <button type="button" className="btn btn-sm border d-flex justify-content-center align-items-center rounded-circle social_icons_btn">
            <i className="bi bi-facebook text-primary"></i>
          </button>
          <button type="button" className="btn btn-sm border d-flex justify-content-center align-items-center rounded-circle social_icons_btn">
            <i className="bi bi-twitter text-info"></i>
          </button>
        </div>
      </form>
    </div>

    {/* Forgot Password Modal */}
    <div className={`modal ${isModalActive ? 'active' : ''}`} onClick={handleOutsideClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={closeModal}>
          <i className="bi bi-x fs-4"></i>
        </button>
        <div className="logo text-center">
          <div className="logo-icon mb-2">
            <i className="bi bi-key fs-2 text-white"></i>
          </div>
          <h2>Forgot Password</h2>
          <p>Please enter your username. We’ll send you a link to reset your password.</p>
        </div>

        <form id="resetForm" onSubmit={handleResetSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="resetUsername">Username</label>
            <div className="input-group">
              <i className="bi bi-person input-icon"></i>
              <input type="text" id="resetUsername" placeholder="Enter your Username" required />
            </div>
          </div>

          <div className="form-group mb-3">
            <label htmlFor="newPassword">New Password</label>
            <div className="input-group">
              <i className="bi bi-lock input-icon"></i>
              <input type="password" id="newPassword" placeholder="Enter new password" required />
            </div>
          </div>
          <button type="submit" className="reset-btn w-100">Reset Password</button>
        </form>

        <div className="back-to-login text-center mt-3">
          <a href="#" onClick={closeModal}>Back to Login</a>
        </div>
      </div>
    </div>

    {/* Toast Notification */}
    <div className={`toast px-2 py-2 border-0 shadow-sm d-flex align-items-center ${toast.show ? 'show' : ''} ${toast.type}`} style={{   background: '#caf2d8',color: '#222' }}>
      <div className="toast-icon">
        <i className={`bi bi-${toast.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} style={{ fontSize: '15px' }}></i>
      </div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        <div className="toast-message text-dark">{toast.message}</div>
      </div>
    </div>
  </div>

  {/* Footer */}
  <p className="position-absolute w-100 text-center text-muted small" style={{ bottom: '0' }}>
    Powered by <a href='https://greenlanternit.com/' target='_blank' className='text-decoration-none'>Greenlantern IT Solutions Pvt Ltd</a> 
  </p>
</div>

  );
};

export default Login;