import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import Toast from '../components/Toast';

/**
 * Login Page Component.
 * Collects authorization credentials (Username/Email and Password).
 * Performs inline client-side validations, communicates with active endpoints,
 * stores session JWTs, and redirects user to protected panels.
 */
const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Listen for query indicators notifying session expiry or logout
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired')) {
      setToast({
        type: 'error',
        message: 'Your session has expired. Please log in again to continue.',
      });
    }
  }, [location]);

  // Handles state changes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error as user begins correcting inputs
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Client-side inputs validation checks.
   */
  const validateInputs = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or Email is required.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Asynchronous form submit sequence.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(formData);
      
      setToast({
        type: 'success',
        message: response.message || 'Login successful! Entering dashboard...',
      });

      // Secure JWT token and profile details inside localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Visual delay to let success Toast animate and enhance user experience
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Login failed. Please verify credentials.';
      setToast({
        type: 'error',
        message: serverMessage,
      });
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Toast Alert Portal */}
      {toast && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your secure user dashboard</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Username or Email Input */}
          <div className="form-group">
            <label htmlFor="usernameOrEmail" className="form-label">Username or Email</label>
            <input
              id="usernameOrEmail"
              type="text"
              name="usernameOrEmail"
              className="form-input"
              placeholder="Registered username or email"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              required
            />
            {errors.usernameOrEmail && <span className="inline-error">{errors.usernameOrEmail}</span>}
          </div>

          {/* Password Input */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Your account password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className="inline-error">{errors.password}</span>}
          </div>

          {/* Submit Action button */}
          <button
            type="submit"
            className="auth-submit-btn full-width"
            disabled={loading}
            style={{ marginTop: '32px' }}
          >
            {loading ? 'Verifying account...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          New to our platform?
          <Link to="/register" className="auth-footer-link">Sign up now</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
