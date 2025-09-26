import React, { useState } from 'react';
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
    const username = e.target.username.value;
    const password = e.target.password.value;

    showToast('Logging in...', 'Please wait while we sign you in');

    try {
      const response = await fetch('http://202.53.92.37:5003/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        showToast('Login Successful', `Welcome back, ${username}`);
        setIsAuthenticated(true);
        navigate('/');
      } else {
        showToast('Login Failed', 'Invalid username or password', 'error');
      }
    } catch (error) {
      showToast('Error', 'Something went wrong. Please try again.', 'error');
    }
  };

  // Handle reset form submission
  const handleResetSubmit = (e) => {
    e.preventDefault();
    const username = e.target.resetUsername.value;
    showToast('Sending Email...', 'Please wait while we send the reset link');
    setTimeout(() => {
      showToast('Email Sent', `Password reset link sent to user: ${username}`);
      setIsModalActive(false);
      e.target.reset();
    }, 1500);
  };

  // Close modal on outside click
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal')) {
      setIsModalActive(false);
    }
  };

  return (
    <div className="login-page">
      <div className="content">
        {/* Animated Background Shapes */}
        <div className="bg-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="login-container">
          <div className="logo">
            <div className="logo-icon">
              <i className="bi bi-cpu" style={{ fontSize: '35px', color: 'white' }}></i>
            </div>
            <h1>Asset Management</h1>
          </div>

          <form id="loginForm" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-group">
                <i className="bi bi-person input-icon"></i>
                <input type="text" id="username" placeholder="Enter your username" required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <i className="bi bi-lock input-icon"></i>
                <input
                  type={passwordType}
                  id="password"
                  placeholder="Enter your password"
                  required
                />
                <button type="button" className="password-toggle" onClick={togglePassword}>
                  <i className={`bi bi-${passwordType === 'password' ? 'eye' : 'eye-slash'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="#" className="forgot-password" onClick={showModal}>
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="login-btn">Sign In</button>
          </form>
        </div>

        {/* Forgot Password Modal */}
        <div className={`modal ${isModalActive ? 'active' : ''}`} onClick={handleOutsideClick}>
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>
              <i className="bi bi-x" style={{ fontSize: '24px' }}></i>
            </button>
            <div className="logo">
              <div className="logo-icon">
                <i className="bi bi-key" style={{ fontSize: '35px', color: 'white' }}></i>
              </div>
              <h2>Reset Password</h2>
              <p>Enter your username and we'll send you a link to reset your password.</p>
            </div>

            <form id="resetForm" onSubmit={handleResetSubmit}>
              <div className="form-group">
                <label htmlFor="resetUsername">Email</label>
                <div className="input-group">
                  <i className="bi bi-person input-icon"></i>
                  <input type="text" id="resetUsername" placeholder="Enter your Email" required />
                </div>
              </div>

              <button type="submit" className="reset-btn">Send Reset Link</button>
            </form>

            <div className="back-to-login">
              <a href="#" onClick={closeModal}>
                Back to Login
              </a>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <div className={`toast ${toast.show ? 'show' : ''} ${toast.type}`}>
          <div className="toast-icon">
            <i className={`bi bi-${toast.type === 'success' ? 'check-circle' : 'exclamation-circle'}`} style={{ fontSize: '20px' }}></i>
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;