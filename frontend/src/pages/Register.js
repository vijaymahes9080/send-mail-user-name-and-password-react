import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Toast from '../components/Toast';

/**
 * Registration Page Component.
 * Collects User details: Full Name, Username, Email, Mobile Number, Gender, DOB, and Password.
 * Handles client-side validation bounds and async form submission with Toast alerts.
 */
const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    dob: '',
    gender: 'Male',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Handles state changes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Proactively clear input field errors as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Client-side inputs validation checks.
   */
  const validateInputs = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Can only contain letters, numbers, and underscores.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format.';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.mobile) && !/^\d{10,12}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please provide a valid mobile number (10-15 digits).';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required.';
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future.';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Password confirmation is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
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
      setToast({
        type: 'error',
        message: 'Please resolve the validation errors highlighted in the form.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(formData);
      
      setToast({
        type: 'success',
        message: response.message || 'Registration successful! Auto-logging you in...',
      });

      // Secure JWT token and profile caching upon registration
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Visual grace timeout before forwarding user to the protected dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'An unexpected error occurred during registration.';
      setToast({
        type: 'error',
        message: serverMessage,
      });
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-width">
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us to setup and secure your user dashboard</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                className="form-input"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              {errors.fullName && <span className="inline-error">{errors.fullName}</span>}
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                className="form-input"
                placeholder="johndoe12"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {errors.username && <span className="inline-error">{errors.username}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span className="inline-error">{errors.email}</span>}
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label htmlFor="mobile" className="form-label">Mobile Number</label>
              <input
                id="mobile"
                type="tel"
                name="mobile"
                className="form-input"
                placeholder="9876543210"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
              {errors.mobile && <span className="inline-error">{errors.mobile}</span>}
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label htmlFor="dob" className="form-label">Date of Birth</label>
              <input
                id="dob"
                type="date"
                name="dob"
                className="form-input"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              {errors.dob && <span className="inline-error">{errors.dob}</span>}
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">Gender</label>
              <div className="gender-selector">
                <div className="gender-option">
                  <input
                    type="radio"
                    id="genderMale"
                    name="gender"
                    value="Male"
                    checked={formData.gender === 'Male'}
                    onChange={handleChange}
                  />
                  <label htmlFor="genderMale">Male</label>
                </div>
                <div className="gender-option">
                  <input
                    type="radio"
                    id="genderFemale"
                    name="gender"
                    value="Female"
                    checked={formData.gender === 'Female'}
                    onChange={handleChange}
                  />
                  <label htmlFor="genderFemale">Female</label>
                </div>
                <div className="gender-option">
                  <input
                    type="radio"
                    id="genderOther"
                    name="gender"
                    value="Other"
                    checked={formData.gender === 'Other'}
                    onChange={handleChange}
                  />
                  <label htmlFor="genderOther">Other</label>
                </div>
              </div>
              {errors.gender && <span className="inline-error">{errors.gender}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {errors.password && <span className="inline-error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="Retype password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {errors.confirmPassword && <span className="inline-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn full-width"
            disabled={loading}
          >
            {loading ? 'Creating secure profile...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered?
          <Link to="/login" className="auth-footer-link">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
