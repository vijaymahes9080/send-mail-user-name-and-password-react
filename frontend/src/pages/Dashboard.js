import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Toast from '../components/Toast';

/**
 * Dashboard Component.
 * Protected entry point rendered upon successful JWT authentication.
 * Instantly loads cached session profile data before asynchronously fetching
 * fresh updates from the secure `/api/auth/me` endpoint.
 * Features a modern glassmorphic details dashboard grid and a secure logout action.
 */
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Read session-cached user details from local storage as initial state
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }

    /**
     * Async fetching hook to synchronize fresh profile values from DB.
     */
    const fetchUserProfile = async () => {
      try {
        const response = await authService.getProfile();
        setUser(response.user);
        
        // Cache refreshed profile record to prevent redundant network lookups
        localStorage.setItem('user', JSON.stringify(response.user));
        setLoading(false);
      } catch (error) {
        console.error('[Dashboard Exception] Could not synchronize profile details:', error);
        
        // Output failure toast while letting cached session display remain active
        setToast({
          type: 'error',
          message: 'Failed to update live user metrics. Displaying offline session data.',
        });
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  /**
   * Resets session parameters and redirects user back to Login.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    navigate('/login');
  };

  /**
   * Visual formatter for Date outputs.
   */
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Not configured';
    }
    const parsedDate = new Date(dateString);
    return parsedDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Render a sleek, custom loader spinner if no profile cache exists yet
  if (loading && !user) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="loading-text">SYNCHRONIZING ACCOUNT DATA...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Toast Portal */}
      {toast && (
        <div className="toast-container">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div className="dashboard-card">
        {/* Navigation Bar Header */}
        <header className="dashboard-navbar">
          <div className="dashboard-logo">
            <span className="dashboard-logo-icon" aria-hidden="true">🛡️</span>
            <span>SecureAuth Portal</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-btn"
            aria-label="Log out of application session"
          >
            <span aria-hidden="true">🚪</span> Logout
          </button>
        </header>

        {/* Dashboard Profile Welcome Banner */}
        <div className="welcome-banner">
          <div className="welcome-emoji" aria-hidden="true">👤</div>
          <div className="welcome-text">
            <h1>Welcome back, {user?.fullName || 'User'}!</h1>
            <p>Your production credentials and session parameters are protected by end-to-end JWT encryption.</p>
          </div>
        </div>

        {/* Detailed profile grid system */}
        <div className="profile-grid">
          {/* Card Module 1: User Account Details */}
          <div className="profile-card">
            <h3 className="profile-card-title">Profile Parameters</h3>
            <div className="profile-meta-list">
              <div className="meta-item">
                <span className="meta-label">Full Account Name</span>
                <span className="meta-value">{user?.fullName || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">User Identifier</span>
                <span className="meta-value highlight">@{user?.username || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Registered Email</span>
                <span className="meta-value">{user?.email || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Mobile Contact</span>
                <span className="meta-value">{user?.mobile || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Card Module 2: System Metadata & Demographics */}
          <div className="profile-card">
            <h3 className="profile-card-title">Security & System Data</h3>
            <div className="profile-meta-list">
              <div className="meta-item">
                <span className="meta-label">Gender Demographic</span>
                <span className="meta-value">{user?.gender || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Birth Date</span>
                <span className="meta-value">{formatDate(user?.dob)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Account Created At</span>
                <span className="meta-value">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Authorization Guard</span>
                <span 
                  className="meta-value" 
                  style={{ 
                    color: 'var(--success)', 
                    fontWeight: '600', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px' 
                  }}
                >
                  Session Verified JWT Active ✅
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
