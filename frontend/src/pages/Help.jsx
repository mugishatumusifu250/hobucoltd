import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { capitalize, initDashboardScripts, initProfileDropdown } from '../helpers';
import '../styles/dashboard/help.css';

const Help = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const cleanupDashboard = initDashboardScripts();
    const cleanupProfile = initProfileDropdown();
    return () => {
      if (typeof cleanupDashboard === 'function') cleanupDashboard();
      if (typeof cleanupProfile === 'function') cleanupProfile();
    };
  }, []);

  const goBack = () => {
    const userRole = user?.role?.toLowerCase();
    switch (userRole) {
      case 'admin':
        navigate('/dashboard');
        break;
      case 'manager':
        navigate('/dashboard');
        break;
      case 'client':
        navigate('/client');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const username = user?.username || '';
  const role = user?.role || '';

  return (
    <>
      {/* Sidebar Navigation */}
      <nav className="sidebar" id="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src="/favicon/favicon-96x96.png" alt="" />
            <span>HOBUCO</span>
          </div>
          <button className="sidebar-toggle" id="sidebarToggle">
            <i className="fas fa-bars"></i>
          </button>
        </div>

        <ul className="sidebar-menu">
          <li className="menu-item">
            <Link to="/dashboard" className="menu-link">
              <i className="fa-solid fa-chart-simple"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/requests" className="menu-link">
              <i className="fas fa-paper-plane"></i>
              <span>Requests</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/admin/users" className="menu-link">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link to="/consultations" className="menu-link">
              <i className="fas fa-handshake"></i>
              <span>Consultations</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="mobile-menu-toggle" id="mobileMenuToggle">
              <i className="fas fa-bars"></i>
            </button>
            <h1 className="page-title">Help</h1>
          </div>

          <div className="top-bar-right">
            {/* User Profile */}
            <div className="profile-container">
              <button className="profile-btn" id="profileBtn">
                <div className="profile-circle profile-avatar">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="profile-name">
                  {capitalize(username)}
                </span>
                <i className="fas fa-chevron-down profile-arrow"></i>
              </button>
              <div className="profile-dropdown" id="profileDropdown">
                <div className="profile-info">
                  <div className="profile-circle profile-avatar profile-avatar-large">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-details">
                    <h4>{capitalize(username)}</h4>
                    <p>{capitalize(role)}</p>
                  </div>
                </div>
                <div className="profile-menu">
                  <Link to="/help" className="profile-menu-item">
                    <i className="fas fa-question-circle"></i>
                    <span>Help</span>
                  </Link>
                  <hr className="profile-divider" />
                  <button className="profile-menu-item logout" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Help Content */}
        <div className="dashboard-content">
          <div className="container">
            <h1>
              <i className="fa-solid fa-book"></i> Help Guide - HOBUCO Services System
            </h1>

            <section>
              <h2>
                <i className="fa-solid fa-lock-keyhole"></i> 1. Sign Up and Login
              </h2>
              <ul>
                <li>
                  Visit <strong>/signup</strong> to register your account.
                </li>
                <li>
                  Use your credentials to login via <strong>/login</strong>.
                </li>
                <li>
                  Roles: <code>Admin</code>, <code>Client</code>, <code>Manager</code>{' '}
                  (assigned on registration).
                </li>
              </ul>
            </section>

            <section>
              <h2>
                <i className="fa-solid fa-calendars"></i> 2. Booking a Consultation
              </h2>
              <ul>
                <li>Go to your Dashboard after login.</li>
                <li>
                  Click <strong>"Consultations"</strong> or navigate to{' '}
                  <strong>/consultations/Add New</strong>.
                </li>
                <li>Fill in your topic, preferred date/time, and submit.</li>
              </ul>
            </section>

            <section>
              <h2>
                <i className="fa-solid fa-eye"></i> 3. Viewing Consultations
              </h2>
              <ul>
                <li>Dashboard shows a table of your consultations.</li>
                <li>
                  Admins/Managers see all consultations with filtering options.
                </li>
                <li>Click "View" to see consultation details.</li>
              </ul>
            </section>

            <section>
              <h2>
                <i className="fa-solid fa-pencil"></i> 4. Editing or Rescheduling
              </h2>
              <ul>
                <li>Click on "Edit" to update consultation info.</li>
                <li>
                  Date/time, topic and description can be changed before approval.
                </li>
              </ul>
            </section>

            <section>
              <h2>
                <i className="fa-solid fa-trash-can"></i> 5. Cancel/Delete Consultations
              </h2>
              <ul>
                <li>
                  Click on "Delete" next to the consultation to cancel it.
                </li>
                <li>
                  This action is irreversible once approved or completed.
                </li>
              </ul>
            </section>

            <section>
              <h2>
                <i className="fa-solid fa-chart-simple"></i> 6. Admin Dashboard
              </h2>
              <ul>
                <li>
                  Admins can access metrics of all users (Clients, Managers).
                </li>
                <li>Manage user roles and oversee system activities.</li>
              </ul>
            </section>

            <section>
              <h2>
                <i className="fa-solid fa-lightbulb"></i> 7. Tips
              </h2>
              <ul>
                <li>
                  Use <code>Ctrl + F</code> to search keywords on this page.
                </li>
                <li>All actions are logged for accountability.</li>
                <li>
                  Contact support if your consultation gets stuck in "Pending".
                </li>
              </ul>
            </section>

            <section>
              <h2>
                <i className="fa-solid fa-envelope"></i> 8. Contact & Support
              </h2>
              <ul>
                <li>
                  Email:{' '}
                  <a href="mailto:hobucoltd2050@gmail.com">hobucoltd2050@gmail.com</a>
                </li>
                <li>
                  Live chat available in the bottom right corner (during business
                  hours).
                </li>
              </ul>

              <button className="back btn-primary" onClick={goBack}>
                Back
              </button>
            </section>

            <p style={{ textAlign: 'center', marginTop: '3rem' }}>
              &copy; {new Date().getFullYear()} HOBUCO Consultation Services System
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Overlay */}
      <div className="mobile-overlay" id="mobileOverlay"></div>
    </>
  );
};

export default Help;
